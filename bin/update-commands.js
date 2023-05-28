#!/usr/bin/env node
'use strict'

require('dotenv').config()

const { REST, Routes } = require('discord.js')
const applicationCommands = require('../dist/interactions/data/application-commands')

async function updateCommands () {
  const rest = new REST().setToken(process.env.DISCORD_TOKEN)
  const application = await rest.get(Routes.oauth2CurrentApplication())
  await rest.put(Routes.applicationCommands(application.id), { body: Object.values(applicationCommands) })
}

updateCommands()
