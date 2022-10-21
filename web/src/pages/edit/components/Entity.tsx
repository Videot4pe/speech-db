import Card from "../../auth/components/Card";
import { FormControl, FormLabel, Input } from "@chakra-ui/react";
import { useState } from "react";

const Entity = () => {
  const [entity, setEntity] = useState({
    value: "",
  });

  return (
    <Card w="200px" p={4}>
      <FormControl id="value">
        <FormLabel>Value</FormLabel>
        <Input
          value={entity.value}
          onChange={(event) =>
            setEntity({ ...entity, value: event.target.value })
          }
          name="value"
        />
      </FormControl>
    </Card>
  );
};

export default Entity;
