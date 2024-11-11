import { useContext, useEffect, useState } from "react";

import { AuthContext } from "../store/auth-context";
import { fetchHistoryData } from "../util/http";
import HistoryList from "../components/History/HistoryList";

function HistoryScreen() {
  const [historyArray, setHistoryArray] = useState([]);
  const authCtx = useContext(AuthContext);

  useEffect(() => {
    const loadHistoryData = async () => {
      const data = await fetchHistoryData(authCtx.email, authCtx.token);
      setHistoryArray(data);
    };

    loadHistoryData();
  }, []);
  return <HistoryList items={historyArray} />;
}

export default HistoryScreen;
