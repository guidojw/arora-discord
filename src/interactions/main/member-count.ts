import { ApplicationCommandOptionType } from 'discord-api-types/v9'

const memberCountCommand = {
  name: 'membercount',
  description: 'Fetch a group\'s member count',
  default_permission: false,
  options: [{
    name: 'id',
    description: 'The ID of the group to fetch the member count of',
    type: ApplicationCommandOptionType.Number
  }]
}

export default memberCountCommand
