import { useEffect } from "react";
import useErrorContext from "../hook/useErrorContext";

const ErrorDisplay = ({ pageKey }) => {
  const { errors, clearErrors } = useErrorContext();

  // erase the displayed error message after 5 seconds
  useEffect(() => {
    if (errors[pageKey]) {
      const timer = setTimeout(() => {
        // clear the error message after 5 seconds
        clearErrors(pageKey);
      }, 5000); // 5000 milliseconds
      // cleanup function
      return () => {
        clearTimeout(timer);
      };
    }
  }, [clearErrors, errors, pageKey]);

  return errors[pageKey] ? (
    <div
      role="alert"
      style={{ color: "red", paddingTop: 20, paddingBottom: 20, fontSize: 20 }}
    >
      {errors[pageKey]}
    </div>
  ) : null;
};

export default ErrorDisplay;
