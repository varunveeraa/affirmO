import { useEffect, useState } from "react";
import { Platform } from "react-native";

const useWebFocus = () => {
  const [focus, setFocus] = useState(
    Platform.OS === "web" ? document.hasFocus() : false
  );

  useEffect(() => {
    const onFocus = () => setFocus(true);
    const onBlur = () => setFocus(false);


  }, []);

  return focus;
};

export default useWebFocus;
