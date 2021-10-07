import * as argumentTypes from '../types'
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
import type { BaseArgumentType } from '../types'
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

// Argument Types
bind<BaseArgumentType<any>>(TYPES.ArgumentType).to(argumentTypes.RobloxUserArgumentType)
  .inSingletonScope()
  .whenTargetTagged('argumentType', 'roblox-user')

bind<interfaces.Factory<BaseArgumentType<any>>>(TYPES.ArgumentTypeFactory).toFactory<BaseArgumentType<any>>(
  (context: interfaces.Context) => {
    return (argumentTypeName: string) => {
      return context.container.getTagged<BaseArgumentType<any>>(TYPES.ArgumentType, 'argumentType', argumentTypeName)
    }
  }
)

// Commands
bind<BaseCommand<any>>(TYPES.Command).to(commands.BansCommand)
  .whenTargetTagged('command', 'bans')
bind<BaseCommand<any>>(TYPES.Command).to(commands.DemoteCommand)
  .whenTargetTagged('command', 'demote')
bind<BaseCommand<any>>(TYPES.Command).to(commands.ExilesCommand)
  .whenTargetTagged('command', 'exiles')
bind<BaseCommand<any>>(TYPES.Command).to(commands.PersistentRolesCommand)
  .whenTargetTagged('command', 'persistentroles')
bind<BaseCommand<any>>(TYPES.Command).to(commands.PromoteCommand)
  .whenTargetTagged('command', 'promote')
bind<BaseCommand<any>>(TYPES.Command).to(commands.ShoutCommand)
  .whenTargetTagged('command', 'shout')
bind<BaseCommand<any>>(TYPES.Command).to(commands.TrainingsCommand)
  .whenTargetTagged('command', 'trainings')

bind<BaseCommand<any>>(TYPES.Command).to(commands.RestartCommand)
  .whenTargetTagged('command', 'restart')
bind<BaseCommand<any>>(TYPES.Command).to(commands.StatusCommand)
  .whenTargetTagged('command', 'status')

bind<BaseCommand<any>>(TYPES.Command).to(commands.BoostInfoCommand)
  .whenTargetTagged('command', 'boostinfo')
bind<BaseCommand<any>>(TYPES.Command).to(commands.DeleteSuggestionCommand)
  .whenTargetTagged('command', 'deletesuggestion')
bind<BaseCommand<any>>(TYPES.Command).to(commands.GetShoutCommand)
  .whenTargetTagged('command', 'getshout')
bind<BaseCommand<any>>(TYPES.Command).to(commands.MemberCountCommand)
  .whenTargetTagged('command', 'membercount')
bind<BaseCommand<any>>(TYPES.Command).to(commands.PollCommand)
  .whenTargetTagged('command', 'poll')
bind<BaseCommand<any>>(TYPES.Command).to(commands.SuggestCommand)
  .whenTargetTagged('command', 'suggest')
bind<BaseCommand<any>>(TYPES.Command).to(commands.TagCommand)
  .whenTargetTagged('command', 'tag')
bind<BaseCommand<any>>(TYPES.Command).to(commands.WhoIsCommand)
  .whenTargetTagged('command', 'whois')

bind<BaseCommand<any>>(TYPES.Command).to(commands.ChannelLinksCommand)
  .whenTargetTagged('command', 'channellinks')
bind<BaseCommand<any>>(TYPES.Command).to(commands.CloseTicketCommand)
  .whenTargetTagged('command', 'closeticket')
bind<BaseCommand<any>>(TYPES.Command).to(commands.GroupsCommand)
  .whenTargetTagged('command', 'groups')
bind<BaseCommand<any>>(TYPES.Command).to(commands.PanelsCommand)
  .whenTargetTagged('command', 'panels')
bind<BaseCommand<any>>(TYPES.Command).to(commands.RoleBindingsCommand)
  .whenTargetTagged('command', 'rolebindings')
bind<BaseCommand<any>>(TYPES.Command).to(commands.RoleMessagesCommand)
  .whenTargetTagged('command', 'rolemessages')
bind<BaseCommand<any>>(TYPES.Command).to(commands.SetActivityCommand)
  .whenTargetTagged('command', 'setactivity')
bind<BaseCommand<any>>(TYPES.Command).to(commands.SettingsCommand)
  .whenTargetTagged('command', 'settings')
bind<BaseCommand<any>>(TYPES.Command).to(commands.TagsCommand)
  .whenTargetTagged('command', 'tags')
bind<BaseCommand<any>>(TYPES.Command).to(commands.TicketTypesCommand)
  .whenTargetTagged('command', 'tickettypes')
bind<BaseCommand<any>>(TYPES.Command).to(commands.ToggleSupportCommand)
  .whenTargetTagged('command', 'togglesupport')

bind<interfaces.Factory<BaseCommand<any>>>(TYPES.CommandFactory).toFactory<BaseCommand<any>>(
  (context: interfaces.Context) => {
    return (commandName: string) => {
      return context.container.getTagged<BaseCommand<any>>(TYPES.Command, 'command', commandName)
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
