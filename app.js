require("dotenv").config();
require("express-async-errors");

// import express
const express = require("express");
const app = express();

// import rest of the packages
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

// security packages
const rateLimiter = require("express-rate-limit");
const helmet = require("helmet");
const xss = require("xss-clean");
const cors = require("cors");
const mongoSanitize = require("express-mongo-sanitize");

// import database
const connectDB = require("./db/connect");

// import routes
const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");

// import middleware
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

// middleware for json
app.use(express.json());
// middleware for cookies
app.use(cookieParser(process.env.COOKIE_SECRET));
// middleware for morgan
app.use(morgan("tiny"));

// routes
app.use("/hello", (req, res) => {
	res.send("Hello World");
});
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);

// error handling middlewares
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;
const start = async () => {
	try {
		await connectDB(process.env.MONGO_URL);
		app.listen(port, () =>
			console.log(`Server is listening on port ${port}...`)
		);
	} catch (error) {
		console.log(error);
	}
};

start();
