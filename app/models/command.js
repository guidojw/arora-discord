'use strict'
module.exports = (sequelize, DataTypes) => {
  const Command = sequelize.define('Command', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: 'commands_name_type_guild_id_key'
    },
    type: {
      type: DataTypes.ENUM,
      allowNull: false,
      unique: 'commands_name_type_guild_id_key',
      values: ['command', 'group']
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    tableName: 'commands'
  })

  Command.associate = models => {
    Command.belongsTo(models.Guild, {
      unique: 'commands_name_type_guild_id_key',
      foreignKey: {
        name: 'guildId',
        allowNull: false
      },
      onDelete: 'CASCADE'
    })
    Command.hasMany(models.PermissionOverwrite, {
      foreignKey: {
        name: 'commandId',
        allowNull: false
      }
    })
  }

  return Command
}
