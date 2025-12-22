
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

// 注意：在 Vercel 上發布時，請務必在 Vercel Dashboard 設定對應的環境變數
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// 檢查是否已填寫正確的 Firebase 配置
export const isFirebaseConfigured = 
  firebaseConfig.apiKey !== "" && 
  firebaseConfig.apiKey !== "YOUR_API_KEY" && 
  firebaseConfig.projectId !== "YOUR_PROJECT_ID";

let db: any;
let storage: any;
let functions: any;

if (isFirebaseConfigured) {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  storage = getStorage(app);
  functions = getFunctions(app);
} else {
  console.warn("⚠️ Firebase 尚未設定：將使用 LocalStorage 模式運行 (僅本機儲存)。");
}

export { db, storage, functions };
