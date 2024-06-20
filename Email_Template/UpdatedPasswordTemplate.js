exports.UpdatedPasswordTemplate = (email, name) => {
    return `<!DOCTYPE html>
    <html>

    <head>
        <meta chrset="UTF_8">
        <title>Password Update Confirmation</title>
        <style>
            body{
                background-color: #ffffff;
                font-family: Arial, sans-serif;
                fondt-size: 16px;
                line-height: 1.4;
                color: #333333;
                margin: 0;
                padding: 0;
            }

            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                text-align: center;
            }

            .Logo {
				color: #ffffff;
				font-size: 18px;
				font-weight: bold;
				padding: 20px;
			}

            .message{
                font-size: 16px;
                margin-top: 20px;
            }

            .body{
                font-size: 16px;
                margin-bottom: 20px;
            }

            .support{
                font-size: 14px;
                color: #999999;
                margin-top: 20px;
            }

            .highlight{
                font-weight: bold;
            }

        </style>
    </head>
    
    <body>
    
        <div class="container">
            <a href="http://localhost:3000/"">
                <div class="Logo">
                    cHaT-aPp
                </div>
            </a>

            <div class="message">Password Update Confirmation</div> 
            <div>
                <p>Hay ${name},</p>
                <p>Your Password has been updated for the email <span class="highlight">${email}</span></p>
                <p>If you did not request this password change, please contact us immediately to secure  your account.</p>
            </div>

            <div class="support">If you have any questions or need further assistance, please feel free to reach out to us
                at
                <a href="mailto:sagarbehera7846@gmail.com">sagarbehera7846@gmail.com</a>. We are here to help!
            </div>

        </div>

    </body>
    </html>`;
};