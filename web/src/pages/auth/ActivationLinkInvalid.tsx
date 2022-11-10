import {
    Box,
    Button,
    Flex,
    Heading,
    Text,
  } from "@chakra-ui/react";
  
  import Logo from "./components/Logo";
  import { useNavigate } from "react-router-dom";
  
  const ActivationLinkExpired = () => {
    const navigate = useNavigate();
    
    return (
        <Box bg="pink.100" minH="100vh" py="12" px={{ base: "4", lg: "8" }}>
        <Box maxW="md" mx="auto">
            <Logo mx="auto" h="8" mb={{ base: "10", md: "20" }} />
            <Heading textAlign="center" size="xl" fontWeight="extrabold">
                Activation link is invalid or was already used
            </Heading>
            <Text mt="4" mb="8" align="center" maxW="md" fontWeight="medium">
            </Text>
            <Flex justifyContent='center'>
                <Button
                    colorScheme="blue"
                    size="lg"
                    fontSize="md"
                    minWidth={100}
                    onClick={() => navigate('/signin', { replace: true })}
                >
                    Okay
                </Button>
            </Flex>
        </Box>
        </Box>
    );
};

export default ActivationLinkExpired;
  