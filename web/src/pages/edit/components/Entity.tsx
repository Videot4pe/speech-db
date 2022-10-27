import Card from "../../auth/components/Card";
import { Button, Flex, FormControl, Input, useToast } from "@chakra-ui/react";
import { EntityDto } from "../../../models/markup";
import { validate } from "../composables/validate-entity";
import { Select } from "chakra-react-select";

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
  const toast = useToast();

  function validateAndSave() {
    console.warn('[Entity] validateAndSave');

    const error = validate(entity);
    console.log(`error: '${error}'`);
    console.log(entity);
    if (error) {
      toast({
        title: 'Ошибка',
        description: error,
      })
    } else {
      onSave()
    }
  }

  return (
    <Card className="entity" w="600px" p={4}>
      <FormControl id="value">
        <Flex gap="4px" direction="column">
          <Input
            value={entity.value}
            onChange={(event) => onEntitySet("value", event.target.value)}
            placeholder="Значение"
          />
          <Select placeholder="Ударение" options={stressOptions} defaultValue={undefined} />
          <Select placeholder="Язык" options={languageOptions} />
          <Select placeholder="Диалект" options={dialectOptions} />
        </Flex>
      </FormControl>
      <Flex justifyContent='center'>
        <Button mt={4} onClick={validateAndSave}>
          Сохранить
        </Button>
      </Flex>
    </Card>
  );
};

export default Entity;
