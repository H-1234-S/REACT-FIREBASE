// 管理当前正在进行的聊天状态以及用户之间的黑名单逻辑。
import { create } from "zustand";
import useUserStore from "./userStore";

export const useChatStore = create((set) => ({
    chatId: null,
    user: null,
    // 拉黑
    // 对方把你拉黑
    isCurrentUserBlocked: false,
    // 你把对方拉黑
    isReceiverBlocked: false,
    // 接收聊天室id和对方用户信息
    changeChat: (chatId, user) => {
        const currentUser = useUserStore.getState().currentUser;
        // 对方的拉黑列表里能否查找到当前用户的id
        if (user.blocked.includes(currentUser.id)) {
            return set({
                chatId,
                user: null,
                isCurrentUserBlocked: true,
                isReceiverBlocked: false,
            });
        }

        else if (currentUser.blocked.includes(user.id)) {
            return set({
                chatId,
                user: user,
                isCurrentUserBlocked: false,
                isReceiverBlocked: true,
            });
        } else {    // 正常状态
            return set({
                chatId,
                user,
                isCurrentUserBlocked: false,
                isReceiverBlocked: false,
            });
        }
    },

    changeBlock: () => {
        set((state) => ({ ...state, isReceiverBlocked: !state.isReceiverBlocked }));
    },
    resetChat: () => {
        set({
            chatId: null,
            user: null,
            isCurrentUserBlocked: false,
            isReceiverBlocked: false,
        });
    },
}));