import type { Container } from 'inversify'
import containerLoader from './container'

export default async function init (): Promise<Container> {
  return await containerLoader()
}
