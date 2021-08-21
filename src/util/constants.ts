export const TYPES = {
  // Repositories
  ChannelRepository: Symbol.for('ChannelRepository'),
  CommandRepository: Symbol.for('CommandRepository'),
  EmojiRepository: Symbol.for('EmojiRepository'),
  GroupRepository: Symbol.for('GroupRepository'),
  GuildRepository: Symbol.for('GuildRepository'),
  GuildCommandRepository: Symbol.for('GuildCommandRepository'),
  MemberRepository: Symbol.for('MemberRepository'),
  MessageRepository: Symbol.for('MessageRepository'),
  PanelRepository: Symbol.for('PanelRepository'),
  PermissionRepository: Symbol.for('PermissionRepository'),
  RoleRepository: Symbol.for('RoleRepository'),
  RoleBindingRepository: Symbol.for('RoleBindingRepository'),
  RoleMessageRepository: Symbol.for('RoleMessageRepository'),
  TagRepository: Symbol.for('TagRepository'),
  TagNameRepository: Symbol.for('TagNameRepository'),
  TicketRepository: Symbol.for('TicketRepository'),
  TicketTypeRepository: Symbol.for('TicketTypeRepository'),

  // Other
  Handler: Symbol.for('Handler'),
  EventHandlerFactory: Symbol.for('EventHandlerFactory'),
  PacketHandlerFactory: Symbol.for('PacketHandlerFactory'),
  Job: Symbol.for('Job'),
  JobFactory: Symbol.for('JobFactory')
}

export enum CommandType {
  Command = 'command',
  Group = 'group'
}

export enum GroupType {
  Channel = 'channel',
  Role = 'role'
}

export enum VerificationProvider {
  Bloxlink = 'bloxlink',
  RoVer = 'rover'
}

export enum WSEvent {
  TrainDeveloperPayoutReport = 'trainDeveloperPayoutReport',
  RankChange = 'rankChange'
}
