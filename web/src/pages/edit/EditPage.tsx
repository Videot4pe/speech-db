import { Button } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import Edit from "./Edit";
import AudioPlayer from "./components/AudioPlayer";
import { useErrorHandler } from "../../utils/handle-get-error";
import { useParams } from "react-router-dom";

import MarkupsApi from "../../api/markups-api";
import { CreateEntityDto, EntityDto } from "models/markup";
import { useCRUDWebsocket } from "../../hooks/use-crud-websocket";

function selectURL(n: number): string {
  if (n === 0) {
    return "https://www.frolov-lib.ru/books/hi/ch03.files/image010.jpg";
  }
  return "https://www.frolov-lib.ru/books/hi/ch03.files/image020.jpg";
}

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
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number | null>(null);

  // TODO FIX THIS PLEASE
  const markupId = +params.id!;
  /** Исходный массив сущностей */
  // const [markupData, setMarkupData] = useState<EntityDto[]>([]);

  const socketUrl = `${import.meta.env.VITE_WS}${
    import.meta.env.VITE_WS_URL
  }/api/ws/markups/${markupId}`;

  const { create, update, remove, websocketState: markupData } =
    useCRUDWebsocket<EntityDto>(socketUrl);

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

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}
      >
        <div
          style={{
            width: "100px",
            display: "flex",
            flexWrap: "wrap",
            flexDirection: "column",
            alignContent: "flex-start",
          }}
        >
          <Button onClick={() => setImageURL(selectURL(0))}>Audio 0</Button>
          <Button onClick={() => setImageURL(selectURL(1))}>Audio 1</Button>
        </div>
        <div
          style={{
            width: "300px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          {/* <Button onClick={() => editRef.current?.zoomOut()}>Zoom Out (-)</Button>
          <Button onClick={() => editRef.current?.zoomIn()}>Zoom In (+)</Button> */}

          <Button onClick={() => audioPlayerRef.current?.play()}>Play</Button>
          <Button onClick={() => audioPlayerRef.current?.pause()}>Pause</Button>
        </div>
      </div>

      <Edit
        ref={editRef}
        imageURL={imageURL}
        audioDuration={audioDuration}
        currentTime={currentTime}
        entities={markupData}
        onEntityRemoved={(id: string) => {
          const entity = markupData.find((e) => e.id!.toString() === id)
          if (!entity) throw Error('Entity was not found!');
          remove(entity)
        }}
        onEntityCreated={({beginTime, endTime}) => {
          console.warn('[EditPage] creatingNewEntity...')
          create({
            markupId,
            beginTime,
            endTime,
            value: '',
          })
        }}
        onEntityUpdated={function (dto: EntityDto): void {
          throw new Error("Function not implemented.");
        }}
        onEntitySelected={function (id: string): void {
          const entity = markupData.find((e) => e.id!.toString() === id)
          if (!entity) throw Error('Entity was not found!');
          // Подставить сюда свой setState, необходимый для инициализации формы
          // setEditedEntity(entity)
        }}
      />
      <AudioPlayer
        ref={audioPlayerRef}
        src={audioURL}
        onDurationChange={setAudioDuration}
        onTimeUpdate={setCurrentTime}
      />
    </div>
  );
};

export default EditPage;
