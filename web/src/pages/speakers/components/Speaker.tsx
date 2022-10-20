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
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Spacer,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";

import SpeakersApi from "../../../api/speakers-api";
import type { SpeakerDto } from "../../../models/speaker";
import { useErrorHandler } from "../../../utils/handle-get-error";

interface SpeakerProps {
  isOpen: boolean;
  activeSpeakerId: undefined | number;
  onClose: () => void;
  onSpeakerSave: () => void;
}

const Speaker = ({
  onClose,
  onSpeakerSave,
  isOpen,
  activeSpeakerId,
}: SpeakerProps) => {
  const [speaker, setSpeaker] = useState<SpeakerDto>({
    name: "",
    properties: {
      age: 30,
    },
  });

  const errorHandler = useErrorHandler();
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (activeSpeakerId) {
      setIsLoading(true);
      SpeakersApi.view(activeSpeakerId)
        .then(setSpeaker)
        .catch(errorHandler)
        .finally(() => setIsLoading(false));
    }
  }, [activeSpeakerId]);

  const onActionDone = () => {
    toast({
      title: "Success",
      status: "success",
      duration: 1500,
    });
    onSpeakerSave();
  };

  const onSave = () => {
    setIsLoading(true);
    if (activeSpeakerId) {
      SpeakersApi.update(activeSpeakerId, speaker)
        .then(() => {
          onActionDone();
        })
        .catch(errorHandler)
        .finally(() => setIsLoading(false));
    } else {
      SpeakersApi.create(speaker)
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
        <ModalHeader>Speaker</ModalHeader>
        <ModalCloseButton />
        <ModalBody overflowY="scroll">
          <FormControl id="username">
            <FormLabel>Name</FormLabel>
            <Input
              value={speaker.name}
              onChange={(event) =>
                setSpeaker({ ...speaker, name: event.target.value })
              }
              name="name"
              type="name"
              autoComplete="name"
            />
          </FormControl>
          <FormControl id="age">
            <FormLabel>Age</FormLabel>
            <NumberInput
              value={speaker.properties.age}
              min={1}
              max={99}
              onChange={(value) =>
                setSpeaker({
                  ...speaker,
                  properties: {
                    ...speaker.properties,
                    age: +value,
                  },
                })
              }
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
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

export default Speaker;
