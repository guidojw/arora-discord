import { ApplicationCommandOptionType, type RESTPutAPIApplicationCommandsJSONBody } from 'discord.js'

const trainsCommand: RESTPutAPIApplicationCommandsJSONBody[number] = {
  name: 'trains',
  description: 'Manage trains',
  default_member_permissions: '0',
  dm_permission: false,
  options: [{
    name: 'list',
    description: 'List all available trains',
    type: ApplicationCommandOptionType.Subcommand
  }, {
    name: 'inventory',
    description: 'Manage a user\'s inventory',
    type: ApplicationCommandOptionType.SubcommandGroup,
    options: [{
      name: 'list',
      description: 'List trains',
      type: ApplicationCommandOptionType.Subcommand,
      options: [{
        name: 'username',
        description: 'Username of the user to list the trains in their inventory of',
        type: ApplicationCommandOptionType.String,
        required: true
      }]
    }, {
      name: 'add',
      description: 'Add a train',
      type: ApplicationCommandOptionType.Subcommand,
      options: [{
        name: 'username',
        description: 'Username of the user to add a train to their inventory',
        type: ApplicationCommandOptionType.String,
        required: true
      }, {
        name: 'name',
        description: 'The name of the train to add to the user\'s inventory (search by name or country)',
        type: ApplicationCommandOptionType.String,
        required: true,
        autocomplete: true
      }]
    }, {
      name: 'remove',
      description: 'Remove a train',
      type: ApplicationCommandOptionType.Subcommand,
      options: [{
        name: 'username',
        description: 'Username of the user to remove a train from their inventory',
        type: ApplicationCommandOptionType.String,
        required: true
      }, {
        name: 'name',
        description: 'The name of the train to remove from the user\'s inventory (search by name or country)',
        type: ApplicationCommandOptionType.String,
        required: true,
        autocomplete: true
      }]
    }]
  }, {
    name: 'raw',
    description: 'Get the raw trains output',
    type: ApplicationCommandOptionType.Subcommand
  }]
}

export default trainsCommand
