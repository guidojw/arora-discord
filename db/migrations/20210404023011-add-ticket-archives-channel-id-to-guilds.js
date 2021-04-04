'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('guilds', 'ticket_archives_channel_id', {
      type: Sequelize.BIGINT,
      references: {
        model: 'channels',
        key: 'id'
      },
      onDelete: 'SET NULL'
    })
  },

  down: async (queryInterface /* , Sequelize */) => {
    await queryInterface.removeColumn('guilds', 'ticket_archives_channel_id')
  }
}
