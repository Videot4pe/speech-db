import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spacer,
  useToast,
} from "@chakra-ui/react";
import { AsyncSelect } from "chakra-react-select";
import { useEffect, useState } from "react";

import RecordsApi from "../../../api/records-api";
import SpeakersApi from "../../../api/speakers-api";
import Uploader from "../../../components/uploader/Uploader";
import type { ItemValue } from "../../../models/common";
import type { NewRecordDto } from "../../../models/record";
import { useErrorHandler } from "../../../utils/handle-get-error";

interface RecordProps {
  isOpen: boolean;
  activeId: undefined | number;
  onClose: () => void;
  onRecordSave: () => void;
}

const Record = ({ onClose, onRecordSave, isOpen, activeId }: RecordProps) => {
  const [record, setRecord] = useState<NewRecordDto>({
    name: "",
    file: undefined,
    speaker: undefined,
  });
  const errorHandler = useErrorHandler();

  const fetchSpeakers = (inputValue: string) =>
    SpeakersApi.list({ filter: [{ column: "name", value: inputValue }] })
      .then(({ data }) =>
        data.map((speaker) => ({ value: speaker.id, label: speaker.name }))
      )
      .catch(errorHandler);

  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (activeId) {
      setIsLoading(true);
      RecordsApi.view(activeId)
        .then(setRecord)
        .catch(errorHandler)
        .finally(() => setIsLoading(false));
    }
  }, [activeId]);

  const onSpeakerSelect = (speaker: ItemValue) => {
    setRecord({ ...record, speaker: speaker.value });
  };

  const onFileUpload = (file: string) => {
    setRecord({ ...record, file });
  };

  const onActionDone = () => {
    toast({
      title: "Success",
      status: "success",
      duration: 1500,
    });
    onRecordSave();
  };

  const onSave = () => {
    setIsLoading(true);
    if (activeId) {
      RecordsApi.update(activeId, record)
        .then(() => {
          onActionDone();
        })
        .catch(errorHandler)
        .finally(() => setIsLoading(false));
    } else {
      RecordsApi.create(record)
        .then(onActionDone)
        .catch(errorHandler)
        .finally(() => setIsLoading(false));
    }
  };

  return (
    <Modal
      onClose={onClose}
      size="lg"
      isOpen={isOpen}
      closeOnOverlayClick={false}
    >
      <ModalOverlay />
      <ModalContent maxH="calc(100% - 120px)">
        <ModalHeader>Record</ModalHeader>
        <ModalCloseButton />
        <ModalBody overflowY="scroll">
          <FormControl id="record">
            <FormLabel>Record</FormLabel>
            <Uploader onFileUpload={onFileUpload} />
          </FormControl>
          <FormControl id="speaker">
            <FormLabel>Speaker</FormLabel>
            <AsyncSelect
              cacheOptions
              defaultOptions
              loadOptions={fetchSpeakers}
              onChange={onSpeakerSelect}
              menuPosition='fixed'
            />
          </FormControl>
          <FormControl id="username">
            <FormLabel>Name</FormLabel>
            <Input
              value={record.name}
              onChange={(event) =>
                setRecord({ ...record, name: event.target.value })
              }
              name="name"
              type="name"
              autoComplete="name"
            />
          </FormControl>
        </ModalBody>
        <ModalFooter justifyContent="space-between">
          <Spacer />
          <Button isLoading={isLoading} onClick={onSave}>
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default Record;
