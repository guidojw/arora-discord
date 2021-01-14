'use strict'
const pluralize = require('pluralize')
const userService = require('../../../services/user')

const { Events } = require('../../../util/constants')
const { MessageEmbed } = require('discord.js')

const TrainDevelopersPayoutHandler = async (client, { data }) => {
  const { developersSales } = data.args
  const developerIds = Object.keys(developersSales)
  const developers = await userService.getUsers(developerIds)
  const emoji = client.mainGuild.emojis.cache.find(emoji => emoji.name.toLowerCase() === 'robux')

  const embed = new MessageEmbed()
    .setTitle('Train Developers Payout Report')
    .setColor(0xffffff)
  for (const [id, developerSales] of Object.entries(developersSales)) {
    const username = developers.find(developer => developer.id === parseInt(id)).name
    const total = Math.ceil(developerSales.total.robux)
    embed.addField(username, `Has sold **${developerSales.total.amount}** ${pluralize('train', developerSales.total.amount)} and earned ${emoji || ''}${emoji ? ' ' : ''}**${total}**${!emoji ? ' Robux' : ''}.`)

    try {
      const user = await client.users.fetch(developerSales.discordId)
      const userEmbed = new MessageEmbed()
        .setTitle('Weekly Train Payout Report')
        .setColor(0xffffff)
      for (const productSales of Object.values(developerSales.sales)) {
        userEmbed.addField(productSales.name, `Sold **${productSales.amount}** ${pluralize('time', productSales.amount)} and earned ${emoji || ''}${emoji ? ' ' : ''}**${Math.floor(productSales.robux)}**${!emoji ? ' Robux' : ''}.`)
      }
      userEmbed.addField('Total', `**${developerSales.total.amount}** trains and ${emoji || ''}${emoji ? ' ' : ''}**${Math.floor(developerSales.total.robux)}**${!emoji ? ' Robux' : ''}.`)

      await user.send(userEmbed)
    } catch (err) {
      console.error(`Couldn't DM ${developerSales.discordId}!`)
    }
  }

  for (const owner of this.owners) {
    if (owner.partial) {
      await owner.fetch()
    }

    await owner.send(embed)
  }

  client.emit(Events.TRAIN_DEVELOPERS_PAYOUT, ...data.args)
}

module.exports = TrainDevelopersPayoutHandler
