import { Icons } from "@/constants/icons";
import { Palette } from "@/constants/theme";
import { StyleSheet, TextInput, View } from "react-native";

interface GroupsSearchProps {
    searchValue: string;
    onSearchChange: (text: string) => void;
}

export function GroupsSearch({
    searchValue,
    onSearchChange,
}: GroupsSearchProps) {
    return (
        <View style={styles.container}>
            {/* Search Input */}
            <View style={styles.searchContainer}>
                <Icons.MagnifyingGlassIcon size={20} color={Palette.slate400} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search groups..."
                    placeholderTextColor={Palette.slate400}
                    value={searchValue}
                    onChangeText={onSearchChange}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    searchContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Palette.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Palette.slate100,
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
    },
    searchInput: {
        flex: 1,
        fontFamily: "Poppins-Regular",
        fontSize: 14,
        color: Palette.slate900,
        padding: 0,
        margin: 0,
    },
});
