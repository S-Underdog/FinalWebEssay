const express = require('express')
const { validationResult } = require('express-validator')
const bcrypt = require('bcrypt')
const fs = require('fs')
const router = express.Router()
const nodemailer = require('nodemailer')
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
        const email = req.body.email

        return fs.mkdir(userDir, () => {
            const saltRounds = 10;
            const salt = bcrypt.genSaltSync(saltRounds)
            const hash = bcrypt.hashSync(password, salt)

            // Create transport
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: 'sudtechnology.group@gmail.com',
                    pass: 'nodem@iler.com'
                },
                tls: {
                    rejectUnauthorized: false,
                }
            });

            const msg = {
                from: '"Ví Điện tử SUD 👻" <sudtechnology.group@gmail.com>',
                to: `${email}`,
                subject: "WELCOME TO SUD ✔",
                text: "Đây là thông tin về tài khoản của bạn",
                html: `
                    <h2>Username: ${username}</h2>
                    <h2>Password: ${password}</h2>
                `
            }

            let user = {
                email: req.body.email,
                fullname: req.body.fullname,
                phone: req.body.phone,
                address: req.body.address,
                birth: req.body.birth,
                username: username,
                password: hash
            }
            return new User(user).save()
                .then(() => {
                    transporter.sendMail(msg, (err, success) => {
                        if (err)
                            console.log(err)
                        else
                            console.log('Email send successfully')
                    })
                    req.flash('success', "Đăng ký thành công")
                    res.redirect('/login')
                })
                .catch(() => {
                    req.flash('error', "Đăng ký thất bại")
                })

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