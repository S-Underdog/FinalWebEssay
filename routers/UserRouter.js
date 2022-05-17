const express = require('express')
const router = express.Router()
const registerValidator = require('../validators/registerValidator')

const multipleUpload = require('../middleware/upload')
const UserController = require('../controllers/UserCotroller')

router.get('/register', UserController.getRegister)

router.post('/register',multipleUpload, registerValidator, UserController.postRegister)

router.get('/login', UserController.getLogin)
module.exports = router