require('dotenv').config()

const discord = require('discord.js')
const roblox = require('noblox.js')
const trello = require('node-trello')

const fs = require('fs')
/*const request = require('request');
const cheerio = require('cheerio');*/

const sleep = require('sleep')
const time = require('time')

const t = new trello(process.env.TRELLO_KEY, process.env.TRELLO_TOKEN)

const client = new discord.Client()
client.login(process.env.DISCORD_TOKEN)

let currentActivityNumber

/** @member {Array} */
const activities = require('./config/activities')

function getActivityFromNumber(num) {
    return num === 0 && 'Playing' || num === 1 && 'Streaming' || num === 2 && 'Listening to' || num === 3 && 'Watching'
}

let activitiesString = ''
activities.forEach((activity, index) => {
    activitiesString += `${index + 1}. **${getActivityFromNumber(activity.options.type)}** ${activity.name}\n`
})

function getRandomInt(max, last) {
    const newNumber = Math.floor(Math.random() * Math.floor(max))
    if (max === 1 || !last || newNumber !== last) {
        return newNumber
    } else {
        return getRandomInt(max, last)
    }
}

function setActivity(num) {
    const activity = activities[num]
    client.user.setActivity(activity.name, activity.options)
    currentActivityNumber = num
    return `**${getActivityFromNumber(activity.options.type)}** ${activity.name}`
}

let startUnix

client.on('ready', () => {
    startUnix = getUnix()
    setActivity(getRandomInt(activities.length))
    console.log(`Ready to serve on ${client.guilds.size} servers, for ${client.users.size} users.`)
})

client.on('error', err => {
    console.error(err)
    restart(client)
})

function restart(client) {
    client.destroy().then(() => {
        client.login(process.env.DISCORD_TOKEN).then(() => {
            var guild = client.guilds.find(x => x.name === 'NS Roblox')
            if (guild) {
                var admin_logschannel = guild.channels.find(x => x.name === 'admin_logs')
                admin_logschannel.send('Due to connection errors, I just restarted myself.')
            }
            console.log('Client logged in!')
        }).catch(() => {
            sleep.sleep(30)
            restart(client)
        })
    }).catch(() => {
        sleep.sleep(30)
        restart(client)
    })
}

const prefix = '/'
const maximumRank = 5
const groupId = 1018818
const MTgroupId = 2661380

const QOTDInterval = 3 // in days
const checkRate = 60 * 60 * 1000 // in milliseconds

const NSadminDiscordUserID = '5a57ee52ffa8593145697d03'
const trainingSchedulerBoardID = '5a52b61dbb039ad5909f2895'
const currentSuspensionsListID = '5809d4a29cb8026531caca83'
const doneSuspensionsListID = '5809d4a43ab48cb87fc42e79'
const exiledListID = '5a36783a7a2c516ccd5d76ae'
const bannedListID = '5a54e9a585e806299bff1011'
const unbannedListID = '5b44b73f21d213fd5c91c58e'
const scheduledTrainingsListID = '5a52b61fec92437fecc1e7b1'
const finishedTrainingsListID = '5a52b6200a81f0b886803194'
const cancelledTrainingsListID = '5a9600082162203597c483c3'
const suggestedQOTDsListID = '5a5df470ad58200e9140508f'
const declinedQOTDsListID = '5a5df665f1acaee38bf29e1a'
const approvedQOTDsListID = '5a5df475379b29fc0a41fffd'
const askedQOTDsListID = '5a5df47c4416542fa7573528'

/** @member (Array) */
const commands = require('./config/commands')

const defaultTrainingShout = '[TRAININGS] There are new trainings being hosted soon, check out the Training Scheduler in the Group Center for more info!'

const cmdsEmbeds = [
    new discord.RichEmbed()
        .setAuthor('NSadmin', 'https://image.prntscr.com/image/ltRs7okBRVGs8KLf4a-fCw.png')
        .setColor([255, 174, 12])
        .setTitle('Commands (1)')
        .addField('Main commands I', commands[0].main1)
        .addField('Main commands II', commands[0].main2)
        .addField('Main commands III', commands[0].main3)
        .addField('Miscellaneous I', commands[0].misc1)
        .addField('Miscellaneous II', commands[0].misc2)
        .addField('HR commands I', commands[0].HR1),
    new discord.RichEmbed()
        .setAuthor('NSadmin', 'https://image.prntscr.com/image/ltRs7okBRVGs8KLf4a-fCw.png')
        .setColor([255, 174, 12])
        .setTitle('Commands (2)')
        .addField('HR commands II', commands[1].HR2)
        .addField('HR commands III', commands[1].HR3)
        .addField('HR commands IV', commands[1].HR4)
        .addField('Bot commands', commands[1].bot1),
]

let joindatecache = {}

const convertedTimezones = require('./config/timezones')

function isCommand(command, message) {
    command = command.toLowerCase()
    const content = message.content.toLowerCase()
    if (content.length === (command + prefix).length) {
        return content.startsWith(prefix + command)
    } else {
        return content.startsWith(prefix + command + ' ')
    }
}

function pluck(array) {
    return array.map(item => {
        return item['name']
    })
}

function hasRole(member, role) {
    return pluck(member.roles).includes(role)
}

function isAdmin(member) {
    return hasRole(member, 'HR')
}

function getUnix(date) {
    if (!date) {
        date = new Date()
    }
    return Math.round(date.getTime() / 1000)
}

function getEmbed(title, text) {
    return compileRichEmbed([{title: title, message: text}])
}

function logCommand(user, command, text, channel) {
    if (channel) {
        channel.send(compileRichEmbed([{title: `**${user}** used command **/${command}**!`, message: text}]))
    }
}

function getAgeDays(joinDate) {
    const dateNumbers = joinDate.split(/[/]+/)
    const date = new Date(parseInt(dateNumbers[2]), parseInt(dateNumbers[1]) - 1, parseInt(dateNumbers[0]))
    const ageDays = Math.round((getUnix() - date.getTime() / 1000) / 86400)
    if (ageDays === 1) {
        return ageDays + ' day'
    } else {
        return ageDays + ' days'
    }
}

function getPossessionName(name) {
    if (name.slice(-1) === 's') {
        return '**' + name + '**\''
    } else {
        return '**' + name + '**\'s'
    }
}

function extractText(str, delimiter) {
    let extracted
    if (str && delimiter) {
        if (str.indexOf(delimiter) !== str.lastIndexOf(delimiter)) {
            const firstIndex = str.indexOf(delimiter) + 1
            const lastIndex = str.lastIndexOf(delimiter)
            extracted = str.substring(firstIndex, lastIndex)
        }
    }
    return extracted
}

function getMemberByName(name, guild) {
    const guildMembers = guild.members.array()
    guildMembers.forEach(member => {
        const who = member.nickname || member.user.username
        if (who.toLowerCase() === name.toLowerCase()) {
            return member
        }
    })
}

function getCardInList(name, idList) {
    return new Promise(
        (resolve, reject) => {
            t.get(`/1/lists/${idList}/cards`, {}, (err, cards) => {
                if (!err) {
                    for (const card of cards) {
                        if (card.name === String(name)) {
                            resolve(card)
                        }
                    }
                    resolve(null)
                } else {
                    reject(new Error(err.message))
                }
            })
        },
    )
}

function getCardsInList(idList) {
    return new Promise(
        (resolve, reject) => {
            t.get(`/1/lists/${idList}/cards`, {}, (err, cards) => {
                if (!err) {
                    resolve(cards)
                } else {
                    reject(new Error(err.message))
                }
            })
        },
    )
}

function isSuspended(name) {
    return new Promise(
        (resolve, reject) => {
            roblox.getIdFromUsername(name)
                .then(id => {
                    getCardInList(id, currentSuspensionsListID)
                        .then(suspended => {
                            if (suspended) {
                                resolve(true)
                            } else {
                                resolve(false)
                            }
                        }).catch(err => reject(new Error(err.message)))
                }).catch(err => reject(new Error(err.message)))
        },
    )
}

function getPlaceFromTimezone(abbreviation) {
    return new Promise(
        resolve => {
            abbreviation = abbreviation.toUpperCase()
            Object.keys(convertedTimezones).forEach(key => {
                if (convertedTimezones[key].includes(abbreviation)) {
                    resolve(key)
                }
            })
            resolve(null)
        },
    )
}

function checkRole(guild, member, rank) {
    if (rank === 2) {
        if (!hasRole(member, 'Suspended')) {
            member.addRole(guild.roles.find(role => role.name === 'Suspended'))
        }

        if (hasRole(member, 'MR')) {
            member.removeRole(guild.roles.find(role => role.name === 'MR'))
        }
        if (hasRole(member, 'Representative')) {
            member.removeRole(guild.roles.find(role => role.name === 'Representative'))
        }
        if (hasRole(member, 'Staff Coordinator')) {
            member.removeRole(guild.roles.find(role => role.name === 'Staff Coordinator'))
        }
        if (hasRole(member, 'Operations Coordinator')) {
            member.removeRole(guild.roles.find(role => role.name === 'Operations Coordinator'))
        }
    } else {
        if (hasRole(member, 'Suspended')) {
            member.removeRole(guild.roles.find(role => role.name === 'Suspended'))
        }
        if (rank < 100 && hasRole(member, 'MR')) {
            member.removeRole(guild.roles.find(role => role.name === 'MR'))
        }
        if (rank !== 100 && hasRole(member, 'Representative')) {
            member.removeRole(guild.roles.find(role => role.name === 'Representative'))
        }
        if (rank !== 101 && hasRole(member, 'Staff Coordinator')) {
            member.removeRole(guild.roles.find(role => role.name === 'Staff Coordinator'))
        }
        if (rank !== 102 && hasRole(member, 'Operations Coordinator')) {
            member.removeRole(guild.roles.find(role => role.name === 'Operations Coordinator'))
        }
        if (rank >= 100 && rank <= 102 && !hasRole(member, 'MR')) {
            member.addRole(guild.roles.find(role => role.name === 'MR'))
        }
        if (rank === 100 && !hasRole(member, 'Representative')) {
            member.addRole(guild.roles.find(role => role.name === 'Representative'))
        } else if (rank === 101 && !hasRole(member, 'Staff Coordinator')) {
            member.addRole(guild.roles.find(role => role.name === 'Staff Coordinator'))
        } else if (rank === 102 && !hasRole(member, 'Operations Coordinator')) {
            member.addRole(guild.roles.find(role => role.name === 'Operations Coordinator'))
        }
    }
}

