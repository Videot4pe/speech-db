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
        status: 'error',
        position: 'top',
        title: 'Ошибка',
        description: error,
      })
    } else {
      onSave()
    }
  }

  const isAllophone = entity.type === 'Allophone';
  const isWord = entity.type === 'Word';
  const isSentence = entity.type === 'Sentence';

  return (
    <Card className="entity" w="600px" p={4} m={2}>
      {entity.type && (
        <FormControl>
          <Flex gap="4px" direction="column">
            {isAllophone && (
              <Select
                placeholder="Фонема"
                options={phonemeOptions}
                // onChange={(event) => onEntitySet("value", event.target.value)}
              />
            )}
            {!isAllophone && (
              <Input
                value={entity.value}
                onChange={(event) => onEntitySet("value", event.target.value)}
                placeholder="Значение"
              />
            )}
            <Select placeholder="Ударение" options={stressOptions} defaultValue={undefined} />
            <Select placeholder="Язык" options={languageOptions} />
            <Select placeholder="Диалект" options={dialectOptions} />
          </Flex>
        </FormControl>
      )}
      {!entity.type && (
        <FormControl>
          <Flex direction="column">
            <Select
              placeholder="Выберите тип сущности"
              options={[
                { label: 'Аллофон', value: 'Allophone' },
                { label: 'Слово', value: 'Word' },
                { label: 'Предложение', value: 'Sentence' },
              ]}
              onChange={(option) => onEntitySet("type", option?.value)}
            />
          </Flex>
        </FormControl>
      )}
      <Flex justifyContent='center'>
        <Button mt={4} onClick={validateAndSave}>
          { entity.type ? 'Сохранить' : 'Выбрать' }
        </Button>
      </Flex>
    </Card>
  );
};

export default Entity;
