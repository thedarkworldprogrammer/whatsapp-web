const twilio = require('twilio')

//twilio credentials
const accountSID = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const serviceSID = process.env.TWILIO_SERVICE_SID

const client = twilio(accountSID, authToken);

// send otp to phone no
const sendOtpToPhone = async (phoneNumber) => {
    try {
        console.log('sending otp to phone', phoneNumber);
        if (!phoneNumber) {
            throw new Error('Phone number is required.')
        }
        const response = await client.verify.v2.services(serviceSID).verifications.create({
            to: phoneNumber,
            channel: 'sms'
        });
        console.log('this is my otp response', response);
        return response;
    } catch (error) {
        console.error(error)
        throw new Error('Failed to send otp')
    }
}


const verifyOtp = async (phoneNumber, otp) => {
    try {
        console.log('this is my otp', otp);
        console.log('this number', phoneNumber);
        const response = await client.verify.v2.services(serviceSID).verificationChecks.create({
            to: phoneNumber,
            code: otp
        });
        console.log('this is my otp response', response);
        return response;
    } catch (error) {
        console.error(error)
        throw new Error('otp verification failed')
    }
}


module.exports = { sendOtpToPhone, verifyOtp }