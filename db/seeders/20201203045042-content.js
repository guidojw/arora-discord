'use strict'
const { MessageEmbed } = require('discord.js')

const tags = require('../../app/content/tags')

module.exports = {
  up: async (queryInterface) => {
    const guild = (await queryInterface.bulkInsert(
      'guilds',
      [{ id: 'global' }],
      { returning: true }
      ))[0]

    for (const tag of tags) {
      const newTag = (await queryInterface.bulkInsert('tags', [{
        content: tag.tag instanceof MessageEmbed ? JSON.stringify(tag.tag.toJSON()) : tag.tag,
        guild_id: guild.id,
        author_id: process.env.BOT_ID
      }], { returning: true }))[0]

      const tagNames = tag.names.map(name => {
        return { tag_id: newTag.id, name }
      })
      await queryInterface.bulkInsert('tag_names', tagNames)
    }
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('tags', null, {})
    await queryInterface.bulkDelete('guilds', null, {})
  }
}
