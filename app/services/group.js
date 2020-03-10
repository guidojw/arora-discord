'use strict'
const base = require('path').resolve('.')

const timeHelper = require('../helpers/time')

const applicationAdapter = require('../adapters/application')

const config = require(base + '/config/application')

exports.defaultTrainingShout = '[TRAININGS] There are new trainings being hosted soon, check out the Training ' +
    'Scheduler in the Group Center for more info!'

exports.getTrainingSentence = training => {
    const role = training.type.toUpperCase()
    const dateUnix = training.date
    const readableDate = timeHelper.getDate(dateUnix * 1000)
    const readableTime = timeHelper.getTime(dateUnix * 1000)
    return `**${role}** training on **${readableDate}** at **${readableTime} ${timeHelper.isDst(dateUnix * 1000) &&
    'CEST' || 'CET'}**, hosted by **${training.by}**.`
}

exports.getRoleByAbbreviation = str => {
    if (str) {
        str = str.toUpperCase()
        return str === 'G' ? 'Guest' : str === 'C' ? 'Customer' : str === 'S' ? 'Suspended' : str === 'TD' ?
            'Train Driver' : str === 'CD' ? 'Conductor' : str === 'CSR' ? 'Customer Service Representative' : str
            === 'CS' ? 'Customer Service' : str === 'J' ? 'Janitor' : str === 'Se' ? 'Security' : str === 'LC' ?
            'Line Controller' : str === 'PR' ? 'Partner Representative' : str === 'R' ? 'Representative' : str ===
            'MC' ? 'Management Coordinator' : str === 'OC' ? 'Operations Coordinator' : str === 'GA' ?
            'Group Admin' : str === 'BoM' ? 'Board of Managers' : str === 'BoD' ? 'Board of Directors' : str ===
            'CF' ? 'Co-Founder' : str === 'AA' ? 'Alt. Accounts' : str === 'PD' ? 'President-Director' : str ===
            'UT' ? 'Update Tester' : str === 'P' ? 'Pending' : str === 'PH' ? 'Pending HR' : str === 'MoCR' ?
            'Manager of Customer Relations' : str === 'MoSe' ? 'Manager of Security' : str === 'MoRS' ?
            'Manager of Rolling Stock' : str === 'MoSt' ? 'Manager of Stations' : str === 'MoE' ?
            'Manager of Events' : str === 'MoC' ? 'Manager of Conductors' : str === 'MoRM' ?
            'Manager of Rail Management' : str === 'DoNSR' ? 'Director of NS Reizgers' : str === 'DoO' ?
            'Director of Operations' : null
    }
}

exports.getAbbreviationByRank = (rank, group) => {
    if (rank === 0) {
        return 'G'
    }
    if (!group || group === config.groupId) {
        return rank === 1 && 'C' || rank === 2 && 'S' || rank === 3 && 'TD' || rank === 4 && 'CD' || rank === 5 && 'CSR'
            || rank === 6 && 'J' || rank === 7 && 'Se' || rank === 8 && 'LC' || rank === 99 && 'PR' || rank === 100 &&
            'R' || rank === 101 && 'SC' || rank === 102 && 'OC' || rank === 103 && 'GA' || rank === 251 && 'BoM' || rank
            === 252 && 'BoD' || rank === 253 && 'CF' || rank === 254 && 'AA' || rank === 255 && 'PD' || null
    } else if (group === config.mtGroupId) {
        return rank === 2 && 'P' || rank === 50 && 'UT' || rank === 55 && 'LC' || rank === 100 && 'R' || rank === 101 &&
            'SC' || rank === 102 && 'OC' || rank === 199 && 'PHR' || rank === 244 && 'MoCR' || rank === 245 && 'MoSe' ||
            rank === 246 && 'MoRS' || rank === 247 && 'MoSt' || rank === 248 && 'MoE' || rank === 249 && 'MoC' || rank
            === 250 && 'MoRM' || rank === 251 && 'DoNSR' || rank === 252 && 'DoO' || rank === 253 && 'GA' || rank ===
            254 && 'AA' || rank === 255 && 'PD'
    }
}

exports.getTrainingById = async id => {
    if (!id) throw new Error('Please enter a training ID.')
    const trainings = (await applicationAdapter('get', `/v1/groups/${config.groupId}/trainings`))
        .data
    if (trainings.length === 0) throw new Error('There are currently no hosted trainings.')
    for await (const training of trainings) {
        if (training.id === id) {
            return training
        }
    }
    throw new Error(`Couldn't find info for Training ID **${id}**.`)
}