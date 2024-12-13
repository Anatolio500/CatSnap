import { View, StyleSheet } from "react-native";

import { Colors } from "../../constants/styles";
import SettingsForm from "./SettingsForm";
function SettingsContent() {
  return (
    <View style={styles.userContent}>
      <SettingsForm />
    </View>
  );
}
export default SettingsContent;

const styles = StyleSheet.create({
  userContent: {
    marginTop: 64,
    marginHorizontal: 32,
    padding: 16,
    borderRadius: 8,
    backgroundColor: Colors.primary800,
    elevation: 2,
    shadowColor: "black",
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
  },
});
