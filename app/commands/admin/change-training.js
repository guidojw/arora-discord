'use strict'
const applicationAdapter = require('../../adapters/application')
const BaseCommand = require('../base')
const timeHelper = require('../../helpers/time')

const { getChannels, getTags, getUrls } = require('../../helpers/string')
const { groupService, userService } = require('../../services')

class ChangeTrainingCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'admin',
      name: 'changetraining',
      details: 'TrainingId must be the ID of a currently scheduled training. Key must be author, type, date, time or ' +
        'notes.',
      description: 'Changes given training\'s key to given data.',
      examples: ['changetraining 1 date 5-3-2020'],
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'trainingId',
        type: 'integer',
        prompt: 'Which training would you like to change?'
      }, {
        key: 'key',
        type: 'string',
        prompt: 'What key would you like to change?',
        oneOf: ['author', 'type', 'date', 'time', 'notes']
      }, {
        key: 'data',
        type: 'string',
        prompt: 'What would you like to change this key\'s data to?'
      }]
    })
  }

  async run (message, { trainingId, key, data }) {
    if (message.guild.robloxGroupId === null) {
      return message.reply('This server is not bound to a Roblox group yet.')
    }
    key = key.toLowerCase()
    const changes = {}
    if (key === 'author') {
      changes.authorId = await userService.getIdFromUsername(data)
    } else if (key === 'notes') {
      const error = getChannels(data)
        ? 'Notes contain channels.'
        : getTags(data)
          ? 'Notes contain tags.'
          : getUrls(data)
            ? 'Notes contain URLs.'
            : undefined
      if (error) {
        return message.reply(error)
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
      const training = (await applicationAdapter('get', `/v1/groups/${message.guild.robloxGroupId}/trainings/${trainingId}`))
        .data
      const date = new Date(training.date)

      let dateInfo
      let timeInfo
      if (key === 'date') {
        if (!timeHelper.validDate(data)) {
          return message.reply('Please enter a valid date.')
        }
        timeInfo = timeHelper.getTimeInfo(timeHelper.getTime(date))
        dateInfo = timeHelper.getDateInfo(data)
      } else {
        if (!timeHelper.validTime(data)) {
          return message.reply('Please enter a valid time.')
        }
        dateInfo = timeHelper.getDateInfo(timeHelper.getDate(date))
        timeInfo = timeHelper.getTimeInfo(data)
      }

      changes.date = Math.floor(new Date(dateInfo.year, dateInfo.month, dateInfo.day, timeInfo.hours, timeInfo.minutes)
        .getTime())
    }
    const editorId = await userService.getIdFromUsername(message.member.displayName)

    await applicationAdapter('put', `/v1/groups/${message.guild.robloxGroupId}/trainings/${trainingId}`,
      { changes, editorId })

    return message.reply(`Successfully changed training with ID **${trainingId}**.`)
  }
}

module.exports = ChangeTrainingCommand
