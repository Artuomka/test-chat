function response(data) {
  let resp = data.responseText;
  try {
    if (data.message != void 0) {
      resp = data.message;
    } else {
      resp = JSON.parse(data.responseText);
      resp = resp.message;
    }
  } catch (e) {
  }
  return resp;
}

$(".logout-btn").on("click", e => {
  e.preventDefault();
  $.ajax({
    url: "/logout",
    type: "POST",
    data: {},
    success: res => {
      alert(response(res));
      location.reload();
    },
    error: res => {
      alert(response(res));
    }
  });
});

$(document).ready(() => {
  let connectedUsers = [];
  let socket         = io.connect("/");
  socket.on("connected", function (msg) {
    socket.emit("receiveHistory");
  });

  $("#newMessageBtn").on("click", e => {
    socket.emit("receiveUsersList")
  });

  socket.on("usersList", (usersList) => {
    for (let user of usersList) {
      addUser(user);
    }
  });

  socket.on('disconnect', (data) => {
    connectedUsers.splice(connectedUsers.indexOf(socket), 1);
  });

  socket.on("message", addMessage);

  socket.on("history", messages => {
    for (let message of messages) {
      addMessage(message);
    }
  });

  $(".modal-body button").on("click", e => {
    const select      = document.getElementById("usersSelect");
    const username_to = select.value;
    e.preventDefault();
    clearUsersList();
    let selector       = $("textarea[name='message']");
    let messageContent = selector.val().trim();
    if (messageContent !== "") {
      const messageData = {
        user_to: username_to,
        messageContent: messageContent
      };
      socket.emit("msg", messageData);
      selector.val("");
    }

  });

  function encodeHTML(str) {
    return $("<div />")
        .text(str)
        .html();
  }

  function addMessage(message) {
    message.date     = new Date(message.date).toLocaleString();
    message.username = encodeHTML(message.username);
    message.content  = encodeHTML(message.content);

    let html = `
            <li>
                <div class="message-data">
                    <span class="message-data-name">${message.username}</span>
                    <span class="message-data-time">${message.date}</span>
                </div>
                <div class="message my-message" dir="auto">${message.content}</div>
            </li>`;

    $(html)
        .hide()
        .appendTo(".chat-history ul")
        .slideDown(200);

    $(".chat-history").animate(
        { scrollTop: $(".chat-history")[0].scrollHeight },
        1000
    );
  }

  function addUser(user) {

    const { username }    = user;
    const encodedUsername = encodeHTML(username);
    let html              =
              `
                <option>
                    ${encodedUsername}
                </option>
           `;

    $(html)
        .appendTo(".modal-body select")
  }

  function clearUsersList() {
    $(".l1").empty();
  }
});
