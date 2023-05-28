import { ApplicationCommandOptionType, type RESTPutAPIApplicationCommandsJSONBody } from 'discord.js'

const bansCommand: RESTPutAPIApplicationCommandsJSONBody[number] = {
  name: 'bans',
  description: 'Ban or unban a Roblox user',
  default_member_permissions: '0',
  dm_permission: false,
  options: [{
    name: 'create',
    description: 'Ban a Roblox user',
    type: ApplicationCommandOptionType.Subcommand,
    options: [{
      name: 'username',
      description: 'The username of the user to ban',
      type: ApplicationCommandOptionType.String,
      required: true
    }, {
      name: 'reason',
      description: 'The reason for this ban',
      type: ApplicationCommandOptionType.String,
      required: true
    }, {
      name: 'duration',
      description: 'The amount of days to ban this user',
      type: ApplicationCommandOptionType.Integer,
      min_value: 1,
      max_value: 7
    }]
  }, {
    name: 'delete',
    description: 'Unban a Roblox user',
    type: ApplicationCommandOptionType.Subcommand,
    options: [{
      name: 'username',
      description: 'The username of the user to unban',
      type: ApplicationCommandOptionType.String,
      required: true
    }, {
      name: 'reason',
      description: 'The reason for this unban',
      type: ApplicationCommandOptionType.String,
      required: true
    }]
  }, {
    name: 'edit',
    description: 'Edit a ban',
    type: ApplicationCommandOptionType.Subcommand,
    options: [{
      name: 'username',
      description: 'The username of the ban to edit',
      type: ApplicationCommandOptionType.String,
      required: true
    }, {
      name: 'key',
      description: 'The key of the ban to edit',
      type: ApplicationCommandOptionType.String,
      required: true,
      choices: [
        { name: 'author', value: 'author' },
        { name: 'reason', value: 'reason' }
      ]
    }, {
      name: 'value',
      description: 'The value to change this key to',
      type: ApplicationCommandOptionType.String,
      required: true
    }]
  }, {
    name: 'extend',
    description: 'Extend a ban',
    type: ApplicationCommandOptionType.Subcommand,
    options: [{
      name: 'username',
      description: 'The username of the ban to extend',
      type: ApplicationCommandOptionType.String,
      required: true
    }, {
      name: 'duration',
      description: 'The amount of days to extend this ban with',
      type: ApplicationCommandOptionType.Integer,
      required: true,
      min_value: 1,
      max_value: 7
    }, {
      name: 'reason',
      description: 'The reason for this extension',
      type: ApplicationCommandOptionType.String,
      required: true
    }]
  }, {
    name: 'list',
    description: 'List a specific ban or all bans',
    type: ApplicationCommandOptionType.Subcommand,
    options: [{
      name: 'username',
      description: 'The username of the ban to list',
      type: ApplicationCommandOptionType.String
    }]
  }]
}

export default bansCommand
