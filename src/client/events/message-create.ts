import { type ApplicationCommandData, type Message, TextChannel } from 'discord.js'
import { AroraClient, type BaseHandler } from '..'
import { inject, injectable, named } from 'inversify'
import type { GuildContext } from '../../structures'
import { GuildContextManager } from '../../managers'
import { constants } from '../../utils'
import { stripIndents } from 'common-tags'

const { TYPES } = constants

@injectable()
export default class MessageEventHandler implements BaseHandler {
  @inject(TYPES.Client)
  private readonly client!: AroraClient<true>

  @inject(TYPES.Manager)
  @named('GuildContextManager')
  private readonly guildContexts!: GuildContextManager

  public async handle (message: Message): Promise<void> {
    if (message.author.bot) {
      return
    }
    const guild = message.guild
    if (guild === null) {
      return
    }
    const context = this.guildContexts.resolve(guild) as GuildContext

    if ((process.env.NODE_ENV ?? 'development') === 'development') {
      if (this.client.application?.owner === null) {
        await this.client.application?.fetch()
      }
      if (message.content.toLowerCase() === '!deploy' && message.author.id === this.client.application?.owner?.id) {
        const applicationCommands = await import('../../interactions/data/application-commands')
        await guild.commands.set(Object.values(applicationCommands) as ApplicationCommandData[])
        await this.client.send(message.channel, 'Successfully deployed commands.')
      }
    }

    const photoContestChannelsGroup = context.groups.resolve('photoContestChannels')
    if (
      // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
      photoContestChannelsGroup !== null && photoContestChannelsGroup.isChannelGroup() &&
      photoContestChannelsGroup.channels.cache.has(message.channel.id)
    ) {
      if (message.attachments.size > 0 || message.embeds.length > 0) {
        await message.react('👍')
      }
    }

    const noTextChannelsGroup = context.groups.resolve('noTextChannels')
    if (
      // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
      noTextChannelsGroup !== null && noTextChannelsGroup.isChannelGroup() &&
      noTextChannelsGroup.channels.cache.has(message.channel.id)
    ) {
      if (message.attachments.size === 0 && message.embeds.length === 0) {
        const canTalkInNoTextChannelsGroup = context.groups.resolve('canTalkInNoTextChannels')
        if (
          canTalkInNoTextChannelsGroup === null || (canTalkInNoTextChannelsGroup.isRoleGroup() &&
          message.member?.roles.cache.some(role => canTalkInNoTextChannelsGroup.roles.cache.has(role.id)) === false)
        ) {
          try {
            await message.delete()
            await context.log(
              message.author,
              stripIndents`
              **Message sent by ${message.author} deleted in ${message.channel}**
              ${message.content}
              `
            )
          } catch {}
        }
      }
    }

    if (message.channel instanceof TextChannel) {
      await context.tickets.resolve(message.channel)?.onMessage(message)
    }
  }
}
