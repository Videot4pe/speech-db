import { Button, Flex, IconButton } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import Edit from "./Edit";
import AudioPlayer from "./components/AudioPlayer";
import { useErrorHandler } from "../../utils/handle-get-error";
import { useParams } from "react-router-dom";

import MarkupsApi from "../../api/markups-api";
import { CreateEntityDto, EntityDto } from "models/markup";
import { useCRUDWebsocket } from "../../hooks/use-crud-websocket";
import Entity from "./components/Entity";

import { timeToString } from "./composables/format-time";
import { ImPause, ImPlay, ImStop } from "react-icons/im";

interface IEdit {
  zoomIn: () => void;
  zoomOut: () => void;
}

interface IAudioPlayer {
  isPaused: () => boolean;
  play: () => void;
  pause: () => void;
  setTime: (value: number) => void;
}

const EditPage = () => {
  const errorHandler = useErrorHandler();
  const params = useParams();

  const editRef = useRef<IEdit>(null);
  const audioPlayerRef = useRef<IAudioPlayer>(null);

  const [imageURL, setImageURL] = useState<string | undefined>(undefined);
  const [audioURL, setAudioURL] = useState<string | undefined>(undefined);
  const [audioDuration, setAudioDuration] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState<number | null>(null);
  const [beginTime, setBeginTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<EntityDto | null>(null);

  // TODO FIX THIS PLEASE
  const markupId = +params.id!;
  /** Исходный массив сущностей */
  // const [markupData, setMarkupData] = useState<EntityDto[]>([]);

  const [entity, setEntity] = useState<EntityDto>({
    markupId,
    value: "",
    beginTime: 0,
    endTime: 0,
  });
  const updateEntity = (key: string, value: any) => {
    setEntity({ ...entity, [key]: value });
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

  useEffect(() => {
    MarkupsApi.view(markupId)
      .then((payload) => {
        setImageURL(payload.image);
        setAudioURL(payload.record);
      })
      .catch(errorHandler);
  }, []);

  useEffect(() => {
    if (currentTime && endTime && currentTime > endTime)
      audioPlayerRef.current?.pause();
  }, [currentTime]);

  function getEntityById(id: string | null) {
    const entity = markupData.find((e) => e.id!.toString() === id);
    if (!entity) throw Error("Entity was not found!");
    return entity;
  }

  const onSave = () => {
    console.log({ entity });
  };

  return (
    <Flex direction={"column"}>
      <Flex justify={"center"}>
        <IconButton
          className="q-mx-xs bg-green-2"
          aria-label="play"
          icon={<ImPlay />}
          onClick={() => audioPlayerRef.current?.play()}
        />
        <IconButton
          className="q-mx-xs bg-blue-2"
          aria-label="pause"
          icon={<ImPause />}
          onClick={() => audioPlayerRef.current?.pause()}
        />
        <IconButton
          className={"q-mx-xs bg-red-2"}
          aria-label="stop"
          icon={<ImStop />}
        />
        <span
          className={"q-px-md text-left text-bold self-center"}
          style={{ width: "200px" }}
        >
          {`${timeToString(currentTime)} - ${timeToString(endTime)}`}
        </span>
      </Flex>

      <Edit
        ref={editRef}
        imageURL={imageURL}
        audioDuration={audioDuration}
        currentTime={currentTime}
        entities={markupData}
        onEntityRemoved={(id: string) => {
          remove(getEntityById(id));
        }}
        onEntityCreated={({ beginTime, endTime }) => {
          console.warn("[EditPage] creatingNewEntity...");
          create({
            markupId,
            beginTime,
            endTime,
            value: "",
          });
        }}
        onEntityUpdated={({ id, beginTime, endTime }) => {
          update({ ...getEntityById(id), beginTime, endTime });
        }}
        onEntitySelected={(id: string | null) => {
          // Подставить сюда свой setState, необходимый для инициализации формы
          if (id === null) {
            audioPlayerRef.current?.pause();
            setSelectedEntity(null);
            setBeginTime(0);
            setCurrentTime(0);
            setEndTime(null);
            return;
          }

          const entity = getEntityById(id);
          if (entity.id === selectedEntity?.id) {
            const audioIsPlaying = !audioPlayerRef.current?.isPaused();
            audioIsPlaying
              ? audioPlayerRef.current?.pause()
              : audioPlayerRef.current?.play();
          } else {
            setSelectedEntity(entity);
            audioPlayerRef.current?.pause();
            setBeginTime(entity.beginTime);
            setCurrentTime(entity.beginTime);
            setEndTime(entity.endTime);
          }
        }}
      />
      <AudioPlayer
        ref={audioPlayerRef}
        src={audioURL}
        onDurationChange={setAudioDuration}
        onTimeUpdate={setCurrentTime}
      />
      <Entity entity={entity} onEntitySet={updateEntity} onSave={onSave} />
    </Flex>
  );
};

export default EditPage;
