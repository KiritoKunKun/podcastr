import Image from 'next/image';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { useEffect, useRef, useState } from 'react';
import { usePlayer } from '../../contexts/PlayerContext';
import { convertDurationToTimeString } from '../../utils/Utils';
import styles from './styles.module.scss';

export const Player = () => {
  const {
    episodeList,
    currentEpisodeIndex,
    isPlaying,
    togglePlay,
    setPlayingState,
    playPrevious,
    playNext,
    hasPrevious,
    hasNext,
    isLooping,
    toggleLoop,
    isShuffling,
    toggleShuffle,
    clearPlayerState,
  } = usePlayer();

  const audioRef = useRef<HTMLAudioElement>(null);

  const [progress, setProggress] = useState(0);

  const setupProgressListener = () => {
    audioRef.current.currentTime = 0;

    audioRef.current.addEventListener('timeupdate', () =>
      setProggress(Math.floor(audioRef.current.currentTime))
    );
  };

  const handleChangeSlider = (amount: number) => {
    audioRef.current.currentTime = amount;
    setProggress(amount);
  };

  const handleEpisodeEnded = () => {
    if (hasNext) {
      playNext();
    } else {
      clearPlayerState();
      setProggress(0);
    }
  };

  useEffect(() => {
    if (!audioRef.current) {
      return;
    }

    if (isPlaying) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  const episode = episodeList[currentEpisodeIndex];

  return (
    <div className={styles.container}>
      <header>
        <img src='/playing.svg' alt='Tocando agora' />
        <strong>Tocando agora</strong>
      </header>

      {episode ? (
        <div className={styles.currentEpisode}>
          <Image
            width={592}
            height={592}
            src={episode.thumbnail}
            objectFit='cover'
          />
          <strong>{episode.title}</strong>
          <span>{episode.members}</span>
        </div>
      ) : (
        <div className={styles.emptyPlayer}>
          <strong>Selecione um podcast para ouvir</strong>
        </div>
      )}

      <footer className={!episode ? styles.empty : ''}>
        <div className={styles.progress}>
          <span>{convertDurationToTimeString(progress)}</span>
          <div className={styles.slider}>
            {episode ? (
              <Slider
                max={episode.duration}
                value={progress}
                onChange={handleChangeSlider}
                trackStyle={{ backgroundColor: '#04d361' }}
                railStyle={{ backgroundColor: '#9f75ff' }}
                handleStyle={{ borderColor: '#04d361', borderWidth: 4 }}
              />
            ) : (
              <div className={styles.emptySlider} />
            )}
          </div>
          <span>{convertDurationToTimeString(episode?.duration || 0)}</span>
        </div>

        {episode && (
          <audio
            ref={audioRef}
            src={episode.url}
            autoPlay
            loop={isLooping}
            onPlay={() => setPlayingState(true)}
            onPause={() => setPlayingState(false)}
            onLoadedMetadata={setupProgressListener}
            onEnded={handleEpisodeEnded}
          />
        )}

        <div className={styles.buttons}>
          <button
            type='button'
            onClick={toggleShuffle}
            className={isShuffling ? styles.isActive : ''}
            disabled={!episode || episodeList.length === 1}
          >
            <img src='/shuffle.svg' alt='Embaralhar' />
          </button>
          <button
            type='button'
            onClick={playPrevious}
            disabled={!episode || !hasPrevious}
          >
            <img src='/play-previous.svg' alt='Tocar anterior' />
          </button>
          <button
            type='button'
            className={styles.playButton}
            disabled={!episode}
            onClick={togglePlay}
          >
            {isPlaying ? (
              <img src='/pause.svg' alt='Tocar' />
            ) : (
              <img src='/play.svg' alt='Tocar' />
            )}
          </button>
          <button
            type='button'
            onClick={playNext}
            disabled={!episode || !hasNext}
          >
            <img src='/play-next.svg' alt='Tocar próxima' />
          </button>
          <button
            type='button'
            onClick={toggleLoop}
            className={isLooping ? styles.isActive : ''}
            disabled={!episode}
          >
            <img src='/repeat.svg' alt='Repetir' />
          </button>
        </div>
      </footer>
    </div>
  );
};
