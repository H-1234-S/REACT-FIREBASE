import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
const firebaseConfig = {
  apiKey:import.meta.env.VITE_API_KEY,
  authDomain: "react-firebase-chat-fbfe5.firebaseapp.com",
  projectId: "react-firebase-chat-fbfe5",
  storageBucket: "react-firebase-chat-fbfe5.firebasestorage.app",
  messagingSenderId: "11260171465",
  appId: "1:11260171465:web:5f1c7f101f84bcc8362918",
  measurementId: "G-MHXVQXK863"
};

// 启动firebase服务
const app = initializeApp(firebaseConfig);
// 流量监控
const analytics = getAnalytics(app);
// 登录验证
export const auth = getAuth(app);
// 连接数据库
export const db = getFirestore(app);
// 连接Storage服务
// export const storage = getStorage(app)