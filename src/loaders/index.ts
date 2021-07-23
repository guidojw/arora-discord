import { Container } from 'inversify'
import containerLoader from './container'

export default async function init (): Promise<Container> {
  const container = await containerLoader()
  return container
}
