'use strict'
const timeRegex = /^(2[0-3]|[0-1]?[\d]):[0-5][\d]$/
const dateRegex = /(([0-2]?[0-9]|3[0-1])[-](0?[1-9]|1[0-2])[-][0-9]{4})/

function getReadableDate (opts) {
  return `${opts.day}-${opts.month}-${opts.year}`
}

function getReadableTime (opts) {
  return `${opts.hours}:${'0'.repeat(2 - String(opts.minutes).length)}${opts.minutes}`
}

exports.getDate = date => {
  const day = date.getDate()
  const month = date.getMonth() + 1
  const year = date.getFullYear()
  return getReadableDate({ day, month, year })
}

exports.getTime = date => {
  const hours = date.getHours()
  const minutes = date.getMinutes()
  return getReadableTime({ hours, minutes })
}

exports.isDst = date => {
  const jan = new Date(date.getFullYear(), 0, 1).getTimezoneOffset()
  const jul = new Date(date.getFullYear(), 6, 1).getTimezoneOffset()
  return Math.max(jan, jul) !== date.getTimezoneOffset()
}

exports.validDate = dateString => {
  if (dateRegex.test(dateString)) {
    const { day, month, year } = exports.getDateInfo(dateString)
    const leapYear = year % 4 === 0
    if (month === 0 || month === 2 || month === 4 || month === 6 || month === 7 || month === 9 || month === 11) {
      return day <= 31
    } else if (month === 3 || month === 5 || month === 8 || month === 10) {
      return day <= 30
    } else if (month === 1) {
      return leapYear ? day <= 29 : day <= 28
    }
  }
  return false
}

exports.validTime = timeString => {
  return timeRegex.test(timeString)
}

exports.getDateInfo = dateString => {
  const day = parseInt(dateString.substring(0, dateString.indexOf('-')))
  const month = parseInt(dateString.substring(dateString.indexOf('-') + 1, dateString.lastIndexOf('-')))
  const year = parseInt(dateString.substring(dateString.lastIndexOf('-') + 1, dateString.length))
  return { day, month: month - 1, year }
}

exports.getTimeInfo = timeString => {
  const hours = parseInt(timeString.substring(0, timeString.indexOf(':')))
  const minutes = parseInt(timeString.substring(timeString.indexOf(':') + 1, timeString.length))
  return { hours, minutes }
}

exports.getDurationString = milliseconds => {
  const days = Math.floor(milliseconds / (24 * 60 * 60 * 1000))
  const daysMilliseconds = milliseconds % (24 * 60 * 60 * 1000)
  const hours = Math.floor(daysMilliseconds / (60 * 60 * 1000))
  const hoursMilliseconds = milliseconds % (60 * 60 * 1000)
  const minutes = Math.floor(hoursMilliseconds / (60 * 1000))
  const minutesMilliseconds = milliseconds % (60 * 1000)
  const seconds = Math.floor(minutesMilliseconds / (1000))
  return `${days > 0 ? days + 'd ' : ''}${hours > 0 ? hours + 'h ' : ''}${minutes > 0 ? minutes + 'm ' : ''}${seconds > 0 ? seconds + 's ' : ''}`
}
