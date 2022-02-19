import type { BaseCommandInteraction, CommandInteraction, GuildMember } from 'discord.js'
import type { GuildContext, Tag } from '../../structures'
import { ApplyOptions } from '../../util/decorators'
import { Command } from '../base'
import type { CommandOptions } from '../base'
import { MessageEmbed } from 'discord.js'
import applicationConfig from '../../configs/application'
import { injectable } from 'inversify'
import { util } from '../../util'

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
  public async execute (
    interaction: CommandInteraction & BaseCommandInteraction<'cached'>,
    { tag, who }: { tag: Tag | null, who: GuildMember | null }
  ): Promise<void> {
    const context = this.client.guildContexts.resolve(interaction.guildId) as GuildContext

    if (tag !== null) {
      const memberMention = who?.toString()
      return await interaction.reply({
        content: typeof tag.content === 'string' ? `${memberMention ?? ''}${tag.content}` : memberMention ?? undefined,
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
        .setFooter(`Page 1/1 (${context.tags.cache.size} entries)`)
        .setColor(context.primaryColor ?? applicationConfig.defaultColor)
      return await interaction.reply({ embeds: [embed] })
    }
  }
}
