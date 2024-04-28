// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import Constants from "expo-constants";

// Initialize Firebase
let app;
if (!initializeApp.length) {
  app = initializeApp(Constants.expoConfig.extra.firebase);
}

export const db = getFirestore(app);
