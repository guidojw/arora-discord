'use strict'
const Command = require('../../controllers/command')

module.exports = class HostTrainingCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'admin',
            name: 'hosttraining',
            details: 'Type must be CD or CSR. You can add special notes that will be shown in the training\'s ' +
            'announcement. The date argument should be dd-mm-yyyy format.',
            aliases: ['host'],
            description: 'Schedules a new training.',
            examples: ['host CD 4-3-2020 1:00 Be on time!', 'Host CSR 4-3-2020 2:00'],
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES'],
            args: [
                {
                    key: 'type',
                    type: 'string',
                    prompt: 'What kind of training is this?',
                    oneOf: ['CD', 'CSR']
                },
                {
                    key: 'date',
                    type: 'string',
                    prompt: 'At what date would you like to host this training?'
                },
                {
                    key: 'time',
                    type: 'string',
                    prompt: 'At what time would you like to host this training?'
                },
                {
                    key: 'specialNotes',
                    type: 'string',
                    prompt: 'Do you want to add any special notes?',
                    default: ''
                }
            ]
        })
    }

    execute (message, { type, date, time, specialNotes }) {

    }
}
