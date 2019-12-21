'use strict'
require('./app/controllers/bot').login()
    .then(() => console.log('Successfully started app!'))
    .catch(err => console.error(err))
