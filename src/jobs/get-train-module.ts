import { execFileSync } from 'node:child_process'
import { parentPort } from 'node:worker_threads'
import { parse } from 'lua-json'

const TRAIN_MODULE_ASSET_ID = '113905212729594'

const trains = parse(execFileSync(
  'bin/get_roblox_package.sh',
  [TRAIN_MODULE_ASSET_ID],
  {
    shell: (process.env.NODE_ENV ?? 'development') === 'development'
      ? 'C:\\Program Files\\Git\\bin\\bash.exe'
      : undefined
  }
).toString())
parentPort?.postMessage(trains)

parentPort?.postMessage('done') ?? process.exit(0)
