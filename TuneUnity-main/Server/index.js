const express = require('express');
const http = require('http');
const socketio = require("socket.io");
const cors = require('cors');
const { addUsers, removeUser, getUser, getUsersInRoom } = require('./entity');
const app = express();
app.use(cors());
app.use(express.json());
const server = http.createServer(app);

const io = socketio(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true
    }
});

app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  next();
});

const roomVideoStates = new Map();

io.on('connect', (socket) => {
  console.log("User connected!");
  socket.on('join', async ({ name, room }, callback) => {
  const { user, error } = addUsers(socket.id, name, room);
  if (error) {
    callback(error);
    return;
  }
  socket.join(user.room);
  const videoState = roomVideoStates.get(user.room);
  if (videoState) {
    socket.emit('videoStateSync', videoState);
  }
  try {
    const chatHistory = await Message.find({ room: user.room })
      .sort({ timestamp: 1 })
      .limit(50);
    chatHistory.forEach(msg => {
      socket.emit('message', msg);
    });
  } catch (err) {
    console.error("❌ Failed to load chat history:", err);
  }
  socket.broadcast.to(user.room).emit('message', {
    user: 'admin',
    text: `${user.name} has joined`
  });
  io.to(user.room).emit('userList', getUsersInRoom(user.room));
});



socket.on('sendMessage', async (message, callback) => {
  const user = getUser(socket.id);
  if (user) {
    const msg = { user: user.name, text: message, room: user.room };
    io.to(user.room).emit('message', msg);
  } else {
    callback("User not found");
  }
  io.to(user.room).emit('userList', getUsersInRoom(user.room));
});

    socket.on('loadVideo', ({ videoId, startTime = 0 }) => {
        const user = getUser(socket.id);
        if (user) {
            const videoState = {
                videoId,
                currentTime: startTime,
                isPlaying: false,
                timestamp: Date.now()
            };
            roomVideoStates.set(user.room, videoState);
            socket.broadcast.to(user.room).emit('loadVideo', { videoId, startTime });
            io.to(user.room).emit('message', { 
                user: 'admin', 
                text: `${user.name} loaded a new video` 
            });
        }
    });

    socket.on('playVideo', ({ currentTime }) => {
        const user = getUser(socket.id);
        if (user) {
            const videoState = roomVideoStates.get(user.room);
            if (videoState) {
                videoState.isPlaying = true;
                videoState.currentTime = currentTime;
                videoState.timestamp = Date.now();
                roomVideoStates.set(user.room, videoState);
            }
            io.to(user.room).emit('playVideo', { currentTime });
        }
    });

    socket.on('pauseVideo', ({ currentTime }) => {
        const user = getUser(socket.id);
        if (user) {
            const videoState = roomVideoStates.get(user.room);
            if (videoState) {
                videoState.isPlaying = false;
                videoState.currentTime = currentTime;
                videoState.timestamp = Date.now();
                roomVideoStates.set(user.room, videoState);
            }
            io.to(user.room).emit('pauseVideo', { currentTime });
        }
    });

    socket.on('seekVideo', ({ currentTime }) => {
        const user = getUser(socket.id);
        if (user) {
            const videoState = roomVideoStates.get(user.room);
            if (videoState) {
                videoState.currentTime = currentTime;
                videoState.timestamp = Date.now();
                roomVideoStates.set(user.room, videoState);
            }
          io.to(user.room).emit('seekVideo', { currentTime });
        }
    });

    socket.on('requestSync', () => {
        const user = getUser(socket.id);
        if (user) {
            const videoState = roomVideoStates.get(user.room);
            if (videoState) {
                let syncTime = videoState.currentTime;
                if (videoState.isPlaying) {
                    const timeDiff = (Date.now() - videoState.timestamp) / 1000;
                    syncTime += timeDiff;
                }
                socket.emit('videoStateSync', {
                    ...videoState,
                    currentTime: syncTime
                });
            }
        }
    });

    socket.on('disconnect', () => {
        console.log("User disconnected!");
        const user = removeUser(socket.id);
        if (user) {
            io.to(user.room).emit('message', { user: 'admin', text: `${user.name} has left` });
            io.to(user.room).emit('userList', getUsersInRoom(user.room));
            const remainingUsers = getUsersInRoom(user.room);
            if (remainingUsers.length === 0) {
                roomVideoStates.delete(user.room);
            }
        }
    });
});

server.listen(199, () => {
    console.log("server is running in the port http://localhost:199");
});