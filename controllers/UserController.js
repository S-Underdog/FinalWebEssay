const { validationResult } = require('express-validator')
const fs = require('fs')
const nodemailer = require('nodemailer')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { stopWithdraw, normalizeDate, checkErrorInput } = require('../middleware/functions');
const otpGenerator = require('otp-generator');


const User = require('../models/UserModel')
const CreditCard = require('../models/CreditCard')
const OTP = require('../models/OTP')
const Provider = require('../models/Provider')

function fileValidator(req) {
    let message
    if (!req.files['frontID']) {
        message = 'Không được bỏ trống mặt trước CMND'
    } else if (!req.files['backID']) {
        message = 'Không được bỏ trống mặt sau CMND'
    }
    return message
}

function hashPassword(password) {
    let saltRounds = 10;
    let salt = bcrypt.genSaltSync(saltRounds)
    return bcrypt.hashSync(password, salt)
}

const UserController = {
    getIndex: function (req, res, next) {
        res.render('index')
    },
    getRegister: function (req, res, next) {
        const error = req.flash('error') || ""
        const email = req.flash('email') || ""
        const fullname = req.flash('fullname') || ""
        const phone = req.flash('phone') || ""
        const address = req.flash('address') || ""
        const birth = req.flash('birth') || ""
        res.render('register', { error: error, email, fullname, phone, address, birth })
    },
    postRegister: function (req, res, next) {
        let result = validationResult(req)
        let message = fileValidator(req) || ''

        if (result.errors.length === 0 && !message) {
            const { root } = req.vars
            const userDir = `${root}/public/uploads/users/${req.body.email}`
            const password = Math.random().toString(36).substring(2, 8);
            console.log(password);
            const username = new Date().getTime().toString().slice(-11, -1);
            const { email } = req.body
            return fs.mkdir(userDir, () => {

                const hash = hashPassword(password)
                // Create transport
                // const transporter = nodemailer.createTransport({
                //     host: 'mail.phongdaotao.com',
                //     port: 25,
                //     secure: false,
                //     auth: {
                //         user: "sinhvien@phongdaotao.com",
                //         pass: "svtdtu",
                //     },
                //     tls: {
                //         rejectUnauthorized: false,
                //     }
                // });

                const transporter = nodemailer.createTransport({
                    host: 'mail.phongdaotao.com',
                    port: 25,
                    secure: false,
                    auth: {
                        user: 'sinhvien@phongdaotao.com',
                        pass: 'svtdtu'
                    },
                    tls: {
                        rejectUnauthorized: false,
                    }
                });

                const msg = {
                    from: '"Ví Điện tử SUD 🪙" <sudtechnology.group@gmail.com>',
                    to: `${email}`,
                    subject: "WELCOME TO SUD ✔",
                    text: "Đây là thông tin về tài khoản của bạn",
                    html: `
                        <h2>Username: ${username}</h2>
                        <h2>Password: ${password}</h2>
                    `
                }
                // Moving file
                let imagePath = []
                for (file in req.files) {
                    let currentPath = req.files[file][0].path
                    let destinationPath = `${userDir}/${req.files[file][0].filename}`
                    imagePath.push(destinationPath)
                    fs.rename(currentPath, destinationPath, (err) => {
                        if (!err)
                            console.log('Moving file successfully')
                    })
                }
                let user = {
                    email: req.body.email,
                    fullname: req.body.fullname,
                    phone: req.body.phone,
                    address: req.body.address,
                    birth: req.body.birth,
                    username: username,
                    password: hash,
                    frontID: imagePath[0],
                    backID: imagePath[1]
                }

                return new User(user).save()
                    .then(() => {
                        transporter.sendMail(msg, (err, success) => {
                            if (err)
                                console.log(err)
                            else
                                console.log('Email send successfully')
                        })
                        req.flash('success', "Đăng ký thành công, vui lòng đăng nhập")
                        res.redirect('/user/login')
                    })
                    .catch(() => {
                        req.flash('error', "Đăng ký thất bại")
                    })
            })

        }
        result = result.mapped()
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
    },

    getLogin: function (req, res, next) {
        const error = req.flash('error') || ""
        const username = req.flash('username') || ""
        const fail = req.flash('fail') || false
        const success = req.flash('success') || ""
        res.render('login', { error, success, username, fail })
    },

    postLogin: function (req, res, next) {
        let result = validationResult(req)
        let errorLength = result.errors.length
        if (errorLength === 0) {
            let { username, password } = req.body
            req.flash('username', username)
            let account = undefined
            return User.findOne({ username: username })
                .then(acc => {
                    if (!acc) {
                        req.flash('error', 'Username ' + username + " không tồn tại")
                        res.redirect('/user/login')
                    }
                    account = acc
                    return bcrypt.compare(password, acc.password)
                })
                .then(match => {
                    if (!match) {
                        account.failAccess = (account.failAccess + 1)
                        req.session.failAccess = account.failAccess
                        return account.save((err, data) => {
                            if (err)
                                console.log(err)
                            else {
                                // req.flash('error', 'Mật khẩu không đúng')
                                req.flash('fail', true)
                                res.redirect('/user/login');
                            }
                        })
                    } else {
                        account.failAccess = 0
                        req.session.failAccess = account.failAccess
                        return account.save((err, data) => {
                            const { JWT_SECRET } = process.env
                            jwt.sign({
                                username: account.username,
                            }, JWT_SECRET, {
                                expiresIn: '15m'
                            }, (err, token) => {
                                if (err) {
                                    req.flash('error', 'Đăng nhập thất bại: ' + err)
                                    res.redirect('/user/login')
                                } else {
                                    req.session.username = username
                                    req.session.token = token
                                    req.flash('success', 'Đăng nhập thành công')
                                    res.redirect('/user/')

                                }
                            })
                        })
                    }
                })
        } else {
            let message
            const { username } = req.body
            result = result.mapped()
            for (m in result) {
                message = result[m].msg
                break
            }
            req.flash('error', message)
            req.flash('username', username)
            return res.redirect('/user/login')

        }
    },

    getLogout: function (req, res, next) {
        req.session.destroy();
        res.redirect('/');
    },

    getUserInfo: function (req, res, next) {
        res.json({ code: 0, message: "test thành công" })
    },

    getResetPassword: function (req, res, next) {
        const error = req.flash('error') || ""
        const oldPass = req.flash('oldPass') || ""
        const newPass = req.flash('newPass') || ""
        const rePass = req.flash('rePass') || ""
        res.render('resetPassword', { error, oldPass, newPass, rePass })
    },

    postResetPassword: function (req, res, next) {
        let result = validationResult(req)
        if (result.errors.length === 0) {
            User.findOneAndUpdate({ username: req.session.username }, {
                password: hashPassword(req.body.newPass),
                active: true
            }, (err, data) => {
                if (err)
                    console.log(err)
                else
                    res.redirect('/user/')
            })
        } else {
            result = result.mapped()
            let message
            for (m in result) {
                message = result[m].msg
                break
            }
            const { oldPass, newPass, rePass } = req.body
            req.flash('error', message)
            req.flash('oldPass', oldPass)
            req.flash('rePass', rePass)
            req.flash('newPass', newPass)
            res.redirect('/user/')
        }

    },

    getDepositPage: function(req, res, next) {
        User.findOne({username: req.session.username})
            .then(user => {
                const balance = user.balance;
                const error = req.flash('error') || '';
                return res.render('deposit', {error, balance});
            })
            .catch(next);
        
    },

    postDepositPage: function(req, res, next) {
        checkErrorInput(req, res, '/user/deposit')
        
        const { card_no, expired, cvv_code, amount } = req.body;
        
        CreditCard.findOne({card_no})
            .then(card => {
                if(!card) {
                    req.flash('error', 'Số thẻ không chính xác');
                    return res.redirect('/user/deposit');
                }

                const cardExpired = normalizeDate(card.expired);

                if(cardExpired != expired) {
                    req.flash('error', 'Sai ngày hết hạn');
                    return res.redirect('/user/deposit');
                }

                if(card.cvv_code !== cvv_code) {
                    req.flash('error', 'Sai mã CVV');
                    return res.redirect('/user/deposit');
                }

                var amountInt = parseInt(amount);

                if(amountInt > card.balance) {
                    req.flash('error', 'Số dư trong thẻ không đủ');
                    return res.redirect('/user/deposit');
                }

                card.balance -= amountInt;
                card.save();
                
                req.getUser.balance += amountInt;
                req.getUser.history.push(
                    {
                        action: 'Nạp tiền',
                        amount: amountInt,
                        fee: 0,
                        createdAt: new Date(),
                        status: 'Hoàn thành'
                    }
                );
                req.getUser.save();
                req.flash('success', 'Nạp tiền thành công');
                return res.redirect('/user/')
            })
            .catch(next);     
    },

    getWithdrawPage: function(req, res, next) {
        User.findOne({username: req.session.username})
            .then(user => {
                const balance = user.balance;
                const error = req.flash('error') || '';
                return res.render('withdraw', {error, balance});
            })
            .catch(next);
    },

    postWithdrawPage: function(req, res, next) {
        checkErrorInput(req, res, '/user/withdraw');
        
        const { card_no, expired, cvv_code, amount, note } = req.body;
        
        let isOver = stopWithdraw(req.getUser);
        if(isOver) {
            req.flash('error', 'Đã hết số lần giao dịch');
            return res.redirect('/user/withdraw');
        }
        
        var amountInt = parseInt(amount);
        
        if(amountInt % 50000 != 0) {
            req.flash('error', 'Số tiền rút phải là bội số của 50000');
            return res.redirect('/user/withdraw');
        }

        if((amountInt * 105 / 100) > req.getUser.balance) {
            req.flash('error', 'Số dư trong ví không đủ');
            return res.redirect('/user/withdraw');
        }

        CreditCard.findOne({card_no})
            .then(card => {
                if(!card) {
                    req.flash('error', 'Số thẻ không chính xác');
                    return res.redirect('/user/withdraw');
                }

                const cardExpired = normalizeDate(card.expired);

                if(cardExpired != expired) {
                    req.flash('error', 'Sai ngày hết hạn');
                    return res.redirect('/user/withdraw');
                }

                if(card.cvv_code !== cvv_code) {
                    req.flash('error', 'Sai mã CVV');
                    return res.redirect('/user/withdraw');
                }

                var trade = {
                    action: 'Rút tiền',
                    amount: amountInt,
                    fee: amountInt * 5 / 100,
                    note: note,
                    createdAt: new Date(),
                    status: (amountInt > 5000000) ? 'Đang chờ duyệt' : 'Hoàn thành',
                }
                req.getUser.history.push(trade);

                if(trade.status === 'Hoàn thành') {
                    req.getUser.balance -= (amountInt * 105 / 100);
                    req.getUser.save();

                    card.balance += amountInt;
                    card.save();
                    req.flash('success', 'Rút tiền thành công');
                }
                else {
                    req.getUser.save();
                    req.flash('success', 'Yêu cầu rút tiền thành công. Vui lòng chờ xét duyệt');
                }

                return res.redirect('/user');
            })
            .catch(next);
    },

    getTransferPage: function(req, res, next) {
        User.findOne({username: req.session.username})
            .then(user => {
                const balance = user.balance;
                const error = req.flash('error') || '';
                return res.render('transfer', {error, balance});
            })
            .catch(next);
    },

    postTransferPage: function(req, res, next) {
        checkErrorInput(req, res, '/user/transfer');

        const { phone, amount, note, isFeePayer } = req.body;
        
        User.findOne({phone})
            .then(receiver => {
                if(!receiver) {
                    req.flash('error', 'Tài khoản này không tồn tại');
                    return res.redirect('/user/transfer');
                }

                var amountInt = parseInt(amount);
                var total = (isFeePayer) ? amountInt * 105 / 100 : amountInt;

                if(total > req.getUser.balance) {
                    req.flash('error', 'Số dư trong ví không đủ');
                        return res.redirect('/user/transfer');
                }

                var trade = {
                    action: 'Chuyển tiền',
                    receiver: receiver.fullname,
                    amount: amountInt,
                    fee: (isFeePayer) ? (amountInt * 5 / 100) : 0,
                    note: note,
                    createdAt: new Date(),
                    status: (amountInt > 5000000) ? 'Đang chờ duyệt' : 'Hoàn thành',
                }

                req.flash('name', receiver.fullname);
                req.flash('amount', amountInt);
                req.flash('fee', trade.fee);
                req.flash('note', trade.note);
                req.session.phone = phone;
                req.session.trade = trade;
                return res.redirect('/user/transfer/confirm');                    
            })
            .catch(next);
    },

    getTransferConfirm: function(req, res, next) {
        const receiver = req.flash('name') || '';
        const amount = req.flash('amount') || 0;
        const fee = req.flash('fee') || 0;
        const note = req.flash('note') || '';

        return res.render('confirm', {receiver, amount, fee, note});
    },

    postTransferConfirm: function(req, res, next) {
        const phone = req.session.phone;
        console.log(phone);
        User.findOne({phone})
            .then(async receiver => {
                const otp = otpGenerator.generate(6, { alphabets: false, upperCase: false, specialChars: false });
                const otp_instance = await OTP.create({
                    otp: otp,
                    verified: false,
                });
        
                var details = {
                    "timestamp": new Date(), 
                    "check": phone,
                    "success": true,
                    "message":"OTP sent to user",
                    "otp_id": otp_instance._id
                }
        
                const message = require('../templates/SMS/phone_verification');
                var phone_mess = message(otp, receiver.fullname);
                var params = {
                    Message: phone_mess,
                    PhoneNumber: phone
                };

                var publishTextPromise = new AWS.SNS({ apiVersion: '2010-03-31' }).publish(params).promise();
                publishTextPromise
                    .then(data => {
                        console.log('success');
                    })
                    .catch(err => {
                        console.log('fail');
                });

                const trade = req.session.trade;
                req.getUser.history.push(trade);
        
                if(trade.status === 'Hoàn thành') {
                    req.getUser.balance -= (trade.amount + trade.fee);
                    req.getUser.save();
        
                    receiver.balance += (trade.fee == 0) ? (trade.amount - fee) : trade.amount;
                    receiver.save();
                    req.flash('success', 'Chuyển tiền thành công');
                }
                else {
                    req.getUser.save();
                    req.flash('success', 'Yêu cầu chuyển tiền thành công. Vui lòng chờ xét duyệt');
                }
        
                return res.redirect('/user'); 
            })
            .catch(next);
    },

    getMobileCardPage: function(req, res, next) {
        User.findOne({username: req.session.username})
            .then(user => {
                const phone = req.flash('phone') || '';
                const error = req.flash('error') || '';
                const balance = user.balance;
                return res.render('buycard', {error, phone, balance});
            })
            .catch(next);

    },
    
    postMobileCardPage: function(req, res, next) {
        const { provider_name, card_value, quantity} = req.body;
        
        var total = card_value * quantity;
        if(total > req.getUser.balance) {
            req.flash('error', 'Số dư trong ví không đủ');
            return res.redirect('/user/buycard');
        }

        Provider.findOne({provider_name})
            .then(provider => {
                let listCard = [];
                for(let i = 0; i < quantity; i++) {
                    var newCard = provider.provider_code + Math.random().toString().slice(-7,-2);
                    listCard.push(newCard);
                }

                const trade = {
                    action: `Mua thẻ ${provider.provider_name}`,
                    amount: total,
                    fee: 0,
                    receive_code: listCard,
                    createdAt: new Date(),
                    status: 'Hoàn thành',
                }

                req.getUser.history.push(trade);
                req.getUser.balance -= (total + trade.fee);
                req.getUser.save();

                req.flash('success', 'Mua thẻ thành công');
                return res.redirect('/user/notification');
            })
            .catch(next);
    },

    getNotificationPage: function(req, res, next) {
        const success = req.flash('success') || '';
        
        return res.render('notification', {success})
    }


}

module.exports = UserController