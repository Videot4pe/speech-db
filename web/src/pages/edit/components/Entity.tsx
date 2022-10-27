import Card from "../../auth/components/Card";
import { Button, Flex, FormControl, FormLabel, Input, Select } from "@chakra-ui/react";
import { useState } from "react";
import { EntityDto } from "../../../models/markup";

export interface EntityProps {
  entity: EntityDto;
  onEntitySet: (key: string, value: any) => void;
  onSave: () => void;
}

const Entity = ({ entity, onEntitySet, onSave }: EntityProps) => {
  return (
    <Card w="400px" p={4}>
      <FormControl id="value">
        <Flex gap="4px">
          <Input
            value={entity.value}
            onChange={(event) => onEntitySet("value", event.target.value)}
            placeholder="Значение"
          />
          <Select>
            <option value={undefined}>Ударение</option>
          </Select>
        </Flex>
      <Select>
        <option value={undefined}>Язык</option>
      </Select>
      <Select>
        <option value={undefined}>Диалект</option>
      </Select>
      </FormControl>
      <Flex justifyContent='center'>
        <Button mt={4} onClick={onSave}>
          Сохранить
        </Button>
      </Flex>
    </Card>
  );
};

export default Entity;
