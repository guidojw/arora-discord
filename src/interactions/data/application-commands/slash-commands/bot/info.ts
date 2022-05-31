import type { RESTPutAPIApplicationCommandsJSONBody } from 'discord-api-types/v10'

const infoCommand: RESTPutAPIApplicationCommandsJSONBody[number] = {
  name: 'info',
  description: 'Posts info about the bot',
  default_member_permissions: null
}

export default infoCommand
