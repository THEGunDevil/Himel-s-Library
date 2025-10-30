"use client";

import { useState } from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";

import AddBook from "@/components/addBook";
import UpdateBook from "@/components/updateBook";
import UserList from "@/components/userList";
import BorrowList from "@/components/borrowList";

export default function Dashboard() {
  const tabNames = ["Add Book", "Update Book", "Users", "Borrows"];
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <section className="pt-28 xl:px-60 lg:px-30 px-4 min-h-screen bg-gray-50">
      <div className="bg-white border border-blue-100 shadow-lg p-5 mt-10">
        <Tabs selectedIndex={selectedIndex} onSelect={(index) => setSelectedIndex(index)}>
          {/* Tab List */}
          <TabList className="flex flex-wrap gap-3 border-b border-blue-200 pb-4">
            {tabNames.map((tab, i) => {
              const isSelected = i === selectedIndex;
              return (
                <Tab key={tab} className="outline-none">
                  <button
                    type="button"
                    className={
                      // Compose classes based on selected state
                      (isSelected
                        ? "bg-blue-400 text-white shadow-sm"
                        : "bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700") +
                      " px-5 py-2 text-sm sm:text-base font-medium cursor-pointer transition-all duration-200 focus:ring-2 focus:ring-blue-400"
                    }
                  >
                    {tab}
                  </button>
                </Tab>
              );
            })}
          </TabList>

          {/* Tab Panels */}
          <div className="bg-blue-50 shadow-inner px-4 py-1 min-h-[400px] transition-all duration-200 mt-4">
            <TabPanel>
              <AddBook />
            </TabPanel>
            <TabPanel>
              <UpdateBook />
            </TabPanel>
            <TabPanel>
              <UserList />
            </TabPanel>
            <TabPanel>
              <BorrowList />
            </TabPanel>
          </div>
        </Tabs>
      </div>
    </section>
  );
}
