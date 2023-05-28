import { ApplicationCommandOptionType, type RESTPutAPIApplicationCommandsJSONBody } from 'discord.js'

const roleMessagesCommand: RESTPutAPIApplicationCommandsJSONBody[number] = {
  name: 'rolemessages',
  description: 'Create, delete or list a role message',
  default_member_permissions: '0',
  dm_permission: false,
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
      type: ApplicationCommandOptionType.String,
      required: true
    }]
  }, {
    name: 'list',
    description: 'List a specfic role message or all role messages',
    type: ApplicationCommandOptionType.Subcommand,
    options: [{
      name: 'id',
      description: 'The ID of the role message to list',
      type: ApplicationCommandOptionType.String
    }]
  }]
}

export default roleMessagesCommand
