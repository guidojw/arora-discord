'use strict'
module.exports = (sequelize, DataTypes) => {
  const GuildCommand = sequelize.define('GuildCommand', {
    enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    }
  }, {
    tableName: 'guilds_commands'
  })

  return GuildCommand
}
