const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
    let token = req.session.token
    if (!token) {
        res.status(403)
        req.flash('error', 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại')
        return res.redirect('/user/login')
    }
    const { JWT_SECRET } = process.env

    jwt.verify(token, JWT_SECRET, (err, data) => {
        if (err) {
            res.status(403)
            req.flash('error', 'Token không hợp lệ')
            return res.redirect('/user/login')
        }
        req.user = data
        next()
        
    })
}