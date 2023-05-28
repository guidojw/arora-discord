import { ApplicationCommandOptionType, type RESTPutAPIApplicationCommandsJSONBody } from 'discord.js'

const exilesCommand: RESTPutAPIApplicationCommandsJSONBody[number] = {
  name: 'exiles',
  description: 'Exile or unexile a Roblox user',
  default_member_permissions: '0',
  dm_permission: false,
  options: [{
    name: 'create',
    description: 'Exile a Roblox user',
    type: ApplicationCommandOptionType.Subcommand,
    options: [{
      name: 'username',
      description: 'The username of the user to exile',
      type: ApplicationCommandOptionType.String,
      required: true
    }, {
      name: 'reason',
      description: 'The reason for this exile',
      type: ApplicationCommandOptionType.String,
      required: true
    }]
  }, {
    name: 'delete',
    description: 'Unexile a Roblox user',
    type: ApplicationCommandOptionType.Subcommand,
    options: [{
      name: 'username',
      description: 'The username of the user to unexile',
      type: ApplicationCommandOptionType.String,
      required: true
    }, {
      name: 'reason',
      description: 'The reason for this unexile',
      type: ApplicationCommandOptionType.String,
      required: true
    }]
  }, {
    name: 'list',
    description: 'List a specific exile or all exiles',
    type: ApplicationCommandOptionType.Subcommand,
    options: [{
      name: 'username',
      description: 'The username of the exile to list',
      type: ApplicationCommandOptionType.String
    }]
  }]
}

export default exilesCommand
