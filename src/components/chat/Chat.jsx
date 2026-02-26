import { useEffect, useLayoutEffect, useRef, useState } from "react";
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
import zh_CN from "timeago.js/lib/lang/zh_CN"; // 导入中文包

register("zh_CN", zh_CN); // 注册中文语言

const Chat = () => {
  const [chat, setChat] = useState()
  const [open, setOpen] = useState(false)
  const [text, setText] = useState("");
  // Zustand获得聊天室id和当前用户信息
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } =
    useChatStore();
  const { currentUser } = useUserStore()


  const [img, setImg] = useState({
    file: null,
    url: "",
  });

  const handleEmoji = e => {
    setText(prev => prev + e.emoji)
    setOpen(false);
  }

  // 更新对应聊天室id的message
  useEffect(() => {
    const unSub = onSnapshot(
      doc(db, "chats", chatId),
      (res) => {
        setChat(res.data());
      }
    );
    return () => {
      unSub();
    }
  }, [chatId]);


  // 页面滚动逻辑
  const centerRef = useRef(null)
  const scrollHandler = (e) => {
    const scrollTop = e.currentTarget.scrollTop;
    window.history.replaceState({}, '', `?top=${scrollTop}`)
  }
  useLayoutEffect(() => {
    const top = window.location.search.split('=')[1]
    centerRef.current.scrollTop = Number(top)
  })

  // 发送一条消息（包含文字和可选图片）并更新双方的聊天列表状态。
  const handleSend = async () => {
    if (text === "") return;
    if (isCurrentUserBlocked || isReceiverBlocked) return;
    let imgUrl = null;

    try {
      if (img.file) {
        imgUrl = await upload(img.file);
      }
      // 将消息保存到聊天室
      await updateDoc(doc(db, "chats", chatId), {
        // arrayUnion将数据添加到数组末尾
        messages: arrayUnion({
          senderId: currentUser.id,
          text,
          createdAt: new Date(),
          ...(imgUrl && { img: imgUrl }),// 只有 imgUrl 存在时才添加 img 字段
        }),
      });
      // 发送完消息后，对话双方的左侧联系人列表需要显示“最新一条消息”和“更新时间”。
      const userIDs = [currentUser.id, user.id];
      // 并发执行
      await Promise.all(userIDs.map(async (id) => {
        // ... 这里的逻辑会同时为两个人更新
        const userChatsRef = doc(db, "userchats", id);// 找到对应文档
        const userChatsSnapshot = await getDoc(userChatsRef);// 读取对应文档的数据

        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data();
          // 在用户所有的聊天信息中查找到该id的所在的聊天信息
          const chatIndex = userChatsData.chats.findIndex(
            (c) => c.chatId === chatId
          );

          userChatsData.chats[chatIndex].lastMessage = text;
          // 处理已读和未读
          userChatsData.chats[chatIndex].isSeen =
            id === currentUser.id ? true : false;
          userChatsData.chats[chatIndex].updatedAt = Date.now();
          // 把修改后的整个数组写回数据库
          await updateDoc(userChatsRef, {
            chats: userChatsData.chats,
          });
        }
      }));

    } catch (err) {
      console.log(err);
    } finally {
      setImg({
        file: null,
        url: "",
      });

      setText("");
    }
  };

  return (
    <div className="chat">
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
      <div className="center" onScroll={scrollHandler} ref={centerRef}>
        {/* 渲染消息列表 */}
        {
          chat?.messages?.map(message => (
            <div className={
              message.senderId === currentUser?.id ? "message own" : "message"
            } key={message?.createdAt}>
              <div className="texts">
                {
                  message.img && <img src={message.img} alt="" />
                }
                <p>{message.text}</p>
                <span>{format(message.createdAt.toDate(), "zh_CN")}</span>
              </div>
            </div>
          ))
        }
      </div>
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
