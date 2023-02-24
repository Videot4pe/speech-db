import {
  Button,
  FormControl,
  FormLabel,
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

import MarkupsApi from "../../../api/markups-api";
import RecordsApi from "../../../api/records-api";
import type { ItemValue } from "../../../models/common";
import type { NewMarkupDto } from "../../../models/markup";
import { useErrorHandler } from "../../../utils/handle-get-error";

interface MarkupProps {
  isOpen: boolean;
  activeId: undefined | number;
  onClose: () => void;
  onMarkupSave: () => void;
}

const Markup = ({ onClose, onMarkupSave, isOpen, activeId }: MarkupProps) => {
  const [markup, setMarkup] = useState<NewMarkupDto>({
    record: undefined,
  });
  const errorHandler = useErrorHandler();

  const fetchRecords = (inputValue: string) =>
    // TODO column name (tables)
    RecordsApi.list({ filter: [{ column: "records.name", value: inputValue }] })
      .then(({ data }) => {
        return data.map((record) => ({ value: record.id, label: record.name }));
      })
      .catch(errorHandler);

  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (activeId) {
      setIsLoading(true);
      MarkupsApi.view(activeId)
        .then(setMarkup)
        .catch(errorHandler)
        .finally(() => setIsLoading(false));
    }
  }, [activeId]);

  const onRecordSelect = (record: ItemValue) => {
    setMarkup({ ...markup, record: record.value });
  };

  const onActionDone = () => {
    toast({
      title: "Success",
      status: "success",
      duration: 1500,
    });
    onMarkupSave();
  };

  const onSave = () => {
    setIsLoading(true);
    if (activeId) {
      MarkupsApi.update(activeId, markup)
        .then(() => {
          onActionDone();
        })
        .catch(errorHandler)
        .finally(() => setIsLoading(false));
    } else {
      MarkupsApi.create(markup)
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
        <ModalHeader>Разметка</ModalHeader>
        <ModalCloseButton />
        <ModalBody overflowY="scroll">
          <FormControl id="record">
            <FormLabel>Запись</FormLabel>
            <AsyncSelect
              cacheOptions
              defaultOptions
              loadOptions={fetchRecords}
              onChange={onRecordSelect}
              menuPosition="fixed"
            />
          </FormControl>
          <FormControl my={12} id="params">
            <FormLabel>Параметры</FormLabel>
          </FormControl>
        </ModalBody>
        <ModalFooter justifyContent="space-between">
          <Spacer />
          <Button isLoading={isLoading} onClick={onSave}>
            Сохранить
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default Markup;