function checkLastPromotions(guild) {
    fs.readFile('/home/pi/suspended.txt', (err, data) => {
        if (!err) {
            data = JSON.parse(data)
            for (const i in data) {
                (() => {
                    const key = i
                    const userId = parseInt(key)
                    roblox.getUsernameFromId(userId)
                        .then(username => {
                            const member = getMemberByName(username, guild)
                            if (member) {
                                const table = data[key]
                                for (const promotion of table) {
                                    (() => {
                                        checkRole(guild, member, promotion.rank)
                                    })()
                                }
                            }
                        }).catch(err => console.log(err.message))
                })()
            }
            fs.writeFile('/home/pi/suspended.txt', '{}', err => {
                if (err) {
                    console.log(err.message)
                }
            })
        } else {
            console.log(err.message)
        }
    })
}

function checkQOTD(guild) {
    t.get(`/1/lists/${askedQOTDsListID}/cards`, {}, (err, data) => {
        if (!err) {
            const lastCard = data[0]
            const due = new Date(lastCard.due)
            const diffTime = getUnix() - getUnix(due)
            if (diffTime > QOTDInterval * 86400) {
                t.get(`/1/lists/${approvedQOTDsListID}/cards`, {}, (err, data) => {
                    if (!err && data.length > 0) {
                        const newCard = data[0]
                        const dueSeconds = getUnix(due)
                        const times = Math.floor(diffTime / 86400)
                        const newDueSeconds = dueSeconds + times * 86400
                        const newDue = new Date(newDueSeconds * 1000).toISOString()
                        t.put(`/1/cards/${newCard.id}`, {
                            pos: 'top',
                            due: newDue,
                            dueComplete: true,
                            idList: askedQOTDsListID,
                            idMembers: [NSadminDiscordUserID],
                        }, () => {
                            guild.channels.find(x => x.name === 'announcements').send(
                                `${guild.emojis.get('248922413599817728')} **QOTD**
*${newCard.name}*
Leave your answers in ${guild.channels.find(channel => channel.name === 'general')}!
@everyone`,
                            )
                        })
                    }
                })
            }
        }
    })
}

function isDST(unix) {
    const date = new Date(unix)
    const jan = new Date(date.getFullYear(), 0, 1).getTimezoneOffset()
    const jul = new Date(date.getFullYear(), 6, 1).getTimezoneOffset()
    return Math.max(jan, jul) != date.getTimezoneOffset()
}

function checkMTJoinRequests(guild) {
    roblox.getJoinRequests(MTgroupId)
        .then(requests => {
            const admin_logschannel = guild.channels.find(channel => channel.name === 'admin_logs')
            for (const request of requests) {
                const userName = request.username
                roblox.getIdFromUsername(userName)
                    .then(userId => {
                        roblox.getRankInGroup(groupId, userId)
                            .then(rank => {
                                if (rank >= 8) {
                                    var member = getMemberByName(userName, guild)
                                    if (member) {
                                        checkRole(guild, member, rank)
                                    }
                                    roblox.handleJoinRequestId(MTgroupId, request.requestId, true)
                                        .then(() => {
                                            admin_logschannel.send(`Accepted ${getPossessionName(userName)} MT join request.`)
                                            if (rank == 251 || rank == 252) {
                                                rank = 199
                                            }
                                            roblox.setRank(MTgroupId, userId, rank)
                                                .then(newRole => admin_logschannel.send(`Successfully ranked **${userName}** to **${newRole.Name}** in MT group.`))
                                                .catch(err => {
                                                    console.log(err.message)
                                                    admin_logschannel.send(`Couldn't rank **${userName}** to **${rank}** in MT group.`)
                                                })
                                        }).catch(err => {
                                        console.log(err.message)
                                        admin_logschannel.send(`Couldn't accept **${getPossessionName(userName)}** MT group join request.`)
                                    })
                                } else {
                                    roblox.handleJoinRequestId(MTgroupId, request.requestId, false)
                                        .then(() => admin_logschannel.send(`Declined ${getPossessionName(userName)} MT join request.`))
                                        .catch(err => {
                                            console.log(err.message)
                                            admin_logschannel.send(`Couldn't decline ${getPossessionName(userName)} MT group join request.`)
                                        })
                                }
                            }).catch(err => console.log(err.message))
                    }).catch(err => console.log(err.message))
            }
        }).catch(err => console.log(err.message))
}

function compileRichEmbed(fields, opts) {
    fields = fields || []
    opts = opts || {}
    let embed = opts.original
    if (!embed) {
        embed = new discord.RichEmbed()
            .setAuthor('NSadmin', 'https://image.prntscr.com/image/ltRs7okBRVGs8KLf4a-fCw.png')
            .setColor([255, 174, 12])
    }
    if (opts.timestamp) {
        embed.setTimestamp(opts.timestamp)
    } else {
        embed.setTimestamp()
    }
    const len = fields.length <= 25 ? fields.length : 25
    for (let i = 0; i < len; i++) {
        let title = fields[i].title
        let message = fields[i].message
        if (title && title.length > 256) {
            title = title.substring(0, 253) + '...'
            console.log(`Shortened title ${title}, 256 characters is max.`)
        }
        if (message && message.length > 2048) {
            message = message.substring(0, 2045) + '...'
            console.log(`Shortened message ${message}, 2048 characters is max.`)
        }
        embed.addField(fields[i].title || '?', fields[i].message || '-')
    }
    if (fields.length > 25) {
        console.log(`Ignored ${fields.length - 25} fields, 25 is max.`)
    }
    return embed
}

function getUsername(str) {
    return new Promise(
        (resolve, reject) => {
            if (parseInt(str)) {
                roblox.getUsernameFromId(parseInt(str))
                    .then(userName => resolve(userName))
                    .catch(err => reject(new Error(err.message)))
            } else {
                roblox.getIdFromUsername(str)
                    .then(id => {
                        roblox.getUsernameFromId(id)
                            .then(userName => resolve(userName))
                            .catch(() => resolve(str))
                    }).catch(() => resolve(str))
            }
        },
    )
}

function getRoleByAbbreviation(str) {
    if (str) {
        str = str.toUpperCase()
        return str === 'G' && 'Guest' || str === 'C' && 'Customer' || str === 'S' && 'Suspended' || str === 'TD' &&
            'Train Driver' || str === 'CD' && 'Conductor' || str === 'CSR' && 'Customer Service Representative' || str
            === 'CS' && 'Customer Service' || str === 'J' && 'Janitor' || str === 'Se' && 'Security' || str === 'LC' &&
            'Line Controller' || str === 'PR' && 'Partner Representative' || str === 'R' && 'Representative' || str ===
            'MC' && 'Management Coordinator' || str === 'OC' && 'Operations Coordinator' || str === 'GA' &&
            'Group Admin' || str === 'BoM' && 'Board of Managers' || str === 'BoD' && 'Board of Directors' || str ===
            'CF' && 'Co-Founder' || str === 'AA' && 'Alt. Accounts' || str === 'PD' && 'President-Director' || str ===
            'UT' && 'Update Tester' || str === 'P' && 'Pending' || str === 'PH' && 'Pending HR' || str === 'MoCR' &&
            'Manager of Customer Relations' || str === 'MoSe' && 'Manager of Security' || str === 'MoRS' &&
            'Manager of Rolling Stock' || str === 'MoSt' && 'Manager of Stations' || str === 'MoE' &&
            'Manager of Events' || str === 'MoC' && 'Manager of Conductors' || str === 'MoRM' &&
            'Manager of Rail Management' || str === 'DoNSR' && 'Director of NS Reizgers' || str === 'DoO' &&
            'Director of Operations' || null
    }
    return null
}

function getAbbreviationByRank(rank, group) {
    if (rank === 0) {
        return 'G'
    }
    if (!group || group === groupId) {
        return rank === 1 && 'C' || rank === 2 && 'S' || rank === 3 && 'TD' || rank === 4 && 'CD' || rank === 5 && 'CSR'
            || rank === 6 && 'J' || rank === 7 && 'Se' || rank === 8 && 'LC' || rank === 99 && 'PR' || rank === 100 &&
            'R' || rank === 101 && 'SC' || rank === 102 && 'OC' || rank === 103 && 'GA' || rank === 251 && 'BoM' || rank
            === 252 && 'BoD' || rank === 253 && 'CF' || rank === 254 && 'AA' || rank === 255 && 'PD' || null
    } else if (group === MTgroupId) {
        return rank === 2 && 'P' || rank === 50 && 'UT' || rank === 55 && 'LC' || rank === 100 && 'R' || rank === 101 &&
            'SC' || rank === 102 && 'OC' || rank === 199 && 'PHR' || rank === 244 && 'MoCR' || rank === 245 && 'MoSe' ||
            rank === 246 && 'MoRS' || rank === 247 && 'MoSt' || rank === 248 && 'MoE' || rank === 249 && 'MoC' || rank
            === 250 && 'MoRM' || rank === 251 && 'DoNSR' || rank === 252 && 'DoO' || rank === 253 && 'GA' || rank ===
            254 && 'AA' || rank === 255 && 'PD'
    }
}

function getRoleByRank(rank, group) {
    return getRoleByAbbreviation(getAbbreviationByRank(rank, group))
}

function isTrainableAbbreviation(str) {
    str = String(str)
    if (str) {
        str = str.toUpperCase()
        return str === 'CD' || str === 'CSR' || str === 'CS'
    }
    return false
}

function validTime(timeString) {
    timeString = String(timeString)
    if (timeString) {
        if (timeString.length === 5) {
            const hours = parseInt(timeString.substring(0, 2))
            const minutes = parseInt(timeString.substring(3, 5))
            if (hours && minutes || hours === 0 && minutes || hours === 0 && minutes === 0 || hours && minutes === 0) {
                if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
                    return true
                }
            }
        }
    }
    return false
}

