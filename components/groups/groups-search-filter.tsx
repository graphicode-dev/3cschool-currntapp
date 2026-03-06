import { Icons } from "@/constants/icons";
import { Palette } from "@/constants/theme";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

interface GroupsSearchFilterProps {
    searchValue: string;
    onSearchChange: (text: string) => void;
    filterValue: string;
    onFilterChange: (filter: string) => void;
    onFilterPress: () => void;
}

export function GroupsSearchFilter({
    searchValue,
    onSearchChange,
    filterValue,
    onFilterChange,
    onFilterPress,
}: GroupsSearchFilterProps) {
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

            {/* Filter Button */}
            <TouchableOpacity
                style={styles.filterButton}
                onPress={onFilterPress}
            >
                <Icons.FilterIcon
                    size={20}
                    color={filterValue ? Palette.brand[500] : Palette.slate600}
                />
            </TouchableOpacity>
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
    filterButton: {
        backgroundColor: Palette.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Palette.slate100,
        paddingHorizontal: 16,
        paddingVertical: 12,
        alignItems: "center",
        justifyContent: "center",
        minWidth: 48,
    },
});
