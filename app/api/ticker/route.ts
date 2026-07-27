import { NextResponse } from 'next/server'
import { DefaultApi } from 'finnhub-ts'

const finnhubClient = new DefaultApi({
  apiKey: process.env.FINNHUB_API_KEY ?? '',
  isJsonMime: (input) => {
    try { JSON.parse(input); return true } catch { return false }
  },
})

// Full S&P 500 constituent list (as of 2025)
const SP500 = [
  'MMM','AOS','ABT','ABBV','ACN','ADBE','AMD','AES','AFL','A','APD','ABNB','AKAM','ALB','ARE',
  'ALGN','ALLE','LNT','ALL','GOOGL','GOOG','MO','AMZN','AMCR','AEE','AEP','AXP','AIG','AMT',
  'AWK','AMP','AME','AMGN','APH','ADI','ANSS','AON','APA','AAPL','AMAT','APTV','ACGL','ADM',
  'ANET','AJG','AIZ','T','ATO','ADSK','ADP','AZO','AVB','AVY','AXON','BKR','BALL','BAC','BK',
  'BBWI','BAX','BDX','BRK.B','BBY','BIO','TECH','BIIB','BLK','BX','BA','BCR','BMY','AVGO',
  'BR','BRO','BF.B','BLDR','BG','CDNS','CZR','CPT','CPB','COF','CAH','KMX','CCL','CARR','CTLT',
  'CAT','CBOE','CBRE','CDW','CE','COR','CNC','CNX','CDAY','CF','CRL','SCHW','CHTR','CVX','CMG',
  'CB','CHD','CI','CINF','CTAS','CSCO','C','CFG','CLX','CME','CMS','KO','CTSH','CL','CMCSA',
  'CMA','CAG','COP','ED','STZ','CEG','COO','CPRT','GLW','CTVA','CSGP','COST','CTRA','CCI',
  'CSX','CMI','CVS','DHI','DHR','DRI','DVA','DAY','DECK','DE','DAL','DVN','DXCM','FANG','DLR',
  'DFS','DG','DLTR','D','DPZ','DOV','DOW','DTE','DUK','DD','EMN','ETN','EBAY','ECL','EIX',
  'EW','EA','ELV','LLY','EMR','ENPH','ETR','EOG','EPAM','EQT','EFX','EQIX','EQR','ESS','EL',
  'ETSY','EG','EVRST','ES','EXC','EXPE','EXPD','EXR','XOM','FFIV','FDS','FICO','FAST','FRT',
  'FDX','FIS','FITB','FSLR','FE','FI','FLT','FMC','F','FTNT','FTV','FOXA','FOX','BEN','FCX',
  'GRMN','IT','GE','GEHC','GEV','GEN','GNRC','GD','GIS','GM','GPC','GILD','GPN','GL','GDDY',
  'GS','HAL','HIG','HAS','HCA','DOC','HSIC','HSY','HES','HPE','HLT','HOLX','HD','HON','HRL',
  'HST','HWM','HPQ','HUBB','HUM','HBAN','HII','IBM','IEX','IDXX','ITW','INCY','IR','PODD',
  'INTC','ICE','IFF','IP','IPG','INTU','ISRG','IVZ','INVH','IQV','IRM','JBHT','JBL','JKHY',
  'J','JNJ','JCI','JPM','JNPR','K','KVUE','KDP','KEY','KEYS','KMB','KIM','KMI','KLAC','KHC',
  'KR','LHX','LH','LRCX','LW','LVS','LDOS','LEN','LIN','LYV','LKQ','LMT','L','LOW','LULU',
  'LYB','MTB','MRO','MPC','MKTX','MAR','MMC','MLM','MAS','MA','MTCH','MKC','MCD','MCK','MDT',
  'MRK','META','MET','MTD','MGM','MCHP','MU','MSFT','MAA','MRNA','MHK','MOH','TAP','MDLZ',
  'MPWR','MNST','MCO','MS','MOS','MSI','MSCI','NDAQ','NTAP','NFLX','NEM','NWSA','NWS','NEE',
  'NKE','NI','NDSN','NSC','NTRS','NOC','NCLH','NRG','NUE','NVDA','NVR','NXPI','ORLY','OXY',
  'ODFL','OMC','ON','OKE','ORCL','OTIS','PCAR','PKG','PANW','PH','PAYX','PAYC','PYPL','PNR',
  'PEP','PFE','PCG','PM','PSX','PNW','PXD','PNC','POOL','PPG','PPL','PFG','PG','PGR','PLD',
  'PRU','PEG','PTC','PSA','PHM','QRVO','PWR','QCOM','DGX','RL','RJF','RTX','O','REG','REGN',
  'RF','RSG','RMD','RVTY','ROK','ROL','ROP','ROST','RCL','SPGI','CRM','SBAC','SLB','STX',
  'SRE','NOW','SHW','SPG','SWKS','SJM','SNA','SOLV','SO','LUV','SWK','SBUX','STT','STLD',
  'STE','SYK','SMCI','SYF','SNPS','SYY','TMUS','TROW','TTWO','TPR','TRGP','TGT','TEL','TDY',
  'TFX','TER','TSLA','TXN','TXT','TMO','TJX','TSCO','TT','TDG','TRV','TRMB','TFC','TYL',
  'TSN','USB','UBER','UDR','ULTA','UNP','UAL','UPS','URI','UNH','UHS','VLO','VTR','VLTO',
  'VRSN','VRSK','VZ','VRTX','VTRS','VICI','V','VST','VMC','WRB','GWW','WAB','WBA','WMT',
  'DIS','WBD','WM','WAT','WEC','WFC','WELL','WST','WDC','WY','WHR','WMB','WTW','WYNN','XEL',
  'XYL','YUM','ZBRA','ZBH','ZTS',
]

interface TickerQuote { symbol: string; c: number; dp: number }

// Simple in-process cache: refresh every 15 minutes
let cache: { data: TickerQuote[]; ts: number } | null = null
const CACHE_TTL = 15 * 60 * 1000
const BATCH_SIZE = 25
const BATCH_DELAY_MS = 1100  // stays safely under 60 req/min

function sleep(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms))
}

async function fetchAll(): Promise<TickerQuote[]> {
  const results: TickerQuote[] = []
  for (let i = 0; i < SP500.length; i += BATCH_SIZE) {
    const batch = SP500.slice(i, i + BATCH_SIZE)
    const quotes = await Promise.all(
      batch.map(async symbol => {
        try {
          const res = await finnhubClient.quote(symbol)
          const q = res.data as { c: number; dp: number }
          return { symbol, c: q.c ?? 0, dp: q.dp ?? 0 }
        } catch {
          return null
        }
      })
    )
    for (const q of quotes) {
      if (q && q.c > 0) results.push(q)
    }
    if (i + BATCH_SIZE < SP500.length) await sleep(BATCH_DELAY_MS)
  }
  return results
}

export async function GET() {
  try {
    const now = Date.now()
    if (cache && now - cache.ts < CACHE_TTL) {
      return NextResponse.json({ quotes: cache.data })
    }
    const data = await fetchAll()
    cache = { data, ts: now }
    return NextResponse.json({ quotes: data })
  } catch (err) {
    console.error('Ticker API error:', err)
    return NextResponse.json({ error: 'Failed to fetch ticker data' }, { status: 500 })
  }
}
