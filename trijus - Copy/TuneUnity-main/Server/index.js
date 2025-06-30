const express = require('express');
const http = require('http');
const socketio = require("socket.io");
const cors = require('cors');
const { addUsers, removeUser, getUser, getUsersInRoom } = require('./entity');
const mongoose = require('mongoose');
const User = require('./models/User');
const Session = require('./models/Session');
const Message = require('./models/Message');

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

// Store room video states
const roomVideoStates = new Map();

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tuneunity';
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

io.on('connect', (socket) => {
    console.log("User connected!");
    
    socket.on('join', ({ name, room }, callback) => {
        const { user, error } = addUsers(socket.id, name, room);
        if (error) {
            callback(error);
            return;
        }
        console.log(user);
        socket.join(user.room);
        socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name} has joined` });
        io.to(user.room).emit('userList', getUsersInRoom(user.room));
        
        // Send current video state to new user
        const videoState = roomVideoStates.get(user.room);
        if (videoState) {
            socket.emit('videoStateSync', videoState);
        }
    });

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);
        if (user) {
            io.to(user.room).emit('message', { user: user.name, text: message });
        } else {
            callback("User not found");
        }
        io.to(user.room).emit('userList', getUsersInRoom(user.room));
    });

    // YouTube video sync events
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
            socket.broadcast.to(user.room).emit('playVideo', { currentTime });
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
            socket.broadcast.to(user.room).emit('pauseVideo', { currentTime });
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
            socket.broadcast.to(user.room).emit('seekVideo', { currentTime });
        }
    });

    socket.on('requestSync', () => {
        const user = getUser(socket.id);
        if (user) {
            const videoState = roomVideoStates.get(user.room);
            if (videoState) {
                // Calculate current time based on timestamp if video is playing
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
            
            // Clean up room video state if no users left
            const remainingUsers = getUsersInRoom(user.room);
            if (remainingUsers.length === 0) {
                roomVideoStates.delete(user.room);
            }
        }
    });
});

// User login/registration endpoint
app.post('/api/user/login', async (req, res) => {
  try {
    const { googleId, name, email, picture } = req.body;
    if (!googleId || !email || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const user = await User.findOneAndUpdate(
      { googleId, email },
      { $set: { name, picture } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new session
app.post('/api/session/create', async (req, res) => {
  try {
    const { sessionId, createdBy } = req.body;
    if (!sessionId || !createdBy) return res.status(400).json({ error: 'Missing fields' });
    const session = new Session({ sessionId, createdBy, participants: [createdBy] });
    await session.save();
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Join a session
app.post('/api/session/join', async (req, res) => {
  try {
    const { sessionId, userId } = req.body;
    if (!sessionId || !userId) return res.status(400).json({ error: 'Missing fields' });
    const session = await Session.findOneAndUpdate(
      { sessionId },
      { $addToSet: { participants: userId } },
      { new: true }
    );
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get session info
app.get('/api/session/:id', async (req, res) => {
  try {
    const session = await Session.findOne({ sessionId: req.params.id }).populate('participants');
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Send a message
app.post('/api/message/send', async (req, res) => {
  try {
    const { sessionId, sender, content } = req.body;
    if (!sessionId || !sender || !content) return res.status(400).json({ error: 'Missing fields' });
    const message = new Message({ sessionId, sender, content });
    await message.save();
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all messages for a session
app.get('/api/message/:sessionId', async (req, res) => {
  try {
    const messages = await Message.find({ sessionId: req.params.sessionId }).populate('sender', 'name picture');
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

server.listen(199, () => {
    console.log("server is running in the port http://localhost:199");
});