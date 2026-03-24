import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'rooms'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('code').notNullable().unique()
      table.integer('host_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.string('status').notNullable().defaultTo('waiting')
      table.integer('current_round').notNullable().defaultTo(0)
      
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
