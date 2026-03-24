import vine from '@vinejs/vine'

/**
 * Shared rules for email and password.
 */
const email = () => vine.string().email().maxLength(254)
const password = () => vine.string().minLength(8).maxLength(32)

/**
 * Validator to use when performing self-signup
 */
export const signupValidator = vine.compile(
  vine.object({
    fullName: vine.string().nullable(),
    email: email().unique({ table: 'users', column: 'email' }),
    password: password().confirmed({
      confirmationField: 'passwordConfirmation',
    }),
  })
)

/**
 * Validator for login
 */
export const loginValidator = vine.compile(
  vine.object({
    email: email(),
    password: vine.string(),
  })
)

/**
 * Validator for avatar/profile updates
 */
export const updateProfileValidator = vine.compile(
  vine.object({
    fullName: vine.string().minLength(3).maxLength(50),
    avatarStyle: vine.enum(['adventurer', 'avataaars', 'personas', 'open-peeps', 'notionists', 'bottts', 'fun-emoji']),
    avatarSeed: vine.string().maxLength(50).optional(),
  })
)
