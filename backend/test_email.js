import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS 
  }
});

async function main() {
  console.log('Testing with:', process.env.EMAIL_USER);
  const mailOptions = {
    from: `"Casa Tuti" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER, // Send to self
    subject: `Prueba de correo`,
    html: `<p>Esta es una prueba de envío de correo.</p>`
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Success!', info.messageId);
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
