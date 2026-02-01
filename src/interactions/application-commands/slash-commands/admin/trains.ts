import {
  AttachmentBuilder,
  type AutocompleteInteraction,
  type ChatInputCommandInteraction,
  EmbedBuilder
} from 'discord.js'
import { type Table, getMarkdownTable } from 'markdown-table-ts'
import { inject, injectable } from 'inversify'
import { ApplyOptions } from '../../../../utils/decorators'
import Fuse from 'fuse.js'
import type { RobloxUser } from '../../../../argument-types'
import { SubCommandCommand } from '../base'
import type { SubCommandCommandOptions } from '..'
import { constants } from '../../../../utils'
import { fetchApi } from 'rozod'
import { v2 } from 'rozod/lib/opencloud'

const { TYPES } = constants

const UNIVERSE_ID = '106510584'
const DATA_STORE_ID = 'TwinRail_Version1.9'
const DEFAULT_TRAIN_STATS = [0, 0, 0, 45, 1, 0]

const filterTrains = (trains: Record<string, any>): Record<string, any> => {
  return Object.entries(trains)
    .filter(([, train]) => train.level === 'Player' && train.isType !== 'Category')
    .reduce<Record<string, any>>((obj, [key, train]) => {
    obj[key] = train
    return obj
  }, {})
}

@injectable()
@ApplyOptions<SubCommandCommandOptions<TrainsCommand>>({
  subCommands: {
    list: {
      args: []
    },
    inventory: {
      list: {
        args: [
          { key: 'username', name: 'user', type: 'roblox-user' }
        ]
      },
      add: {
        args: [
          { key: 'username', name: 'user', type: 'roblox-user' },
          { key: 'name' }
        ]
      },
      remove: {
        args: [
          { key: 'username', name: 'user', type: 'roblox-user' },
          { key: 'name' }
        ]
      }
    },
    raw: {
      args: []
    }
  }
})
export default class TrainsCommand extends SubCommandCommand<TrainsCommand> {
  @inject(TYPES.TrainsCache)
  private readonly trainsCache!: Map<string, any>

  public async list (
    interaction: ChatInputCommandInteraction<'raw' | 'cached'>
  ): Promise<void> {
    const grouped = Object.groupBy<string, any>(
      Object.entries<Record<string, any>>(filterTrains(this.trainsCache.get('cache')))
        .map(([id, train]) => ({ id, ...train })),
      (train: any) => train.country
    )

    const embeds = []
    let embed = new EmbedBuilder()
      .setTitle('Available Trains')
    for (const [country, trains] of Object.entries(grouped)
      .sort(([, a], [, b]) => (b?.length ?? 0) - (a?.length ?? 0))) {
      if (typeof trains === 'undefined') {
        continue
      }
      embed.addFields([{
        name: country,
        value: trains.map(train => `* ${train.id}`).join('\n'),
        inline: true
      }])
      if (embed.data.fields?.length === 25) {
        embeds.push(embed)
        embed = new EmbedBuilder()
      }
    }

    await interaction.reply({ embeds })
  }

  public async inventory (
    interaction: ChatInputCommandInteraction<'raw' | 'cached'>,
    subcommand: 'list' | 'add' | 'remove',
    { user, name }: { user: RobloxUser, name?: string }
  ): Promise<void> {
    const entryId = `PlayerList$${user.id}`
    const entry: any = await fetchApi(v2.getCloudV2UniversesUniverseIdDataStoresDataStoreIdEntriesEntryId, {
      universe_id: UNIVERSE_ID,
      data_store_id: DATA_STORE_ID,
      entry_id: entryId
    }, {
      throwOnError: true
    })
    switch (subcommand) {
      case 'list': {
        const table: Table = {
          head: ['Name', 'Speed', 'Acceleration', 'Brake', 'Boarding time', 'Horn loudness'],
          body: Object.entries<number[]>(entry.value.TrainData)
            .map(([id, train]) => [id, ...train.slice(0, 5).map(stat => stat.toString())])
        }
        const markdown = getMarkdownTable({ table, alignColumns: true })

        await interaction.reply({
          content: `**${user.username}'s Inventory**`,
          files: [new AttachmentBuilder(Buffer.from(markdown), { name: `${user.username}-trains.json` })]
        })
        return
      }
      case 'add': {
        if (typeof name === 'undefined') {
          return
        }
        if (!Object.keys(this.trainsCache.get('cache')).includes(name)) {
          await interaction.reply('Invalid name')
          return
        }
        if (Object.keys(entry.value.TrainData).includes(name)) {
          await interaction.reply({
            content: `User **${user.username}** already has train **${name}** in their inventory.`,
            ephemeral: true
          })
          return
        }
        entry.value.TrainData[name] = DEFAULT_TRAIN_STATS
        await fetchApi(v2.patchCloudV2UniversesUniverseIdDataStoresDataStoreIdEntriesEntryId, {
          universe_id: UNIVERSE_ID,
          data_store_id: DATA_STORE_ID,
          entry_id: entryId,
          body: entry
        }, {
          throwOnError: true
        })
        await interaction.reply(`Successfully added train **${name}** to user **${user.username}**'s inventory.`)
        return
      }
      case 'remove': {
        if (typeof name === 'undefined') {
          return
        }
        if (!Object.keys(this.trainsCache.get('cache')).includes(name)) {
          await interaction.reply('Invalid name')
          return
        }
        if (!Object.keys(entry.value.TrainData).includes(name)) {
          await interaction.reply({
            content: `User **${user.username}** does not have train **${name}** in their inventory.`,
            ephemeral: true
          })
          return
        }
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete entry.value.TrainData[name]
        await fetchApi(v2.patchCloudV2UniversesUniverseIdDataStoresDataStoreIdEntriesEntryId, {
          universe_id: UNIVERSE_ID,
          data_store_id: DATA_STORE_ID,
          entry_id: entryId,
          body: entry
        }, {
          throwOnError: true
        })
        await interaction.reply(`Successfully removed train **${name}** from user **${user.username}**'s inventory.`)
      }
    }
  }

  public async raw (
    interaction: ChatInputCommandInteraction<'raw' | 'cached'>
  ): Promise<void> {
    await interaction.reply({
      files: [new AttachmentBuilder(
        Buffer.from(JSON.stringify(this.trainsCache.get('cache'), null, 2)),
        { name: 'trains.json' }
      )]
    })
  }

  public override async autocomplete (interaction: AutocompleteInteraction): Promise<void> {
    const option = interaction.options.getFocused(true)
    if (option.name === 'name') {
      let results: string[] = []
      if (option.value === '') {
        results = Object.keys(this.trainsCache.get('cache'))
          .sort(() => 0.5 - Math.random())
          .slice(0, 25)
      } else {
        const fuse = new Fuse(
          Object.values(filterTrains(this.trainsCache.get('cache'))),
          { keys: [{ name: 'name', weight: 2 }, 'country'] }
        )
        results = fuse.search(option.value, { limit: 25 }).map(result => result.item.name)
      }
      await interaction.respond(results.map(result => ({
        name: result,
        value: result
      })))
      return
    }

    await super.autocomplete(interaction)
  }
}
