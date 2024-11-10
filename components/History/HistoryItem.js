import { Pressable, StyleSheet, Text, View, Image } from "react-native";
import { Colors } from "../../constants/styles";

function HistoryItem({ imageUrl, predictedBreed }) {
  console.log(imageUrl);
  return (
    <View style={styles.historyItem}>
      <Pressable
        style={({ pressed }) => (pressed ? styles.buttonPressed : null)}
      >
        <View>
          <Image source={imageUrl} style={styles.image} />
          <Text style={styles.title}>{predictedBreed}</Text>
        </View>
      </Pressable>
    </View>
  );
}

export default HistoryItem;

const styles = StyleSheet.create({
  historyItem: {
    margin: 16,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: Colors.primary800,
    elevation: 4,
  },
  buttonPressed: {
    opacity: 0.5,
  },
  innerContainer: {
    borderRadius: 8,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 200,
  },
  title: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 18,
    margin: 8,
  },
});
