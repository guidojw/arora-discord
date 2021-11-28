import type { CommandoClient, CommandoMessage } from 'discord.js-commando'
import { type Message, MessageEmbed } from 'discord.js'
import BaseCommand from '../base'
import type { Tag } from '../../structures'
import applicationConfig from '../../configs/application'
import { util } from '../../util'

const { makeCommaSeparatedString } = util

export default class TagsCommand extends BaseCommand {
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
    { tag }: { tag: Tag | '' }
  ): Promise<Message | Message[] | null> {
    if (tag !== '') {
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
        .setColor(message.guild.primaryColor ?? applicationConfig.defaultColor)
      return await message.replyEmbed(embed)
    }
  }
}
