import app from '@adonisjs/core/services/app'
import server from '@adonisjs/core/services/server'
import { Server } from 'socket.io'
import Room from '#models/room'
import RoomPlayer from '#models/room_player'
import Match from '#models/match'
import encryption from '@adonisjs/core/services/encryption'
import User from '#models/user'

function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {}
  for (const part of cookieHeader.split(';')) {
    const eqIdx = part.indexOf('=')
    if (eqIdx === -1) continue
    const name = part.slice(0, eqIdx).trim()
    const value = part.slice(eqIdx + 1).trim()
    if (name) cookies[name] = decodeURIComponent(value)
  }
  return cookies
}

async function resolveSocketUserId(socket: any): Promise<number | null> {
  try {
    const cookieHeader = socket.handshake.headers.cookie || ''
    const cookies = parseCookies(cookieHeader)
    const sessionCookie = cookies['adonis-session']
    if (!sessionCookie) return null

    const sessionData = encryption.decrypt<Record<string, any>>(sessionCookie, 'adonis-session')
    if (!sessionData) return null

    const userId = sessionData['auth_web']
    if (!userId) return null

    const user = await User.find(userId)
    return user ? user.id : null
  } catch {
    return null
  }
}

app.ready(() => {
  const io = new Server(server.getNodeServer(), {
    cors: { origin: '*' }
  })

  io.on('connection', async (socket) => {
    const userId = await resolveSocketUserId(socket)
    if (!userId) {
      socket.disconnect(true)
      return
    }
    socket.data.userId = userId

    socket.on('join_room', async (data) => {
      socket.join(data.roomCode)
      try {
        const room = await Room.findBy('code', data.roomCode)
        if (room) {
          const players = await RoomPlayer.query().where('roomId', room.id).preload('user')
          io.to(data.roomCode).emit('player_joined', players.map(p => ({ 
             score: p.score, 
             userId: p.userId,
             name: p.user?.fullName || `User #${p.userId}`,
             avatar: `https://api.dicebear.com/7.x/${p.user?.avatarStyle || 'fun-emoji'}/svg?seed=${p.user?.avatarSeed || p.user?.id}`
          })))

          if (room.status === 'playing') {
            const matches = await Match.query().where('roomId', room.id).where('roundNumber', room.currentRound)
            const unfinished = matches.filter(m => m.winnerId === null && (m.p1Choice === null || m.p2Choice === null))
            
            if (unfinished.length === 0 && matches.length > 0) {
              const top5Raw = await RoomPlayer.query().where('roomId', room.id).orderBy('score', 'desc').limit(5).preload('user')
              const leaderboard = top5Raw.map(p => ({ 
                score: p.score, 
                userId: p.userId, 
                name: p.user?.fullName || `User #${p.userId}`,
                avatar: `https://api.dicebear.com/7.x/${p.user?.avatarStyle || 'fun-emoji'}/svg?seed=${p.user?.avatarSeed || p.user?.id}`
              }))
              socket.emit('matches_state', { round: room.currentRound, matches })
              socket.emit('round_finished', { round: room.currentRound, leaderboard })
            } else {
              socket.emit('matches_state', { round: room.currentRound, matches })
            }
          } else if (room.status === 'finished') {
             socket.emit('game_over')
          }
        }
      } catch (e) {
        console.error(e)
      }
    })
    
    socket.on('start_game', async (data) => {
      const room = await Room.findBy('code', data.roomCode)
      if (!room || room.status !== 'waiting') return

      // Only the host can start the game
      if (room.hostId !== socket.data.userId) return

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
      const { matchId, choice } = data
      const userId = socket.data.userId
      
      const validChoices = ['rock', 'paper', 'scissors']
      if (!validChoices.includes(choice)) return

      const match = await Match.find(matchId)
      if (!match || match.winnerId !== null) return

      // Validate that the userId actually belongs to this match
      if (match.player1Id !== userId && match.player2Id !== userId) return

      // Prevent re-submission after draw (winnerId stays null but choices already set)
      if (match.player1Id === userId && match.p1Choice) return
      if (match.player2Id === userId && match.p2Choice) return

      if (match.player1Id === userId) match.p1Choice = choice
      else if (match.player2Id === userId) match.p2Choice = choice
      await match.save()

      const currentMatches = await Match.query().where('roomId', match.roomId!).where('roundNumber', match.roundNumber)
      let submittedCount = 0
      let totalCount = 0
      for (const m of currentMatches) {
        if (m.player1Id) { totalCount++; if (m.p1Choice) submittedCount++ }
        if (m.player2Id) { totalCount++; if (m.p2Choice) submittedCount++ }
      }
      
      const roomStr = await Room.find(match.roomId)
      if (roomStr) {
        io.to(roomStr.code).emit('submit_status', { submitted: submittedCount, total: totalCount })
      }

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
          winnerId = null // draw
        }
        match.winnerId = winnerId
        await match.save()

        if (winnerId !== null) {
          const rp = await RoomPlayer.query().where('roomId', match.roomId!).where('userId', winnerId).first()
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

    socket.on('host_next_action', async (data) => {
      const room = await Room.findBy('code', data.roomCode)
      // Only host can perform this action, and only when game is actively playing.
      if (!room || room.hostId !== socket.data.userId || room.status !== 'playing') return

      const matches = await Match.query().where('roomId', room.id).where('roundNumber', room.currentRound)
      const unfinished = matches.filter(m => m.winnerId === null && (m.p1Choice === null || m.p2Choice === null))

      if (unfinished.length > 0) {
        // Force resolve unfinished matches
        for (const match of unfinished) {
          // Track strikes for players who missed
          if (!match.p1Choice && match.player1Id) {
            const rp1 = await RoomPlayer.query().where('roomId', match.roomId!).where('userId', match.player1Id!).first()
            if (rp1 && !rp1.isKicked) {
              rp1.strikes += 1
              if (rp1.strikes >= 3) rp1.isKicked = true
              await rp1.save()
            }
          }
          if (!match.p2Choice && match.player2Id) {
            const rp2 = await RoomPlayer.query().where('roomId', match.roomId!).where('userId', match.player2Id!).first()
            if (rp2 && !rp2.isKicked) {
              rp2.strikes += 1
              if (rp2.strikes >= 3) rp2.isKicked = true
              await rp2.save()
            }
          }

          let winnerId: number | null = null
          if (match.p1Choice && !match.p2Choice) {
            winnerId = match.player1Id
          } else if (match.p2Choice && !match.p1Choice) {
            winnerId = match.player2Id
          } else {
            winnerId = null // both didn't choose = draw
          }
          
          match.p1Choice = match.p1Choice || 'none'
          match.p2Choice = match.p2Choice || 'none'
          match.winnerId = winnerId
          await match.save()

          if (winnerId !== null) {
            const rp = await RoomPlayer.query().where('roomId', match.roomId!).where('userId', winnerId).first()
            if (rp) {
              rp.score += 1
              await rp.save()
            }
          }
        }
        await checkAndPushCurrentRound(room, io)
      } else {
        // Advance to next round or end game
        let nextRoundMatches = await Match.query().where('roomId', room.id).where('roundNumber', room.currentRound + 1)
        
        // Sudden Death check if tournament is over
        if (nextRoundMatches.length === 0) {
          const leaderboard = await RoomPlayer.query().where('roomId', room.id).where('isKicked', false).orderBy('score', 'desc')
          if (leaderboard.length >= 2 && leaderboard[0].score > 0 && leaderboard[0].score === leaderboard[1].score) {
             const topScore = leaderboard[0].score
             const tiedPlayers = leaderboard.filter(p => p.score === topScore)
             
             for (let i = 0; i < tiedPlayers.length; i++) {
               for (let j = i + 1; j < tiedPlayers.length; j++) {
                 await Match.create({
                   roomId: room.id,
                   roundNumber: room.currentRound + 1,
                   player1Id: tiedPlayers[i].userId,
                   player2Id: tiedPlayers[j].userId
                 })
               }
             }
             nextRoundMatches = await Match.query().where('roomId', room.id).where('roundNumber', room.currentRound + 1)
          }
        }

        if (nextRoundMatches.length === 0) {
          room.status = 'finished'
          await room.save()
          io.to(room.code).emit('game_over')
        } else {
          room.currentRound++
          await room.save()
          
          // Pre-fill kicked players' choices
          let kickedAny = false
          for (const m of nextRoundMatches) {
            const rp1 = m.player1Id ? await RoomPlayer.query().where('roomId', room.id).where('userId', m.player1Id!).first() : null
            const rp2 = m.player2Id ? await RoomPlayer.query().where('roomId', room.id).where('userId', m.player2Id!).first() : null
            if (rp1?.isKicked) m.p1Choice = 'kicked'
            if (rp2?.isKicked) m.p2Choice = 'kicked'
            if (rp1?.isKicked || rp2?.isKicked) {
              await m.save()
              kickedAny = true
            }
          }

          io.to(room.code).emit('new_round', { round: room.currentRound, matches: nextRoundMatches })

          // If anyone was kicked in the new round, auto-evaluate their matches immediately if possible
          if (kickedAny) {
            await checkAndPushCurrentRound(room, io)
          }
        }
      }
    })

    socket.on('takeover_host', async (data) => {
      const room = await Room.findBy('code', data.roomCode)
      if (!room) return

      // Only allow takeover if the current host is no longer a player in the room
      if (room.hostId) {
        const currentHost = await RoomPlayer.query().where('roomId', room.id).where('userId', room.hostId).first()
        if (currentHost) return // Host is still in the room, cannot takeover
      }

      const takingUserId = socket.data.userId
      const rp = await RoomPlayer.query().where('roomId', room.id).where('userId', takingUserId).first()
      if (rp) {
        room.hostId = takingUserId
        await room.save()
        io.to(room.code).emit('host_transferred', { hostId: takingUserId })
      }
    })

    socket.on('chat_message', (data) => {
      if (!data.roomCode || typeof data.text !== 'string' || typeof data.user !== 'string') return
      if (data.text.length > 200 || data.user.length > 100) return
      io.to(data.roomCode).emit('chat_message', {
        roomCode: data.roomCode,
        user: data.user,
        text: data.text,
        isEmote: !!data.isEmote
      })
    })
  })

  async function checkAndPushCurrentRound(room: Room, io: Server) {
    if (room.currentRound === 0) {
       room.currentRound = 1
       await room.save()
    }
    const matches = await Match.query().where('roomId', room.id).where('roundNumber', room.currentRound)
    const unfinished = matches.filter(m => m.winnerId === null && (m.p1Choice === null || m.p2Choice === null))

    if (unfinished.length === 0) {
      if (matches.length > 0) {
        // Evaluate tie-breakers
        const tiedMatches = matches.filter(m => m.winnerId === null)
        
        if (tiedMatches.length > 0) {
          // Push future rounds by 1
          const futureMatches = await Match.query().where('roomId', room.id).where('roundNumber', '>', room.currentRound).orderBy('roundNumber', 'desc')
          for (const fm of futureMatches) {
            fm.roundNumber += 1
            await fm.save()
          }
          
          // Add tie breakers in the very next round
          for (const tie of tiedMatches) {
            const tm = await Match.create({
              roomId: room.id,
              roundNumber: room.currentRound + 1,
              player1Id: tie.player1Id,
              player2Id: tie.player2Id
            })
            // Immediately apply kicks for the tie breaker match
            const rp1 = tie.player1Id ? await RoomPlayer.query().where('roomId', room.id).where('userId', tie.player1Id as number).first() : null
            const rp2 = tie.player2Id ? await RoomPlayer.query().where('roomId', room.id).where('userId', tie.player2Id as number).first() : null
            if (rp1?.isKicked) tm.p1Choice = 'kicked'
            if (rp2?.isKicked) tm.p2Choice = 'kicked'
            if (rp1?.isKicked || rp2?.isKicked) await tm.save()
          }
        }
        
        const allPlayersRaw = await RoomPlayer.query().where('roomId', room.id).orderBy('score', 'desc').preload('user')
        const leaderboard = allPlayersRaw.map(p => ({ 
          score: p.score, 
          userId: p.userId, 
          name: p.user?.fullName || `User #${p.userId}`,
          avatar: `https://api.dicebear.com/7.x/${p.user?.avatarStyle || 'fun-emoji'}/svg?seed=${p.user?.avatarSeed || p.user?.id}`
        }))
        io.to(room.code).emit('round_finished', { round: room.currentRound, leaderboard, matches: matches.map(m => m.serialize()) })
      }
      
      // Removed automatic transition to next round.
      // Host will emit 'host_next_action' to continue.
    } else {
      io.to(room.code).emit('matches_state', { round: room.currentRound, matches })
    }
  }
})
