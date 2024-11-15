import { useState, useContext, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";

import { AuthContext } from "../store/auth-context";
import LoadingOverlay from "../components/ui/LoadingOverlay";
import { fetchValidationImages } from "../util/http";
import ValidationList from "../components/Validation/ValidationList";

function ValidationListScreen() {
  const [validationArray, setValidationArray] = useState([]);
  const [loading, setLoading] = useState(false);

  const authCtx = useContext(AuthContext);

  useFocusEffect(
    useCallback(() => {
      const loadingValidationData = async () => {
        setLoading(true);
        const data = await fetchValidationImages(authCtx.token);
        console.log(data);
        setValidationArray(data);
        setLoading(false);
      };

      loadingValidationData();

      return () => {};
    }, [authCtx.token])
  );

  if (loading) {
    return <LoadingOverlay message={"Loading data"} />;
  }

  return <ValidationList items={validationArray} />;
}

export default ValidationListScreen;
