/**
 * 聊天列表组件
 * 
 * 功能：
 * - 显示当前用户的聊天会话列表
 * - 实时监听用户聊天列表变化
 * - 点击聊天项进入对应聊天室
 * - 标记已读功能
 */
import { useEffect, useState } from "react";
import useUserStore from '../../../lib/userStore'
import "./chatList.css";
import AddUser from "./addUser/AddUser";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useChatStore } from "../../../lib/chatStore";

const ChatList = () => {
  // [Zustand 全局状态] 获取当前登录用户
  const { currentUser } = useUserStore()
  // [局部 State] 添加用户模式开关
  const [addMode, setAddMode] = useState(false)
  // [局部 State] 聊天列表数据
  const [chats, setChats] = useState([])
  // [Zustand 全局状态] 获取切换聊天房间的方法
  const { changeChat } = useChatStore()

  /**
   * 实时监听用户聊天列表变化
   * [Firestore: userchats 集合] -> [chats (局部 State)]
   */
  useEffect(() => {
    // [Firebase Firestore] 监听 userchats 集合中当前用户的文档变化
    const unSub = onSnapshot(
      doc(db, "userchats", currentUser.id),
      async (res) => {
        // [Firestore: userchats 集合] -> [items]
        const items = res.data().chats

        // 遍历聊天列表，获取每个聊天对象的详细信息
        // [Firestore: userchats 集合 + users 集合] -> [chatData]
        const promises = items.map(async (item) => {
          // [Firebase Firestore] 读取 users 集合中对应用户的文档
          // [Firestore: users 集合] -> [user]
          const userDocRef = doc(db, "users", item.receiverId);
          const userDocSnap = await getDoc(userDocRef);

          const user = userDocSnap.data();

          // 合并聊天项和用户信息
          return { ...item, user };
        });

        // 并发请求所有用户信息
        const chatData = await Promise.all(promises);
        
        // 按更新时间倒序排列
        // [数据排序] -> [chats]
        setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
      }
    )

    return () => {
      unSub()
    }
  }, [currentUser.id])

  /**
   * 处理聊天项点击
   * [用户点击聊天项] -> [更新 Firestore: userchats 集合 + 切换聊天房间]
   */
  const handleSelect = async (chat) => {
    // 分离用户信息，只保留聊天元数据
    const userChats = chats.map((item) => {
      const { user, ...rest } = item;
      return rest;
    });

    // 查找当前聊天项的索引
    const chatIndex = userChats.findIndex(
      (item) => item.chatId === chat.chatId
    );

    // 标记为已读
    // [用户点击聊天项] -> [更新 isSeen]
    userChats[chatIndex].isSeen = true;

    // [Firebase Firestore] 更新用户聊天列表的已读状态
    const userChatsRef = doc(db, "userchats", currentUser.id);

    try {
      // [用户点击聊天项] -> [更新 Firestore: userchats 集合]
      await updateDoc(userChatsRef, {
        chats: userChats,
      });
      // [Zustand 全局状态] 切换到对应的聊天房间
      changeChat(chat.chatId, chat.user);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="chatList">
      {/* 搜索栏 */}
      <div className="search">
        <div className="searchBar">
          <img src="./search.png" alt="" />
          <input
            type="text"
            placeholder="搜索"
          />
        </div>
        {/* 添加用户按钮 */}
        <img
          src={addMode ? "./minus.png" : "./plus.png"}
          alt=""
          className="add"
          onClick={() => setAddMode((prev) => !prev)}
        />
      </div>

      {/* 聊天列表 */}
      {
        chats.map((chat) => (
          <div className="item"
            key={chat.chatId}
            onClick={() => handleSelect(chat)}
            style={{
              // 未读消息显示蓝色背景
              backgroundColor: chat?.isSeen ? "transparent" : "#5183fe",
            }}
          >
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

      {/* 添加用户组件 */}
      {addMode && <AddUser />}
    </div>
  );
};

export default ChatList;
