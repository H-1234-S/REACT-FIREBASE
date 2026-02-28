/**
 * 用户状态管理（Zustand 全局 Store）
 * [Firestore: users 集合] -> [currentUser]
 * 
 * 状态：
 * - currentUser: 当前登录用户信息（来自全局 Store）
 * - isLoading: 用户信息加载状态（局部 State）
 */
import { doc, getDoc } from "firebase/firestore";
import { create } from "zustand";
import { db } from "./firebase";

const useUserStore = create((set) => ({
  // [Zustand 全局状态] 当前登录用户，初始为 null
  currentUser: null,
  // [局部 State] 加载状态，初始为 true
  isLoading: true,

  /**
   * 获取用户信息
   * [Firestore: users 集合] -> [currentUser]
   * @param {string} uid - 用户 ID
   */
  fetchUserInfo: async (uid) => {
    // 用户未登录时，重置状态
    if (!uid) return set({ currentUser: null, isLoading: false });

    try {
      // [Firebase Firestore] 读取 users 集合中指定 uid 的文档
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);

      // 判断文档是否存在
      if (docSnap.exists()) {
        // [Firestore: users 集合] -> [currentUser]
        set({ currentUser: docSnap.data(), isLoading: false });
      } else {
        set({ currentUser: null, isLoading: false });
      }
    } catch (err) {
      console.log(err);
      return set({ currentUser: null, isLoading: false });
    }
  },
}));

export default useUserStore
