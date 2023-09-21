import { inject, injectable, named } from 'inversify'
import { AnnounceTrainingsJob } from '../../../jobs'
import type { BaseHandler } from '../..'
import { GuildContextManager } from '../../../managers'
import type { Training } from '../../../services'
import { constants } from '../../../utils'
import cron from 'node-schedule'

const { TYPES } = constants

interface TraniningUpdatePacket {
  groupId: number
  training: Training
}

@injectable()
export default class TrainingUpdatePacketHandler implements BaseHandler {
  @inject(TYPES.Job)
  @named('announceTrainings')
  private readonly announceTrainingsJob!: AnnounceTrainingsJob

  @inject(TYPES.Manager)
  @named('GuildContextManager')
  private readonly guildContexts!: GuildContextManager

  public async handle ({ data }: { data: TraniningUpdatePacket }): Promise<void> {
    const { groupId, training } = data
    for (const context of this.guildContexts.cache.values()) {
      if (context.robloxGroupId === groupId) {
        const jobName = `training_${training.id}`
        const job = cron.scheduledJobs[jobName]
        if (typeof job !== 'undefined') {
          job.cancel()
        }

        await this.announceTrainingsJob.run(context)
      }
    }
  }
}
