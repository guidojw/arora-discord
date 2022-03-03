import { Command, type CommandOptions } from '../base'
import { type CommandInteraction, type GuildMember, MessageEmbed } from 'discord.js'
import type { GuildContext, Tag } from '../../structures'
import { constants, util } from '../../utils'
import { inject, injectable, named } from 'inversify'
import { ApplyOptions } from '../../utils/decorators'
import type { GuildContextManager } from '../../managers'
import applicationConfig from '../../configs/application'

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
    interaction: CommandInteraction,
    { tag, who }: { tag: Tag | null, who: GuildMember | null }
  ): Promise<void> {
    if (!interaction.inGuild()) {
      return
    }
    const context = this.guildContexts.resolve(interaction.guildId) as GuildContext

    if (tag !== null) {
      const memberMention = who?.toString()
      return await interaction.reply({
        content: typeof tag.content === 'string' ? `${typeof memberMention !== 'undefined' ? `${memberMention}, ` : ''}${tag.content}` : memberMention ?? undefined,
        embeds: typeof tag.content !== 'string' ? [tag.content] : undefined,
        allowedMentions: { users: [who?.id ?? interaction.user.id] }
      })
    } else {
      let list = ''
      for (const tag of context.tags.cache.values()) {
        list += `${tag.id}. ${makeCommaSeparatedString(tag.names.cache.map(tagName => `\`${tagName.name}\``))}\n`
      }

      const embed = new MessageEmbed()
        .setTitle('Tags')
        .setDescription(list)
        .setFooter({ text: `Page 1/1 (${context.tags.cache.size} entries)` })
        .setColor(context.primaryColor ?? applicationConfig.defaultColor)
      return await interaction.reply({ embeds: [embed] })
    }
  }
}
