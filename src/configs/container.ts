import * as argumentTypes from '../argument-types'
import * as entities from '../entities'
import * as jobs from '../jobs'
import * as managers from '../managers'
import * as services from '../services'
import * as structures from '../structures'
import { Argument, type ArgumentOptions, type BaseCommand } from '../interactions/application-commands'
import {
  AroraClient,
  type BaseHandler,
  Dispatcher,
  SettingProvider,
  WebSocketManager,
  eventHandlers,
  packetHandlers
} from '../client'
import { Container, type interfaces } from 'inversify'
import type { BaseArgumentType } from '../argument-types'
import type { BaseJob } from '../jobs'
import { type Repository } from 'typeorm'
import { applicationCommands } from '../interactions'
import applicationConfig from '../configs/application'
import { constants } from '../utils'
import dataSource from './data-source'

const { TYPES } = constants

const container = new Container()
const bind = container.bind.bind(container)

// Client
bind<AroraClient>(TYPES.Client).to(AroraClient)
  .inSingletonScope()
bind<Dispatcher>(TYPES.Dispatcher).to(Dispatcher)
bind<SettingProvider>(TYPES.SettingProvider).to(SettingProvider)

if (applicationConfig.apiEnabled === true) {
  bind<WebSocketManager>(TYPES.WebSocketManager).to(WebSocketManager)
    .inSingletonScope()
}

// Arguments
bind<Argument<any>>(TYPES.Argument).to(Argument)

bind<interfaces.Factory<Argument<unknown>>>(TYPES.ArgumentFactory)
  .toFactory<Argument<unknown>, [ArgumentOptions<unknown>]>(
  (context: interfaces.Context) => {
    return (options: ArgumentOptions<unknown>) => {
      const argument = context.container.get<Argument<unknown>>(TYPES.Argument)
      argument.setOptions(options)
      return argument
    }
  }
)

// Argument Types
bind<BaseArgumentType<any>>(TYPES.ArgumentType).to(argumentTypes.AlwaysArgumentType)
  .whenTargetTagged('argumentType', 'always')
bind<BaseArgumentType<any>>(TYPES.ArgumentType).to(argumentTypes.BooleanArgumentType)
  .whenTargetTagged('argumentType', 'boolean')
bind<BaseArgumentType<any>>(TYPES.ArgumentType).to(argumentTypes.CategoryChannelArgumentType)
  .whenTargetTagged('argumentType', 'category-channel')
bind<BaseArgumentType<any>>(TYPES.ArgumentType).to(argumentTypes.ChannelGroupArgumentType)
  .whenTargetTagged('argumentType', 'channel-group')
bind<BaseArgumentType<any>>(TYPES.ArgumentType).to(argumentTypes.CustomEmojiArgumentType)
  .whenTargetTagged('argumentType', 'custom-emoji')
bind<BaseArgumentType<any>>(TYPES.ArgumentType).to(argumentTypes.DateArgumentType)
  .whenTargetTagged('argumentType', 'date')
bind<BaseArgumentType<any>>(TYPES.ArgumentType).to(argumentTypes.DefaultEmojiArgumentType)
  .whenTargetTagged('argumentType', 'default-emoji')
bind<BaseArgumentType<any>>(TYPES.ArgumentType).to(argumentTypes.GroupArgumentType)
  .whenTargetTagged('argumentType', 'group')
bind<BaseArgumentType<any>>(TYPES.ArgumentType).to(argumentTypes.IntegerArgumentType)
  .whenTargetTagged('argumentType', 'integer')
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
bind<BaseArgumentType<any>>(TYPES.ArgumentType).to(argumentTypes.TextChannelArgumentType)
  .whenTargetTagged('argumentType', 'text-channel')
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
bind<BaseCommand>(TYPES.Command).to(applicationCommands.BansCommand)
  .whenTargetTagged('command', 'bans')
bind<BaseCommand>(TYPES.Command).to(applicationCommands.DemoteCommand)
  .whenTargetTagged('command', 'demote')
bind<BaseCommand>(TYPES.Command).to(applicationCommands.ExilesCommand)
  .whenTargetTagged('command', 'exiles')
