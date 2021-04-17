'use strict'

const BaseCommand = require('../base')

const { MessageEmbed } = require('discord.js')
const { applicationAdapter } = require('../../adapters')
const { groupService } = require('../../services')
const {
  validators,
  noChannels,
  noTags, noUrls,
  parseNoneOrType,
  validDate,
  validTime
} = require('../../util').argumentUtil
const { getDateInfo, getTimeInfo } = require('../../util').timeUtil

class ScheduleTrainingCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'admin',
      name: 'scheduletraining',
      aliases: ['schedule'],
      details: 'Type must be CD or CSR. You can add special notes that will be shown in the training\'s announcement.' +
        ' The date argument should be dd-mm-yyyy format.',
      description: 'Schedules a new training.',
      examples: ['schedule CD 4-3-2020 1:00 Be on time!', 'schedule CSR 4-3-2020 2:00 none'],
      clientPermissions: ['SEND_MESSAGES'],
      requiresApi: true,
      requiresRobloxGroup: true,
      args: [{
        key: 'type',
        type: 'string',
        prompt: 'What kind of training is this?',
        parse: val => val.toLowerCase()
      }, {
        key: 'date',
        type: 'string',
        prompt: 'At what date would you like to host this training?',
        validate: validators([validDate])
      }, {
        key: 'time',
        type: 'string',
        prompt: 'At what time would you like to host this training?',
        validate: validators([validTime])
      }, {
        key: 'notes',
        type: 'string',
        prompt: 'What notes would you like to add? Reply with "none" if you don\'t want to add any.',
        validate: validators([noChannels, noTags, noUrls]),
        parse: parseNoneOrType
      }]
    })
  }

  async run (message, { type, date, time, notes }, guild) {
    const dateInfo = getDateInfo(date)
    const timeInfo = getTimeInfo(time)
    const dateUnix = Math.floor(new Date(
      dateInfo.year,
      dateInfo.month,
      dateInfo.day,
      timeInfo.hours,
      timeInfo.minutes
    ).getTime())
    const afterNow = dateUnix - Date.now() > 0
    if (!afterNow) {
      return message.reply('Please give a date and time that are after now.')
    }
    const trainingTypes = await groupService.getTrainingTypes(message.guild.robloxGroupId)
    const trainingType = trainingTypes.find(trainingType => trainingType.abbreviation.toLowerCase() === type)
    if (!trainingType) {
      return message.reply('Type not found.')
    }
    const authorId = message.member.robloxId ?? (await message.member.fetchVerificationData()).robloxId
    if (typeof authorId === 'undefined') {
      return message.reply('This command requires you to be verified with a verification provider.')
    }

    const training = (await applicationAdapter('POST', `v1/groups/${message.guild.robloxGroupId}/trainings`, {
      authorId,
      date: dateUnix,
      notes,
      typeId: trainingType.id
    })).data

    const embed = new MessageEmbed()
      .addField('Successfully scheduled', `**${trainingType.name}** training on **${date}** at **${time}**.`)
      .addField('Training ID', training.id.toString())
      .setColor(message.guild.primaryColor)
    return message.replyEmbed(embed)
  }
}

module.exports = ScheduleTrainingCommand
