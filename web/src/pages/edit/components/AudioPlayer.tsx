import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

interface AudioPlayerProps {
  src?: string;
  onTimeUpdate?: (currentTime: number | null) => any;
  onDurationChange?: (duration: number | null) => any;
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
    if (onTimeUpdate) {
      audioRef.current.ontimeupdate = () => 
        onTimeUpdate(audioRef.current?.currentTime ?? null)
    }
    if (onDurationChange) {
      audioRef.current.ondurationchange = () => 
        onDurationChange(audioRef.current?.duration ?? null)
    }
  }, [])

  return (
    <audio ref={audioRef} src={src} />
  );
});

export default AudioPlayer;