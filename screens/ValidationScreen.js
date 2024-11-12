import { useNavigation } from "@react-navigation/native";
import { Text, View, TouchableOpacity } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

function ValidationScreen() {
  const navigation = useNavigation();

  function handleArrowPress() {
    navigation.navigate("Validation list");
  }
  return (
    <View>
      <TouchableOpacity onPress={handleArrowPress}>
        <Ionicons name="arrow-back-outline" size={40} color="black" />
      </TouchableOpacity>
      <Text>Validation</Text>
    </View>
  );
}

export default ValidationScreen;
