import {
  ButtonInteraction,
  type GuildEmoji,
  type Interaction,
  type Message,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
  type MessageReaction,
  type ReactionEmoji,
  type User,
  type UserResolvable
} from 'discord.js'
import crypto from 'node:crypto'

const PROMPT_TIME = 60_000

export async function promptButton (
  user: UserResolvable,
  interaction: Interaction<'cached'>,
  options: Record<string, MessageButton>
): Promise<[string, ButtonInteraction] | [null, null]> {
  const userId = interaction.client.users.resolveId(user)
  if (userId === null) {
    throw new Error('Invalid user.')
  }
  if (interaction.channel === null) {
    throw new Error('Can only prompt buttons on interactions in a cached channel.')
  }
  if (!interaction.isRepliable()) {
    throw new Error('Can only prompt buttons on repliable interactions.')
  }
  if (!interaction.replied) {
    throw new Error('Can only prompt buttons on already replied to interactions.')
  }

  const buttons = Object.values<MessageButton>(options)
  for (const button of buttons) {
    button.setCustomId(`prompt:${crypto.randomUUID()}`)
  }
  await interaction.editReply({
    components: [new MessageActionRow().setComponents(buttons)]
  })

  const filter = (promptInteraction: ButtonInteraction<'cached'>): boolean => (
    buttons.some(button => button.customId === promptInteraction.component.customId) &&
    promptInteraction.user.id === interaction.user.id
  )
  let choice = null
  let resultInteraction: ButtonInteraction<'cached'> | null = null
  try {
    resultInteraction = await interaction.channel.awaitMessageComponent({
      filter,
      time: PROMPT_TIME,
      componentType: 'BUTTON'
    }) as ButtonInteraction<'cached'>
    choice = Object.entries<MessageButton>(options).find(([, option]) => (
      option.customId === resultInteraction?.component.customId
    ))?.[0] ?? null
  } catch {}

  const reply = await interaction.fetchReply()
  await interaction.editReply({
    components: reply.components.map(row => {
      row.components.forEach(button => button.setDisabled(true))
      return row
    })
  })

  if (choice === null || resultInteraction === null) {
    return [null, null]
  }
  return [choice, resultInteraction]
}

export async function prompt (
  user: UserResolvable,
  message: Message,
  options: Array<GuildEmoji | string>
): Promise<GuildEmoji | ReactionEmoji | null> {
  const userId = message.client.users.resolveId(user)
  if (userId === null) {
    throw new Error('Invalid user.')
  }

  const filter = (reaction: MessageReaction, user: User): boolean => (
    reaction.emoji.name !== null && options.includes(reaction.emoji.name) && user.id === userId
  )
  const collector = message.createReactionCollector({ filter, time: PROMPT_TIME })
  const promise: Promise<GuildEmoji | ReactionEmoji | null> = new Promise(resolve => {
    collector.on('end', collected => {
      const reaction = collected.first()
      resolve(reaction?.emoji ?? null)
    })
  })
  collector.on('collect', collector.stop)
  for (const option of options) {
    await message.react(option)
  }
  return await promise
}

export function getListEmbeds<T, D extends any[]> (
  title: string,
  values: Iterable<T>,
  getRow: (value: T, ...args: D) => string,
  ...data: D
): MessageEmbed[] {
  const embeds = []
  let embed = new MessageEmbed()
    .setTitle(title)
  for (const value of values) {
    const row = getRow(value, ...data)
    const currentField = embed.fields.length - 1
    if (currentField === -1) {
      embed.addField('\u200b', `${row}\n`)
    } else {
      const fieldLength = embed.fields.length >= 0 ? embed.fields[currentField].value.length : 0
      const addition = row.length + 2 // +2 for \n

      if (embed.length + addition <= 6000 && fieldLength + addition <= 1024) {
        embed.fields[currentField].value += `${row}\n`
      } else {
        if (embed.length + addition + 6 > 6000) { // +6 for \u200b
          embeds.push(embed)
          embed = new MessageEmbed()
        }
        embed.addField('\u200b', `${row}\n`)
      }
    }
  }
  embeds.push(embed)

  return embeds
}

export function validateEmbed (embed: MessageEmbed): string | true {
  if (embed.length > 6000) {
    return 'Embed length is too big.'
  } else if ((embed.title?.length ?? 0) > 256) {
    return 'Title is too long.'
  } else if ((embed.description?.length ?? 0) > 2048) {
    return 'Description is too long.'
  } else if ((embed.footer?.text?.length ?? 0) > 2048) {
    return 'Footer text is too long.'
  } else if ((embed.author?.name?.length ?? 0) > 256) {
    return 'Author name is too long.'
  } else if (embed.fields.length > 25) {
    return 'Embed has too many fields.'
  } else {
    for (const field of embed.fields) {
      if (field.name.length > 256) {
        return `Field **${field.name}**'s name is too long.`
      } else if (field.value.length > 2048) {
        return `Field **${field.name}**'s value is too long.`
      }
    }
  }
  return true
}
