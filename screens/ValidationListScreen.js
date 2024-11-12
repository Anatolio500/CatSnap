import { useNavigation } from "@react-navigation/native";
import Button from "../components/ui/Button";

function ValidationListScreen() {
  const navigation = useNavigation();
  function handleClick() {
    navigation.navigate("Validation item");
  }

  return <Button onPress={handleClick}>ASD</Button>;
}

export default ValidationListScreen;
