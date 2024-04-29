// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import Constants from "expo-constants";

// Initialize Firebase
let app;
if (getApps().length === 0) {
  app = initializeApp(Constants.expoConfig.extra.firebase);
}

export const db = getFirestore(app);
