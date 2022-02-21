import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryColumn } from 'typeorm'
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
import { VerificationProvider } from '../utils/constants'

@Entity('guilds')
export default class Guild {
  @PrimaryColumn({ type: 'bigint' })
  public id!: string

  @Column('varchar', { name: 'command_prefix', nullable: true, length: 255 })
  @ValidateIf(guild => guild.commandPrefix != null)
  @IsNotEmpty()
  public commandPrefix?: string | null

  @Column('int', { name: 'primary_color', nullable: true })
  public primaryColor?: number | null

  @Column('int', { name: 'roblox_group_id', nullable: true })
  public robloxGroupId?: number | null

  @Column({ name: 'roblox_usernames_in_nicknames', default: false })
  public robloxUsernamesInNicknames!: boolean

  @Column({ name: 'support_enabled', default: false })
  public supportEnabled!: boolean

  @Column({
    name: 'verification_preference',
    type: 'enum',
    enum: VerificationProvider,
    default: VerificationProvider.RoVer
  })
  public verificationPreference!: VerificationProvider

  @Column('bigint', { name: 'logs_channel_id', nullable: true })
  public logsChannelId?: string | null

  @Column('bigint', { name: 'suggestions_channel_id', nullable: true })
  public suggestionsChannelId?: string | null

  @Column('bigint', { name: 'ratings_channel_id', nullable: true })
  public ratingsChannelId?: string | null

  @Column('bigint', { name: 'ticket_archives_channel_id', nullable: true })
  public ticketArchivesChannelId?: string | null

  @Column('bigint', { name: 'tickets_category_id', nullable: true })
  public ticketsCategoryId?: string | null

  @OneToMany(() => GuildCommand, guildCommand => guildCommand.guild)
  public guildCommands?: GuildCommand[]

  @OneToMany(() => Tag, tag => tag.guild)
  public tags?: Tag[]

  @OneToMany(() => Ticket, ticket => ticket.guild)
  public tickets?: Ticket[]

  @OneToMany(() => RoleBinding, roleBinding => roleBinding.guild)
  public roleBindings?: RoleBinding[]

  @OneToMany(() => RoleMessage, roleMessage => roleMessage.guild)
  public roleMessages?: RoleMessage[]

  @OneToMany(() => Group, group => group.guild)
  public groups?: Group[]

  @OneToMany(() => Role, role => role.guild)
  public roles?: Role[]

  @OneToMany(() => Panel, panel => panel.guild)
  public panels?: Panel[]

  @OneToMany(() => Channel, channel => channel.guild)
  public channels?: Channel[]

  @OneToOne(() => Channel, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'logs_channel_id' })
  public logsChannel?: Channel | null

  @OneToOne(() => Channel, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'suggestions_channel_id' })
  public suggestionsChannel?: Channel | null

  @OneToOne(() => Channel, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'ratings_channel_id' })
  public ratingsChannel?: Channel | null

  @OneToOne(() => Channel, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'ticket_archives_channel_id' })
  public ticketArchivesChannel?: Channel | null

  @OneToOne(() => Channel, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'tickets_category_id' })
  public ticketsCategory?: Channel | null

  @OneToMany(() => TicketType, ticketType => ticketType.guild)
  public ticketTypes?: TicketType[]

  @OneToMany(() => Emoji, emoji => emoji.guild)
  public emojis?: Emoji[]

  @OneToMany(() => Message, message => message.guild)
  public messages?: Message[]

  @OneToMany(() => Member, member => member.guild)
  public members?: Member[]
}
