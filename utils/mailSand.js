const nodemailer = require("nodemailer")


const mailsender = async(email, titile, body) => {

    try{

        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        })

        let info = await transporter.sendMail({
            from: 'Chat-App',
            to: `${email}`,
            subject: `${titile}`,
            html: `${body}`
        });

        console.log("information of mailsender", info);

        return info;


    }catch(error){

        console.log(error.message);

    }

}

module.exports = mailsender;