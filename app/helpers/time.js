'use strict'
const fs = require('fs')

const timezones = require('../content/timezones')

function getReadableDate(opts) {
    return opts.day + '-' + opts.month + '-' + opts.year
}

function getReadableTime(opts) {
    if (opts.minutes.length === 1) {
        opts.minutes = '0' + opts.minutes
    }
    return opts.hours + ':' + opts.minutes
}

exports.getUnix = date => {
    if (!date) {
        date = new Date()
    }
    return Math.round(date.getTime() / 1000)
}

exports.getPlaceFromTimezone = abbreviation => {
    return new Promise(
        resolve => {
            abbreviation = abbreviation.toUpperCase()
            Object.keys(timezones).forEach(key => {
                if (timezones[key].includes(abbreviation)) {
                    resolve(key)
                }
            })
            resolve(null)
        },
    )
}

exports.getTimeInPlace = place => {
    return new Date(new Date().toLocaleString('en-US', {
        timeZone: place
    }))
}

exports.convertTimezones = () => {
    fs.readFile('../content/timezones.txt', (err, data) => {
        let timezones = {}
        let count = 0
        let currentPlace
        data.toString().split('\n').forEach(line => {
            if (count % 4 === 0) {
                if (currentPlace) {
                    timezones[currentPlace] = Array.from(new Set(timezones[currentPlace]))
                }
                if (line.indexOf('posix/') > -1 || line.indexOf('right/') > -1) {
                    currentPlace = line.substring(line.indexOf('/usr/share/zoneinfo/') + 26, line.length - 1)
                } else {
                    currentPlace = line.substring(line.indexOf('/usr/share/zoneinfo/') + 20, line.length - 1)
                }
                timezones[currentPlace] = []
            } else if ((count - 1) % 4 === 0 || (count - 2) % 4 === 0) {
                let abbreviation = line.substring(line.lastIndexOf(' ') + 2, line.length - 2)
                timezones[currentPlace].push(abbreviation)
            }
            count++
        })
        fs.writeFile('../content/timezones.json', JSON.stringify(timezones), err => {
            if (err) throw err
            console.log('Successfully written to file!')
        })
    })
}

exports.getDate = unix => {
    const dateObject = new Date(unix)
    const day = String(dateObject.getDate())
    const month = String(dateObject.getMonth() + 1)
    const year = String(dateObject.getFullYear())
    return getReadableDate({day: day, month: month, year: year})
}

exports.getTime = unix => {
    const dateObject = new Date(unix)
    const hours = String(dateObject.getHours())
    const minutes = String(dateObject.getMinutes())
    return getReadableTime({hours: hours, minutes: minutes})
}

exports.isDst = unix => {
    const date = new Date(unix)
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
    return {day: day, month: month, year: year}
}

exports.getTimeInfo = timeString => {
    const hours = timeString.substring(0, timeString.indexOf(':'))
    const minutes = timeString.substring(timeString.indexOf(':') + 1, timeString.length)
    return {hours: hours, minutes: minutes}
}
