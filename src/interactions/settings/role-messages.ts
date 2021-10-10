import { ApplicationCommandOptionType } from 'discord-api-types/v9'

const roleMessagesCommand = {
  name: 'rolemessages',
  description: 'Create, delete or list a role message',
  defaultPermission: false,
  options: [{
    name: 'create',
    description: 'Create a role message',
    type: ApplicationCommandOptionType.Subcommand,
    options: [{
      name: 'role',
      description: 'The role for the new role message',
      type: ApplicationCommandOptionType.Role,
      required: true
    }, {
      name: 'message',
      description: 'The message for the new role message',
      type: ApplicationCommandOptionType.String,
      required: true
    }, {
      name: 'emoji',
      description: 'The emoji for the new role message',
      type: ApplicationCommandOptionType.String,
      required: true
    }]
  }, {
    name: 'delete',
    description: 'Delete a role message',
    type: ApplicationCommandOptionType.Subcommand,
    options: [{
      name: 'id',
      description: 'The ID of the role message to delete',
      type: ApplicationCommandOptionType.Integer,
      required: true
    }]
  }, {
    name: 'list',
    description: 'List a specfic role message or all role messages',
    type: ApplicationCommandOptionType.Subcommand,
    options: [{
      name: 'id',
      description: 'The ID of the role message to list',
      type: ApplicationCommandOptionType.Integer
    }]
  }]
}

export default roleMessagesCommand