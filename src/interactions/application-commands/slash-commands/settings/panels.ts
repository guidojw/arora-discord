import { type ChatInputCommandInteraction, Message, type TextChannel, codeBlock } from 'discord.js'
import type { GuildContext, Panel, PanelUpdateOptions } from '../../../../structures'
import { argumentUtil, constants } from '../../../../utils'
import { inject, injectable, named } from 'inversify'
import { ApplyOptions } from '../../../../utils/decorators'
import { GuildContextManager } from '../../../../managers'
import { SubCommandCommand } from '../base'
import type { SubCommandCommandOptions } from '..'
import { discordService } from '../../../../services'

const { TYPES } = constants
const { validators, isObject, noNumber, noWhitespace } = argumentUtil

@injectable()
@ApplyOptions<SubCommandCommandOptions<PanelsCommand>>({
  subCommands: {
    create: {
      args: [
        {
          key: 'name',
          validate: validators([noNumber, noWhitespace])
        },
        {
          key: 'content',
          type: 'json-object',
          validate: validators([isObject])
        }
      ]
    },
    delete: {
      args: [{ key: 'id', name: 'panel', type: 'panel' }]
    },
    edit: {
      args: [
        { key: 'id', name: 'panel', type: 'panel' },
        {
          key: 'key',
          parse: (val: string) => val.toLowerCase()
        },
        { key: 'value', type: 'json-object|message' }
      ]
    },
    post: {
      args: [
        { key: 'id', name: 'panel', type: 'panel' },
        { key: 'channel', required: false }
      ]
    },
    list: {
      args: [
        {
          key: 'id',
          name: 'panel',
          type: 'panel',
          required: false
        }
      ]
    },
    raw: {
      args: [{ key: 'id', name: 'panel', type: 'panel' }]
    }
  }
})
export default class PanelsCommand extends SubCommandCommand<PanelsCommand> {
  @inject(TYPES.Manager)
  @named('GuildContextManager')
  private readonly guildContexts!: GuildContextManager

  public async create (
    interaction: ChatInputCommandInteraction,
    { name, content }: {
      name: string
      content: object
    }
  ): Promise<void> {
    if (!interaction.inGuild()) {
      return
    }
    const context = this.guildContexts.resolve(interaction.guildId) as GuildContext

    const panel = await context.panels.create(name, content)

    await interaction.reply(`Successfully created panel \`${panel.name}\`.`)
  }

  public async delete (
    interaction: ChatInputCommandInteraction<'raw' | 'cached'>,
    { panel }: { panel: Panel }
  ): Promise<void> {
    const context = this.guildContexts.resolve(interaction.guildId) as GuildContext

    await context.panels.delete(panel)

    await interaction.reply('Successfully deleted panel.')
  }

  public async edit (
    interaction: ChatInputCommandInteraction<'raw' | 'cached'>,
    { panel, key, value }: {
      panel: Panel
      key: string
      value: object | Message
    }
  ): Promise<void> {
    const context = this.guildContexts.resolve(interaction.guildId) as GuildContext

    const changes: PanelUpdateOptions = {}
    if (key === 'content') {
      if (value instanceof Message) {
        await interaction.reply({ content: '`value` must be an object.', ephemeral: true })
        return
      }

      changes.content = value
    } else if (key === 'message') {
      if (!(value instanceof Message)) {
        await interaction.reply({ content: '`value` must be a message URL.', ephemeral: true })
        return
      }

      changes.message = value
    }

    panel = await context.panels.update(panel, changes)

    await interaction.reply(`Successfully edited panel \`${panel.name}\`.`)
  }

  public async post (
    interaction: ChatInputCommandInteraction<'raw' | 'cached'>,
    { panel, channel }: {
      panel: Panel
      channel: TextChannel | null
    }
  ): Promise<void> {
    const context = this.guildContexts.resolve(interaction.guildId) as GuildContext

    panel = await context.panels.post(panel, channel ?? undefined)

    await interaction.reply(channel !== null
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      ? `Successfully posted panel \`${panel.name}\` in ${channel.toString()}.`
      : `Successfully removed panel \`${panel.name}\` from channel.`
    )
  }

  public async list (
    interaction: ChatInputCommandInteraction,
    { panel }: { panel: Panel | null }
  ): Promise<void> {
    if (!interaction.inGuild()) {
      return
    }
    const context = this.guildContexts.resolve(interaction.guildId) as GuildContext

    if (panel !== null) {
      await interaction.reply({ embeds: [panel.embed] })
    } else {
      if (context.panels.cache.size === 0) {
        await interaction.reply('No panels found.')
        return
      }

      const embeds = discordService.getListEmbeds(
        'Panels',
        context.panels.cache.values(),
        getPanelRow
      )
      await interaction.reply({ embeds })
    }
  }

  public async raw (
    interaction: ChatInputCommandInteraction<'raw' | 'cached'>,
    { panel }: { panel: Panel }
  ): Promise<void> {
    await interaction.reply({
      content: codeBlock(panel.content),
      allowedMentions: { users: [interaction.user.id] }
    })
  }
}

function getPanelRow (panel: Panel): string {
  return `${panel.id}. \`${panel.name}\``
}
