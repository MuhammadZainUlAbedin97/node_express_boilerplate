const sendEmail = require("./sendEmail");

const sendVerificationEmail = async ({
	name,
	verificationToken,
	email,
	origin,
}) => {
	const link = `<a href="${origin}/user/verify-email?token=${verificationToken}&email=${email}" target="_blank">Verify Email</a>`;
	const message = `<p>Please follow this link to verify your email: ${link}</p>`;
	return await sendEmail({
		to: email,
		subject: `Email Verification`,
		html: `<h4>Hello ${name}</h4>
    ${message}`,
	});
};

module.exports = sendVerificationEmail;
