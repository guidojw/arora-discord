import type { CommandInteraction, Message } from 'discord.js'
import { Command } from '../base'
import type { GuildContext } from '../../structures'
import applicationConfig from '../../configs/application'
import { discordService } from '../../services'
import { injectable } from 'inversify'

@injectable()
export default class CloseTicketCommand extends Command {
  public async execute (interaction: CommandInteraction): Promise<void> {
    if (!interaction.inGuild()) {
      return
    }
    const context = this.client.guildContexts.resolve(interaction.guildId) as GuildContext

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
            context.primaryColor ?? applicationConfig.defaultColor)
        } else {
          await ticket.close(
            'The moderator has closed your ticket.',
            true,
            context.primaryColor ?? applicationConfig.defaultColor)
        }
      }
    }
  }
}
