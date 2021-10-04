import * as commands from '../commands'
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
import type { BaseCommand } from '../commands'
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

// Commands
bind<BaseCommand>(TYPES.Command).to(commands.bansCommand)
  .whenTargetTagged('command', 'bans')
bind<BaseCommand>(TYPES.Command).to(commands.demoteCommand)
  .whenTargetTagged('command', 'demote')
bind<BaseCommand>(TYPES.Command).to(commands.exilesCommand)
  .whenTargetTagged('command', 'exiles')
bind<BaseCommand>(TYPES.Command).to(commands.persistentRolesCommand)
  .whenTargetTagged('command', 'persistentroles')
bind<BaseCommand>(TYPES.Command).to(commands.promoteCommand)
  .whenTargetTagged('command', 'promote')
bind<BaseCommand>(TYPES.Command).to(commands.shoutCommand)
  .whenTargetTagged('command', 'shout')
bind<BaseCommand>(TYPES.Command).to(commands.trainingsCommand)
  .whenTargetTagged('command', 'trainings')

bind<BaseCommand>(TYPES.Command).to(commands.restartCommand)
  .whenTargetTagged('command', 'restart')
bind<BaseCommand>(TYPES.Command).to(commands.statusCommand)
  .whenTargetTagged('command', 'status')

bind<BaseCommand>(TYPES.Command).to(commands.boostInfoCommand)
  .whenTargetTagged('command', 'boostinfo')
bind<BaseCommand>(TYPES.Command).to(commands.deleteSuggestionCommand)
  .whenTargetTagged('command', 'deletesuggestion')
bind<BaseCommand>(TYPES.Command).to(commands.getShoutCommand)
  .whenTargetTagged('command', 'getshout')
bind<BaseCommand>(TYPES.Command).to(commands.memberCountCommand)
  .whenTargetTagged('command', 'membercount')
bind<BaseCommand>(TYPES.Command).to(commands.pollCommand)
  .whenTargetTagged('command', 'poll')
bind<BaseCommand>(TYPES.Command).to(commands.suggestCommand)
  .whenTargetTagged('command', 'suggest')
bind<BaseCommand>(TYPES.Command).to(commands.tagCommand)
  .whenTargetTagged('command', 'tag')
bind<BaseCommand>(TYPES.Command).to(commands.whoIsCommand)
  .whenTargetTagged('command', 'whois')

bind<BaseCommand>(TYPES.Command).to(commands.channelLinksCommand)
  .whenTargetTagged('command', 'channellinks')
bind<BaseCommand>(TYPES.Command).to(commands.closeTicketCommand)
  .whenTargetTagged('command', 'closeticket')
bind<BaseCommand>(TYPES.Command).to(commands.groupsCommand)
  .whenTargetTagged('command', 'groups')
bind<BaseCommand>(TYPES.Command).to(commands.panelsCommand)
  .whenTargetTagged('command', 'panels')
bind<BaseCommand>(TYPES.Command).to(commands.roleBindingsCommand)
  .whenTargetTagged('command', 'rolebindings')
bind<BaseCommand>(TYPES.Command).to(commands.roleMessagesCommand)
  .whenTargetTagged('command', 'rolemessages')
bind<BaseCommand>(TYPES.Command).to(commands.setActivityCommand)
  .whenTargetTagged('command', 'setactivity')
bind<BaseCommand>(TYPES.Command).to(commands.settingsCommand)
  .whenTargetTagged('command', 'settings')
bind<BaseCommand>(TYPES.Command).to(commands.tagsCommand)
  .whenTargetTagged('command', 'tags')
bind<BaseCommand>(TYPES.Command).to(commands.ticketTypesCommand)
  .whenTargetTagged('command', 'tickettypes')
bind<BaseCommand>(TYPES.Command).to(commands.toggleSupportCommand)
  .whenTargetTagged('command', 'togglesupport')

bind<interfaces.Factory<BaseCommand>>(TYPES.CommandFactory).toFactory<BaseCommand>(
  (context: interfaces.Context) => {
    return (commandName: string) => {
      return context.container.getTagged<BaseCommand>(TYPES.Command, 'command', commandName)
    }
  }
)

// Event Handlers
bind<BaseHandler>(TYPES.Handler).to(eventHandlers.ChannelDeleteEventHandler)
  .whenTargetTagged('eventHandler', 'channelDelete')
bind<BaseHandler>(TYPES.Handler).to(eventHandlers.EmojiDeleteEventHandler)
  .whenTargetTagged('eventHandler', 'emojiDelete')
bind<BaseHandler>(TYPES.Handler).to(eventHandlers.GuildCreateEventHandler)
  .whenTargetTagged('eventHandler', 'guildCreate')
bind<BaseHandler>(TYPES.Handler).to(eventHandlers.GuildMemberAddEventHandler)
  .whenTargetTagged('eventHandler', 'guildMemberAdd')
bind<BaseHandler>(TYPES.Handler).to(eventHandlers.GuildMemberUpdateEventHandler)
  .whenTargetTagged('eventHandler', 'guildMemberUpdate')
bind<BaseHandler>(TYPES.Handler).to(eventHandlers.InteractionCreateEventHandler)
  .whenTargetTagged('eventHandler', 'interactionCreate')
bind<BaseHandler>(TYPES.Handler).to(eventHandlers.MessageDeleteEventHandler)
  .whenTargetTagged('eventHandler', 'messageDelete')
bind<BaseHandler>(TYPES.Handler).to(eventHandlers.MessageDeleteBulkEventHandler)
  .whenTargetTagged('eventHandler', 'messageDeleteBulk')
bind<BaseHandler>(TYPES.Handler).to(eventHandlers.MessageCreateEventHandler)
  .whenTargetTagged('eventHandler', 'messageCreate')
bind<BaseHandler>(TYPES.Handler).to(eventHandlers.MessageReactionAddEventHandler)
  .whenTargetTagged('eventHandler', 'messageReactionAdd')
bind<BaseHandler>(TYPES.Handler).to(eventHandlers.MessageReactionRemoveEventHandler)
  .whenTargetTagged('eventHandler', 'messageReactionRemove')
bind<BaseHandler>(TYPES.Handler).to(eventHandlers.RoleDeleteEventHandler)
  .whenTargetTagged('eventHandler', 'roleDelete')
bind<BaseHandler>(TYPES.Handler).to(eventHandlers.VoiceStateUpdateEventHandler)
  .whenTargetTagged('eventHandler', 'voiceStateUpdate')

bind<interfaces.Factory<BaseHandler>>(TYPES.EventHandlerFactory).toFactory<BaseHandler>(
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

bind<interfaces.Factory<BaseJob>>(TYPES.JobFactory).toFactory<BaseJob>(
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

bind<interfaces.Factory<BaseHandler>>(TYPES.PacketHandlerFactory).toFactory<BaseHandler>(
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