bind<BaseCommand>(TYPES.Command).to(applicationCommands.PersistentRolesCommand)
  .whenTargetTagged('command', 'persistentroles')
bind<BaseCommand>(TYPES.Command).to(applicationCommands.PromoteCommand)
  .whenTargetTagged('command', 'promote')
bind<BaseCommand>(TYPES.Command).to(applicationCommands.ShoutCommand)
  .whenTargetTagged('command', 'shout')
bind<BaseCommand>(TYPES.Command).to(applicationCommands.TrainingsCommand)
  .whenTargetTagged('command', 'trainings')

bind<BaseCommand>(TYPES.Command).to(applicationCommands.InfoCommand)
  .whenTargetTagged('command', 'info')
bind<BaseCommand>(TYPES.Command).to(applicationCommands.RestartCommand)
  .whenTargetTagged('command', 'restart')
bind<BaseCommand>(TYPES.Command).to(applicationCommands.StatusCommand)
  .whenTargetTagged('command', 'status')

bind<BaseCommand>(TYPES.Command).to(applicationCommands.HttpCatCommand)
  .whenTargetTagged('command', 'httpcat')

bind<BaseCommand>(TYPES.Command).to(applicationCommands.BoostInfoCommand)
  .whenTargetTagged('command', 'boostinfo')
bind<BaseCommand>(TYPES.Command).to(applicationCommands.DeleteSuggestionCommand)
  .whenTargetTagged('command', 'deletesuggestion')
bind<BaseCommand>(TYPES.Command).to(applicationCommands.GetShoutCommand)
  .whenTargetTagged('command', 'getshout')
bind<BaseCommand>(TYPES.Command).to(applicationCommands.MemberCountCommand)
  .whenTargetTagged('command', 'membercount')
bind<BaseCommand>(TYPES.Command).to(applicationCommands.PollCommand)
  .whenTargetTagged('command', 'poll')
bind<BaseCommand>(TYPES.Command).to(applicationCommands.SuggestCommand)
  .whenTargetTagged('command', 'suggest')
bind<BaseCommand>(TYPES.Command).to(applicationCommands.TagCommand)
  .whenTargetTagged('command', 'tag')
bind<BaseCommand>(TYPES.Command).to(applicationCommands.WhoIsCommand)
  .whenTargetTagged('command', 'whois')

bind<BaseCommand>(TYPES.Command).to(applicationCommands.ChannelLinksCommand)
  .whenTargetTagged('command', 'channellinks')
bind<BaseCommand>(TYPES.Command).to(applicationCommands.CloseTicketCommand)
  .whenTargetTagged('command', 'closeticket')
bind<BaseCommand>(TYPES.Command).to(applicationCommands.GroupsCommand)
  .whenTargetTagged('command', 'groups')
bind<BaseCommand>(TYPES.Command).to(applicationCommands.PanelsCommand)
  .whenTargetTagged('command', 'panels')
bind<BaseCommand>(TYPES.Command).to(applicationCommands.RoleBindingsCommand)
  .whenTargetTagged('command', 'rolebindings')
bind<BaseCommand>(TYPES.Command).to(applicationCommands.RoleMessagesCommand)
  .whenTargetTagged('command', 'rolemessages')
bind<BaseCommand>(TYPES.Command).to(applicationCommands.SetActivityCommand)
  .whenTargetTagged('command', 'setactivity')
bind<BaseCommand>(TYPES.Command).to(applicationCommands.SettingsCommand)
  .whenTargetTagged('command', 'settings')
bind<BaseCommand>(TYPES.Command).to(applicationCommands.TagsCommand)
  .whenTargetTagged('command', 'tags')
bind<BaseCommand>(TYPES.Command).to(applicationCommands.TicketTypesCommand)
  .whenTargetTagged('command', 'tickettypes')
bind<BaseCommand>(TYPES.Command).to(applicationCommands.ToggleSupportCommand)
  .whenTargetTagged('command', 'togglesupport')

