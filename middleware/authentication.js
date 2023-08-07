const CustomError = require("../errors");
const Token = require("../models/Token");
const { isTokenValid, attachCookiesToResponse } = require("../utils");

const authenticateUser = async (req, res, next) => {
	const { refreshToken, accessToken } = req.signedCookies;

	try {
		if (accessToken) {
			const payload = isTokenValid(accessToken);
			req.user = payload.user;
			return next();
		}
		const payload = isTokenValid(refreshToken);

		const existingToken = await Token.findOne({
			refreshToken: payload.refreshToken,
			user: payload.user.userId,
		});

		if (!existingToken || !existingToken.isValid) {
			throw new CustomError.UnauthorizedError("Authentication Invalid....");
		}
		attachCookiesToResponse({
			res,
			user: payload.user,
			refreshToken: existingToken.refreshToken,
		});
		req.user = payload.user;
		return next();
	} catch (error) {
		throw new CustomError.UnauthorizedError("Authentication Invalid...");
	}
};

const authorizePermissions = (...roles) => {
	return (req, res, next) => {
		if (!roles.includes(req.user.role)) {
			throw new CustomError.ForbiddenError("Unauthorized to access this route");
		}
		next();
	};
};

module.exports = {
	authenticateUser,
	authorizePermissions,
};
