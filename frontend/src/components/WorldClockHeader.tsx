import { useState, useEffect } from 'react'
import { cn } from '../lib/utils'
import { getMarketStatus } from '../lib/marketHours'

type CityClockConfig = {
  id: string
  code: string
  city: string
  country: string
  flag: string
  timeZone: string
  tzAbbr: string
  gmtOffset: string
  regionKey: string
  exchangeName: string
}

const CITIES: CityClockConfig[] = [
  {
    id: 'mumbai',
    code: 'BOM',
    city: 'Mumbai',
    country: 'India',
    flag: '🇮🇳',
    timeZone: 'Asia/Kolkata',
    tzAbbr: 'IST',
    gmtOffset: 'UTC +5:30',
    regionKey: 'INDIA',
    exchangeName: 'NSE / BSE',
  },
  {
    id: 'newyork',
    code: 'NYC',
    city: 'New York',
    country: 'United States',
    flag: '🇺🇸',
    timeZone: 'America/New_York',
    tzAbbr: 'ET',
    gmtOffset: 'UTC -5:00',
    regionKey: 'US',
    exchangeName: 'NYSE / NASDAQ',
  },
  {
    id: 'london',
    code: 'LON',
    city: 'London',
    country: 'United Kingdom',
    flag: '🇬🇧',
    timeZone: 'Europe/London',
    tzAbbr: 'GMT',
    gmtOffset: 'UTC +0:00',
    regionKey: 'GLOBAL',
    exchangeName: 'LSE (London)',
  },
  {
    id: 'tokyo',
    code: 'TYO',
    city: 'Tokyo',
    country: 'Japan',
    flag: '🇯🇵',
    timeZone: 'Asia/Tokyo',
    tzAbbr: 'JST',
    gmtOffset: 'UTC +9:00',
    regionKey: 'GLOBAL',
    exchangeName: 'TSE (Tokyo)',
  },
]

