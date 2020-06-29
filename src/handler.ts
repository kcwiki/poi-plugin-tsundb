export default interface Handler {
  handle(path: string, body: {}, postBody: {}): void
}
