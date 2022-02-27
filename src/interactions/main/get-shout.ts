import type { RESTPutAPIApplicationCommandsJSONBody } from 'discord-api-types/v9'

const getShoutCommand: RESTPutAPIApplicationCommandsJSONBody[number] = {
  name: 'getshout',
  description: 'Get the group\'s shout',
  default_permission: false
}

export default getShoutCommand
