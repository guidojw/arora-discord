import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryColumn } from 'typeorm'
import {
  IsArray,
  IsBoolean,
  IsEnum, IsNumber,
  IsNumberString,
  IsOptional,
  ValidateIf,
  ValidateNested
} from 'class-validator'
import Channel from './channel'
import Emoji from './emoji'
import Group from './group'
import Member from './member'
import Message from './message'
import Panel from './panel'
import Role from './role'
import RoleBinding from './role-binding'
import RoleList from './role-list'
import Tag from './tag'
import Ticket from './ticket'
import TicketType from './ticket-type'
import { VerificationProvider } from '../utils/constants'

@Entity('guilds')
export default class Guild {
  @PrimaryColumn({ type: 'bigint' })
  @IsNumberString({ no_symbols: true })
  public id!: string

  @Column('int', { name: 'primary_color', nullable: true })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 0 })
  public primaryColor?: number | null

  @Column('int', { name: 'roblox_group_id', nullable: true })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 0 })
  public robloxGroupId?: number | null

  @Column({ name: 'roblox_usernames_in_nicknames', default: false })
  @IsBoolean()
  public robloxUsernamesInNicknames!: boolean

  @Column({ name: 'support_enabled', default: false })
  @IsBoolean()
  public supportEnabled!: boolean

  @Column({
    name: 'verification_preference',
    type: 'enum',
    enum: VerificationProvider,
    default: VerificationProvider.RoVer
  })
  @IsEnum(VerificationProvider)
  public verificationPreference!: VerificationProvider

  @Column('bigint', { name: 'logs_channel_id', nullable: true })
  @IsOptional()
  @IsNumberString({ no_symbols: true })
  public logsChannelId?: string | null

  @Column('bigint', { name: 'suggestions_channel_id', nullable: true })
  @IsOptional()
  @IsNumberString({ no_symbols: true })
  public suggestionsChannelId?: string | null

  @Column('bigint', { name: 'ratings_channel_id', nullable: true })
  @IsOptional()
  @IsNumberString({ no_symbols: true })
  public ratingsChannelId?: string | null

  @Column('bigint', { name: 'ticket_archives_channel_id', nullable: true })
  @IsOptional()
  @IsNumberString({ no_symbols: true })
  public ticketArchivesChannelId?: string | null

  @Column('bigint', { name: 'tickets_category_id', nullable: true })
  @IsOptional()
  @IsNumberString({ no_symbols: true })
  public ticketsCategoryId?: string | null

  @OneToMany(() => Tag, tag => tag.guild)
  @ValidateIf(guild => typeof guild.tags !== 'undefined')
  @ValidateNested()
  @IsArray()
  public tags?: Tag[]

  @OneToMany(() => Ticket, ticket => ticket.guild)
  @ValidateIf(guild => typeof guild.tickets !== 'undefined')
  @ValidateNested()
  @IsArray()
  public tickets?: Ticket[]

  @OneToMany(() => RoleBinding, roleBinding => roleBinding.guild)
  @ValidateIf(guild => typeof guild.roleBindings !== 'undefined')
  @ValidateNested()
  @IsArray()
  public roleBindings?: RoleBinding[]

  @OneToMany(() => RoleList, roleList => roleList.guild)
  @ValidateIf(guild => typeof guild.roleLists !== 'undefined')
  @ValidateNested()
  @IsArray()
  public roleLists?: RoleList[]

  @OneToMany(() => Group, group => group.guild)
  @ValidateIf(guild => typeof guild.groups !== 'undefined')
  @ValidateNested()
  @IsArray()
  public groups?: Group[]

  @OneToMany(() => Role, role => role.guild)
  @ValidateIf(guild => typeof guild.roles !== 'undefined')
  @ValidateNested()
  @IsArray()
  public roles?: Role[]

  @OneToMany(() => Panel, panel => panel.guild)
  @ValidateIf(guild => typeof guild.panels !== 'undefined')
  @ValidateNested()
  @IsArray()
  public panels?: Panel[]

  @OneToMany(() => Channel, channel => channel.guild)
  @ValidateIf(guild => typeof guild.channels !== 'undefined')
  @ValidateNested()
  @IsArray()
  public channels?: Channel[]

  @OneToOne(() => Channel, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'logs_channel_id' })
  @IsOptional()
  @ValidateNested()
  public logsChannel?: Channel | null

  @OneToOne(() => Channel, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'suggestions_channel_id' })
  @IsOptional()
  @ValidateNested()
  public suggestionsChannel?: Channel | null

  @OneToOne(() => Channel, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'ratings_channel_id' })
  @IsOptional()
  @ValidateNested()
  public ratingsChannel?: Channel | null

  @OneToOne(() => Channel, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'ticket_archives_channel_id' })
  @IsOptional()
  @ValidateNested()
  public ticketArchivesChannel?: Channel | null

  @OneToOne(() => Channel, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'tickets_category_id' })
  @IsOptional()
  @ValidateNested()
  public ticketsCategory?: Channel | null

  @OneToMany(() => TicketType, ticketType => ticketType.guild)
  @ValidateIf(guild => typeof guild.ticketTypes !== 'undefined')
  @ValidateNested()
  @IsArray()
  public ticketTypes?: TicketType[]

  @OneToMany(() => Emoji, emoji => emoji.guild)
  @ValidateIf(guild => typeof guild.emojis !== 'undefined')
  @ValidateNested()
  @IsArray()
  public emojis?: Emoji[]

  @OneToMany(() => Message, message => message.guild)
  @ValidateIf(guild => typeof guild.messages !== 'undefined')
  @ValidateNested()
  @IsArray()
  public messages?: Message[]

  @OneToMany(() => Member, member => member.guild)
  @ValidateIf(guild => typeof guild.members !== 'undefined')
  @ValidateNested()
  @IsArray()
  public members?: Member[]
}
