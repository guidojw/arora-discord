import type { RESTPutAPIApplicationCommandsJSONBody } from 'discord-api-types/v9'

const restartCommand: RESTPutAPIApplicationCommandsJSONBody[number] = {
  name: 'restart',
  description: 'Restarts the bot',
  default_permission: false
}

export default restartCommand
