'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('guilds', {
      id: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true
      },
      primaryColor: {
        type: Sequelize.INTEGER,
        field: 'primary_color'
      },
      supportEnabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'support_enabled'
      },
      logsChannelId: {
        type: Sequelize.STRING,
        field: 'log_channel_id'
      },
      trainingsChannelId: {
        type: Sequelize.STRING,
        field: 'trainings_channel_id'
      },
      suggestionsChannelId: {
        type: Sequelize.STRING,
        field: 'suggestions_channel_id'
      },
      ratingsChannelId: {
        type: Sequelize.STRING,
        field: 'ratings_channel_id'
      },
      supportChannelId: {
        type: Sequelize.STRING,
        field: 'support_channel_id'
      },
      trainingsMessageId: {
        type: Sequelize.STRING,
        field: 'trainings_message_id'
      },
      trainingsIngfoMessageId: {
        type: Sequelize.STRING,
        field: 'trainings_info_message_id'
      },
      supportMessageId: {
        type: Sequelize.STRING,
        field: 'support_message_id'
      }
    })

    await queryInterface.createTable('guilds_commands', {
      commandName: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
        field: 'command_name'
      },
      guildId: {
        type: Sequelize.STRING,
        primaryKey: true,
        references: {
          model: 'guilds',
          key: 'id'
        },
        onDelete: 'CASCADE',
        field: 'guild_id'
      },
      enabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    })
  },

  down: async (queryInterface /* , Sequelize */) => {
    await queryInterface.dropTable('guilds_commands')
    await queryInterface.dropTable('guilds')
  }
}
