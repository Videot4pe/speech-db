import type { HTMLChakraProps } from "@chakra-ui/react";
import {
  Button,
  Center,
  chakra,
  Container,
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
  Stack,
  Avatar as UserAvatar,
  useDisclosure,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import Avatar from "react-avatar-edit";
import { AiOutlineUser } from "react-icons/ai";

import AuthApi from "../../api/auth-api";
import UsersApi from "../../api/users-api";
import { useErrorHandler } from "../../utils/handle-get-error";
import { useSuccessHandler } from "../../utils/handle-success";
import { UserDto } from "../../models/user";

const Profile = (props: HTMLChakraProps<"form">) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [user, setUser] = useState<UserDto>({
    avatar: null,
    email: "",
    name: "",
    surname: "",
    username: "",
  });
  const [preview, setPreview] = useState<string | undefined>("");
  const errorHandler = useErrorHandler();
  const successHandler = useSuccessHandler("Success");

  const onCloseImage = () => {
    setPreview(undefined);
  };

  const onCropImage = (newPreview: string) => {
    setPreview(newPreview);
  };

  const onConfirmImage = () => {
    setUser({ ...user, avatar: preview, avatarId: null });
    onClose();
  };

  const fetchUser = () => {
    AuthApi.self().then(setUser).catch(errorHandler);
  };

  const updateUser = () => {
    AuthApi.selfUpdate(user)
      .then(() => {
        successHandler("User updated successfully");
        fetchUser();
      })
      .catch(errorHandler);
  };

  useEffect(fetchUser, []);

  return (
    <Container>
      <chakra.form
        onSubmit={(e) => {
          e.preventDefault();
          updateUser();
        }}
        {...props}
      >
        <Stack spacing="6">
          <UserAvatar
            width={200}
            height={200}
            src={user.avatar || undefined}
            icon={<AiOutlineUser fontSize="1.5rem" />}
            onClick={onOpen}
          />
          <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Pick image</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Center>
                  <Avatar
                    width={400}
                    height={250}
                    onCrop={onCropImage}
                    onClose={onCloseImage}
                    src={user.avatar || undefined}
                  />
                </Center>
              </ModalBody>
              <ModalFooter justifyContent="space-between">
                <Button variant="ghost" onClick={onClose}>
                  Close
                </Button>
                <Button colorScheme="blue" onClick={onConfirmImage}>
                  Confirm
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
          <FormControl id="email">
            <FormLabel>Email address</FormLabel>
            <Input
              value={user.email}
              onChange={(event) =>
                setUser({ ...user, email: event.target.value })
              }
              name="email"
              type="email"
              autoComplete="email"
              disabled={true}
              required
            />
          </FormControl>
          <FormControl id="name">
            <FormLabel>Name</FormLabel>
            <Input
              value={user.name}
              onChange={(event) =>
                setUser({ ...user, name: event.target.value })
              }
              name="name"
              type="name"
              autoComplete="name"
            />
          </FormControl>
          <FormControl id="name">
            <FormLabel>Surname</FormLabel>
            <Input
              value={user.surname}
              onChange={(event) =>
                setUser({ ...user, surname: event.target.value })
              }
              name="surname"
              type="surname"
              autoComplete="surname"
            />
          </FormControl>
          <FormControl id="username">
            <FormLabel>Username</FormLabel>
            <Input
              value={user.username}
              onChange={(event) =>
                setUser({ ...user, username: event.target.value })
              }
              name="username"
              type="username"
              autoComplete="username"
            />
          </FormControl>
          <Button type="submit" colorScheme="blue" size="lg" fontSize="md">
            Update
          </Button>
        </Stack>
      </chakra.form>
    </Container>
  );
};
export default Profile;
