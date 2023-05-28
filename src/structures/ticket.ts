import {
  AttachmentBuilder,
  ButtonBuilder,
  Collection,
  EmbedBuilder,
  type GuildMember,
  type Message,
  type PartialGuildMember,
  Partials,
  type TextChannel,
  type TextChannelResolvable
} from 'discord.js'
import type { GuildContext, TicketType } from '.'
import { type ManagerFactory, constants, timeUtil, util } from '../utils'
import { discordService, userService, verificationService } from '../services'
import { inject, injectable } from 'inversify'
import { AroraClient } from '../client'
import BaseStructure from './base'
import type { Ticket as TicketEntity } from '../entities'
import type { TicketGuildMemberManager } from '../managers'
import applicationConfig from '../configs/application'
import pluralize from 'pluralize'
import { stripIndents } from 'common-tags'

const { TYPES } = constants
const { getDate, getTime } = timeUtil
const { makeCommaSeparatedString } = util

export interface NewTicket extends Ticket {
  authorId: string
  typeId: number
  author: GuildMember
  type: TicketType
}

export interface TicketUpdateOptions { channel?: TextChannelResolvable }

@injectable()
export default class Ticket extends BaseStructure<TicketEntity> {
  @inject(TYPES.Client)
  private readonly client!: AroraClient<true>

  @inject(TYPES.ManagerFactory)
  private readonly managerFactory!: ManagerFactory

  public context!: GuildContext

  public id!: number
  public channelId!: string
  public guildId!: string
  public typeId!: number | null
  public authorId!: string | null
  public _moderators: string[]
  public timeout: NodeJS.Timeout | null

  public constructor () {
    super()

    this._moderators = []

    this.timeout = null
  }

  public setOptions (data: TicketEntity, context: GuildContext): void {
    this.context = context

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
      ? this.context.guild.members.cache.get(this.authorId) ??
      (this.client.options.partials?.includes(Partials.GuildMember) === true
        // @ts-expect-error: Calling private library method.
        ? this.context.guild.members._add({ user: { id: this.authorId } })
        : null)
      : null
  }

  public get channel (): TextChannel {
    return this.context.guild.channels.cache.get(this.channelId) as TextChannel
  }

  public get type (): TicketType | null {
    return this.typeId !== null ? this.context.ticketTypes.cache.get(this.typeId) ?? null : null
  }

  public get moderators (): TicketGuildMemberManager {
    return this.managerFactory<TicketGuildMemberManager, GuildMember>('TicketGuildMemberManager')(this)
  }

  public async populateChannel (): Promise<void> {
    if (!this.isNew()) {
      return
    }

    const { robloxId, robloxUsername } = await this.fetchAuthorData()
    const date = new Date()
    const readableDate = getDate(date)
    const readableTime = getTime(date)
    const ticketInfoEmbed = new EmbedBuilder()
      .setColor(this.context.primaryColor ?? applicationConfig.defaultColor)
      .setTitle('Ticket Information')
      .setDescription(stripIndents`
      Username: \`${robloxUsername ?? 'unknown'}\`
      User ID: \`${robloxId ?? 'unknown'}\`
      Start time: \`${readableDate} ${readableTime}\`
      `)
      .setFooter({ text: `Ticket ID: ${this.id} | ${this.type.name}` })
    await this.channel?.send({ content: this.author.toString(), embeds: [ticketInfoEmbed] })

    const additionalInfoPanel = this.context.panels.resolve('additionalTicketInfoPanel')
    if (additionalInfoPanel !== null) {
      await this.channel?.send({ embeds: [additionalInfoPanel.embed] })
    }
  }

  public async close (message: string, success: boolean, color?: number): Promise<void> {
    if (this.context.ticketArchivesChannel !== null) {
      await this.context.ticketArchivesChannel.send({ files: [await this.fetchArchiveAttachment()] })
    }
    await this.channel.delete()

    if (this.author !== null) {
      const embed = new EmbedBuilder()
        .setColor(color ?? (success ? 0x00ff00 : 0xff0000))
        .setAuthor({ name: this.client.user.username, iconURL: this.client.user.displayAvatarURL() })
        .setTitle(message)
      const sent = await this.client.send(this.author, { embeds: [embed] }) !== null

      if (sent && success && this.context.ratingsChannel !== null) {
        const [rating, ratingInteraction] = await this.requestRating()
        if (rating !== null) {
          await this.logRating(rating)

          const embed = new EmbedBuilder()
            .setColor(this.context.primaryColor ?? applicationConfig.defaultColor)
            .setAuthor({ name: this.client.user.username, iconURL: this.client.user.displayAvatarURL() })
            .setTitle('Rating submitted')
            .setDescription('Thank you!')
          await ratingInteraction.reply({ embeds: [embed] })
        } else {
          const embed = new EmbedBuilder()
            .setColor(this.context.primaryColor ?? applicationConfig.defaultColor)
            .setAuthor({ name: this.client.user.username, iconURL: this.client.user.displayAvatarURL() })
            .setTitle('No rating submitted')
          await this.client.send(this.author, { embeds: [embed] })
        }
      }
    }

    await this.delete()
  }

