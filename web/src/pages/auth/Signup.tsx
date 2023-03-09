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
import SignupForm from "./components/SignupForm";

const Signup = () => (
  <Box bg="pink.100" minH="100vh" py="12" px={{ base: "4", lg: "8" }}>
    <Box maxW="md" mx="auto">
      <Logo mx="auto" h="8" mb={{ base: "10", md: "20" }} />
      <Heading textAlign="center" size="xl" fontWeight="extrabold">
        Sign up
      </Heading>
      <Text mt="4" mb="8" align="center" maxW="md" fontWeight="medium">
        <Text as="span">Already have an account?</Text>
        <Link href="/signin">Signin</Link>
      </Text>
      <Card>
        <SignupForm />
      </Card>
    </Box>
  </Box>
);

export default Signup;
