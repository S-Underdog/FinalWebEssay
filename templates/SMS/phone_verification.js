const message = (otp, name) =>{
    return `Dear ${name},\n`
    + `${otp} is your otp for Phone Number Verfication. Please enter the OTP to verify your phone number.`;
}

module.exports= message;