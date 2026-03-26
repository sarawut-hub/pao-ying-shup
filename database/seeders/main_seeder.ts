import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'

export default class extends BaseSeeder {
  async run() {
    // Generate 10 dummy users
    for (let i = 1; i <= 10; i++) {
      const isExisting = await User.findBy('email', `dummy${i}@rpsroyale.test`)
      if (!isExisting) {
        await User.create({
          fullName: `Dummy Player ${i}`,
          email: `dummy${i}@rpsroyale.test`,
          password: 'password123',
          avatarStyle: 'bottts',
          avatarSeed: `dummy-seed-${i}`
        })
      }
    }
  }
}
