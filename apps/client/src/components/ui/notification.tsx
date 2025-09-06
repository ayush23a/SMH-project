"use client";

import {
    createContext,
    useContext,
    useState,
    useCallback,
    ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

import FriendRequestModal from "@/src/components/utility/FriendRequestModal";

type NotificationType = "FRIEND_REQUEST" | "PAYMENT_RECEIVED" | "DEFAULT";

type Notification = {
    id: number;
    type: NotificationType;
    content: ReactNode;
};

type NotificationContextType = {
    notify: {
        friendRequest: (
            fromUser: {
                id: string;
                name: string;
                email: string;
                image: string;
                description?: string;
            },
            handlers: {
                onAccept: () => void;
                onReject: () => void;
                onBlock: () => void;
            }
        ) => void;
        paymentReceived: (amount: number, fromUser: string) => void;
        custom: (content: ReactNode) => void;
    };
};

const NotificationContext = createContext<NotificationContextType | null>(null);

let idCounter = 0;

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const removeNotification = useCallback((id: number) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, []);

    const addNotification = useCallback(
        (type: NotificationType, content: ReactNode, autoClose = true) => {
            const id = ++idCounter;
            setNotifications((prev) => {
                const next = [{ id, type, content }, ...prev];
                return next.slice(0, 3);
            });

            if (autoClose) {
                setTimeout(() => removeNotification(id), 4000);
            }
        },
        [removeNotification]
    );


    const notify = {
        friendRequest: (
            fromUser: {
                id: string;
                name: string;
                email: string;
                image: string;
                description?: string;
            },
            handlers: {
                onAccept: () => void;
                onReject: () => void;
                onBlock: () => void;
            }
        ) => {
            addNotification(
                "FRIEND_REQUEST",
                <FriendRequestModal
                    fromUser={fromUser}
                    onAccept={() => {
                        handlers.onAccept();
                        removeNotification(idCounter); // close after action
                    }}
                    onReject={() => {
                        handlers.onReject();
                        removeNotification(idCounter);
                    }}
                    onBlock={() => {
                        handlers.onBlock();
                        removeNotification(idCounter);
                    }}
                />,
                false // don’t autoclose friend requests, user must act
            );
        },
        paymentReceived: (amount: number, fromUser: string) => {
            addNotification(
                "PAYMENT_RECEIVED",
                <div className="p-4">
                    <span>
                        ✅ You received <strong>{amount} SOL</strong> from {fromUser}
                    </span>
                </div>
            );
        },
        custom: (content: ReactNode) => {
            addNotification("DEFAULT", content);
        },
    };

    return (
        <NotificationContext.Provider value={{ notify }}>
            {children}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-4 w-80 select-none">
                <AnimatePresence>
                    {notifications.map((n, i) => (
                        <motion.div
                            key={n.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            style={{ zIndex: 9999 + i }}
                            className="relative p-6 rounded-xl border border-neutral-700 bg-black text-neutral-200 flex flex-col gap-y-5 shadow-lg"
                        >
                            {n.content}
                            <button
                                onClick={() => removeNotification(n.id)}
                                className="absolute top-2 right-2 text-black bg-neutral-200/40 hover:bg-neutral-200/60 transition-colors cursor-pointer rounded-full p-0.5"
                            >
                                <X size={12} className="stroke-2" />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

        </NotificationContext.Provider>
    );
}

export function useNotification() {
    const ctx = useContext(NotificationContext);
    if (!ctx) throw new Error("useNotification must be used inside NotificationProvider");
    return ctx.notify;
}
