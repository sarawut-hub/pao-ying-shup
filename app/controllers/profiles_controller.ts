import type { HttpContext } from '@adonisjs/core/http'
import { updateProfileValidator } from '#validators/user'

export default class ProfilesController {
  
  async show({ view, auth }: HttpContext) {
    const user = auth.user!
    return view.render('pages/profile', { user })
  }

  async update({ request, auth, response, session }: HttpContext) {
    const user = auth.user!
    const payload = await request.validateUsing(updateProfileValidator)
    
    user.merge(payload)
    await user.save()

    session.flash('success', 'Profile updated successfully!')
    return response.redirect().back()
  }
}
