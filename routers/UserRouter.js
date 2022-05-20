const express = require('express')
const router = express.Router()
const registerValidator = require('../validators/registerValidator')
const loginValidator = require('../validators/loginValidator')
const multipleUpload = require('../middleware/upload')
const UserController = require('../controllers/UserController')
const checkLogin = require('../auth/checkLogin')
const checkUser = require('../auth/checkUser')
const resetPasswordValidator = require('../validators/resetPasswordValidator')


router.get('/register', UserController.getRegister)
// Add one
router.post('/register', multipleUpload, registerValidator, UserController.postRegister)

router.get('/login', UserController.getLogin)

router.post('/login', loginValidator, UserController.postLogin)


router.get('/', checkLogin, checkUser, UserController.getIndex)

router.get('/resetPassword',checkLogin, UserController.getResetPassword)
router.post('/resetPassword', resetPasswordValidator, UserController.postResetPassword)
// Get All
router.get('/getUsers', checkLogin, checkUser, UserController.getUserInfo)
// Get one
// Update one
// Delete one
module.exports = router