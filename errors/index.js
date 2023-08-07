const CustomAPIError = require("./custom-api");
const ForbiddenError = require("./forbidden");
const NotFoundError = require("./not-found");
const BadRequestError = require("./bad-request");
const UnauthorizedError = require("./unauthorized");
module.exports = {
	CustomAPIError,
	ForbiddenError,
	NotFoundError,
	BadRequestError,
	UnauthorizedError,
};
