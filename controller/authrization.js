const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const otpGenerator = require("otp-generator");
const OTP = require("../models/OTP");
const mailsender = require("../utils/mailSand");
const { UpdatedPasswordTemplate } = require("../Email_Template/UpdatedPasswordTemplate");


// for sent otp
exports.sendOTP = async (req, res) => {
    try{

        const {email} = req.body;
        // console.log("email", email);

        // check is user alrady register on the basis of email
        const registeredUser = await User.findOne({email:email});
        // console.log("registeruser", registeredUser);



        if(registeredUser){
            return res.status(401).json({
                success: false,
                message: "user alrady register"
            })
        }


        // generate otp
        const otp = otpGenerator.generate(4, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        })

        console.log("generated otp: ", otp);

        // create entry in db for otp
        await OTP.create({'email':email, 'otp':otp})

        return res.status(200).json({
            success: true,
            message: 'Otp Sent Successfully',
            otp
        })

    }catch(err){

        console.log(err);
        return res.status(400).json({
            success: false,
            message: 'Something went Wrong'
        })

    }
}


// creating a controller for signup 
exports.signUp = async(req, res) => {
    try{
        const {name, email, password, confirmPassword, otp} = req.body; 
        // console.log(name, email, password, confirmPassword, otp);

        if(!name || !email || !password || !confirmPassword || !otp){
            return res.status(403).json({
                success: false,
                message: "Please fill all details"
            })
        }


        if(password !== confirmPassword){
            return res.status(401).json({
                success: false,
                message: "password doesn't metch"
            })
        }


        // check is this user alrady exist on basis of email
        const existingUser = await User.findOne({email: email});

        if(existingUser){
            return res.status(400).json({
                success: false,
                message: "User alrady exist"
            });
        };

        // else user doesn't exist in db
        // find the most recent otp stored in db for this user
        
        const recentOtp = await OTP.find({email: email}).sort({createdAt:-1}).limit(1);

        // console.log("recent otp is =??", recentOtp);

        // check is otp valid or not
        if(recentOtp.length == 0 || Date.now()>recentOtp[0].createdAt+5*60*1000){
            return res.status(400).json({
                success: false,
                message: "Otp expired"
            })
        }else if(otp != recentOtp[0].otp){
            return res.status(400).json({
                success: false,
                message: "Invalid otp"
            })
        }

        // then hashing the password useing bcrypt libray

        const hashPassword = await bcrypt.hash(password, 10);

        // const additionalDetailOfUser = await AdditionalDetails.create({
        //     gender: null,
        //     dateOfBirth: null,
        //     contactNumber: null,
        //     content: null
        // });

        //console.log("additional details ", additionalDetailOfUser);

        // thhen create entry of user in db or store in db
        const user = await User.create({
            name, 
            email, 
            password: hashPassword,
            //additionalDetails: additionalDetailOfUser._id,
            profile: `https://api.dicebear.com/5.x/initials/svg?seed=${name}`
        });

        return res.status(200).json({
            success: true,
            message: "User registered Successfully",
            user
        });

    }catch(err){
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "User can't signup Please try again latter"
        });
    }
};


// creating a function for login
exports.login = async(req, res) => {
    try{
        const {email, password} = req.body;

        // validation of mail, password is empty or filled
        if(!email || !password){
            return res.status(400).json({
                success: false,
                message: "Please fill all details"
            });
        }

        // if all detail are fill then check user is exist or not on the basis of email
        const user = await User.findOne({email});
        // console.log(user);

        // if user not exist then 
        if(!user){
            return res.status(401).json({
                success: false,
                message: "User not registered please signup first"
            });
        }

        // if user exist, then verify password and create jwt token
        // using of bcrypt compare function
        if(await bcrypt.compare(password, user.password)){

            const payload = {
                email: user.email,
                id: user._id,
                // name: user.name
            }

            // console.log("payload", payload);

            // in case of password metch then create a token
            const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: "60d"});

            // console.log("token at create=>>", token);

            //user = user.toObject();
            //console.log("user is =->>>>>>>>", user);
            user.token = token;
            //console.log("user after token =>>>", user);
            //console.log("user token =>>", user.token);
            user.password = undefined;
            //console.log("useer password", user.password);
            
            // create cookie
            const options = {
                httpOnly: true,
                expires:new Date(Date.now()+3*24*60*60*1000)
            }

            //console.log("options =>>", options);

            console.log(" created token =>>", token);
            res.cookie("token", token, options).status(200).json({
                success: true,
                token:token,
                user: user,
                message: "Logged in successfully",
                
            })

            console.log("user after token pass in cookie", user);
            //console.log("cookie", cookieresponse);
            
        }else{
            // if password doesn't metch 
            return res.status(401).json({
                success: false,
                message: "Password is incorrect"
            });
        }

    }catch(err){
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Can't signup plase try latter"
        });
    }
}

//for change password

exports.changePassword = async(req, res) => {

    try{

        // console.log("this is user",req.user);
        const user = await User.findById(req.user.id);

        const {oldPassword, newPassword} = req.body;

        if(!oldPassword || !newPassword){
            return res.status(403).json({
                success: false,
                message: "Please fill all details"
            });
        }

        // is old pass is correct
        const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password);

        if(!isPasswordCorrect){
            return res.status(500).json({
                success: false,
                message: "Old Password is incorrect"
            });
        }

        // else if it is correct then hash the new pass
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // then update to user 
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            {password: hashedPassword},
            {new: true}
        );

        // then want to send a mail for updated

        try{

            const response = await mailsender(
                updatedUser.email,
                "Alert mail for Password updated",
                UpdatedPasswordTemplate(
                    updatedUser.email,
                    `Password updated successfully for ${updatedUser.name}`
                )
            );

        }catch(error){

            console.log("error while send email =>>", error);
            return res.status(500).json({
                success: false,
                message: "Can't send mail somthing went Wrong",
                error: error.message
            })

        }

        return res.status(200).json({
            success: true,
            message: "Password updated successfully"
        })

    }catch(error){

        console.log("error while change password", error);
        return res.status(400).json({
            success: false,
            message: "Something went Wrong plase try latter"
        })

    }

}