import {
  type AutocompleteInteraction,
  type ChatInputCommandInteraction,
  EmbedBuilder,
  type GuildMember
} from 'discord.js'
import type { GuildContext, Tag } from '../../../../structures'
import { constants, util } from '../../../../utils'
import { inject, injectable, named } from 'inversify'
import { ApplyOptions } from '../../../../utils/decorators'
import { Command } from '../base'
import type { CommandOptions } from '..'
import { GuildContextManager } from '../../../../managers'
import applicationConfig from '../../../../configs/application'

const { TYPES } = constants
const { makeCommaSeparatedString } = util

@injectable()
@ApplyOptions<CommandOptions>({
  command: {
    args: [
      {
        key: 'query',
        name: 'tag',
        type: 'tag',
        required: false
      },
      { key: 'who', required: false }
    ]
  }
})
export default class TagsCommand extends Command {
  @inject(TYPES.Manager)
  @named('GuildContextManager')
  private readonly guildContexts!: GuildContextManager

  public async execute (
    interaction: ChatInputCommandInteraction,
    { tag, who }: { tag: Tag | null, who: GuildMember | null }
  ): Promise<void> {
    if (!interaction.inGuild()) {
      return
    }
    const context = this.guildContexts.resolve(interaction.guildId) as GuildContext

    if (tag !== null) {
      const memberMention = who?.toString()
      await interaction.reply({
        content: typeof tag.content === 'string' ? `${typeof memberMention !== 'undefined' ? `${memberMention}, ` : ''}${tag.content}` : memberMention ?? undefined,
        embeds: typeof tag.content !== 'string' ? [tag.content] : undefined,
        allowedMentions: { users: [who?.id ?? interaction.user.id] }
      })
    } else {
      let list = ''
      for (const tag of context.tags.cache.values()) {
        list += `${tag.id}. ${makeCommaSeparatedString(tag.names.cache.map(tagName => `\`${tagName.name}\``))}\n`
      }

      const embed = new EmbedBuilder()
        .setTitle('Tags')
        .setDescription(list)
        .setFooter({ text: `Page 1/1 (${context.tags.cache.size} entries)` })
        .setColor(context.primaryColor ?? applicationConfig.defaultColor)
      await interaction.reply({ embeds: [embed] })
    }
  }

  public override async autocomplete (interaction: AutocompleteInteraction): Promise<void> {
    if (!interaction.inGuild()) {
      return
    }
    const context = this.guildContexts.resolve(interaction.guildId) as GuildContext

    const option = interaction.options.getFocused(true)
    if (option.name === 'query') {
      const results = context.tags.cache.reduce<string[]>((result, tag) => {
        result.push(...tag.names.cache.filter(tagName => (
          tagName.name.toLowerCase().startsWith(option.value))
        ).map(tagName => tagName.name))
        return result
      }, [])
      console.log(results)
      await interaction.respond(results.map(result => ({ name: result, value: result })))
      return
    }

    await super.autocomplete(interaction)
  }
}