export function WorldClockHeader() {
  const [now, setNow] = useState(new Date())
  const [hoveredCity, setHoveredCity] = useState<CityClockConfig | null>(null)

  // Live ticking clock updating every second
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="relative flex items-center gap-2 sm:gap-3 select-none">
      {CITIES.map((city) => {
        // Compute hours, minutes, seconds for city timezone
        const timeString = now.toLocaleString('en-US', { timeZone: city.timeZone })
        const cityDate = new Date(timeString)
        const hours = cityDate.getHours()
        const minutes = cityDate.getMinutes()
        const seconds = cityDate.getSeconds()

        const hourAngle = (hours % 12 + minutes / 60) * 30
        const minuteAngle = (minutes + seconds / 60) * 6
        const secondAngle = seconds * 6

        const isHovered = hoveredCity?.id === city.id
        const marketStatus = getMarketStatus(city.regionKey)

        return (
          <div
            key={city.id}
            onMouseEnter={() => setHoveredCity(city)}
            onMouseLeave={() => setHoveredCity(null)}
            className="relative cursor-pointer group py-1"
          >
            {/* Minimalist Round Analog Clock Face */}
            <div className="flex items-center gap-1.5">
              <div
                className={cn(
                  'relative w-7 h-7 sm:w-8 sm:h-8 rounded-full border transition-all duration-150 flex items-center justify-center shadow-xs',
                  isHovered
                    ? 'border-[#1b4313] dark:border-[#b7eb4d] bg-stone-100 dark:bg-slate-800 scale-105'
                    : 'border-stone-300 dark:border-slate-700 bg-white dark:bg-[#0c121e]',
                )}
              >
                {/* 12, 3, 6, 9 Ticks */}
                <div className="absolute top-0.5 w-0.5 h-1 bg-stone-300 dark:bg-slate-600 rounded-full" />
                <div className="absolute bottom-0.5 w-0.5 h-1 bg-stone-300 dark:bg-slate-600 rounded-full" />
                <div className="absolute left-0.5 h-0.5 w-1 bg-stone-300 dark:bg-slate-600 rounded-full" />
                <div className="absolute right-0.5 h-0.5 w-1 bg-stone-300 dark:bg-slate-600 rounded-full" />

                {/* Center Pivot */}
                <div className="w-1.5 h-1.5 rounded-full bg-stone-900 dark:bg-white z-20" />

                {/* Live Hour Hand */}
                <div
                  className="absolute w-0.5 h-2 bg-stone-800 dark:bg-slate-200 rounded-full origin-bottom z-10"
                  style={{
                    bottom: '50%',
                    left: 'calc(50% - 1px)',
                    transform: `rotate(${hourAngle}deg)`,
                  }}
                />

                {/* Live Minute Hand */}
                <div
                  className="absolute w-0.5 h-2.5 bg-stone-600 dark:bg-slate-300 rounded-full origin-bottom z-10"
                  style={{
                    bottom: '50%',
                    left: 'calc(50% - 1px)',
                    transform: `rotate(${minuteAngle}deg)`,
                  }}
                />

                {/* Live Second Hand (Brand Accent) */}
                <div
                  className="absolute w-[1px] h-3 bg-emerald-600 dark:bg-[#b7eb4d] origin-bottom z-15"
                  style={{
                    bottom: '50%',
                    left: 'calc(50% - 0.5px)',
                    transform: `rotate(${secondAngle}deg)`,
                  }}
                />
              </div>

              {/* Sub-label Code */}
              <span className="text-[10px] font-mono font-semibold text-stone-500 dark:text-slate-400 group-hover:text-stone-900 dark:group-hover:text-white transition-colors hidden md:inline">
                {city.code}
              </span>
            </div>

            {/* Hover Tooltip Popover */}
            {isHovered && (
              <div
                className="absolute top-full right-0 mt-2 z-50 w-64 p-3 bg-white dark:bg-[#0b101b] border border-stone-200 dark:border-slate-800 rounded-xl shadow-xl animate-in fade-in zoom-in-95 duration-100 pointer-events-none text-stone-900 dark:text-slate-100"
                style={{ minWidth: '240px' }}
              >
                {/* Header: Flag, City, Country */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">{city.flag}</span>
                    <div>
                      <div className="font-bold text-xs leading-none">
                        {city.city}, {city.country}
                      </div>
                      <div className="text-[10px] text-stone-500 dark:text-slate-400 mt-0.5">
                        {city.exchangeName}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-stone-100 dark:bg-slate-800 text-stone-600 dark:text-slate-300 border border-stone-200 dark:border-slate-700">
                    {city.tzAbbr}
                  </span>
                </div>

                {/* Live Digital Time with Seconds */}
                <div className="my-1.5">
                  <div className="text-lg font-mono font-bold tracking-tight text-stone-900 dark:text-white">
                    {cityDate.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: true,
                    })}
                  </div>
                  <div className="text-[11px] text-stone-500 dark:text-slate-400 font-sans">
                    {cityDate.toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                </div>

                {/* Timezone Name & GMT Offset */}
                <div className="pt-2 border-t border-stone-100 dark:border-slate-800 text-[11px] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-stone-500 dark:text-slate-400">Timezone:</span>
                    <span className="font-medium text-stone-800 dark:text-slate-200">{city.tzAbbr} ({city.gmtOffset})</span>
                  </div>

                  {/* Market Session Status */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-stone-500 dark:text-slate-400">Market Status:</span>
                    <span
                      className={cn(
                        'font-semibold text-[10px] px-1.5 py-0.5 rounded-full border',
                        marketStatus.isLive
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                          : 'bg-stone-100 dark:bg-slate-800 text-stone-600 dark:text-slate-400 border-stone-200 dark:border-slate-700',
                      )}
                    >
                      {marketStatus.label}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default WorldClockHeader
