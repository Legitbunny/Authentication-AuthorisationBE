const jwt = require('jsonwebtoken');

require('dotenv').config()

//authentication middle ware
exports.auth = (req, res, next) => {
    try{
        //extract JWT token
        //PENDING: other ways to fetch token
        const token = req.body.token //|| req.cookies.token   -- we can use this to extract token from cookie
        if(!token){
            return res.status(401).json({
                success: false,
                message: 'Token Not Found'
            })
        }

        //verify the token
        try{
            const payload = jwt.verify(token, process.env.JWT_SECRET)
            console.log(payload);

            //store decoded token in req as we have to again verify the role of the user, role is available in payload 
            req.user = payload;
        }catch(e){
            return res.status(401).json({
                success: false,
                message: 'Token is invalid'
            })
        }

        next();
    }catch(err){
        return res.status(401).json({
            success: false,
            message: 'Something went wrong, while verifying the token'
        })
    }
}


//isStudent middleware
exports.isStudent = (req,res, next) => {
    try{
        if(req.user.role !== "student"){
            return res.status(401).json({
                success: false,
                message: 'You are not a student and this is protected route for students'
            })
        }
        next();
    }catch(err){
        return res.status(500).json({
            success: false,
            message: 'User role is not matching'
        })
    }
}


//isAdmin middleware
exports.isAdmin = (req, res, next) => {
    try{
        if(req.user.role !== "admin"){
            return res.status(401).json({
                success: false,
                message: 'You are not a admin and this is protected route for admin'
            })
        }
        next();
    }catch(err){
        return res.status(500).json({
            success: false,
            message: 'User role is not matching'
        })
    }
}