function validDate(dateString) {
    dateString = String(dateString)
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

function getDateInfo(dateString) {
    const day = dateString.substring(0, dateString.indexOf('-'))
    const month = dateString.substring(dateString.indexOf('-') + 1, dateString.lastIndexOf('-'))
    const year = dateString.substring(dateString.lastIndexOf('-') + 1, dateString.length)
    return {day: day, month: month, year: year}
}

function getTimeInfo(timeString) {
    const hours = timeString.substring(0, timeString.indexOf(':'))
    const minutes = timeString.substring(timeString.indexOf(':') + 1, timeString.length)
    return {hours: hours, minutes: minutes}
}

function getCardsNumOnBoard(boardId) {
    return new Promise(
        (resolve, reject) => {
            t.get(`/1/boards/${boardId}/cards`, {}, (err, cards) => {
                if (!err) {
                    resolve(cards.length)
                } else {
                    reject(new Error(err.message))
                }
            })
        }
    )
}

function getReadableDate(opts) {
    return opts.day + '-' + opts.month + '-' + opts.year
}

function getReadableTime(opts) {
    if (opts.minutes.length === 1) {
        opts.minutes = '0' + opts.minutes
    }
    return opts.hours + ':' + opts.minutes
}

function getDate(unix) {
    const dateObject = new Date(unix)
    const day = String(dateObject.getDate())
    const month = String(dateObject.getMonth() + 1)
    const year = String(dateObject.getFullYear())
    return getReadableDate({day: day, month: month, year: year})
}

function getTime(unix) {
    const dateObject = new Date(unix)
    const hours = String(dateObject.getHours())
    const minutes = String(dateObject.getMinutes())
    return getReadableTime({hours: hours, minutes: minutes})
}

function getTrainingSentence(trainingData) {
    const role = trainingData.type.toUpperCase()
    const dateUnix = trainingData.date
    const readableDate = getDate(dateUnix * 1000)
    const readableTime = getTime(dateUnix * 1000)
    return `**${role}** training on **${readableDate}** at **${readableTime} ${isDST(dateUnix * 1000) && 'CEST' ||
        'CET'}**, hosted by **${trainingData.by}**.`
}

function DMmember(member, message) {
    return new Promise(
        (resolve, reject) => {
            member.createDM()
                .then(channel => {
                    channel.send(message)
                    resolve(true)
                })
                .catch(err => reject(new Error(err.message)))
        },
    )
}

function getRobloxTrainingShout(trainingData) {
    const role = getRoleByAbbreviation(trainingData.type)
    const dateString = getDate(trainingData.date * 1000)
    //const timeString = getTime(trainingData.date*1000);
    const by = trainingData.by
    const specialNotes = trainingData.specialnotes
    return `[TRAINING] ${role} training on ${dateString} (for times please check Group Center), hosted by ${by}
        .${specialNotes && ' ' + specialNotes || ''}`
}

function getDiscordTrainingAnnouncement(trainingData, guild) {
    const role = getRoleByAbbreviation(trainingData.type)
    const dateString = getDate(trainingData.date * 1000)
    const timeString = getTime(trainingData.date * 1000)
    const by = trainingData.by
    const specialNotes = trainingData.specialnotes
    return `${guild.emojis.get('248922413599817728')} **TRAINING**\nThere will be a *${role}* training on **
        ${dateString}**.\nTime: **${timeString} ${isDST(trainingData.date * 1000) && 'CEST' || 'CET'}**.\n
        ${specialNotes && specialNotes + '\n' || ''}Hosted by **${by}**.\n@everyone`
}

function announceRoblox(content) {
    return new Promise(
        (resolve, reject) => {
            roblox.shout(groupId, content)
                .then(() => resolve(content))
                .catch(err => reject(new Error(err.message)))
        },
    )
}

function announceDiscord(content, channel) {
    return new Promise(
        (resolve, reject) => {
            channel.send(content)
                .then(() => resolve(content))
                .catch(err => reject(new Error(err.message)))
        },
    )
}

function getPbanList(cards) {
    return new Promise(
        resolve => {
            let list = ''
            let cardsProcessed = 0
            cards.forEach((card, index, array) => {
                setTimeout(() => {
                    const userId = parseInt(card.name)
                    const pbanData = JSON.parse(card.desc)
                    const rank = pbanData.rank
                    const byId = pbanData.by != 0 ? pbanData.by : '??'
                    const at = pbanData.at
                    const reason = pbanData.reason ? pbanData.reason : '??'
                    const role = rank ? getAbbreviationByRank(rank) : '??'
                    const dateString = at ? getDate(at*1000) : '??'
                    list += `**${userId}** (**${role}**) by **${byId}** at **${dateString}** with reason "*${reason}*"\n
                        `
                    cardsProcessed++
                    if (cardsProcessed === array.length) {
                        resolve(list)
                    }
                }, 100)
            })
        }
    )
}

function checkUpdates(guild) {
    return new Promise(
        resolve => {
            checkLastPromotions(guild)
            checkQOTD(guild)
            checkMTJoinRequests(guild)
            resolve(null)
        }
    )
}


client.on('message', async (message) => {
    if (message.author.bot) {
        return
    }
    const args = message.content.split(/[ ]+/)
    const command = args[0].substring(1, args[0].length)
    const author = message.member
    const guild = member.guild
    const verifyChannel = guild.channels.find(channel => channel.name === 'verify')
    const trainingsChannel = guild.channels.find(channel => channel.name === 'trainings')
    const admin_logsChannel = guild.channels.find(channel => channel.name === 'admin_logs')
    const nsadmin_logsChannel = guild.channels.find(channel => channel.name === 'nsadmin_logs')
    const reportsChannel = guild.channels.find(channel => channel.name === 'reports')
    const hrChannel = guild.channels.find(channel => channel.name === 'hr')
    const suggestionsChannel = guild.channels.find(channel => channel.name === 'suggestions')
    let userName = args[1] || member.nickname || message.author.username
    if (message.content.startsWith(prefix)) {
        if (message.channel.id === verifyChannel.id) {
            message.channel.send('Cannot use commands in this channel.')
            return
        }
    }
    if (args[1]) {
        try {
            userName = await getUsername(userName)
        } catch (err) {
        }
    }
    if (isCommand('amiadmin', message) || isCommand('isadmin', message)) {
        logCommand(member.nickname || message.author.username, command, message, nsadmin_logsChannel)
        if (args[1]) {
            const member = getMemberByName(userName, guild)
            if (member) {
                if (isAdmin(member)) {
                    message.channel.send(getEmbed(command, `Yes, **${userName}** is admin.`))
                } else {
                    message.channel.send(getEmbed(command, `No, **${userName}** is not admin.`))
                }
            } else {
                message.channel.send(getEmbed(command, `Couldn't find **${userName}** in server.`))
            }
        } else {
            if (isAdmin(author)) {
                message.channel.send(getEmbed(command, `Yes, **${userName}** is admin!`))
            } else {
                message.channel.send(getEmbed(command, `No, **${userName}** is not admin.`))
            }

        }
        return
    }
    if (isCommand('userid', message) || isCommand('getuserid', message)) {
        logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel)
        if (username) {
            roblox.getIdFromUsername(username)
                .then(id => message.channel.send(getEmbed(command, `**${username}** has userId **${id}**.`)))
                .catch(() => message.channel.send(getEmbed(command, `Sorry, but **${username}** doesn't exist on Roblox`)))
        } else {
            message.channel.send('Please enter a username.')
        }
        return
    }
    if (isCommand('rr', message) || isCommand('rulesregulations', message)) {
        message.channel.send('<https://devforum.roblox.com/t/ns-rules-and-regulations/63617> - Rules & Regulations')
        return
    }
    if (isCommand('group', message) || isCommand('grouppage', message) || isCommand('grouplink', message)) {
        message.channel.send('<https://www.roblox.com/Groups/group.aspx?gid=1018818> - Group Page')
        return
    }
    if (isCommand('game', message) || isCommand('gamepage', message)) {
        message.channel.send('<https://www.roblox.com/games/140576204/NS-Games-Universe> - Game Page')
        return
    }
    if (isCommand('role', message) || isCommand('getrole', message)) {
        logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel)
        if (username) {
            roblox.getIdFromUsername(username)
                .then(id => {
                    roblox.getRankInGroup(groupId, id)
                        .then(rank => {
                            if (rank >= 200) {
                                roblox.getRankNameInGroup(MTgroupId, id)
                                    .then(role => message.channel.send(getEmbed(command, `**${username}** has role **${role}**.`)))
                                    .catch(() => message.channel.send('Couldn\'t get rank.'))
                            } else {
                                roblox.getRankNameInGroup(groupId, id)
                                    .then(role => message.channel.send(getEmbed(command, `**${username}** has role **${role}**.`)))
                                    .catch(() => message.channel.send('Couldn\'t get rank.'))
                            }
                        }).catch(() => message.channel.send('Couldn\'t get user in the group.'))
                }).catch(() => message.channel.send(getEmbed(command, `Sorry, but **${username}** doesn't exist on Roblox.`)))
        } else {
            message.channel.send('Please enter a username.')
        }
        return
    }
    if (isCommand('rank', message) || isCommand('getrank', message)) {
        logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel)
        if (username) {
            roblox.getIdFromUsername(username)
                .then(id => {
                    roblox.getRankInGroup(groupId, id)
                        .then(rank => message.channel.send(getEmbed(command, `**${username}** has rank **${rank}**.`)))
                        .catch(() => message.channel.send('Couldn\'t get user in the group.'))
                }).catch(() => message.channel.send(getEmbed(command, `Sorry, but **${username}** doesn't exist on Roblox.`)))
        } else {
            message.channel.send('Please enter a username.')
        }
        return
    }
    if (isCommand('time', message)) {
        var now = new time.Date()
        if (args[1]) {
            var timezone = await getPlaceFromTimezone(args[1])
            if (timezone) {
                now.setTimezone(timezone)
            } else {
                message.channel.send(`Unknown Timezone: '**${args[1]}**'`)
                return
            }
        } else {
            now.setTimezone('right/Europe/Amsterdam')
        }
        var hours = ('0' + now.getHours()).slice(-2)
        var minutes = ('0' + now.getMinutes()).slice(-2)
        var timeString = hours + ':' + minutes
        message.channel.send(getEmbed('time', timeString))
        return
    }
    if (isCommand('date', message)) {
        var now = new time.Date()
        if (args[1]) {
            var timezone = await getPlaceFromTimezone(args[1])
            if (timezone) {
                now.setTimezone(timezone)
            } else {
                message.channel.send(`Unknown Timezone: '**${args[1]}**'`)
                return
            }
        } else {
            now.setTimezone('right/Europe/Amsterdam')
        }
        message.channel.send(getEmbed('date', now.toString()))
        return
    }
    if (isCommand('promote', message)) {
        if (isAdmin(member)) {
            logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel)
            var username = args[1]
            var byusername = member.nickname || message.author.username
            if (username) {
                roblox.getIdFromUsername(username)
                    .then(id => {
                        roblox.getRankInGroup(groupId, id)
                            .then(rank => {
                                if (rank >= maximumRank || rank == 0 || rank == 2) {
                                    message.channel.send(getEmbed(command, `**${username}** is rank **${rank}** and not promotable.`))
                                } else {
                                    if (!admin_logschannel) {
                                        message.channel.send('Couldn\'t find admin_logs channel.')
                                    } else {
                                        var offset = rank == 1 ? 2 : 1
                                        roblox.changeRank(groupId, id, offset)
                                            .then(roles => {
                                                admin_logschannel.send(`**${byusername}** promoted **${username}** from **${roles.oldRole.Name}** to **${roles.newRole.Name}**.`)
                                                message.channel.send(getEmbed(command, `Promoted **${username}** from **${roles.oldRole.Name}** to **${roles.newRole.Name}**.`))
                                                var member = getMemberByName(username, guild)
                                                if (member) {
                                                    checkRole(guild, member, roles.newRole.Rank)
                                                }
                                            }).catch(() => message.channel.send('Failed to promote.'))
                                    }
                                }
                            }).catch(() => message.channel.send('Couldn\'t get user in the group.'))
                    }).catch(() => message.channel.send(getEmbed(command, `Sorry, but **${username}** doesn't exist on Roblox.`)))
            } else {
                message.channel.send('Please enter a username.')
            }
        } else {
            message.channel.send('Insufficient powers!')
        }
        return
    }
    if (isCommand('clearreports', message)) {
        if (isAdmin(member)) {
            logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel)
            if (!reportschannel) {
                message.channel.send('Couldn\'t find reports channel.')
            } else {
                reportschannel.fetchMessages()
                    .then(messages => {
                        if (messages.size - 1 > 0) {
                            reportschannel.bulkDelete(messages.size - 1)
                                .then(() => {
                                    if (message.channel != reportschannel) {
                                        message.channel.send(getEmbed(command, `Successfully deleted **${messages.size - 1}** messages in ${guild.channels.find(x => x.name === 'reports')}.`))
                                    }
                                }).catch(() => message.channel.send('Error deleting the messages!'))
                        } else {
                            message.channel.send('There are no messages to delete in #reports.')
                        }
                    }).catch(() => message.channel.send('Error getting the messages'))
            }
        } else {
            message.channel.send('Insufficient powers!')
        }
        return
    }
    if (isCommand('suspend', message)) {
        if (isAdmin(member)) {
            logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel)
            var username = args[1]
            var byusername = member.nickname || message.author.username
            var days = args[2]
            var rankback = (args[3] && args[3].toLowerCase() == 'no') ? 0 : 1
            var reason = extractText(message.content, '"')
            if (!username) {
                message.channel.send('Please enter a username.')
                return
            }
            if (!days) {
                message.channel.send('Please enter an amount of days.')
                return
            } else {
                days = parseInt(days)
                if (days) {
                    days = Math.round(days)
                    if (days < 1) {
                        message.channel.send('Insufficient amount of days.')
                        return
                    }
                    if (days > 7) {
                        message.channel.send('Too many days.')
                        return
                    }
                } else {
                    message.channel.send('Days must be a number.')
                    return
                }
            }
            if (!reason) {
                message.channel.send('Please enter a reason between *double* quotation marks.')
                return
            }
            roblox.getIdFromUsername(username)
                .then(id => {
                    roblox.getRankInGroup(groupId, id)
                        .then(rank => {
                            if (rank < 200 && rank != 99 && rank != 103) {
                                if (rank == 2) {
                                    message.channel.send(getEmbed(command, `**${username}** is already suspended.`))
                                } else {
                                    t.get(`/1/lists/${currentSuspensionsListID}/cards`, {}, (err, data) => {
                                        if (err) {
                                            console.log(err.message)
                                            message.channel.send('Try again!')
                                        } else {
                                            var suspended = false
                                            for (var i in data) {
                                                if (data[i].name == '' + id) {
                                                    suspended = true
                                                    break
                                                }
                                            }
                                            if (suspended == true) {
                                                message.channel.send(getEmbed(command, `**${username}** is already suspended.`))
                                            } else {
                                                roblox.getIdFromUsername(byusername)
                                                    .then(byid => {
                                                        if (!admin_logschannel) {
                                                            message.channel.send('Couldn\'t find admin_logs channel.')
                                                        } else {
                                                            desc = {
                                                                rank: rank,
                                                                rankback: rankback,
                                                                duration: days * 86400,
                                                                by: byid,
                                                                reason: reason,
                                                                at: getUnix(),
                                                            }
                                                            t.post('/1/cards', {
                                                                idList: currentSuspensionsListID,
                                                                name: String(id),
                                                                desc: JSON.stringify(desc),
                                                            }, err => {
                                                                if (err) {
                                                                    message.channel.send(getEmbed(command, `Error trying to suspend **${username}**.`))
                                                                } else {
                                                                    if (days > 1 || days < -1) {
                                                                        admin_logschannel.send(`**${username}** was suspended by **${byusername}** for **${days}** days with reason "*${reason}*"`)
                                                                    } else {
                                                                        admin_logschannel.send(`**${username}** was suspended by **${byusername}** for **${days}** day with reason "*${reason}*"`)
                                                                    }
                                                                    message.channel.send(getEmbed(command, `Successfully suspended **${username}**.`))
                                                                    if (rank >= 1) {
                                                                        roblox.setRank(groupId, id, 2)
                                                                            .then(newRole => {
                                                                                var member = getMemberByName(username, guild)
                                                                                if (member) {
                                                                                    checkRole(guild, member, 2)
                                                                                }
                                                                            }).catch(err => {
                                                                            console.log(err)
                                                                            message.channel.send(`Error setting rank of **${username}** to **Suspended**, but suspended anyways.`)
                                                                        })
                                                                    }
                                                                }
                                                            })
                                                        }
                                                    }).catch(() => message.channel.send(getEmbed(command, `Sorry, but **${byusername}** doesn't exist on Roblox.`)))
                                            }
                                        }
                                    })
                                }
                            } else {
                                message.channel.send(getEmbed(command, `**${username}** is rank **${rank}** and not suspendable.`))
                            }
                        }).catch(() => message.channel.send('Couldn\'t get user in the group.'))
                }).catch(() => message.channel.send(getEmbed(command, `Sorry, but **${username}** doesn't exist on Roblox.`)))
        } else {
            message.channel.send('Insufficient powers!')
        }
        return
    }
    if (isCommand('unix', message) || isCommand('epoch', message)) {
        message.channel.send(getEmbed(command, getUnix()))
        return
    }
    if (isCommand('cmds', message) || isCommand('commands', message) || isCommand('help', message)) {
        cmdsEmbeds.forEach(embed => {
            DMmember(member, embed.setTimestamp())
                .catch(() => message.channel.send('Couldn\'t DM user.'))
        })
        return
    }
    if (isCommand('activities', message) || isCommand('statuses', message)) {
        message.channel.send(getEmbed('Activities', activitiesString))
        return
    }
    if (isCommand('joindate', message) || isCommand('age', message)) {
        logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel)
        message.channel.send('That command is currently disabled!')
        /* roblox.getIdFromUsername(username)
        .then(id => {
            if (!joindatecache[id]) {
                var url = `https://www.roblox.com/users/${id}/profile`;
                request(url, (error, response, html) => {
                    if (!error) {
                        var found = false;
                        var $ = cheerio.load(html);
                        $('.profile-stats-container').filter(() => {
                            found = true;
                            var data = $(this);
                            var joindate = data.children().first().children().last().text();
                            console.log(joindate);
                            joindatecache[id] = joindate;
                            if (isCommand('joindate', message)) {
                                message.channel.send(getEmbed(command, `**${username}** joined Roblox on **${joindate}**.`));
                            } else {
                                var agedays = getAgeDays(joindate);
                                var who = getPossessionName(username);
                                message.channel.send(getEmbed(command, `${who} Roblox account is **${agedays}** old.`));
                            }
                        });
                        if (found == false) {
                            var who = getPossessionName(username);
                            message.channel.send(getEmbed(command, `Looks like ${who} account is terminated!`));
                        }
                    } else {
                        message.channel.send("Error finding player's profile.")
                    }
                });
            } else {
                if (isCommand('joindate', message)) {
                    message.channel.send(getEmbed(command, `**${username}** joined Roblox on **${joindatecache[id]}**.`));
                } else {
                    var joindate = joindatecache[id];
                    var agedays = getAgeDays(joindate);
                    var who = getPossessionName(username);
                    message.channel.send(getEmbed(command, `${who} Roblox account is **${agedays}** old.`));
                }
            }
        }).catch(() => message.channel.send(getEmbed(command, `Sorry, but **${username}** doesn't exist on Roblox.`))); */
        return
    }
    if (isCommand('playerurl', message) || isCommand('userurl', message) || isCommand('url', message)) {
        roblox.getIdFromUsername(username)
            .then(id => message.channel.send(`https://www.roblox.com/users/${id}/profile`))
            .catch(() => message.channel.send(getEmbed(command, `Sorry, but **${username}** doesn't exist on Roblox.`)))
        return
    }
    if (isCommand('ttdt', message) || isCommand('theoretical', message)) {
        message.channel.send('<https://www.roblox.com/games/528038240/Theoretical-Train-Driver-Test-II>	- Theoretical Train Driver Test II')
        return
    }
    if (isCommand('ptdt', message) || isCommand('pracical', message)) {
        message.channel.send('<https://www.roblox.com/games/496933015/Practical-Train-Driver-Test-II> - Practical Train Driver Test II')
        return
    }
    if (isCommand('trello', message)) {
        message.channel.send('<https://trello.com/b/PDkRNR6G/project-railrunner-dev-board> - Trello Dev Board')
        return
    }
    if (isCommand('uw', message) || isCommand('updatesworkplace', message)) {
        if (isAdmin(member)) {
            logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel)
            message.channel.send('<https://www.roblox.com/games/149045435/UTASD-Updates-Workplace> - Updates Workplace')
        } else {
            message.channel.send('Insufficient powers!')
        }
        return
    }
    if (isCommand('isindiscord', message)) {
        if (isAdmin(member)) {
            logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel)
            if (args[1]) {
                roblox.getIdFromUsername(username)
                    .then(id => {
                        var member = getMemberByName(username, guild)
                        if (member) {
                            var name = member.nickname || member.user.username
                            message.channel.send(compileRichEmbed([{
                                title: command,
                                message: `Yes, **${name}** is in this server`,
                            }]))
                        } else {
                            message.channel.send(compileRichEmbed([{
                                title: command,
                                message: `No, **${username}** is not in this server.`,
                            }]))
                        }
                    }).catch(() => message.channel.send(getEmbed(command, `Sorry, but **${args[1]}** doesn't exist on Roblox.`)))
            } else {
                message.channel.send('Please enter a username.')
            }
        } else {
            message.channel.send('Insufficient powers!')
        }
        return
    }
    if (isCommand('pban', message)) {
        if (isAdmin(member)) {
            logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel)
            var username = args[1]
            var byusername = member.nickname || message.author.username
            var reason = extractText(message.content, '"')
            if (!username) {
                message.channel.send('Please enter a username.')
                return
            }
            if (!reason) {
                message.channel.send('Please enter a reason between *double* quotation marks.')
                return
            }
            roblox.getIdFromUsername(username)
                .then(id => {
                    roblox.getRankInGroup(groupId, id)
                        .then(rank => {
                            if (rank < 200 && rank != 103 && rank != 99) {
                                t.get(`/1/lists/${bannedListID}/cards`, {}, (err, data) => {
                                    if (err) {
                                        console.log(err.message)
                                        message.channel.send('Try again!')
                                    } else {
                                        var pbanned = false
                                        for (var i in data) {
                                            if (data[i].name == '' + id) {
                                                pbanned = true
                                                break
                                            }
                                        }
                                        if (pbanned == true) {
                                            message.channel.send(getEmbed(command, `**${username}** is already pbanned.`))
                                        } else {
                                            roblox.getIdFromUsername(byusername)
                                                .then(byid => {
                                                    if (!admin_logschannel) {
                                                        message.channel.send('Couldn\'t find admin_logs channel.')
                                                    } else {
                                                        desc = {
                                                            rank: rank,
                                                            reason: reason,
                                                            by: byid,
                                                            at: getUnix(),
                                                        }
                                                        t.post('/1/cards', {
                                                            idList: bannedListID,
                                                            name: String(id),
                                                            desc: JSON.stringify(desc),
                                                        }, err => {
                                                            if (err) {
                                                                message.channel.send(getEmbed(command, `Error trying to pban **${username}**.`))
                                                            } else {
                                                                admin_logschannel.send(`**${username}** was pbanned by **${byusername}** with reason: "*${reason}*"`)
                                                                message.channel.send(getEmbed(command, `Successfully pbanned **${username}**.`))
                                                            }
                                                        })
                                                    }
                                                }).catch(() => message.channel.send(getEmbed(command, `Sorry, but **${byusername}** doesn't exist on Roblox.`)))
                                        }
                                    }
                                })
                            } else {
                                message.channel.send(getEmbed(command, `**${username}** is rank **${rank}** and not pbannable.`))
                            }
                        }).catch(() => message.channel.send('Couldn\'t get user in the group.'))
                }).catch(() => message.channel.send(getEmbed(command, `Sorry, but **${username}** doesn't exist on Roblox.`)))
        } else {
            message.channel.send('Insufficient powers!')
        }
        return
    }
    if (isCommand('docs', message) || isCommand('hrdocs', message)) {
        if (isAdmin(member)) {
            logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel)
            if (message.channel == hrchannel) {
                message.channel.send(`<${process.env.TP_DOC}> - Training Protocols`)
                message.channel.send(`<${process.env.TL_DOC}g> - Training Logs`)
                message.channel.send(`<${process.env.MS_DOC}> - Malicious Spreadsheets`)
            } else {
                message.channel.send('Wrong channel!')
            }
        } else {
            message.channel.send('Insufficient powers!')
        }
        return
    }
    if (isCommand('traininglogs', message) || isCommand('tl', message)) {
        if (isAdmin(member)) {
            logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel)
            if (message.channel == hrchannel) {
                message.channel.send(`<${process.env._TL_DOC}> - Training Logs`)
            } else {
                message.channel.send('Wrong channel!')
            }
        } else {
            message.channel.send('Insufficient powers!')
        }
        return
    }
    if (isCommand('maliciousspreadsheets', message) || isCommand('ms', message)) {
        if (isAdmin(member)) {
            logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel)
            if (message.channel == hrchannel) {
                message.channel.send(`<${process.env.MS_DOC}> - Malicious Spreadsheets`)
            } else {
                message.channel.send('Wrong channel!')
            }
        } else {
            message.channel.send('Insufficient powers!')
        }
        return
    }
    if (isCommand('trainingprotocols', message) || isCommand('tp', message)) {
        if (isAdmin(member)) {
            logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel)
            if (message.channel == hrchannel) {
                message.channel.send(`<${process.env.TP_DOC}> - Training Protocols`)
            } else {
                message.channel.send('Wrong channel!')
            }
        } else {
            message.channel.send('Insufficient powers!')
        }
        return
    }
    if (isCommand('reason', message) || isCommand('suspendinfo', message)) {
        logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel)
        var byusername = member.nickname || message.author.username
        if (username) {
            if (username != byusername) {
                if (!isAdmin(member)) {
                    message.channel.send('Insufficient powers!')
                    return
                }
            }
            roblox.getIdFromUsername(username)
                .then(id => {
                    roblox.getRankInGroup(groupId, id)
                        .then(rank => {
                            if (rank == 0 || rank == 2) {
                                t.get(`/1/lists/${currentSuspensionsListID}/cards`, {}, (err, data) => {
                                    if (err) {
                                        console.log(err.message)
                                        message.channel.send('Try again!')
                                    } else {
                                        var found = false
                                        for (var i in data) {
                                            if (data[i].name == String(id)) {
                                                found = true
                                                var desc = JSON.parse(data[i].desc)
                                                var duration
                                                if (desc.duration / 86400 == 1) {
                                                    duration = desc.duration / 86400 + ' day'
                                                } else {
                                                    duration = desc.duration / 86400 + ' days'
                                                }
                                                if (username == byusername) {
                                                    message.channel.send(compileRichEmbed([{
                                                        title: 'You\'re suspended for',
                                                        message: duration,
                                                    }, {title: 'Reason', message: `*"${desc.reason}"*`}]))
                                                } else {
                                                    message.channel.send(compileRichEmbed([{
                                                        title: `${username} is suspended for`,
                                                        message: duration,
                                                    }, {title: 'Reason', message: `*"${desc.reason}"*`}]))
                                                }
                                                break
                                            }
                                        }
                                        if (!found) {
                                            message.channel.send('Couldn\'t find suspension!')
                                        }
                                    }
                                })
                            } else {
                                if (username == byusername) {
                                    message.channel.send(`You're rank **${rank}** and not suspended!`)
                                } else {
                                    message.channel.send(`**${username}** is rank **${rank}** and not suspended!`)
                                }
                            }
                        }).catch(() => message.channel.send('Couldn\'t get user in the group.'))
                }).catch(() => message.channel.send(getEmbed(command, `Sorry, but **${username}** doesn't exist on Roblox.`)))
        } else {
            message.channel.send('Please enter a username.')
        }
        return
    }
    if (isCommand('shout', message)) {
        if (isAdmin(member)) {
            logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel)
            var byusername = member.nickname || message.author.username
            if (args[1] && args[1].toLowerCase() == 'clear') {
                roblox.shout(groupId)
                    .then(() => {
                        message.channel.send('Successfully cleared shout.')
                        admin_logschannel.send(`**${byusername}** cleared the group shout.`)
                    }).catch(err => {
                    message.channel.send('Couldn\'t clear shout.')
                    console.log(err.message)
                })
                return
            }
            var content = extractText(message.content, '"')
            if (!content) {
                message.channel.send('Please enter a shout between *double* quotation marks.')
                return
            }
            if (content.length + 2 + byusername.length > 255) {
                message.channel.send('Can\'t post shout, it\'s too long.')
            } else {
                roblox.shout(groupId, content + ' ~' + byusername)
                    .then(() => {
                        message.channel.send(compileRichEmbed([{title: 'Successfully shouted', message: content}]))
                        admin_logschannel.send(`**${byusername}** posted *"${content}"* to group shout.`)
                    }).catch(err => {
                    message.channel.send('Couldn\'t post shout.')
                    console.log(err.message)
                })
            }
        } else {
            message.channel.send('Insufficient  powers!')
        }
        return
    }
    if (isCommand('getshout', message) || isCommand('groupshout', message)) {
        logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel)
        roblox.getShout(groupId)
            .then(shout => {
                if (shout) {
                    message.channel.send(compileRichEmbed([{
                        title: `Current shout by ${shout.author.name}`,
                        message: shout.message,
                    }], {timestamp: shout.date}))
                } else {
                    message.channel.send('There currently is no shout.')
                }
            }).catch(err => {
            message.channel.send('Couldn\'t fetch shout.')
            console.log(err.message)
        })
        return
    }
    if (isCommand('suggest', message)) {
        logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel)
        var byusername = member.nickname || message.author.username
        var suggestion = extractText(message.content, '"')
        if (!suggestion) {
            message.channel.send('Please enter a suggestion between *double* quotation marks.')
            return
        }
        message.channel.send(compileRichEmbed([{title: 'Successfully suggested', message: `*"${suggestion}"*`}]))
        suggestionschannel.send(compileRichEmbed([{
            title: `**${byusername}** suggested`,
            message: `*"${suggestion}"*`,
        }]).setFooter('Vote using the reactions!'))
            .then(message => {
                message.react('✔')
                    .then(() => message.react('✖'))
                    .catch(() => {
                    })
            }).catch(err => console.log(err.message))
        return
    }
    if (isCommand('activity', message) || isCommand('status', message)) {
        if (isAdmin(member)) {
            logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel)
            if (args[1] && parseInt(args[1])) {
                var activity = parseInt(args[1]) - 1
                if (activities[activity]) {
                    var status = setActivity(activity)
                    message.channel.send(getEmbed('**Successfully set activity to**', status))
                } else {
                    message.channel.send('No action with that number exists.')
                }
            } else {
                var status = setActivity(getRandomInt(activities.length, currentActivityNumber))
                message.channel.send(getEmbed('**Successfully set activity to**', status))
            }
        } else {
            message.channel.send('Insufficient powers!')
        }
        return
    }
    if (isCommand('update', message)) {
        logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel)
        var byusername = member.nickname || message.author.username
        if (args[1] && !isAdmin(member) && username != byusername) {
            message.channel.send('Insufficient powers!')
            return
        }
        var member = getMemberByName(username, guild)
        if (member) {
            roblox.getIdFromUsername(username)
                .then(id => {
                    roblox.getRankInGroup(groupId, id)
                        .then(rank => {
                            if (rank == 2) {
                                checkRole(guild, member, 2)
                                message.channel.send(`Successfully checked ${getPossessionName(username)} roles.`)
                            } else {
                                isSuspended(username)
                                    .then(suspended => {
                                        if (suspended) {
                                            checkRole(guild, member, 2)
                                            message.channel.send(`Successfully checked ${getPossessionName(username)} roles.`)
                                        } else {
                                            checkRole(guild, member, rank)
                                            message.channel.send(`Successfully checked ${getPossessionName(username)} roles.`)
                                        }
                                    }).catch(() => message.channel.send(`Error while checking if **${username}** is suspended.`))
                            }
                        }).catch(err => message.channel.send(`Couldn't get ${getPossessionName(username)} rank.`))
                }).catch(err => message.channel.send(`Username **${username}** does not exist on Roblox.`))
        } else {
            message.channel.send(`**${username}** is not in this server.`)
        }
        return
    }
    if (isCommand('suggestqotd', message)) {
        logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel)
        var byusername = member.nickname || message.author.username
        var qotd = extractText(message.content, '"')
        if (!qotd) {
            message.channel.send('Please enter a QOTD suggestion between *double* quotation marks.')
            return
        }
        t.post('/1/cards', {idList: suggestedQOTDsListID, name: qotd, desc: byusername}, err => {
            if (!err) {
                message.channel.send(compileRichEmbed([{
                    title: 'Successfully suggested QOTD',
                    message: `"*${qotd}*"`,
                }]))
            } else {
                message.channel.send('Couldn\'t add QOTD suggestion to the Trello board.')
            }
        })
        return
    }
    if (isCommand('host', message) || isCommand('hosttraining', message)) {
        if (isAdmin(member)) {
            logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel)
            var byusername = member.nickname || message.author.username
            var type = args[1]
            var dateString = args[2]
            var timeString = args[3]
            var specialnotes = extractText(message.content, '"')
            var role = getRoleByAbbreviation(type)
            if (!role) {
                message.channel.send('Please enter a valid type of training.')
                return
            }
            if (!dateString) {
                message.channel.send('Please give a date for your training.')
                return
            } else if (!validDate(dateString)) {
                message.channel.send('Please give a valid date for your training.')
                return
            }
            if (!timeString) {
                message.channel.send('Please give a time for your training.')
                return
            } else if (!validTime(timeString)) {
                message.channel.send('Please give a valid time for your training.')
                return
            }
            var dateInfo = getDateInfo(dateString)
            var timeInfo = getTimeInfo(timeString)
            var dateUnix = getUnix(new Date(dateInfo.year, dateInfo.month - 1, dateInfo.day, timeInfo.hours, timeInfo.minutes))
            var nowUnix = getUnix()
            var afterNow = dateUnix - nowUnix > 0
            if (!afterNow) {
                message.channel.send('Please give a date and time that\'s after now.')
                return
            }
            var trainingData = {
                by: byusername,
                type: type,
                at: getUnix(),
                date: dateUnix,
            }
            if (specialnotes) {
                trainingData.specialnotes = specialnotes
            }
            var cardsNum = await getCardsNumOnBoard(trainingSchedulerBoardID)
            if (cardsNum || cardsNum == 0) {
                t.post('/1/cards', {
                    name: String(cardsNum + 1),
                    idList: scheduledTrainingsListID,
                    desc: JSON.stringify(trainingData),
                }, err => {
                    if (!err) {
                        message.channel.send(compileRichEmbed([{
                            title: 'Successfully hosted',
                            message: `**${role}** training on **${dateString}** at **${timeString}**.`,
                        }, {title: 'Training ID:', message: String(cardsNum + 1)}]))
                    } else {
                        message.channel.send('Couldn\'t post training to Trello.')
                    }
                })
            } else {
                message.channel.send('Couldn\'t make training ID.')
            }
        } else {
            message.channel.send('Insufficient powers!')
        }
        return
    }
    if (isCommand('trainings', message) || isCommand('traininginfo', message) || isCommand('training', message) || isCommand('traininglist', message)) {
        logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel)
        t.get(`/1/lists/${scheduledTrainingsListID}/cards`, {}, (err, data) => {
            if (!err) {
                var id = parseInt(args[1])
                var embed
                if (data.length > 0) {
                    if (!id) {
                        embed = compileRichEmbed()
                    }
                } else {
                    message.channel.send('There are currently no hosted trainings.')
                    return
                }
                var found = false
                var string
                for (var i in data) {
                    if (id) {
                        id = String(id)
                        if (data[i].name == id) {
                            found = true
                            embed = compileRichEmbed([{
                                title: `Training ID: ${id}`,
                                message: getTrainingSentence(JSON.parse(data[i].desc)),
                            }])
                            break
                        }
                    } else {
                        if (!string) {
                            string = `${data[i].name}. ` + getTrainingSentence(JSON.parse(data[i].desc))
                        } else {
                            var newString = `${data[i].name}. ` + getTrainingSentence(JSON.parse(data[i].desc))
                            if (string.length + newString.length > 1024) {
                                embed = compileRichEmbed([{
                                    title: `Upcoming trainings ${embed.fields.length + 1}`,
                                    message: string,
                                }], {original: embed})
                                string = null
                            } else {
                                string = string + `\n${newString}`
                            }
                        }
                    }
                }
                if (string) {
                    embed = compileRichEmbed([{
                        title: `Upcoming trainings ${embed.fields.length + 1}`,
                        message: string,
                    }], {original: embed})
                    string = null
                }
                if (id && !found) {
                    message.channel.send(`Couldn't find info for Training ID **${id}**.`)
                }
                if (embed) {
                    if (!id) {
                        DMmember(member, embed)
                            .catch(() => message.channel.send('Couldn\'t DM user.'))
                    } else {
                        message.channel.send(embed)
                    }
                }
            } else {
                message.channel.send('Couldn\'t get hosted trainings.')
            }
        })
        return
    }
    if (isCommand('cancel', message) || isCommand('change', message)) {
        message.channel.send(`This is not a command, please specify if you want to ${command} a **training** or a **suspension**.`)
        return
    }
    if (isCommand('canceltraining', message)) {
        if (isAdmin(member)) {
            logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel)
            var id = parseInt(args[1])
            if (id) {
                var reason = extractText(message.content, '"')
                if (!reason) {
                    message.channel.send('Please enter a reason between *double* quotation marks.')
                    return
                }
                getCardInList(id, scheduledTrainingsListID)
                    .then(card => {
                        if (card) {
                            var byusername = member.nickname || message.author.username
                            var trainingData = JSON.parse(card.desc)
                            trainingData.cancelled = {
                                by: byusername,
                                at: getUnix(),
                                reason: reason,
                            }
                            t.put(`/1/cards/${card.id}`, {
                                idList: cancelledTrainingsListID,
                                desc: JSON.stringify(trainingData),
                            }, err => {
                                if (!err) {
                                    message.channel.send(`Successfully cancelled Training ID **${id}** with reason: "*${reason}*"`)
                                } else {
                                    message.channel.send(`Couldn't cancel Training ID **${id}**.`)
                                }
                            })
                        } else {
                            message.channel.send(`Couldn't find training with ID **${id}**.`)
                        }
                    }).catch(() => message.channel.send(`Error finding card for Training ID **${id}**.`))
            } else {
                message.channel.send('Please enter a Training ID.')
            }
        } else {
            message.channel.send('Insufficient powers!')
        }
        return
    }
    if (isCommand('announce', message) || isCommand('announcetraining', message)) {
        if (isAdmin(member)) {
            logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel)
            var id = parseInt(args[1])
            if (id) {
                getCardInList(id, scheduledTrainingsListID)
                    .then(card => {
                        if (card) {
                            var byusername = member.nickname || message.author.username
                            var trainingData = JSON.parse(card.desc)
                            announceDiscord(getDiscordTrainingAnnouncement(trainingData, guild), trainingschannel)
                                .then(content => message.channel.send(compileRichEmbed([{
                                    title: 'Successfully announced',
                                    message: content,
                                }])))
                                .catch(err => {
                                    message.channel.send('Couldn\'t post announcement.')
                                    console.log(err.message)
                                })
                            announceRoblox(defaultTrainingShout)
                                .then(content => {
                                    message.channel.send(compileRichEmbed([{
                                        title: 'Successfully shouted',
                                        message: content,
                                    }]))
                                    admin_logschannel.send(`**${byusername}** posted *"${content}"* to group shout.`)
                                }).catch(err => {
                                message.channel.send('Couldn\'t post shout.')
                                console.log(err.message)
                            })
                        } else {
                            message.channel.send(`Couldn't find training with ID **${id}**.`)
                        }
                    }).catch(() => message.channel.send(`Error finding card for Training ID **${id}**.`))
            } else {
                message.channel.send('Please enter a Training ID.')
            }
        } else {
            message.channel.send('Insufficient powers!')
        }
        return
    }
    if (isCommand('announcediscord', message)) {
        if (isAdmin(member)) {
            logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel)
            var id = parseInt(args[1])
            if (id) {
                getCardInList(id, '5a52b61fec92437fecc1e7b1')
                    .then(card => {
                        if (card) {
                            var trainingData = JSON.parse(card.desc)
                            announceDiscord(getDiscordTrainingAnnouncement(trainingData, guild), trainingschannel)
                                .then(content => message.channel.send(compileRichEmbed([{
                                    title: 'Successfully announced',
                                    message: content,
                                }])))
                                .catch(err => {
                                    message.channel.send('Couldn\'t post announcement.')
                                    console.log(err.message)
                                })
                        } else {
                            message.channel.send(`Couldn't find training with ID **${id}**.`)
                        }
                    }).catch(() => message.channel.send(`Error finding card for Training ID **${id}**.`))
            } else {
                message.channel.send('Please enter a Training ID.')
            }
        } else {
            message.channel.send('Insufficient powers!')
        }
        return
    }
    if (isCommand('announceroblox', message)) {
        if (isAdmin(member)) {
            logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel)
            var id = parseInt(args[1])
            if (id) {
                getCardInList(id, scheduledTrainingsListID)
                    .then(card => {
                        if (card) {
                            var byusername = member.nickname || message.author.username
                            announceRoblox(defaultTrainingShout)
                                .then(content => {
                                    message.channel.send(compileRichEmbed([{
                                        title: 'Successfully shouted',
                                        message: content,
                                    }]))
                                    admin_logschannel.send(`**${byusername}** posted *"${content}"* to group shout.`)
                                }).catch(err => {
                                message.channel.send('Couldn\'t post shout.')
                                console.log(err.message)
                            })
                        } else {
                            message.channel.send(`Couldn't find training with ID **${id}**.`)
                        }
                    }).catch(() => message.channel.send(`Error finding card for Training ID **${id}**.`))
            } else {
                message.channel.send('Please enter a Training ID.')
            }
        } else {
            message.channel.send('Insufficient powers!')
        }
        return
    }
    if (isCommand('exampleannouncement', message)) {
        if (isAdmin(member)) {
            logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel)
            var id = parseInt(args[1])
            if (id) {
                getCardInList(id, scheduledTrainingsListID)
                    .then(card => {
                        if (card) {
                            var trainingData = JSON.parse(card.desc)
                            message.channel.send(compileRichEmbed([{
                                title: `Announcement for Training ID ${id}`,
                                message: getDiscordTrainingAnnouncement(trainingData, guild),
                            }])
                                .setFooter('Please note: Copying and pasting the announcement does NOT copy the layout.'))
                        } else {
                            message.channel.send(`Couldn't find training with ID **${id}**.`)
                        }
                    }).catch(() => message.channel.send(`Error finding card for Training ID **${id}**.`))
            } else {
                message.channel.send('Please enter a Training ID.')
            }
        } else {
            message.channel.send('Insufficient powers!')
        }
        return
    }
    if (isCommand('exampleshout', message)) {
        if (isAdmin(member)) {
            logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel)
            var id = parseInt(args[1])
            if (id) {
                getCardInList(id, scheduledTrainingsListID)
                    .then(card => {
                        if (card) {
                            message.channel.send(compileRichEmbed([{
                                title: `Shout for Training ID ${id}`,
                                message: defaultTrainingShout,
                            }]))
                        } else {
                            message.channel.send(`Couldn't find training with ID **${id}**.`)
                        }
                    }).catch(() => message.channel.send(`Error finding card for Training ID **${id}**.`))
            } else {
                message.channel.send('Please enter a Training ID.')
            }
        } else {
            message.channel.send('Insufficient powers!')
        }
        return
    }
    if (isCommand('changetraining', message)) {
        if (isAdmin(member)) {
            logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel)
            var byUsername = member.nickname || message.author.username
            var id = parseInt(args[1])
            if (id) {
                var key = args[2]
                if (key && key.indexOf(':') != -1) {
                    key = key.substring(0, key.indexOf(':')).toLowerCase()
                    var changeData = message.content.substring(message.content.indexOf(':') + 1, message.content.length)
                    if (key == 'type' || key == 'date' || key == 'time' || key == 'specialnotes' || key == 'by') {
                        getCardInList(id, scheduledTrainingsListID)
                            .then(card => {
                                if (card) {
                                    var trainingData = JSON.parse(card.desc)
                                    if (trainingData.by == byUsername) {
                                        if (key == 'type') {
                                            if (getRoleByAbbreviation(changeData.toLowerCase())) {
                                                trainingData.type = changeData.toLowerCase()
                                                t.put(`/1/cards/${card.id}`, {desc: JSON.stringify(trainingData)}, err => {
                                                    if (!err) {
                                                        message.channel.send(`Successfully changed Training ID **${id}**'s type to **${changeData.toUpperCase()}**.`)
                                                    } else {
                                                        message.channel.send(`Couldn't change Training ID **${id}**'s type to **${changeData.toUpperCase()}**.`)
                                                    }
                                                })
                                            } else {
                                                message.channel.send(`Role abbreviaton **${changeData}** does not exist.`)
                                            }
                                        } else if (key == 'specialnotes') {
                                            var specialnotes = extractText(changeData, '"')
                                            if (specialnotes) {
                                                trainingData.specialnotes = specialnotes
                                                t.put(`/1/cards/${card.id}`, {desc: JSON.stringify(trainingData)}, err => {
                                                    if (!err) {
                                                        message.channel.send(`Successfully changed Training ID **${id}**'s specialnotes to "*${specialnotes}*".`)
                                                    } else {
                                                        message.channel.send(`Couldn't change Training ID **${id}**'s specialnotes to "*${specialnotes}*.`)
                                                    }
                                                })
                                            } else {
                                                message.channel.send('Please enter new specialnotes between *double* quotation marks.')
                                            }
                                        } else if (key == 'date') {
                                            if (validDate(changeData)) {
                                                var unix = trainingData.date * 1000
                                                var timeInfo = getTimeInfo(getTime(unix))
                                                var dateInfo = getDateInfo(changeData)
                                                var dateUnix = getUnix(new Date(dateInfo.year, dateInfo.month - 1, dateInfo.day, timeInfo.hours, timeInfo.minutes))
                                                trainingData.date = dateUnix
                                                t.put(`/1/cards/${card.id}`, {desc: JSON.stringify(trainingData)}, err => {
                                                    if (!err) {
                                                        message.channel.send(`Successfully changed Training ID **${id}**'s date to **${changeData}**.`)
                                                    } else {
                                                        message.channel.send(`Couldn't change Training ID **${id}**'s date to **${changeData}**.`)
                                                    }
                                                })
                                            } else {
                                                message.channel.send('Please enter a valid date.')
                                            }
                                        } else if (key == 'time') {
                                            if (validTime(changeData)) {
                                                var unix = trainingData.date * 1000
                                                var dateInfo = getDateInfo(getDate(unix))
                                                var timeInfo = getTimeInfo(changeData)
                                                var dateUnix = getUnix(new Date(dateInfo.year, dateInfo.month - 1, dateInfo.day, timeInfo.hours, timeInfo.minutes))
                                                trainingData.date = dateUnix
                                                t.put(`/1/cards/${card.id}`, {desc: JSON.stringify(trainingData)}, err => {
                                                    if (!err) {
                                                        message.channel.send(`Successfully changed Training ID **${id}**'s time to **${changeData}**.`)
                                                    } else {
                                                        message.channel.send(`Couldn't change Training ID **${id}**'s time to **${changeData}**.`)
                                                    }
                                                })
                                            } else {
                                                message.channel.send('Please enter a valid time.')
                                            }
                                        } else if (key == 'by') {
                                            roblox.getIdFromUsername(changeData)
                                                .then(userId => {
                                                    roblox.getRankInGroup(groupId, userId)
                                                        .then(rank => {
                                                            if (rank > 200) {
                                                                trainingData.by = changeData
                                                                t.put(`/1/cards/${card.id}`, {desc: JSON.stringify(trainingData)}, err => {
                                                                    if (!err) {
                                                                        message.channel.send(`Successfully changed Training ID **${id}**'s host to **${changeData}**.`)
                                                                    } else {
                                                                        message.channel.send(`Couldn't change Training ID **${id}**'s host to **${changeData}**.`)
                                                                    }
                                                                })
                                                            } else {
                                                                message.channel.send(`${getPossessionName(changeData)} rank is too low.`)
                                                            }
                                                        }).catch(() => message.channel.send(`Couldn't get ${getPossessionName(changeData)} rank.`))
                                                }).catch(() => message.channel.send(getEmbed(command, `Sorry, but **${changeData}** doesn't exist on Roblox.`)))
                                        }
                                    } else {
                                        message.channel.send('You can only change your own trainings.')
                                    }
                                } else {
                                    message.channel.send(`Couldn't find training with ID **${id}**.`)
                                }
                            }).catch(() => message.channel.send(`Error finding card for Training ID **${id}**.`))
                    } else {
                        message.channel.send('That key is not valid.')
                    }
                } else {
                    message.channel.send('Please give the key you want to change.')
                }
            } else {
                message.channel.send('Please enter a Training ID.')
            }
        } else {
            message.channel.send('Insufficient powers!')
        }
        return
    }
    if (isCommand('finish', message) || isCommand('finishtraining', message)) {
        if (isAdmin(member)) {
            logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel)
            var id = parseInt(args[1])
            if (id) {
                getCardInList(id, scheduledTrainingsListID)
                    .then(card => {
                        if (card) {
                            var byusername = member.nickname || message.author.username
                            var trainingData = JSON.parse(card.desc)
                            trainingData.finished = {
                                by: byusername,
                                at: getUnix(),
                            }
                            t.put(`/1/cards/${card.id}`, {
                                idList: finishedTrainingsListID,
                                desc: JSON.stringify(trainingData),
                            }, err => {
                                if (!err) {
                                    message.channel.send(`Successfully finished Training ID **${id}**.`)
                                } else {
                                    message.channel.send(`Couldn't finish Training ID **${id}**.`)
                                }
                            })
                        } else {
                            message.channel.send(`Couldn't find training with ID **${id}**.`)
                        }
                    }).catch(() => message.channel.send(`Error finding card for Training ID **${id}**.`))
            } else {
                message.channel.send('Please enter a Training ID.')
            }
        } else {
            message.channel.send('Insufficient powers!')
        }
        return
    }
    if (isCommand('cancelsuspension', message)) {
        if (isAdmin(member)) {
            logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel)
            var username = args[1]
            var byusername = member.nickname || message.author.username
            var reason = extractText(message.content, '"')
            if (!username) {
                message.channel.send('Please enter a username.')
                return
            }
            if (!reason) {
                message.channel.send('Please enter a reason between *double* quotation marks.')
                return
            }
            roblox.getIdFromUsername(username)
                .then(id => {
                    roblox.getIdFromUsername(byusername)
                        .then(byId => {
                            getCardInList(id, currentSuspensionsListID)
                                .then(card => {
                                    suspensionData = JSON.parse(card.desc)
                                    suspensionData.cancelled = {
                                        by: byId,
                                        at: getUnix(),
                                        reason: reason,
                                    }
                                    t.put(`/1/cards/${card.id}`, {
                                        idList: doneSuspensionsListID,
                                        desc: JSON.stringify(suspensionData),
                                    }, err => {
                                        if (!err) {
                                            message.channel.send(`Successfully cancelled **${username}**'s suspension.`)
                                        } else {
                                            message.channel.send(`Couldn't cancel **${username}**'s suspension.`)
                                        }
                                    })
                                }).catch(() => message.channel.send(`Couldn't find suspension of **${username}**.`))
                        }).catch(() => message.channel.send(getEmbed(command, `Sorry, but **${byusername}** doesn't exist on Roblox.`)))
                }).catch(() => message.channel.send(getEmbed(command, `Sorry, but **${username}** doesn't exist on Roblox.`)))
        } else {
            message.channel.send('Insufficient powers!')
        }
        return
    }
    if (isCommand('extend', message) || isCommand('extendsuspension', message)) {
        if (isAdmin(member)) {
            logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel)
            var username = args[1]
            var byusername = member.nickname || message.author.username
            var reason = extractText(message.content, '"')
            if (!username) {
                message.channel.send('Please enter a username.')
                return
            }
            if (!reason) {
                message.channel.send('Please enter a reason between *double* quotation marks.')
                return
            }
            roblox.getIdFromUsername(username)
                .then(id => {
                    roblox.getIdFromUsername(byusername)
                        .then(byId => {
                            getCardInList(id, currentSuspensionsListID)
                                .then(card => {
                                    suspensionData = JSON.parse(card.desc)
                                    var days = suspensionData.duration / 86400
                                    if (!suspensionData.extended) {
                                        suspensionData.extended = []
                                    } else {
                                        suspensionData.extended.forEach(extension => {
                                            days += extension.duration / 86400
                                        })
                                    }
                                    var extension = parseFloat(args[2])
                                    if (extension) {
                                        extension = Math.round(extension)
                                        if (days + extension < 1) {
                                            message.channel.send('Insufficient amount of days!')
                                            return
                                        } else if (days + extension > 7) {
                                            message.channel.send('Too many days!')
                                            return
                                        }
                                        suspensionData.extended.push({
                                            by: byId,
                                            duration: extension * 86400,
                                            at: getUnix(),
                                            reason: reason,
                                        })
                                        t.put(`/1/cards/${card.id}`, {desc: JSON.stringify(suspensionData)}, err => {
                                            if (!err) {
                                                message.channel.send(`Successfully extended **${username}**'s suspension.`)
                                            } else {
                                                message.channel.send(`Couldn't extend **${username}**'s suspension.`)
                                            }
                                        })
                                    } else {
                                        message.channel.send('Please enter a number amount of days!')
                                    }
                                }).catch(() => message.channel.send(`Couldn't find suspension of **${username}**.`))
                        }).catch(() => message.channel.send(getEmbed(command, `Sorry, but **${byusername}** doesn't exist on Roblox.`)))
                }).catch(() => message.channel.send(getEmbed(command, `Sorry, but **${username}** doesn't exist on Roblox.`)))
        } else {
            message.channel.send('Insufficient powers!')
        }
        return
    }
    if (isCommand('changesuspension', message)) {
        if (isAdmin(member)) {
            logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel)
            var username = args[1]
            var byUsername = member.nickname || message.author.username
            if (username) {
                var key = args[2]
                if (key && key.indexOf(':') != -1) {
                    key = key.substring(0, key.indexOf(':')).toLowerCase()
                    var changeData = message.content.substring(message.content.indexOf(':') + 1, message.content.length)
                    if (key == 'by' || key == 'reason' || key == 'rankback') {
                        roblox.getIdFromUsername(username)
                            .then(userId => {
                                roblox.getIdFromUsername(byUsername)
                                    .then(byId => {
                                        getCardInList(userId, currentSuspensionsListID)
                                            .then(card => {
                                                if (card) {
                                                    var suspensionData = JSON.parse(card.desc)
                                                    if (suspensionData.by == byId) {
                                                        if (key == 'by') {
                                                            roblox.getIdFromUsername(changeData)
                                                                .then(newId => {
                                                                    roblox.getRankInGroup(groupId, newId)
                                                                        .then(rank => {
                                                                            if (rank > 200) {
                                                                                suspensionData.by = newId
                                                                                t.put(`/1/cards/${card.id}`, {desc: JSON.stringify(suspensionData)}, err => {
                                                                                    if (!err) {
                                                                                        message.channel.send(`Successfully changed ${getPossessionName(username)} suspension's suspender to **${changeData}**.`)
                                                                                    } else {
                                                                                        message.channel.send(`Couldn't change ${getPossessionName(username)} suspension's suspender to **${changeData}**.`)
                                                                                    }
                                                                                })
                                                                            } else {
                                                                                message.channel.send(`${getPossessionName(changeData)} rank is too low.`)
                                                                            }
                                                                        }).catch(() => message.channel.send(`Couldn't get ${getPossessionName(changeData)} rank.`))
                                                                }).catch(() => message.channel.send(getEmbed(command, `Sorry, but **${username}** doesn't exist on Roblox.`)))
                                                        } else if (key == 'reason') {
                                                            var reason = extractText(changeData, '"')
                                                            if (reason) {
                                                                suspensionData.reason = reason
                                                                t.put(`/1/cards/${card.id}`, {desc: JSON.stringify(suspensionData)}, err => {
                                                                    if (!err) {
                                                                        message.channel.send(`Successfully changed ${getPossessionName(username)} suspension's reason to "*${reason}*".`)
                                                                    } else {
                                                                        message.channel.send(`Couldn't change ${getPossessionName(username)} suspension's reason to "*${reason}*".`)
                                                                    }
                                                                })
                                                            } else {
                                                                message.channel.send('Please enter new reason between *double* quotation marks.')
                                                            }
                                                        } else if (key == 'rankback') {
                                                            if (changeData.toLowerCase() == 'yes' || changeData.toLowerCase() == 'no') {
                                                                suspensionData.rankback = changeData.toLowerCase() == 'yes' && 1 || 0
                                                                t.put(`/1/cards/${card.id}`, {desc: JSON.stringify(suspensionData)}, err => {
                                                                    if (!err) {
                                                                        message.channel.send(`Successfully changed ${getPossessionName(username)} suspension's rankback to **${changeData.toLowerCase()}**.`)
                                                                    } else {
                                                                        message.channel.send(`Couldn't change ${getPossessionName(username)} suspension's rankback to **${changeData.toLowerCase()}**.`)
                                                                    }
                                                                })
                                                            } else {
                                                                message.channel.send(`**${changeData}** is not a valid value for rankback.`)
                                                            }
                                                        }
                                                    } else {
                                                        message.channel.send('You can only change your own made suspensions.')
                                                    }
                                                } else {
                                                    message.channel.send(`Couldn't find suspension of **${username}**.`)
                                                }
                                            }).catch(() => message.channel.send(`Error finding card for suspension of **${username}**.`))
                                    }).catch(() => message.channel.send(getEmbed(command, `Sorry, but **${byUsername}** doesn't exist on Roblox.`)))
                            }).catch(() => message.channel.send(getEmbed(command, `Sorry, but **${username}** doesn't exist on Roblox.`)))
                    } else {
                        message.channel.send('That key is not valid.')
                    }
                } else {
                    message.channel.send('Please give the key you want to change.')
                }
            } else {
                message.channel.send('Please enter a username.')
            }
        } else {
            message.channel.send('Insufficient powers!')
        }
        return
    }
    if (isCommand('issuspended', message)) {
        if (isAdmin(member)) {
            logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel)
            if (username) {
                isSuspended(username)
                    .then(suspended => {
                        if (suspended) {
                            message.channel.send(`**${username}** is suspended.`)
                        } else {
                            message.channel.send(`**${username}** is not suspended.`)
                        }
                    }).catch(err => message.channel.send(getEmbed(command, `Sorry, but **${username}** doesn't exist on Roblox.`)))
            } else {
                message.channel.send('Please enter a username.')
            }
        } else {
            message.channel.send('Insufficient powers!')
        }
        return
    }
    if (isCommand('groupcentre', message) || isCommand('gc', message) || isCommand('groupcenter', message)) {
        message.channel.send('<https://www.roblox.com/games/348800431/Group-Center> - Group Centre')
        return
    }
    if (isCommand('optin', message)) {
        logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel)
        if (hasRole(member, 'No Training Announcements')) {
            member.removeRole(guild.roles.find(x => x.name === 'No Training Announcements'))
            message.channel.send('Successfully opted in.')
        } else {
            message.channel.send('You\'re already opted in.')
        }
        return
    }
    if (isCommand('optout', message)) {
        logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel)
        if (!hasRole(member, 'No Training Announcements')) {
            member.addRole(guild.roles.find(x => x.name === 'No Training Announcements'))
            message.channel.send('Successfully opted out.')
        } else {
            message.channel.send('You\'re already opted out.')
        }
        return
    }
    if (isCommand('notdutch', message)) {
        logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel)
        if (!hasRole(member, 'Not Dutch')) {
            member.addRole(guild.roles.find(x => x.name === 'Not Dutch'))
            message.channel.send('Successfully updated roles.')
        } else {
            message.channel.send('You already have the Not Dutch role.')
        }
        return
    }
    if (isCommand('unpban', message)) {
        if (member.id == '235476265325428736') {
            logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel)
            var username = args[1]
            if (!username) {
                message.channel.send('Please enter a username.')
                return
            }
            roblox.getIdFromUsername(username)
                .then(id => {
                    getCardInList(id, bannedListID)
                        .then(card => {
                            t.put(`/1/cards/${card.id}`, {idList: unbannedListID}, err => {
                                if (!err) {
                                    message.channel.send(`Successfully unpbanned **${username}**.`)
                                } else {
                                    message.channel.send(`Couldn't unpban **${username}**.`)
                                }
                            })
                        }).catch(() => message.channel.send(`Couldn't find pban of **${username}**.`))
                }).catch(() => message.channel.send(getEmbed(command, `Sorry, but **${username}** doesn't exist on Roblox.`)))
        } else {
            message.channel.send('Insufficient powers!')
        }
        return
    }
    if (isCommand('pbanlist', message)) {
        if (isAdmin(member)) {
            logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel)
            var cards = await getCardsInList(bannedListID)
            if (cards) {
                var list = await getPbanList(cards)
                var pieces = []
                var count = 0
                while (list.length > 1024) {
                    var piece = list.substring(0, 1024)
                    piece = piece.substring(0, piece.lastIndexOf('\n'))
                    list = list.substring(piece.length, list.length)
                    pieces.push(piece)
                }
                pieces.push(list)
                var embeds = []
                var embedNum = 0
                var count = 0
                pieces.forEach(piece => {
                    if (!embeds[embedNum]) {
                        embeds[embedNum] = []
                    }
                    count++
                    embeds[embedNum].push({title: `Part ${count}`, message: piece})
                    if (count % 5 == 0) {
                        embedNum++
                    }
                })
                embedCount = 0
                embeds.forEach(embed => {
                    embedCount++
                    DMmember(member, compileRichEmbed(embed).setTitle(`Pbanlist (${embedCount})`))
                        .catch(() => message.channel.send('Couldn\'t DM member.'))
                })
            } else {
                message.channel.send('Couldn\'t get pbanlist.')
            }
        } else {
            message.channel.send('Insufficient powers!')
        }
        return
    }
    if (isCommand('place', message)) {
        if (args[1]) {
            var timezone = await getPlaceFromTimezone(args[1])
            if (timezone) {
                message.channel.send(getEmbed('place', timezone))
            } else {
                message.channel.send(`Unknown Timezone: '**${args[1]}**'`)
                return
            }
        } else {
            message.channel.send('Please enter an abbreviation.')
        }
        return
    }
    if (isCommand('checkeverything', message)) {
        if (member.id == '235476265325428736') {
            logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel)
            checkUpdates(guild)
                .then(() => message.channel.send('Successfully checked for updates.'))
        } else {
            message.channel.send('Insufficient powers!')
        }
        return
    }
    if (isCommand('lastupdate', message)) {
        fs.stat('.', (err, stats) => {
            if (!err) {
                message.channel.send(getEmbed('NSadmin was last updated on', stats.mtime))
            } else {
                message.channel.send('Couldn\'t get file stats.')
            }
        })
        return
    }
    if (isCommand('discord', message)) {
        message.channel.send('discord.gg/nZE8dXM')
        return
    }
    if (isCommand('uptime', message)) {
        message.channel.send(getEmbed('NSadmin has been online for', `${getUnix() - startUnix}s`))
        return
    }

    if (isCommand('isdst', message)) {
        message.channel.send(isDST(new Date().getTime()))
    }

    if (isCommand('isloggedin', message)) {
        roblox.getCurrentUser()
            .then(() => message.channel.send(true))
            .catch(() => message.channel.send(false))
    }

    if (isCommand('pm', message)) {
        if (isAdmin(member)) {
            logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel)
            var username = args[1]
            if (username) {
                var content = extractText(message.content, '"')
                if (!content) {
                    message.channel.send('Please enter a message between *double* quotation marks.')
                    return
                }
                roblox.getIdFromUsername(username)
                    .then(id => {
                        roblox.follow(id)
                            .then(() => {
                                roblox.message(id, 'Automatic message', content)
                                    .then(() => message.channel.send(`Succesfully messaged **${username}** "*${content}*".`))
                                    .catch(() => message.channel.send(getEmbed(command, `Couldn't message **${username}**.`)))
                                roblox.unfollow(id)
                                    .then(() => {
                                    })
                                    .catch(() => message.channel.send(getEmbed(command, `Couldn't unfollow **${username}**.`)))
                            }).catch(() => message.channel.send(getEmbed(command, `Couldn't follow **${username}**.`)))
                    }).catch(() => message.channel.send(getEmbed(command, `Sorry, but **${username}** doesn't exist on Roblox.`)))
            } else {
                message.channel.send('Please enter a username.')
            }
        } else {
            message.channel.send('Insufficient powers!')
        }
    }
})

setInterval(() => {
    const guild = client.guilds.find(guild => guild.name === 'NS Roblox')
    if (guild) {
        checkUpdates(guild)
    }
}, checkRate)
