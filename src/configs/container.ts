import * as argumentTypes from '../types'
import * as commands from '../commands'
import * as entities from '../entities'
import * as jobs from '../jobs'
import * as services from '../services'
import { type BaseHandler, eventHandlers, packetHandlers } from '../client'
import { Container, type interfaces } from 'inversify'
import { type Repository, getRepository } from 'typeorm'
import type { BaseArgumentType } from '../types'
import type { BaseCommand } from '../commands'
import type { BaseJob } from '../jobs'
import { constants } from '../utils'

const { TYPES } = constants

const container = new Container()
const bind = container.bind.bind(container)

// Argument Types
bind<BaseArgumentType<any>>(TYPES.ArgumentType).to(argumentTypes.AlwaysType)
  .whenTargetTagged('argumentType', 'always')
bind<BaseArgumentType<any>>(TYPES.ArgumentType).to(argumentTypes.ChannelGroupArgumentType)
  .whenTargetTagged('argumentType', 'channel-group')
bind<BaseArgumentType<any>>(TYPES.ArgumentType).to(argumentTypes.DateArgumentType)
  .whenTargetTagged('argumentType', 'date')
bind<BaseArgumentType<any>>(TYPES.ArgumentType).to(argumentTypes.DefaultEmojiArgumentType)
  .whenTargetTagged('argumentType', 'default-emoji')
bind<BaseArgumentType<any>>(TYPES.ArgumentType).to(argumentTypes.GroupArgumentType)
  .whenTargetTagged('argumentType', 'group')
bind<BaseArgumentType<any>>(TYPES.ArgumentType).to(argumentTypes.JsonObjectArgumentType)
  .whenTargetTagged('argumentType', 'json-object')
bind<BaseArgumentType<any>>(TYPES.ArgumentType).to(argumentTypes.MessageArgumentType)
  .whenTargetTagged('argumentType', 'message')
bind<BaseArgumentType<any>>(TYPES.ArgumentType).to(argumentTypes.PanelArgumentType)
  .whenTargetTagged('argumentType', 'panel')
bind<BaseArgumentType<any>>(TYPES.ArgumentType).to(argumentTypes.RobloxUserArgumentType)
  .inSingletonScope() // Singleton because this type has persistent state.
  .whenTargetTagged('argumentType', 'roblox-user')
bind<BaseArgumentType<any>>(TYPES.ArgumentType).to(argumentTypes.RoleBindingArgumentType)
  .whenTargetTagged('argumentType', 'role-binding')
bind<BaseArgumentType<any>>(TYPES.ArgumentType).to(argumentTypes.RoleGroupArgumentType)
  .whenTargetTagged('argumentType', 'role-group')
bind<BaseArgumentType<any>>(TYPES.ArgumentType).to(argumentTypes.RoleMessageArgumentType)
  .whenTargetTagged('argumentType', 'role-message')
bind<BaseArgumentType<any>>(TYPES.ArgumentType).to(argumentTypes.TagArgumentType)
  .whenTargetTagged('argumentType', 'tag')
bind<BaseArgumentType<any>>(TYPES.ArgumentType).to(argumentTypes.TicketTypeArgumentType)
  .whenTargetTagged('argumentType', 'ticket-type')
bind<BaseArgumentType<any>>(TYPES.ArgumentType).to(argumentTypes.TimeArgumentType)
  .whenTargetTagged('argumentType', 'time')

bind<interfaces.Factory<BaseArgumentType<any>>>(TYPES.ArgumentTypeFactory).toFactory<BaseArgumentType<any>, [string]>(
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

bind<interfaces.Factory<BaseCommand<any>>>(TYPES.CommandFactory).toFactory<BaseCommand<any>, [string]>(
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

bind<interfaces.Factory<BaseHandler>>(TYPES.EventHandlerFactory).toFactory<BaseHandler, [string]>(
  (context: interfaces.Context) => {
    return (eventName: string) => {
      return context.container.getTagged<BaseHandler>(TYPES.Handler, 'eventHandler', eventName)
    }
  }
)

// Jobs
bind<BaseJob>(TYPES.Job).to(jobs.AnnounceTrainingsJob)
  .whenTargetTagged('job', 'announceTrainings')
bind<BaseJob>(TYPES.Job).to(jobs.HealthCheckJob)
  .whenTargetTagged('job', 'healthCheck')
bind<BaseJob>(TYPES.Job).to(jobs.PremiumMembersReportJob)
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
bind<Repository<entities.Channel>>(TYPES.ChannelRepository).toDynamicValue(() => {
  return getRepository(entities.Channel)
})
bind<Repository<entities.Command>>(TYPES.CommandRepository).toDynamicValue(() => {
  return getRepository(entities.Command)
})
bind<Repository<entities.Emoji>>(TYPES.EmojiRepository).toDynamicValue(() => {
  return getRepository(entities.Emoji)
})
bind<Repository<entities.Group>>(TYPES.GroupRepository).toDynamicValue(() => {
  return getRepository(entities.Group)
})
bind<Repository<entities.Guild>>(TYPES.GuildRepository).toDynamicValue(() => {
  return getRepository(entities.Guild)
})
bind<Repository<entities.GuildCommand>>(TYPES.GuildCommandRepository).toDynamicValue(() => {
  return getRepository(entities.GuildCommand)
})
bind<Repository<entities.Member>>(TYPES.MemberRepository).toDynamicValue(() => {
  return getRepository(entities.Member)
})
bind<Repository<entities.Message>>(TYPES.MessageRepository).toDynamicValue(() => {
  return getRepository(entities.Message)
})
bind<Repository<entities.Panel>>(TYPES.PanelRepository).toDynamicValue(() => {
  return getRepository(entities.Panel)
})
bind<Repository<entities.Permission>>(TYPES.PermissionRepository).toDynamicValue(() => {
  return getRepository(entities.Permission)
})
bind<Repository<entities.Role>>(TYPES.RoleRepository).toDynamicValue(() => {
  return getRepository(entities.Role)
})
bind<Repository<entities.RoleBinding>>(TYPES.RoleBindingRepository).toDynamicValue(() => {
  return getRepository(entities.RoleBinding)
})
bind<Repository<entities.RoleMessage>>(TYPES.RoleMessageRepository).toDynamicValue(() => {
  return getRepository(entities.RoleMessage)
})
bind<Repository<entities.Tag>>(TYPES.TagRepository).toDynamicValue(() => {
  return getRepository(entities.Tag)
})
bind<Repository<entities.TagName>>(TYPES.TagNameRepository).toDynamicValue(() => {
  return getRepository(entities.TagName)
})
bind<Repository<entities.Ticket>>(TYPES.TicketRepository).toDynamicValue(() => {
  return getRepository(entities.Ticket)
})
bind<Repository<entities.TicketType>>(TYPES.TicketTypeRepository).toDynamicValue(() => {
  return getRepository(entities.TicketType)
})

// Services
bind<services.ChannelLinkService>(TYPES.ChannelLinkService).to(services.ChannelLinkService)
bind<services.PersistentRoleService>(TYPES.PermissionRepository).to(services.PersistentRoleService)

export default container
