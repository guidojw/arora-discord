'use strict'
module.exports = sequelize => {
  const Ticket = sequelize.define('Ticket', {}, {
    hooks: {
      beforeCreate: ticket => {
        return Promise.all([
          sequelize.models.Channel.findOrCreate({
            where: {
              id: ticket.channelId,
              guildId: ticket.guildId
            }
          }),
          sequelize.models.Member.findOrCreate({
            where: {
              id: ticket.authorId,
              guildId: ticket.guildId
            }
          })
        ])
      }
    },
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
    Ticket.belongsToMany(models.Member, {
      through: 'tickets_moderators',
      sourceKey: 'id',
      targetKey: 'id',
      as: 'moderators'
    })
    Ticket.belongsTo(models.Member, {
      foreignKey: {
        name: 'authorId',
        allowNull: false
      }
    })
    Ticket.belongsTo(models.Channel, {
      foreignKey: 'channelId',
      onDelete: 'CASCADE'
    })
    Ticket.belongsTo(models.TicketType, {
      foreignKey: {
        name: 'typeId',
        allowNull: false
      }
    })
  }

  Ticket.loadScopes = models => {
    Ticket.addScope('defaultScope', {
      include: [{
        model: models.Member,
        as: 'moderators',
        through: { attributes: [] }
      }],
      subQuery: false
    })
  }

  return Ticket
}
