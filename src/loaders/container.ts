import { AsyncContainerModule, Container } from 'inversify'
import { Member, Permission, Tag, TagName, Ticket, TicketType } from '../entities'
import { createConnection, getRepository } from 'typeorm'
import { eventHandlers, packetHandlers } from '../client'
import type { BaseHandler } from '../client'
import type { Repository } from 'typeorm'
import { constants } from '../util'
import type { interfaces } from 'inversify'

const { TYPES } = constants

export default async function init (): Promise<Container> {
  const container = new Container()

  const bindings = new AsyncContainerModule(async bind => {
    await createConnection()

    // Event Handlers
    bind<BaseHandler>(TYPES.Handler).to(eventHandlers.ChannelDeleteEventHandler)
      .whenTargetTagged('eventHandler', 'channelDelete')
    bind<BaseHandler>(TYPES.Handler).to(eventHandlers.CommandCancelEventHandler)
      .whenTargetTagged('eventHandler', 'commandCancel')
    bind<BaseHandler>(TYPES.Handler).to(eventHandlers.CommandErrorEventHandler)
      .whenTargetTagged('eventHandler', 'commandError')
    bind<BaseHandler>(TYPES.Handler).to(eventHandlers.ChannelDeleteEventHandler)
      .whenTargetTagged('eventHandler', 'channelDelete')
    bind<BaseHandler>(TYPES.Handler).to(eventHandlers.CommandPrefixChangeEventHandler)
      .whenTargetTagged('eventHandler', 'commandPrefix')
    bind<BaseHandler>(TYPES.Handler).to(eventHandlers.CommandRunEventHandler)
      .whenTargetTagged('eventHandler', 'commandRun')
    bind<BaseHandler>(TYPES.Handler).to(eventHandlers.CommandStatusChangeEventHandler)
      .whenTargetTagged('eventHandler', 'commandStatusChane')
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

    bind<interfaces.Factory<BaseHandler>>(TYPES.EventHandlerFactory).toFactory<BaseHandler>(
      (context: interfaces.Context) => {
        return (eventName: string) => {
          return context.container.getTagged<BaseHandler>(TYPES.Handler, 'eventHandler', eventName)
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
    bind<Repository<Member>>(TYPES.MemberRepository).toDynamicValue(() => {
      return getRepository(Member)
    })
    bind<Repository<Permission>>(TYPES.PermissionRepository).toDynamicValue(() => {
      return getRepository(Permission)
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
  })
  await container.loadAsync(bindings)

  return container
}
