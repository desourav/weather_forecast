'use client'
import { useEffect, useState } from 'react'
import { NewsArticle } from '@/lib/types'
import { cn } from '@/lib/utils'

interface Props {
  articles: NewsArticle[]
  loading?: boolean
}

export function NewsList({ articles, loading }: Props) {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (articles.length === 0) return
    const id = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % Math.min(articles.length, 20))
    }, 20000)
    return () => clearInterval(id)
  }, [articles.length])

  return (
    <div className="w-full bg-white/19 backdrop-blur-md backdrop-saturate-150 border border-white/30 rounded-2xl shadow-sm overflow-hidden flex flex-col">
      <div className="px-4 pt-4 pb-2 border-b border-border/40">
        <p className="text-xs text-muted-foreground uppercase tracking-wide font-bold">Top News</p>
      </div>
      <div className="overflow-y-auto max-h-[50vh]">
        {loading || articles.length === 0
          ? [...Array(10)].map((_, i) => (
              <div key={i} className="px-3 py-2 border-b border-border/40">
                <div className="h-3 bg-white/40 rounded animate-pulse" />
              </div>
            ))
          : articles.slice(0, 20).map((article, i) => (
              <div
                key={i}
                className={cn(
                  'px-3 py-2 text-sm rounded-lg mx-1 my-0.5 cursor-default transition-colors font-bold',
                  i === activeIndex
                    ? 'bg-blue-500/15 text-blue-900'
                    : 'text-foreground hover:bg-muted/50'
                )}
              >
                <p className="line-clamp-2">{article.title}</p>
              </div>
            ))
        }
      </div>
    </div>
  )
}
