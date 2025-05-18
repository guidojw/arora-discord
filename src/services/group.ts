import * as discordService from './discord'
import * as userService from '../services/user'
import { timeUtil, util } from '../utils'
import type { EmbedBuilder } from 'discord.js'
import type { GetUsers } from './user'
import { applicationAdapter } from '../adapters'
import pluralize from 'pluralize'

const { getDate } = timeUtil
const { getAbbreviation } = util

export interface ChangeMemberRole { oldRole: GroupRole, newRole: GroupRole }

/// Move below API types to own package?
export interface Group {
  readonly path: string
  readonly createTime: string
  readonly updateTime: string
  readonly id: string
  readonly displayName: string
  readonly description: string
  readonly owner: string
  readonly memberCount: number
  readonly publicEntryAllowed: number
  readonly locked: boolean
  readonly verified: boolean
}

export interface GroupRole {
  readonly path: string
  readonly createTime: string
  readonly updateTime: string
  readonly id: string
  readonly displayName: string
  readonly description: string
  readonly rank: number
  readonly memberCount: number
  readonly permissions: GroupRolePermissions
}

export interface GroupRolePermissions {
  viewWallPosts: boolean
  createWallPosts: boolean
  deleteWallPosts: boolean
  viewGroupShout: boolean
  createGroupShout: boolean
  changeRank: boolean
  acceptRequests: boolean
  exileMembers: boolean
  manageRelationships: boolean
  viewAuditLog: boolean
  spendGroupFunds: boolean
  advertiseGroup: boolean
  createAvatarItems: boolean
  manageAvatarItems: boolean
  manageGroupUniverses: boolean
  viewUniverseAnalytics: boolean
  createApiKeys: boolean
  manageApiKeys: boolean
  banMembers: boolean
  viewForums: boolean
  manageCategories: boolean
  createPosts: boolean
  lockPosts: boolean
  pinPosts: boolean
  removePosts: boolean
  createComments: boolean
  removeComments: boolean
}

export interface GroupShout {
  readonly path: string
  readonly createTime: string
  readonly updateTime: string
  readonly content: string
  readonly poster: string
}

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

export async function getGroup (groupId: number): Promise<Group> {
  try {
    return (await applicationAdapter('GET', `v2/groups/${groupId}`)).data
  } catch (err) {
    throw new Error('Invalid group.')
  }
}

export async function getBanEmbeds (groupId: number, bans: Ban[]): Promise<EmbedBuilder[]> {
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

export function getBanRow (ban: Ban, { users, roles }: { users: GetUsers, roles: GroupRole[] }): string {
  const username = users.find(user => user.id === ban.userId)?.name ?? ban.userId
  const authorName = users.find(user => user.id === ban.authorId)?.name ?? ban.authorId
  const role = roles.find(role => Number(role.id) === ban.roleId)
  const roleAbbreviation = typeof role !== 'undefined' ? getAbbreviation(role.displayName) : '??'
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

export async function getExileEmbeds (exiles: Exile[]): Promise<EmbedBuilder[]> {
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

export async function getTrainingEmbeds (trainings: Training[]): Promise<EmbedBuilder[]> {
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

  return `${training.id}. **${training.type?.abbreviation ?? '??'}** training on <t:${date.getTime() / 1000}:d> at <t:${date.getTime() / 1000}:t>, hosted by **${username}**.`
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

export async function getRole (groupId: number, userId: number): Promise<GroupRole> {
  return (await applicationAdapter('GET', `v2/users/${userId}/role/${groupId}`)).data
}

export async function getRoles (groupId: number): Promise<GroupRole[]> {
  return (await applicationAdapter('GET', `v2/groups/${groupId}/roles`)).data
}

export async function getTrainingTypes (groupId: number): Promise<TrainingType[]> {
  return (await applicationAdapter('GET', `v1/groups/${groupId}/trainings/types`)).data
}
