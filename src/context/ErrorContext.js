import { createContext, useState } from 'react';

const ErrorContext = createContext();

const ErrorProvider = ({ children }) => {
  
  const [errors, setErrors] = useState([]);

  // reportErrors: add an error message to the errors state
  const reportErrors = (key, error) => {
    setErrors((prevErrors) => {
      return {
        ...prevErrors,
        [key]: error,
      };
    });
  };

  // clearErrors: remove an error message from the errors state
  const clearErrors = (key) => {
    setErrors((prevErrors) => {
      const newErrors = {...prevErrors };
      delete newErrors[key];
      return newErrors;
    });
  };


  return (
    <ErrorContext.Provider
      value={{ 
        errors,
        reportErrors,
        clearErrors
      }}
    >
      {children}
    </ErrorContext.Provider>
  );
};

export { ErrorContext, ErrorProvider };
export default ErrorContext;
