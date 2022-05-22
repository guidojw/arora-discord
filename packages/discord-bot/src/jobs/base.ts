export default interface BaseJob {
  run (...args: any[]): void | Promise<void>
}