bind<interfaces.Factory<BaseCommand>>(TYPES.CommandFactory).toFactory<BaseCommand | undefined, [string]>(
  (context: interfaces.Context) => {
    return (commandName: string) => {
      const command = context.container.getTagged<BaseCommand | undefined>(TYPES.Command, 'command', commandName)
      command?.setOptions(Reflect.getMetadata('options', command.constructor))
      return command
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
  .whenTargetNamed('announceTrainings')
bind<BaseJob>(TYPES.Job).to(jobs.HealthCheckJob)
  .whenTargetNamed('healthCheck')
bind<BaseJob>(TYPES.Job).to(jobs.PremiumMembersReportJob)
  .whenTargetNamed('premiumMembersReport')

bind<interfaces.AutoNamedFactory<BaseJob>>(TYPES.JobFactory).toAutoNamedFactory<BaseJob>(TYPES.Job)

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

// Managers
bind<managers.GroupRoleManager>(TYPES.Manager).to(managers.GroupRoleManager)
  .whenTargetNamed('GroupRoleManager')
bind<managers.GroupTextChannelManager>(TYPES.Manager).to(managers.GroupTextChannelManager)
  .whenTargetNamed('GroupTextChannelManager')
bind<managers.GuildContextManager>(TYPES.Manager).to(managers.GuildContextManager)
  .inSingletonScope()
  .whenTargetNamed('GuildContextManager')
bind<managers.GuildGroupManager>(TYPES.Manager).to(managers.GuildGroupManager)
  .whenTargetNamed('GuildGroupManager')
bind<managers.GuildPanelManager>(TYPES.Manager).to(managers.GuildPanelManager)
  .whenTargetNamed('GuildPanelManager')
bind<managers.GuildRoleBindingManager>(TYPES.Manager).to(managers.GuildRoleBindingManager)
  .whenTargetNamed('GuildRoleBindingManager')
bind<managers.GuildRoleMessageManager>(TYPES.Manager).to(managers.GuildRoleMessageManager)
  .whenTargetNamed('GuildRoleMessageManager')
bind<managers.GuildTagManager>(TYPES.Manager).to(managers.GuildTagManager)
  .whenTargetNamed('GuildTagManager')
bind<managers.GuildTicketManager>(TYPES.Manager).to(managers.GuildTicketManager)
  .whenTargetNamed('GuildTicketManager')
bind<managers.GuildTicketTypeManager>(TYPES.Manager).to(managers.GuildTicketTypeManager)
  .whenTargetNamed('GuildTicketTypeManager')
bind<managers.TagTagNameManager>(TYPES.Manager).to(managers.TagTagNameManager)
  .whenTargetNamed('TagTagNameManager')
bind<managers.TicketGuildMemberManager>(TYPES.Manager).to(managers.TicketGuildMemberManager)
  .whenTargetNamed('TicketGuildMemberManager')

bind<interfaces.Factory<managers.BaseManager<number | string, any, unknown>>>(TYPES.ManagerFactory)
  // eslint-disable-next-line no-extra-parens
  .toFactory<(...args: unknown[]) => managers.BaseManager<number | string, any, unknown>, [string]>(
  // @ts-expect-error
  (context: interfaces.Context) => {
    return <T extends managers.BaseManager<number | string, any, unknown>>(managerName: string) => {
      if (!context.container.isBoundNamed(TYPES.Manager, managerName)) {
        throw new Error(`Unknown manager ${managerName}.`)
      }
      return (...args: T['setOptions'] extends ((...args: infer P) => void) ? P : never[]) => {
        const manager = context.container.getNamed<T>(TYPES.Manager, managerName)
        manager.setOptions?.(...(args ?? []))
        return manager
      }
    }
  }
)

// Structures
bind<structures.ChannelGroup>(TYPES.Structure).to(structures.ChannelGroup)
  .whenTargetNamed('ChannelGroup')
bind<structures.Group>(TYPES.Structure).to(structures.Group)
  .whenTargetNamed('Group')
bind<structures.GuildContext>(TYPES.Structure).to(structures.GuildContext)
  .whenTargetNamed('GuildContext')
bind<structures.Panel>(TYPES.Structure).to(structures.Panel)
  .whenTargetNamed('Panel')
bind<structures.RoleBinding>(TYPES.Structure).to(structures.RoleBinding)
  .whenTargetNamed('RoleBinding')
bind<structures.RoleGroup>(TYPES.Structure).to(structures.RoleGroup)
  .whenTargetNamed('RoleGroup')
bind<structures.RoleMessage>(TYPES.Structure).to(structures.RoleMessage)
  .whenTargetNamed('RoleMessage')
bind<structures.Tag>(TYPES.Structure).to(structures.Tag)
  .whenTargetNamed('Tag')
bind<structures.TagName>(TYPES.Structure).to(structures.TagName)
  .whenTargetNamed('TagName')
bind<structures.Ticket>(TYPES.Structure).to(structures.Ticket)
  .whenTargetNamed('Ticket')
bind<structures.TicketType>(TYPES.Structure).to(structures.TicketType)
  .whenTargetNamed('TicketType')

bind<interfaces.Factory<structures.BaseStructure<any>>>(TYPES.StructureFactory)
  // eslint-disable-next-line no-extra-parens
  .toFactory<(...args: unknown[]) => structures.BaseStructure<any>, [string]>(
  (context: interfaces.Context) => {
    return <T extends structures.BaseStructure<any>>(structureName: string) => {
      if (!context.container.isBoundNamed(TYPES.Structure, structureName)) {
        throw new Error(`Unknown structure ${structureName}.`)
      }
      return (...args: Parameters<T['setOptions']>) => {
        const structure = context.container.getNamed<T>(TYPES.Structure, structureName)
        structure.setOptions(args[0], ...args.slice(1))
        return structure
      }
    }
  }
)

// Repositories
bind<Repository<entities.Channel>>(TYPES.ChannelRepository).toDynamicValue(() => {
  return dataSource.getRepository(entities.Channel)
})
bind<Repository<entities.Emoji>>(TYPES.EmojiRepository).toDynamicValue(() => {
  return dataSource.getRepository(entities.Emoji)
})
bind<Repository<entities.Group>>(TYPES.GroupRepository).toDynamicValue(() => {
  return dataSource.getRepository(entities.Group)
})
bind<Repository<entities.Guild>>(TYPES.GuildRepository).toDynamicValue(() => {
  return dataSource.getRepository(entities.Guild)
})
bind<Repository<entities.Member>>(TYPES.MemberRepository).toDynamicValue(() => {
  return dataSource.getRepository(entities.Member)
})
bind<Repository<entities.Message>>(TYPES.MessageRepository).toDynamicValue(() => {
  return dataSource.getRepository(entities.Message)
})
bind<Repository<entities.Panel>>(TYPES.PanelRepository).toDynamicValue(() => {
  return dataSource.getRepository(entities.Panel)
})
bind<Repository<entities.Role>>(TYPES.RoleRepository).toDynamicValue(() => {
  return dataSource.getRepository(entities.Role)
})
bind<Repository<entities.RoleBinding>>(TYPES.RoleBindingRepository).toDynamicValue(() => {
  return dataSource.getRepository(entities.RoleBinding)
})
bind<Repository<entities.RoleMessage>>(TYPES.RoleMessageRepository).toDynamicValue(() => {
  return dataSource.getRepository(entities.RoleMessage)
})
bind<Repository<entities.Tag>>(TYPES.TagRepository).toDynamicValue(() => {
  return dataSource.getRepository(entities.Tag)
})
bind<Repository<entities.TagName>>(TYPES.TagNameRepository).toDynamicValue(() => {
  return dataSource.getRepository(entities.TagName)
})
bind<Repository<entities.Ticket>>(TYPES.TicketRepository).toDynamicValue(() => {
  return dataSource.getRepository(entities.Ticket)
})
bind<Repository<entities.TicketType>>(TYPES.TicketTypeRepository).toDynamicValue(() => {
  return dataSource.getRepository(entities.TicketType)
})

// Services
bind<services.ChannelLinkService>(TYPES.ChannelLinkService).to(services.ChannelLinkService)
bind<services.PersistentRoleService>(TYPES.PersistentRoleService).to(services.PersistentRoleService)

export default container
