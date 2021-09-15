import { MessageEmbed, TextChannel } from 'discord.js'
import type BaseHandler from '../base'
import type Client from '../client'
import type { CommandoMessage } from 'discord.js-commando'
import { injectable } from 'inversify'
import { stripIndents } from 'common-tags'

@injectable()
export default class MessageEventHandler implements BaseHandler {
  public async handle (client: Client, message: CommandoMessage): Promise<void> {
    if (message.author.bot) {
      return
    }
    const guild = message.guild
    if (guild === null) {
      return
    }

    if (message.content.startsWith(guild.commandPrefix)) {
      const tagsCommand = client.registry.resolveCommand('tags')
      if (tagsCommand.isEnabledIn(guild) && tagsCommand.hasPermission(message) === true) {
        const name = message.content.slice(guild.commandPrefix.length)
        const tag = guild.tags.resolve(name)

        if (tag !== null) {
          await message.reply(tag.content, tag.content instanceof MessageEmbed
            ? {}
            : { allowedMentions: { users: [message.author.id] } })
        }
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
            await message.guild.log(
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
