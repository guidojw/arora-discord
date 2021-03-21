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
    }
  })

  Command.associate = models => {
    Command.belongsToMany(models.Guild, {
      through: models.GuildCommand
    })
    Command.hasMany(models.Permission, {
      foreignKey: {
        name: 'commandId',
        allowNull: false
      }
    })
  }

  return Command
}
