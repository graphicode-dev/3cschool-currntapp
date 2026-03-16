import { toast } from "@/components/ui/Toast";
import { useAudioPlayer } from "expo-audio";
import { usePathname } from "expo-router";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

const useNotificationHandler = (receivedNotification: any | null) => {
    const { t } = useTranslation();
    const pathname = usePathname();
    const audioSource = require("@/assets/notification.wav");
    const player = useAudioPlayer(audioSource);

    useEffect(() => {
        if (!receivedNotification) return;

        toast.success(t("ui.newNotification"));

        // Play sound effect
        player.seekTo(0);
        player.play();
    }, [receivedNotification, pathname]);
};

export default useNotificationHandler;
