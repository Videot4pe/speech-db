import Card from "../../auth/components/Card";
import { Button, FormControl, FormLabel, Input } from "@chakra-ui/react";
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
        <FormLabel>Value</FormLabel>
        <Input
          value={entity.value}
          onChange={(event) => onEntitySet("value", event.target.value)}
          name="value"
        />
      </FormControl>
      <Button mt={4} onClick={onSave}>
        Save
      </Button>
    </Card>
  );
};

export default Entity;
