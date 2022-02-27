import {
  ApplicationCommandOptionType,
  ChannelType,
  type RESTPutAPIApplicationCommandsJSONBody
} from 'discord-api-types/v9'

const groupsCommand: RESTPutAPIApplicationCommandsJSONBody[number] = {
  name: 'groups',
  description: 'Create, edit, delete or list a group',
  default_permission: false,
  options: [{
    name: 'create',
    description: 'Create a group',
    type: ApplicationCommandOptionType.Subcommand,
    options: [{
      name: 'name',
      description: 'The name for the new group',
      type: ApplicationCommandOptionType.String,
      required: true
    }, {
      name: 'type',
      description: 'The type for the new group',
      type: ApplicationCommandOptionType.String,
      required: true,
      choices: [
        { name: 'channel', value: 'channel' },
        { name: 'role', value: 'role' }
      ]
    }]
  }, {
    name: 'delete',
    description: 'Delete a group',
    type: ApplicationCommandOptionType.Subcommand,
    options: [{
      name: 'id',
      description: 'The ID of the group to delete',
      type: ApplicationCommandOptionType.String,
      required: true
    }]
  }, {
    name: 'list',
    description: 'List a specific group or all groups',
    type: ApplicationCommandOptionType.Subcommand,
    options: [{
      name: 'id',
      description: 'The ID of the group to list',
      type: ApplicationCommandOptionType.String
    }]
  }, {
    name: 'channels',
    description: 'Add or remove a channel from a group',
    type: ApplicationCommandOptionType.SubcommandGroup,
    options: [{
      name: 'add',
      description: 'Add a channel to a group',
      type: ApplicationCommandOptionType.Subcommand,
      options: [{
        name: 'id',
        description: 'The ID of the group to add a channel to',
        type: ApplicationCommandOptionType.String,
        required: true
      }, {
        name: 'channel',
        description: 'The channel to add to this group',
        type: ApplicationCommandOptionType.Channel,
        channel_types: [ChannelType.GuildText],
        required: true
      }]
    }, {
      name: 'remove',
      description: 'Remove a channel from a group',
      type: ApplicationCommandOptionType.Subcommand,
      options: [{
        name: 'id',
        description: 'The ID of the group to remove a channel from',
        type: ApplicationCommandOptionType.String,
        required: true
      }, {
        name: 'channel',
        description: 'The channel to remove from this group',
        type: ApplicationCommandOptionType.Channel,
        channel_types: [ChannelType.GuildText],
        required: true
      }]
    }]
  }, {
    name: 'roles',
    description: 'Add or remove a role from a group',
    type: ApplicationCommandOptionType.SubcommandGroup,
    options: [{
      name: 'add',
      description: 'Add a role to a group',
      type: ApplicationCommandOptionType.Subcommand,
      options: [{
        name: 'id',
        description: 'The ID of the group to add a role to',
        type: ApplicationCommandOptionType.String,
        required: true
      }, {
        name: 'role',
        description: 'The role to add to this group',
        type: ApplicationCommandOptionType.Role,
        required: true
      }]
    }, {
      name: 'remove',
      description: 'Remove a role from a group',
      type: ApplicationCommandOptionType.Subcommand,
      options: [{
        name: 'id',
        description: 'The ID of the group to remove a role from',
        type: ApplicationCommandOptionType.String,
        required: true
      }, {
        name: 'role',
        description: 'The role to remove from this group',
        type: ApplicationCommandOptionType.Channel,
        required: true
      }]
    }]
  }]
}

export default groupsCommand
