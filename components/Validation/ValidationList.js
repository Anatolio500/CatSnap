import { FlatList, StyleSheet, View } from "react-native";

import ValidationItem from "./ValidationItem";

function ValidationList({ items }) {
  function renderValidationItem(itemData) {
    const item = itemData.item;

    const validationItemProps = {
      id: item.id,
      imageUrl: item.imageUrl,
      predictedBreed: item.prediction || "No label",
    };

    return (
      <ValidationItem
        id={validationItemProps.id}
        imageUrl={validationItemProps.imageUrl}
        predictedBreed={validationItemProps.predictedBreed}
      />
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderValidationItem}
      />
    </View>
  );
}

export default ValidationList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});
