"use client";

import { useState } from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";

import AddBook from "@/components/addBook";
import UpdateBook from "@/components/updateBook";
import UserList from "@/components/userList";
import BorrowList from "@/components/borrowList";
import BookList from "@/components/bookList";
import ReservationList from "@/components/reservationList";
import PaymentList from "@/components/paymentList";

export default function Dashboard() {
  const tabNames = [
    "Users",
    "Borrows",
    "Books",
    "Reservations",
    "Payments",
    "Add Book",
    "Update Book",
  ];
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [updateBookID, setUpdateBookID] = useState(null); // store selected book
  return (
    <section className="pt-24 md:pt-32 xl:px-20 lg:px-20 px-4">
      <div className="bg-white border border-blue-100 shadow-lg p-5 my-10">
        <Tabs
          selectedIndex={selectedIndex}
          onSelect={(index) => setSelectedIndex(index)}
        >
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
              <UserList />
            </TabPanel>
            <TabPanel>
              <BorrowList />
            </TabPanel>
            <TabPanel>
              <BookList
                setSelectedIndex={setSelectedIndex}
                setUpdateBookID={setUpdateBookID}
              />
            </TabPanel>
            <TabPanel>
              <ReservationList />
            </TabPanel>
            <TabPanel>
              <PaymentList />
            </TabPanel>
            <TabPanel>
              <AddBook />
            </TabPanel>
            <TabPanel>
              <UpdateBook updateBookID={updateBookID} />
            </TabPanel>
          </div>
        </Tabs>
      </div>
    </section>
  );
}
