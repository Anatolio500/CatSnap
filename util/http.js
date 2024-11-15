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

// History

export async function createHistoryData(historyData, token) {
  const response = await axios.post(
    BACKEND_URL + "/historys.json?auth=" + token,
    historyData
  );
  const id = response.data.name;
  return id;
}

export async function fetchHistoryData(email, token) {
  const response = await axios.get(
    BACKEND_URL + "/historys.json?auth=" + token
  );
  const historyData = response.data;
  const responseArray = [];

  for (const key in historyData) {
    if (historyData[key].email === email)
      responseArray.push({ id: key, ...historyData[key] });
  }

  return responseArray;
}

// Validation

export async function createValidationImage(data, token) {
  const response = await axios.post(
    BACKEND_URL + "/validation.json?auth=" + token,
    data
  );
  const id = response.data.name;
  return id;
}

export async function fetchValidationImages(token) {
  const response = await axios.get(
    BACKEND_URL + "/validation.json?auth=" + token
  );

  const validationData = response.data;
  const responseArray = [];

  for (const key in validationData) {
    responseArray.push({ id: key, ...validationData[key] });
  }

  return responseArray;
}

export async function fetchValidationImage(id, token) {
  const response = await axios.get(
    BACKEND_URL + `/validation/${id}.json?auth=` + token
  );

  return response.data;
}

export async function deleteValidationImage(id, token) {
  const response = await axios.delete(
    BACKEND_URL + `/validation/${id}.json?auth=` + token
  );

  return response.data;
}
