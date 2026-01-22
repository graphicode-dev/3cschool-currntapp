import { useColorScheme } from "@/hooks/use-color-scheme";
import { store } from "@/store";
import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { Provider } from "react-redux";
import { NotificationProvider } from "./NotificationProvider";

function Providers({ children }: { children: React.ReactNode }) {
    const colorScheme = useColorScheme();

    return (
        <NotificationProvider>
            <Provider store={store}>
                <ThemeProvider
                    value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
                >
                    {children}
                </ThemeProvider>
            </Provider>
        </NotificationProvider>
    );
}
export default Providers;
