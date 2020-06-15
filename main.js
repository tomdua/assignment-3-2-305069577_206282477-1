require("dotenv").config();
const path = require("path");
const DButils = require("./utils/DButils");
const utils = require("./utils/helpingFunc");

//Libearies importing
const express = require("express");
const logger = require("morgan");
const session = require("client-sessions");
//const bodyParser = require("body-parser");//??????

//Routes importing
const search = require("./routes/search");
const userAuth = require("./routes/userAuth");
const profile = require("./routes/profile");
const recipes = require("./routes/recipes");

//#App setting and config
const port = process.env.PORT || "3000";
const app = express();
app.use(logger("dev")); //logger
app.use(express.json()); // parse application/json
app.use(
  session({
    cookieName: "session", // the cookie key name
    secret: process.env.COOKIE_SECRET, // the encryption key
    duration: 24 * 60 * 60 * 1000, // expired after 24 h
    activeDuration: 0, // if expiresIn < activeDuration,
    //the session will be extended by activeDuration milliseconds
  })
);

app.use(express.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded
app.use(express.static(path.join(__dirname, "public"))); //To serve static files such as images, CSS files, and JavaScript files

//app.get("/", (req, res) => res.send("welcome"));

app.use(userAuth);
app.use(search);
app.use("/profile", profile);
app.use("/recipes", recipes);

app.use((req, res) => {
  res.sendStatus(404);
});

//if we want to throw error of the server
app.use(function (err, req, res, next) {
  res.status(err.status || 500).send(err.message);
});

const server = app.listen(port, () => {
  console.log(`Server listen on port ${port}`);
});

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", '*');
  res.header("Access-Control-Allow-Credentials", true);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header("Access-Control-Allow-Headers", 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json');
  next();
});

app.use(cors());

process.on("SIGINT", function () {
  if (server) {
    server.close(() => console.log("server closed"));
  }
  process.exit();
});
