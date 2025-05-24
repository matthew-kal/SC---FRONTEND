import { createContext, useState } from 'react';

export const PatientContext = createContext();
const now = new Date();

export const PatientProvider = ({ children }) => {
    const [refresh, setRefresh] = useState(false);
    const [date, setDate] = useState(null)

    return (
        <PatientContext.Provider 
        value={{ 
            refresh, setRefresh, 
            date, setDate
            }}> 
          {children}
        </PatientContext.Provider>
      );
};