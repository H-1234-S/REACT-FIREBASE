/**
 * 聊天消息组件
 * 
 * 功能：
 * - 实时显示聊天消息
 * - 发送文字和图片消息
 * - 实时监听 Firestore 消息变化
 */
import { useEffect, useRef, useState } from "react";
import "./chat.css";
import EmojiPicker from "emoji-picker-react";
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatStore";
import useUserStore from "../../lib/userStore";
import { format, register } from "timeago.js";
import zh_CN from "timeago.js/lib/lang/zh_CN";

// 注册中文语言包
register("zh_CN", zh_CN);

const Chat = () => {
  // [局部 State] 当前聊天室数据
  const [chat, setChat] = useState()
  // [局部 State] emoji 选择器显示状态
  const [open, setOpen] = useState(false)
  // [局部 State] 输入框文本
  const [text, setText] = useState("");
  // [局部 State] 待发送图片
  const [img, setImg] = useState({
    file: null,
    url: "",
  });

  // [Zustand 全局状态] 获取聊天室 ID 和聊天对象信息
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } =
    useChatStore();
  // [Zustand 全局状态] 获取当前登录用户信息
  const { currentUser } = useUserStore()

  // 消息列表底部引用
  const endRef = useRef(null)

  /**
   * 监听消息数组变化，自动滚动到底部
   */
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat?.messages]);

  /**
   * 选择 emoji
   * [用户点击 emoji] -> [更新 text]
   */
  const handleEmoji = e => {
    setText(prev => prev + e.emoji)
    setOpen(false);
  }

  /**
   * 实时监听聊天室消息变化
   * [Firestore: chats 集合] -> [chat (局部 State)]
   */
  useEffect(() => {
    // [Firebase Firestore] 监听 chats 集合中指定 chatId 的文档变化
    const unSub = onSnapshot(
      doc(db, "chats", chatId),
      (res) => {
        // [Firestore: chats 集合] -> [chat]
        setChat(res.data());
      }
    );
    return () => {
      unSub();
    }
  }, [chatId]);

  /**
   * 发送消息
   * [用户点击发送按钮] -> [更新 Firestore: chats 集合 + userchats 集合]
   */
  const handleSend = async () => {
    // 检查输入是否为空或是否被拉黑
    if (text === "") return;
    if (isCurrentUserBlocked || isReceiverBlocked) return;
    let imgUrl = null;

    try {
      // [可选] 图片上传 -> [Firebase Storage]
      if (img.file) {
        imgUrl = await upload(img.file);
      }

      // [Firebase Firestore] 更新 chats 集合中的消息
      // [用户发送消息] -> [更新 Firestore: chats 集合]
      await updateDoc(doc(db, "chats", chatId), {
        // arrayUnion: 将新消息添加到消息数组末尾
        messages: arrayUnion({
          senderId: currentUser.id,
          text,
          createdAt: new Date(),
          // [可选] 图片消息
          ...(imgUrl && { img: imgUrl }),
        }),
      });

      // [Firebase Firestore] 更新双方的用户聊天列表
      // [用户发送消息] -> [更新 Firestore: userchats 集合]
      const userIDs = [currentUser.id, user.id];
      
      // 并发更新双方的用户聊天记录
      await Promise.all(userIDs.map(async (id) => {
        // [Firebase Firestore] 读取 userchats 集合中指定用户的文档
        const userChatsRef = doc(db, "userchats", id);
        const userChatsSnapshot = await getDoc(userChatsRef);

        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data();
          
          // 查找当前聊天在用户列表中的索引
          const chatIndex = userChatsData.chats.findIndex(
            (c) => c.chatId === chatId
          );

          // 更新最后一条消息
          userChatsData.chats[chatIndex].lastMessage = text;
          // 处理已读状态：发送者标记为已读，接收者标记为未读
          userChatsData.chats[chatIndex].isSeen =
            id === currentUser.id ? true : false;
          // 更新时间戳
          userChatsData.chats[chatIndex].updatedAt = Date.now();

          // [Firebase Firestore] 将更新后的聊天列表写回数据库
          // [用户发送消息] -> [更新 Firestore: userchats 集合]
          await updateDoc(userChatsRef, {
            chats: userChatsData.chats,
          });
        }
      }));

    } catch (err) {
      console.log(err);
    } finally {
      // 重置图片状态
      setImg({
        file: null,
        url: "",
      });
      // 清空输入框
      setText("");
    }
  };

  return (
    <div className="chat">
      {/* 顶部：聊天对象信息 */}
      <div className="top">
        <div className="user">
          <img src={"./avatar.png"} alt="" />
          <div className="texts">
            <span>{user?.username}</span>
            <p>暂无消息</p>
          </div>
        </div>
        <div className="icons">
          <img src="./phone.png" alt="" />
          <img src="./video.png" alt="" />
          <img src="./info.png" alt="" />
        </div>
      </div>

      {/* 中部：消息列表 */}
      <div className="center" >
        {/* 渲染消息列表 */}
        {
          chat?.messages?.map(message => (
            // 判断消息是否为自己发送的
            <div className={
              message.senderId === currentUser?.id ? "message own" : "message"
            } key={message?.createdAt}>
              <div className="texts">
                {/* 显示图片消息 */}
                {
                  message.img && <img src={message.img} alt="" />
                }
                <p>{message.text}</p>
                {/* 显示时间（格式化） */}
                <span>{format(message.createdAt.toDate(), "zh_CN")}</span>
              </div>
            </div>
          ))
        }
        {/* 预览待发送图片 */}
        {img.url && (
          <div className="message own">
            <div className="texts">
              <img
                src={img.url}
                alt=""
                onLoad={() => endRef.current?.scrollIntoView({ behavior: "smooth" })} />
            </div>
          </div>
        )}
        <div ref={endRef}></div>
      </div>

      {/* 底部：输入区域 */}
      <div className="bottom">
        <div className="icons">
          <label htmlFor="file">
            <img src="./img.png" alt="" />
          </label>
          <input
            type="file"
            id="file"
            style={{ display: "none" }}
          />
          <img src="./camera.png" alt="" />
          <img src="./mic.png" alt="" />
        </div>
        <input
          type="text"
          placeholder="输入消息..."
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <div className="emoji">
          <img
            src="./emoji.png"
            alt=""
            onClick={() => setOpen((prev) => !prev)}
          />
          <div className="picker">
            <EmojiPicker open={open} onEmojiClick={handleEmoji} />
          </div>
        </div>
        <button
          className="sendButton"
          onClick={handleSend}
        >
          发送
        </button>
      </div>
    </div>
  );
};

export default Chat;
