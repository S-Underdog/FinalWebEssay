const { validationResult } = require('express-validator')

exports.stopWithdraw = (user) => {
    let curr = new Date();
    curr = this.normalizeDate(curr);
    let count = 0;
    let isOver = false;

    user.history.forEach(h => {
        
        if(this.normalizeDate(h.createdAt) === curr && h.status === 'Rút tiền') {
            count += 1;
        }

        if(count == 2) {
            isOver = true;
            return;
        }
    })

    return isOver;
}

exports.normalizeDate = (date) => {
    return date.toISOString().split('T')[0];
}

exports.checkErrorInput = (req, res, backup_path) => {
    let errors = validationResult(req);
    if(!errors.isEmpty()) {
        errors = errors.mapped();
        let message = '';
        for(err in errors) {
            message = errors[err].msg;
            break;
        }
        
        req.flash('error', message);
        return res.redirect(backup_path);
    }
}