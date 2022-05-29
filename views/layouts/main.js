let fail = document.getElementById('failAccess')
if (fail) {
    countDown()
}
function countDown() {
    let minutes = 20
    let x = setInterval(() => {
        minutes -= 1
        document.getElementById('failAccess').innerHTML = 'Tài khoản của bạn đã bị khóa tạm thời vui lòng thử lại sau 00:' + ((minutes >= 10) ? minutes : ('0' + minutes))
    }, 1000)

    setTimeout(() => {
        clearInterval(x)
        document.getElementById('failAccess').innerHTML = ''
        location.reload()
    }, 20000);
}


$(document).ready(function(){
    var quantitiy = 0;
    
    $('.quantity-right-plus').click(function(e){
        e.preventDefault();
        var quantity = parseInt($('#quantity').val());
        $('#quantity').val(quantity + 1);

    });

    $('.quantity-left-minus').click(function(e){
        e.preventDefault();
        var quantity = parseInt($('#quantity').val());
        
        if(quantity>0){
            $('#quantity').val(quantity - 1);
        }
    });
        
});