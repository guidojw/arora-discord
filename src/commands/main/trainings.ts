import type { CommandoClient, CommandoMessage } from 'discord.js-commando'
import { groupService, userService } from '../../services'
import BaseCommand from '../base'
import type { Message } from 'discord.js'
import { MessageEmbed } from 'discord.js'
import { Training } from '../../services/group'
import { applicationAdapter } from '../../adapters'
import { timeUtil } from '../../util'

const { getDate, getTime, getTimeZoneAbbreviation } = timeUtil

export default class TrainingsCommand extends BaseCommand {
  public constructor (client: CommandoClient) {
    super(client, {
      group: 'main',
      name: 'trainings',
      aliases: ['traininglist', 'training', 'traininginfo'],
      description: 'Lists info of all trainings/training with given ID.',
      clientPermissions: ['SEND_MESSAGES'],
      details: 'TrainingId must be the ID of a currently scheduled training.',
      requiresApi: true,
      requiresRobloxGroup: true,
      args: [{
        key: 'trainingId',
        type: 'integer',
        prompt: 'Of which training would you like to know the information?',
        default: ''
      }]
    })
  }

  public async run (
    message: CommandoMessage,
    { trainingId }: { trainingId: number | '' }
  ): Promise<Message | Message[] | null> {
    if (trainingId !== '') {
      const training: Training = (await applicationAdapter('GET', `v1/groups/${message.guild.robloxGroupId as number}/trainings/${trainingId}`))
        .data
      const username = (await userService.getUser(training.authorId)).name
      const date = new Date(training.date)

      const embed = new MessageEmbed()
        .setTitle(`Training ${training.id}`)
        .addField('Type', training.type?.abbreviation ?? 'Deleted', true)
        .addField('Date', getDate(date), true)
        .addField('Time', `${getTime(date)} ${getTimeZoneAbbreviation(date)}`, true)
        .addField('Host', username, true)
        .setColor(message.guild.primaryColor ?? 0xffffff)
      return await message.replyEmbed(embed)
    } else {
      const trainings: Training[] = (await applicationAdapter('GET', `v1/groups/${message.guild.robloxGroupId as number}/trainings?sort=date`))
        .data
      if (trainings.length === 0) {
        return await message.reply('There are currently no hosted trainings.')
      }

      const embeds = await groupService.getTrainingEmbeds(trainings)
      for (const embed of embeds) {
        await message.author.send(embed)
      }
      return await message.reply('Sent you a DM with the upcoming trainings.')
    }
  }
}
