import type { CommandInteraction, Message } from 'discord.js'
import { inject, injectable, named } from 'inversify'
import { Command } from '../base'
import type { GuildContext } from '../../../../structures'
import type { GuildContextManager } from '../../../../managers'
import applicationConfig from '../../../../configs/application'
import { constants } from '../../../../utils'
import { discordService } from '../../../../services'

const { TYPES } = constants

@injectable()
export default class CloseTicketCommand extends Command {
  @inject(TYPES.Manager)
  @named('GuildContextManager')
  private readonly guildContexts!: GuildContextManager

  public async execute (interaction: CommandInteraction): Promise<void> {
    if (!interaction.inGuild()) {
      return
    }
    const context = this.guildContexts.resolve(interaction.guildId) as GuildContext

    const ticket = context.tickets.resolve(interaction.channelId)
    if (ticket !== null) {
      const prompt = await interaction.reply({
        content: 'Are you sure you want to close this ticket?',
        fetchReply: true
      }) as Message
      const choice = (await discordService.prompt(interaction.user, prompt, ['✅', '🚫']))?.toString() === '✅'

      if (choice) {
        await context.log(
          interaction.user,
          `${interaction.user.toString()} **closed ticket** \`${ticket.id}\``,
          { footer: `Ticket ID: ${ticket.id}` }
        )

        if (interaction.user.id === ticket.author?.id) {
          await ticket.close(
            'Ticket successfully closed.',
            false,
            context.primaryColor ?? applicationConfig.defaultColor
          )
        } else {
          await ticket.close(
            'The moderator has closed your ticket.',
            true,
            context.primaryColor ?? applicationConfig.defaultColor
          )
        }
      }
    }
  }
}
