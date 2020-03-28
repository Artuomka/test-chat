const express      = require("express");
const app          = express();
const server       = require("http").Server(app);
const io           = require("socket.io")(server, { serveClient: true });
const mongoose     = require("mongoose");
const cookieParser = require("cookie-parser");
const passport     = require("passport");
const { Strategy } = require("passport-jwt");
const nunjucks     = require("nunjucks");
const config       = require("../src/config/config");
const { jwt }      = require("../src/config/config");

global.Promise = require("bluebird");

const PORT = process.env.PORT || 8080;

app.use(express.urlencoded({ extended: false }));

app.use(express.json());

app.use(cookieParser());

passport.use(
    new Strategy(jwt, function (jwt_payload, done) {
      if (jwt_payload != void 0) {
        return done(false, jwt_payload);
      }
      done();
    })
);

nunjucks.configure("../public/views/html", {
  autoescape: true,
  express: app
});

mongoose.connect(config.mongo.url, config.mongo.options);
mongoose.set("debug", process.env.NODE_ENV !== "production");
mongoose.connection.on("error", e => {
  console.error("MongoDB connection error", e);
  process.exit(0);
});

require("../src/routes/router")(app);

require("../src/sockets/sockets")(io);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
