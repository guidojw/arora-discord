import AlwaysArgumentType from './always'
import BaseArgumentType from './base'
import BooleanArgumentType from './boolean'
import CategoryChannelArgumentType from './category-channel'
import ChannelGroupArgumentType from './channel-group'
import CustomEmojiArgumentType from './custom-emoji'
import DateArgumentType from './date'
import DefaultEmojiArgumentType from './default-emoji'
import GroupArgumentType from './group'
import IntegerArgumentType from './integer'
import JsonObjectArgumentType from './json-object'
import MessageArgumentType from './message'
import PanelArgumentType from './panel'
import RobloxUserArgumentType from './roblox-user'
import RoleBindingArgumentType from './role-binding'
import RoleGroupArgumentType from './role-group'
import RoleMessageArgumentType from './role-message'
import TagArgumentType from './tag'
import TextChannelArgumentType from './text-channel'
import TicketTypeArgumentType from './ticket-type'
import TimeArgumentType from './time'

export * from './base'
export * from './roblox-user'
export {
  AlwaysArgumentType,
  BaseArgumentType,
  BooleanArgumentType,
  CategoryChannelArgumentType,
  ChannelGroupArgumentType,
  CustomEmojiArgumentType,
  DateArgumentType,
  DefaultEmojiArgumentType,
  GroupArgumentType,
  IntegerArgumentType,
  JsonObjectArgumentType,
  MessageArgumentType,
  PanelArgumentType,
  RobloxUserArgumentType,
  RoleBindingArgumentType,
  RoleGroupArgumentType,
  RoleMessageArgumentType,
  TagArgumentType,
  TextChannelArgumentType,
  TicketTypeArgumentType,
  TimeArgumentType
}

export interface MappedArgumentTypes {
  always: AlwaysArgumentType
  boolean: BooleanArgumentType
  'category-channel': CategoryChannelArgumentType
  'channel-group': ChannelGroupArgumentType
  'custom-emoji': CustomEmojiArgumentType
  date: DateArgumentType
  'default-emoji': DefaultEmojiArgumentType
  group: GroupArgumentType
  integer: IntegerArgumentType
  'json-object': JsonObjectArgumentType
  message: MessageArgumentType
  panel: PanelArgumentType
  'roblox-user': RobloxUserArgumentType
  'role-binding': RoleBindingArgumentType
  'role-group': RoleGroupArgumentType
  'role-message': RoleMessageArgumentType
  tag: TagArgumentType
  'text-channel': TextChannelArgumentType
  'ticket-type': TicketTypeArgumentType
  time: TimeArgumentType
}
