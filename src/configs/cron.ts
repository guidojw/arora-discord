export interface CronConfig { name: string, expression: string }

const cronConfig: { [key: string]: CronConfig } = {
  announceTrainingsJob: {
    name: 'announceTrainings',
    expression: '*/5 * * * *' // https://crontab.guru/#*/5_*_*_*_*
  },
  healthCheckJob: {
    name: 'healthCheck',
    expression: '*/5 * * * *' // https://crontab.guru/#*/5_*_*_*_*
  },
  premiumMembersReportJob: {
    name: 'premiumMembersReport',
    expression: '0 12 */1 * *' // https://crontab.guru/#0_12_*/1_*_*
  }
}

export default cronConfig
