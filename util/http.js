import axios from "axios";

const BACKEND_URL =
  "https://authentication-daf7d-default-rtdb.europe-west1.firebasedatabase.app";

// Users

export async function createUserData(userData, token) {
  const response = await axios.post(
    BACKEND_URL + "/users.json?auth=" + token,
    userData
  );
  const id = response.data.name;
  return id;
}

export async function fetchUserData(email, token) {
  const response = await axios.get(BACKEND_URL + "/users.json?auth=" + token);
  const users = response.data;

  for (const key in users) {
    if (users[key].email === email) return { id: key, ...users[key] };
  }
}

export async function updateUserData(id, token, userData) {
  return axios.patch(BACKEND_URL + `/users/${id}.json?auth=` + token, userData);
}

// export function deleteUserData(id) {
//   return axios.delete(BACKEND_URL + `/users/${id}.json`);
// }

// Image Validation

export async function createStaffPicture(Data, token) {
  const response = await axios.post(
    BACKEND_URL + "/validation.json?auth=" + token,
    Data
  );
  const id = response.data.name;
  return id;
}
