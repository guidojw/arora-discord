import { AnnounceTrainingsJob, HealthCheckJob, PremiumMembersReportJob } from '../jobs'
import {
  Channel,
  Command,
  Emoji,
  Group,
  Guild,
  GuildCommand,
  Member,
  Message,
  Panel,
  Permission,
  Role,
  RoleBinding,
  RoleMessage,
  Tag,
  TagName,
  Ticket,
  TicketType
} from '../entities'
import { eventHandlers, packetHandlers } from '../client'
import type { BaseHandler } from '../client'
import type { BaseJob } from '../jobs'
import { Container } from 'inversify'
import type { Repository } from 'typeorm'
import { constants } from '../util'
import { getRepository } from 'typeorm'
import type { interfaces } from 'inversify'

const { TYPES } = constants

const container = new Container()
const bind = container.bind.bind(container)

// Event Handlers
bind<BaseHandler>(TYPES.Handler).to(eventHandlers.ChannelDeleteEventHandler)
  .whenTargetTagged('eventHandler', 'channelDelete')
bind<BaseHandler>(TYPES.Handler).to(eventHandlers.CommandCancelEventHandler)
  .whenTargetTagged('eventHandler', 'commandCancel')
bind<BaseHandler>(TYPES.Handler).to(eventHandlers.CommandErrorEventHandler)
  .whenTargetTagged('eventHandler', 'commandError')
bind<BaseHandler>(TYPES.Handler).to(eventHandlers.CommandPrefixChangeEventHandler)
  .whenTargetTagged('eventHandler', 'commandPrefixChange')
bind<BaseHandler>(TYPES.Handler).to(eventHandlers.CommandRunEventHandler)
  .whenTargetTagged('eventHandler', 'commandRun')
bind<BaseHandler>(TYPES.Handler).to(eventHandlers.CommandStatusChangeEventHandler)
  .whenTargetTagged('eventHandler', 'commandStatusChange')
bind<BaseHandler>(TYPES.Handler).to(eventHandlers.EmojiDeleteEventHandler)
  .whenTargetTagged('eventHandler', 'emojiDelete')
bind<BaseHandler>(TYPES.Handler).to(eventHandlers.GroupStatusChangeEventHandler)
  .whenTargetTagged('eventHandler', 'groupStatusChange')
bind<BaseHandler>(TYPES.Handler).to(eventHandlers.GuildCreateEventHandler)
  .whenTargetTagged('eventHandler', 'guildCreate')
bind<BaseHandler>(TYPES.Handler).to(eventHandlers.GuildMemberAddEventHandler)
  .whenTargetTagged('eventHandler', 'guildMemberAdd')
bind<BaseHandler>(TYPES.Handler).to(eventHandlers.GuildMemberUpdateEventHandler)
  .whenTargetTagged('eventHandler', 'guildMemberUpdate')
bind<BaseHandler>(TYPES.Handler).to(eventHandlers.MessageDeleteEventHandler)
  .whenTargetTagged('eventHandler', 'messageDelete')
bind<BaseHandler>(TYPES.Handler).to(eventHandlers.MessageDeleteBulkEventHandler)
  .whenTargetTagged('eventHandler', 'messageDeleteBulk')
bind<BaseHandler>(TYPES.Handler).to(eventHandlers.MessageEventHandler)
  .whenTargetTagged('eventHandler', 'message')
bind<BaseHandler>(TYPES.Handler).to(eventHandlers.MessageReactionAddEventHandler)
  .whenTargetTagged('eventHandler', 'messageReactionAdd')
bind<BaseHandler>(TYPES.Handler).to(eventHandlers.MessageReactionRemoveEventHandler)
  .whenTargetTagged('eventHandler', 'messageReactionRemove')
bind<BaseHandler>(TYPES.Handler).to(eventHandlers.RoleDeleteEventHandler)
  .whenTargetTagged('eventHandler', 'roleDelete')
bind<BaseHandler>(TYPES.Handler).to(eventHandlers.VoiceStateUpdateEventHandler)
  .whenTargetTagged('eventHandler', 'voiceStateUpdate')

