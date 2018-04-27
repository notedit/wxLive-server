
import * as http from 'http'
import * as SocketIO from 'socket.io'


const server = http.createServer()
const io = SocketIO(server)

const roomPushers:any = {}


interface ExtSocket extends SocketIO.Socket 
{
    data:any
}



io.on('connection', async (socket:ExtSocket) => {

    socket.on('join', async (data:any, cb:Function) => {
        let user = data.user
        let room = user.room

        socket.data = {}
        socket.data.user = user
        socket.data.room = room 

        let pushers = roomPushers[room] || {}

        socket.join(room)

        cb()

        let pusherarray = []
        for(let pair of pushers){
            let [user,pushUrl] = pair
            pusherarray.push({
                user:user,
                pushUrl:pushUrl
            })
        }

        socket.emit('pushers',pusherarray)
    })

    socket.on('addPusher', async (data:any) => {
        // {user:user, pushUrl:pushUrl}

        let user = socket.data.user
        let room = socket.data.room
        let pushUrl = data.pushUrl 

        if(roomPushers[room][user]){
            return
        }

        roomPushers[room][user] = pushUrl

        socket.to(room).emit('pusher_added', data)
    })

    socket.on('removePusher', async (data:any) => {
        // {user:user, pushUrl:pushUrl}
        let user = socket.data.user
        let room = socket.data.room
        let pushUrl = data.pushUrl 

        if(!roomPushers[room][user]){
            return
        }

        delete roomPushers[room][user]
        socket.to(room).emit('pusher_leaved', data)
    })

    socket.on('leave', async (data:any) => {
        let user = socket.data.user
        let room = socket.data.room
        if(!roomPushers[room][user]){
            return
        }

        delete roomPushers[room][user]
        socket.to(room).emit('pusher_leaved', data)
    })

    socket.on('disconnect', async () => {

        let user = socket.data.user
        let room = socket.data.room
        if(!roomPushers[room][user]){
            return
        }

        delete roomPushers[room][user]
        socket.to(room).emit('pusher_leaved', {
            user: user
        })
    })
})

server.listen(3000);