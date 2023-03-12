import { type CommandInteraction, Formatters } from 'discord.js'
import type { GuildContext, Tag, TagUpdateOptions } from '../../../../structures'
import { argumentUtil, constants } from '../../../../utils'
import { inject, injectable, named } from 'inversify'
import { ApplyOptions } from '../../../../utils/decorators'
import { GuildContextManager } from '../../../../managers'
import { SubCommandCommand } from '../base'
import type { SubCommandCommandOptions } from '..'

const { TYPES } = constants
const { validators, isObject, typeOf } = argumentUtil

@injectable()
@ApplyOptions<SubCommandCommandOptions<TagsCommand>>({
  subCommands: {
    create: {
      args: [
        { key: 'name' },
        {
          key: 'content',
          type: 'json-object|always',
          validate: validators([[isObject, typeOf('string')]])
        }
      ]
    },
    delete: {
      args: [{ key: 'id', name: 'tag', type: 'tag' }]
    },
    edit: {
      args: [
        { key: 'id', name: 'tag', type: 'tag' },
        {
          key: 'key',
          parse: (val: string) => val.toLowerCase()
        },
        { key: 'value', type: 'json-object|always' }
      ]
    },
    aliases: {
      create: {
        args: [
          { key: 'id', name: 'tag', type: 'tag' },
          { key: 'name' }
        ]
      },
      delete: {
        args: [
          { key: 'id', name: 'tag', type: 'tag' },
          { key: 'name' }
        ]
      }
    },
    raw: {
      args: [{ key: 'id', name: 'tag', type: 'tag' }]
    }
  }
})
export default class TagsCommand extends SubCommandCommand<TagsCommand> {
  @inject(TYPES.Manager)
  @named('GuildContextManager')
  private readonly guildContexts!: GuildContextManager

  public async create (
    interaction: CommandInteraction,
    { name, content }: { name: string, content: string | object }
  ): Promise<void> {
    if (!interaction.inGuild()) {
      return
    }
    const context = this.guildContexts.resolve(interaction.guildId) as GuildContext

    const tag = await context.tags.create(name, content)

    await interaction.reply(`Successfully created tag \`${tag.names.cache.first()?.name ?? 'Unknown'}\`.`)
  }

  public async delete (
    interaction: CommandInteraction<'raw' | 'cached'>,
    { tag }: { tag: Tag }
  ): Promise<void> {
    const context = this.guildContexts.resolve(interaction.guildId) as GuildContext

    await context.tags.delete(tag)

    await interaction.reply('Successfully deleted tag.')
  }

  public async edit (
    interaction: CommandInteraction<'raw' | 'cached'>,
    { tag, key, value }: {
      tag: Tag
      key: string
      value: string | object
    }
  ): Promise<void> {
    const context = this.guildContexts.resolve(interaction.guildId) as GuildContext

    const changes: TagUpdateOptions = {}
    if (key === 'content') {
      if (
        typeof value !== 'string' && Object.prototype.toString.call(JSON.parse(String(value))) !== '[object Object]'
      ) {
        await interaction.reply({ content: '`value` must be a string or object.', ephemeral: true })
        return
      }

      changes.content = value
    }

    tag = await context.tags.update(tag, changes)

    await interaction.reply(`Successfully edited tag \`${tag.names.cache.first()?.name ?? 'Unknown'}\`.`)
  }

  public aliases (
    interaction: CommandInteraction<'raw' | 'cached'>,
    subCommand: 'create',
    { tag, name }: { tag: Tag, name: string }
  ): Promise<void>
  public aliases (
    interaction: CommandInteraction<'raw' | 'cached'>,
    subCommand: 'delete',
    { name }: { name: string }
  ): Promise<void>
  public async aliases (
    interaction: CommandInteraction<'raw' | 'cached'>,
    subCommand: 'create' | 'delete',
    { tag, name }: { tag?: Tag, name: string }
  ): Promise<void> {
    switch (subCommand) {
      case 'create': {
        if (typeof tag === 'undefined') {
          return
        }

        const tagName = await tag.names.create(name)

        await interaction.reply(`Successfully created alias \`${tagName.name}\` for tag \`${tag.names.cache.first()?.name ?? 'Unknown'}\`.`)
        return
      }
      case 'delete': {
        const context = this.guildContexts.resolve(interaction.guildId) as GuildContext

        const tag = context.tags.resolve(name)
        if (tag === null) {
          await interaction.reply('Tag not found.')
          return
        }

        await tag.names.delete(name)

        await interaction.reply(`Successfully deleted alias from tag \`${tag.names.cache.first()?.name ?? 'Unknown'}\`.`)
      }
    }
  }

  public async raw (
    interaction: CommandInteraction<'raw' | 'cached'>,
    { tag }: { tag: Tag }
  ): Promise<void> {
    await interaction.reply({
      content: Formatters.codeBlock(tag._content),
      allowedMentions: { users: [interaction.user.id] }
    })
  }
}
