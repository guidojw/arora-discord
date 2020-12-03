'use strict'
module.exports = (sequelize, DataTypes) => {
  const GuildCommand = sequelize.define('GuildCommand', {
    commandName: {
      type: DataTypes.STRING,
      primaryKey: true,
      field: 'command_name'
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    tableName: 'guilds_commands'
  })

  GuildCommand.associate = models => {
    GuildCommand.belongsTo(models.Guild, {
      foreignKey: {
        name: 'guildId',
        primaryKey: true
      },
      onDelete: 'CASCADE'
    })
  }

  return GuildCommand
}
