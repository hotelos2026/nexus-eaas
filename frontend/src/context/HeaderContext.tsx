"use client";
import { createContext, useContext, useState, ReactNode } from "react";

const HeaderContext = createContext<any>(null);

export function HeaderProvider({ children }: { children: ReactNode }) {
  const [headerExtra, setHeaderExtra] = useState<ReactNode>(null);
  return (
    <HeaderContext.Provider value={{ headerExtra, setHeaderExtra }}>
      {children}
    </HeaderContext.Provider>
  );
}

export const useHeader = () => useContext(HeaderContext);