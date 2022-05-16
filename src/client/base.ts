export default interface BaseHandler {
  handle (...args: any[]): void | Promise<void>
}
