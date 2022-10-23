import Card from "../../auth/components/Card";
import { FormControl, FormLabel, Input } from "@chakra-ui/react";
import { useState } from "react";
import { EntityDto } from "../../../models/markup";

export interface EntityProps {
  entity: EntityDto;
  updateEntity: (key: string, value: any) => void;
}

const Entity = ({ entity, updateEntity }: EntityProps) => {
  return (
    <Card w="200px" p={4}>
      <FormControl id="value">
        <FormLabel>Value</FormLabel>
        <Input
          value={entity.value}
          onChange={(event) => updateEntity("value", event.target.value)}
          name="value"
        />
      </FormControl>
    </Card>
  );
};

export default Entity;
