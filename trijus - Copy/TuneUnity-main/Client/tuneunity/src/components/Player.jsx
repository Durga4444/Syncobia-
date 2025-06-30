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
import { useLocation, useNavigate } from 'react-router-dom';

let socket;
let dummy;

const Player = () => {
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

  // YouTube Player sync states
  const [isPlaying, setIsPlaying] = useState(false);
  const [ytPlayer, setYtPlayer] = useState(null);
  const [ignorePlayerEvents, setIgnorePlayerEvents] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  const [chats, setChats] = useState(() => {
    const disconnected = localStorage.getItem('disconnectedFlag') === 'true';
    return disconnected ? JSON.parse(localStorage.getItem('disconnectedMessages') || '[]') : [];
  });

  const messageRef = useRef(null);
  const videoRef = useRef(null);
  const playerRef = useRef(null);

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

  // YouTube Player API functions
  const onPlayerReady = (event) => {
    setYtPlayer(event.target);
    setIsPlayerReady(true);
    playerRef.current = event.target;
    setDuration(event.target.getDuration());
    console.log('YouTube Player ready');
  };

  const onPlayerStateChange = (event) => {
    if (ignorePlayerEvents) return;
    
    const currentTime = event.target.getCurrentTime();
    
    switch(event.data) {
      case window.YT.PlayerState.PLAYING:
        setIsPlaying(true);
        socket.emit('playVideo', { currentTime });
        break;
      case window.YT.PlayerState.PAUSED:
        setIsPlaying(false);
        socket.emit('pauseVideo', { currentTime });
        break;
      case window.YT.PlayerState.ENDED:
        setIsPlaying(false);
        break;
    }
  };

  // Load YouTube Player API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      
      window.onYouTubeIframeAPIReady = () => {
        console.log('YouTube API loaded');
      };
    }
  }, []);

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

    // Existing socket listeners
    socket.on('message', (msg) => {
      setChats((prevMessages) => [...prevMessages, msg]);
    });

    socket.on('userList', (users) => {
      setConnectedUsers(users.length);
    });

    // YouTube sync socket listeners
    socket.on('loadVideo', ({ videoId, startTime }) => {
      if (isPlayerReady && ytPlayer) {
        setIgnorePlayerEvents(true);
        ytPlayer.loadVideoById(videoId, startTime || 0);
        setTimeout(() => setIgnorePlayerEvents(false), 1000);
        toast.success('New video loaded by another user', { icon: '🎵' });
      }
    });

    socket.on('playVideo', ({ currentTime }) => {
      if (isPlayerReady && ytPlayer) {
        setIgnorePlayerEvents(true);
        ytPlayer.seekTo(currentTime, true);
        ytPlayer.playVideo();
        setIsPlaying(true);
        setTimeout(() => setIgnorePlayerEvents(false), 1000);
      }
    });

    socket.on('pauseVideo', ({ currentTime }) => {
      if (isPlayerReady && ytPlayer) {
        setIgnorePlayerEvents(true);
        ytPlayer.seekTo(currentTime, true);
        ytPlayer.pauseVideo();
        setIsPlaying(false);
        setTimeout(() => setIgnorePlayerEvents(false), 1000);
      }
    });

    socket.on('seekVideo', ({ currentTime }) => {
      if (isPlayerReady && ytPlayer) {
        setIgnorePlayerEvents(true);
        ytPlayer.seekTo(currentTime, true);
        setTimeout(() => setIgnorePlayerEvents(false), 1000);
      }
    });

    socket.on('videoStateSync', (videoState) => {
      if (isPlayerReady && ytPlayer && videoState.videoId) {
        setIgnorePlayerEvents(true);
        ytPlayer.loadVideoById(videoState.videoId, videoState.currentTime || 0);
        
        setTimeout(() => {
          if (videoState.isPlaying) {
            ytPlayer.playVideo();
            setIsPlaying(true);
          } else {
            ytPlayer.pauseVideo();
            setIsPlaying(false);
          }
          setIgnorePlayerEvents(false);
        }, 1500);
      }
    });

    return () => {
      socket.disconnect();
      socket.off();
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

      const API_KEYS = ["AIzaSyAbsQ8y3ULltqDW9NaVKkEiSv2S4w-NfR0"]
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
      
      // Emit video load to sync with other users
      const videoId = fetchedVideos[0]?.id?.videoId;
      if (videoId) {
        socket.emit('loadVideo', { videoId, startTime: 0 });
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || "Failed to search video");
      console.error("Error fetching data from YouTube API:", err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    const messageText = message || (messageRef.current ? messageRef.current.value : '');
    if (!messageText?.trim()) return;
    // Persist message to backend
    try {
      const res = await fetch('http://localhost:199/api/message/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: propValue, sender: userData._id, content: messageText }),
      });
      if (res.ok) {
        const savedMsg = await res.json();
        setChats(prev => [...prev, {
          user: userData.name,
          text: savedMsg.content,
          time: new Date(savedMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          senderId: userData._id,
          isMe: true,
          picture: userData.picture,
        }]);
        socket.emit('sendMessage', messageText, () => {});
      }
    } catch (err) {
      // fallback: local only
      setChats(prev => [...prev, {
        user: userData.name,
        text: messageText,
        time: getFormattedTime(),
        senderId: userData._id,
        isMe: true,
        picture: userData.picture,
      }]);
      socket.emit('sendMessage', messageText, () => {});
    }
    if (messageRef.current) {
      messageRef.current.value = '';
    }
    setMessage('');
  };

  // Manual sync functions
  const handlePlayPause = () => {
    if (isPlayerReady && ytPlayer) {
      const currentTime = ytPlayer.getCurrentTime();
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
    socket.emit('requestSync');
    toast.success('Requesting sync...', { icon: '🔄' });
  };

  const handleSeek = (e) => {
    if (ytPlayer && duration > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      const newTime = percent * duration;
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

  useEffect(() => {
    const timeInterval = setInterval(() => {
      if (ytPlayer && ytPlayer.getCurrentTime) {
        setCurrentTime(ytPlayer.getCurrentTime());
        if (ytPlayer.getDuration) {
          setDuration(ytPlayer.getDuration());
        }
      }
    }, 100);

    return () => clearInterval(timeInterval);
  }, [ytPlayer]);

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
                      <iframe
                        ref={videoRef}
                        src={`https://www.youtube.com/embed/${videos[0]?.id?.videoId}?autoplay=1&controls=1&enablejsapi=1&origin=${window.location.origin}&rel=0&modestbranding=1`}
                        title={videos[0]?.snippet?.title}
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                        className="w-full h-full"
                        onLoad={() => {
                          if (window.YT && window.YT.Player) {
                            if (!ytPlayer) {
                              const player = new window.YT.Player(videoRef.current, {
                                events: {
                                  onReady: onPlayerReady,
                                  onStateChange: onPlayerStateChange
                                }
                              });
                            }
                          }
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-white">
                        {videos[0]?.snippet?.title}
                      </h3>
                      <p className="text-gray-400">{videos[0]?.snippet?.channelTitle}</p>
                    </div>

                    {/* Enhanced Controls */}
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
                  <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {chats.map((msg, idx) =>
                      msg.user === 'admin' ? (
                        <AdminText key={idx} text={msg.text} />
                      ) : msg.isMe ? (
                        <MyText key={idx} text={msg.text} name={msg.user} time={msg.time} picture={msg.picture} />
                      ) : (
                        <Otheruser key={idx} text={msg.text} name={msg.user} time={msg.time} picture={msg.picture} />
                      )
                    )}
                    <div ref={lastMessageRef} />
                  </div>
                )}

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
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Player;