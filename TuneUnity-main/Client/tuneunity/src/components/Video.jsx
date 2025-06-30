import React, { useEffect, useRef } from 'react';

const Video = ({ videos, onPlayerReady, onPlayerStateChange }) => {
  const playerRef = useRef(null);
  const currentVideo = videos?.[0];
  const videoId = currentVideo?.id?.videoId;

  useEffect(() => {
    if (!videoId) return;
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      
      window.onYouTubeIframeAPIReady = () => {
        createPlayer();
      };
    } else if (window.YT.Player) {
      createPlayer();
    }

    function createPlayer() {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (error) {
          console.log('Error destroying player:', error);
        }
      }
      playerRef.current = new window.YT.Player('youtube-player', {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          controls: 1,
          rel: 0,
          modestbranding: 1,
          enablejsapi: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
        },
      });
    }

    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (error) {
          console.log('Error destroying player on unmount:', error);
        }
      }
    };
  }, [videoId]);

  if (!videoId) {
    return (
      <div className="w-full h-full bg-gray-800 flex items-center justify-center">
        <p className="text-gray-400">No video available</p>
      </div>
    );
  }
  return (
    <div className="w-full h-full">
      <div id="youtube-player" className="w-full h-full"></div>
    </div>
  );
};

export default Video;