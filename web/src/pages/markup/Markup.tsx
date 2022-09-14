import { Container } from "@chakra-ui/react";
import { useAtom } from "jotai";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useWebSocket, { ReadyState } from "react-use-websocket";

import MarkupsApi from "../../api/markups-api";
import Waveform from "../../components/waveform/Waveform";
import AudioWaveform from "../../lib/waveform/audio-waveform";
import type { MarkupDto } from "../../models/markup";
import { jwtToken } from "../../store";
import { useErrorHandler } from "../../utils/handle-get-error";

const Markup = () => {
  const onCreateEntity = () => {};
  const params = useParams();
  const { id } = params;
  const [jwt] = useAtom(jwtToken);

  const [markup, setMarkup] = useState<MarkupDto | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const errorHandler = useErrorHandler();

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      MarkupsApi.view(+id)
        .then((payload) => {
          setMarkup(payload);
        })
        .catch(errorHandler)
        .finally(() => setIsLoading(false));
    }
  }, [id]);

  const socketUrl = `${import.meta.env.VITE_WS}${
    import.meta.env.VITE_WS_URL
  }/api/ws/markups/${id}?token=${jwt}`;

  const [messageHistory, setMessageHistory] = useState([]);

  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl);

  useEffect(() => {
    if (lastMessage !== null) {
      setMessageHistory((prev) => prev.concat(lastMessage));
    }
  }, [lastMessage, setMessageHistory]);

  const handleClickSendMessage = useCallback(
    () =>
      sendMessage(
        JSON.stringify({
          markupId: 1,
          value: "test",
          beginTime: 12,
          endTime: 15,
        })
      ),
    []
  );

  const connectionStatus = {
    [ReadyState.CONNECTING]: "Connecting",
    [ReadyState.OPEN]: "Open",
    [ReadyState.CLOSING]: "Closing",
    [ReadyState.CLOSED]: "Closed",
    [ReadyState.UNINSTANTIATED]: "Uninstantiated",
  }[readyState];

  return (
    <Container>
      <Waveform url={markup?.record} />
      {/* <div>Markup {params.id} </div> */}
      {/* <Button onClick={onCreateEntity}>Add entity</Button> */}

      {/* <button */}
      {/*  onClick={handleClickSendMessage} */}
      {/*  disabled={readyState !== ReadyState.OPEN} */}
      {/* > */}
      {/*  Click Me to send 'Hello' */}
      {/*  {waveform.fileUrl} */}
      {/*  {waveform.fileObject} */}
      {/* </button> */}
      {/* <span>The WebSocket is currently {connectionStatus}</span> */}
      {/* {lastMessage ? <span>Last message: {lastMessage.data}</span> : null} */}
      {/* <ul> */}
      {/*  {messageHistory.map((message, idx) => ( */}
      {/*    <span key={idx}>{message ? message.data : null}</span> */}
      {/*  ))} */}
      {/* </ul> */}
    </Container>
  );
};

export default Markup;
