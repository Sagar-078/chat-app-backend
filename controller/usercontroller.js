const User = require("../models/userModel");
const Chat = require("../models/chatappmodule");
const { uploadImageToCloudinary } = require("../utils/imageUploaderToCloudinary");


// for get user by seach in
exports.getallusers = async (req, res) => {
    
    try{

        // search basis of name or email if dosn't
        const keyword = req.query.search ? {
            
            // neme: {$regex: req.query.search, $options: "i"}

            // user can search a user by name or email 
            $or: [
                // $regex use for pattern metching on string in mongo db 
                {neme: {$regex: req.query.search, $options: "i"}}, // i use for case insensitive
                {email: {$regex: req.query.search, $options: "i"}},
            ]
        }: {};

        if(!keyword){
            return;
        }
   

        // find all users by this keyword, without this loggedin user or who want to fetch 
        const users = await User.find(keyword).find({_id: {$ne: req.user.id}});


        res.status(200).json({
            success: true,
            message: "successfully fetched all users by search",
            users
        });

    }catch(error){
        console.log("error while search user =>>", error);
        res.status(500).json({
            success: false,
            message: "error while searching user "
        })

    }

};



// update additional details

// exports.updateAdditionalDetails = async(req, res) => {
//     try{

//         const {gender="", dateOfBirth="", contactNumber="", content=""} = req.body;

//         const userId = req.user.id

//         console.log("user id is =>", userId);

//         // find user details 
//         const userDetails = await User.findById(userId);
//         console.log("user details =>>", userDetails.additionalDetails);

//         const additionalDetailsOfUser = await AdditionalDetails
//                                         .findById(userDetails.additionalDetails);

//         // update additional details and save
        
//         additionalDetailsOfUser.gender = gender,
//         additionalDetailsOfUser.dateOfBirth = dateOfBirth,
//         additionalDetailsOfUser.contactNumber = contactNumber,
//         additionalDetailsOfUser.content = content
        
//         await additionalDetailsOfUser.save();

//         // update tto user addtional details
//         const updateUserDetails = await User.findById(userId)
//                                         .populate("additionalDetails")
//                                         .exec()


//         res.status(200).json({
//             success: true,
//             message: "successfully update addtional details",
//             updateUserDetails
//         });

//     }catch(error){
//         console.log("err while update additional details =>> ", error);
//         res.status(500).json({
//             success: false,
//             message: "error while update addtional details"
//         });

//     }
// }


// delete account

exports.deleteAccount = async(req, res) => {
    try{

        const userId = req.user.id
        console.log("user id =>>", userId);

        const userDetails = await User.findById(userId);
        console.log("user =>>", userDetails);

        if(!userDetails){
            return res.status(403).json({
                success: false,
                message: "user not found"
            })
        }

        const chatDetails = await Chat.find({users: {$elemMatch: {$eq: req.user.id }}}, {new: true})
        console.log("chat details is =>>", chatDetails._id);

        // remove user from chats
        await Chat.findByIdAndDelete(chatDetails);

        //delete addtional details
        //await AdditionalDetails.findByIdAndDelete({_id: userDetails.additionalDetails})

        // delete user 
        const userUpdate = await User.findByIdAndDelete({_id: userId});

        return res.status(200).json({
            success: true,
            message: "Account deleted successfully",
            userUpdate
        })


    }catch(error){

        console.log("error while delete account", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong try again latter"
        });

    }
}


// update profile

exports.updateProfile = async(req, res) => {
    try{

        const profile = req.files.profile;
        console.log("profile is =>>", profile);

        const userId = req.user.id;
        console.log("user id =>>>", userId);

        const image = await uploadImageToCloudinary(
            profile,
            process.env.FOLDER_NAME,
            1000,
            1000
        );
        console.log("image is =>>", image);

        const updatedProfile = await User.findByIdAndUpdate(
            {_id: userId},
            {profile: image.secure_url},
            {new: true}
        );
        console.log("updated profile =>>", updatedProfile);

        res.status(200).json({
            success: true,
            message: "Image uploaded successfully",
            updatedProfile
        })

    }catch(error){

        console.log("error while update profile picture =>>", error);
        res.status(500).json({
            success: false,
            message: "Please Select a valid image",
        })

    }
}


// get all details of a user
exports.getAllUserDetails = async(req, res) => {
    try{

        const {userId} = req.body                                                                                                                                                                                                                               ;
        console.log("user id at getallUserDetails =>>", userId);
        const userDetails = await User.findById(userId).exec()
        console.log("user details at getall details =>>", userDetails);

        res.status(200).json({
            success: true,
            message: "successfully fetched user details",
            userDetails
        });

    }catch(error){
        console.log("error while fetch all user details =>>", error);
        res.status(500).json({
            success: false,
            message: "error while fetch all user details"
        });

    }
}

exports.getUserByToken = async(req, res) => {
    try{

        const {token} = req.body

        console.log("token is =>>", token);

        const userDetails = await User.findOne(token).exec();
        console.log("user details =>>", userDetails);

        res.status(200).json({
            success: true,
            message: "successfully fetched user by token",
            userDetails
        });

    }catch(error){
        console.log("error while fetch all user details =>>", error);
        res.status(500).json({
            success: false,
            message: "error while fetch all user details"
        }); 
    }
}


// exports.getAllOfUsersArr = async(req, res) => {
//     try{

//         const response = await User.find({}, {name:true, email:true, profile: true}).find({_id: {$ne: req.user.id}});

//         console.log("all users arr =>", response);
//         //console.log("response of arr of users =>>>", response);

//         res.status(200).json({
//             success: true,
//             message: "successfully get all users",
//             response
//         });

//     }catch(error){

//         console.log("error at get all of user arr =>", error);
//         res.status(400).json({
//             success: false,
//             message: "can't get all users"
//         });

//     }
// }