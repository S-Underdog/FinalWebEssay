let fail = document.getElementById('failAccess')
if (fail) {
    countDown()
}
function countDown() {
    let minutes = 60
    let x = setInterval(() => {
        minutes -= 1
        document.getElementById('failAccess').innerHTML = 'Bạn đã nhập sai mật khẩu. '
            + 'Tài khoản của bạn đã bị khóa tạm thời vui lòng thử lại sau 00:' + ((minutes >= 10) ? minutes : ('0' + minutes))
    }, 1000)

    setTimeout(() => {
        clearInterval(x)
        document.getElementById('failAccess').innerHTML = ''
        location.reload()
    }, 60000);

}