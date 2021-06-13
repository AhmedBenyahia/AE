const nodemailer = require("nodemailer");

module.exports = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: "855542ec1615f6",
        pass: "91145887b3d4be"
    },
    secure: false, // true for 465, false for other ports

});
