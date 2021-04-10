'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn('guilds', 'verification_preference', {
          type: Sequelize.ENUM,
          allowNull: false,
          values: ['rover', 'bloxlink'],
          defaultValue: 'rover'
        }, { transaction: t }),

        queryInterface.addColumn('guilds', 'roblox_usernames_in_nicknames', {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false
        }, { transaction: t })
      ])
    })
  },

  down: (queryInterface /* , Sequelize */) => {
    return queryInterface.sequelize.transaction(async t => {
      await Promise.all([
        queryInterface.removeColumn('guilds', 'roblox_usernames_in_nicknames', { transaction: t }),
        queryInterface.removeColumn('guilds', 'verification_preference', { transaction: t })
      ])

      return queryInterface.sequelize.query('DROP TYPE enum_guilds_verification_preference;', { transaction: t })
    })
  }
}
