const express = require('express')
const router = express.Router()
const registerValidator = require('../validators/registerValidator')
const loginValidator = require('../validators/loginValidator')
const multipleUpload = require('../middleware/upload')
const UserController = require('../controllers/UserCotroller')
const checkLogin = require('../auth/checkLogin')

router.get('/register', UserController.getRegister)

router.post('/register',multipleUpload, registerValidator, UserController.postRegister)

router.get('/login' ,UserController.getLogin)

router.post('/login',loginValidator, UserController.postLogin)

router.get('/getUser', checkLogin,  UserController.getUserInfo)

module.exports = router