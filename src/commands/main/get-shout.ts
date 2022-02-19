import { type BaseCommandInteraction, type CommandInteraction, MessageEmbed } from 'discord.js'
import { Command, type CommandOptions } from '../base'
import { ApplyOptions } from '../../util/decorators'
import type { GetGroupStatus } from '../../services/group'
import type { GuildContext } from '../../structures'
import { applicationAdapter } from '../../adapters'
import applicationConfig from '../../configs/application'
import { injectable } from 'inversify'

@injectable()
@ApplyOptions<CommandOptions>({
  requiresApi: true,
  requiresRobloxGroup: true
})
export default class GetShoutCommand extends Command {
  public async execute (interaction: CommandInteraction & BaseCommandInteraction<'cached'>): Promise<void> {
    const context = this.client.guildContexts.resolve(interaction.guildId) as GuildContext & { robloxGroupId: number }

    const shout: GetGroupStatus | '' = (await applicationAdapter('GET', `v1/groups/${context.robloxGroupId}/status`)).data

    if (shout !== '' && shout.body !== '') {
      const embed = new MessageEmbed()
        .addField(`Current shout by ${shout.poster.username}`, shout.body)
        .setTimestamp(new Date(shout.updated))
        .setColor(context.primaryColor ?? applicationConfig.defaultColor)
      return await interaction.reply({ embeds: [embed] })
    } else {
      return await interaction.reply('There currently is no shout.')
    }
  }
}
