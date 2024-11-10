import HistoryList from "../components/History/HistoryList";

const dummyArray = [
  {
    id: 1,
    imageUrl: require("../pictures/Bengal/Bengal_001.jpg"),
    predictedBreed: "Bengal",
  },
  {
    id: 2,
    imageUrl: require("../pictures/Bombay/Bombay_001.jpg"),
    predictedBreed: "Bombay",
  },
  {
    id: 3,
    imageUrl: require("../pictures/British_Shorthair/British_Shorthair_001.jpg"),
    predictedBreed: "British Shorthair",
  },
];

function HistoryScreen() {
  return <HistoryList items={dummyArray} />;
}

export default HistoryScreen;
