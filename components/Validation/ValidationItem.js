import { View, TouchableOpacity, Image, Text, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { Colors } from "../../constants/styles";

function ValidationItem({ id, imageUrl, predictedBreed }) {
  const navigation = useNavigation();

  function handlePress() {
    navigation.navigate("Validation item", { validationId: id });
  }

  return (
    <View style={styles.validationItem}>
      <TouchableOpacity onPress={handlePress}>
        <View style={styles.innerContainer}>
          <Image source={{ uri: imageUrl }} style={styles.image} />
          <Text style={styles.title}>{predictedBreed}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

export default ValidationItem;

const styles = StyleSheet.create({
  validationItem: {
    margin: 16,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: Colors.primary800,
    elevation: 4,
  },
  innerContainer: {
    alignItems: "center",
    justifyContent: "center",
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
