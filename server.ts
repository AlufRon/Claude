import { Server } from 'socket.io'
import { createServer } from 'http'

const httpServer = createServer()
const io = new Server(httpServer, {
  cors: { origin: process.env.FRONTEND_URL }
})

const rooms = new Map()

io.on('connection', (socket) => {
  socket.on('joinMatch', ({ matchId }) => {
    socket.join(matchId)
    if (!rooms.has(matchId)) {
      rooms.set(matchId, { players: new Set(), gameState: {} })
    }
    rooms.get(matchId).players.add(socket.id)
  })

  socket.on('updatePosition', (position) => {
    const roomId = Array.from(socket.rooms)[1]
    if (roomId) {
      socket.to(roomId).emit('gameState', position)
    }
  })

  socket.on('matchUpdate', (update) => {
    const roomId = Array.from(socket.rooms)[1]
    if (roomId) {
      socket.to(roomId).emit('matchUpdate', update)
    }
  })

  socket.on('disconnect', () => {
    rooms.forEach((room, roomId) => {
      room.players.delete(socket.id)
      if (room.players.size === 0) {
        rooms.delete(roomId)
      }
    })
  })
})

httpServer.listen(3001)