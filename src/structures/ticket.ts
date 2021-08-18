import type { Client, Guild, GuildMember, Message, PartialGuildMember, TextChannel } from 'discord.js'
import { Collection, Constants, MessageAttachment, MessageEmbed } from 'discord.js'
import { discordService, userService } from '../services'
import { timeUtil, util } from '../util'
import BaseStructure from './base'
import type { Ticket as TicketEntity } from '../entities'
import TicketGuildMemberManager from '../managers/ticket-guild-member'
import TicketType from './ticket-type'
import pluralize from 'pluralize'
import { stripIndents } from 'common-tags'

const { PartialTypes } = Constants
const { getDate, getTime } = timeUtil
const { makeCommaSeparatedString } = util

export interface NewTicket extends Ticket {
  authorId: string
  typeId: number
  author: GuildMember
  type: TicketType
}

export default class Ticket extends BaseStructure {
  public readonly guild: Guild
  public id!: number
  public channelId!: string
  public guildId!: string
  public typeId!: number | null
  public authorId!: string | null
  public _moderators: string[]
  public timeout: NodeJS.Timeout | null

  public constructor (client: Client, data: TicketEntity, guild: Guild) {
    super(client)

    this.guild = guild
    this._moderators = []

    this.timeout = null

    this.setup(data)
  }

  public setup (data: TicketEntity): void {
    this.id = data.id
    this.channelId = data.channelId
    this.guildId = data.guildId
    this.typeId = data.typeId ?? null
    this.authorId = data.author?.userId ?? null

    if (typeof data.moderators !== 'undefined') {
      this._moderators = data.moderators.map(moderator => moderator.userId)
    }
  }

  public get author (): GuildMember | PartialGuildMember | null {
    return this.authorId !== null
      ? this.guild.members.cache.get(this.authorId) ??
      (this.client.options.partials?.includes(PartialTypes.GUILD_MEMBER) === true
        ? this.guild.members.add({ user: { id: this.authorId } })
        : null)
      : null
  }

  public get channel (): TextChannel {
    return this.guild.channels.cache.get(this.channelId) as TextChannel
  }

  public get type (): TicketType | null {
    return this.typeId !== null ? this.guild.ticketTypes.cache.get(this.typeId) ?? null : null
  }

  public get moderators (): TicketGuildMemberManager {
    return new TicketGuildMemberManager(this)
  }

  public async populateChannel (): Promise<void> {
    if (!this.isNew()) {
      return
    }

    const { robloxId, robloxUsername } = await this.fetchAuthorData()
    const date = new Date()
    const readableDate = getDate(date)
    const readableTime = getTime(date)
    const ticketInfoEmbed = new MessageEmbed()
      .setColor(this.guild.primaryColor ?? 0xffffff)
      .setTitle('Ticket Information')
      .setDescription(stripIndents`
      Username: \`${robloxUsername ?? 'unknown'}\`
      User ID: \`${robloxId ?? 'unknown'}\`
      Start time: \`${readableDate} ${readableTime}\`
      `)
      .setFooter(`Ticket ID: ${this.id} | ${this.type.name}`)
    await this.channel?.send(this.author.toString(), ticketInfoEmbed)

    const modInfoEmbed = new MessageEmbed()
      .setColor(this.guild.primaryColor ?? 0xffffff)
      .setDescription(stripIndents`
      A Ticket Moderator will be with you shortly.
      This may take up to 24 hours. You can still close your ticket by using the \`closeticket\` command.
      `)
    await this.channel?.send(modInfoEmbed)
  }

  public async close (message: string, success: boolean, color?: number): Promise<void> {
    if (this.guild.ticketArchivesChannel !== null) {
      await this.guild.ticketArchivesChannel.send(await this.fetchArchiveAttachment())
    }
    await this.channel.delete()

    if (this.author !== null) {
      const embed = new MessageEmbed()
        .setColor(color ?? (success ? 0x00ff00 : 0xff0000))
        .setAuthor(this.client.user?.username, this.client.user?.displayAvatarURL())
        .setTitle(message)
      const sent = await this.client.send(this.author, embed) !== null

      if (sent && success && this.guild.ratingsChannel !== null) {
        const rating = await this.requestRating()
        if (rating !== null) {
          await this.logRating(rating)

          const embed = new MessageEmbed()
            .setColor(this.guild.primaryColor ?? 0xffffff)
            .setAuthor(this.client.user?.username, this.client.user?.displayAvatarURL())
            .setTitle('Rating submitted')
            .setDescription('Thank you!')
          await this.client.send(this.author, embed)
        } else {
          const embed = new MessageEmbed()
            .setColor(this.guild.primaryColor ?? 0xffffff)
            .setAuthor(this.client.user?.username, this.client.user?.displayAvatarURL())
            .setTitle('No rating submitted')
          await this.client.send(this.author, embed)
        }
      }
    }

    return await this.delete()
  }

