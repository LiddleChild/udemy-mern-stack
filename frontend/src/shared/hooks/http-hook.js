import { useState, useCallback, useRef, useEffect } from "react";

export const useHTTPClient = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();

  const activeHTTPRequests = useRef([]);

  const sendRequest = useCallback(async (url, method="GET", body, headers={}) => {
    setIsLoading(true);
    const httpAbortController = new AbortController();
    activeHTTPRequests.current.push(httpAbortController);

    try {
      const response = await fetch(url, {
        method,
        body,
        headers,
        signal: httpAbortController.signal
      });
      
      const responseData = await response.json();
      
      activeHTTPRequests.current = activeHTTPRequests.current.filter(ctrl => ctrl !== httpAbortController);
      
      if (!response.ok) {
        throw new Error(responseData.message);
      }

      setIsLoading(false);
      return responseData;
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      throw err;
    }
  }, []);

  const clearError = () => setError(null);

  useEffect(() => {
    return () => {
      activeHTTPRequests.current.forEach(ctrl => ctrl.abort());
    }
  }, []);

  return { isLoading, error, sendRequest, clearError };
};