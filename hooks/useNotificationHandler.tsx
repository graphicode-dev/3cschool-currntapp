import { toast } from "@/components/ui/Toast";
import { Audio } from "expo-av";
import { usePathname } from "expo-router";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

const useNotificationHandler = (receivedNotification: any | null) => {
    const { t } = useTranslation();
    const pathname = usePathname();
    const soundRef = useRef<Audio.Sound | null>(null);

    const audioSource = require("@/assets/notification.wav");

    useEffect(() => {
        const loadSound = async () => {
            const { sound } = await Audio.Sound.createAsync(audioSource);
            soundRef.current = sound;
        };

        loadSound();

        return () => {
            soundRef.current?.unloadAsync();
        };
    }, []);

    useEffect(() => {
        if (!receivedNotification) return;

        toast.success(t("ui.newNotification"));

        const playSound = async () => {
            try {
                if (soundRef.current) {
                    await soundRef.current.replayAsync();
                }
            } catch (err) {
                console.log("Sound error:", err);
            }
        };

        playSound();
    }, [receivedNotification, pathname]);

    return null;
};

export default useNotificationHandler;
