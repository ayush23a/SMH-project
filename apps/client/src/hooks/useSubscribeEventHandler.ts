import { useEffect } from "react";
import { useWebSocket } from "./useWebSocket";


export default function useSubscribeEventHandler() {

    const { subscribeToHandler, unsubscribeToHandler } = useWebSocket();

    useEffect(() => {}, [
        subscribeToHandler,
        unsubscribeToHandler
    ]);

}