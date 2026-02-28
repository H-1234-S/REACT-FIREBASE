/**
 * Firebase 初始化配置
 * [数据源] -> [应用程序]
 * 
 * 初始化以下 Firebase 服务：
 * - Authentication: 用户认证
 * - Firestore: 实时数据库
 * - Storage: 文件存储
 * - Analytics: 流量分析
 */
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "react-firebase-chat-fbfe5.firebaseapp.com",
  projectId: "react-firebase-chat-fbfe5",
  storageBucket: "react-firebase-chat-fbfe5.firebasestorage.app",
  messagingSenderId: "11260171465",
  appId: "1:11260171465:web:5f1c7f101f84bcc8362918",
  measurementId: "G-MHXVQXK863"
};

// 初始化 Firebase 应用实例
const app = initializeApp(firebaseConfig);

// 流量分析服务
const analytics = getAnalytics(app);

// [Firebase] -> 导出 auth 服务（用户认证）
export const auth = getAuth(app);

// [Firebase] -> 导出 db 服务（Firestore 数据库）
export const db = getFirestore(app);

// [Firebase] -> 导出 storage 服务（文件存储）- 当前未启用
// export const storage = getStorage(app)
