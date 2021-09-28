const nodemailer = require('nodemailer')
const path = require('path')
const fs = require('fs')
const ejs = require('ejs')

// Si falla sin ningún mensaje, es posible que sea por el port y host. Es bueno enviar el transporter a la consola.
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
})

transporter.verify(function (error) {
    if (error) {
      console.log(error);
      console.log('Nodemailer is not verify');
    } else {
      console.log("Nodemailer is ready to take the messages");
    }
});


const sendMessage = async (subject, to, emailURL, filename) => {
    const htmlTemplate = await ejs.renderFile(path.join(__dirname, `../views/emails/${filename}.ejs`), {url: emailURL})

    console.log(process.env.NODE_ENV === 'production' ? to : 'lesthoward@gmail.com');
    const message = await transporter.sendMail({
        from: 'Meeti <no-replay@lesthoward.com>',
        to: process.env.NODE_ENV === 'production' ? to : 'lesthoward@gmail.com' ,
        subject,
        text: 'Este es un correo de confirmación, si no ves el mensaje intente cambiando tu servicio de correo para visualizar o contacte con soporte',
        html: htmlTemplate
    })
}


module.exports = sendMessage
