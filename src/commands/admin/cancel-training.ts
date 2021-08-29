import type { CommandoClient, CommandoMessage } from 'discord.js-commando'
import type { Guild, GuildMember, Message } from 'discord.js'
import BaseCommand from '../base'
import { applicationAdapter } from '../../adapters'
import { argumentUtil } from '../../util'

const { validators, noChannels, noTags, noUrls } = argumentUtil

export default class CancelTrainingCommand extends BaseCommand {
  public constructor (client: CommandoClient) {
    super(client, {
      group: 'admin',
      name: 'canceltraining',
      details: 'TrainingId must be the ID of a currently scheduled training.',
      description: 'Cancels given training.',
      examples: ['canceltraining 1 Weird circumstances.'],
      clientPermissions: ['SEND_MESSAGES'],
      requiresApi: true,
      requiresRobloxGroup: true,
      args: [{
        key: 'trainingId',
        type: 'integer',
        prompt: 'Which training would you like to cancel?'
      }, {
        key: 'reason',
        type: 'string',
        prompt: 'With what reason would you like to cancel this training?',
        validate: validators([noChannels, noTags, noUrls])
      }]
    })
  }

  public async run (
    message: CommandoMessage & { member: GuildMember, guild: Guild & { robloxGroupId: number } },
    { trainingId, reason }: {
      trainingId: number
      reason: string
    }
  ): Promise<Message | Message[] | null> {
    const authorId = message.member.robloxId ?? (await message.member.fetchVerificationData())?.robloxId
    if (typeof authorId === 'undefined') {
      return await message.reply('This command requires you to be verified with a verification provider.')
    }

    await applicationAdapter('POST', `v1/groups/${message.guild.robloxGroupId}/trainings/${trainingId}/cancel`, {
      authorId,
      reason
    })

    return await message.reply(`Successfully cancelled training with ID **${trainingId}**.`)
  }
}
