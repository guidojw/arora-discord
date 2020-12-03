'use strict'
const { MessageEmbed } = require('discord.js')

const tags = require('../../app/content/tags')

const fileName = __filename.slice(__dirname.length + 1)

module.exports = {
  up: async (queryInterface) => {
    // Sequelize's seederStorage doesn't work, so we do it ourselves:
    if (!await queryInterface.rawSelect(
      'sequelize_data',
      { where: { name: fileName }},
      []
    )) {
      await queryInterface.bulkDelete('sequelize_data', null, {})
      await queryInterface.bulkInsert('sequelize_data', [{ name: fileName }])

      let guild = await queryInterface.rawSelect(
        'guilds',
        { where: { id: 'global' } },
        []
      )
      if (!guild) {
        guild = (await queryInterface.bulkInsert(
          'guilds',
          [{ id: 'global' }],
          { returning: true }
        ))[0]
      }

      const newTags = tags.filter(tag => {
        return tag.names.includes('ticket') || tag.names.includes('privacy')
      })
      for (const tag of newTags) {
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
    }
  },

  down: async () => {}
}
