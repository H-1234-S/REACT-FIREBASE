// zustand管理全局user状态
import { doc, getDoc } from "firebase/firestore";
import { create } from "zustand";
import { db } from "./firebase";

const useUserStore = create((set) => ({
    currentUser: null,
    isLoading: true,

    fetchUserInfo: async (uid) => {
        // 用户未登录时
        if (!uid) return set({ currentUser: null, isLoading: false });

        try {
            // 获取users集合下的uid属性
            const docRef = doc(db, "users", uid);
            // 获取对应uid数据
            const docSnap = await getDoc(docRef);

            // 判断有无对应uid的数据
            if (docSnap.exists()) {
                // docSnap.data()获取用户对应信息
                set({ currentUser: docSnap.data(), isLoading: false });
            } else {
                set({ currentUser: null, isLoading: false });
            }
        } catch (err) {
            console.log(err);
            return set({ currentUser: null, isLoading: false });
        }
    },
}))
export default useUserStore