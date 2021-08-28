import type { ActivityType, Message } from 'discord.js'
import type { CommandoClient, CommandoMessage } from 'discord.js-commando'
import BaseCommand from '../base'
import { Constants } from 'discord.js'
import { argumentUtil } from '../../util'

const { ActivityTypes } = Constants
const { parseNoneOrType, urlRegex, validateNoneOrType } = argumentUtil

const endUrlRegex = new RegExp(`(?:\\s*)${urlRegex.toString().slice(1, -3)}$`, 'i')

export default class SetActivityCommand extends BaseCommand {
  public constructor (client: CommandoClient) {
    super(client, {
      group: 'settings',
      name: 'setactivity',
      aliases: ['activity'],
      description: 'Sets the bot\'s activity.',
      details: 'Can only be used if the bot is in exactly one guild. If you choose activity type "STREAMING", the ' +
        'bot will look for an URL at the end of your input for the name argument, remove it and use it as streaming ' +
        'link.',
      clientPermissions: ['SEND_MESSAGES'],
      userPermissions: ['ADMINISTRATOR'],
      requiresSingleGuild: true,
      args: [{
        key: 'name',
        type: 'string',
        prompt: 'What do you want the name of the activity to be? Reply with "none" if you want to change the ' +
          'activity back to the default one.',
        parse: parseNoneOrType
      }, {
        key: 'type',
        type: 'string',
        prompt: 'What activity type do you want to use? Reply with "none" if you replied "none" to the previous ' +
          'question as well.',
        oneOf: ActivityTypes
          .filter(type => type !== 'CUSTOM_STATUS')
          .map(type => type.toLowerCase()),
        validate: validateNoneOrType,
        parse: (type: Lowercase<Exclude<ActivityType, 'CUSTOM_STATUS'>> | 'none') => (
          type === 'none' ? undefined : type.toUpperCase()
        )
      }],
      throttling: {
        usages: 1,
        duration: 10 * 60
      }
    })
  }

  public async run (
    message: CommandoMessage,
    { name, type }: {
      name?: string
      type?: ActivityType
    }
  ): Promise<Message | Message[] | null> {
    if (typeof name === 'undefined' || typeof type === 'undefined') {
      await this.client.startActivityCarousel()

      return await message.reply('Successfully set activity back to default.')
    } else {
      const options: { type: ActivityType, url?: string } = { type }
      if (type === 'STREAMING') {
        const match = name.match(endUrlRegex)
        if (match === null) {
          return await message.reply('No URL specified.')
        }
        name = name.replace(endUrlRegex, '')
        if (name === '') {
          return await message.reply('Name cannot be empty.')
        }
        options.url = match[1]
      }

      this.client.stopActivityCarousel()
      await this.client.user?.setActivity(name, options)

      return await message.reply(`Successfully set activity to \`${type} ${name}\`.`)
    }
  }
}
