'use client'
import { useEffect, useState } from 'react'
import { NewsArticle } from '@/lib/types'

interface Props {
  articles: NewsArticle[]
  loading?: boolean
}

export function NewsCarousel({ articles, loading }: Props) {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (articles.length === 0) return
    const id = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIndex(prev => (prev + 1) % Math.min(articles.length, 20))
        setVisible(true)
      }, 700)
    }, 20000)
    return () => clearInterval(id)
  }, [articles.length])

  const article = articles[index]

  return (
    <div className="bg-white/19 backdrop-blur-md backdrop-saturate-150 border border-white/30 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-4 pt-4 pb-2 border-b border-border/40">
        <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">News Spotlight</p>
      </div>
      <div className="h-72 relative overflow-hidden">
        {loading || !article ? (
          <div className="p-4 space-y-3">
            <div className="h-32 bg-white/40 rounded-lg animate-pulse" />
            <div className="h-3 bg-white/40 rounded animate-pulse" />
            <div className="h-3 bg-white/40 rounded animate-pulse w-3/4" />
          </div>
        ) : (
          <div
            className="absolute inset-0 p-4 flex flex-col gap-3 transition-opacity duration-700"
            style={{ opacity: visible ? 1 : 0 }}
          >
            {article.icon && (
              <img
                src={article.icon}
                alt={article.title}
                className="object-cover w-full h-32 rounded-lg flex-shrink-0"
              />
            )}
            <p className="text-sm font-medium text-foreground line-clamp-2">{article.title}</p>
            <p className="text-sm text-muted-foreground line-clamp-4">{article.abstract}</p>
          </div>
        )}
      </div>
    </div>
  )
}
