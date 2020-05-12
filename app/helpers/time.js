'use strict'
function getReadableDate(opts) {
    return opts.day + '-' + opts.month + '-' + opts.year
}

function getReadableTime(opts) {
    if (opts.minutes.length === 1) opts.minutes = '0' + opts.minutes
    return opts.hours + ':' + opts.minutes
}

exports.getDate = date => {
    const day = String(date.getDate())
    const month = String(date.getMonth() + 1)
    const year = String(date.getFullYear())
    return getReadableDate({ day: day, month: month, year: year })
}

exports.getTime = date => {
    const hours = String(date.getHours())
    const minutes = String(date.getMinutes())
    return getReadableTime({ hours: hours, minutes: minutes })
}

exports.isDst = date => {
    const jan = new Date(date.getFullYear(), 0, 1).getTimezoneOffset()
    const jul = new Date(date.getFullYear(), 6, 1).getTimezoneOffset()
    return Math.max(jan, jul) !== date.getTimezoneOffset()
}

exports.validDate = dateString => {
    if (dateString) {
        if (dateString.length >= 8 && dateString.length <= 10) {
            if (dateString.indexOf('-') !== dateString.lastIndexOf('-')) {
                const day = parseInt(dateString.substring(0, dateString.indexOf('-')))
                const month = parseInt(dateString.substring(dateString.indexOf('-') + 1, dateString.lastIndexOf('-')))
                const year = parseInt(dateString.substring(dateString.lastIndexOf('-') + 1, dateString.length))
                if (day && month && year) {
                    const leapYear = year % 4 === 0
                    if (month === 1 || month === 3 || month === 5 || month === 7 || month === 8 || month === 10 || month
                        === 12) {
                        return day <= 31
                    } else if (month === 4 || month === 6 || month === 9 || month === 11) {
                        return day <= 30
                    } else if (month === 2) {
                        if (leapYear) {
                            return day <= 29
                        } else {
                            return day <= 28
                        }
                    }
                }
            }
        }
    }
    return false
}

exports.validTime = timeString => {
    if (timeString) {
        if (timeString.length === 5) {
            const hours = parseInt(timeString.substring(0, 2))
            const minutes = parseInt(timeString.substring(3, 5))
            return ((hours && minutes || hours === 0 && minutes || hours === 0 && minutes === 0 || hours && minutes ===
                0) && (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60))
        }
    }
    return false
}

exports.getDateInfo = dateString => {
    const day = dateString.substring(0, dateString.indexOf('-'))
    const month = dateString.substring(dateString.indexOf('-') + 1, dateString.lastIndexOf('-'))
    const year = dateString.substring(dateString.lastIndexOf('-') + 1, dateString.length)
    return { day: day, month: month, year: year }
}

exports.getTimeInfo = timeString => {
    const hours = timeString.substring(0, timeString.indexOf(':'))
    const minutes = timeString.substring(timeString.indexOf(':') + 1, timeString.length)
    return { hours: hours, minutes: minutes }
}

exports.getDurationString = milliseconds => {
    const days = Math.floor(milliseconds / (24 * 60 * 60 * 1000))
    const daysMilliseconds = milliseconds % (24 * 60 * 60 * 1000)
    const hours = Math.floor(daysMilliseconds / (60 * 60 * 1000))
    const hoursMilliseconds = milliseconds % (60 * 60 * 1000)
    const minutes = Math.floor(hoursMilliseconds / (60 * 1000))
    const minutesMilliseconds = milliseconds % (60 * 1000)
    const seconds = Math.floor(minutesMilliseconds / (1000))
    return (days > 0 ? days + 'd ' : '') + (hours > 0 ? hours + 'h ' : '') + (minutes > 0 ? minutes + 'm ' : '') +
        seconds + 's'
}
