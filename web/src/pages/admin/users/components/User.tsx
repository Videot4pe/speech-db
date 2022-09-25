import {
  Avatar,
  Button,
  Center,
  chakra,
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
  Select,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
  Stack,
  useToast,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { UserDto } from "../../../../models/user";
import { useErrorHandler } from "../../../../utils/handle-get-error";
import UsersApi from "../../../../api/users-api";
import { useAtom } from "jotai";
import { rolesAtom } from "../../../../store";

interface UserProps {
  isOpen: boolean;
  activeId: undefined | number;
  onClose: () => void;
  onUserSave: () => void;
}

const User = ({ onClose, onUserSave, isOpen, activeId }: UserProps) => {
  const [user, setUser] = useState<UserDto>({
    avatar: null,
    email: "",
    name: "",
    surname: "",
    username: "",
  });
  const errorHandler = useErrorHandler();

  const [roles] = useAtom(rolesAtom);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (activeId) {
      setIsLoading(true);
      UsersApi.view(activeId)
        .then(setUser)
        .catch(errorHandler)
        .finally(() => setIsLoading(false));
    }
  }, [activeId]);

  const onActionDone = () => {
    toast({
      title: "Success",
      status: "success",
      duration: 1500,
    });
    onUserSave();
  };

  const onSave = () => {
    setIsLoading(true);
    if (activeId) {
      UsersApi.update(activeId, user)
        .then(() => {
          onActionDone();
        })
        .catch(errorHandler)
        .finally(() => setIsLoading(false));
    } else {
      UsersApi.create(user)
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
      <chakra.form
        onSubmit={(e) => {
          e.preventDefault();
          onSave();
        }}
      >
        <ModalContent maxH="calc(100% - 120px)">
          <ModalHeader>
            <SkeletonText isLoaded={!isLoading}>{user.email}</SkeletonText>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody overflowY="scroll">
            <Center>
              <SkeletonCircle isLoaded={!isLoading} size="200">
                <Avatar width={200} height={200} src={user.avatar} />
              </SkeletonCircle>
            </Center>
            <FormControl mb={4} id="email">
              <FormLabel>Role</FormLabel>
              <Skeleton isLoaded={!isLoading}>
                <Select
                  value={user.role}
                  onChange={(e) => setUser({ ...user, role: +e.target.value })}
                >
                  {roles.map((role) => (
                    <option value={role.id}>{role.name}</option>
                  ))}
                </Select>
              </Skeleton>
            </FormControl>
            <FormControl mb={4} id="name">
              <FormLabel>Name</FormLabel>
              <Skeleton isLoaded={!isLoading}>
                <Input
                  value={user.name}
                  onChange={(event) =>
                    setUser({ ...user, name: event.target.value })
                  }
                  name="name"
                  type="name"
                  autoComplete="name"
                />
              </Skeleton>
            </FormControl>
            <FormControl mb={4} id="name">
              <FormLabel>Surname</FormLabel>
              <Skeleton isLoaded={!isLoading}>
                <Input
                  value={user.surname}
                  onChange={(event) =>
                    setUser({ ...user, surname: event.target.value })
                  }
                  name="surname"
                  type="surname"
                  autoComplete="surname"
                />
              </Skeleton>
            </FormControl>
            <FormControl mb={4} id="username">
              <FormLabel>Username</FormLabel>
              <Skeleton isLoaded={!isLoading}>
                <Input
                  value={user.username}
                  onChange={(event) =>
                    setUser({ ...user, username: event.target.value })
                  }
                  name="username"
                  type="username"
                  autoComplete="username"
                />
              </Skeleton>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button
              type="submit"
              colorScheme="blue"
              size="lg"
              fontSize="md"
              isLoading={isLoading}
            >
              Update
            </Button>
          </ModalFooter>
        </ModalContent>
      </chakra.form>
    </Modal>
  );
};
export default User;
