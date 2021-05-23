import { GuildEmoji, Message, MessageEmbed, MessageReaction, ReactionEmoji, User } from 'discord.js'

const REACTION_COLLECTOR_TIME = 60000

export async function prompt (
  author: User,
  message: Message,
  options: Array<GuildEmoji | string>
): Promise<GuildEmoji | ReactionEmoji | null> {
  const filter = (reaction: MessageReaction, user: User): boolean => (
    options.includes(reaction.emoji.name) && user.id === author.id
  )
  const collector = message.createReactionCollector(filter, { time: REACTION_COLLECTOR_TIME })
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
  return promise
}

export function getListEmbeds (
  title: string,
  values: Map<any, any> | Iterable<any>,
  getRow: (...args: any[]) => string,
  data: any
): MessageEmbed[] {
  if (values instanceof Map) {
    values = values.entries()
  } else {
    values = Object.entries(values)
  }

  const embeds = []
  let embed = new MessageEmbed()
    .setTitle(title)
  for (const value of values) {
    const row = getRow(value, data)
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

export function validateEmbed (embed: MessageEmbed): boolean | string {
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
