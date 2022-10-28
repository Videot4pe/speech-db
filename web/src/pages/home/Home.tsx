import { Center, Flex, VStack } from "@chakra-ui/react";

const Home = () => {
  return (
    <VStack p={10} justifyContent="center">
      <div>Видишь ошибку на сайте (или просто хочешь сходить погулять)?</div>
      <div>
        <div>Пиши 👇 сюда</div>
      </div>
      <Flex>
        <a target="_blank" href="https://t.me/videot4pe">
          @videot4pe
        </a>
        <Flex mx={2}>
          <img
            style={{ padding: "0px 4px 0px 4px" }}
            src="https://telegram.org/img/website_icon.svg?4"
          />
        </Flex>
        <a target="_blank" href="https://t.me/strooom">
          @strooom
        </a>
      </Flex>
    </VStack>
  );
};

export default Home;
