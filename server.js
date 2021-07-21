// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const express = require("express");

var passport = require("passport"),
  LocalStrategy = require("passport-local").Strategy;

var session = require("express-session"),
  bodyParser = require("body-parser");

const { ExpressPeerServer } = require("peer");

passport.use(
  new LocalStrategy(function (username, password, done) {
    username.findOne({ username: username }, function (err, user) {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, { message: "Usuario incorrecto." });
      }
      if (!user.validPassword(password)) {
        return done(null, false, { message: "Password incorrecto." });
      }

      return done(null, user);
    });
  })
);

const app = express();
//const server = app.listen(9000);

// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
app.use(express.static("dist"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({ secret: "cenexxxx" }));
app.use(passport.initialize());
//app.use(passport.session());

// https://expressjs.com/en/starter/basic-routing.html

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/operadora",
    failureRedirect: "/login",
  })
);

app.get("/", (request, response) => {
  response.locals.url = request.originalUrl;
  response.sendFile(__dirname + "/dist/html/index.html");
});

app.get("/login", (request, response) => {
  response.sendFile(__dirname + "/dist/html/login.html");
});

app.post(
  "/operadora",
  passport.authenticate("local", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/operadora");
  }
);

app.get("/operadora", (request, response) => {
  response.locals.url = request.originalUrl;
  response.sendFile(__dirname + "/dist/html/operadora.html");
});

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
//app.use("/expresspeerserver", peerServer);
//app.listen(9000);
