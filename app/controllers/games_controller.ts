import type { HttpContext } from '@adonisjs/core/http'
import Room from '#models/room'
import Match from '#models/match'
import vine from '@vinejs/vine'
import RoomPlayer from '#models/room_player'
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
    const schema = vine.compile(
      vine.object({
        code: vine.string().maxLength(10)
      })
    )
    
    try {
      const payload = await request.validateUsing(schema)
      const room = await Room.findBy('code', payload.code.toUpperCase())
      if (!room) throw new Error('Room not found')
      
      if (room.status !== 'waiting') {
        // Late joiners are allowed to join but won't be created as RoomPlayers
        return response.redirect().toRoute('rooms.show', { code: room.code })
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
    } catch (e) {
      session.flash('error', 'Invalid room code or room not found')
      return response.redirect().back()
    }
  }

  public async showRoom({ params, view, auth, response }: HttpContext) {
    const room = await Room.findBy('code', params.code)
    if (!room) return response.notFound('Room not found')

    const user = auth.user!
    const me = await RoomPlayer.query().where('roomId', room.id).where('userId', user.id).first()

    const isSpectator = !me
    const isHost = room.hostId === user.id
    
    // get leaderboard for current room
    const players = await RoomPlayer.query().where('roomId', room.id).orderBy('score', 'desc').preload('user')
    
    return view.render('pages/room', { room, isHost, players, isSpectator })
  }

  public async report({ request, view }: HttpContext) {
    const page = request.input('page', 1)
    const limit = 20
    const rooms = await Room.query().where('status', 'finished').orderBy('id', 'desc').paginate(page, limit)
    // We will list all rooms and their top players here in the template
    return view.render('pages/report', { rooms })
  }

  public async roomReport({ params, view, auth }: HttpContext) {
    const room = await Room.findOrFail(params.id)
    const players = await RoomPlayer.query().where('roomId', room.id).orderBy('score', 'desc').preload('user')
    const isHost = room.hostId === auth.user?.id
    return view.render('pages/room_report', { room, players, isHost })
  }

  public async deleteRoom({ params, auth, response, session }: HttpContext) {
    const room = await Room.findBy('code', params.code)
    if (!room) return response.notFound('Room not found')
    
    if (room.hostId !== auth.user!.id) {
      return response.unauthorized('Only the host can delete this room')
    }

    await Match.query().where('roomId', room.id).delete()
    await RoomPlayer.query().where('roomId', room.id).delete()
    await room.delete()

    session.flash('success', 'Room deleted successfully')
    return response.redirect().toRoute('home')
  }
}
