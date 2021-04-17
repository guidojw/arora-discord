'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async t => {
      await Promise.all([
        updateForeignKeyOnDeleteAction(queryInterface, 'guilds', 'logs_channel_id', 'channels', 'SET NULL', t),
        updateForeignKeyOnDeleteAction(queryInterface, 'guilds', 'ratings_channel_id', 'channels', 'SET NULL', t),
        updateForeignKeyOnDeleteAction(queryInterface, 'guilds', 'suggestions_channel_id', 'channels', 'SET NULL', t),
        updateForeignKeyOnDeleteAction(queryInterface, 'guilds', 'tickets_category_id', 'channels', 'SET NULL', t),
        updateForeignKeyOnDeleteAction(queryInterface, 'messages', 'channel_id', 'channels', 'CASCADE', t),
        updateForeignKeyOnDeleteAction(queryInterface, 'panels', 'message_id', 'messages', 'SET NULL', t),
        updateForeignKeyOnDeleteAction(queryInterface, 'role_bindings', 'role_id', 'roles', 'CASCADE', t),
        updateForeignKeyOnDeleteAction(queryInterface, 'ticket_types', 'emoji_id', 'emojis', 'SET NULL', t),
        updateForeignKeyOnDeleteAction(queryInterface, 'ticket_types', 'message_id', 'messages', 'SET NULL', t),
        updateForeignKeyOnDeleteAction(queryInterface, 'tickets', 'channel_id', 'channels', 'SET NULL', t),
        updateForeignKeyOnDeleteAction(queryInterface, 'tickets', 'type_id', 'ticket_types', 'SET NULL', t)
      ])

      await Promise.all([
        updateForeignKeyName(queryInterface, 'channels', 'guild_id', 'guilds', true, t),
        updateForeignKeyName(queryInterface, 'emojis', 'guild_id', 'guilds', true, t),
        updateForeignKeyName(queryInterface, 'groups', 'guild_id', 'guilds', true, t),
        updateForeignKeyName(queryInterface, 'members', 'guild_id', 'guilds', true, t),
        updateForeignKeyName(queryInterface, 'messages', 'guild_id', 'guilds', true, t),
        updateForeignKeyName(queryInterface, 'panels', 'guild_id', 'guilds', true, t),
        updateForeignKeyName(queryInterface, 'roles', 'guild_id', 'guilds', true, t)
      ])

      return queryInterface.changeColumn('tickets', 'type_id', {
        type: Sequelize.INTEGER
      }, { transaction: t })
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async t => {
      await Promise.all([
        updateForeignKeyOnDeleteAction(queryInterface, 'guilds', 'logs_channel_id', 'channels', 'NO ACTION', t),
        updateForeignKeyOnDeleteAction(queryInterface, 'guilds', 'ratings_channel_id', 'channels', 'NO ACTION', t),
        updateForeignKeyOnDeleteAction(queryInterface, 'guilds', 'suggestions_channel_id', 'channels', 'NO ACTION', t),
        updateForeignKeyOnDeleteAction(queryInterface, 'guilds', 'tickets_category_id', 'channels', 'NO ACTION', t),
        updateForeignKeyOnDeleteAction(queryInterface, 'messages', 'channel_id', 'channels', 'NO ACTION', t),
        updateForeignKeyOnDeleteAction(queryInterface, 'panels', 'message_id', 'messages', 'NO ACTION', t),
        updateForeignKeyOnDeleteAction(queryInterface, 'role_bindings', 'role_id', 'roles', 'NO ACTION', t),
        updateForeignKeyOnDeleteAction(queryInterface, 'ticket_types', 'emoji_id', 'emojis', 'NO ACTION', t),
        updateForeignKeyOnDeleteAction(queryInterface, 'ticket_types', 'message_id', 'messages', 'NO ACTION', t),
        updateForeignKeyOnDeleteAction(queryInterface, 'tickets', 'channel_id', 'channels', 'CASCADE', t),
        updateForeignKeyOnDeleteAction(queryInterface, 'tickets', 'type_id', 'ticket_types', 'NO ACTION', t)
      ])

      await Promise.all([
        updateForeignKeyName(queryInterface, 'channels', 'guild_id', 'guilds', false, t),
        updateForeignKeyName(queryInterface, 'emojis', 'guild_id', 'guilds', false, t),
        updateForeignKeyName(queryInterface, 'groups', 'guild_id', 'guilds', false, t),
        updateForeignKeyName(queryInterface, 'members', 'guild_id', 'guilds', false, t),
        updateForeignKeyName(queryInterface, 'messages', 'guild_id', 'guilds', false, t),
        updateForeignKeyName(queryInterface, 'panels', 'guild_id', 'guilds', false, t),
        updateForeignKeyName(queryInterface, 'roles', 'guild_id', 'guilds', false, t)
      ])

      return queryInterface.changeColumn('tickets', 'type_id', {
        type: Sequelize.INTEGER,
        allowNull: false
      }, { transaction: t })
    })
  }
}

async function updateForeignKeyOnDeleteAction (
  queryInterface,
  tableName,
  columnName,
  targetTableName,
  onDeleteAction,
  transaction
) {
  await queryInterface.removeConstraint(
    tableName,
    `${tableName}_${columnName}_fkey`,
    { transaction }
  )
  return createForeignKey(
    queryInterface,
    tableName,
    columnName,
    targetTableName,
    `${tableName}_${columnName}_fkey`,
    onDeleteAction,
    transaction
  )
}

async function updateForeignKeyName (queryInterface, tableName, columnName, targetTableName, up, transaction) {
  await queryInterface.removeConstraint(
    tableName,
    `${tableName}_${columnName}_${up ? `${targetTableName}_fk` : 'fkey'}`,
    { transaction }
  )
  return createForeignKey(
    queryInterface,
    tableName,
    columnName,
    targetTableName,
    `${tableName}_${columnName}_${up ? 'fkey' : `${targetTableName}_fk`}`,
    'CASCADE',
    transaction
  )
}

function createForeignKey (queryInterface, tableName, columnName, targetTableName, name, onDeleteAction, transaction) {
  return queryInterface.addConstraint(tableName, {
    fields: [columnName],
    type: 'foreign key',
    name,
    references: {
      table: targetTableName,
      field: 'id'
    },
    onDelete: onDeleteAction,
    transaction
  })
}
