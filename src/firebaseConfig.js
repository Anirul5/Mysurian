// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyANMLjscPssWyu6fJR15JcP2AL_8Xwocv4",
  authDomain: "mysurian09.firebaseapp.com",
  projectId: "mysurian09",
  storageBucket: "mysurian09.firebasestorage.app",
  messagingSenderId: "902034144498",
  appId: "1:902034144498:web:b7f36d60091e175455246b",
  measurementId: "G-BMT9DTZ18X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app); // Export Firestore database instance