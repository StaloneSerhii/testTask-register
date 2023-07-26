const sgMail = require("@sendgrid/mail");
require("dotenv").config();

const { SENDGRID_KEY } = process.env;
sgMail.setApiKey(SENDGRID_KEY);

const sendEmail = async (data) => {
  const email = { ...data, from: "olga.fly4405@gmail.com" };
  console.log(email);
  await sgMail.send(email);
  return true;
};

module.exports = sendEmail;
