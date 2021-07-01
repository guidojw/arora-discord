import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryColumn } from 'typeorm'
import { Expose, Type } from 'class-transformer'
import { IsNotEmpty, ValidateIf } from 'class-validator'
import Channel from './channel'
import Emoji from './emoji'
import Group from './group'
import GuildCommand from './guild-command'
import Member from './member'
import Message from './message'
import Panel from './panel'
import Role from './role'
import RoleBinding from './role-binding'
import RoleMessage from './role-message'
import Tag from './tag'
import Ticket from './ticket'
import TicketType from './ticket-type'
import { VerificationProvider } from '../util/constants'

@Entity('guilds')
export default class Guild {
  @Expose()
  @PrimaryColumn({ type: 'bigint' })
  public id!: string

  @Expose({ name: 'command_prefix' })
  @Column('varchar', { name: 'command_prefix', nullable: true, length: 255 })
  @ValidateIf(guild => guild.commandPrefix != null)
  @IsNotEmpty()
  public commandPrefix?: string | null

  @Expose({ name: 'primary_color' })
  @Column('int', { name: 'primary_color', nullable: true })
  public primaryColor?: number | null

  @Expose({ name: 'roblox_group_id' })
  @Column('int', { name: 'roblox_group_id', nullable: true })
  public robloxGroupId?: number | null

  @Expose({ name: 'roblox_usernames_in_nicknames' })
  @Column({ name: 'roblox_usernames_in_nicknames' })
  public robloxUsernamesInNicknames!: boolean

  @Expose({ name: 'support_enabled' })
  @Column({ name: 'support_enabled' })
  public supportEnabled!: boolean

  @Expose({ name: 'verification_preference' })
  @Column({
    name: 'verification_preference',
    type: 'enum',
    enum: VerificationProvider,
    default: VerificationProvider.RoVer
  })
  public verificationPreference!: VerificationProvider

  @Expose({ name: 'logs_channel_id' })
  @Column('bigint', { name: 'logs_channel_id', nullable: true })
  public logsChannelId?: string | null

  @Expose({ name: 'suggestions_channel_id' })
  @Column('bigint', { name: 'suggestions_channel_id', nullable: true })
  public suggestionsChannelId?: string | null

  @Expose({ name: 'ratings_channel_id' })
  @Column('bigint', { name: 'ratings_channel_id', nullable: true })
  public ratingsChannelId?: string | null

  @Expose({ name: 'ticket_archives_channel_id' })
  @Column('bigint', { name: 'ticket_archives_channel_id', nullable: true })
  public ticketArchivesChannelId?: string | null

  @Expose({ name: 'tickets_category_id' })
  @Column('bigint', { name: 'tickets_category_id', nullable: true })
  public ticketsCategoryId?: string | null

  @Expose({ name: 'guild_commands' })
  @Type(() => GuildCommand)
  @OneToMany(() => GuildCommand, guildCommand => guildCommand.guild)
  public guildCommands?: GuildCommand[]

  @Expose()
  @Type(() => Tag)
  @OneToMany(() => Tag, tag => tag.guild)
  public tags?: Tag[]

  @Expose()
  @Type(() => Ticket)
  @OneToMany(() => Ticket, ticket => ticket.guild)
  public tickets?: Ticket[]

  @Expose({ name: 'role_bindings' })
  @Type(() => RoleBinding)
  @OneToMany(() => RoleBinding, roleBinding => roleBinding.guild)
  public roleBindings?: RoleBinding[]

  @Expose({ name: 'role_messages' })
  @Type(() => RoleMessage)
  @OneToMany(() => RoleMessage, roleMessage => roleMessage.guild)
  public roleMessages?: RoleMessage[]

  @Expose()
  @Type(() => Group)
  @OneToMany(() => Group, group => group.guild)
  public groups?: Group[]

  @Expose()
  @Type(() => Role)
  @OneToMany(() => Role, role => role.guild)
  public roles?: Role[]

  @Expose()
  @Type(() => Panel)
  @OneToMany(() => Panel, panel => panel.guild)
  public panels?: Panel[]

  @Expose()
  @Type(() => Channel)
  @OneToMany(() => Channel, channel => channel.guild)
  public channels?: Channel[]

  @Expose({ name: 'logs_channel' })
  @Type(() => Channel)
  @OneToOne(() => Channel, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'logs_channel_id' })
  public logsChannel?: Channel | null

  @Expose({ name: 'suggestions_channel' })
  @Type(() => Channel)
  @OneToOne(() => Channel, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'suggestions_channel_id' })
  public suggestionsChannel?: Channel | null

  @Expose({ name: 'ratings_channel' })
  @Type(() => Channel)
  @OneToOne(() => Channel, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'ratings_channel_id' })
  public ratingsChannel?: Channel | null

  @Expose({ name: 'ticket_archives_channel' })
  @Type(() => Channel)
  @OneToOne(() => Channel, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'ticket_archives_channel_id' })
  public ticketArchivesChannel?: Channel | null

  @Expose({ name: 'ticket_category' })
  @Type(() => Channel)
  @OneToOne(() => Channel, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'ticket_category_id' })
  public ticketsCategory?: Channel | null

  @Expose({ name: 'ticket_types' })
  @Type(() => TicketType)
  @OneToMany(() => TicketType, ticketType => ticketType.guild)
  public ticketTypes?: TicketType[]

  @Expose()
  @Type(() => Emoji)
  @OneToMany(() => Emoji, emoji => emoji.guild)
  public emojis?: Emoji[]

  @Expose()
  @Type(() => Message)
  @OneToMany(() => Message, message => message.guild)
  public messages?: Message[]

  @Expose()
  @Type(() => Member)
  @OneToMany(() => Member, member => member.guild)
  public members?: Member[]
}
