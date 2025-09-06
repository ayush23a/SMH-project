import { User } from "@/src/types/prisma-types";
import { create } from "zustand";

interface FriendsStore {
    friends: Partial<User>[];
    updateFriends: (friend: Partial<User>) => void;
    setFriends: (friends: Partial<User>[]) => void;
    clearFriends: () => void;
}

export const useFriendStore = create<FriendsStore>((set) => ({
    friends: [],

    updateFriends: (friend) =>
        set((state) => {
            const exists = state.friends.find((f) => f.id === friend.id);
            if (exists) {
                return {
                    friends: state.friends.map((f) =>
                        f.id === friend.id ? { ...f, ...friend } : f
                    ),
                };
            } else {
                return { friends: [...state.friends, friend] };
            }
        }),

    setFriends: (friends) => set(() => ({ friends })),

    clearFriends: () => set({ friends: [] }),
}));
