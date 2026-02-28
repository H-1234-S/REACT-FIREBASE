/**
 * 聊天状态管理（Zustand 全局 Store）
 * 
 * 状态：
 * - chatId: 当前聊天室 ID（来自全局 Store）
 * - user: 当前聊天对象用户信息（来自全局 Store）
 * - isCurrentUserBlocked: 对方是否拉黑当前用户（来自全局 Store）
 * - isReceiverBlocked: 当前用户是否拉黑对方（来自全局 Store）
 */
import { create } from "zustand";
import useUserStore from "./userStore";

export const useChatStore = create((set) => ({
  // [Zustand 全局状态] 当前聊天室 ID
  chatId: null,
  // [Zustand 全局状态] 当前聊天对象用户信息
  user: null,
  // [Zustand 全局状态] 对方是否拉黑当前用户
  isCurrentUserBlocked: false,
  // [Zustand 全局状态] 当前用户是否拉黑对方
  isReceiverBlocked: false,

  /**
   * 切换聊天房间
   * 设置当前聊天室 ID 和聊天对象，同时检查拉黑状态
   * @param {string} chatId - 聊天室 ID
   * @param {object} user - 聊天对象用户信息
   */
  changeChat: (chatId, user) => {
    // [Zustand 全局状态] 获取当前用户信息
    const currentUser = useUserStore.getState().currentUser;

    // 检查对方的 blocked 列表中是否包含当前用户 ID
    // [用户拉黑检查] -> [isCurrentUserBlocked]
    if (user.blocked.includes(currentUser.id)) {
      return set({
        chatId,
        user: null,
        isCurrentUserBlocked: true,
        isReceiverBlocked: false,
      });
    }
    // 检查当前用户的 blocked 列表中是否包含对方用户 ID
    else if (currentUser.blocked.includes(user.id)) {
      return set({
        chatId,
        user: user,
        isCurrentUserBlocked: false,
        isReceiverBlocked: true,
      });
    } else {
      // 正常状态：双方都未拉黑
      return set({
        chatId,
        user,
        isCurrentUserBlocked: false,
        isReceiverBlocked: false,
      });
    }
  },

  /**
   * 切换拉黑状态
   * [用户点击拉黑按钮] -> [更新 isReceiverBlocked]
   */
  changeBlock: () => {
    set((state) => ({ ...state, isReceiverBlocked: !state.isReceiverBlocked }));
  },

  /**
   * 重置聊天状态
   * [用户退出聊天/登出] -> [重置所有聊天状态]
   */
  resetChat: () => {
    set({
      chatId: null,
      user: null,
      isCurrentUserBlocked: false,
      isReceiverBlocked: false,
    });
  },
}));
