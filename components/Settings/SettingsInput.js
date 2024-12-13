import { StyleSheet, Text, TextInput, View } from "react-native";

import { Colors } from "../../constants/styles";

function SettingsInput({
  label,
  keyboardType,
  onUpdateValue,
  value,
  editable,
}) {
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        autoCapitalize="none"
        editable={editable}
        keyboardType={keyboardType}
        onChangeText={onUpdateValue}
        value={value}
      />
    </View>
  );
}

export default SettingsInput;

const styles = StyleSheet.create({
  inputContainer: {
    marginVertical: 8,
  },
  label: {
    color: "white",
    marginBottom: 4,
  },
  input: {
    paddingVertical: 8,
    paddingHorizontal: 6,
    backgroundColor: Colors.primary100,
    borderRadius: 4,
    fontSize: 16,
  },
});
