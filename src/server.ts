
import * as http from 'http'
import * as socketio from 'socket.io'


const server = http.createServer()
const io = socketio(server)

io.on('connection', (socket:SocketIO.Socket) => {

})

server.listen(3000);