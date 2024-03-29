interface DateInfo { day: number, month: number, year: number }
interface TimeInfo { hours: number, minutes: number }

function getReadableDate (opts: DateInfo): string {
  return `${opts.day}-${opts.month}-${opts.year}`
}

function getReadableTime (opts: TimeInfo): string {
  return `${opts.hours}:${'0'.repeat(2 - String(opts.minutes).length)}${opts.minutes}`
}

export function diffDays (date1: Date, date2: Date): number {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  d1.setHours(0, 0, 0)
  d2.setHours(0, 0, 0)
  return Math.round(Math.abs((d1.getTime() - d2.getTime()) / 86_400_000))
}

export function getDate (date: Date): string {
  const day = date.getDate()
  const month = date.getMonth() + 1
  const year = date.getFullYear()
  return getReadableDate({ day, month, year })
}

export function getDateInfo (dateString: string): DateInfo {
  const day = parseInt(dateString.substring(0, dateString.indexOf('-')))
  const month = parseInt(dateString.substring(dateString.indexOf('-') + 1, dateString.lastIndexOf('-')))
  const year = parseInt(dateString.substring(dateString.lastIndexOf('-') + 1, dateString.length))
  return { day, month: month - 1, year }
}

export function getDurationString (milliseconds: number): string {
  const days = Math.floor(milliseconds / 86_400_000)
  const daysMilliseconds = milliseconds % 86_400_000
  const hours = Math.floor(daysMilliseconds / 3_600_000)
  const hoursMilliseconds = milliseconds % 3_600_000
  const minutes = Math.floor(hoursMilliseconds / 60_000)
  const minutesMilliseconds = milliseconds % 60_000
  const seconds = Math.floor(minutesMilliseconds / 1000)
  return `${days > 0 ? `${days}d ` : ''}${hours > 0 ? `${hours}h ` : ''}${minutes > 0 ? `${minutes}m ` : ''}${seconds > 0 ? `${seconds}s ` : ''}`
}

export function getTime (date: Date): string {
  const hours = date.getHours()
  const minutes = date.getMinutes()
  return getReadableTime({ hours, minutes })
}

export function getTimeInfo (timeString: string): TimeInfo {
  const hours = parseInt(timeString.substring(0, timeString.indexOf(':')))
  const minutes = parseInt(timeString.substring(timeString.indexOf(':') + 1, timeString.length))
  return { hours, minutes }
}
