// import nodemailer from 'nodemailer';
// const transporter = nodemailer.createTransport({
//   host: 'smtp-relay.brevo.com',
//   port: 587,
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS
//   }
// });

// export default transporter;
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com", // Brevo SMTP host
  port: 587, // TLS Port
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER, // your Brevo login (usually email)
    pass: process.env.SMTP_PASS, // your Brevo SMTP key
  }
});

export default transporter;