bind<interfaces.Factory<BaseHandler>>(TYPES.EventHandlerFactory).toFactory<BaseHandler, [string]>(
  (context: interfaces.Context) => {
    return (eventName: string) => {
      return context.container.getTagged<BaseHandler>(TYPES.Handler, 'eventHandler', eventName)
    }
  }
)

// Jobs
bind<BaseJob>(TYPES.Job).to(AnnounceTrainingsJob)
  .whenTargetTagged('job', 'announceTrainings')
bind<BaseJob>(TYPES.Job).to(HealthCheckJob)
  .whenTargetTagged('job', 'healthCheck')
bind<BaseJob>(TYPES.Job).to(PremiumMembersReportJob)
  .whenTargetTagged('job', 'premiumMembersReport')

bind<interfaces.Factory<BaseJob>>(TYPES.JobFactory).toFactory<BaseJob, [string]>(
  (context: interfaces.Context) => {
    return (jobName: string) => {
      return context.container.getTagged<BaseJob>(TYPES.Job, 'job', jobName)
    }
  }
)

// Packet Handlers
bind<BaseHandler>(TYPES.Handler).to(packetHandlers.RankChangePacketHandler)
  .whenTargetTagged('packetHandler', 'rankChange')
bind<BaseHandler>(TYPES.Handler).to(packetHandlers.TrainDeveloperPayoutReportPacketHandler)
  .whenTargetTagged('packetHandler', 'trainDeveloperPayoutReport')

bind<interfaces.Factory<BaseHandler>>(TYPES.PacketHandlerFactory).toFactory<BaseHandler, [string]>(
  (context: interfaces.Context) => {
    return (eventName: string) => {
      return context.container.getTagged<BaseHandler>(TYPES.Handler, 'packetHandler', eventName)
    }
  }
)

// Repositories
bind<Repository<Channel>>(TYPES.ChannelRepository).toDynamicValue(() => {
  return getRepository(Channel)
})
bind<Repository<Command>>(TYPES.CommandRepository).toDynamicValue(() => {
  return getRepository(Command)
})
bind<Repository<Emoji>>(TYPES.EmojiRepository).toDynamicValue(() => {
  return getRepository(Emoji)
})
bind<Repository<Group>>(TYPES.GroupRepository).toDynamicValue(() => {
  return getRepository(Group)
})
bind<Repository<Guild>>(TYPES.GuildRepository).toDynamicValue(() => {
  return getRepository(Guild)
})
bind<Repository<GuildCommand>>(TYPES.GuildCommandRepository).toDynamicValue(() => {
  return getRepository(GuildCommand)
})
bind<Repository<Member>>(TYPES.MemberRepository).toDynamicValue(() => {
  return getRepository(Member)
})
bind<Repository<Message>>(TYPES.MessageRepository).toDynamicValue(() => {
  return getRepository(Message)
})
bind<Repository<Panel>>(TYPES.PanelRepository).toDynamicValue(() => {
  return getRepository(Panel)
})
bind<Repository<Permission>>(TYPES.PermissionRepository).toDynamicValue(() => {
  return getRepository(Permission)
})
bind<Repository<Role>>(TYPES.RoleRepository).toDynamicValue(() => {
  return getRepository(Role)
})
bind<Repository<RoleBinding>>(TYPES.RoleBindingRepository).toDynamicValue(() => {
  return getRepository(RoleBinding)
})
bind<Repository<RoleMessage>>(TYPES.RoleMessageRepository).toDynamicValue(() => {
  return getRepository(RoleMessage)
})
bind<Repository<Tag>>(TYPES.TagRepository).toDynamicValue(() => {
  return getRepository(Tag)
})
bind<Repository<TagName>>(TYPES.TagNameRepository).toDynamicValue(() => {
  return getRepository(TagName)
})
bind<Repository<Ticket>>(TYPES.TicketRepository).toDynamicValue(() => {
  return getRepository(Ticket)
})
bind<Repository<TicketType>>(TYPES.TicketTypeRepository).toDynamicValue(() => {
  return getRepository(TicketType)
})

export default container
