import { createContext, useContext, useState } from "react";

const TokkerConfigContext = createContext(null);

export function TokkerConfigProvider({ children }) {
  const [config, setConfig] = useState(null);
  return (
    <TokkerConfigContext.Provider value={{ config, setConfig }}>
      {children}
    </TokkerConfigContext.Provider>
  );
}

export function useTokkerConfig() {
  return useContext(TokkerConfigContext);
}