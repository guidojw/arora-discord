import { type CommandInteraction, EmbedBuilder, MessageAttachment } from 'discord.js'
import { type RESTGetAPIOAuth2CurrentApplicationResult, Routes } from 'discord-api-types/v10'
import { Command } from '../base'
import { REST } from '@discordjs/rest'
import { injectable } from 'inversify'
import { readFile } from 'node:fs/promises'

@injectable()
export default class InfoCommand extends Command {
  public async execute (interaction: CommandInteraction): Promise<void> {
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN as string)
    const application = await rest.get(Routes.oauth2CurrentApplication()) as RESTGetAPIOAuth2CurrentApplicationResult

    const attachment = new MessageAttachment(await readFile('assets/logo.png'), 'logo.png')
    const embed = new EmbedBuilder()
      .setAuthor({ name: 'arora', iconURL: 'attachment://logo.png' })
      .addFields([
        { name: 'Created by', value: '[Guido de Jong](https://github.com/guidojw) (Guido#0001)', inline: true },
        { name: 'Public', value: application.bot_public ? 'yes' : 'no', inline: true },
        { name: 'Bot Repository', value: 'https://github.com/guidojw/arora-discord' },
        { name: 'API Repository', value: 'https://github.com/guidojw/arora-api' }
      ])
      .setThumbnail('attachment://logo.png')
      .setColor(0xff82d1)
      .setTimestamp()
    if (typeof application.privacy_policy_url !== 'undefined') {
      embed.addFields([{ name: 'Privacy Policy', value: application.privacy_policy_url }])
    }

    await interaction.reply({ embeds: [embed], files: [attachment] })
  }
}
