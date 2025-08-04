import { createContext, useState, useEffect } from 'react';
import { getSecureItem } from './Memory';

export const TokenContext = createContext();

export const TokenProvider = ({ children }) => {
    const [userType, setUserType] = useState("");
    const [isInitialized, setIsInitialized] = useState(false);

    // Initialize userType based on stored tokens
    useEffect(() => {
        const initializeUserType = async () => {
            try {
                const accessPatient = await getSecureItem('accessPatient');
                const refreshPatient = await getSecureItem('refreshPatient');
                const accessNurse = await getSecureItem('accessNurse');
                const refreshNurse = await getSecureItem('refreshNurse');

                // Determine user type based on stored tokens
                if (accessPatient && refreshPatient) {
                    setUserType('patient');
                } else if (accessNurse && refreshNurse) {
                    setUserType('nurse');
                } else {
                    setUserType('');
                }
            } catch (error) {
                console.error('Error initializing user type:', error);
                setUserType('');
            } finally {
                setIsInitialized(true);
            }
        };

        initializeUserType();
    }, []);

    return (
        <TokenContext.Provider 
        value={{ 
            userType, 
            setUserType,
            isInitialized
            }}> 
          {children}
        </TokenContext.Provider>
      );
};