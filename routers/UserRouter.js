const express = require('express')
const { validationResult } = require('express-validator')
const bcrypt = require('bcrypt')
const fs = require('fs')
const router = express.Router()

const User = require('../models/UserModel')
const registerValidator = require('../validators/registerValidator')


router.get('/register', (req, res) => {
    const error = req.flash('error') || "";
    const email = req.flash('email') || ""
    const fullname = req.flash('fullname') || ""
    const phone = req.flash('phone') || ""
    const address = req.flash('address') || ""
    const birth = req.flash('birth') || ""
    res.render('register', { error: error, email, fullname, phone, address, birth })
})

router.post('/register', registerValidator, (req, res) => {
    let result = validationResult(req);
    // Thông tin đăng ký hợp lệ
    if (result.errors.length === 0) {
        const { root } = req.vars
        const userDir = `${root}/users/${req.body.email}`

        const password = Math.random().toString(36).substring(2, 8);
        const username = new Date().getTime().toString().slice(-11, -1)

        res.json({ code: 1, message: "Đăng ký thành công", password: password, username: username, userDir: userDir })
        return fs.mkdir(userDir, ()=> {
            const saltRounds  = 10;
            const salt = bcrypt.genSaltSync(saltRounds)
            const hash = bcrypt.hashSync(password,salt)

            let user = {
                email: req.body.email,
                fullname: req.body.fullname,
                phone: req.body.phone,
                address: req.body.address,
                birth: req.body.birth,
                username: username,
                password: hash
            }
            return new User(user).save().then(res.redirect('/user/login'), req.flash('success', "Đăng ký thành công")).catch(req.flash('error', 'Đăng ký thất bại'))
        })


    }
    result = result.mapped()
    let message
    for (fields in result) {
        message = result[fields].msg
        break;
    }

    const { email, fullname, phone, birth, address } = req.body
    req.flash('error', message)
    req.flash('email', email)
    req.flash('fullname', fullname)
    req.flash('phone', phone)
    req.flash('address', address)
    req.flash('birth', birth)

    res.redirect('/user/register')
})


module.exports = router