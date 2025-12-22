import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

// TODO: 請將此處替換為您從 Firebase Console 取得的設定
// Go to Firebase Console -> Project Settings -> General -> Your apps -> SDK setup and configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Check if the config is still using placeholders
export const isFirebaseConfigured = 
  firebaseConfig.apiKey !== "YOUR_API_KEY" && 
  firebaseConfig.projectId !== "YOUR_PROJECT_ID";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);

if (!isFirebaseConfigured) {
  console.warn("⚠️ Firebase 尚未設定：將使用 LocalStorage 模式運行 (僅本機儲存)。請至 firebaseConfig.ts 更新您的金鑰以啟用雲端備份。");
}

export { db, storage, functions };