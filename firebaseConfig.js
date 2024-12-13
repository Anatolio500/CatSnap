import firebase from "firebase/compat/app";
import "firebase/compat/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAsd9-_nsk1BFr3yf0PNEnwRCzMpJpQXlE",
  authDomain: "authentication-daf7d.firebaseapp.com",
  databaseURL:
    "https://authentication-daf7d-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "authentication-daf7d",
  storageBucket: "authentication-daf7d.firebasestorage.app",
  messagingSenderId: "971034979621",
  appId: "1:971034979621:web:f358af3c134aec91e67ecc",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export { firebase };
