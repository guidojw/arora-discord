'use strict'
module.exports = (sequelize, DataTypes) => {
  const Command = sequelize.define('Command', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM,
      allowNull: false,
      values: ['command', 'group']
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  })

  Command.associate = models => {
    Command.belongsTo(models.Guild, {
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
