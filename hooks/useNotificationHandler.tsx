import { toast } from "@/components/ui/Toast";
import { useAudioPlayer } from "expo-audio";
import * as Notifications from "expo-notifications";
import { usePathname } from "expo-router";
import { useEffect } from "react";

const useNotificationHandler = (
    receivedNotification: Notifications.Notification | null,
) => {
    const pathname = usePathname();
    const audioSource = require("@/assets/notification.wav");
    const player = useAudioPlayer(audioSource);

    useEffect(() => {
        if (!receivedNotification) return;

        toast.success("New Notification");

        // Play sound effect
        player.seekTo(0);
        player.play();
    }, [receivedNotification, pathname, player]);
};

export default useNotificationHandler;
