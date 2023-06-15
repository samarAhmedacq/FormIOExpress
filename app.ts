const express = require("express");
const app = express();
const connectDb = require("./connectDB");
import userRoutes from "./routes/users";
import formRoutes from "./routes/forms";
import requestRoutes from "./routes/requests";
app.use(connectDb);
app.use(express.json());
app.use("/users", userRoutes);
app.use("/form", formRoutes);
app.use("/requests", requestRoutes);

module.exports = app;
