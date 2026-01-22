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
        <Provider store={store}>
            <ThemeProvider
                value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
            >
                <NotificationProvider>{children}</NotificationProvider>
            </ThemeProvider>
        </Provider>
    );
}
export default Providers;
