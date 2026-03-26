import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'room_players'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('strikes').defaultTo(0)
      table.boolean('is_kicked').defaultTo(false)
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('strikes')
      table.dropColumn('is_kicked')
    })
  }
}
