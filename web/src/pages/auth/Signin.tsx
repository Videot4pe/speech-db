import {
  Box,
  Button,
  Heading,
  SimpleGrid,
  Text,
  VisuallyHidden,
} from "@chakra-ui/react";
import { FaFacebook, FaGithub, FaGoogle } from "react-icons/fa";

import Card from "./components/Card";
import DividerWithText from "./components/DividerWithText";
import Link from "./components/Link";
import Logo from "./components/Logo";
import SigninForm from "./components/SigninForm";

const Signin = () => (
  <Box bg="pink.100" minH="100vh" py="12" px={{ base: "4", lg: "8" }}>
    <Box maxW="md" mx="auto">
      <Logo mx="auto" h="8" mb={{ base: "10", md: "20" }} />
      <Heading textAlign="center" size="xl" fontWeight="extrabold">
        Sign in to your account
      </Heading>
      <Text mt="4" mb="8" align="center" maxW="md" fontWeight="medium">
        <Text as="span">Don&apos;t have an account?</Text>
        <Link href="/signup">Signup</Link>
      </Text>
      <Card>
        <SigninForm />
      </Card>
    </Box>
  </Box>
);

export default Signin;
