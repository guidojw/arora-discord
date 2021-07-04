'use strict'

module.exports = sequelize => {
  const Ticket = sequelize.define('Ticket', {}, {
    hooks: {
      beforeCreate: async ticket => {
        const [member] = await sequelize.models.Member.findOrCreate({
          where: {
            userId: ticket.authorId,
            guildId: ticket.guildId
          }
        })

        // Map to own IDs instead of Discord's snowflake IDs. This is necessary because the id is the primary key and
        // since Discord member IDs are Discord user IDs and thus if a user is in two servers, the members table would
        // have two rows with the same ID row (which of course it can't because the ID is the primary key).
        ticket.authorId = member.id

        return sequelize.models.Channel.findOrCreate({
          where: {
            id: ticket.channelId,
            guildId: ticket.guildId
          }
        })
      }
    },
    tableName: 'tickets'
  })

  Ticket.loadScopes = models => {
    Ticket.addScope('defaultScope', {
      include: [{
        model: models.Member,
        as: 'moderators'
      }, {
        model: models.Member,
        as: 'author'
      }]
    })
  }

  return Ticket
}
