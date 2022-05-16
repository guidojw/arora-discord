import type { RESTPutAPIApplicationCommandsJSONBody } from 'discord-api-types/v10'

const getShoutCommand: RESTPutAPIApplicationCommandsJSONBody[number] = {
  name: 'getshout',
  description: 'Get the group\'s shout',
  default_member_permissions: '0',
  dm_permission: false
}

export default getShoutCommand
