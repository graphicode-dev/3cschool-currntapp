import Avatar from "@/components/avatar";
import CustomHeader from "@/components/custom-header";
import InputField from "@/components/profile/InputField";
import ScreenWrapper from "@/components/ScreenWrapper";
import { ThemedText } from "@/components/themed-text";
import { PullToRefreshScrollView } from "@/components/ui/Pulltorefresh";
import { Icons } from "@/constants/icons";
import { Images } from "@/constants/images";
import { Palette, Spacing } from "@/constants/theme";
import { useUpdateProfile } from "@/services/auth/auth.mutations";
import { useAuthStore } from "@/services/auth/auth.store";
import { UpdateProfileRequest } from "@/services/auth/auth.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
    ActivityIndicator,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import { z } from "zod";
// ─── Validation Schema ────────────────────────────────────────────────────────

const editProfileSchema = z.object({
    full_name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    mobile: z.string().min(7, "Phone number is too short"),
    address: z.string().min(2, "Address is too short"),
});

type EditProfileFormValues = z.infer<typeof editProfileSchema>;

// ─── Component ────────────────────────────────────────────────────────────────

function EditProfileView() {
    const { user } = useAuthStore();
    const { mutate: updateProfile, isPending } = useUpdateProfile();

    // Local avatar URI — null means use existing user avatar
    const [avatarUri, setAvatarUri] = useState<string | null>(null);

    const {
        control,
        handleSubmit,
        formState: { errors, isDirty, isSubmitting },
    } = useForm<EditProfileFormValues>({
        resolver: zodResolver(editProfileSchema),
        defaultValues: {
            full_name: user?.full_name ?? "",
            email: user?.email ?? "",
            mobile: user?.mobile ?? "",
            address: user?.address ?? "",
        },
    });

    // Button is disabled when: no form field changed AND no new avatar selected
    const isButtonDisabled =
        isPending || isSubmitting || (!isDirty && avatarUri === null);

    // ─── Image Picker ─────────────────────────────────────────────────────────

    const handlePickImage = useCallback(async () => {
        const permission =
            await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) return;

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]?.uri) {
            setAvatarUri(result.assets[0].uri);
        }
    }, []);

    // ─── Submit ───────────────────────────────────────────────────────────────

    const onSubmit = useCallback(
        (values: EditProfileFormValues) => {
            // Build payload with only changed fields
            const payload: UpdateProfileRequest = {};

            if (values.full_name !== user?.full_name) {
                payload.full_name = values.full_name;
            }
            if (values.email !== user?.email) {
                payload.email = values.email;
            }
            if (values.mobile !== user?.mobile) {
                payload.mobile = values.mobile;
            }
            if (values.address !== (user?.address ?? "")) {
                payload.address = values.address;
            }
            if (avatarUri) {
                payload.avatar = avatarUri;
            }

            updateProfile(payload);
        },
        [user, avatarUri, updateProfile],
    );

    // ─── Render ───────────────────────────────────────────────────────────────

    const displayAvatarUri = avatarUri ?? user?.avatar ?? undefined;

    return (
        <ScreenWrapper bgImage={Images.profileBg}>
            <CustomHeader title="Edit Profile" divider />

            <PullToRefreshScrollView
                refetches={[]}
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}>
                <ThemedText type="title" fontSize={25}>
                    Update your info anytime.
                </ThemedText>

                {/* Avatar section */}
                <View style={styles.avatarSection}>
                    <TouchableOpacity
                        onPress={handlePickImage}
                        activeOpacity={0.8}
                        style={styles.avatarWrapper}>
                        {displayAvatarUri ? (
                            <Image
                                source={{ uri: displayAvatarUri }}
                                style={[
                                    styles.avatarImage,
                                    { width: 102, height: 102 },
                                ]}
                                contentFit="cover"
                            />
                        ) : (
                            <Avatar name={user?.full_name} size={102} />
                        )}
                        {/* Camera overlay badge */}
                        <View style={styles.cameraOverlay}>
                            <Icons.CameraIcon size={16} color={Palette.white} />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Form fields */}
                <View style={styles.formContainer}>
                    {/* Full Name */}
                    <Controller
                        control={control}
                        name="full_name"
                        render={({ field: { value, onChange } }) => (
                            <InputField
                                label="Full Name"
                                value={value}
                                onChangeText={onChange}
                                error={errors.full_name?.message}
                            />
                        )}
                    />

                    {/* Email */}
                    <Controller
                        control={control}
                        name="email"
                        render={({ field: { value, onChange } }) => (
                            <InputField
                                label="Email"
                                value={value}
                                onChangeText={onChange}
                                keyboardType="email-address"
                                error={errors.email?.message}
                                rightIcon={
                                    <Icons.EnvelopeIcon
                                        size={20}
                                        color={Palette.slate300}
                                    />
                                }
                            />
                        )}
                    />

                    {/* Phone */}
                    <Controller
                        control={control}
                        name="mobile"
                        render={({ field: { value, onChange } }) => (
                            <InputField
                                label="Phone Number"
                                value={value}
                                onChangeText={onChange}
                                keyboardType="phone-pad"
                                error={errors.mobile?.message}
                            />
                        )}
                    />

                    {/* Address */}
                    <Controller
                        control={control}
                        name="address"
                        render={({ field: { value, onChange } }) => (
                            <InputField
                                label="Address"
                                value={value}
                                onChangeText={onChange}
                                error={errors.address?.message}
                            />
                        )}
                    />

                    {/* Save button */}
                    <TouchableOpacity
                        style={[
                            styles.saveButton,
                            isButtonDisabled && styles.saveButtonDisabled,
                        ]}
                        activeOpacity={0.85}
                        onPress={handleSubmit(onSubmit)}
                        disabled={isButtonDisabled}>
                        {isPending ? (
                            <ActivityIndicator color={Palette.white} />
                        ) : (
                            <ThemedText
                                style={styles.saveButtonText}
                                fontSize={16}>
                                Save
                            </ThemedText>
                        )}
                    </TouchableOpacity>
                </View>
            </PullToRefreshScrollView>
        </ScreenWrapper>
    );
}

export default EditProfileView;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
        paddingVertical: Spacing.md,
    },
    scrollContent: {
        paddingTop: 10,
        paddingBottom: 100,
        gap: 30,
    },

    // Avatar
    avatarSection: {
        alignItems: "center",
        marginTop: 24,
        marginBottom: 19,
    },
    avatarWrapper: {
        position: "relative",
    },
    avatarImage: {
        borderRadius: 51,
        borderWidth: 1,
        borderColor: Palette.brand[500],
    },
    cameraOverlay: {
        position: "absolute",
        bottom: 2,
        right: 2,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: Palette.brand[500],
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: Palette.white,
    },

    // Form
    formContainer: {
        gap: 16,
    },

    // Save button
    saveButton: {
        backgroundColor: Palette.slate900,
        borderRadius: 24,
        borderTopLeftRadius: 18,
        borderTopRightRadius: 24,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 18,
        height: 63,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 22,
    },
    saveButtonDisabled: {
        opacity: 0.4,
    },
    saveButtonText: {
        fontFamily: "Poppins-SemiBold",
        color: Palette.white,
        textTransform: "capitalize",
    },
});
