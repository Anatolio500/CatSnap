import React, { useContext, useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";

import { AuthContext } from "../store/auth-context";
import { fetchAllHistoryData } from "../util/http";
import HistoryList from "../components/History/HistoryList";
import LoadingOverlay from "../components/ui/LoadingOverlay";

function HistoryScreen() {
  const [historyArray, setHistoryArray] = useState([]);
  const [loading, setLoading] = useState(false);

  const authCtx = useContext(AuthContext);

  useFocusEffect(
    useCallback(() => {
      const loadHistoryData = async () => {
        setLoading(true);
        const data = await fetchAllHistoryData(authCtx.email, authCtx.token);
        console.log(data);
        setHistoryArray(data);
        setLoading(false);
      };

      loadHistoryData();
    }, [authCtx.email, authCtx.token])
  );

  if (loading) {
    return <LoadingOverlay message={"Loading data"} />;
  }

  return <HistoryList items={historyArray} />;
}

export default HistoryScreen;
