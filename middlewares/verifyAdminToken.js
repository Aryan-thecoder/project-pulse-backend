// import jwt from jsonwebtoken
const jwt = require("jsonwebtoken");

// configure dotenv
require("dotenv").config()

// verify token
const verifyAdminToken=(request,response,next)=>{
    // get the bearer token from the headers
    let bearerToken = request.headers.authorization;
    console.log(bearerToken);
    if(bearerToken==undefined){
        response.status(401).send({Message:"Unauthorized Access"})
    }
    else{
        let token = bearerToken.split(" ")[1]
        try{
            let decoded = jwt.verify(token,process.env.SECRET_KEY);
            if(decoded.user_role=="Admin")
            {
                next();
            }
            else{
                response.send({Message:"You are not authorized"})
            }
        }
        catch{
            response.status(401).send({Message:"Session expired. Please re-login to continue"})
        }
    }
}

// export token
module.exports = verifyAdminToken;