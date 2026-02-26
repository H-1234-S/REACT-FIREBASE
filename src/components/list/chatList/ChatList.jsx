import { useEffect, useState } from "react";
import useUserStore from '../../../lib/userStore'
import "./chatList.css";
import AddUser from "./addUser/AddUser";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useChatStore } from "../../../lib/chatStore";
const ChatList = () => {
  const { currentUser } = useUserStore()
  const [addMode, setAddMode] = useState(false)
  const [chats, setChats] = useState([])
  const { changeChat } = useChatStore()
  useEffect(() => {
    const unSub = onSnapshot(
      doc(db, "userchats", currentUser.id),
      async (res) => {
        // 获取消息列表
        const items = res.data().chats
        // 遍历聊天列表，根据 ID 去用户表“抓取”每个人的头像、昵称等完整信息，并组合成一个最终的对象。
        // chats 存什么？
        const promises = items.map(async (item) => {
          // 向users集合中请求id为item.receiverId对应的文档
          const userDocRef = doc(db, "users", item.receiverId);
          // 获取到对应文档数据
          const userDocSnap = await getDoc(userDocRef);

          const user = userDocSnap.data();

          return { ...item, user };
        });
        // Promise.all并发请求
        // promise变量中存的不是数据，而是逻辑任务
        const chatData = await Promise.all(promises);
        // 按照时间排序
        setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));

      })

    return () => {
      unSub()
    }
  }, [currentUser.id])

  const handleSelect = async ({chatId,user}) => {
    changeChat(chatId,user)
  }

  return (
    <div className="chatList">
      <div className="search">
        <div className="searchBar">
          <img src="./search.png" alt="" />
          <input
            type="text"
            placeholder="搜索"
          />
        </div>
        <img
          src={addMode ? "./minus.png" : "./plus.png"}
          alt=""
          className="add"
          onClick={() => setAddMode((prev) => !prev)}
        />
      </div>
      {
        chats.map((chat) => (
          <div className="item" key={chat.chatId} onClick={() => handleSelect(chat)}>
            <img
              src="./avatar.png"
              alt=""
            />
            <div className="texts">
              <span>{chat.user.username}</span>
              <p>{chat.lastMessage}</p>
            </div>
          </div>
        ))
      }
      
      {addMode && <AddUser />}
    </div>
  );
};

export default ChatList;
