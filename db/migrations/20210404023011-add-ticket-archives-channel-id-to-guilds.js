'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('guilds', 'ticket_archives_channel_id', {
      type: Sequelize.BIGINT,
      references: {
        model: 'channels',
        key: 'id'
      },
      onDelete: 'SET NULL'
    })
  },

  down: (queryInterface /* , Sequelize */) => {
    return queryInterface.removeColumn('guilds', 'ticket_archives_channel_id')
  }
}
