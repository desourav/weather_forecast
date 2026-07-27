'use client'
import { useEffect, useState } from 'react'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

export function LiveClock() {
  const [dateTime, setDateTime] = useState('')

  useEffect(() => {
    function tick() {
      const now = new Date()
      const month = MONTHS[now.getMonth()]
      const day = now.getDate()
      const year = now.getFullYear()
      const hours = now.getHours()
      const minutes = now.getMinutes()
      const seconds = now.getSeconds()
      const ampm = hours < 12 ? 'AM' : 'PM'
      const h = hours % 12 || 12
      const pad = (n: number) => String(n).padStart(2, '0')
      setDateTime(`${month} ${day}, ${year} — ${pad(h)}:${pad(minutes)}:${pad(seconds)} ${ampm}`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <span className="text-[21px] font-bold tabular-nums text-foreground/80">{dateTime}</span>
  )
}
