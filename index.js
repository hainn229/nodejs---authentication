require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
// const logger = require("morgan");
const passport = require("passport");
const mongoose = require("mongoose");
const keys = require("./config/keys");
const router = require("./src/routers/index");

const PORT = process.env.PORT || 4000;

mongoose.Promise = global.Promise;
mongoose.connect(
  keys.MONGODB_SRV,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  },
  (error) => {
    if (error) {
      console.log(error);
    }
    console.log("Connect to database successfully");
  }
);

app.use(passport.initialize());
app.use(passport.session());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());
app.use(cors());
// app.use(logger());
app.use(router);

app.get("/", (req, res) => {
  return res.send("This is API Server !");
});
app.listen(PORT, () => {
  console.log("Server listening on port " + PORT);
});
