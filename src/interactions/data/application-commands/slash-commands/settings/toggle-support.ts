import type { RESTPutAPIApplicationCommandsJSONBody } from 'discord.js'

const toggleSupportCommand: RESTPutAPIApplicationCommandsJSONBody[number] = {
  name: 'togglesupport',
  description: 'Enable or disable the Tickets System',
  default_member_permissions: '0',
  dm_permission: false
}

export default toggleSupportCommand
