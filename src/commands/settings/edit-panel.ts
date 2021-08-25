import type { CommandoClient, CommandoMessage } from 'discord.js-commando'
import type { Panel, PanelUpdateOptions } from '../../structures'
import BaseCommand from '../base'
import { Message } from 'discord.js'

export default class EditPanelCommand extends BaseCommand {
  public constructor (client: CommandoClient) {
    super(client, {
      group: 'settings',
      name: 'editpanel',
      aliases: ['editpnl'],
      description: 'Edits a panel.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'panel',
        prompt: 'What panel would you like to edit?',
        type: 'panel'
      }, {
        key: 'key',
        type: 'string',
        prompt: 'What key would you like to edit?',
        oneOf: ['content', 'message'],
        parse: (val: string) => val.toLowerCase()
      }, {
        key: 'data',
        prompt: 'What would you like to edit this key\'s data to?',
        type: 'json-object|message'
      }]
    })
  }

  public async run (
    message: CommandoMessage,
    { panel, key, data }: {
      panel: Panel
      key: string
      data: object | Message
    }
  ): Promise<Message | Message[] | null> {
    const changes: PanelUpdateOptions = {}
    if (key === 'content') {
      if (data instanceof Message) {
        return await message.reply('`data` must be an object.')
      }

      changes.content = data
    } else if (key === 'message') {
      if (!(data instanceof Message)) {
        return await message.reply('`data` must be a message URL.')
      }

      changes.message = data
    }

    panel = await message.guild.panels.update(panel, changes)

    return await message.reply(`Successfully edited panel \`${panel.name}\`.`)
  }
}
