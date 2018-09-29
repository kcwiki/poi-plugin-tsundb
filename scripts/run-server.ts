import bodyParser from 'body-parser'
import restify from 'restify'

const server = restify.createServer()

server.use(bodyParser.json())

server.post('*', ({ url, body }, res) => {
  console.log(`tsundb-server : POST : ${url}`, body)
  res.send('ok')
})

server.listen(12345)
