'use client'
import { useEffect, useState } from 'react'
import { NewsArticle } from '@/lib/types'
import { cn } from '@/lib/utils'

interface Props {
  articles: NewsArticle[]
  loading?: boolean
}

export function NewsPanel({ articles, loading }: Props) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  // Advance active article every 20 s with a fade transition on the image
  useEffect(() => {
    if (articles.length === 0) return
    const id = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setActiveIndex(prev => (prev + 1) % Math.min(articles.length, 20))
        setVisible(true)
      }, 700)
    }, 20000)
    return () => clearInterval(id)
  }, [articles.length])

  const active = articles[activeIndex]

  return (
    <div className="w-full flex-1 bg-white/19 backdrop-blur-md backdrop-saturate-150 border border-white/30 rounded-2xl shadow-sm overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-4 pt-3 pb-2 border-b border-border/40 flex-shrink-0">
        <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Top News</p>
      </div>

      {/* Body: titles left (60%), image right (40%) */}
      <div className="flex flex-1 overflow-hidden">

        {/* Titles list — 60% of panel width */}
        <div className="w-[60%] flex-shrink-0 overflow-y-auto">
          {loading || articles.length === 0
            ? [...Array(10)].map((_, i) => (
                <div key={i} className="px-3 py-2 border-b border-border/40">
                  <div className="h-4 bg-white/40 rounded animate-pulse" />
                </div>
              ))
            : articles.slice(0, 20).map((article, i) => (
                <div
                  key={i}
                  className={cn(
                    'px-3 py-2 text-base rounded-lg mx-1 my-0.5 cursor-default transition-colors',
                    i === activeIndex
                      ? 'bg-blue-500/15 text-blue-900 font-medium'
                      : 'text-foreground hover:bg-muted/50'
                  )}
                >
                  <p className="line-clamp-2">{article.title}</p>
                </div>
              ))
          }
        </div>

        {/* Article image + abstract — grows to fill all remaining panel width */}
        <div className="flex-1 min-w-0 relative overflow-hidden border-l border-border/40">
          {loading || !active ? (
            <div className="p-3 space-y-2 h-full">
              <div className="h-72 bg-white/40 rounded-lg animate-pulse" />
              <div className="h-3 bg-white/40 rounded animate-pulse" />
              <div className="h-3 bg-white/40 rounded animate-pulse w-3/4" />
            </div>
          ) : (
            <div
              className="absolute inset-0 pt-3 pr-3 pb-3 flex flex-col gap-2 transition-opacity duration-700"
              style={{ opacity: visible ? 1 : 0 }}
            >
              {active.icon ? (
                <img
                  src={active.icon}
                  alt={active.title}
                  className="rounded-lg flex-shrink-0 block self-start"
                  style={{ maxHeight: '288px' }}
                />
              ) : (
                <div className="w-full h-36 bg-white/30 rounded-lg flex-shrink-0" />
              )}
              <p className="text-[21px] font-medium text-foreground line-clamp-2 leading-snug">{active.title}</p>
              <p className="text-[21px] text-muted-foreground line-clamp-5 leading-snug">{active.abstract}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
