import { useEffect } from "react";
import useErrorContext from "../hook/useErrorContext";

const ErrorDisplay = ({ pageKey }) => {
  const { errors, clearErrors } = useErrorContext();

  // erase the displayed error message after 5 seconds
  useEffect(() => {
    if (errors) {
      const timer = setTimeout(() => {
        // clear the error message after 5 seconds
        clearErrors(pageKey);
      }, 5000); // 5000 milliseconds
        // cleanup function
        return () => {
          clearTimeout(timer);
        }
    }
  }, [clearErrors, errors, pageKey]);

  return (
    errors ? <div style={{color: 'red', paddingTop: 20, paddingBottom: 20, fontSize: 20}}>
    {errors[pageKey]}
  </div> : <div>No errors</div>

  );
};

export default ErrorDisplay;