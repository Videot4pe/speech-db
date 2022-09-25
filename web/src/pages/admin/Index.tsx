import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import { lazy } from "react";

const Roles = lazy(() => import("./roles/Roles"));
const Users = lazy(() => import("./users/Users"));

const Admin = () => {
  return (
    <Tabs>
      <TabList>
        <Tab>Users</Tab>
        <Tab>Roles</Tab>
      </TabList>

      <TabPanels>
        <TabPanel>
          <Users />
        </TabPanel>
        <TabPanel>
          <Roles />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};

export default Admin;
