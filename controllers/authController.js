const User = require("../models/User");
const Token = require("../models/Token");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const {
	sendVerificationEmail,
	attachCookiesToResponse,
	createTokenUser,
	sendResetPasswordEmail,
	createHash,
} = require("../utils");
const crypto = require("crypto");

const register = async (req, res) => {
	const { email, name, password } = req.body;

	const emailAlreadyExists = await User.findOne({ email });
	if (emailAlreadyExists) {
		throw new CustomError.BadRequestError("Email already exists");
	}

	// first registered user is an admin
	const isFirstAccount = (await User.countDocuments({})) === 0;
	const role = isFirstAccount ? "admin" : "user";

	const verificationToken = crypto.randomBytes(40).toString("hex");

	const user = {
		name,
		email,
		password,
		role,
		verificationToken,
	};

	const origin = "http://localhost:3000";
	await sendVerificationEmail({
		name: user.name,
		verificationToken: user.verificationToken,
		email: user.email,
		origin,
	});

	await User.create(user);

	// send verification token back only while testing in postman!!!
	res.status(StatusCodes.CREATED).json({
		msg: "Success! Please check your email to verify account",
		verificationToken: user.verificationToken,
	});
};
const login = async (req, res) => {
	const { email, password } = req.body;

	if (!email || !password) {
		throw new CustomError.BadRequestError("Please provide email and password");
	}
	const user = await User.findOne({ email });

	if (!user) {
		throw new CustomError.UnauthorizedError("Invalid Credentials");
	}
	const isPasswordCorrect = await user.comparePassword(password);
	if (!isPasswordCorrect) {
		throw new CustomError.UnauthorizedError("Invalid Credentials");
	}
	if (!user.isVerified) {
		throw new CustomError.UnauthorizedError(
			"Please verify the email first...."
		);
	}
	const tokenUser = createTokenUser(user);
	// create refresh token
	let refreshToken = "";
	// check for existing token

	const existingToken = await Token.findOne({ user: user._id });

	if (existingToken) {
		const { isValid } = existingToken;
		if (!isValid) {
			throw new CustomError.UnauthorizedError("Invalid Credentials....");
		}
		refreshToken = existingToken.refreshToken;
		attachCookiesToResponse({ res, user: tokenUser, refreshToken });
		res.status(StatusCodes.OK).json({ user: tokenUser });
		return;
	}

	refreshToken = crypto.randomBytes(40).toString("hex");
	const userAgent = req.headers["user-agent"];
	const ip = req.ip;
	const userToken = { refreshToken, ip, userAgent, user: user._id };

	await Token.create(userToken);

	attachCookiesToResponse({ res, user: tokenUser, refreshToken });

	res.status(StatusCodes.OK).json({ user: tokenUser });
};
const logout = async (req, res) => {
	await Token.findOneAndDelete({ user: req.user.userId });

	res.cookie("accessToken", "logout", {
		httpOnly: true,
		expires: new Date(Date.now()),
	});
	res.cookie("refreshToken", "logout", {
		httpOnly: true,
		expires: new Date(Date.now()),
	});
	res.status(StatusCodes.OK).json({ msg: "user logged out!" });
};

const verifyEmail = async (req, res) => {
	const { verificationToken, email } = req.body;
	if (!verificationToken || !email) {
		throw new CustomError.BadRequestError(
			"please provide verification Token and email...."
		);
	}
	const user = await User.findOne({ email });
	if (!user) {
		throw new CustomError.NotFoundError(
			`No user found with email: ${email}....`
		);
	}
	//verifying the token...
	if (verificationToken !== user.verificationToken) {
		throw new CustomError.UnauthorizedError("Error verifying token....");
	}

	user.isVerified = true;
	user.verified = Date.now();
	user.verificationToken = "";

	user.save();

	res.status(StatusCodes.OK).json({ msg: "Email verified...." });
};

const forgotPassword = async (req, res) => {
	const { email } = req.body;
	if (!email) {
		throw new CustomError.BadRequestError("Please provide email....");
	}

	const user = await User.findOne({ email });

	if (user) {
		const tenMin = 1000 * 60 * 10;
		const passwordToken = crypto.randomBytes(40).toString("hex");
		const passwordTokenExpirationDate = new Date(Date.now() + tenMin);

		user.passwordToken = createHash(passwordToken);
		user.passwordTokenExpirationDate = passwordTokenExpirationDate;

		await user.save();
		const origin = "http://localhost:3000";
		await sendResetPasswordEmail({
			name: user.name,
			token: passwordToken,
			email: user.email,
			origin: origin,
		});
	}

	res
		.status(StatusCodes.OK)
		.json({ msg: "Please check your email for reset password link...." });
};

const resetPassword = async (req, res) => {
	const { token, email, password } = req.body;
	if (!password) {
		throw new CustomError.BadRequestError("please enter a password....");
	}
	if (!token || !email) {
		throw new CustomError.BadRequestError(
			"please follow the link provided in email to reset password..."
		);
	}
	const user = await User.findOne({ email });

	if (user) {
		const currentDate = new Date();

		if (
			user.passwordToken === createHash(token) &&
			user.passwordTokenExpirationDate > currentDate
		) {
			user.password = password;
			user.passwordToken = null;
			user.passwordTokenExpirationDate = null;
			await user.save();
		}
	}

	res.status(StatusCodes.OK).json({ msg: "Password reset correctly...." });
};

module.exports = {
	register,
	login,
	logout,
	verifyEmail,
	forgotPassword,
	resetPassword,
};
