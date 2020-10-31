const express = require('express');

const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const randomString = require('randomString')
const nodemailer = require("nodemailer");
const config = require('../config/index.json');
//import models for customer and admin
const Customer = require('../customer_schema');

const Admin = require('../admin_schema');

router.post('/register', [
    body('firstName', "First Name is Required").notEmpty(),
    body('role', "User Role is required").isString(),
    body('email', "Enter Valid Email").isEmail(),
    body('password', "Enter Password").isLength({ min: 6 })
],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        try {
            let { email, role, password, firstName } = req.body;

            const customerEmail = await Customer.findOne({ email });

            const adminEmail = await Admin.findOne({ email });


            if (customerEmail) {
                res.status(401).json({ "Error": "This user is already existed as customer " })
            };
            if (adminEmail) {
                res.status(401).json({ "Error": "This user is already existed as admin " })
            };
          
            let userasadmin = "admin"
            // if (role != customer || role != admin) {
            //     return res.status(401).json({ "Error": "please specify correct role" });
            // };
            if (role == "customer") {
                
                const saltRounds = 10;
                const salt = await bcrypt.genSalt(saltRounds);
                password = await bcrypt.hash(password, salt);
                const emailtoken = randomString.generate();
                const userData = {
                    email, password, firstName,  role,emailtoken
                };
                const newUser = new Customer(userData);

                const key = config.secret_key;
                const payload = {
                    user: {
                      id: newUser._id,
                      role : newUser.role,
                      email : newUser.email
                    },
                }
                const accessToken = await jwt.sign(payload, key, { expiresIn: 6000 });
                
                
                await newUser.save();
    
                res.status(200).json({ "Success" : "New user is saved as Customer, please veify yourself with email verification" });
                let transporter = nodemailer.createTransport({

                    host: "mail.pahalsonu.com",
                    port: 465,
                    secure: true,
                    auth: {
                      user: config.EMAIL_USERNAME,
                      pass: config.EMAIL_PASSWORD,
                    }
                  });
                               console.log("mail") 
                               let some = "pahalsonu@gmail.com"   
                  transporter.sendMail({
                    from: '"pahal" <pahal@pahalsonu.com>', // sender address
                    to: `pahalsonu@gmail.com, ${some}`, // list of receivers
                    subject: `Hello ${some}! Nodamailer Test`, // Subject line
                    html: `
                    <p> Thank you for Signing up with us! Here is the Link to verify your email id href=localhost:5000/users/verify/${emailtoken}
                    </p>
                  `,
                  }).then((info) => {
                    console.log("Message sent: %s", info.messageId);
                    res.redirect('/');
                  })
            }




        } catch (err) {
            res.status(500).json({ "Error": "Server Error" });

        }
    });

    router.all('/verify/:EncryptedaccessToken', async (req, res) => {
        try {
          // console.log()
            console.log(req.params.EncryptedaccessToken)

          await Users.findOneAndUpdate(
            { $set: { verified: true } }
          );
          res.send(`<h1> User Email Verification is Successfull</h1>`)
      
        } catch (err) {
          res.status(500).json({ "Error": "Server Error in email verification" });
        }
      })

module.exports = router;