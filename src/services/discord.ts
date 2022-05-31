import {
  type ButtonInteraction,
  Interaction,
  Message,
  MessageActionRow,
  type MessageButton,
  MessageEmbed,
  type UserResolvable
} from 'discord.js'
import crypto from 'node:crypto'

const PROMPT_TIME = 60_000

export async function prompt (
  user: UserResolvable,
  interactionOrMessage: Interaction<'cached'> | Message,
  options: Record<string, MessageButton>
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
    if (button.style === null) {
      button.setStyle('PRIMARY')
    }
    button.setCustomId(`prompt:${crypto.randomUUID()}`)
  }
  const edit = (interactionOrMessage instanceof Interaction
    ? interactionOrMessage.editReply
    : interactionOrMessage.edit).bind(interactionOrMessage)
  await edit({
    components: [new MessageActionRow().setComponents(buttons)]
  })

  const filter = (promptInteraction: ButtonInteraction): boolean => (
    buttons.some(button => button.customId === promptInteraction.customId) && promptInteraction.user.id === userId
  )
  let choice = null
  let resultInteraction: ButtonInteraction | null = null
  try {
    resultInteraction = await interactionOrMessage.channel.awaitMessageComponent({
      filter,
      time: PROMPT_TIME,
      componentType: 'BUTTON'
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
