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
    url: "mongodb://127.0.0.1:27017/",
    options: {
      dbName: "my_db",
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  }
};
