/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import { controllers } from '#generated/controllers'
import router from '@adonisjs/core/services/router'

router.on('/').render('pages/home').as('home')

router
  .group(() => {
    router.get('signup', [controllers.NewAccount, 'create'])
    router.post('signup', [controllers.NewAccount, 'store'])

    router.get('login', [controllers.Session, 'create'])
    router.post('login', [controllers.Session, 'store'])
    
    router.post('guest-login', [controllers.Session, 'guestLogin']).as('guest.login')
  })
  .use(middleware.guest())

const GamesController = () => import('#controllers/games_controller')

router
  .group(() => {
    router.post('logout', [controllers.Session, 'destroy'])
    
    // Game Routes
    router.post('rooms/create', [GamesController, 'createRoom']).as('rooms.create')
    router.post('rooms/join', [GamesController, 'joinRoom']).as('rooms.join')
    router.get('rooms/:code', [GamesController, 'showRoom']).as('rooms.show')
    
    // Reports
    router.get('reports', [GamesController, 'report']).as('reports.index')
    router.get('reports/:id', [GamesController, 'roomReport']).as('reports.show')
  })
  .use(middleware.auth())
