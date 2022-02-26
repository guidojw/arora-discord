import { ApplicationCommandData, type Message, TextChannel } from 'discord.js'
import type BaseHandler from '../base'
import type Client from '../client'
import type { GuildContext } from '../../structures'
import { injectable } from 'inversify'
import { stripIndents } from 'common-tags'

@injectable()
export default class MessageEventHandler implements BaseHandler {
  public async handle (client: Client, message: Message): Promise<void> {
    if (message.author.bot) {
      return
    }
    const guild = message.guild
    if (guild === null) {
      return
    }
    const context = client.guildContexts.resolve(guild) as GuildContext

    if ((process.env.NODE_ENV ?? 'development') === 'development') {
      if (client.application?.owner === null) {
        await client.application?.fetch()
      }
      if (message.content.toLowerCase() === '!deploy' && message.author.id === client.application?.owner?.id) {
        const interactions = await import('../../interactions')
        await guild.commands.set(Object.values(interactions) as ApplicationCommandData[])
        await client.send(message.channel, 'Successfully deployed commands.')
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
