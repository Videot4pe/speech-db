import Card from "../../auth/components/Card";
import { Button, Flex, FormControl, FormLabel, Input, Select } from "@chakra-ui/react";
import { EntityDto } from "../../../models/markup";
import "../components/Entity.scss"
import { validate } from "../composables/validate-entity";

export interface SelectOption {
  label: string;
  value: number;
}

export interface EntityProps {
  entity: EntityDto;
  onEntitySet: (key: string, value: any) => void;
  onSave: () => void;

  languageOptions: SelectOption[];
  dialectOptions?: SelectOption[]; // мб сделать string
  phonemeOptions: SelectOption[];
  stressOptions: SelectOption[];
}

const Entity = ({
  entity,
  onEntitySet,
  onSave,
  stressOptions,
  languageOptions,
  dialectOptions,
  phonemeOptions,
}: EntityProps) => {
  return (
    <Card className="entity" w="400px" p={4}>
      <FormControl id="value">
        <Flex gap="4px" direction="column">
          <Flex gap="4px">
            <Input
              value={entity.value}
              onChange={(event) => onEntitySet("value", event.target.value)}
              placeholder="Значение"
            />
            <Select>
              <option value={undefined}>Ударение</option>
              {stressOptions.map((opt) => (
                <option value={opt.value}>{ opt.label }</option>
              ))}
            </Select>
          </Flex>
          <Select>
            <option value={undefined}>Язык</option>
            {languageOptions.map((opt) => (
              <option value={opt.value}>{ opt.label }</option>
            ))}
          </Select>
          <Select>
            <option value={undefined}>Диалект</option>
            {languageOptions.map((opt) => (
              <option value={opt.value}>{ opt.label }</option>
            ))}
          </Select>
        </Flex>
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
