'use strict'
const lodash = require('lodash')
const pluralize = require('pluralize')

const { escapeMarkdown } = require('discord.js')
const { ArgumentType, util } = require('discord.js-commando')
const { disambiguation } = util

class BaseArgumentType extends ArgumentType {
  constructor (client, holds, managerName) {
    let id = lodash.kebabCase(holds.name)
    if (client.registry.types.has(id)) {
      id = `nsadmin-${id}`
    }
    super(client, id)

    this.holds = holds
    this.managerName = typeof managerName === 'undefined'
      ? pluralize(lodash.camelCase(holds.name))
      : managerName

    this.label = this.id.replace('-', ' ')
  }

  validate (val, msg, arg) {
    if (!msg.guild) {
      return false
    }
    const id = parseInt(val)
    if (!isNaN(id)) {
      const structure = msg.guild[this.managerName].cache.get(id)
      if (!structure) {
        return false
      }
      return arg.oneOf?.includes(structure.id) ?? true
    }
    const search = val.toLowerCase()
    let structures = msg.guild[this.managerName].cache.filter(filterInexact(search).bind(this))
    if (structures.size === 0) {
      return false
    }
    if (structures.size === 1) {
      return arg.oneOf?.includes(structures.first().id) ?? true
    }
    const exactStructures = structures.filter(filterExact(search).bind(this))
    if (exactStructures.size === 1) {
      return arg.oneOf?.includes(exactStructures.first().id) ?? true
    }
    if (exactStructures.size > 0) {
      structures = exactStructures
    }
    return structures.size <= 15
      ? `${disambiguation(structures.map(structure => escapeMarkdown(structure.name)), pluralize(this.label), null)}\n`
      : `Multiple ${pluralize(this.label)} found. Please be more specific.`
  }

  parse (val, msg, arg) {
    if (!msg.guild) {
      return false
    }
    const id = parseInt(val)
    if (!isNaN(id)) {
      return msg.guild[this.managerName].cache.get(id) || null
    }
    const search = val.toLowerCase()
    const structures = msg.guild[this.managerName].cache.filter(filterInexact(search).bind(this))
    if (structures.size === 0) {
      return null
    }
    if (structures.size === 1) {
      return structures.first()
    }
    const exactStructures = structures.filter(filterExact(search).bind(this))
    if (exactStructures.size === 1) {
      return exactStructures.first()
    }
    return null
  }
}

function filterExact (search) {
  return function (structure) {
    return structure instanceof this.holds && structure.name.toLowerCase() === search
  }
}

function filterInexact (search) {
  return function (structure) {
    return structure instanceof this.holds && structure.name.toLowerCase().includes(search)
  }
}

module.exports = BaseArgumentType
