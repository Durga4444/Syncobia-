import React, { useEffect, useRef } from 'react';

const Video = ({ videos, onPlayerReady, onPlayerStateChange, chatSong }) => {
  const playerRef = useRef(null);
  const playerContainerRef = useRef(null);
  const isAPILoadedRef = useRef(false);
  const currentVideo = videos?.[videos.length - 1];
  const videoId = currentVideo?.id?.videoId || null;

  useEffect(() => {
    if (!videoId) return;

    const initializePlayer = () => {
      console.log('Creating new YouTube player for video:', videoId);
      
      // Clean up existing player if any
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try {
          playerRef.current.destroy();
          playerRef.current = null;
        } catch (error) {
          console.log('Error destroying existing player:', error);
        }
      }

      // Create new player instance
      try {
        const newPlayer = new window.YT.Player('player', {
          height: '100%',
          width: '100%',
          videoId: videoId,
          playerVars: {
            autoplay: 0,
            controls: 1,
            rel: 0,
            modestbranding: 1,
            enablejsapi: 1,
            origin: window.location.origin,
          },
          events: {
            onReady: (event) => {
              console.log('Video component: Player ready for video', videoId);
              playerRef.current = event.target;
              onPlayerReady(event);
            },
            onStateChange: onPlayerStateChange,
          },
        });
      } catch (error) {
        console.error('Error creating YouTube player:', error);
      }
    };

    const loadYouTubeAPI = () => {
      if (isAPILoadedRef.current) {
        initializePlayer();
        return;
      }

      // Check if API is already loaded
      if (window.YT && window.YT.Player) {
        isAPILoadedRef.current = true;
        initializePlayer();
        return;
      }

      // Check if script is already being loaded
      if (document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        // Script exists, wait for it to load
        const checkAPI = setInterval(() => {
          if (window.YT && window.YT.Player) {
            clearInterval(checkAPI);
            isAPILoadedRef.current = true;
            initializePlayer();
          }
        }, 100);
        
        // Timeout after 10 seconds
        setTimeout(() => {
          clearInterval(checkAPI);
          if (!isAPILoadedRef.current) {
            console.error('YouTube API failed to load');
          }
        }, 10000);
        return;
      }

      // Load YouTube API script
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true;
      tag.defer = true;
      
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        console.log('YouTube API loaded, initializing player');
        isAPILoadedRef.current = true;
        initializePlayer();
      };
    };

    loadYouTubeAPI();

    // Cleanup function
    return () => {
      console.log('Video component cleanup for:', videoId);
      // Don't destroy player here to avoid interrupting playback
    };
  }, [videoId, chatSong]);

  // Cleanup on component unmount only
  useEffect(() => {
    return () => {
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try {
          console.log('Destroying player on component unmount');
          playerRef.current.destroy();
          playerRef.current = null;
        } catch (error) {
          console.log('Error destroying player on unmount:', error);
        }
      }
    };
  }, []);

  if (!videoId) {
    return (
      <div className="w-full h-full bg-gray-800 flex items-center justify-center">
        <p className="text-gray-400">No video available</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full" ref={playerContainerRef}>
      <div id="player" className="w-full h-full"></div>
    </div>
  );
};

export default Video;