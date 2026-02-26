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

    const [user, setUser] = useState(null)
    const {currentUser} = useUserStore()

    const handleSearch = async e => {
        e.preventDefault()
        const formData = new FormData(e.target)
        // 获取username字段输入的内容
        const username = formData.get('username')

        try {
            const userRef = collection(db, "users")
            // 创建查询条件
            const q = query(userRef, where("username", "==", username))

            const querySnapShot = await getDocs(q)

            if (!querySnapShot.empty) {
                setUser(querySnapShot.docs[0].data())
            }
        } catch (err) {
            console.log(err)
        }
    }
    // 在数据库中创建一个新的聊天记录，并同时更新“发起者”和“接收者”两人的聊天列表。
    const handleAdd = async () => {
        const chatRef = collection(db, "chats");
        const userChatsRef = collection(db, "userchats");

        try {
            const newChatRef = doc(chatRef);

            await setDoc(newChatRef, {
                createdAt: serverTimestamp(),
                messages: [],
            });

            await updateDoc(doc(userChatsRef, user.id), {
                chats: arrayUnion({
                    chatId: newChatRef.id,
                    lastMessage: "",
                    receiverId: currentUser.id,
                    updatedAt: Date.now(),
                }),
            });

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
            <form onSubmit={handleSearch}>
<input type="text" placeholder='用户名' name='username' />
                <button type="submit">搜索</button>
            </form>
            {user && <div className="user">
                <div className="detail">
                    <img src={user.avatar || "./avatar.png"} alt="" />
                    <span>{user.username}</span>
                </div>
                <button onClick={handleAdd}>添加好友</button>
            </div>}
        </div>
    )
}

export default AddUser