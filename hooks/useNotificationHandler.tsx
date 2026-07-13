import { toast } from "@/components/ui/Toast";
import { usePathname } from "expo-router";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

const useNotificationHandler = (receivedNotification: any | null) => {
    const { t } = useTranslation();
    const pathname = usePathname();


    useEffect(() => {
        if (!receivedNotification) return;
        toast.success(t("ui.newNotification"));

    }, [receivedNotification, pathname]);

    return null;
};

export default useNotificationHandler;
