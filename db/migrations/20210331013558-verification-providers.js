'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('guilds', 'verification_preference', {
      type: Sequelize.ENUM,
      allowNull: false,
      values: ['rover', 'bloxlink'],
      defaultValue: 'rover'
    })

    await queryInterface.addColumn('guilds', 'roblox_usernames_as_nicknames', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    })
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('guilds', 'roblox_usernames_as_nicknames')

    await queryInterface.removeColumn('guilds', 'verification_preference')
    await queryInterface.sequelize.query('DROP TYPE enum_guilds_verification_preference;')
  }
}
