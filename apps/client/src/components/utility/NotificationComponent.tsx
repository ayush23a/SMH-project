"use client";

import { NotificationProvider } from "../ui/notification";

export function NotificationComponent({ children }: { children: React.ReactNode }) {
  return <NotificationProvider>{children}</NotificationProvider>;
}
