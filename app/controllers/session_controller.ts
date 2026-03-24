import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import { randomBytes } from 'crypto'
import { loginValidator } from '#validators/user'

/**
 * SessionController handles user authentication and session management.
 * It provides methods for displaying the login page, authenticating users,
 * and logging out.
 */
export default class SessionController {
  /**
   * Display the login page
   */
  async create({ view }: HttpContext) {
    return view.render('pages/auth/login')
  }

  /**
   * Authenticate user credentials and create a new session
   */
  async store({ request, auth, response }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)
    const user = await User.verifyCredentials(email, password)

    await auth.use('web').login(user)
    response.redirect().toRoute('home')
  }

  /**
   * Log out the current user and destroy their session
   */
  async destroy({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    response.redirect().toRoute('session.create')
  }

  /**
   * Log in a guest with employee ID
   */
  async guestLogin({ request, auth, response }: HttpContext) {
    const employeeId = request.input('employeeId')
    if (!employeeId) return response.redirect().back()
    
    let user = await User.findBy('email', `${employeeId}@guest.local`)
    if (!user) {
      user = await User.create({
        fullName: `Employee ${employeeId}`,
        email: `${employeeId}@guest.local`,
        password: randomBytes(16).toString('hex'),
        avatarStyle: 'adventurer',
        avatarSeed: employeeId
      })
    }
    await auth.use('web').login(user)
    return response.redirect().toRoute('home')
  }
}
