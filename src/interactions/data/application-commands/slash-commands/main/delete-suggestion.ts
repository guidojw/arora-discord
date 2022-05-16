import type { RESTPutAPIApplicationCommandsJSONBody } from 'discord-api-types/v10'

const deleteSuggestionCommand: RESTPutAPIApplicationCommandsJSONBody[number] = {
  name: 'deletesuggestion',
  description: 'Delete your last suggestion',
  default_permission: false
}

export default deleteSuggestionCommand
