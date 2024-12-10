import { FlatList, StyleSheet, View } from "react-native";

import HistoryItem from "./HistoryItem";

function HistoryList({ items }) {
  function renderHistoryItem(itemData) {
    const item = itemData.item;

    const historyItemProps = {
      id: item.id,
      imageUrl: item.imageUrl,
      predictedBreed: item.predictedBreed,
      predictionCorrect: item.predictionCorrect,
    };

    return (
      <HistoryItem
        id={historyItemProps.id}
        imageUrl={historyItemProps.imageUrl}
        predictedBreed={historyItemProps.predictedBreed}
        predictionCorrect={historyItemProps.predictionCorrect}
      />
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderHistoryItem}
      />
    </View>
  );
}

export default HistoryList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});
