// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const express = require("express");
const auth = require("basic-auth");

const admin = { name: "cenexxx", password: "cenexxx2120" };

var session = require("express-session"),
  bodyParser = require("body-parser");

const { ExpressPeerServer } = require("peer");

const app = express();
//const server = app.listen(9000);

// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html

app.use(express.static("dist"));
app.use(bodyParser.urlencoded({ extended: false }));

//app.use(passport.session());

// app.all("*", checkSecure);

// function checkSecure(req, res, next) {
//   const routes = ["/operadora"];
//   if (routes.includes(req.path)) {
//     next();
//   } else {
//     next();
//   }
// }

// https://expressjs.com/en/starter/basic-routing.html

// app.use(function (req, res, next) {
//   var credentials = auth(req);
//   if (req.url === "/operadora") {
//     if (
//       !credentials ||
//       credentials.name !== "cenex" ||
//       credentials.pass !== "cenex"
//     ) {
//       res.status(401);
//       res.header("WWW-Authenticate", 'Basic realm="example"');
//       res.send("Acceso rechazado");
//     } else {
//       next();
//     }
//   } else if (req.url === "/") {
//     console.log("Base URL request");
//   }
// });

function authOperator(req, res, next) {
  if (req.path === "/operadora") {
    console.log(req.path);
    var credentials = auth(req);
    if (
      !credentials ||
      credentials.name !== "cenexxx" ||
      credentials.pass !== "cenexxx2120"
    ) {
      console.log("auth", credentials);
      res.status(401);
      res.header("WWW-Authenticate", 'Basic realm="Cenex"');
      res.send("Acceso rechazado");
    } else {
      next();
    }
  } else {
    console.log(req.path);
    if (req.path === "/") {
      return next();
    }
    //return next();
  }
}

app.all("*", authOperator);

app.get("/", (request, response) => {
  response.locals.url = request.originalUrl;
  response.sendFile(__dirname + "/dist/html/index.html");
});

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
