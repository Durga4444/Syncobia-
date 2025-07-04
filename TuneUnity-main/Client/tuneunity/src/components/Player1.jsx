import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { SendHorizontal, Users, Music, MessageCircle, X, Play, Pause, RotateCcw } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import load2 from "../assets/load2.gif";
import io from 'socket.io-client';
import MyText from './MyText';
import Otheruser from "./Otheruser";
import AdminText from "./AdminText";
import React from 'react'
import Video from "./Video"
import { useLocation, useNavigate } from 'react-router-dom';
let socket;
let dummy;
const Player1 = () => {
  function getFormattedTime() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutes} ${ampm}`;
  }

  const location = useLocation();
  const { propValue } = location.state || {};
  const lastMessageRef = useRef(null);
  const data = localStorage.getItem('userdata');
  const userData = JSON.parse(data);
  const [videos, setVideos] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dummyLoading, setDummyLoading] = useState(true);
  const [chatSong, setChatSong] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [connectedUsers, setConnectedUsers] = useState(1);
  const [showChat, setShowChat] = useState(true);
  const [message, setMessage] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [ytPlayer, setYtPlayer] = useState(null);
  const [ignorePlayerEvents, setIgnorePlayerEvents] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [isHost, setIsHost] = useState(false); // Track if user is host
  const [chats, setChats] = useState(() => {
    const disconnected = localStorage.getItem('disconnectedFlag') === 'true';
    return disconnected ? JSON.parse(localStorage.getItem('disconnectedMessages') || '[]') : [];
  });

  const messageRef = useRef(null);
  const syncTimeoutRef = useRef(null);

  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.setItem('disconnectedMessages', JSON.stringify(chats));
      localStorage.setItem('disconnectedFlag', 'true');
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [chats]);

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chats]);

  const backendURL = 'http://localhost:199';

  const onPlayerReady = (event) => {
    console.log('YouTube Player ready');
    setYtPlayer(event.target);
    setIsPlayerReady(true);
    setDuration(event.target.getDuration());
    setTimeout(() => {
      if (socket) {
        socket.emit('requestSync');
      }
    }, 1000);
  };

  const onPlayerStateChange = (event) => {
    console.log('Player state changed:', event.data, 'ignoreEvents:', ignorePlayerEvents);
    const currentTime = event.target.getCurrentTime();
    
    if (!ignorePlayerEvents) {
      switch(event.data) {
        case window.YT.PlayerState.PLAYING:
          console.log('Emitting playVideo event');
          setIsPlaying(true);
          socket.emit('playVideo', { currentTime });
          break;
        case window.YT.PlayerState.PAUSED:
          console.log('Emitting pauseVideo event');
          setIsPlaying(false);
          socket.emit('pauseVideo', { currentTime });
          break;
        case window.YT.PlayerState.ENDED:
          setIsPlaying(false);
          socket.emit('pauseVideo', { currentTime });
          break;
      }
    } else {
      setIsPlaying(event.data === window.YT.PlayerState.PLAYING);
    }
  };

  const handleSocketSync = (eventType, data, callback) => {
    if (!isPlayerReady || !ytPlayer) {
      console.log('Player not ready, skipping sync');
      return;
    }
    console.log(`Handling ${eventType}:`, data);
    setIgnorePlayerEvents(true);
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }
    callback(data);
    syncTimeoutRef.current = setTimeout(() => {
      setIgnorePlayerEvents(false);
      console.log('Re-enabled player events');
    }, 1500);
  };


  useEffect(() => {
    socket = io(backendURL);
    socket.emit('join', { name: userData.name, room: propValue }, (error) => {
      if (error) alert(error);
    });
    const disconnected = localStorage.getItem('disconnectedFlag') === 'true';
    if (disconnected) {
      const oldChats = JSON.parse(localStorage.getItem('disconnectedMessages') || '[]');
      setChats(oldChats);
    }
    localStorage.removeItem('disconnectedFlag');
    localStorage.removeItem('disconnectedMessages');
    setLoading(false);
    setTimeout(() => {
      toast.success(`${userData.name} joined the room`, { duration: 3000, icon: "😉" });
      setDummyLoading(false);
    }, 3000);
    socket.on('message', (msg) => {
      setChats((prevMessages) => [...prevMessages, msg]);
    });
    socket.on('chatHistory', (history) => {
      setChats(history);
    });
    socket.on('userList', (users) => {
      setConnectedUsers(users.length);
      setIsHost(users[0]?.id === socket.id);
    });
    socket.on('loadVideo', ({ videoId, startTime }) => {
      console.log('Received loadVideo event:', { videoId, startTime });
       
      handleSocketSync('loadVideo', { videoId, startTime }, ({ videoId, startTime }) => {
        ytPlayer.loadVideoById(videoId, startTime || 0);
        
        toast.success('New video loaded by another user', { icon: '🎵' });
      });
    });
    socket.on('playVideo', ({ currentTime }) => {
      console.log('Received playVideo event:', { currentTime });
      handleSocketSync('playVideo', { currentTime }, ({ currentTime }) => {
        ytPlayer.seekTo(currentTime, true);
        ytPlayer.playVideo();
        setIsPlaying(true);
      });
    });
    socket.on('pauseVideo', ({ currentTime }) => {
      console.log('Received pauseVideo event:', { currentTime });
      handleSocketSync('pauseVideo', { currentTime }, ({ currentTime }) => {
        ytPlayer.seekTo(currentTime, true);
        ytPlayer.pauseVideo();
        setIsPlaying(false);
      });
    });
    socket.on('seekVideo', ({ currentTime }) => {
      console.log('Received seekVideo event:', { currentTime });
      handleSocketSync('seekVideo', { currentTime }, ({ currentTime }) => {
        ytPlayer.seekTo(currentTime, true);
      });
    });
    socket.on('videoStateSync', (videoState) => {
      console.log('Received videoStateSync:', videoState);
      if (!videoState.videoId) return;
      handleSocketSync('videoStateSync', videoState, (videoState) => {
        ytPlayer.loadVideoById(videoState.videoId, videoState.currentTime || 0);
        setTimeout(() => {
          if (videoState.isPlaying) {
            ytPlayer.playVideo();
            setIsPlaying(true);
          } else {
            ytPlayer.pauseVideo();
            setIsPlaying(false);
          }
        }, 1000);
      });
    });
    return () => {
      socket.disconnect();
      socket.off();
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [isPlayerReady, ytPlayer]);

  const handleSearch = async (e) => {
  if (e) e.preventDefault();
    setLoading(true);
    const searchTerm = chatSong;
    if (!searchTerm) {
      setLoading(false);
      return;
    }
    try {
      setError(null);
      let API_KEYS = ["AIzaSyAhgUULw44lpuNzdxRT-2vZGHpYRSDxIh0"]
      const response = await axios.get(
        `https://www.googleapis.com/youtube/v3/search`,
        {
          params: {
            part: "snippet",
            maxResults: 1,
            q: chatSong,
            type: "video",
            key: API_KEYS[Math.floor(Math.random() * API_KEYS.length)],
          },
        }
      );
      const fetchedVideos = response.data.items;
      if (!fetchedVideos || fetchedVideos.length === 0) {
        throw new Error("No videos found for the given search query.");
      }
      setVideos(fetchedVideos);
      const videoId = fetchedVideos[0]?.id?.videoId;
      if (videoId) {
        console.log('Emitting loadVideo:', { videoId, startTime: 0 });
        socket.emit('loadVideo', { videoId, startTime: 0 });
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || "Failed to search video");
      console.error("Error fetching data from YouTube API:", err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    const messageText = message || (messageRef.current ? messageRef.current.value : '');
    if (!messageText?.trim()) return;
    socket.emit('sendMessage', messageText, () => {});
    if (messageRef.current) {
      messageRef.current.value = '';
    }
    setMessage('');
  };

  const handlePlayPause = () => {
    if (isPlayerReady && ytPlayer) {
      const currentTime = ytPlayer.getCurrentTime();
      console.log('Manual play/pause triggered:', { isPlaying, currentTime });   
      if (isPlaying) {
        ytPlayer.pauseVideo();
        socket.emit('pauseVideo', { currentTime });
      } else {
        ytPlayer.playVideo();
        socket.emit('playVideo', { currentTime });
      }
    }
  };

  const handleSync = () => {
    console.log('Manual sync requested');
    socket.emit('requestSync');
    toast.success('Requesting sync...', { icon: '🔄' });
  };

  const handleSeek = (e) => {
    if (ytPlayer && duration > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      const newTime = percent * duration;
      console.log('Manual seek:', { newTime });
      ytPlayer.seekTo(newTime);
      socket.emit('seekVideo', { currentTime: newTime });
    }
  };

  useEffect(() => {
    if (chats.length > 0 && chats[chats.length - 1].text.charAt(0) === '!') {
      let x = chats[chats.length - 1].text.slice(1);
      if (x === dummy) return;
      setChatSong(x);
      dummy = x;
    }
  }, [chats]);

  useEffect(() => {
    if (chatSong) {
      handleSearch();
    }
  }, [chatSong]);


  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('userdata');
    navigate('/');
  }

  if (dummyLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <img src={load2} alt="Loading" className="w-20 h-20 mx-auto mb-4" />
          <p className="text-white text-xl font-semibold">Loading Music Room...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster />
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
        <div className="bg-black/20 backdrop-blur-md border-b border-white/10 p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Music className="w-8 h-8 text-purple-400" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Syncobia
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-white/10 rounded-full px-4 py-2">
                <Users className="w-5 h-5 text-green-400" />
                <span className="text-sm font-medium">{connectedUsers} online</span>
              </div>
              <div className="text-sm text-gray-300">Room: {propValue}</div>
              {isHost && <div className="text-sm text-yellow-300">Host</div>}
            </div>
            <div>
              <div className="text-sm text-red-300 cursor-pointer" onClick={handleLogout}>Logout</div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-black/30 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                {loading ? (
                  <div className="aspect-video bg-gray-800 rounded-xl flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : videos.length > 0 ? (
                  <div className="space-y-4">
                    <div className="aspect-video rounded-xl overflow-hidden bg-black">
                      <Video 
                        videos={videos}
                        onPlayerReady={onPlayerReady}
                        onPlayerStateChange={onPlayerStateChange}
                        chatSong = {chatSong}
                      />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-white">
                        {videos[0]?.snippet?.title}
                      </h3>
                      <p className="text-gray-400">{videos[0]?.snippet?.channelTitle}</p>
                    </div>
                    <div className="bg-black/40 rounded-xl p-4 space-y-3">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={handlePlayPause}
                          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-full p-3 transition-all duration-200 transform hover:scale-105"
                        >
                          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                        </button>
                        <button
                          onClick={handleSync}
                          className="bg-blue-600 hover:bg-blue-700 rounded-full p-3 transition-all duration-200 transform hover:scale-105"
                          title="Sync with room"
                        >
                          <RotateCcw className="w-5 h-5" />
                        </button>

                        <div className="flex-1 text-sm text-gray-400">
                          {formatTime(currentTime)} / {formatTime(duration)}
                        </div>
                      </div>
                      <div 
                        className="w-full bg-gray-700 rounded-full h-2 cursor-pointer"
                        onClick={handleSeek}
                      >
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video bg-gray-800 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-400">No video selected</p>
                      <p className="text-sm text-gray-500">Type !song name in chat to search</p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="text-center text-red-500 mt-4">
                    <p>{error}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-black/30 backdrop-blur-md rounded-2xl border border-white/10 h-[600px] flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="w-5 h-5 text-purple-400" />
                    <h3 className="font-semibold">Chat</h3>
                  </div>
                  <button 
                    onClick={() => setShowChat(!showChat)}
                    className="p-1 hover:bg-white/10 rounded-full transition-colors"
                  >
                    {showChat ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
                  </button>
                </div>

                {showChat && (
                  <>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {chats.map((item, index) => {
                        if (item.user.toLowerCase() === userData.name.toLowerCase()) {
                          return (
                            <MyText
                              key={index}
                              text={item.text}
                              name={item.user}
                              time={getFormattedTime()}
                              song={item.text.charAt(0) === '!'}
                            />
                          );
                        } else if (item.user.toLowerCase() === 'admin') {
                          return (
                            <AdminText
                              key={index}
                              text={item.text}
                              name={item.user}
                            />
                          );
                        } else {
                          return (
                            <Otheruser
                              key={index}
                              text={item.text}
                              name={item.user}
                              time={getFormattedTime()}
                              song={item.text.charAt(0) === '!'}
                            />
                          );
                        }
                      })}
                      <div ref={lastMessageRef}></div>
                    </div>

                    <div className="p-4 border-t border-white/10">
                      <div className="flex space-x-2">
                        <input
                          ref={messageRef}
                          type="text"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && sendMessage(e)}
                          placeholder="Type a message... (! for songs)"
                          className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400"
                        />
                        <button
                          onClick={sendMessage}
                          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-full p-2 transition-all duration-200 transform hover:scale-105"
                        >
                          <SendHorizontal className="w-5 h-5" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        Tip: Start your message with "!" to search for songs
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Player1;