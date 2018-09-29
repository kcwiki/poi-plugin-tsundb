import bodyParser from 'body-parser'
import restify from 'restify'

const fromServer = (path: string) =>
  new Promise(resolve => {
    const server = restify.createServer()
    server.use(bodyParser.json())
    server.post(path, ({ body }, res) => {
      console.log(`tsundb-server : POST : ${path}`, body)
      res.send('ok')
      server.close()
      resolve(body)
    })
    server.listen(12345)
  })

export default fromServer
