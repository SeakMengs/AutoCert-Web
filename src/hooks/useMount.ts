import { useEffect, useRef } from "react";

export default function useMount() {
  const mounted = useRef<boolean>(false);

  useEffect(() => {
    mounted.current = true;

    return () => {
      mounted.current = false;
    };
  }, []);
  return mounted;
}