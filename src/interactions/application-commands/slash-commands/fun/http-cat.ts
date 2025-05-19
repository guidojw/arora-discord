import type { AutocompleteInteraction, ChatInputCommandInteraction } from 'discord.js'
import { ApplyOptions } from '../../../../utils/decorators'
import { Command } from '../base'
import type { CommandOptions } from '..'
import { injectable } from 'inversify'

const AVAILABLE_STATUS_CODES = [
  100, 101, 102, 103,
  200, 201, 202, 203, 204, 206, 207,
  300, 301, 302, 303, 304, 305, 307, 308,
  400, 401, 402, 403, 404, 405, 406, 407, 408, 409, 410, 411, 412, 413, 414, 415, 416, 417, 418, 420, 421, 422, 423,
  424, 425, 426, 428, 429, 431, 444, 450, 451, 497, 498, 499,
  500, 501, 502, 503, 504, 506, 507, 508, 509, 510, 511, 521, 522, 523, 525, 530, 599
]

@ApplyOptions<CommandOptions>({
  command: {
    args: [
      {
        key: 'statuscode',
        name: 'statusCode',
        validate: (val: string) => AVAILABLE_STATUS_CODES.includes(parseInt(val)),
        required: false
      }
    ]
  }
})
@injectable()
export default class HttpCatCommand extends Command {
  public async execute (
    interaction: ChatInputCommandInteraction,
    { statusCode }: { statusCode?: number }
  ): Promise<void> {
    statusCode ??= AVAILABLE_STATUS_CODES[Math.floor(Math.random() * AVAILABLE_STATUS_CODES.length)]
    await interaction.reply(`https://http.cat/${statusCode}`)
  }

  public override async autocomplete (interaction: AutocompleteInteraction): Promise<void> {
    const option = interaction.options.getFocused(true)
    if (option.name === 'statuscode') {
      const results = AVAILABLE_STATUS_CODES.map(String).filter(statusCode => statusCode.startsWith(option.value))
      await interaction.respond(results.map(result => ({ name: result, value: result })).slice(0, 25))
      return
    }

    await super.autocomplete(interaction)
  }
}
