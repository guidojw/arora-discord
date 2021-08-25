import type { CommandoClient, CommandoMessage } from 'discord.js-commando'
import type { Message, TextChannel } from 'discord.js'
import BaseCommand from '../base'
import type { Panel } from '../../structures'
import { argumentUtil } from '../../util'

const { validateNoneOrType, parseNoneOrType } = argumentUtil

export default class PostPanelCommand extends BaseCommand {
  public constructor (client: CommandoClient) {
    super(client, {
      group: 'settings',
      name: 'postpanel',
      aliases: ['postpnl'],
      description: 'Posts a panel in a channel.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'panel',
        prompt: 'What panel would you like to post?',
        type: 'panel'
      }, {
        key: 'channel',
        prompt: 'In what channel do you want to post this panel? Reply with "none" if you want to remove the panel ' +
          'from the channel it\'s posted in.',
        type: 'text-channel',
        validate: validateNoneOrType,
        parse: parseNoneOrType
      }]
    })
  }

  public async run (
    message: CommandoMessage,
    { panel, channel }: {
      panel: Panel
      channel?: TextChannel
    }
  ): Promise<Message | Message[] | null> {
    panel = await message.guild.panels.post(panel, channel)

    return await message.reply(typeof channel !== 'undefined'
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      ? `Successfully posted panel \`${panel.name}\` in ${channel.toString()}.`
      : `Successfully removed panel \`${panel.name}\` from channel.`
    )
  }
}
