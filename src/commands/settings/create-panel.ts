import type { CommandoClient, CommandoMessage } from 'discord.js-commando'
import BaseCommand from '../base'
import type { Message } from 'discord.js'
import { argumentUtil } from '../../util'

const { validators, isObject, noNumber, noSpaces } = argumentUtil

export default class CreatePanelCommand extends BaseCommand {
  public constructor (client: CommandoClient) {
    super(client, {
      group: 'settings',
      name: 'createpanel',
      aliases: ['createpnl'],
      description: 'Creates a new panel.',
      details: 'For the content argument, you should input a JSON format embed object. You can use the Embed ' +
        'Visualizer at <https://leovoel.github.io/embed-visualizer/> to create one. When finished, copy the object ' +
        '(denoted with {}) on the left output screen after "embed: ".',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'name',
        prompt: 'What do you want the name of the panel to be?',
        type: 'string',
        validate: validators([noNumber, noSpaces])
      }, {
        key: 'content',
        prompt: 'What do you want the content of the panel to be?',
        type: 'json-object',
        validate: validators([isObject])
      }]
    })
  }

  public async run (
    message: CommandoMessage,
    { name, content }: {
      name: string
      content: object
    }
  ): Promise<Message | Message[] | null> {
    const panel = await message.guild.panels.create(name, content)

    return await message.reply(`Successfully created panel \`${panel.name}\`.`)
  }
}
