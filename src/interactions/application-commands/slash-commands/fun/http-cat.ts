import type { ChatInputCommandInteraction } from 'discord.js'
import { Command } from '../base'
import { injectable } from 'inversify'

const AVAILABLE_STATUS_CODES = [
  100, 101, 102,
  200, 201, 202, 203, 204, 206, 207,
  300, 301, 302, 303, 304, 305, 307, 308,
  400, 401, 402, 403, 404, 405, 406, 407, 408, 409, 410, 411, 412, 413, 414, 415, 416, 417, 418, 420, 421, 422, 423,
  424, 425, 426, 429, 431, 444, 450, 451, 497, 498, 499,
  500, 501, 502, 503, 504, 506, 507, 508, 509, 510, 511, 521, 523, 525, 599
]

@injectable()
export default class HttpCatCommand extends Command {
  public async execute (interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.reply(`https://http.cat/${AVAILABLE_STATUS_CODES[Math.floor(Math.random() * AVAILABLE_STATUS_CODES.length)]}`)
  }
}
