import { createContext, useState, useCallback } from "react";
const ErrorContext = createContext();
const ErrorProvider = ({ children }) => {
  const [errors, setErrors] = useState({});
  const reportErrors = useCallback(
    (key, error) => setErrors((current) => ({ ...current, [key]: error })),
    [],
  );
  const clearErrors = useCallback(
    (key) =>
      setErrors((current) => {
        if (!(key in current)) return current;
        const next = { ...current };
        delete next[key];
        return next;
      }),
    [],
  );
  return (
    <ErrorContext.Provider value={{ errors, reportErrors, clearErrors }}>
      {children}
    </ErrorContext.Provider>
  );
};
export { ErrorContext, ErrorProvider };
export default ErrorContext;
