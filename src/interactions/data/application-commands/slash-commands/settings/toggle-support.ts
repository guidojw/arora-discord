import type { RESTPutAPIApplicationCommandsJSONBody } from 'discord-api-types/v10'

const toggleSupportCommand: RESTPutAPIApplicationCommandsJSONBody[number] = {
  name: 'togglesupport',
  description: 'Enable or disable the Tickets System',
  default_permission: false
}

export default toggleSupportCommand
