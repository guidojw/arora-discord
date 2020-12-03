'use strict'
const Bot = require('../../app/controllers/bot')

module.exports = {
  up: async (queryInterface /* , Sequelize */) => {
    const bot = new Bot()

    let permissions = []
    for (const command of bot.client.registry.commands.values()) {
      if (!command.guarded) {
        permissions.push(`${command.name}.run`)
      }
    }
    for (const group of bot.client.registry.groups.values()) {
      if (!group.guarded) {
        permissions.push(`${group.id}.run`)
      }
    }
    permissions = permissions.map(name => {
      return { name }
    })
    await queryInterface.bulkInsert('permissions', permissions)
  },

  down: async (queryInterface /* , Sequelize */) => {
    await queryInterface.bulkDelete('permissions', null, {})
  }
}
