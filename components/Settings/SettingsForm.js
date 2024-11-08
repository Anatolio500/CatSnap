import { View, StyleSheet } from "react-native";
import { useState, useContext } from "react";

import Button from "../ui/Button";
import SettingsInput from "./SettingsInput";
import { UserContext } from "../../store/user-context";

function SettingsForm() {
  const userCtx = useContext(UserContext);
  console.log(userCtx);

  const [emailAddress, setEmailAddress] = useState(userCtx.email);
  const [username, setUsername] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");

  function updateInputValueHandler(inputType, enteredValue) {
    switch (inputType) {
      case "email":
        setEmailAddress(enteredValue);
        break;
      case "username":
        setUsername(enteredValue);
        break;
      case "firstname":
        setFirstname(enteredValue);
        break;
      case "lastname":
        setLastname(enteredValue);
        break;
    }
  }

  function submitHandler() {
    console.log(userCtx.id);
    console.log(userCtx.email);
  }

  return (
    <View>
      <View>
        <SettingsInput
          label={"Email Address"}
          onUpdateValue={updateInputValueHandler.bind(this, "email")}
          value={emailAddress}
          keyboardType="email-address"
          editable={false}
        />
        <SettingsInput
          label={"Username"}
          onUpdateValue={updateInputValueHandler.bind(this, "username")}
          value={username}
          keyboardType="email-address"
          editable={true}
        />
        <SettingsInput
          label={"Firstname"}
          onUpdateValue={updateInputValueHandler.bind(this, "firstname")}
          value={firstname}
          keyboardType="email-address"
          editable={true}
        />
        <SettingsInput
          label={"Lastname"}
          onUpdateValue={updateInputValueHandler.bind(this, "lastname")}
          value={lastname}
          keyboardType="email-address"
          editable={true}
        />
        <View style={styles.buttons}>
          <Button onPress={submitHandler}>Update</Button>
        </View>
      </View>
    </View>
  );
}

export default SettingsForm;

const styles = StyleSheet.create({
  buttons: {
    marginTop: 12,
  },
});
