'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('guilds', {
      id: {
        type: Sequelize.STRING,
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

    await queryInterface.createTable('tags', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      guildId: {
        type: Sequelize.STRING,
        references: {
          model: 'guilds',
          key: 'id'
        },
        onDelete: 'CASCADE',
        field: 'guild_id'
      },
      authorId: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'author_id'
      },
      content: {
        type: Sequelize.STRING,
        allowNull: false
      }
    })

    await queryInterface.createTable('tag_names', {
      name: {
        type: Sequelize.STRING,
        primaryKey: true
      },
      tagId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: 'tags',
          key: 'id'
        },
        onDelete: 'CASCADE',
        field: 'tag_id'
      }
    })
  },

  down: async (queryInterface /* , Sequelize */) => {
    await queryInterface.dropTable('tag_names')
    await queryInterface.dropTable('tags')
    await queryInterface.dropTable('guilds_commands')
    await queryInterface.dropTable('guilds')
  }
}
