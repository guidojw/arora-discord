import type { CommandoClient, CommandoMessage } from 'discord.js-commando'
import BaseCommand from '../base'
import type { Message } from 'discord.js'
import { MessageEmbed } from 'discord.js'
import type { Tag } from '../../structures'
import { util } from '../../util'

const { makeCommaSeparatedString } = util

export class TagsCommand extends BaseCommand {
  public constructor (client: CommandoClient) {
    super(client, {
      group: 'main',
      name: 'tags',
      aliases: ['tag'],
      description: 'Posts given tag.',
      examples: ['tag rr'],
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'tag',
        type: 'tag',
        prompt: 'What tag would you like to check out?',
        default: ''
      }]
    })
  }

  public async run (
    message: CommandoMessage,
    { tag }: { tag?: Tag }
  ): Promise<Message | Message[] | null> {
    if (typeof tag !== 'undefined') {
      return await message.reply(
        tag.content,
        { allowedMentions: { users: [message.author.id] } }
      )
    } else {
      let list = ''
      for (const tag of message.guild.tags.cache.values()) {
        list += `${tag.id}. ${makeCommaSeparatedString(tag.names.cache.map(tagName => `\`${tagName.name}\``))}\n`
      }

      const embed = new MessageEmbed()
        .setTitle('Tags')
        .setDescription(list)
        .setFooter(`Page 1/1 (${message.guild.tags.cache.size} entries)`)
        .setColor(message.guild.primaryColor ?? 0xffffff)
      return await message.replyEmbed(embed)
    }
  }
}
