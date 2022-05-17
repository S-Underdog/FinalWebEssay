const path = require('path')
const multer = require('multer')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/uploads/users')
    },
    filename: (req, file, cb) => {
        let ext = path.extname(file.originalname)
        cb(null, Date.now() + ext)
    }
})

const allow_file = ["image/png", "image/jpg", "image/gif", "image/jpeg"]

const fileFilter = (req, file, cb) => {
    if (allow_file.find(s => s == file.mimetype))
        cb(null, true)
    else {
        cb(null, false)
    }
}

const uploader = multer({
    storage: storage,
    limits: 1024 * 1024 * 5,
    fileFilter: fileFilter
})

const multipleUpload = uploader.fields([{ name: 'frontID' }, { name: 'backID' }])
module.exports = multipleUpload