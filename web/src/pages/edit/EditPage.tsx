import { Button } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import Edit from "./Edit";
import AudioPlayer from "./components/AudioPlayer";
import { useErrorHandler } from "../../utils/handle-get-error";
import { useParams } from "react-router-dom";

import MarkupsApi from "../../api/markups-api";
import { useWebsocketSubscription } from "../../hooks/use-websocket-subscription";
import { useAtom } from "jotai";
import { jwtToken } from "../../store";
import { useSse } from "../../hooks/use-sse";

function selectURL(n: number): string {
  if (n === 0) {
    return "https://www.frolov-lib.ru/books/hi/ch03.files/image010.jpg";
  }
  return "https://www.frolov-lib.ru/books/hi/ch03.files/image020.jpg";
}

enum WebsocketAction {
  LIST = "LIST",
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
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
  const editRef = useRef<IEdit>(null);
  const audioPlayerRef = useRef<IAudioPlayer>(null);
  const [imageURL, setImageURL] = useState<string | undefined>(undefined);
  const [audioURL, setAudioURL] = useState<string | undefined>(undefined);

  const errorHandler = useErrorHandler();
  const params = useParams();
  // TODO FIX THIS PLEASE
  const markupId = +params.id!;

  const socketUrl = `${import.meta.env.VITE_WS}${
    import.meta.env.VITE_WS_URL
  }/api/ws/markups/${markupId}`;

  const { close, send, websocketState } = useWebsocketSubscription(socketUrl);

  useEffect(() => {
    MarkupsApi.view(markupId)
      .then((payload) => {
        setImageURL(payload.image);
        setAudioURL(payload.record);
      })
      .catch(errorHandler);
  }, []);

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
        Messages: {websocketState?.join(", ")}
        <Button
          onClick={() =>
            send(WebsocketAction.CREATE, {
              markupId: markupId,
              value: "test",
              beginTime: 12,
              endTime: 15,
            })
          }
        >
          Add some кусо43к
        </Button>
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

      <Edit ref={editRef} imageURL={imageURL} />
      <AudioPlayer ref={audioPlayerRef} src={audioURL} />
    </div>
  );
};

export default EditPage;
