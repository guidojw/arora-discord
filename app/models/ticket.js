'use strict'
module.exports = (sequelize, DataTypes) => {
  const Ticket = sequelize.define('Ticket', {
    authorId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'author_id'
    },
    channelId: {
      type: DataTypes.STRING,
      field: 'channel_id'
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'tickets'
  })

  Ticket.associate = models => {
    Ticket.belongsTo(models.Guild, {
      foreignKey: {
        name: 'guildId',
        allowNull: false
      },
      onDelete: 'CASCADE'
    })
    Ticket.hasMany(models.TicketModerator, {
      foreignKey: {
        name: 'ticketId',
        primaryKey: true
      }
    })
  }

  return Ticket
}
