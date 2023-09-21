import { inject, injectable, named } from 'inversify'
import { AnnounceTrainingsJob } from '../../../jobs'
import type { BaseHandler } from '../..'
import { GuildContextManager } from '../../../managers'
import type { Training } from '../../../services'
import { constants } from '../../../utils'

const { TYPES } = constants

interface TraniningCancelPacket {
  groupId: number
  training: Training
}

@injectable()
export default class TrainingCancelPackageHandler implements BaseHandler {
  @inject(TYPES.Job)
  @named('announceTrainings')
  private readonly announceTrainingsJob!: AnnounceTrainingsJob

  @inject(TYPES.Manager)
  @named('GuildContextManager')
  private readonly guildContexts!: GuildContextManager

  public async handle ({ data }: { data: TraniningCancelPacket }): Promise<void> {
    const { groupId } = data
    for (const context of this.guildContexts.cache.values()) {
      if (context.robloxGroupId === groupId) {
        await this.announceTrainingsJob.run(context)
      }
    }
  }
}
