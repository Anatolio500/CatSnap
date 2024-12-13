import { View, StyleSheet, Alert } from "react-native";
import { useState, useContext } from "react";

import Button from "../ui/Button";
import LoadingOverlay from "../ui/LoadingOverlay";
import SettingsInput from "./SettingsInput";
import { UserContext } from "../../store/user-context";
import { updateUserData } from "../../util/http";
import { AuthContext } from "../../store/auth-context";

function SettingsForm() {
  const authCtx = useContext(AuthContext);
  const userCtx = useContext(UserContext);

  const [emailAddress, setEmailAddress] = useState(userCtx.email);
  const [username, setUsername] = useState(userCtx.username);
  const [firstname, setFirstname] = useState(userCtx.firstname);
  const [lastname, setLastname] = useState(userCtx.lastname);

  const [isUpdating, setIsUpdating] = useState(false);

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

  async function submitHandler() {
    setIsUpdating(true);
    try {
      const userData = {
        username: username,
        firstname: firstname,
        lastname: lastname,
      };

      await updateUserData(userCtx.id, authCtx.token, userData);

      Alert.alert("Update successfull");
    } catch (error) {
      Alert.alert(
        "Update failed",
        "Could not update user. Please check your input and try again later!"
      );
    }
    setIsUpdating(false);
  }

  if (isUpdating) {
    return <LoadingOverlay message={"Updating user..."} />;
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
        <View style={styles.button}>
          <Button onPress={submitHandler}>Update</Button>
        </View>
      </View>
    </View>
  );
}

export default SettingsForm;

const styles = StyleSheet.create({
  button: {
    marginTop: 12,
  },
});
