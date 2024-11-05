import { createContext, useState } from "react";

export const UserContext = createContext({
  id: String,
  email: String,
  isAdmin: Boolean,
  setUser: (email, isAdmin) => {},
});

function UserContextProvider({ children }) {
  const [id, setId] = useState();
  const [email, setEmail] = useState();
  const [isAdmin, setIsAdmin] = useState();

  function setUser(userData) {
    setId(userData.id);
    setEmail(userData.email);
    setIsAdmin(userData.isAdmin);
  }

  const value = {
    id: id,
    email: email,
    isAdmin: isAdmin,
    setUser: setUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export default UserContextProvider;
