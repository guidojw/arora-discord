'use strict'
const applicationAdapter = require('../../adapters/application')
const BaseCommand = require('../base')
const timeHelper = require('../../helpers/time')

const { MessageEmbed } = require('discord.js')
const { getChannels, getTags, getUrls } = require('../../helpers/string')
const { groupService, userService } = require('../../services')

class HostTrainingCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'admin',
      name: 'hosttraining',
      details: 'Type must be CD or CSR. You can add special notes that will be shown in the training\'s announcement.' +
        ' The date argument should be dd-mm-yyyy format.',
      aliases: ['host'],
      description: 'Schedules a new training.',
      examples: ['host CD 4-3-2020 1:00 Be on time!', 'Host CSR 4-3-2020 2:00'],
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'type',
        type: 'string',
        prompt: 'What kind of training is this?'
      }, {
        key: 'date',
        type: 'string',
        prompt: 'At what date would you like to host this training?',
        validate: timeHelper.validDate
      }, {
        key: 'time',
        type: 'string',
        prompt: 'At what time would you like to host this training?',
        validate: timeHelper.validTime
      }, {
        key: 'notes',
        type: 'string',
        prompt: 'What notes would you like to add? Reply with "none" if you don\'t want to add any.',
        validate: val => getChannels(val)
          ? 'Notes contain channels.'
          : getTags(val)
            ? 'Notes contain tags.'
            : getUrls(val)
              ? 'Notes contain URLs.'
              : true
      }]
    })
  }

  async run (message, { type, date, time, notes }, guild) {
    if (message.guild.robloxGroupId === null) {
      return message.reply('This server is not bound to a Roblox group yet.')
    }
    type = type.toLowerCase()
    const dateInfo = timeHelper.getDateInfo(date)
    const timeInfo = timeHelper.getTimeInfo(time)
    const dateUnix = Math.floor(new Date(
      dateInfo.year,
      dateInfo.month,
      dateInfo.day,
      timeInfo.hours,
      timeInfo.minutes
    ).getTime())
    const afterNow = dateUnix - Math.floor(Date.now()) > 0
    if (!afterNow) {
      return message.reply('Please give a date and time that are after now.')
    }
    const trainingTypes = await groupService.getTrainingTypes(message.guild.robloxGroupId)
    const trainingType = trainingTypes.find(trainingType => trainingType.abbreviation.toLowerCase() === type)
    if (!trainingType) {
      return message.reply('Type not found.')
    }
    const authorId = await userService.getIdFromUsername(message.member.displayName)

    const training = (await applicationAdapter('post', `/v1/groups/${message.guild.robloxGroupId}/trainings`, {
      notes: notes.toLowerCase() === 'none' ? undefined : notes,
      date: dateUnix,
      typeId: trainingType.id,
      authorId
    })).data

    const embed = new MessageEmbed()
      .addField('Successfully scheduled', `**${trainingType.name}** training on **${date}** at **${time}**.`)
      .addField('Training ID', training.id.toString())
      .setColor(message.guild.primaryColor)
    return message.replyEmbed(embed)
  }
}

module.exports = HostTrainingCommand
