#!/usr/bin/env node
'use strict'

require('dotenv').config()

const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v9')
const applicationCommands = require('../dist/interactions/data/application-commands')

async function updateCommands () {
  const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN)
  const application = await rest.get(Routes.oauth2CurrentApplication())
  await rest.put(Routes.applicationCommands(application.id), { body: Object.values(applicationCommands) })
}

updateCommands()