  public async requestRating (): Promise<ReturnType<(typeof discordService)['prompt']>> {
    if (this.author === null) {
      return [null, null]
    }

    const embed = new EmbedBuilder()
      .setColor(this.context.primaryColor ?? applicationConfig.defaultColor)
      .setAuthor({ name: this.client.user.username, iconURL: this.client.user.displayAvatarURL() })
      .setTitle('How would you rate the support you received?')
    const message = await this.client.send(this.author, { embeds: [embed] })

    if (message !== null) {
      const options: Record<string, ButtonBuilder> = {}
      for (let i = 1; i <= 5; i++) {
        options[i] = new ButtonBuilder().setEmoji(`${i}⃣`)
      }

      return await discordService.prompt(this.author as GuildMember, message, options)
    }
    return [null, null]
  }

  public async logRating (rating: string): Promise<Message | null> {
    if (this.context.ratingsChannel === null) {
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

    const embed = new EmbedBuilder()
      .setColor(this.context.primaryColor ?? applicationConfig.defaultColor)
      .setAuthor({
        name: this.author?.user?.tag ?? this.authorId ?? 'unknown',
        iconURL: this.author?.user?.displayAvatarURL()
      })
      .setTitle('Ticket Rating')
      .setDescription(stripIndents`
      ${pluralize('Moderator', this.moderators.cache.size)}: ${moderatorsString}
      Rating: **${rating}**
      `)
      .setFooter({ text: `Ticket ID: ${this.id}` })
    return await this.context.ratingsChannel.send({ embeds: [embed] })
  }

  public async fetchArchiveAttachment (): Promise<AttachmentBuilder> {
    let output = ''

    output += 'TICKET INFORMATION\n'
    output += `ID: ${this.id}\nType: ${this.type?.name ?? 'deleted'}\n\n`

    if (this.author?.partial === true) {
      try {
        await this.author.fetch()
      } catch {}
    }
    const { robloxId, robloxUsername } = await this.fetchAuthorData()
    output += 'AUTHOR INFORMATION\n'
    output += `Discord tag: ${this.author?.user?.tag ?? 'unknown'}\nDiscord ID: ${this.authorId ?? 'unknown'}\n`
    output += `Roblox username: ${robloxUsername ?? 'unknown'}\nRoblox ID: ${robloxId ?? 'unknown'}\n\n`

    output += `Created at: ${this.channel.createdAt.toString()}\nClosed at: ${new Date().toString()}\n\n`

    output += '='.repeat(100) + '\n\n'

    const messages = await this.fetchMessages()
    const firstMessage = messages.first()
    if (
      typeof firstMessage !== 'undefined' &&
      (firstMessage.author.id !== this.client.user.id || firstMessage.content !== this.author?.toString())
    ) {
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

    return new AttachmentBuilder(Buffer.from(output), { name: `${this.id}-${this.channel.name}.txt` })
  }

  public async fetchAuthorData (): Promise<{ robloxId: number | null, robloxUsername: string | null }> {
    let robloxId = null
    let robloxUsername = null
    if (this.author !== null) {
      try {
        const verificationData = await verificationService.fetchVerificationData(this.author.id, this.guildId)
        if (verificationData !== null) {
          robloxId = verificationData.robloxId
          robloxUsername = robloxId !== null
            ? (await userService.getUser(robloxId)).name
            : null
        }
      } catch {}
    }
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

  public async update (data: TicketUpdateOptions): Promise<Ticket> {
    return await this.context.tickets.update(this, data)
  }

  public async delete (): Promise<void> {
    await this.context.tickets.delete(this)
  }

  public async onMessage (message: Message): Promise<void> {
    if (message.member === null) {
      return
    }
    if (message.member.id === this.authorId) {
      if (this.timeout !== null) {
        clearTimeout(this.timeout)
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