  public async requestRating (): Promise<string | null> {
    if (this.author === null) {
      return null
    }

    const embed = new MessageEmbed()
      .setColor(this.guild.primaryColor ?? 0xffffff)
      .setAuthor(this.client.user?.username, this.client.user?.displayAvatarURL())
      .setTitle('How would you rate the support you got?')
    const message = await this.client.send(this.author, embed) as Message | null

    if (message !== null) {
      const options = []
      for (let i = 1; i <= 5; i++) {
        options.push(`${i}⃣`)
      }

      const rating = await discordService.prompt(this.author as GuildMember, message, options)
      return rating?.name.substring(0, 1) ?? null
    }
    return null
  }

  public async logRating (rating: string): Promise<Message | null> {
    if (this.guild.ratingsChannel === null) {
      return null
    }

    await Promise.allSettled([
      this.author?.partial === true && this.author.fetch(),
      ...this.moderators.cache.map(moderator => moderator.partial && moderator.fetch())
    ])
    let moderatorsString = makeCommaSeparatedString(this.moderators.cache.map((moderator: GuildMember) => {
      return `**${moderator.user.tag ?? moderator.id}**`
    }))
    if (moderatorsString === '') {
      moderatorsString = 'none'
    }

    const embed = new MessageEmbed()
      .setColor(this.guild.primaryColor ?? 0xffffff)
      .setAuthor(this.author?.user?.tag ?? this.authorId ?? 'unknown', this.author?.user?.displayAvatarURL())
      .setTitle('Ticket Rating')
      .setDescription(stripIndents`
      ${pluralize('Moderator', this.moderators.cache.size)}: ${moderatorsString}
      Rating: **${rating}**
      `)
      .setFooter(`Ticket ID: ${this.id}`)
    return await this.guild.ratingsChannel.send(embed)
  }

  public async fetchArchiveAttachment (): Promise<MessageAttachment> {
    let output = ''

    output += 'TICKET INFORMATION\n'
    output += `ID: ${this.id}\nType: ${this.type?.name ?? 'deleted'}\n\n`

    if (this.author?.partial === true) {
      try {
        await this.author.fetch()
      } catch {} // eslint-disable-line no-empty
    }
    const { robloxId, robloxUsername } = await this.fetchAuthorData()
    output += 'AUTHOR INFORMATION\n'
    output += `Discord tag: ${this.author?.user?.tag ?? 'unknown'}\nDiscord ID: ${this.authorId ?? 'unknown'}\n`
    output += `Roblox username: ${robloxUsername ?? 'unknown'}\nRoblox ID: ${robloxId ?? 'unknown'}\n\n`

    output += `Created at: ${this.channel.createdAt.toString()}\nClosed at: ${new Date().toString()}\n\n`

    output += '='.repeat(100) + '\n\n'

    const messages = await this.fetchMessages()
    const firstMessage = messages.first()
    if (typeof firstMessage !== 'undefined' &&
      (firstMessage.author.id !== this.client.user?.id || firstMessage.content !== this.author?.toString())) {
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

  public async fetchAuthorData (): Promise<{ robloxId: number | null, robloxUsername: string | null }> {
    let robloxId = null
    let robloxUsername = null
    try {
      robloxId = this.author?.robloxId ?? (await this.author?.fetchVerificationData())?.robloxId ?? null
      robloxUsername = this.author?.robloxUsername ?? (robloxId !== null
        ? (await userService.getUser(robloxId)).name
        : null)
    } catch {} // eslint-disable-line no-empty
    return { robloxId, robloxUsername }
  }

  public async fetchMessages (): Promise<Collection<string, Message>> {
    let result = new Collection<string, Message>()
    let after = '0'
    do {
      const messages = (await this.channel.messages.fetch({ after })).sort()
      result = result.concat(messages)
      after = messages.last()?.id ?? ''
    } while (after !== '')
    return result
  }

  public async update (data: Partial<TicketEntity>): Promise<Ticket> {
    return await this.guild.tickets.update(this, data)
  }

  public async delete (): Promise<void> {
    return await this.guild.tickets.delete(this)
  }

  public async onMessage (message: Message): Promise<void> {
    if (message.member === null) {
      return
    }
    if (message.member.id === this.authorId) {
      if (this.timeout !== null) {
        this.client.clearTimeout(this.timeout)
        this.timeout = null
      }
    } else {
      if (!this.moderators.cache.has(message.member.id)) {
        await this.moderators.add(message.member)
      }
    }
  }

  public isNew (): this is NewTicket {
    return this.author !== null && this.type !== null
  }
}
