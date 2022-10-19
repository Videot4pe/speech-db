import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

interface AudioPlayerProps {
  src?: string;
  onTimeUpdate?: (currentTime?: number) => any;
  onDurationChange?: (duration?: number) => any;
}

const AudioPlayer = forwardRef(({ src, onTimeUpdate, onDurationChange }: AudioPlayerProps, ref) => {
  const audioRef = useRef<HTMLAudioElement>(null)

  function setTime(value: number) {
    if (audioRef.current === null) return
    if (value > audioRef.current.duration) {
      audioRef.current.currentTime = audioRef.current.duration
    } else if (value < 0) {
      audioRef.current.currentTime = 0
    } else {
      audioRef.current.currentTime = value
    }
  }

  useImperativeHandle(ref, () => ({
    isPaused: () => audioRef.current?.paused,
    play: () => audioRef.current?.play(),
    pause: () => audioRef.current?.pause(),
    setTime,
  }))

  useEffect(() => {
    if (audioRef.current === null) return
    audioRef.current.addEventListener('ontimeupdate', () => {
      if (onTimeUpdate) onTimeUpdate(audioRef.current?.currentTime)
    });
    audioRef.current.addEventListener('ondurationchange', () => {
      if (onDurationChange) onDurationChange(audioRef.current?.duration)
    })
  }, [])

  return (
    <audio ref={audioRef} src={src} />
  );
});

export default AudioPlayer;