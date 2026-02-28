/**
 * 添加用户组件
 * 
 * 功能：
 * - 搜索用户名查找用户
 * - 创建新的聊天会话
 * - 同时在双方的用户聊天列表中添加记录
 */
import "./addUser.css";
import { db } from "../../../../lib/firebase";
import {
    arrayUnion,
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where,
} from "firebase/firestore";
import { useState } from "react";
import useUserStore from "../../../../lib/userStore";


const AddUser = () => {
    // [局部 State] 搜索到的用户信息
    const [user, setUser] = useState(null)
    // [Zustand 全局状态] 当前登录用户
    const {currentUser} = useUserStore()

    /**
     * 搜索用户
     * [用户输入用户名并搜索] -> [查询 Firestore: users 集合]
     */
    const handleSearch = async e => {
        e.preventDefault()
        const formData = new FormData(e.target)
        // 获取用户名
        const username = formData.get('username')

        try {
            // [Firebase Firestore] 查询 users 集合
            const userRef = collection(db, "users")
            // 创建查询条件：username 等于输入的用户名
            const q = query(userRef, where("username", "==", username))

            const querySnapShot = await getDocs(q)

            // 找到匹配的用户
            if (!querySnapShot.empty) {
                // [Firestore: users 集合] -> [user (局部 State)]
                setUser(querySnapShot.docs[0].data())
            }
        } catch (err) {
            console.log(err)
        }
    }

    /**
     * 添加用户（创建聊天）
     * [用户点击添加好友] -> [创建 Firestore: chats 集合 + 更新 userchats 集合]
     */
    const handleAdd = async () => {
        // [Firebase Firestore] 引用 chats 集合
        const chatRef = collection(db, "chats");
        // [Firebase Firestore] 引用 userchats 集合
        const userChatsRef = collection(db, "userchats");

        try {
            // 创建新的聊天室文档
            // [用户点击添加好友] -> [创建 Firestore: chats 集合]
            const newChatRef = doc(chatRef);

            // 初始化聊天室数据
            await setDoc(newChatRef, {
                createdAt: serverTimestamp(),
                messages: [],
            });

            // 更新接收方的用户聊天列表
            // [用户点击添加好友] -> [更新 Firestore: userchats 集合（接收方）]
            await updateDoc(doc(userChatsRef, user.id), {
                chats: arrayUnion({
                    chatId: newChatRef.id,
                    lastMessage: "",
                    receiverId: currentUser.id,
                    updatedAt: Date.now(),
                }),
            });

            // 更新发起方的用户聊天列表
            // [用户点击添加好友] -> [更新 Firestore: userchats 集合（发起方）]
            await updateDoc(doc(userChatsRef, currentUser.id), {
                chats: arrayUnion({
                    chatId: newChatRef.id,
                    lastMessage: "",
                    receiverId: user.id,
                    updatedAt: Date.now(),
                }),
            });
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div className="addUser">
            {/* 搜索表单 */}
            <form onSubmit={handleSearch}>
                <input type="text" placeholder='用户名' name='username' />
                <button type="submit">搜索</button>
            </form>
            
            {/* 显示搜索结果 */}
            {user && <div className="user">
                <div className="detail">
                    <img src={user.avatar || "./avatar.png"} alt="" />
                    <span>{user.username}</span>
                </div>
                {/* 添加按钮 */}
                <button onClick={handleAdd}>添加好友</button>
            </div>}
        </div>
    )
}

export default AddUser
