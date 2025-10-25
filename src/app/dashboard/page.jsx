"use client";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";

import AddBook from "@/components/addBook";
import UpdateBook from "@/components/updateBook";
import UserList from "@/components/userList";
import BorrowList from "@/components/borrowList";

export default function Dashboard() {


  return (
    <section className="pt-32 xl:px-60 lg:px-30 px-20">
      <div className="bg-blue-200 p-8 w-full shadow-md my-10">
        <Tabs>
          <TabList className="border-b py-2">
            <Tab>ADD BOOK</Tab>
            <Tab>UPDATE BOOK</Tab>
            <Tab>USERS</Tab>
            <Tab>BORROWS</Tab>

          </TabList>
          <TabPanel>
            <AddBook />
          </TabPanel>
          <TabPanel>
            <UpdateBook/>
          </TabPanel>
          <TabPanel>
            <UserList/>
          </TabPanel>
          <TabPanel>
            <BorrowList/>
          </TabPanel>
        </Tabs>
      </div>
    </section>
  );
}
