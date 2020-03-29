function ExtractJwt(req) {
  let token = null;
  if (req.cookies && req.cookies.token != void 0) {
    token = req.cookies["token"];
  }
  return token;
}

module.exports = {
  jwt: {
    jwtFromRequest: ExtractJwt,
    secretOrKey: "MySuperSercretKey"
  },

  expiresIn: "1 day",

  mongo: {
    url: "mongodb://TestUser:testpassword123@ds251902.mlab.com:51902/heroku_4b0txgj8",
    options: {
      dbName: "heroku_4b0txgj8",
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  }
};
