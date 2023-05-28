import type { RESTPutAPIApplicationCommandsJSONBody } from 'discord.js'

const deleteSuggestionCommand: RESTPutAPIApplicationCommandsJSONBody[number] = {
  name: 'deletesuggestion',
  description: 'Delete your last suggestion',
  default_member_permissions: '0',
  dm_permission: false
}

export default deleteSuggestionCommand
