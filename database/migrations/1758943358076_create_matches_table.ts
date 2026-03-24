import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'matches'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.integer('room_id').unsigned().references('id').inTable('rooms').onDelete('CASCADE')
      table.integer('round_number').notNullable()
      table.integer('player1_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.integer('player2_id').unsigned().references('id').inTable('users').onDelete('CASCADE').nullable()
      table.string('p1_choice').nullable()
      table.string('p2_choice').nullable()
      table.integer('winner_id').unsigned().references('id').inTable('users').onDelete('CASCADE').nullable()
      
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
