import {
  Collection,
  Constants,
  Guild,
  GuildMember,
  Message,
  MessageAttachment,
  MessageEmbed,
  TextChannel
} from 'discord.js'
import { discordService, userService } from '../services'
import { timeUtil, util } from '../util'
import BaseStructure from './base'
import { CommandoClient } from 'discord.js-commando'
import TicketGuildMemberManager from '../managers/ticket-guild-member'
import TicketType from './ticket-type'
import pluralize from 'pluralize'
import { stripIndents } from 'common-tags'

const { PartialTypes } = Constants
const { getDate, getTime } = timeUtil
const { makeCommaSeparatedString } = util

export default class Ticket implements BaseStructure {
  readonly client: CommandoClient
  readonly guild: Guild
  _moderators: String[]
  id!: string
  channelId!: string
  guildId!: string
  typeId!: number
  authorId!: string
  timeout?: NodeJS.Timeout

  constructor (client: CommandoClient, data: any, guild: Guild) {
    this.client = client
    this.guild = guild
    this._moderators = []

    this.setup(data)
  }

  setup (data: any): void {
    this.id = data.id
    this.channelId = data.channelId
    this.guildId = data.guildId
    this.typeId = data.typeId
    this.authorId = data.author.userId

    if (typeof data.moderators !== 'undefined') {
      this._moderators = data.moderators.map((moderator: { userId: string }) => moderator.userId)
    }
  }

  get author (): GuildMember | null {
    return this.authorId !== null
      ? this.guild.members.cache.get(this.authorId) ??
      (this.client.options.partials?.includes(PartialTypes.GUILD_MEMBER) === true
        ? this.guild.members.add({ user: { id: this.authorId } })
        : null)
      : null
  }

  get channel (): TextChannel | null {
    return (this.guild.channels.cache.get(this.channelId) as TextChannel | undefined) ?? null
  }

  get type (): TicketType | null {
    return this.guild.ticketTypes.cache.get(this.typeId) ?? null
  }

  get moderators (): TicketGuildMemberManager {
    return new TicketGuildMemberManager(this)
  }

  async populateChannel (): Promise<void> {
    const { robloxId, robloxUsername } = await this.fetchAuthorData()
    const date = new Date()
    const readableDate = getDate(date)
    const readableTime = getTime(date)
    const ticketInfoEmbed = new MessageEmbed()
      .setColor(this.guild.primaryColor)
      .setTitle('Ticket Information')
      .setDescription(stripIndents`
      Username: \`${robloxUsername ?? 'unknown'}\`
      User ID: \`${robloxId ?? 'unknown'}\`
      Start time: \`${readableDate} ${readableTime}\`
      `)
      .setFooter(`Ticket ID: ${this.id} | ${this.type.name}`)
    await this.channel?.send(this.author.toString(), ticketInfoEmbed)

    const modInfoEmbed = new MessageEmbed()
      .setColor(this.guild.primaryColor)
      .setDescription(stripIndents`
      A Ticket Moderator will be with you shortly.
      This may take up to 24 hours. You can still close your ticket by using the \`closeticket\` command.
      `)
    await this.channel?.send(modInfoEmbed)
  }

  async close (message: Message, success: boolean, color?: number): Promise<void> {
    if (this.channel !== null) {
      if (this.guild.ticketArchivesChannel !== null) {
        await this.guild.ticketArchivesChannel.send(await this.fetchArchiveAttachment())
      }
      await this.channel.delete()
    }

    const embed = new MessageEmbed()
      .setColor(color ?? (success ? 0x00ff00 : 0xff0000))
      .setAuthor(this.client.user?.username, this.client.user?.displayAvatarURL())
      .setTitle(message)
    const sent = typeof await this.client.send(this.author, embed) !== 'undefined'

    if (sent && success && this.guild.ratingsChannel !== null && this.author !== null) {
      const rating = await this.requestRating()
      if (rating !== null) {
        await this.logRating(rating)

        const embed = new MessageEmbed()
          .setColor(this.guild.primaryColor)
          .setAuthor(this.client.user?.username, this.client.user?.displayAvatarURL())
          .setTitle('Rating submitted')
          .setDescription('Thank you!')
        this.client.send(this.author, embed)
      } else {
        const embed = new MessageEmbed()
          .setColor(this.guild.primaryColor)
          .setAuthor(this.client.user?.username, this.client.user?.displayAvatarURL())
          .setTitle('No rating submitted')
        this.client.send(this.author, embed)
      }
    }

    return await this.delete()
  }

