export default interface Handler {
  handle(path: string, body: any, postBody: any): void
}
