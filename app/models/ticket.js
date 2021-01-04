'use strict'
module.exports = (sequelize, DataTypes) => {
  const Ticket = sequelize.define('Ticket', {
    authorId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'author_id'
    },
    channelId: {
      type: DataTypes.BIGINT,
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
      },
      as: 'moderators'
    })
  }

  Ticket.loadScopes = models => {
    Ticket.addScope('defaultScope', {
      include: [{
        model: models.TicketModerator,
        as: 'moderators'
      }],
      subQuery: false
    })
  }

  return Ticket
}
