import type { CommandoClient, CommandoMessage } from 'discord.js-commando'
import type { Guild, GuildMember, Message } from 'discord.js'
import { argumentUtil, timeUtil } from '../../util'
import BaseCommand from '../base'
import { MessageEmbed } from 'discord.js'
import { applicationAdapter } from '../../adapters'
import applicationConfig from '../../configs/application'
import { groupService } from '../../services'

const { validators, noChannels, noTags, noUrls, parseNoneOrType, validDate, validTime } = argumentUtil
const { getDateInfo, getTimeInfo } = timeUtil

export default class ScheduleTrainingCommand extends BaseCommand {
  public constructor (client: CommandoClient) {
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
        parse: (val: string) => val.toLowerCase()
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

  public async run (
    message: CommandoMessage & { member: GuildMember, guild: Guild & { robloxGroupId: number } },
    { type, date, time, notes }: {
      type: string
      date: string
      time: string
      notes?: string
    }
  ): Promise<Message | Message[] | null> {
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
      return await message.reply('Please give a date and time that are after now.')
    }
    const trainingTypes = await groupService.getTrainingTypes(message.guild.robloxGroupId)
    const trainingType = trainingTypes.find(trainingType => trainingType.abbreviation.toLowerCase() === type)
    if (typeof trainingType === 'undefined') {
      return await message.reply('Type not found.')
    }
    const authorId = message.member.robloxId ?? (await message.member.fetchVerificationData())?.robloxId
    if (typeof authorId === 'undefined') {
      return await message.reply('This command requires you to be verified with a verification provider.')
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
      .setColor(message.guild.primaryColor ?? applicationConfig.defaultColor)
    return await message.replyEmbed(embed)
  }
}
