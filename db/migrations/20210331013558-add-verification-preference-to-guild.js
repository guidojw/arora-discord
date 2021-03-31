'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('guilds', 'verification_preference', {
      type: Sequelize.ENUM,
      allowNull: false,
      values: ['rover', 'bloxlink'],
      defaultValue: 'rover'
    })
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('guilds', 'verification_preference')
  }
}
