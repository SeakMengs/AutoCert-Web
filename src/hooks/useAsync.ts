"use client";
import { T_ZodErrorFormatted } from "@/utils/error";
import { createScopedLogger } from "@/utils/logger";
import { ResponseJson, responseSomethingWentWrong } from "@/utils/response";
import { useCallback, useEffect, useRef, useState } from "react";

const logger = createScopedLogger("src:hooks:useAsync");

export default function useAsync<
  P = void,
  T = any,
  E = T_ZodErrorFormatted | undefined,
>(
  cb: (params: P) => Promise<ResponseJson<T, E>>,
  { defaultLoading = false } = {},
) {
  const [data, setData] = useState<T>();
  const [loading, setLoading] = useState<boolean>(defaultLoading);
  const [error, setError] = useState<E>();

  const reset = useCallback(() => {
    setData(undefined);
    setLoading(false);
    setError(undefined);
  }, []);

  const fetchData = useCallback(
    async (params: P): Promise<ResponseJson<T, E>> => {
      setLoading(true);

      try {
        const response = await cb(params);

        if (!response.success) {
          setError(response.errors as E);
          return response;
        }

        setData(response.data);
        setError(undefined);
        return response;
      } catch (error) {
        setError(error as E);
        logger.error("Error in async operation", error);
        return responseSomethingWentWrong(
          "Something went wrong in useAsync fetch data operation",
        ) as ResponseJson<T, E>;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    data,
    loading,
    error,
    fetch: fetchData,
    reset,
  };
}
