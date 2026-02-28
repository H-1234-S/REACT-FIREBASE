/**
 * 根组件
 * 
 * 功能：
 * - 监听用户登录状态变化
 * - 根据登录状态渲染对应页面
 * - 实时同步用户信息到全局状态
 */
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
  // [Zustand 全局状态] 获取用户信息和加载状态
  const { fetchUserInfo, currentUser, isLoading } = useUserStore()
  // [Zustand 全局状态] 获取当前聊天室 ID
  const { chatId } = useChatStore()

  /**
   * 监听用户登录状态变化
   * [Firebase Auth] -> [fetchUserInfo] -> [更新全局 Store]
   */
  useEffect(() => {
    // [Firebase Auth] 监听用户认证状态变化
    // [用户登录/登出] -> [触发回调]
    const unSub = onAuthStateChanged(auth, (user) => {
      // 获取用户 UID 并获取用户信息
      fetchUserInfo(user?.uid);
    });

    return () => {
      unSub();
    };
  }, [fetchUserInfo]);

  // 加载中显示
  if (isLoading) return <div className="loading">加载中...</div>;

  return (
    <div className="container">
      {
        // 根据用户登录状态条件渲染
        currentUser ? (
          <>
            {/* 左侧列表 */}
            <List />
            {/* 中间聊天窗口（选中聊天后显示） */}
            { chatId && <Chat />}
            {/* 右侧详情面板（选中聊天后显示） */}
            { chatId && <Detail />}
          </>
        ) : (
          // 未登录显示登录页面
          <Login />
        )
      }
      {/* 通知组件（全局显示） */}
      <Notification />
    </div>
  );
};

export default App;
