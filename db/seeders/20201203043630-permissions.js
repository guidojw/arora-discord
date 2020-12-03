'use strict'
const fileName = __filename.slice(__dirname.length + 1)

const permissions = [
  'prefix.run',           'ping.run',           'eval.run',
  'addrolemessage.run',   'ban.run',            'bans.run',
  'cancelsuspension.run', 'canceltraining.run', 'changeban.run',
  'changesuspension.run', 'changetraining.run', 'demote.run',
  'extendsuspension.run', 'hosttraining.run',   'promote.run',
  'shout.run',            'suspend.run',        'unban.run',
  'status.run',           'uptime.run',         'age.run',
  'badges.run',           'boostinfo.run',      'deletesuggestion.run',
  'getshout.run',         'isadmin.run',        'joindate.run',
  'poll.run',             'profile.run',        'rank.run',
  'role.run',             'suggest.run',        'suspensions.run',
  'tag.run',              'trainings.run',      'userid.run',
  'membercount.run',      'blocksupport.run',   'closeticket.run',
  'togglesupport.run',    'unblocksupport.run', 'addoption.run',
  'createvote.run',       'deletevote.run',     'showvote.run',
  'startvote.run',        'voteresults.run',    'admin.run',
  'main.run',             'miscellaneous.run',  'bot.run',
  'voting.run',           'tickets.run',        'util.run'
]

module.exports = {
  up: async (queryInterface) => {
    // Sequelize's seederStorage doesn't work, so we do it ourselves:
    if (!await queryInterface.rawSelect(
      'sequelize_data',
      { where: { name: fileName }},
      []
    )) {
      await queryInterface.bulkDelete('sequelize_data', null, {})
      await queryInterface.bulkInsert('sequelize_data', [{ name: fileName }])

      const newPermissions = permissions.map(name => {
        return { name }
      })
      await queryInterface.bulkInsert('permissions', newPermissions)
    }
  },

  down: async () => {}
}
