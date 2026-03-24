import app from '@adonisjs/core/services/app'
import server from '@adonisjs/core/services/server'
import { Server } from 'socket.io'
import Room from '#models/room'
import RoomPlayer from '#models/room_player'
import Match from '#models/match'

app.ready(() => {
  const io = new Server(server.getNodeServer(), {
    cors: { origin: '*' }
  })

  io.on('connection', (socket) => {
    socket.on('join_room', async (data) => {
      socket.join(data.roomCode)
      try {
        const room = await Room.findBy('code', data.roomCode)
        if (room) {
          const players = await RoomPlayer.query().where('roomId', room.id).preload('user')
          io.to(data.roomCode).emit('player_joined', players.map(p => ({ 
             score: p.score, 
             userId: p.userId,
             name: p.user?.fullName || `User #${p.userId}`
          })))
        }
      } catch (e) {
        console.error(e)
      }
    })
    
    socket.on('start_game', async (data) => {
      const room = await Room.findBy('code', data.roomCode)
      if (!room || room.status !== 'waiting') return

      const players = await RoomPlayer.query().where('roomId', room.id)
      if (players.length < 2) return

      room.status = 'playing'
      room.currentRound = 0 // will be 1 immediately in checkAndPushCurrentRound
      await room.save()

      const playerIds = players.map(p => p.userId)
      if (playerIds.length % 2 !== 0) {
        playerIds.push(null as any)
      }

      const numRounds = playerIds.length - 1
      const halfSize = playerIds.length / 2
      const playersList = [...playerIds]
      playersList.shift()

      for (let r = 0; r < numRounds; r++) {
        const roundNum = r + 1
        let p1 = playerIds[0]
        let p2 = playersList[r % playersList.length]
        if (p1 && p2) {
          await Match.create({ roomId: room.id, roundNumber: roundNum, player1Id: p1, player2Id: p2 })
        }

        for (let i = 1; i < halfSize; i++) {
          const first = (r + i) % playersList.length
          const second = (r + playersList.length - i) % playersList.length
          p1 = playersList[first]
          p2 = playersList[second]
          if (p1 && p2) {
            await Match.create({ roomId: room.id, roundNumber: roundNum, player1Id: p1, player2Id: p2 })
          }
        }
      }

      await checkAndPushCurrentRound(room, io)
    })

    socket.on('submit_choice', async (data) => {
      const { matchId, userId, choice } = data
      const match = await Match.find(matchId)
      if (!match || match.winnerId !== null) return

      if (match.player1Id === userId) match.p1Choice = choice
      else if (match.player2Id === userId) match.p2Choice = choice
      await match.save()

      if (match.p1Choice && match.p2Choice) {
        const p1 = match.p1Choice
        const p2 = match.p2Choice
        let winnerId: number | null = null
        if (p1 !== p2) {
          if ((p1 === 'rock' && p2 === 'scissors') || (p1 === 'paper' && p2 === 'rock') || (p1 === 'scissors' && p2 === 'paper')) {
            winnerId = match.player1Id
          } else {
            winnerId = match.player2Id
          }
        } else {
          winnerId = 0 // draw
        }
        match.winnerId = winnerId
        await match.save()

        if (winnerId !== null && winnerId > 0) {
          const rp = await RoomPlayer.query().where('roomId', match.roomId).where('userId', winnerId).first()
          if (rp) {
            rp.score += 1
            await rp.save()
          }
        }

        const room = await Room.find(match.roomId)
        await checkAndPushCurrentRound(room!, io)
      } else {
         const room = await Room.find(match.roomId)
         const matches = await Match.query().where('roomId', room!.id).where('roundNumber', room!.currentRound)
         io.to(room!.code).emit('matches_state', { round: room!.currentRound, matches })
      }
    })
  })

  async function checkAndPushCurrentRound(room: Room, io: Server) {
    if (room.currentRound === 0) {
       room.currentRound = 1
       await room.save()
    }
    const matches = await Match.query().where('roomId', room.id).where('roundNumber', room.currentRound)
    const unfinished = matches.filter(m => m.winnerId === null)

    if (unfinished.length === 0) {
      if (matches.length > 0) {
        const top5Raw = await RoomPlayer.query().where('roomId', room.id).orderBy('score', 'desc').limit(5).preload('user')
        const leaderboard = top5Raw.map(p => ({ score: p.score, userId: p.userId, name: p.user?.fullName || `User #${p.userId}` }))
        io.to(room.code).emit('round_finished', { round: room.currentRound, leaderboard })
      }

      const nextRoundMatches = await Match.query().where('roomId', room.id).where('roundNumber', room.currentRound + 1)
      if (nextRoundMatches.length === 0) {
        room.status = 'finished'
        await room.save()
        io.to(room.code).emit('game_over')
      } else {
        // Wait 5 seconds before starting next round
        setTimeout(async () => {
             room.currentRound++
             await room.save()
             io.to(room.code).emit('new_round', { round: room.currentRound, matches: nextRoundMatches })
        }, 5000)
      }
    } else {
      io.to(room.code).emit('matches_state', { round: room.currentRound, matches })
    }
  }
})
