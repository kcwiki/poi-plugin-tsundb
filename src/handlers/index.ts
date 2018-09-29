export default interface IHandler {
  handle(path: string, body: {}, postBody: {}): void
}
