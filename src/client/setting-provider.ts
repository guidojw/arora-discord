import type { Command, CommandGroup, CommandoClient, CommandoGuild } from 'discord.js-commando'
import type { Command as CommandEntity, GuildCommand as GuildCommandEntity, Guild as GuildEntity } from '../entities'
import { inject, injectable } from 'inversify'
import type { Repository } from 'typeorm'
import { SettingProvider } from 'discord.js-commando'
import type { Snowflake } from 'discord.js'
import { constants } from '../util'

const { CommandType, TYPES } = constants

declare module 'discord.js-commando' {
  interface SettingProvider {
    setupGuild: (guildId: Snowflake) => Promise<void>
    onCommandPrefixChange: (guild: CommandoGuild | null, prefix: string | null) => Promise<void>
    onCommandStatusChange: (
      guild: CommandoGuild | null,
      commandOrGroup: Command | CommandGroup,
      enabled: boolean
    ) => Promise<void>
  }
}

@injectable()
// @ts-expect-error
export default class AroraProvider extends SettingProvider {
  @inject(TYPES.CommandRepository) private readonly commandRepository!: Repository<CommandEntity>
  @inject(TYPES.GuildCommandRepository) private readonly guildCommandRepository!: Repository<GuildCommandEntity>
  @inject(TYPES.GuildRepository) private readonly guildRepository!: Repository<GuildEntity>

  private client!: CommandoClient

  public async init (client: CommandoClient): Promise<void> {
    this.client = client

    const settings = await this.commandRepository.find()
    for (const command of client.registry.commands.values()) {
      await this.setupCommand(command, settings)
    }
    for (const group of client.registry.groups.values()) {
      await this.setupGroup(group, settings)
    }

    for (const guildId of client.guilds.cache.keys()) {
      await this.setupGuild(guildId)
    }
    await this.setupGuild('0') // global settings
  }

  // @ts-expect-error
  public override async setupGuild (guildId: Snowflake): Promise<void> {
    const guild = this.client.guilds.resolve(guildId) as CommandoGuild | null
    const data = await this.guildRepository.findOne(
      guildId,
      {
        relations: [
          'channels',
          'groups',
          'groups.channels',
          'groups.permissions',
          'groups.roles',
          'guildCommands',
          'guildCommands.commands',
          'panels',
          'panels.message',
          'roleBindings',
          'roleMessages',
          'roleMessages.message',
          'roles',
          'roles.permissions',
          'tags',
          'tags.names',
          'tickets',
          'tickets.moderators',
          'tickets.author',
          'ticketTypes',
          'ticketTypes.message'
        ]
      }
    ) ?? await this.guildRepository.save(this.guildRepository.create({ id: guildId }))
    if (typeof data.guildCommands === 'undefined') {
      data.guildCommands = []
    }

    if (guild !== null) {
      guild.setup(data)
    }

    if (data.commandPrefix !== null) {
      if (guild !== null) {
        // @ts-expect-error
        guild._commandPrefix = data.commandPrefix
      } else {
        // @ts-expect-error
        this.client._commandPrefix = data.commandPrefix
      }
    }

    for (const command of this.client.registry.commands.values()) {
      this.setupGuildCommand(guild, command, data.guildCommands)
    }
    for (const group of this.client.registry.groups.values()) {
      this.setupGuildGroup(guild, group, data.guildCommands)
    }

    if (guild !== null) {
      await guild.init()
    }
  }

  private async setupCommand (command: Command, settings: CommandEntity[]): Promise<void> {
    const commandSettings = settings.find(cmd => cmd.type === CommandType.Command && cmd.name === command.name) ??
      await this.commandRepository.save(this.commandRepository.create({
        name: command.name,
        type: CommandType.Command
      }))
    command.aroraId = commandSettings.id
  }

  private async setupGroup (group: CommandGroup, settings: CommandEntity[]): Promise<void> {
    const groupSettings = settings.find(grp => grp.type === CommandType.Group && grp.name === group.id) ??
      await this.commandRepository.save(this.commandRepository.create({
        name: group.id,
        type: CommandType.Group
      }))
    group.aroraId = groupSettings.id
  }

  private setupGuildCommand (guild: CommandoGuild | null, command: Command, settings: GuildCommandEntity[]): void {
    if (!command.guarded) {
      const commandSettings = settings.find(cmd => (
        cmd.command?.type === CommandType.Command && cmd.command?.name === command.name
      ))
      if (typeof commandSettings !== 'undefined') {
        if (guild !== null) {
          // @ts-expect-error
          if (typeof guild._commandsEnabled === 'undefined') {
            // @ts-expect-error
            guild._commandsEnabled = {}
          }
          // @ts-expect-error
          guild._commandsEnabled[command.name] = commandSettings.enabled
        } else {
          // @ts-expect-error
          command._globalEnabled = commandSettings.enabled
        }
      }
    }
  }

  private setupGuildGroup (guild: CommandoGuild | null, group: CommandGroup, settings: GuildCommandEntity[]): void {
    if (!group.guarded) {
      const groupSettings = settings.find(grp => (
        grp.command?.type === CommandType.Group && grp.command?.name === group.id
      ))
      if (guild !== null) {
        // @ts-expect-error
        if (typeof guild._groupsEnabled === 'undefined') {
          // @ts-expect-error
          guild._groupsEnabled = {}
        }
        // @ts-expect-error
        guild._groupsEnabled[group.id] = groupSettings?.enabled ?? false
      } else {
        // @ts-expect-error
        group._globalEnabled = groupSettings?.enabled ?? false
      }
    }
  }

  // @ts-expect-error
  public override async onCommandPrefixChange (guild: CommandoGuild | null, prefix: string | null): Promise<void> {
    if (guild === null) {
      await this.guildRepository.save(this.guildRepository.create({ id: '0', commandPrefix: prefix }))
      return
    }
    await guild.update({ commandPrefix: prefix })
  }

  // @ts-expect-error
  public override async onCommandStatusChange (
    guild: CommandoGuild | null,
    commandOrGroup: Command | CommandGroup,
    enabled: boolean
  ): Promise<void> {
    // @ts-expect-error
    const guildId = AroraProvider.getGuildID(guild)
    await this.guildCommandRepository.save(this.guildCommandRepository.create({
      commandId: commandOrGroup.aroraId,
      guildId: guildId !== 'global' ? guildId : '0',
      enabled
    }))
  }
}
