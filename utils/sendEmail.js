// name: Cheyenne Bailey
// username: cheyenne.bailey39@ethereal.email
// password: hTTj1dSxn38eFYEKyK

const nodemailer = require("nodemailer");
const nodemailerConfig = require("./nodemailerConfig");

const sendEmail = async ({ to, subject, html }) => {
	let testAccount = await nodemailer.createTestAccount();

	const transporter = nodemailer.createTransport(nodemailerConfig);

	return await transporter.sendMail({
		from: '"Fred Foo 👻" <foo@example.com>', // sender address
		to,
		subject,
		html,
	});
};

module.exports = sendEmail;
