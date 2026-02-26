import { onAuthStateChanged } from "firebase/auth";
import Chat from "./components/chat/Chat";
import Detail from "./components/detail/Detail";
import List from "./components/list/List";
import Login from "./components/login/Login";
import Notification from "./components/notification/Notification";
import { auth } from "./lib/firebase";
import useUserStore from "./lib/userStore";
import { useEffect } from "react";
import { useChatStore } from "./lib/chatStore";

const App = () => {
  const { fetchUserInfo, currentUser, isLoading } = useUserStore()
  const { chatId } = useChatStore()

  // onAuthStateChanged实时监控用户的登录状态
  useEffect(() => {
    // 监听到用户登录，获取uid，调取fetchUserInfo
    const unSub = onAuthStateChanged(auth, (user) => {
      fetchUserInfo(user?.uid);
    });

    return () => {
      unSub();
    };
  }, [fetchUserInfo]);

  if (isLoading) return <div className="loading">加载中...</div>;

  return (
    <div className="container">
      {
        currentUser ? (
          <>
            <List />
            { chatId && <Chat />}
            { chatId && <Detail />}
          </>
        ) : (
          <Login />
        )
      }
      <Notification />
    </div>
  );
};

export default App;
