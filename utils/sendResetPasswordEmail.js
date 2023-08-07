const sendEmail = require("./sendEmail");

const sendResetPasswordEmail = async ({ name, token, email, origin }) => {
	const resetLink = `<a href="${origin}/user/reset-password?token=${token}&email=${email}">Reset Password</a>`;
	const message = `<p>Please follow the following link to reset password: ${resetLink}</p>`;
	await sendEmail({
		to: email,
		subject: "Password Reset",
		html: `<h4>Hello ${name}</h4> ${message}`,
	});
};

module.exports = sendResetPasswordEmail;
