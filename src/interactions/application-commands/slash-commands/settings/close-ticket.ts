import {
  type CommandInteraction,
  type Message,
  MessageActionRow,
  MessageButton,
  type MessageComponentInteraction
} from 'discord.js'
import { inject, injectable, named } from 'inversify'
import { Command } from '../base'
import type { GuildContext } from '../../../../structures'
import type { GuildContextManager } from '../../../../managers'
import applicationConfig from '../../../../configs/application'
import { constants } from '../../../../utils'

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
      const customId = `prompt_close_ticket:${interaction.user.id}`
      const prompt = await interaction.reply({
        content: 'Are you sure you want to close this ticket?',
        fetchReply: true,
        components: [
          new MessageActionRow()
            .addComponents(
              new MessageButton()
                .setLabel('Yes')
                .setStyle('SUCCESS')
                .setEmoji('✔️')
                .setCustomId(`${customId}:yes`),
              new MessageButton()
                .setLabel('No')
                .setStyle('DANGER')
                .setEmoji('✖️')
                .setCustomId(`${customId}:no`)
            )
        ]
      }) as Message
      let choice = false
      try {
        if (interaction.channel === null) {
          return
        }
        const resultInteraction = await interaction.channel.awaitMessageComponent({
          filter: (promptInteraction: MessageComponentInteraction) => (
            promptInteraction.customId.startsWith(customId) && promptInteraction.user.id === interaction.user.id
          ),
          time: 15_000,
          componentType: 'BUTTON'
        })
        choice = resultInteraction.customId.includes('yes') ?? false
        await resultInteraction.reply({
          content: `This ticket will be ${choice ? 'closed' : 'left open'}.`,
          ephemeral: true
        })
      } catch {}
      await prompt.edit({
        components: prompt.components.map(row => {
          row.components.forEach(button => button.setDisabled(true))
          return row
        })
      })

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
