import React, { createContext, useState } from "react"

export const UserContext = React.createContext()

export default function ContextProvider({ children }) {
  const [currentUserId, setCurrentUserId] = useState('0')
  return (
    <UserContext.Provider
      value={[currentUserId, setCurrentUserId]}>
      {children}
    </UserContext.Provider>
  );
}
