import { ApplicationCommandOptionType, type RESTPutAPIApplicationCommandsJSONBody } from 'discord-api-types/v9'

const ticketTypesCommand: RESTPutAPIApplicationCommandsJSONBody[number] = {
  name: 'tickettypes',
  description: 'Create, link, delete or list a ticket type',
  default_permission: false,
  options: [{
    name: 'create',
    description: 'Create a ticket type',
    type: ApplicationCommandOptionType.Subcommand,
    options: [{
      name: 'name',
      description: 'The name for the new ticket type',
      type: ApplicationCommandOptionType.String,
      required: true
    }]
  }, {
    name: 'delete',
    description: 'Delete a ticket type',
    type: ApplicationCommandOptionType.Subcommand,
    options: [{
      name: 'id',
      description: 'The ID of the ticket type to delete',
      type: ApplicationCommandOptionType.String,
      required: true
    }]
  }, {
    name: 'link',
    description: 'Link a ticket type',
    type: ApplicationCommandOptionType.Subcommand,
    options: [{
      name: 'id',
      description: 'The ID of the ticket type to link',
      type: ApplicationCommandOptionType.String,
      required: true
    }, {
      name: 'emoji',
      description: 'The emoji to link to this ticket type',
      type: ApplicationCommandOptionType.String,
      required: true
    }, {
      name: 'message',
      description: 'The message to link this ticket type on',
      type: ApplicationCommandOptionType.String,
      required: true
    }]
  }, {
    name: 'unlink',
    description: 'Unlink a ticket type',
    type: ApplicationCommandOptionType.Subcommand,
    options: [{
      name: 'id',
      description: 'The ID of the ticket type to unlink',
      type: ApplicationCommandOptionType.String,
      required: true
    }]
  }, {
    name: 'list',
    description: 'List a specific ticket type or all ticket types',
    type: ApplicationCommandOptionType.Subcommand,
    options: [{
      name: 'id',
      description: 'The ID of the ticket type to list',
      type: ApplicationCommandOptionType.String
    }]
  }]
}

export default ticketTypesCommand
