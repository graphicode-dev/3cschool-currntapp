// LoadingScopeContext.tsx

import React, { createContext, useContext } from "react";

type LoadingScopeState = {
    isLoading: boolean;
};

const LoadingScopeContext = createContext<LoadingScopeState>({
    isLoading: false,
});

export const LoadingScopeProvider: React.FC<
    React.PropsWithChildren<LoadingScopeState>
> = ({ isLoading, children }) => {
    return (
        <LoadingScopeContext.Provider value={{ isLoading }}>
            {children}
        </LoadingScopeContext.Provider>
    );
};

export const useLoadingScope = () => useContext(LoadingScopeContext);
