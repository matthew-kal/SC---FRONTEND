import { createContext, useState } from 'react';

export const TokenContext = createContext();

export const TokenProvider = ({ children }) => {
    const [userType, setUserType] = useState("");

    return (
        <TokenContext.Provider 
        value={{ 
            userType, setUserType,
            }}> 
          {children}
        </TokenContext.Provider>
      );
};