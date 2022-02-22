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

const container = new Container({ skipBaseClassChecks: true })
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
bind<interfaces.Newable<BaseCommand<any>>>(TYPES.Command).toConstructor(commands.BansCommand)
  .whenTargetTagged('command', 'bans')
bind<interfaces.Newable<BaseCommand<any>>>(TYPES.Command).toConstructor(commands.DemoteCommand)
  .whenTargetTagged('command', 'demote')
bind<interfaces.Newable<BaseCommand<any>>>(TYPES.Command).toConstructor(commands.ExilesCommand)
  .whenTargetTagged('command', 'exiles')
bind<interfaces.Newable<BaseCommand<any>>>(TYPES.Command).toConstructor(commands.PersistentRolesCommand)
  .whenTargetTagged('command', 'persistentroles')
bind<interfaces.Newable<BaseCommand<any>>>(TYPES.Command).toConstructor(commands.PromoteCommand)
  .whenTargetTagged('command', 'promote')
bind<interfaces.Newable<BaseCommand<any>>>(TYPES.Command).toConstructor(commands.ShoutCommand)
  .whenTargetTagged('command', 'shout')
bind<interfaces.Newable<BaseCommand<any>>>(TYPES.Command).toConstructor(commands.TrainingsCommand)
  .whenTargetTagged('command', 'trainings')

bind<interfaces.Newable<BaseCommand<any>>>(TYPES.Command).toConstructor(commands.RestartCommand)
  .whenTargetTagged('command', 'restart')
bind<interfaces.Newable<BaseCommand<any>>>(TYPES.Command).toConstructor(commands.StatusCommand)
  .whenTargetTagged('command', 'status')

bind<interfaces.Newable<BaseCommand<any>>>(TYPES.Command).toConstructor(commands.BoostInfoCommand)
  .whenTargetTagged('command', 'boostinfo')
bind<interfaces.Newable<BaseCommand<any>>>(TYPES.Command).toConstructor(commands.DeleteSuggestionCommand)
  .whenTargetTagged('command', 'deletesuggestion')
bind<interfaces.Newable<BaseCommand<any>>>(TYPES.Command).toConstructor(commands.GetShoutCommand)
  .whenTargetTagged('command', 'getshout')
bind<interfaces.Newable<BaseCommand<any>>>(TYPES.Command).toConstructor(commands.MemberCountCommand)
  .whenTargetTagged('command', 'membercount')
bind<interfaces.Newable<BaseCommand<any>>>(TYPES.Command).toConstructor(commands.PollCommand)
  .whenTargetTagged('command', 'poll')
bind<interfaces.Newable<BaseCommand<any>>>(TYPES.Command).toConstructor(commands.SuggestCommand)
  .whenTargetTagged('command', 'suggest')
bind<interfaces.Newable<BaseCommand<any>>>(TYPES.Command).toConstructor(commands.TagCommand)
  .whenTargetTagged('command', 'tag')
bind<interfaces.Newable<BaseCommand<any>>>(TYPES.Command).toConstructor(commands.WhoIsCommand)
  .whenTargetTagged('command', 'whois')

bind<interfaces.Newable<BaseCommand<any>>>(TYPES.Command).toConstructor(commands.ChannelLinksCommand)
  .whenTargetTagged('command', 'channellinks')
bind<interfaces.Newable<BaseCommand<any>>>(TYPES.Command).toConstructor(commands.CloseTicketCommand)
  .whenTargetTagged('command', 'closeticket')
bind<interfaces.Newable<BaseCommand<any>>>(TYPES.Command).toConstructor(commands.GroupsCommand)
  .whenTargetTagged('command', 'groups')
bind<interfaces.Newable<BaseCommand<any>>>(TYPES.Command).toConstructor(commands.PanelsCommand)
  .whenTargetTagged('command', 'panels')
bind<interfaces.Newable<BaseCommand<any>>>(TYPES.Command).toConstructor(commands.RoleBindingsCommand)
  .whenTargetTagged('command', 'rolebindings')
bind<interfaces.Newable<BaseCommand<any>>>(TYPES.Command).toConstructor(commands.RoleMessagesCommand)
  .whenTargetTagged('command', 'rolemessages')
bind<interfaces.Newable<BaseCommand<any>>>(TYPES.Command).toConstructor(commands.SetActivityCommand)
  .whenTargetTagged('command', 'setactivity')
bind<interfaces.Newable<BaseCommand<any>>>(TYPES.Command).toConstructor(commands.SettingsCommand)
  .whenTargetTagged('command', 'settings')
bind<interfaces.Newable<BaseCommand<any>>>(TYPES.Command).toConstructor(commands.TagsCommand)
  .whenTargetTagged('command', 'tags')
bind<interfaces.Newable<BaseCommand<any>>>(TYPES.Command).toConstructor(commands.TicketTypesCommand)
  .whenTargetTagged('command', 'tickettypes')
bind<interfaces.Newable<BaseCommand<any>>>(TYPES.Command).toConstructor(commands.ToggleSupportCommand)
  .whenTargetTagged('command', 'togglesupport')

bind<interfaces.Factory<interfaces.Newable<BaseCommand<any>>>>(TYPES.CommandFactory)
  .toFactory<interfaces.Newable<BaseCommand<any>>, [string]>(
  (context: interfaces.Context) => {
    return (commandName: string) => {
      return context.container.getTagged<interfaces.Newable<BaseCommand<any>>>(TYPES.Command, 'command', commandName)
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
bind<Repository<entities.Emoji>>(TYPES.EmojiRepository).toDynamicValue(() => {
  return getRepository(entities.Emoji)
})
bind<Repository<entities.Group>>(TYPES.GroupRepository).toDynamicValue(() => {
  return getRepository(entities.Group)
})
bind<Repository<entities.Guild>>(TYPES.GuildRepository).toDynamicValue(() => {
  return getRepository(entities.Guild)
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
bind<services.PersistentRoleService>(TYPES.PersistentRoleService).to(services.PersistentRoleService)

export default container
