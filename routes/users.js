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


            // if (role != customer || role != admin) {
            //     return res.status(401).json({ "Error": "please specify correct role" });
            // };
            if (role == "customer") {

                const saltRounds = 10;
                const salt = await bcrypt.genSalt(saltRounds);
                password = await bcrypt.hash(password, salt);
                const userData = {
                    email, password, firstName, role
                };

                const newUser = new Customer(userData);

                await newUser.save();

                const payload = {
                    user: {
                        id: newUser._id,
                        role: newUser.role,
                        email: newUser.email
                    },
                }
                const key = config.secret_key;

                const accessToken = await jwt.sign(payload, key, { expiresIn: 6000 });
                console.log(accessToken)




                res.status(200).json({ "Success": "New user is saved as Customer, please veify yourself with email verification" });
                let transporter = nodemailer.createTransport({
                    service : 'gmail',
                    host: "smtp.gmail.com",
                    port: 465,
                    secure: true,
                   
                    auth: {
                        user: config.EMAIL_USERNAME,
                        pass: config.EMAIL_PASSWORD,
                    }
                });
                
                let some = "pahalsonu@gmail.com"
                transporter.sendMail({
                    from: '"pahal" <pahalsonu10@gmail.com>', // sender address
                    to: `pahalsonu@gmail.com, ${some}`, // list of receivers
                    subject: `Hello Sonu! Nodamailer Test`, // Subject line
                    html: `
                    <p> Thank you for Signing up with us! Here is the Link to verify your email id href=localhost:5000/users/verify/${accessToken}
                    </p>
                  `,
                }).then((info) => {
                    console.log("Message sent: %s", info.messageId);
                    res.redirect('/');
                }
                ).catch((err) => {
                    console.error(err)
                })
            }
            if (role == "admin") {

                const saltRounds = 10;
                const salt = await bcrypt.genSalt(saltRounds);
                password = await bcrypt.hash(password, salt);
                const userData = {
                    email, password, firstName, role
                };

                const newUser = new Admin(userData);

                await newUser.save();

                const payload = {
                    user: {
                        id: newUser._id,
                        role: newUser.role,
                        email: newUser.email
                    },
                }
                const key = config.secret_key;

                const accessToken = await jwt.sign(payload, key, { expiresIn: 6000 });
                console.log(accessToken)




                res.status(200).json({ "Success": "New user is saved as Customer, please veify yourself with email verification" });
                let transporter = nodemailer.createTransport({

                    host: "pahalsonu@gmail.com",
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
                    from: '"pahal" <pahalsonu10@gmail.com>', // sender address
                    to: `pahalsonu@gmail.com, ${some}`, // list of receivers
                    subject: `Hello Sonu! Nodamailer Test`, // Subject line
                    html: `
                    <p> Thank you for Signing up with us! Here is the Link to verify your email id href=localhost:5000/users/verify/${accessToken}
                    </p>
                  `,
                }).then((info) => {
                    console.log("Message sent: %s", info.messageId);
                    res.redirect('/');
                }
                ).catch((err) => {
                    console.error(err)
                })
            }




        } catch (err) {
            res.status(500).json({ "Error": "Server Error" });

        }
    });

router.all('/verify/:accessToken', async (req, res) => {

    try {
        console.log(req.params.accessToken)

        let accessTokenPayload = jwt.decode(req.params.accessToken)

        let email = accessTokenPayload.user.email
        const customer = await Customer.findOneAndUpdate(
            { email },
            { $set: { verified: true } }
        );
        if (customer) {
            res.send(`<h1>Email Verification is Successfull for user account as customer</h1>`)
        }

        const admin = await Admin.findOneAndUpdate(
            { email },
            { $set: { verified: true } }
        );
        if (admin) {
            res.send(`<h1>  Email Verification is Successfull for user account as admin</h1>`)
        }
        if (!admin || !customer) {
            res.send(`<h1>  Invalid Token</h1>`)
        }

    } catch (err) {
        res.status(500).json({ "Error": "Server Error in email verification" });
    }
})

module.exports = router;