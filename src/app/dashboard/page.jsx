"use client";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";

import AddBook from "@/components/addBook";
import UpdateBook from "@/components/updateBook";
import UserList from "@/components/userList";
import BorrowList from "@/components/borrowList";

export default function Dashboard() {
  return (
    <section className="pt-32 xl:px-60 lg:px-30 px-4">
      <div className="bg-blue-200 shadow-lg p-4 my-10">
        <Tabs>
          {/* Tab List */}
          <TabList className="flex border-b border-blue-400 pb-4">
            <Tab className="px-4 py-2 cursor-pointer text-gray-600 font-medium rounded-t-lg hover:bg-gray-100 selected:bg-blue-500 selected:text-white">
              ADD BOOK
            </Tab>
            <Tab className="px-4 py-2 cursor-pointer text-gray-600 font-medium rounded-t-lg hover:bg-gray-100 selected:bg-blue-500 selected:text-white">
              UPDATE BOOK
            </Tab>
            <Tab className="px-4 py-2 cursor-pointer text-gray-600 font-medium rounded-t-lg hover:bg-gray-100 selected:bg-blue-500 selected:text-white">
              USERS
            </Tab>
            <Tab className="px-4 py-2 cursor-pointer text-gray-600 font-medium rounded-t-lg hover:bg-gray-100 selected:bg-blue-500 selected:text-white">
              BORROWS
            </Tab>
          </TabList>

          {/* Tab Panels */}
          <TabPanel className="mt-4">
            <AddBook />
          </TabPanel>
          <TabPanel className="mt-4">
            <UpdateBook />
          </TabPanel>
          <TabPanel className="mt-4">
            <UserList />
          </TabPanel>
          <TabPanel className="mt-4">
            <BorrowList />
          </TabPanel>
        </Tabs>
      </div>
    </section>
  );
}
