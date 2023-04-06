// import bcryptjs for hashing passwords
const bcryptjs = require("bcryptjs")

// import jsonwebtoken 
const jwt = require("jsonwebtoken")

// import express-async-handler
const expressAsyncHandler = require("express-async-handler")

// import sequelize
const sequelize = require("../database/db.config")

// import nodemailer
const nodemailer = require("nodemailer")

// configure dotenv
require('dotenv').config;



// Create a new user
const registerSpecialUser = expressAsyncHandler(async(request,response)=>{
    let{specialUsers_id,first_name,last_name,email_id,password} = request.body;
    // let [check] = await sequelize.query("SELECT emp_id FROM employees WHERE emp_id=(SELECT specialUsers_id FROM special_users WHERE email_id=?)",{
    //     replacements:[email_id]
    // })
    let [check] = await sequelize.query("SELECT emp_id FROM employees WHERE emp_id=?",{
        replacements:[specialUsers_id]
    })
    if(check[0]==undefined)
    {
        response.send({Message:"Unidentified Employee! Employee does not exist."})
    }
    else{
        let [row] = await sequelize.query("SELECT * FROM special_users WHERE email_id=?",{
            replacements:[email_id]
        })
        if(row[0]!==undefined)
        {
            response.status(422).send({Message:"Email already exists. Please try with another Email Id"})
        }
        else{
            let hashedPassword = await bcryptjs.hash(password,10)
            password = hashedPassword
            await sequelize.query("INSERT INTO special_users SET specialUsers_id=?, first_name=?, last_name=?, email_id=?,password=?",{
                replacements:[specialUsers_id,first_name,last_name,email_id,password]
            })
            response.status(201).send({Message:"New Special User Created"})
        }
    }
});


// login user
const LoginSpecialUser = expressAsyncHandler(async(request,response)=>{
    let{email_id,password} = request.body;
    let [row] = await sequelize.query("SELECT * FROM special_users WHERE email_id=?",{
        replacements:[email_id]
    });
    // Check if username exists/valid
    if(row.length===0){
        response.status(400).send({Message:"Invalid Email ID"})
    }
    // if username exists
    else{
        // comparing plain text password with hash password
        let result = await bcryptjs.compare(password,row[0].password)
        // result results boolean value either true or false
        if(!result){
            // if result is false i.e plain password is not equal to hash password
            response.status(400).send({Message:"Invalid Password"})
        }
        // if password is equal to hash password i.e valid
        else{
            let [specialUsersDetails] = await sequelize.query("SELECT * FROM special_users WHERE email_id=?",{
                 replacements:[email_id]
            })  
            let result = specialUsersDetails[0]     
            // creating and encoding a jwt token based on the user data with secret key which will expire in given time
            let signedToken = jwt.sign({email_id:email_id,user_role:result.user_role},process.env.SECRET_KEY,{expiresIn:'1d'})
            // Deleting the password
            delete row[0].password
            // Sending a response with a text message along with token and user data
            response.status(200).send({Message:"Login Successful",token:signedToken,user:row[0]})
            console.log(request.headers)
        }
    }
});

// to store otps and verify
let otps = {};
const transporter = nodemailer.createTransport({
    service: process.env.SERVICE,
    auth: {
      user: process.env.USER,
      pass: process.env.PASSWORD
    }
});

// forgot password
const forgotPassword = expressAsyncHandler(async (request, response) => {
    // generate random number with 6 digits as otp
    let otp = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
    otps[request.body.email_id] = otp
    let mailOptions = {
      from: "aryan.subscription17@gmail.com",
      to: request.body.email_id,
      subject: "OTP to reset password for Project Pulse",
      text:`Enter the OTP ${otp} to reset your password`
    };
    transporter.sendMail(mailOptions,(error, info)=>{
        if(error){console.log("Error", error)}
        else{console.log("Email is sent", info.messageId)}
    });
    response.send({Message: `Otp is sent to ${request.body.email_id}`});
  });

// reset password  
const resetPassword = expressAsyncHandler(async (request, response) => {
    if (request.body.otp == otps[request.params.email]){
      let hashedPassword = await bcryptjs.hash(request.body.password, 10);
      await sequelize.query("UPDATE special_users SET password=? WHERE email_id=?",{
        replacements:[hashedPassword,request.params.email]
      })
      response.send({Message: "Password has been Reset"});
    }
    else {
      response.send({Message: "Invalid OTP"});
    }
  });

  
let send = {
    registerSpecialUser,
    LoginSpecialUser,
    forgotPassword,
    resetPassword
}


// Exporting 
module.exports=send



