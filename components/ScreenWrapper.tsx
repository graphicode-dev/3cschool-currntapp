import { Images } from "@/constants/images";
import { ImageBackground, StyleSheet } from "react-native";
const ScreenWrapper = ({
    children,
    bgImage,
}: {
    children: React.ReactNode;
    bgImage?: string;
}) => {
    return (
        <ImageBackground
            source={bgImage || Images.screenBg}
            style={styles.container}
        >
            {children}
        </ImageBackground>
    );
};
export default ScreenWrapper;
const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingVertical: 40,
    },
});
