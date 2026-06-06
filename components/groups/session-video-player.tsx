// SessionVideoPlayer.tsx
import { Palette, Radii } from "@/constants/theme";
import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

type Props = {
    embedHtml?: string | null; // from your data: embedHtmlAr or embedHtmlEn
};

export default function SessionVideoPlayer({ embedHtml }: Props) {
    if (!embedHtml) {
        return (
            <View style={styles.fallbackContainer}>
                <ActivityIndicator size="large" color={Palette.brand[500]} />
            </View>
        );
    }

    // Inject a small script to remove any parent div padding and ensure fullscreen works
    const injectedJS = `
    (function() {
      // Remove the outer wrapper's padding-top (if any)
      var container = document.querySelector('div[style*="padding-top"]');
      if (container) {
        container.style.paddingTop = '0';
        container.style.height = '100%';
      }
      // Make iframe fill the whole WebView
      var iframe = document.querySelector('iframe');
      if (iframe) {
        iframe.style.position = 'relative';
        iframe.style.top = '0';
        iframe.style.left = '0';
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = '0';
      }
    })();
    true;
  `;

    return (
        <View style={styles.videoWrapper}>
            <WebView
                source={{ html: embedHtml }}
                style={styles.webview}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                allowsFullscreenVideo={true}
                mediaPlaybackRequiresUserAction={false}
                injectedJavaScript={injectedJS}
                onError={(syntheticEvent) => {
                    const { nativeEvent } = syntheticEvent;
                    console.warn("WebView error: ", nativeEvent);
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    videoWrapper: {
        width: "100%",
        aspectRatio: 16 / 9,
        borderRadius: Radii.lg,
        overflow: "hidden",
        backgroundColor: Palette.black,
    },
    webview: {
        flex: 1,
        backgroundColor: "transparent",
    },
    fallbackContainer: {
        width: "100%",
        aspectRatio: 16 / 9,
        backgroundColor: Palette.slate200,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: Radii.lg,
    },
});
