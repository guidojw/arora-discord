import type { CommandoClient, CommandoMessage } from 'discord.js-commando'
import type { Guild, GuildMember, Message } from 'discord.js'
import { argumentUtil, timeUtil } from '../../util'
import { groupService, userService } from '../../services'
import BaseCommand from '../base'
import { applicationAdapter } from '../../adapters'

const { validators, noChannels, noTags, noUrls, parseNoneOrType, validDate, validTime } = argumentUtil
const { getDate, getDateInfo, getTime, getTimeInfo } = timeUtil

export default class EditTrainingCommand extends BaseCommand {
  public constructor (client: CommandoClient) {
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
        parse: (val: string) => val.toLowerCase()
      }, {
        key: 'data',
        type: 'string',
        prompt: 'What would you like to edit this key\'s data to?',
        validate: validators([noChannels, noTags, noUrls]), // for when key = 'notes'
        parse: parseNoneOrType
      }]
    })
  }

  public async run (
    message: CommandoMessage & { member: GuildMember, guild: Guild & { robloxGroupId: number } },
    { trainingId, key, data }: {
      trainingId: number
      key: string
      data?: string
    }
  ): Promise<Message | Message[] | null> {
    if (['author', 'type', 'date', 'time'].includes(key) && typeof data === 'undefined') {
      return await message.reply(`Invalid ${key}`)
    }

    const changes: { authorId?: number, notes?: string | null, typeId?: number, date?: number } = {}
    if (key === 'author') {
      changes.authorId = await userService.getIdFromUsername(data as string)
    } else if (key === 'notes') {
      changes.notes = data ?? null
    } else if (key === 'type') {
      const type = (data as string).toUpperCase()
      const trainingTypes = await groupService.getTrainingTypes(message.guild.robloxGroupId)
      const trainingType = trainingTypes.find(trainingType => trainingType.abbreviation.toLowerCase() === type)
      if (typeof trainingType === 'undefined') {
        return await message.reply('Type not found.')
      }

      changes.typeId = trainingType.id
    } else if (key === 'date' || key === 'time') {
      const training = (await applicationAdapter('GET', `v1/groups/${message.guild.robloxGroupId}/trainings/${trainingId}`))
        .data
      const date = new Date(training.date)

      let dateInfo
      let timeInfo
      if (key === 'date') {
        if (!validDate(data as string)) {
          return await message.reply('Please enter a valid date.')
        }
        dateInfo = getDateInfo(data as string)
        timeInfo = getTimeInfo(getTime(date))
      } else {
        if (!validTime(data as string)) {
          return await message.reply('Please enter a valid time.')
        }
        dateInfo = getDateInfo(getDate(date))
        timeInfo = getTimeInfo(data as string)
      }

      changes.date = Math.floor(new Date(dateInfo.year, dateInfo.month, dateInfo.day, timeInfo.hours, timeInfo.minutes)
        .getTime())
    }
    const editorId = message.member.robloxId ?? (await message.member.fetchVerificationData())?.robloxId
    if (typeof editorId === 'undefined') {
      return await message.reply('This command requires you to be verified with a verification provider.')
    }

    await applicationAdapter('PUT', `v1/groups/${message.guild.robloxGroupId}/trainings/${trainingId}`, {
      changes,
      editorId
    })

    return await message.reply(`Successfully edited training with ID **${trainingId}**.`)
  }
}
