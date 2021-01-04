'use strict'
const fileName = __filename.slice(__dirname.length + 1)

const permissions = [
  'ticket.create' // TODO: fill with final set of permissions.
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
