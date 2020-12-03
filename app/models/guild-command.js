'use strict'
module.exports = (sequelize, DataTypes) => {
  const Command = sequelize.define('GuildCommand', {
    commandName: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
      field: 'command_name'
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    tableName: 'commands'
  })

  Command.associate = models => {
    Command.belongsTo(models.Guild, {
      foreignKey: {
        name: 'guildId',
        primaryKey: true,
        allowNull: false
      },
      onDelete: 'CASCADE'
    })
  }

  return Command
}
