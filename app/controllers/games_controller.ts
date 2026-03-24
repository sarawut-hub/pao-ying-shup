import type { HttpContext } from '@adonisjs/core/http'
import Room from '#models/room'
import RoomPlayer from '#models/room_player'
import Match from '#models/match'
import { randomBytes } from 'crypto'

export default class GamesController {
  
  public async createRoom({ auth, response }: HttpContext) {
    const user = auth.user!
    const code = randomBytes(3).toString('hex').toUpperCase()
    
    const room = await Room.create({
      code,
      hostId: user.id,
      status: 'waiting',
      currentRound: 0
    })

    await RoomPlayer.create({
      roomId: room.id,
      userId: user.id,
      score: 0
    })

    return response.redirect().toRoute('rooms.show', { code: room.code })
  }

  public async joinRoom({ request, response, session, auth }: HttpContext) {
    const code = request.input('code')
    if (!code) {
      session.flash('error', 'Room code is required')
      return response.redirect().back()
    }

    const room = await Room.findBy('code', code.toUpperCase())
    if (!room) {
      session.flash('error', 'Room not found')
      return response.redirect().back()
    }

    if (room.status !== 'waiting') {
      session.flash('error', 'Game has already started or finished')
      return response.redirect().back()
    }

    const user = auth.user!
    const existingPlayer = await RoomPlayer.query().where('roomId', room.id).where('userId', user.id).first()

    if (!existingPlayer) {
      await RoomPlayer.create({
        roomId: room.id,
        userId: user.id,
        score: 0
      })
    }

    return response.redirect().toRoute('rooms.show', { code: room.code })
  }

  public async showRoom({ params, view, auth, response }: HttpContext) {
    const room = await Room.findBy('code', params.code)
    if (!room) return response.notFound('Room not found')

    const user = auth.user!
    const me = await RoomPlayer.query().where('roomId', room.id).where('userId', user.id).first()

    if (!me) {
      return response.redirect().back() // not joined
    }

    const isHost = room.hostId === user.id
    
    // get leaderboard for current room
    const players = await RoomPlayer.query().where('roomId', room.id).orderBy('score', 'desc')
    
    return view.render('pages/room', { room, isHost, players })
  }

  public async report({ view }: HttpContext) {
    const rooms = await Room.query().where('status', 'finished').orderBy('id', 'desc')
    // We will list all rooms and their top players here in the template
    return view.render('pages/report', { rooms })
  }

  public async roomReport({ params, view }: HttpContext) {
    const room = await Room.findOrFail(params.id)
    const players = await RoomPlayer.query().where('roomId', room.id).orderBy('score', 'desc')
    return view.render('pages/room_report', { room, players })
  }
}
