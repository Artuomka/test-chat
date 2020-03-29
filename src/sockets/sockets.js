const cookieParser = require("cookie-parser");
const passport     = require("passport");

const MessageModel = require("../models/messages_model");

const connectionsList = [];
function auth(socket, next) {

  cookieParser()(socket.request, socket.request.res, () => {});

  passport.authenticate(
      "jwt",
      { session: false },
      (error, decryptToken, jwtError) => {
        if (!error && !jwtError && decryptToken) {
          next(false, { username: decryptToken.username, id: decryptToken.id });
        } else {
          next("guest");
        }
      }
  )(socket.request, socket.request.res);
}

module.exports = io => {
  io.on("connection", function(socket) {
    auth(socket, (guest, user) => {
      if (!guest) {
        socket.join("all");
        socket.username = user.username;
        connectionsList.push(socket);
        socket.emit(
            "connected",
            `you are connected to chat as ${user.username}`
        );
      }
    });

    socket.on("msg", content => {
      if (!socket.username) {
        return;
      }
      console.log (content.user_to);
      const obj = {
        date: new Date(),
        content: content.messageContent,
        username: socket.username,
        user_to: content.user_to,
      };

      MessageModel.create(obj, err => {
        if (err) {
          return console.error("MessageModel", err);
        }
        socket.emit("message", obj);
        socket.to("all").emit("message", obj);
      });
    });

    socket.on("receiveHistory", () => {
      if (!socket.username) {
        return;
      }

      MessageModel.find({user_to: socket.username})
          .sort({ date: -1 })
          .limit(50)
          .sort({ date: 1 })
          .lean()
          .exec((err, messages) => {
            if (!err) {
              socket.emit("history", messages);
            }
          });
    });

    socket.on('disconnect', (data) => {
      connectionsList.splice(connectionsList.indexOf(socket), 1);
      console.log('Disconnected: %s sockets connected', connectionsList.length);
    });

    socket.on("receiveUsersList", ()=>{
      if (!socket.username) {
        return;
      }
      const data = [];
      for (let i = 0; i < connectionsList.length; i++) {
        data[i] = {
          id: connectionsList[i].id,
          username: connectionsList[i].username
        }
      }
      socket.emit("usersList", data);
    });

  });
};
