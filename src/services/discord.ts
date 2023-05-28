import {
  ActionRowBuilder,
  type ButtonBuilder,
  type ButtonInteraction,
  ButtonStyle,
  ComponentType,
  EmbedBuilder,
  Interaction,
  Message,
  type UserResolvable,
  embedLength
} from 'discord.js'
import crypto from 'node:crypto'

const PROMPT_TIME = 60_000

export async function prompt (
  user: UserResolvable,
  interactionOrMessage: Interaction<'cached'> | Message,
  options: Record<string, ButtonBuilder>
): Promise<[string, ButtonInteraction] | [null, null]> {
  const userId = interactionOrMessage.client.users.resolveId(user)
  if (userId === null) {
    throw new Error('Invalid user.')
  }
  if (interactionOrMessage.channel === null) {
    throw new Error('Can only prompt buttons on interactions and messages in a cached channel.')
  }
  if (interactionOrMessage instanceof Interaction) {
    if (!interactionOrMessage.isRepliable()) {
      throw new Error('Can only prompt buttons on repliable interactions.')
    }
    if (!interactionOrMessage.replied) {
      throw new Error('Can only prompt buttons on already replied to interactions.')
    }
  }
  if (
    interactionOrMessage instanceof Message && interactionOrMessage.author.id !== interactionOrMessage.client.user?.id
  ) {
    throw new Error('Can only prompt buttons on messages sent by the bot.')
  }

  const buttons = Object.values(options)
  for (const button of buttons) {
    if (typeof button.data.style === 'undefined') {
      button.setStyle(ButtonStyle.Primary)
    }
    button.setCustomId(`prompt:${crypto.randomUUID()}`)
  }
  const edit = (interactionOrMessage instanceof Interaction
    ? interactionOrMessage.editReply
    : interactionOrMessage.edit).bind(interactionOrMessage)
  await edit({
    components: [new ActionRowBuilder().setComponents(buttons)]
  })

  const filter = (promptInteraction: ButtonInteraction): boolean => (
    buttons.some(button => (
      'custom_id' in button.data ? button.data.custom_id === promptInteraction.customId : false) &&
      promptInteraction.user.id === userId
    ))
  let choice = null
  let resultInteraction: ButtonInteraction | null = null
  try {
    resultInteraction = await interactionOrMessage.channel.awaitMessageComponent({
      filter,
      time: PROMPT_TIME,
      componentType: ComponentType.Button
    })
    choice = Object.entries(options).find(([, option]) => (
      option.customId === resultInteraction?.customId
    ))?.[0] ?? null
  } catch {}

  const reply = interactionOrMessage instanceof Interaction
    ? await interactionOrMessage.fetchReply()
    : interactionOrMessage
  await edit({
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

export function getListEmbeds<T, D extends any[]> (
  title: string,
  values: Iterable<T>,
  getRow: (value: T, ...args: D) => string,
  ...data: D
): EmbedBuilder[] {
  const embeds = []
  let embed = new EmbedBuilder()
    .setTitle(title)
  let currentField = 0
  for (const value of values) {
    const row = getRow(value, ...data)
    if (typeof embed.data.fields === 'undefined') {
      embed.addFields([{ name: '\u200b', value: `${row}\n` }])
    } else {
      const fieldLength = embed.data.fields.length >= 0 ? embed.data.fields[currentField].value.length : 0
      const addition = row.length + 2 // +2 for \n

      const length = embedLength(embed.data)
      if (length + addition <= 6000 && fieldLength + addition <= 1024) {
        embed.data.fields[currentField].value += `${row}\n`
      } else {
        if (length + addition + 6 > 6000) { // +6 for \u200b
          embeds.push(embed)
          embed = new EmbedBuilder()
        }
        embed.addFields([{ name: '\u200b', value: `${row}\n` }])
      }
    }
    currentField++
  }
  embeds.push(embed)

  return embeds
}

export function validateEmbed (embed: EmbedBuilder): string | true {
  if (embedLength(embed.data) > 6000) {
    return 'Embed length is too big.'
  } else if ((embed.data.title?.length ?? 0) > 256) {
    return 'Title is too long.'
  } else if ((embed.data.description?.length ?? 0) > 2048) {
    return 'Description is too long.'
  } else if ((embed.data.footer?.text?.length ?? 0) > 2048) {
    return 'Footer text is too long.'
  } else if ((embed.data.author?.name?.length ?? 0) > 256) {
    return 'Author name is too long.'
  } else if ((embed.data.fields?.length ?? 0) > 25) {
    return 'Embed has too many fields.'
  } else if (typeof embed.data.fields !== 'undefined') {
    for (const field of embed.data.fields) {
      if (field.name.length > 256) {
        return `Field **${field.name}**'s name is too long.`
      } else if (field.value.length > 2048) {
        return `Field **${field.name}**'s value is too long.`
      }
    }
  }
  return true
}
