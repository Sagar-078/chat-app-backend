const mongoose = require("mongoose");
const mailsender = require("../utils/mailSand");
const verificationEmailTemplate = require("../Email_Template/emailTemplate")


const OTPSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },

    otp: {
        type: String,
        required: true
    },

    createdAt: {
        type: Date,
        default: Date.now(),
        expires: 60*5
    },

});

async function sendVerificationEmail(email, otp){

    try{

        const mailResponse = await mailsender(email, 
        "Verification email from Chat-App", 
        verificationEmailTemplate(otp));

        console.log("otp send successfully =>>>>", mailResponse);

    }catch(error){

        console.log("error while send email =>>", error);
        throw error;
        
    }

}

OTPSchema.pre("save", async function(next){
    if(this.isNew){
        await sendVerificationEmail(this.email, this.otp);
    }

    next();

})

module.exports = mongoose.model("OTP", OTPSchema);