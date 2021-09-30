import { ApplicationCommandOptionType } from 'discord-api-types/v9'

const bansCommand = {
  name: 'bans',
  description: 'Ban or unban a Roblox user',
  defaultPermission: false,
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
      name: 'duration',
      description: 'The amount of days to ban this user',
      type: ApplicationCommandOptionType.Integer,
      choices: [
        { name: '1 day', value: 1 },
        { name: '2 days', value: 2 },
        { name: '3 days', value: 3 },
        { name: '4 days', value: 4 },
        { name: '5 days', value: 5 },
        { name: '6 days', value: 6 },
        { name: '7 days', value: 7 }
      ]
    }, {
      name: 'reason',
      description: 'The reason for this ban',
      type: ApplicationCommandOptionType.String,
      required: true
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
      choices: [
        { name: '-6 day', value: -6 },
        { name: '-5 day', value: -5 },
        { name: '-4 day', value: -4 },
        { name: '-3 day', value: -3 },
        { name: '-2 day', value: -2 },
        { name: '-1 day', value: -1 },
        { name: '1 day', value: 1 },
        { name: '2 days', value: 2 },
        { name: '3 days', value: 3 },
        { name: '4 days', value: 4 },
        { name: '5 days', value: 5 },
        { name: '6 days', value: 6 }
      ]
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
