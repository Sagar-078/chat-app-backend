const User = require("../models/userModel");
const crypto = require("crypto");
const mailsender = require("../utils/mailSand");
const bcrypt = require("bcrypt");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");


exports.sendForgotePasswordToken = async(req, res) => {
    try{

        const {email} = req.body;

        const user = await User.findOne({email: email});

        if(!user){
            return res.status(403).json({
                success: false,
                message:"User not found try again latter"
            });
        }


        // generate otp
        const otp = otpGenerator.generate(4, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        })

        // create entry in db for otp
        await OTP.create({'email':email, 'otp':otp})

        return res.status(200).json({
            success: true,
            message: 'Otp send Successfully',
            otp
        })

    }catch(error){

        console.log("error while send reset password otp", error);
        res.status(500).json({
            success: false,
            message: "Somthing error while try to get forgote password otp"
        });

    }
}



// for verify forgote otp 
exports.verifyForgoteOtp = async(req, res) => {
    try{

        const {email, otp} = req.body;

        if(!otp){
            return res.status(404).json({
                success: false,
                message: "Please fill all field",
            });
        }

        const user = await User.findOne({email: email});

        if(!user){
            return res.status(403).json({
                success: false,
                message: "User not found"
            });
        }

        const recentOtp = await OTP.find({email: email}).sort({createdAt:-1}).limit(1);

        if(recentOtp.length == 0 || Date.now()>recentOtp[0].createdAt+5*60*1000){
            return res.status(400).json({
                success: false,
                message: "Otp expired"
            })
        }else if(otp != recentOtp[0].otp){
            return res.status(400).json({
                success: false,
                message: "invalid otp"
            })
        }

        return res.status(200).json({
            success: true,
            message: "Successfully verify otp"
        });


    }catch(error){

        console.log("error while verify otp", error);
        res.status(500).json({
            success: false,
            message: "Error while verify otp"
        });


    }
}


// reset password by this token
exports.forgotePasswordUpdate = async(req, res) => {
    try{

        const {password, confirmPassword, email} = req.body;

        if(password !== confirmPassword){
            return res.status(401).json({
                success: false,
                message: "Password doesn't metch"
            });
        }

        // else find the user by this token
        const user = await User.findOne({email: email});

        // if user invalid
        if(!user){
            return res.status(403).json({
                success: false,
                message: "user not found"
            });
        }

        // then hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // password updateto user
        await User.findOneAndUpdate({email: email}, {password: hashedPassword}, {new: true});

        return res.status(200).json({
            success: true,
            message: "successfully password updated"
        });

    }catch(error){

        console.log("error while forgote password update", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong when forgote password"
        });

    }
}