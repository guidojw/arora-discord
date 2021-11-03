import { ApplicationCommandOptionType } from 'discord-api-types/v9'

const pollCommand = {
  name: 'poll',
  description: 'Create a poll',
  default_permission: false,
  options: [{
    name: 'choices',
    description: 'The amount of possible choices',
    type: ApplicationCommandOptionType.Integer,
    choices: [
      { name: '1', value: 1 },
      { name: '2', value: 2 },
      { name: '3', value: 3 },
      { name: '4', value: 4 },
      { name: '5', value: 5 },
      { name: '6', value: 6 },
      { name: '7', value: 7 },
      { name: '8', value: 8 },
      { name: '9', value: 9 },
      { name: '10', value: 10 }
    ]
  }]
}

export default pollCommand
