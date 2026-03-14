import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";

interface DateSeparatorProps {
    date: string | number | Date;
    isToday?: boolean;
    isYesterday?: boolean;
}

export function DateSeparator({ date, isToday, isYesterday }: DateSeparatorProps) {
    const formattedDate = useMemo(() => {
        if (isToday) return "Today";
        if (isYesterday) return "Yesterday";
        
        // Format as dd/mm/yyyy
        const dateObj = typeof date === 'string' || typeof date === 'number' 
            ? new Date(date) 
            : date;
        
        const day = dateObj.getDate().toString().padStart(2, '0');
        const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
        const year = dateObj.getFullYear();
        
        return `${day}/${month}/${year}`;
    }, [date, isToday, isYesterday]);

    return (
        <View style={styles.container}>
            <View style={styles.separator}>
                <ThemedText style={styles.text}>{formattedDate}</ThemedText>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 16,
        paddingHorizontal: 20,
    },
    separator: {
        backgroundColor: Colors.light.tabBarBackground,
        paddingHorizontal: 16,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.light.tabBarBorder,
    },
    text: {
        fontSize: 12,
        color: Colors.light.icon,
        fontWeight: '500',
    },
});
