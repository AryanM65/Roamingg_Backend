// auth , isStudent , isAdmin
const jwt = require('jsonwebtoken');
require("dotenv").config();
exports.auth = (req, res, next) => {
    try{
        console.log("reaching")
        console.log("cookie", req.cookies);
        console.log(req.body);
        const token = req.cookies.token;

        if(!token){
            return res.status(401).json({
                success: false, 
                message: "Token missing"
            })
        }

        //verify the token 
        try{
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            //printing the payload 
            console.log("decode", decode);

            req.user = decode
        }catch(error){
            res.status(401).json({
                success: false,
                message: "Token is invalid",
            });
        }
        next();
    }
    catch(error){
        console.log("error", error);
        return res.status(401).json({
            success: false, 
            message: "Something went wrong while verifying this token"
        })
    }
}

//these two check authorization
exports.isCustomer = (req, res, next) => {
    try{
        if(req.user.role != 'Customer'){
            res.status(401).json({
                success: false, 
                message: "This is a protected route for customers",
            })
        }
        next();
    }
    catch(error){
        return res.status(500).json({
            success: false, 
            message: "User Role is not matching",
        })
    }
}


exports.isAdmin = (req, res, next) => {
    try{
        console.log("req.user", req.user);
        if(req.user.role != 'Admin'){
            return res.status(401).json({
                success: false, 
                message: "This is a protected route for admins",
            })
        }
        console.log("reaching here")
        next();
    }
    catch(error){
        return res.status(500).json({
            success: false, 
            message: "User Role is not matching",
        })
    }
}


