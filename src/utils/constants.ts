export const TYPES = {
  // Client
  Client: Symbol.for('Client'),
  Dispatcher: Symbol.for('Dispatcher'),
  SettingProvider: Symbol.for('SettingProvider'),
  WebSocketManager: Symbol.for('WebSocketManager'),

  // Factories
  Argument: Symbol.for('Argument'),
  ArgumentFactory: Symbol.for('ArgumentFactory'),

  ArgumentType: Symbol.for('ArgumentType'),
  ArgumentTypeFactory: Symbol.for('ArgumentTypeFactory'),

  Command: Symbol.for('Command'),
  CommandFactory: Symbol.for('CommandFactory'),

  Handler: Symbol.for('Handler'),
  EventHandlerFactory: Symbol.for('EventHandlerFactory'),
  PacketHandlerFactory: Symbol.for('PacketHandlerFactory'),

  Job: Symbol.for('Job'),
  JobFactory: Symbol.for('JobFactory'),

  Manager: Symbol.for('Manager'),
  ManagerFactory: Symbol.for('ManagerFactory'),

  Structure: Symbol.for('Structure'),
  StructureFactory: Symbol.for('StructureFactory'),

  // Repositories
  ChannelRepository: Symbol.for('ChannelRepository'),
  EmojiRepository: Symbol.for('EmojiRepository'),
  GroupRepository: Symbol.for('GroupRepository'),
  GuildRepository: Symbol.for('GuildRepository'),
  MemberRepository: Symbol.for('MemberRepository'),
  MessageRepository: Symbol.for('MessageRepository'),
  PanelRepository: Symbol.for('PanelRepository'),
  RoleRepository: Symbol.for('RoleRepository'),
  RoleBindingRepository: Symbol.for('RoleBindingRepository'),
  RoleMessageRepository: Symbol.for('RoleMessageRepository'),
  TagRepository: Symbol.for('TagRepository'),
  TagNameRepository: Symbol.for('TagNameRepository'),
  TicketRepository: Symbol.for('TicketRepository'),
  TicketTypeRepository: Symbol.for('TicketTypeRepository'),

  // Services
  ChannelLinkService: Symbol.for('ChannelLinkService'),
  PersistentRoleService: Symbol.for('PersistentRoleService')
}

export enum GuildSetting {
  logsChannelId,
  primaryColor,
  ratingsChannelId,
  robloxGroupId,
  robloxUsernamesInNicknames,
  suggestionsChannelId,
  ticketArchivesChannelId,
  ticketsCategoryId,
  verificationPreference
}

export enum GroupType {
  Channel = 'channel',
  Role = 'role'
}

export enum VerificationProvider {
  Bloxlink = 'bloxlink',
  RoVer = 'rover'
}
