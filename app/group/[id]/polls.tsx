import { Poll, pollsService } from "@/services/pollsService";
import { useAppSelector } from "@/store";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BASE_URL = "https://3cschool.net";

function getInitials(name: string): string {
    const parts = name.split(" ");
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

function getAvatarColor(name: string): string {
    const colors = ["#00aeed", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}

function formatTimeAgo(dateString: string): string {
    const now = Date.now();
    const diff = now - new Date(dateString).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return "Yesterday";
    return `${days}d ago`;
}

function formatExpiresIn(dateString: string | null): string {
    if (!dateString) return "";
    const now = Date.now();
    const expiresAt = new Date(dateString).getTime();
    const diff = expiresAt - now;
    
    if (diff <= 0) return "Expired";
    
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (hours < 1) return "< 1h left";
    if (hours < 24) return `${hours}h left`;
    return `${days}d left`;
}

function PollCard({
    poll,
    onVote,
    onClose,
    isVoting,
    currentUserId,
    isTeacher,
}: {
    poll: Poll;
    onVote: (pollId: number, optionIds: number[]) => void;
    onClose: (pollId: number) => void;
    isVoting: boolean;
    currentUserId: number | undefined;
    isTeacher: boolean;
}) {
    const [selectedOptions, setSelectedOptions] = useState<number[]>(poll.user_votes || []);
    const canVote = !poll.user_voted && !poll.is_closed && !poll.is_expired;
    const canClose = (poll.created_by === currentUserId || isTeacher) && !poll.is_closed;
    const showResults = poll.user_voted || poll.is_closed || poll.is_expired;

    const handleOptionPress = (optionId: number) => {
        if (!canVote) return;
        
        if (poll.is_multiple_choice) {
            setSelectedOptions(prev => 
                prev.includes(optionId) 
                    ? prev.filter(id => id !== optionId)
                    : [...prev, optionId]
            );
        } else {
            setSelectedOptions([optionId]);
        }
    };

    const handleVote = () => {
        if (selectedOptions.length === 0) {
            Alert.alert("Select Option", "Please select at least one option to vote.");
            return;
        }
        onVote(poll.id, selectedOptions);
    };

    const creatorInitials = getInitials(poll.creator.full_name);
    const creatorColor = getAvatarColor(poll.creator.full_name);

    return (
        <View style={styles.pollCard}>
            {/* Poll Header */}
            <View style={styles.pollHeader}>
                <View style={styles.pollCreatorInfo}>
                    {poll.creator.avatar ? (
                        <Image
                            source={{ uri: `${BASE_URL}${poll.creator.avatar}` }}
                            style={styles.creatorAvatar}
                            contentFit="cover"
                        />
                    ) : (
                        <View style={[styles.creatorAvatarInitials, { backgroundColor: creatorColor }]}>
                            <Text style={styles.creatorInitialsText}>{creatorInitials}</Text>
                        </View>
                    )}
                    <View style={styles.pollCreatorDetails}>
                        <Text style={styles.creatorName}>{poll.creator.full_name}</Text>
                        <Text style={styles.pollTime}>{formatTimeAgo(poll.created_at)}</Text>
                    </View>
                </View>
                <View style={styles.pollBadges}>
                    {poll.is_anonymous && (
                        <View style={styles.anonymousBadge}>
                            <Ionicons name="eye-off" size={12} color="#6b7280" />
                            <Text style={styles.badgeText}>Anonymous</Text>
                        </View>
                    )}
                    {poll.is_multiple_choice && (
                        <View style={styles.multipleBadge}>
                            <Ionicons name="checkbox" size={12} color="#6b7280" />
                            <Text style={styles.badgeText}>Multiple</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Poll Question */}
            <View style={styles.pollQuestionContainer}>
                <Ionicons name="help-circle" size={20} color="#00aeed" />
                <Text style={styles.pollQuestion}>{poll.question}</Text>
            </View>

            {/* Poll Status */}
            {(poll.is_closed || poll.is_expired) && (
                <View style={[styles.statusBanner, poll.is_closed ? styles.closedBanner : styles.expiredBanner]}>
                    <Ionicons 
                        name={poll.is_closed ? "lock-closed" : "time"} 
                        size={14} 
                        color={poll.is_closed ? "#dc2626" : "#f59e0b"} 
                    />
                    <Text style={[styles.statusText, poll.is_closed ? styles.closedText : styles.expiredText]}>
                        {poll.is_closed ? "Poll Closed" : "Poll Expired"}
                    </Text>
                </View>
            )}

            {/* Expiration Timer */}
            {poll.expires_at && !poll.is_closed && !poll.is_expired && (
                <View style={styles.expiresContainer}>
                    <Ionicons name="timer-outline" size={14} color="#f59e0b" />
                    <Text style={styles.expiresText}>{formatExpiresIn(poll.expires_at)}</Text>
                </View>
            )}

            {/* Poll Options */}
            <View style={styles.optionsContainer}>
                {poll.options.map((option) => {
                    const isSelected = selectedOptions.includes(option.id);
                    const isVoted = poll.user_votes?.includes(option.id);
                    
                    return (
                        <TouchableOpacity
                            key={option.id}
                            style={[
                                styles.optionItem,
                                isSelected && styles.optionSelected,
                                isVoted && styles.optionVoted,
                            ]}
                            onPress={() => handleOptionPress(option.id)}
                            disabled={!canVote || isVoting}
                            activeOpacity={canVote ? 0.7 : 1}
                        >
                            {showResults && (
                                <View 
                                    style={[
                                        styles.optionProgressBar,
                                        { width: `${option.vote_percentage}%` },
                                        isVoted && styles.optionProgressVoted,
                                    ]} 
                                />
                            )}
                            <View style={styles.optionContent}>
                                <View style={styles.optionLeft}>
                                    {canVote ? (
                                        <View style={[
                                            styles.optionCheckbox,
                                            poll.is_multiple_choice ? styles.checkboxSquare : styles.checkboxCircle,
                                            isSelected && styles.checkboxSelected,
                                        ]}>
                                            {isSelected && (
                                                <Ionicons 
                                                    name={poll.is_multiple_choice ? "checkmark" : "ellipse"} 
                                                    size={poll.is_multiple_choice ? 14 : 8} 
                                                    color="#ffffff" 
                                                />
                                            )}
                                        </View>
                                    ) : isVoted ? (
                                        <Ionicons name="checkmark-circle" size={20} color="#00aeed" />
                                    ) : null}
                                    <Text style={[
                                        styles.optionText,
                                        isVoted && styles.optionTextVoted,
                                    ]}>
                                        {option.option_text}
                                    </Text>
                                </View>
                                {showResults && (
                                    <View style={styles.optionRight}>
                                        <Text style={styles.optionVotes}>
                                            {option.votes_count} {option.votes_count === 1 ? "vote" : "votes"}
                                        </Text>
                                        <Text style={styles.optionPercentage}>
                                            {option.vote_percentage.toFixed(0)}%
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Total Votes */}
            <View style={styles.totalVotesContainer}>
                <Ionicons name="people" size={14} color="#9ca3af" />
                <Text style={styles.totalVotesText}>
                    {poll.total_votes} {poll.total_votes === 1 ? "vote" : "votes"}
                </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.pollActions}>
                {canVote && (
                    <TouchableOpacity
                        style={[
                            styles.voteButton,
                            selectedOptions.length === 0 && styles.voteButtonDisabled,
                        ]}
                        onPress={handleVote}
                        disabled={selectedOptions.length === 0 || isVoting}
                    >
                        {isVoting ? (
                            <ActivityIndicator size="small" color="#ffffff" />
                        ) : (
                            <>
                                <Ionicons name="checkmark-circle" size={18} color="#ffffff" />
                                <Text style={styles.voteButtonText}>Vote</Text>
                            </>
                        )}
                    </TouchableOpacity>
                )}
                {canClose && (
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => {
                            Alert.alert(
                                "Close Poll",
                                "Are you sure you want to close this poll? This cannot be undone.",
                                [
                                    { text: "Cancel", style: "cancel" },
                                    { text: "Close Poll", style: "destructive", onPress: () => onClose(poll.id) },
                                ]
                            );
                        }}
                    >
                        <Ionicons name="lock-closed" size={16} color="#dc2626" />
                        <Text style={styles.closeButtonText}>Close Poll</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

function CreatePollModal({
    visible,
    onClose,
    onCreate,
    isCreating,
}: {
    visible: boolean;
    onClose: () => void;
    onCreate: (question: string, options: string[], isMultiple: boolean, isAnonymous: boolean, expiresInHours: number | null) => void;
    isCreating: boolean;
}) {
    const [question, setQuestion] = useState("");
    const [options, setOptions] = useState(["", ""]);
    const [isMultipleChoice, setIsMultipleChoice] = useState(false);
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [expiresInHours, setExpiresInHours] = useState<string>("");

    const addOption = () => {
        if (options.length < 10) {
            setOptions([...options, ""]);
        }
    };

    const removeOption = (index: number) => {
        if (options.length > 2) {
            setOptions(options.filter((_, i) => i !== index));
        }
    };

    const updateOption = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const handleCreate = () => {
        const trimmedQuestion = question.trim();
        const trimmedOptions = options.map(o => o.trim()).filter(o => o.length > 0);

        if (!trimmedQuestion) {
            Alert.alert("Error", "Please enter a question.");
            return;
        }
        if (trimmedOptions.length < 2) {
            Alert.alert("Error", "Please enter at least 2 options.");
            return;
        }

        const hours = expiresInHours ? parseInt(expiresInHours, 10) : null;
        if (hours !== null && (isNaN(hours) || hours < 1 || hours > 168)) {
            Alert.alert("Error", "Expiration time must be between 1 and 168 hours (7 days).");
            return;
        }

        onCreate(trimmedQuestion, trimmedOptions, isMultipleChoice, isAnonymous, hours);
    };

    const resetForm = () => {
        setQuestion("");
        setOptions(["", ""]);
        setIsMultipleChoice(false);
        setIsAnonymous(false);
        setExpiresInHours("");
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <SafeAreaView style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <TouchableOpacity onPress={() => { resetForm(); onClose(); }}>
                        <Text style={styles.modalCancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>Create Poll</Text>
                    <TouchableOpacity 
                        onPress={handleCreate}
                        disabled={isCreating}
                    >
                        {isCreating ? (
                            <ActivityIndicator size="small" color="#00aeed" />
                        ) : (
                            <Text style={styles.modalCreateText}>Create</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                    {/* Question */}
                    <View style={styles.formSection}>
                        <Text style={styles.formLabel}>Question</Text>
                        <TextInput
                            style={styles.questionInput}
                            placeholder="Ask a question..."
                            placeholderTextColor="#9ca3af"
                            value={question}
                            onChangeText={setQuestion}
                            multiline
                            maxLength={500}
                        />
                    </View>

                    {/* Options */}
                    <View style={styles.formSection}>
                        <Text style={styles.formLabel}>Options</Text>
                        {options.map((option, index) => (
                            <View key={index} style={styles.optionInputRow}>
                                <TextInput
                                    style={styles.optionInput}
                                    placeholder={`Option ${index + 1}`}
                                    placeholderTextColor="#9ca3af"
                                    value={option}
                                    onChangeText={(value) => updateOption(index, value)}
                                    maxLength={200}
                                />
                                {options.length > 2 && (
                                    <TouchableOpacity
                                        style={styles.removeOptionButton}
                                        onPress={() => removeOption(index)}
                                    >
                                        <Ionicons name="close-circle" size={24} color="#dc2626" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        ))}
                        {options.length < 10 && (
                            <TouchableOpacity style={styles.addOptionButton} onPress={addOption}>
                                <Ionicons name="add-circle" size={20} color="#00aeed" />
                                <Text style={styles.addOptionText}>Add Option</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Settings */}
                    <View style={styles.formSection}>
                        <Text style={styles.formLabel}>Settings</Text>
                        
                        <TouchableOpacity
                            style={styles.settingRow}
                            onPress={() => setIsMultipleChoice(!isMultipleChoice)}
                        >
                            <View style={styles.settingInfo}>
                                <Ionicons name="checkbox-outline" size={20} color="#6b7280" />
                                <View style={styles.settingTextContainer}>
                                    <Text style={styles.settingTitle}>Multiple Choice</Text>
                                    <Text style={styles.settingDescription}>Allow selecting multiple options</Text>
                                </View>
                            </View>
                            <View style={[styles.toggle, isMultipleChoice && styles.toggleActive]}>
                                <View style={[styles.toggleKnob, isMultipleChoice && styles.toggleKnobActive]} />
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.settingRow}
                            onPress={() => setIsAnonymous(!isAnonymous)}
                        >
                            <View style={styles.settingInfo}>
                                <Ionicons name="eye-off-outline" size={20} color="#6b7280" />
                                <View style={styles.settingTextContainer}>
                                    <Text style={styles.settingTitle}>Anonymous Voting</Text>
                                    <Text style={styles.settingDescription}>Hide who voted for what</Text>
                                </View>
                            </View>
                            <View style={[styles.toggle, isAnonymous && styles.toggleActive]}>
                                <View style={[styles.toggleKnob, isAnonymous && styles.toggleKnobActive]} />
                            </View>
                        </TouchableOpacity>

                        <View style={styles.settingRow}>
                            <View style={styles.settingInfo}>
                                <Ionicons name="timer-outline" size={20} color="#6b7280" />
                                <View style={styles.settingTextContainer}>
                                    <Text style={styles.settingTitle}>Expires In (hours)</Text>
                                    <Text style={styles.settingDescription}>Leave empty for no expiration</Text>
                                </View>
                            </View>
                            <TextInput
                                style={styles.expiresInput}
                                placeholder="24"
                                placeholderTextColor="#9ca3af"
                                value={expiresInHours}
                                onChangeText={setExpiresInHours}
                                keyboardType="number-pad"
                                maxLength={3}
                            />
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </Modal>
    );
}

export default function PollsScreen() {
    const router = useRouter();
    const { id, groupName } = useLocalSearchParams<{ id: string; groupName?: string }>();
    const { user } = useAppSelector((state) => state.auth);
    const [polls, setPolls] = useState<Poll[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isVoting, setIsVoting] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const currentUserId = user?.id;
    const isTeacher = user?.role_name === "teacher";

    const fetchPolls = useCallback(async (showRefresh = false) => {
        if (!id) return;

        try {
            if (showRefresh) setIsRefreshing(true);
            setError(null);

            const response = await pollsService.getPolls(Number(id));
            if (response.data) {
                setPolls(response.data);
            }
        } catch (err: any) {
            setError(err.message || "Failed to load polls");
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [id]);

    useEffect(() => {
        fetchPolls();
    }, [fetchPolls]);

    const handleVote = async (pollId: number, optionIds: number[]) => {
        if (!id) return;

        setIsVoting(true);
        try {
            const response = await pollsService.vote(Number(id), pollId, optionIds);
            if (response.data) {
                setPolls(prev => prev.map(p => p.id === pollId ? response.data : p));
            }
        } catch (err: any) {
            Alert.alert("Error", err.message || "Failed to submit vote");
        } finally {
            setIsVoting(false);
        }
    };

    const handleClosePoll = async (pollId: number) => {
        if (!id) return;

        try {
            const response = await pollsService.closePoll(Number(id), pollId);
            if (response.data) {
                setPolls(prev => prev.map(p => p.id === pollId ? response.data : p));
            }
        } catch (err: any) {
            Alert.alert("Error", err.message || "Failed to close poll");
        }
    };

    const handleCreatePoll = async (
        question: string,
        options: string[],
        isMultiple: boolean,
        isAnonymous: boolean,
        expiresInHours: number | null
    ) => {
        if (!id) return;

        setIsCreating(true);
        try {
            const response = await pollsService.createPoll(Number(id), {
                question,
                options,
                is_multiple_choice: isMultiple,
                is_anonymous: isAnonymous,
                expires_in_hours: expiresInHours || undefined,
            });
            if (response.data) {
                setPolls(prev => [response.data, ...prev]);
                setShowCreateModal(false);
            }
        } catch (err: any) {
            Alert.alert("Error", err.message || "Failed to create poll");
        } finally {
            setIsCreating(false);
        }
    };

    const displayName = groupName || "Polls";

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <Stack.Screen options={{ headerShown: false }} />
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={24} color="#111827" />
                    </TouchableOpacity>
                    <View style={styles.headerInfo}>
                        <Text style={styles.headerTitle}>Polls</Text>
                        <Text style={styles.headerSubtitle}>{displayName}</Text>
                    </View>
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#00aeed" />
                    <Text style={styles.loadingText}>Loading polls...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={24} color="#111827" />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <Text style={styles.headerTitle}>Polls</Text>
                    <Text style={styles.headerSubtitle}>{displayName}</Text>
                </View>
                <TouchableOpacity
                    style={styles.createButton}
                    onPress={() => setShowCreateModal(true)}
                >
                    <Ionicons name="add" size={24} color="#00aeed" />
                </TouchableOpacity>
            </View>

            {/* Error Banner */}
            {error && (
                <View style={styles.errorBanner}>
                    <Text style={styles.errorBannerText}>{error}</Text>
                    <TouchableOpacity onPress={() => setError(null)}>
                        <Ionicons name="close" size={20} color="#ffffff" />
                    </TouchableOpacity>
                </View>
            )}

            {/* Polls List */}
            <FlatList
                data={polls}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <PollCard
                        poll={item}
                        onVote={handleVote}
                        onClose={handleClosePoll}
                        isVoting={isVoting}
                        currentUserId={currentUserId}
                        isTeacher={isTeacher}
                    />
                )}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={() => fetchPolls(true)}
                        colors={["#00aeed"]}
                        tintColor="#00aeed"
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="bar-chart-outline" size={64} color="#d1d5db" />
                        <Text style={styles.emptyTitle}>No Polls Yet</Text>
                        <Text style={styles.emptySubtitle}>
                            Create a poll to get feedback from your group
                        </Text>
                        <TouchableOpacity
                            style={styles.emptyCreateButton}
                            onPress={() => setShowCreateModal(true)}
                        >
                            <Ionicons name="add-circle" size={20} color="#ffffff" />
                            <Text style={styles.emptyCreateText}>Create Poll</Text>
                        </TouchableOpacity>
                    </View>
                }
            />

            {/* Create Poll Modal */}
            <CreatePollModal
                visible={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onCreate={handleCreatePoll}
                isCreating={isCreating}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9fafb",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: "#ffffff",
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
    },
    backButton: {
        padding: 8,
        marginRight: 4,
    },
    headerInfo: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: "600",
        color: "#111827",
    },
    headerSubtitle: {
        fontSize: 13,
        color: "#6b7280",
        marginTop: 2,
    },
    createButton: {
        padding: 8,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: "#6b7280",
    },
    errorBanner: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#dc2626",
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    errorBannerText: {
        flex: 1,
        fontSize: 14,
        color: "#ffffff",
        marginRight: 12,
    },
    listContent: {
        padding: 16,
    },
    pollCard: {
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    pollHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    pollCreatorInfo: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    creatorAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
    },
    creatorAvatarInitials: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
    },
    creatorInitialsText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#ffffff",
    },
    pollCreatorDetails: {
        marginLeft: 10,
        flex: 1,
    },
    creatorName: {
        fontSize: 14,
        fontWeight: "600",
        color: "#111827",
    },
    pollTime: {
        fontSize: 12,
        color: "#9ca3af",
        marginTop: 2,
    },
    pollBadges: {
        flexDirection: "row",
        gap: 6,
    },
    anonymousBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f3f4f6",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    multipleBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f3f4f6",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    badgeText: {
        fontSize: 11,
        color: "#6b7280",
        fontWeight: "500",
    },
    pollQuestionContainer: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 12,
        gap: 8,
    },
    pollQuestion: {
        flex: 1,
        fontSize: 16,
        fontWeight: "600",
        color: "#111827",
        lineHeight: 22,
    },
    statusBanner: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        marginBottom: 12,
        gap: 6,
    },
    closedBanner: {
        backgroundColor: "#fef2f2",
    },
    expiredBanner: {
        backgroundColor: "#fffbeb",
    },
    statusText: {
        fontSize: 13,
        fontWeight: "500",
    },
    closedText: {
        color: "#dc2626",
    },
    expiredText: {
        color: "#f59e0b",
    },
    expiresContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
        gap: 4,
    },
    expiresText: {
        fontSize: 12,
        color: "#f59e0b",
        fontWeight: "500",
    },
    optionsContainer: {
        gap: 8,
        marginBottom: 12,
    },
    optionItem: {
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        overflow: "hidden",
        position: "relative",
    },
    optionSelected: {
        borderColor: "#00aeed",
        backgroundColor: "#f0f9ff",
    },
    optionVoted: {
        borderColor: "#00aeed",
    },
    optionProgressBar: {
        position: "absolute",
        top: 0,
        left: 0,
        bottom: 0,
        backgroundColor: "#e6f7fd",
        borderRadius: 11,
    },
    optionProgressVoted: {
        backgroundColor: "#d1f0fd",
    },
    optionContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    optionLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        gap: 10,
    },
    optionCheckbox: {
        width: 22,
        height: 22,
        borderWidth: 2,
        borderColor: "#d1d5db",
        justifyContent: "center",
        alignItems: "center",
    },
    checkboxCircle: {
        borderRadius: 11,
    },
    checkboxSquare: {
        borderRadius: 4,
    },
    checkboxSelected: {
        backgroundColor: "#00aeed",
        borderColor: "#00aeed",
    },
    optionText: {
        fontSize: 15,
        color: "#374151",
        flex: 1,
    },
    optionTextVoted: {
        fontWeight: "600",
        color: "#00aeed",
    },
    optionRight: {
        alignItems: "flex-end",
        marginLeft: 12,
    },
    optionVotes: {
        fontSize: 12,
        color: "#6b7280",
    },
    optionPercentage: {
        fontSize: 14,
        fontWeight: "600",
        color: "#111827",
    },
    totalVotesContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 12,
    },
    totalVotesText: {
        fontSize: 13,
        color: "#9ca3af",
    },
    pollActions: {
        flexDirection: "row",
        gap: 12,
    },
    voteButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#00aeed",
        paddingVertical: 12,
        borderRadius: 10,
        gap: 6,
    },
    voteButtonDisabled: {
        backgroundColor: "#9ca3af",
    },
    voteButtonText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#ffffff",
    },
    closeButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fef2f2",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 10,
        gap: 6,
    },
    closeButtonText: {
        fontSize: 14,
        fontWeight: "500",
        color: "#dc2626",
    },
    emptyContainer: {
        alignItems: "center",
        paddingVertical: 60,
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#374151",
        marginTop: 16,
    },
    emptySubtitle: {
        fontSize: 14,
        color: "#9ca3af",
        textAlign: "center",
        marginTop: 8,
        lineHeight: 20,
    },
    emptyCreateButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#00aeed",
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 10,
        marginTop: 24,
        gap: 8,
    },
    emptyCreateText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#ffffff",
    },
    // Modal Styles
    modalContainer: {
        flex: 1,
        backgroundColor: "#f9fafb",
    },
    modalHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "#ffffff",
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
    },
    modalCancelText: {
        fontSize: 16,
        color: "#6b7280",
    },
    modalTitle: {
        fontSize: 17,
        fontWeight: "600",
        color: "#111827",
    },
    modalCreateText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#00aeed",
    },
    modalContent: {
        flex: 1,
        padding: 16,
    },
    formSection: {
        marginBottom: 24,
    },
    formLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#374151",
        marginBottom: 10,
    },
    questionInput: {
        backgroundColor: "#ffffff",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: "#111827",
        minHeight: 80,
        textAlignVertical: "top",
    },
    optionInputRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    optionInput: {
        flex: 1,
        backgroundColor: "#ffffff",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: "#111827",
    },
    removeOptionButton: {
        padding: 8,
        marginLeft: 8,
    },
    addOptionButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        gap: 6,
    },
    addOptionText: {
        fontSize: 15,
        fontWeight: "500",
        color: "#00aeed",
    },
    settingRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#ffffff",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginBottom: 10,
    },
    settingInfo: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        gap: 12,
    },
    settingTextContainer: {
        flex: 1,
    },
    settingTitle: {
        fontSize: 15,
        fontWeight: "500",
        color: "#111827",
    },
    settingDescription: {
        fontSize: 12,
        color: "#9ca3af",
        marginTop: 2,
    },
    toggle: {
        width: 48,
        height: 28,
        borderRadius: 14,
        backgroundColor: "#e5e7eb",
        justifyContent: "center",
        paddingHorizontal: 2,
    },
    toggleActive: {
        backgroundColor: "#00aeed",
    },
    toggleKnob: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: "#ffffff",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    toggleKnobActive: {
        alignSelf: "flex-end",
    },
    expiresInput: {
        width: 60,
        backgroundColor: "#f3f4f6",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 15,
        color: "#111827",
        textAlign: "center",
    },
});
