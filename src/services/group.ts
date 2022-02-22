import * as discordService from './discord'
import * as userService from '../services/user'
import type { GetGroup, GetGroupRoles } from '@guidojw/bloxy/dist/client/apis/GroupsAPI'
import { applicationAdapter, robloxAdapter } from '../adapters'
import { timeUtil, util } from '../utils'
import type { GetUsers } from './user'
import type { MessageEmbed } from 'discord.js'
import pluralize from 'pluralize'

export type GetGroupStatus = GetGroup['shout']
export type GetGroupRole = GetGroupRoles['roles'][0]
export interface ChangeMemberRole { oldRole: GetGroupRole, newRole: GetGroupRole }

const { getDate, getTime, getTimeZoneAbbreviation } = timeUtil
const { getAbbreviation } = util

/// Move below API types to own package?
export interface BanExtension {
  readonly id: number
  readonly authorId: number
  readonly banId: number
  readonly duration: number
  readonly reason: string
}

export interface Ban {
  readonly id: number
  readonly authorId: number
  readonly date: string
  readonly duration: number | null
  readonly endsAt?: string
  readonly groupId: number
  readonly reason: string
  readonly roleId: number
  readonly userId: number
  readonly extensions: BanExtension[]
}

export interface Exile {
  readonly id: number
  readonly authorId: number
  readonly date: string
  readonly groupId: number
  readonly reason: string
  readonly userId: number
}

export interface Training {
  readonly id: number
  readonly authorId: number
  readonly notes: string | null
  readonly date: Date
  readonly groupId: number
  readonly typeId: number | null
  readonly type: TrainingType | null
}

export interface TrainingType {
  readonly id: number
  readonly abbreviation: string
  readonly groupId: number
  readonly name: string
}

export async function getGroup (groupId: number): Promise<GetGroup> {
  try {
    return (await robloxAdapter('GET', 'groups', `v1/groups/${groupId}`)).data
  } catch (err) {
    throw new Error('Invalid group.')
  }
}

export async function getBanEmbeds (groupId: number, bans: Ban[]): Promise<MessageEmbed[]> {
  const userIds = [...new Set([
    ...bans.map(ban => ban.userId),
    ...bans.map(ban => ban.authorId)
  ])]
  const users = await userService.getUsers(userIds)
  const roles = await getRoles(groupId)

  return discordService.getListEmbeds(
    'Banlist',
    bans,
    getBanRow,
    { users, roles }
  )
}

export function getBanRow (ban: Ban, { users, roles }: { users: GetUsers, roles: GetGroupRoles }): string {
  const username = users.find(user => user.id === ban.userId)?.name ?? ban.userId
  const authorName = users.find(user => user.id === ban.authorId)?.name ?? ban.authorId
  const role = roles.roles.find(role => role.id === ban.roleId)
  const roleAbbreviation = typeof role !== 'undefined' ? getAbbreviation(role.name) : '??'
  const dateString = getDate(new Date(ban.date))

  let durationString = ''
  if (ban.duration !== null) {
    const days = ban.duration / 86_400_000
    const extensionDays = ban.extensions.reduce((result, extension) => result + extension.duration, 0) /
      86_400_000
    const extensionString = extensionDays !== 0
      ? ` (${Math.sign(extensionDays) === 1 ? '+' : ''}${extensionDays})`
      : ''
    durationString = ` for **${days}${extensionString} ${pluralize('day', days + extensionDays)}**`
  }

  return `**${username}** (${roleAbbreviation}) by **${authorName}** at **${dateString}**${durationString} with reason:\n*${ban.reason}*`
}

export async function getExileEmbeds (exiles: Exile[]): Promise<MessageEmbed[]> {
  const userIds = [...new Set([
    ...exiles.map(exile => exile.userId),
    ...exiles.map(exile => exile.authorId)
  ])]
  const users = await userService.getUsers(userIds)

  return discordService.getListEmbeds(
    'Current Exiles',
    exiles,
    getExileRow,
    { users }
  )
}

export function getExileRow (exile: Exile, { users }: { users: GetUsers }): string {
  const username = users.find(user => user.id === exile.userId)?.name ?? exile.userId
  const authorName = users.find(user => user.id === exile.authorId)?.name ?? exile.authorId
  const dateString = getDate(new Date(exile.date))

  return `**${username}** by **${authorName}** at **${dateString}** with reason:\n*${exile.reason}*`
}

export async function getTrainingEmbeds (trainings: Training[]): Promise<MessageEmbed[]> {
  const userIds = [...new Set([
    ...trainings.map(training => training.authorId)
  ])]
  const users = await userService.getUsers(userIds)

  return discordService.getListEmbeds(
    'Upcoming Trainings',
    trainings,
    getTrainingRow,
    { users }
  )
}

export function getTrainingRow (training: Training, { users }: { users: GetUsers }): string {
  const username = users.find(user => user.id === training.authorId)?.name ?? training.authorId
  const date = new Date(training.date)
  const readableDate = getDate(date)
  const readableTime = getTime(date)

  return `${training.id}. **${training.type?.abbreviation ?? '??'}** training on **${readableDate}** at **${readableTime} ${getTimeZoneAbbreviation(date)}**, hosted by **${username}**.`
}

export function groupTrainingsByType (trainings: Training[]): Record<string, Training[]> {
  const result: Record<string, Training[]> = {}
  for (const training of trainings) {
    const typeName = training.type?.name ?? 'Unknown'
    if (typeof result[typeName] === 'undefined') {
      result[typeName] = []
    }
    result[typeName].push(training)
  }
  return result
}

export async function getRoles (groupId: number): Promise<GetGroupRoles> {
  return (await applicationAdapter('GET', `v1/groups/${groupId}/roles`)).data
}

export async function getTrainingTypes (groupId: number): Promise<TrainingType[]> {
  return (await applicationAdapter('GET', `v1/groups/${groupId}/trainings/types`)).data
}
