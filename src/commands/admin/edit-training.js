'use strict'

const BaseCommand = require('../base')

const { applicationAdapter } = require('../../adapters')
const { groupService, userService } = require('../../services')
const { noChannels, noTags, noUrls, validDate, validTime } = require('../../util').argumentUtil
const { getDate, getDateInfo, getTime, getTimeInfo } = require('../../util').timeUtil

class EditTrainingCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'admin',
      name: 'edittraining',
      description: 'Edits given training\'s key to given data.',
      details: 'Key must be author, type, date, time or notes. trainingId must be the ID of a currently scheduled ' +
        'training. ',
      examples: ['edittraining 1 date 5-3-2020'],
      clientPermissions: ['SEND_MESSAGES'],
      requiresApi: true,
      requiresRobloxGroup: true,
      args: [{
        key: 'trainingId',
        type: 'integer',
        prompt: 'Which training would you like to edit?'
      }, {
        key: 'key',
        type: 'string',
        prompt: 'What key would you like to edit?',
        oneOf: ['author', 'type', 'date', 'time', 'notes'],
        parse: val => val.toLowerCase()
      }, {
        key: 'data',
        type: 'string',
        prompt: 'What would you like to edit this key\'s data to?'
      }]
    })
  }

  async run (message, { trainingId, key, data }) {
    const changes = {}
    if (key === 'author') {
      changes.authorId = await userService.getIdFromUsername(data)
    } else if (key === 'notes') {
      const results = [noChannels(data, key), noTags(data, key), noUrls(data, key)]
      if (!results.every(result => result && typeof result !== 'string')) {
        const errors = results.filter(result => typeof result === 'string')
        return message.reply(errors.join('\n'))
      }

      changes.notes = data
    } else if (key === 'type') {
      const type = data.toUpperCase()
      const trainingTypes = await groupService.getTrainingTypes(message.guild.robloxGroupId)
      const trainingType = trainingTypes.find(trainingType => trainingType.abbreviation.toLowerCase() === type)
      if (!trainingType) {
        return message.reply('Type not found.')
      }

      changes.typeId = trainingType.id
    } else if (key === 'date' || key === 'time') {
      const training = (await applicationAdapter('GET', `v1/groups/${message.guild.robloxGroupId}/trainings/${trainingId}`))
        .data
      const date = new Date(training.date)

      let dateInfo
      let timeInfo
      if (key === 'date') {
        if (!validDate(data)) {
          return message.reply('Please enter a valid date.')
        }
        dateInfo = getDateInfo(data)
        timeInfo = getTimeInfo(getTime(date))
      } else {
        if (!validTime(data)) {
          return message.reply('Please enter a valid time.')
        }
        dateInfo = getDateInfo(getDate(date))
        timeInfo = getTimeInfo(data)
      }

      changes.date = Math.floor(new Date(dateInfo.year, dateInfo.month, dateInfo.day, timeInfo.hours, timeInfo.minutes)
        .getTime())
    }
    const editorId = message.member.robloxId ?? (await message.member.fetchVerificationData()).robloxId
    if (typeof editorId === 'undefined') {
      return message.reply('This command requires you to be verified with a verification provider.')
    }

    await applicationAdapter('PUT', `v1/groups/${message.guild.robloxGroupId}/trainings/${trainingId}`, {
      changes,
      editorId
    })

    return message.reply(`Successfully edited training with ID **${trainingId}**.`)
  }
}

module.exports = EditTrainingCommand
