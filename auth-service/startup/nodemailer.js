const nodemailer = require("nodemailer");

module.exports = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: "c7535e05cadf69",
        pass: "21e3c3dd6d0d65"
    },
    secure: false, // true for 465, false for other ports

});
