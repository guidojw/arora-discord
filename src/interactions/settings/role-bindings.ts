import { ApplicationCommandOptionType } from 'discord-api-types/v9'

const roleBindingsCommand = {
  name: 'rolebindings',
  description: 'Create, delete or list a role binding',
  defaultPermission: false,
  options: [{
    name: 'create',
    description: 'Create a role binding',
    type: ApplicationCommandOptionType.Subcommand,
    options: [{
      name: 'role',
      description: 'The role for the new role binding',
      type: ApplicationCommandOptionType.Role,
      required: true
    }, {
      name: 'min',
      description: 'The (minimum) rank for the new role binding',
      type: ApplicationCommandOptionType.Integer,
      required: true
    }, {
      name: 'max',
      description: 'The maximum rank for the new role binding',
      type: ApplicationCommandOptionType.Integer
    }]
  }, {
    name: 'delete',
    description: 'Delete a role binding',
    type: ApplicationCommandOptionType.Subcommand,
    options: [{
      name: 'id',
      description: 'The ID of the role binding to delete',
      type: ApplicationCommandOptionType.Integer,
      required: true
    }]
  }, {
    name: 'list',
    description: 'List a specific role binding or all role bindings',
    type: ApplicationCommandOptionType.Subcommand,
    options: [{
      name: 'id',
      description: 'The ID of the role binding to list',
      type: ApplicationCommandOptionType.Integer
    }]
  }]
}

export default roleBindingsCommand
