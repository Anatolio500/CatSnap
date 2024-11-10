import { createContext, useState } from "react";

export const UserContext = createContext({
  id: String,
  email: String,
  username: String,
  firstname: String,
  lastname: String,
  isAdmin: Boolean,
  setUser: (userData) => {},
});

function UserContextProvider({ children }) {
  const [id, setId] = useState();
  const [email, setEmail] = useState();
  const [username, setUsername] = useState();
  const [firstname, setFirstname] = useState();
  const [lastname, setLastname] = useState();
  const [isAdmin, setIsAdmin] = useState();

  function setUser(userData) {
    setId(userData.id);
    setEmail(userData.email);
    setUsername(userData.username);
    setFirstname(userData.firstname);
    setLastname(userData.lastname);
    setIsAdmin(userData.isAdmin);
  }

  const value = {
    id: id,
    email: email,
    username: username,
    firstname: firstname,
    lastname: lastname,
    isAdmin: isAdmin,
    setUser: setUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export default UserContextProvider;
