import { Flex, Grid, IconButton, SimpleGrid } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import Edit from "./Edit";
import AudioPlayer from "./components/AudioPlayer";
import { useErrorHandler } from "../../utils/handle-get-error";
import { useParams } from "react-router-dom";

import MarkupsApi from "../../api/markups-api";
import { EntityDto } from "models/markup";
import { useCRUDWebsocket } from "../../hooks/use-crud-websocket";
import Entity from "./components/Entity";

import { timeToString } from "./composables/format-time";
import { ImPause, ImPlay, ImStop } from "react-icons/im";
import { debounce } from "lodash";

interface IEdit {
  zoomIn: () => void;
  zoomOut: () => void;
}

interface IAudioPlayer {
  isPaused: () => boolean;
  play: () => void;
  pause: () => void;
  setTime: (value: number) => void;
  currentTime: () => number;
}

const EditPage = () => {
  useEffect(() => {
    window.addEventListener("resize", onWindowResize);
    onWindowResize();

    return () => {
      window.removeEventListener("resize", onWindowResize);
    };
  });

  const errorHandler = useErrorHandler();
  const params = useParams();

  const editRef = useRef<IEdit>(null);
  const audioPlayerRef = useRef<IAudioPlayer>(null);

  const [editContainerWidth, setEditContainerWidth] = useState<number | undefined>(undefined);
  const [imageURL, setImageURL] = useState<string | undefined>(undefined);
  const [audioURL, setAudioURL] = useState<string | undefined>(undefined);
  const [audioDuration, setAudioDuration] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [beginTime, setBeginTime] = useState(0);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<EntityDto | null>(null);
  const [isAudioPaused, setAudioPaused] = useState(true);

  // TODO FIX THIS PLEASE (Alex)
  // IMHO, I TAK NOT BAD. ENOUGH LACONI4NO (Nick)
  const markupId = +params.id!;

  const updateEntity = (key: string, value: any) => {
    if (!selectedEntity) return;
    setSelectedEntity({ ...selectedEntity, [key]: value });
  };

  const socketUrl = `${import.meta.env.VITE_WS}${
    import.meta.env.VITE_WS_URL
  }/api/ws/markups/${markupId}`;

  const {
    create,
    update,
    remove,
    websocketState: markupData,
  } = useCRUDWebsocket<EntityDto>(socketUrl);

  function play() {
    audioPlayerRef.current?.play();
  }

  function pause() {
    audioPlayerRef.current?.pause();
  }

  function stop() {
    audioPlayerRef.current?.pause();
    audioPlayerRef.current?.setTime(beginTime);
    setCurrentTime(beginTime);
  }

  /** Функции для отслеживания изменения размера окна  */
  function getContainerWidth() {
    const scrollContainer = document.getElementById(
      "scroll-container"
    ) as HTMLDivElement;
    if (!scrollContainer) return;
    return scrollContainer.clientWidth;
  }

  function onWindowResize() {
    setEditContainerWidth(getContainerWidth());
  }
  /** */

  useEffect(() => {
    MarkupsApi.view(markupId)
      .then((payload) => {
        setImageURL(payload.image);
        setAudioURL(payload.record);
      })
      .catch(errorHandler);
  }, []);

  useEffect(() => {
    if (currentTime && beginTime && currentTime <= beginTime) {
      audioPlayerRef.current?.pause();
      audioPlayerRef.current?.setTime(beginTime);
      setCurrentTime(beginTime);
    } else if (currentTime && endTime && currentTime >= endTime) {
      audioPlayerRef.current?.pause();
      audioPlayerRef.current?.setTime(endTime);
      setCurrentTime(endTime);
    }
  }, [currentTime, beginTime, endTime]);

  function getEntityById(id: string | null) {
    const entity = markupData.find((e) => e.id!.toString() === id);
    if (!entity) throw Error("Entity was not found!");
    return entity;
  }

  const onSave = () => {
    update(selectedEntity!);
  };

  return (
    <Flex direction="column">
      <SimpleGrid columns={3}>
        <Flex gridColumnStart={2} justifyContent="center">
          <IconButton
            className="q-mx-xs bg-green-2"
            aria-label="play"
            icon={<ImPlay />}
            color={isAudioPaused ? "current" : "green"}
            background=""
            onClick={play}
          />
          <IconButton
            className="q-mx-xs bg-blue-2"
            aria-label="pause"
            icon={<ImPause />}
            color={isAudioPaused ? "red" : "current"}
            background=""
            onClick={pause}
          />
          <IconButton
            className={"q-mx-xs bg-red-2"}
            aria-label="stop"
            icon={<ImStop />}
            background=""
            onClick={stop}
          />
        </Flex>
        <span
          style={{
            gridColumnStart: 3,
            width: "200px",
            alignSelf: "center",
            textAlign: "center",
            justifySelf: "end"
          }}
        >
          {`${timeToString(currentTime)} - ${timeToString(endTime)}`}
        </span>
      </SimpleGrid>
      {/* <Flex direction={'column'}>
        <div>
          <span>selectedEntity: </span>
          <span color={ selectedEntity ? 'green' : 'black' }>{ `${selectedEntity?.id ?? null}` }</span>
        </div>
        <span>{ `currentTime: ${currentTime}` }</span>
        <span>{ `beginTime: ${beginTime}` }</span>
        <span>{ `endTime: ${endTime}` }</span>
      </Flex> */}

      <Edit
        ref={editRef}
        width={editContainerWidth}
        imageURL={imageURL}
        audioDuration={audioDuration}
        currentTime={currentTime}
        entities={markupData}
        onEntityRemoved={(id: string) => {
          remove(getEntityById(id));
        }}
        onEntityCreated={({ beginTime, endTime }) => {
          create({
            markupId,
            beginTime,
            endTime,
            value: "",
          });
        }}
        onEntityUpdated={({ id, beginTime, endTime }) => {
          update({ ...getEntityById(id), beginTime, endTime });
          setTimeout(() => {
            setSelectedEntity(getEntityById(id));
            setBeginTime(beginTime);
            setEndTime(endTime);
          }, 50);
        }}
        onEntitySelected={(id: string | null, rightClick = false) => {
          if (id === null) {
            setSelectedEntity(null);
            stop();
            setTimeout(() => {
              setBeginTime(0);
              setCurrentTime(0);
              setEndTime(null);
            }, 50);
            return;
          }

          const entity = getEntityById(id);
          if (entity.id === selectedEntity?.id) {
            if (rightClick) return;
            const audioIsPlaying = !audioPlayerRef.current?.isPaused();
            if (endTime && endTime - currentTime < 0.5) {
              setCurrentTime(beginTime);
            }
            setTimeout(() => (audioIsPlaying ? pause() : play()), 50);
          } else {
            setSelectedEntity(entity);
            pause();
            setTimeout(() => {
              setBeginTime(entity.beginTime);
              setCurrentTime(entity.beginTime);
              setEndTime(entity.endTime);
            }, 50);
          }
        }}
        onPointerPositionChanged={(t) => {
          setTimeout(() => {
            audioPlayerRef.current?.pause();
            audioPlayerRef.current?.setTime(t);
            setCurrentTime(t);
          }, 50);
        }}
      />
      <AudioPlayer
        ref={audioPlayerRef}
        src={audioURL}
        onDurationChange={(d) => setAudioDuration(d)}
        onTimeUpdate={(t) => setCurrentTime(t ?? 0)}
        onStateChanged={(isPaused) => setAudioPaused(isPaused)}
      />
      <Flex justifyContent={"center"}>
        {selectedEntity && (
          <Entity
            entity={selectedEntity}
            onEntitySet={updateEntity}
            onSave={onSave}
          />
        )}
      </Flex>
    </Flex>
  );
};

export default EditPage;
