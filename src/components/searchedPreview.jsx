// import React, { useContext, useEffect, useState } from "react";
// import fetchedData from "./Components/fetchedData/fetchedData";
// import { UserContext } from "./Components/Contexts/UserContext";
// import { Link } from "react-router-dom";
// function SearchedPreview({ value}) {
//   const [filteredUsers, setFilteredUsers] = useState([]);
//   const { users, setUsers } = useContext(UserContext);
//   useEffect(() => {
//     const getData = async () => {
//       if (value.trim() === "") {
//         setUsers([]);
//         return;
//       }
//       const data = await fetchedData(value);
//       setUsers(data);
//     };
//     getData();
//   }, [value]);


//   useEffect(() => {
//     if (users.length > 0) {
//       const filtered = users
//         .filter((user) => user.name.toLowerCase().includes(value.toLowerCase()))
//         .sort((a, b) => a.name.localeCompare(b.name));
//       setFilteredUsers(filtered);
//     } else {
//       setFilteredUsers([]);
//     }
//   }, [value, users]);

//   return (
//     <div className={filteredUsers.length > 0 ? `font-secondary min-w-150 border h-50 overflow-y-scroll mt-4` : `hidden`}>
//         <ul className="shadow-xl">
//           {filteredUsers.map((user) => (
//             <li
//               key={user.id}
//               className="h-10 border-b items-center flex pl-2 hover:bg-gray-100 cursor-pointer"
//             >
//               <Link to={`userprofile/${user.id}`}>
//                 {user.name} - {user.email} - {user.id}
//               </Link>
//             </li>
//           ))}
//         </ul>
//     </div>
//   );
// }

// export default SearchedPreview;