import { ApplicationCommandOptionType } from 'discord-api-types/v9'

const tagsCommand = {
  name: 'tags',
  description: 'Create, edit or delete a tag',
  defaultPermission: false,
  options: [{
    name: 'create',
    description: 'Create a tag',
    type: ApplicationCommandOptionType.Subcommand,
    options: [{
      name: 'name',
      description: 'The name for the new tag',
      type: ApplicationCommandOptionType.String,
      required: true
    }, {
      name: 'content',
      description: 'The content for the new tag',
      type: ApplicationCommandOptionType.String,
      required: true
    }]
  }, {
    name: 'delete',
    description: 'Delete a tag',
    type: ApplicationCommandOptionType.Subcommand,
    options: [{
      name: 'id',
      description: 'The ID of the tag to delete',
      type: ApplicationCommandOptionType.Integer,
      required: true
    }]
  }, {
    name: 'aliases',
    description: 'Create or delete an alias from a tag',
    type: ApplicationCommandOptionType.SubcommandGroup,
    options: [{
      name: 'create',
      description: 'Create an alias for a tag',
      type: ApplicationCommandOptionType.Subcommand,
      options: [{
        name: 'id',
        description: 'The ID of the tag to create an alias for',
        type: ApplicationCommandOptionType.Integer,
        required: true
      }, {
        name: 'name',
        description: 'The name for the new alias',
        type: ApplicationCommandOptionType.String,
        required: true
      }]
    }, {
      name: 'delete',
      description: 'Delete an alias from a tag',
      type: ApplicationCommandOptionType.Subcommand,
      options: [{
        name: 'id',
        description: 'The ID of the tag to delete an alias from',
        type: ApplicationCommandOptionType.Subcommand,
        required: true
      }, {
        name: 'name',
        description: 'The name of the alias to delete from the tag',
        type: ApplicationCommandOptionType.String,
        required: true
      }]
    }]
  }]
}

export default tagsCommand
