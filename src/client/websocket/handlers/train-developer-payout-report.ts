import { MessageEmbed, User } from 'discord.js'
import type BaseHandler from '../../base'
import type Client from '../../client'
import type { Snowflake } from 'discord.js'
import { injectable } from 'inversify'
import pluralize from 'pluralize'
import { userService } from '../../../services'

interface TrainDeveloperPayoutReportPacket {
  developersSales: Record<string, {
    discordId: Snowflake
    total: {
      amount: number
      robux: number
    }
    sales: {
      [key: string]: {
        name: string
        amount: number
        robux: number
      }
    }
  }>
}

@injectable()
export default class TrainDeveloperPayoutReportPacketHandler implements BaseHandler {
  public async handle (client: Client, { data }: { data: TrainDeveloperPayoutReportPacket }): Promise<void> {
    const { developersSales } = data
    const developerIds = Object.keys(developersSales).map(id => parseInt(id))
    const developers = await userService.getUsers(developerIds)
    const emoji = client.mainGuild?.emojis.cache.find(emoji => emoji.name?.toLowerCase() === 'robux') ?? null
    const emojiString = (amount: number): string => `${emoji?.toString() ?? ''}${emoji !== null ? ' ' : ''}**${amount}**${emoji === null ? ' Robux' : ''}`

    const embed = new MessageEmbed()
      .setTitle('Train Developers Payout Report')
      .setColor(0xffffff)
    for (const [id, developerSales] of Object.entries(developersSales)) {
      const username = developers.find(developer => developer.id === parseInt(id))?.name ?? id
      const total = Math.round(developerSales.total.robux)
      embed.addField(username, `Has sold **${developerSales.total.amount}** ${pluralize('train', developerSales.total.amount)} and earned ${emojiString(total)}.`)

      try {
        const user = client.users.resolve(developerSales.discordId) ??
          await client.users.fetch(developerSales.discordId)
        const userEmbed = new MessageEmbed()
          .setTitle('Weekly Train Payout Report')
          .setColor(0xffffff)
        for (const productSales of Object.values(developerSales.sales)) {
          userEmbed.addField(productSales.name, `Sold **${productSales.amount}** ${pluralize('time', productSales.amount)} and earned ${emojiString(Math.round(productSales.robux * 100) / 100)}.`)
        }
        userEmbed.addField('Total', `**${developerSales.total.amount}** trains and ${emojiString(Math.round(total))}.`)

        await user.send({ embeds: [userEmbed] })
      } catch (err) {
        console.error(`Couldn't DM ${developerSales.discordId}!`)
      }
    }

    if (client.application?.owner === null) {
      await client.application?.fetch()
    }
    if (client.application?.owner instanceof User) {
      await client.application.owner.send({ embeds: [embed] })
    }
  }
}
