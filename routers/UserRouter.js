const express = require('express')
const router = express.Router()
const registerValidator = require('../validators/registerValidator')
const loginValidator = require('../validators/loginValidator')
const UserController = require('../controllers/UserController')
const checkLogin = require('../auth/checkLogin')
const checkUser = require('../auth/checkUser')
const resetPasswordValidator = require('../validators/resetPasswordValidator')
const middleware = require('../middleware/index')

router.get('/register', UserController.getRegister)
// Add one
router.post('/register', middleware.multipleUpload, registerValidator, UserController.postRegister)
    
router.get('/login',middleware.roleLogin, UserController.getLogin)

router.post('/login', loginValidator, UserController.postLogin)

router.get('/logout', UserController.getLogout)

router.get('/', checkLogin, checkUser, UserController.getIndex)

router.get('/resetPassword', checkLogin, middleware.roleResetPassword, UserController.getResetPassword)
router.post('/resetPassword', resetPasswordValidator, middleware.getUser, UserController.postResetPassword)
// Get All
router.get('/getUsers', checkLogin, checkUser, UserController.getUserInfo)
// Get one
// Update one
// Delete one

// Deposit money
router.get('/deposit', checkLogin, UserController.getDepositPage)
router.post('/deposit', middleware.getUser, UserController.postDepositPage);
// Withdraw money

module.exports = router