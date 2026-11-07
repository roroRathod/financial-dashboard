export type MarketRegion = 'INDIA' | 'US' | 'GLOBAL'

export interface MarketStatus {
  isLive: boolean
  isPreMarket?: boolean
  label: string
  subText: string
  color: 'emerald' | 'amber' | 'stone'
  exchangeName: string
  localTime: string
}

export function getMarketStatus(region: MarketRegion | string): MarketStatus {
  const reg = region.toUpperCase()
  const now = new Date()

  if (reg === 'INDIA' || reg.includes('NIFTY') || reg.includes('SENSEX') || reg.includes('.NS') || reg.includes('.BO')) {
    // IST Time calculation
    const istString = now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
    const istDate = new Date(istString)
    const day = istDate.getDay() // 0 = Sun, 6 = Sat
    const hours = istDate.getHours()
    const minutes = istDate.getMinutes()
    const timeVal = hours * 60 + minutes
    const timeFormatted = istDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

    const isWeekend = day === 0 || day === 6
    const marketOpen = 9 * 60 + 15 // 09:15 IST
    const marketClose = 15 * 60 + 30 // 15:30 IST
    const preMarketOpen = 9 * 60 // 09:00 IST

    if (isWeekend) {
      return {
        isLive: false,
        label: 'Closed',
        subText: 'Weekend (Opens Monday 09:15 IST)',
        color: 'stone',
        exchangeName: 'NSE / BSE',
        localTime: `${timeFormatted} IST`,
      }
    }

    if (timeVal >= marketOpen && timeVal < marketClose) {
      return {
        isLive: true,
        label: 'Live Session',
        subText: 'Regular Trading until 15:30 IST',
        color: 'emerald',
        exchangeName: 'NSE / BSE',
        localTime: `${timeFormatted} IST`,
      }
    }

    if (timeVal >= preMarketOpen && timeVal < marketOpen) {
      return {
        isLive: false,
        isPreMarket: true,
        label: 'Pre-Market',
        subText: 'Opening bell at 09:15 IST',
        color: 'amber',
        exchangeName: 'NSE / BSE',
        localTime: `${timeFormatted} IST`,
      }
    }

    if (timeVal < preMarketOpen) {
      return {
        isLive: false,
        label: 'Closed',
        subText: 'Opens today at 09:15 IST',
        color: 'stone',
        exchangeName: 'NSE / BSE',
        localTime: `${timeFormatted} IST`,
      }
    }

    return {
      isLive: false,
      label: 'Closed',
      subText: 'Post-Market (Opens tomorrow 09:15 IST)',
      color: 'stone',
      exchangeName: 'NSE / BSE',
      localTime: `${timeFormatted} IST`,
    }
  }

  if (reg === 'US' || reg.includes('S&P') || reg.includes('NASDAQ') || reg.includes('DOW') || reg.includes('RUSSELL')) {
    const etString = now.toLocaleString('en-US', { timeZone: 'America/New_York' })
    const etDate = new Date(etString)
    const day = etDate.getDay()
    const hours = etDate.getHours()
    const minutes = etDate.getMinutes()
    const timeVal = hours * 60 + minutes
    const timeFormatted = etDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

    const isWeekend = day === 0 || day === 6
    const marketOpen = 9 * 60 + 30 // 09:30 ET
    const marketClose = 16 * 60 // 16:00 ET

    if (isWeekend) {
      return {
        isLive: false,
        label: 'Closed',
        subText: 'Weekend (Opens Monday 09:30 ET / 20:00 IST)',
        color: 'stone',
        exchangeName: 'NYSE / NASDAQ',
        localTime: `${timeFormatted} ET`,
      }
    }

    if (timeVal >= marketOpen && timeVal < marketClose) {
      return {
        isLive: true,
        label: 'Live Session',
        subText: 'Open until 16:00 ET (02:30 IST)',
        color: 'emerald',
        exchangeName: 'NYSE / NASDAQ',
        localTime: `${timeFormatted} ET`,
      }
    }

    if (timeVal < marketOpen) {
      return {
        isLive: false,
        label: 'Closed',
        subText: 'Opens today at 09:30 ET (20:00 IST)',
        color: 'stone',
        exchangeName: 'NYSE / NASDAQ',
        localTime: `${timeFormatted} ET`,
      }
    }

    return {
      isLive: false,
      label: 'Closed',
      subText: 'After Hours (Opens tomorrow 09:30 ET)',
      color: 'stone',
      exchangeName: 'NYSE / NASDAQ',
      localTime: `${timeFormatted} ET`,
    }
  }

  // GLOBAL (Europe / Asia-Pac)
  const gmtString = now.toLocaleString('en-US', { timeZone: 'Europe/London' })
  const gmtDate = new Date(gmtString)
  const day = gmtDate.getDay()
  const hours = gmtDate.getHours()
  const minutes = gmtDate.getMinutes()
  const timeVal = hours * 60 + minutes
  const isWeekend = day === 0 || day === 6

  if (isWeekend) {
    return {
      isLive: false,
      label: 'Closed',
      subText: 'Weekend (European & Asian exchanges closed)',
      color: 'stone',
      exchangeName: 'LSE / DAX / TSE',
      localTime: `${gmtDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} GMT`,
    }
  }

  if (timeVal >= 8 * 60 && timeVal < 16 * 60 + 30) {
    return {
      isLive: true,
      label: 'Live Session',
      subText: 'European Markets Open',
      color: 'emerald',
      exchangeName: 'LSE / DAX',
      localTime: `${gmtDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} GMT`,
    }
  }

  return {
    isLive: false,
    label: 'Closed',
    subText: 'Global Sessions Closed',
    color: 'stone',
    exchangeName: 'Global Markets',
    localTime: `${gmtDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} GMT`,
  }
}
