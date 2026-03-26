import { RoomPlayerSchema } from '#database/schema'
import { belongsTo, column } from '@adonisjs/lucid/orm'
import User from '#models/user'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class RoomPlayer extends RoomPlayerSchema {
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @column()
  declare strikes: number

  @column()
  declare isKicked: boolean
}
