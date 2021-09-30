import { ApplicationCommandOptionType } from 'discord-api-types/v9'

const trainingsCommand = {
  name: 'trainings',
  description: 'Schedule or cancel a training',
  defaultPermission: false,
  options: [{
    name: 'schedule',
    description: 'Schedule a training',
    type: ApplicationCommandOptionType.Subcommand,
    options: [{
      name: 'type',
      description: 'The type of this training',
      type: ApplicationCommandOptionType.String,
      required: true
    }, {
      name: 'date',
      description: 'The date to schedule this training at',
      type: ApplicationCommandOptionType.String,
      required: true
    }, {
      name: 'time',
      description: 'The time to schedule this training at',
      type: ApplicationCommandOptionType.String,
      required: true
    }, {
      name: 'notes',
      description: 'Additional notes for this training',
      type: ApplicationCommandOptionType.String
    }]
  }, {
    name: 'cancel',
    description: 'Cancel a training',
    type: ApplicationCommandOptionType.Subcommand,
    options: [{
      name: 'id',
      description: 'The ID of the training to cancel',
      type: ApplicationCommandOptionType.Integer,
      required: true
    }, {
      name: 'reason',
      description: 'The reason for this cancellation',
      type: ApplicationCommandOptionType.String,
      required: true
    }]
  }, {
    name: 'edit',
    description: 'Edit a training',
    type: ApplicationCommandOptionType.Subcommand,
    options: [{
      name: 'id',
      description: 'The ID of the training to edit',
      type: ApplicationCommandOptionType.Integer,
      required: true
    }, {
      name: 'key',
      description: 'The key of the training to edit',
      type: ApplicationCommandOptionType.String,
      required: true,
      choices: [
        { name: 'author', value: 'author' },
        { name: 'type', value: 'type' },
        { name: 'time', value: 'time' },
        { name: 'notes', value: 'notes' }
      ]
    }, {
      name: 'value',
      description: 'The value to change this key to',
      type: ApplicationCommandOptionType.String,
      required: true
    }]
  }, {
    name: 'list',
    description: 'List a specific training or all trainings',
    type: ApplicationCommandOptionType.Subcommand,
    options: [{
      name: 'id',
      description: 'The ID of the training to list',
      type: ApplicationCommandOptionType.Integer
    }]
  }]
}

export default trainingsCommand
