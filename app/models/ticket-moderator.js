'use strict'
module.exports = (sequelize, DataTypes) => {
  const TicketModerator = sequelize.define('TicketModerator', {
    userId: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      field: 'user_id'
    }
  }, {
    tableName: 'tickets_moderators'
  })

  TicketModerator.associate = models => {
    TicketModerator.belongsTo(models.Ticket, {
      foreignKey: {
        name: 'ticketId',
        primaryKey: true
      },
      onDelete: 'CASCADE'
    })
  }

  return TicketModerator
}
