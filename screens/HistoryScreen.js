import { useContext, useEffect, useState } from "react";

import { AuthContext } from "../store/auth-context";
import { fetchHistoryData } from "../util/http";
import HistoryList from "../components/History/HistoryList";
import LoadingOverlay from "../components/ui/LoadingOverlay";

function HistoryScreen() {
  const [historyArray, setHistoryArray] = useState([]);
  const [loading, setLoading] = useState(false);

  const authCtx = useContext(AuthContext);

  useEffect(() => {
    const loadHistoryData = async () => {
      setLoading(true);
      const data = await fetchHistoryData(authCtx.email, authCtx.token);
      console.log(data);
      setHistoryArray(data);
      setLoading(false);
    };

    loadHistoryData();
  }, []);

  if (loading) {
    return <LoadingOverlay message={"Loading data"} />;
  }

  return <HistoryList items={historyArray} />;
}

export default HistoryScreen;
