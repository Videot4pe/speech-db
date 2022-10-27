import { Flex } from "@chakra-ui/react";

const Home = () => {
  return (
    <Flex p={10} justifyContent="center">
      <p>Видишь ошибку на сайте? Пиши сюда 👉</p>
      <Flex>
        <img style={{padding: "0px 4px 0px 4px"}} src="https://telegram.org/img/website_icon.svg?4" />
        @videot4pe @strooom
      </Flex>
    </Flex>
  );
};

export default Home;
