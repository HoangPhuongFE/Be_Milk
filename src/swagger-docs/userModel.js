/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - role
 *       properties:
 *         user_id:
 *           type: integer
 *           description: The auto-generated ID of the user
 *         email:
 *           type: string
 *           description: The user's email
 *         password:
 *           type: string
 *           description: The user's password
 *         role:
 *           type: string
 *           enum: [admin, staff, user]
 *           description: The user's role
 *         resetPasswordToken:
 *           type: string
 *           description: Token for resetting password
 *         resetPasswordExpires:
 *           type: string
 *           format: date-time
 *           description: Token expiration time
 *         status:
 *           type: integer
 *           description: User status
 *         avatar_url:
 *           type: string
 *           description: URL of the user's avatar
 *         date_create:
 *           type: string
 *           format: date-time
 *           description: The date the user was created
 *         address:
 *           type: string
 *           description: The user's address
 *         phone:
 *           type: string
 *           description: The user's phone number
 *         gender:
 *           type: string
 *           enum: [male, female, other]
 *           description: The user's gender
 *         full_name:
 *           type: string
 *           description: The user's full name
 *         birthday:
 *           type: string
 *           format: date
 *           description: The user's birthday
 *         coin:
 *           type: integer
 *           description: The user's coins
 *         email_verify_token:
 *           type: string
 *           description: Token for email verification
 *         verify:
 *           type: integer
 *           description: Email verification status
 *         forgot_password_token:
 *           type: string
 *           description: Token for forgotten password
 *       example:
 *         user_id: 1
 *         email: "user@gmail.com"
 *         password: "user@123"
 *         role: "user"
 *         resetPasswordToken: null
 *         resetPasswordExpires: null
 *         status: 1
 *         avatar_url: "http://example.com/avatar.jpg"
 *         date_create: "2023-01-01T00:00:00.000Z"
 *         address: "123 Main St"
 *         phone: "1234567890"
 *         gender: "male"
 *         full_name: "John Doe"
 *         birthday: "1990-01-01"
 *         coin: 100
 *         email_verify_token: null
 *         verify: 1
 *         forgot_password_token: null
 */
