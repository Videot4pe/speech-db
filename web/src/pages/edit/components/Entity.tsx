import Card from "../../auth/components/Card";
import { Button, Flex, FormControl, Input, useToast } from "@chakra-ui/react";
import { EntityDto, WordProperties } from "../../../models/markup";
import { validate } from "../composables/validate-entity";
import { Props, Select as ChakraReactSelect } from "chakra-react-select";

export interface SelectOption {
  label: string;
  value: number | string;
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

const Select = ({displayIf, ...props}: Props<SelectOption> & { displayIf?: boolean }) => {
  return (
    <div style={{ display: displayIf !== false ? 'block' : 'none' }}>
      <ChakraReactSelect {...props} />
    </div>
  );
};

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
    const error = validate(entity);
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

  const onEntityPropertySet = (key: string, value: any) => {
    const properties: any = entity.properties;
    properties[key] = value;
    onEntitySet('properties', properties);
  };
  const displayIf = (condition: boolean) => condition ? 'block' : 'none';

  const hasType = !!entity.type;
  const isAllophone = entity.type === 'Allophone';
  const isWord = entity.type === 'Word';
  const isSentence = entity.type === 'Sentence';

  return (
    <Card className="entity" w="600px" p={4} m={2}>
      <FormControl>
        <Flex gap="4px" direction="column">
          <Select
            displayIf={isAllophone}
            placeholder="Фонема"
            options={phonemeOptions}
            onChange={(option: any) => onEntitySet("value", option?.label)}
          />
          <Input
            display={displayIf(hasType && !isAllophone)}
            placeholder="Значение"
            value={entity.value}
            onChange={(event) => onEntitySet("value", event.target.value)}
          />
          <Select
            displayIf={isAllophone}
            placeholder="Ударение"
            options={stressOptions}
            onChange={(option: any) => onEntityPropertySet("stressId", option?.id)}
          />
          <Select
            displayIf={isWord}
            placeholder="Язык"
            options={languageOptions}
            onChange={(option: any) => onEntityPropertySet("languageId", option?.id)}
          />
          <Input
            display={displayIf(isWord)}
            placeholder="Диалект"
            value={(entity.properties as WordProperties).dialect}
            onChange={(event) => onEntityPropertySet("dialect", event.target.value)}
          />
          <Select
            displayIf={entity.type === undefined}
            placeholder="Выберите тип сущности"
            options={[
              { label: 'Аллофон', value: 'Allophone' },
              { label: 'Слово', value: 'Word' },
              { label: 'Предложение', value: 'Sentence' },
            ]}
            onChange={(option: any) => onEntitySet("type", option?.value)}
          />
        </Flex>
      </FormControl>
      <Flex justifyContent='center'>
        <Button mt={4} onClick={validateAndSave}>
          { entity.type ? 'Сохранить' : 'Выбрать' }
        </Button>
      </Flex>
    </Card>
  );
};

export default Entity;
