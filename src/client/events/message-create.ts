import * as interactions from '../../interactions'
import { ApplicationCommandData, TextChannel } from 'discord.js'
import type BaseHandler from '../base'
import type Client from '../client'
import type { Message } from 'discord.js'
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

    if (process.env.NODE_ENV === 'development') {
      if (client.application?.owner === null) {
        await client.application?.fetch()
      }
      if (message.content.toLowerCase() === '!deploy' && message.author.id === client.application?.owner?.id) {
        await guild.commands.set(Object.values(interactions) as ApplicationCommandData[])
      }
    }

    const photoContestChannelsGroup = guild.groups.resolve('photoContestChannels')
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    if (photoContestChannelsGroup !== null && photoContestChannelsGroup.isChannelGroup() &&
      photoContestChannelsGroup.channels.cache.has(message.channel.id)) {
      if (message.attachments.size > 0 || message.embeds.length > 0) {
        await message.react('👍')
      }
    }

    const noTextChannelsGroup = guild.groups.resolve('noTextChannels')
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    if (noTextChannelsGroup !== null && noTextChannelsGroup.isChannelGroup() &&
      noTextChannelsGroup.channels.cache.has(message.channel.id)) {
      if (message.attachments.size === 0 && message.embeds.length === 0) {
        const canTalkInNoTextChannelsGroup = guild.groups.resolve('canTalkInNoTextChannels')
        // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
        if (canTalkInNoTextChannelsGroup === null || (canTalkInNoTextChannelsGroup.isRoleGroup() &&
          message.member?.roles.cache.some(role => canTalkInNoTextChannelsGroup.roles.cache.has(role.id)) === false)) {
          try {
            await message.delete()
          } catch {}
          if (message.deleted) {
            await message.guild?.log(
              message.author,
              stripIndents`
              **Message sent by ${message.author} deleted in ${message.channel}**
              ${message.content}
              `
            )
          }
        }
      }
    }

    if (message.channel instanceof TextChannel) {
      await guild.tickets.resolve(message.channel)?.onMessage(message)
    }
  }
}
