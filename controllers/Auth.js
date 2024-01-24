const bcrypt = require('bcrypt')
const User = require('../Models/UserModel')
const jwt = require('jsonwebtoken')
const { response } = require('express')

require('dotenv').config()

//sign up
exports.signup = async (req, res) => {
    try{
        //get data
        const{ name, email, password,role} = req.body;
        //check if user already exist
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({
                success:false,
                message: 'User already exists'
            })
        }

        //secure pwd
        let hashedPassword
        try{
            hashedPassword = await bcrypt.hash(password, 10)
        }
        catch(e){
            return res.status(500).json({
                success:false,
                message: 'error in hashing password'
            })
        }

        //create user entry
        const user = await User.create({
            name,email,password:hashedPassword, role
        })

        return res.status(200).json({
            success:true,
            message: 'User created successfully'
        })
    }
    catch (err) {
        console.error(err)
        return res.status(500).json({
            success:false,
            message: 'User cannot be registered please try again later'
        })
    }
}


//login handler
exports.login = async (req, res) => {
    try{
        //data fetch
        const {email, password} = req.body
        //validation on emial and pwd
        if(!email || !password){
            return res.status(400).json({
                message: 'Invalid email or password',
                success: false
            })
        }

        //check for registered user
        let user = await User.findOne({email})
        //if user is not registered
        if(!user){
            return res.status(404).json({
                success: false,
                message: 'User not registered'
            })
        }

        const payload = {
            email: user.email,
            id: user._id,
            role: user.role
        }
        //verify the pwd and generate JWt token
        if(await bcrypt.compare(password, user.password)){
            //pwd matched
            let token = jwt.sign(payload,
                process.env.JWT_SECRET,
                {
                    expiresIn: "2h"
                })

            user = user.toObject();
            user.token = token;
            user.password = undefined; 

            
            const options = {
                expiresIn: new Date (Date.now() + 3*24*60*60*1000),
                httpOnly: true ///it will restrict the access of cookie on client side
            }
            //create a cookie
            res.cookie("token", token, options).status(200).json({
                success: true,
                token,
                user,
                message: "logged in successfully"
            })
        }
        else{
            //pwd did not match
            return res.status(404).json({
                success: false,
                message: 'Password did not match'
            })
        }
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({
            success: false,
            message: 'login failed' 
        })
    }
}