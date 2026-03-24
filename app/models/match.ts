import { column } from '@adonisjs/lucid/orm'
import { MatchSchema } from '#database/schema'

export default class Match extends MatchSchema {
	@column({ columnName: 'player1_id' })
	declare player1Id: number | null

	@column({ columnName: 'player2_id' })
	declare player2Id: number | null

	@column({ columnName: 'p1_choice' })
	declare p1Choice: string | null

	@column({ columnName: 'p2_choice' })
	declare p2Choice: string | null
}