  async requestRating (): Promise<string | null> {
    const embed = new MessageEmbed()
      .setColor(this.guild.primaryColor)
      .setAuthor(this.client.user?.username, this.client.user?.displayAvatarURL())
      .setTitle('How would you rate the support you got?')
    const message = await this.client.send(this.author, embed)

    const options = []
    for (let i = 1; i <= 5; i++) {
      options.push(`${i}⃣`)
    }

    const rating = await discordService.prompt(this.author, message, options)
    return rating?.name.substring(0, 1) ?? null
  }

  async logRating (rating: string): Promise<Message> {
    await Promise.allSettled([
      this.author.partial && this.author.fetch(),
      ...this.moderators.cache.map(moderator => moderator.partial && moderator.fetch())
    ])
    let moderatorsString = makeCommaSeparatedString(this.moderators.cache.map((moderator: GuildMember) => {
      return `**${moderator.user.tag ?? moderator.id}**`
    }))
    if (moderatorsString === '') {
      moderatorsString = 'none'
    }

    const embed = new MessageEmbed()
      .setColor(this.guild.primaryColor)
      .setAuthor(this.author.user.tag ?? this.author.id, this.author.user.displayAvatarURL())
      .setTitle('Ticket Rating')
      .setDescription(stripIndents`
      ${pluralize('Moderator', this.moderators.cache.size)}: ${moderatorsString}
      Rating: **${rating}**
      `)
      .setFooter(`Ticket ID: ${this.id}`)
    return await this.guild.ratingsChannel.send(embed)
  }

  async fetchArchiveAttachment (): Promise<MessageAttachment> {
    let output = ''

    output += 'TICKET INFORMATION\n'
    output += `ID: ${this.id}\nType: ${this.type.name}\n\n`

    if (this.author.partial) {
      try {
        await this.author.fetch()
      } catch {} // eslint-disable-line no-empty
    }
    const { robloxId, robloxUsername } = await this.fetchAuthorData()
    output += 'AUTHOR INFORMATION\n'
    output += `Discord tag: ${this.author.user.tag ?? 'unknown'}\nDiscord ID: ${this.author.id}\n`
    output += `Roblox username: ${robloxUsername ?? 'unknown'}\nRoblox ID: ${robloxId ?? 'unknown'}\n\n`

    output += `Created at: ${this.channel.createdAt}\nClosed at: ${new Date()}\n\n`

    output += '='.repeat(100) + '\n\n'

    const messages = await this.fetchMessages()
    const firstMessage = messages.first()
    if (firstMessage?.author.id !== this.client.user.id || firstMessage?.content !== this.author.toString()) {
      output += '...\n\n'
      output += '='.repeat(100) + '\n\n'
    }
    for (const message of messages.values()) {
      if (message.content !== '' || message.attachments.size > 0) {
        output += `Sent by: ${message.author.tag} (${message.author.id})\n\n`

        if (message.content !== '') {
          output += `  ${message.cleanContent}\n\n`
        }
        if (message.attachments.size > 0) {
          output += `Attachments\n${message.attachments.map(attachment => `- ${attachment.name ?? 'unknown'}: ${attachment.url}`).join('\n')}\n`
        }

        output += `${message.createdAt.toString()}\n\n`

        output += '='.repeat(100) + '\n\n'
      }
    }

    output += 'END OF TICKET\n'

    return new MessageAttachment(Buffer.from(output), `${this.id}-${this.channel.name}.txt`)
  }

  async fetchAuthorData (): Promise<{ robloxId: number | null, robloxUsername: number | null }> {
    let robloxId, robloxUsername
    try {
      robloxId = this.author.robloxId ?? (await this.author.fetchVerificationData()).robloxId
      robloxUsername = this.author.robloxUsername ?? robloxId !== null
        ? (await userService.getUser(robloxId)).name
        : null
    } catch {} // eslint-disable-line no-empty
    return { robloxId, robloxUsername }
  }

  async fetchMessages (): Promise<Collection<string, Message> | null> {
    if (this.channel === null) {
      return null
    }

    let result = new Collection<string, Message>()
    let after = '0'
    do {
      const messages = (await this.channel.messages.fetch({ after })).sort()
      result = result.concat(messages)
      after = messages.last()?.id ?? ''
    } while (after !== '')
    return result
  }

  async update (data: any): Promise<this> {
    return this.guild.tickets.update(this, data)
  }

  async delete (): Promise<void> {
    return this.guild.tickets.delete(this)
  }

  onMessage (message: Message): void {
    if (message.member === null) {
      return
    }
    if (message.member.id === this.authorId) {
      if (typeof this.timeout !== 'undefined') {
        this.client.clearTimeout(this.timeout)
        this.timeout = undefined
      }
    } else {
      if (!this.moderators.cache.has(message.member.id)) {
        return this.moderators.add(message.member)
      }
    }
  }
}
