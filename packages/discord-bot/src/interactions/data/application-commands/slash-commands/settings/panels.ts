import {
  ApplicationCommandOptionType,
  ChannelType,
  type RESTPutAPIApplicationCommandsJSONBody
} from 'discord-api-types/v10'

const panelsCommand: RESTPutAPIApplicationCommandsJSONBody[number] = {
  name: 'panels',
  description: 'Create, edit, post, list or delete a panel',
  default_member_permissions: '0',
  dm_permission: false,
  options: [{
    name: 'create',
    description: 'Create a panel',
    type: ApplicationCommandOptionType.Subcommand,
    options: [{
      name: 'name',
      description: 'The name for the new panel',
      type: ApplicationCommandOptionType.String,
      required: true
    }, {
      name: 'content',
      description: 'The content for the new panel',
      type: ApplicationCommandOptionType.String,
      required: true
    }]
  }, {
    name: 'delete',
    description: 'Delete a panel',
    type: ApplicationCommandOptionType.Subcommand,
    options: [{
      name: 'id',
      description: 'The ID of the panel to delete',
      type: ApplicationCommandOptionType.String,
      required: true
    }]
  }, {
    name: 'edit',
    description: 'Edit a panel',
    type: ApplicationCommandOptionType.Subcommand,
    options: [{
      name: 'id',
      description: 'The ID of the panel to edit',
      type: ApplicationCommandOptionType.String,
      required: true
    }, {
      name: 'key',
      description: 'The key of the panel to edit',
      type: ApplicationCommandOptionType.String,
      required: true,
      choices: [
        { name: 'content', value: 'content' },
        { name: 'message', value: 'message' }
      ]
    }, {
      name: 'value',
      description: 'The value to change this key to',
      type: ApplicationCommandOptionType.String,
      required: true
    }]
  }, {
    name: 'post',
    description: 'Post a panel',
    type: ApplicationCommandOptionType.Subcommand,
    options: [{
      name: 'id',
      description: 'The ID of the panel to post',
      type: ApplicationCommandOptionType.String,
      required: true
    }, {
      name: 'channel',
      description: 'The channel to post the panel in',
      type: ApplicationCommandOptionType.Channel,
      channel_types: [ChannelType.GuildText]
    }]
  }, {
    name: 'list',
    description: 'List a specific panel or all panels',
    type: ApplicationCommandOptionType.Subcommand,
    options: [{
      name: 'id',
      description: 'The ID of the panel to list',
      type: ApplicationCommandOptionType.String
    }]
  }, {
    name: 'raw',
    description: 'Get the raw content of a panel',
    type: ApplicationCommandOptionType.Subcommand,
    options: [{
      name: 'id',
      description: 'The ID of the panel to get the raw content of',
      type: ApplicationCommandOptionType.String,
      required: true
    }]
  }]
}

export default panelsCommand
