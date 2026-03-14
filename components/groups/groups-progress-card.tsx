import { useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { ThemedText } from "../themed-text";
import { DonutChart } from "./groups-donut-chart";

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    total: number;
}

interface ProgressCardProps {
    label: string;
    highlight?: string;
    elapsed: number;
    total: number;
    nextSessionDate?: Date;
}

export function ProgressCard({
    label,
    highlight,
    elapsed,
    total,
    nextSessionDate,
}: ProgressCardProps) {
    const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
    const [countdownMode, setCountdownMode] = useState<
        "upcoming" | "current" | "ended"
    >("ended");

    // Calculate time left for countdown
    useEffect(() => {
        if (!nextSessionDate) {
            console.error("❌ No nextSessionDate provided");
            setTimeLeft(null);
            setCountdownMode("ended");
            return;
        }

        const calculateTimeLeft = () => {
            const now = new Date();

            const target = now < nextSessionDate ? nextSessionDate : null;
            const mode = now < nextSessionDate ? "upcoming" : "ended";

            setCountdownMode(mode);
            if (!target) {
                setTimeLeft(null);
                return;
            }

            const difference = target.getTime() - now.getTime();

            if (difference <= 0) {
                setTimeLeft({
                    days: 0,
                    hours: 0,
                    minutes: 0,
                    seconds: 0,
                    total: 0,
                });
                return;
            }

            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor(
                (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
            );
            const minutes = Math.floor(
                (difference % (1000 * 60 * 60)) / (1000 * 60),
            );
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            const newTimeLeft = {
                days,
                hours,
                minutes,
                seconds,
                total: difference,
            };
            setTimeLeft(newTimeLeft);
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, [nextSessionDate]);

    // Format display time
    const displayTime = useMemo(() => {
        if (!timeLeft) {
            return {
                value1: "00",
                value2: "00",
                label1: "h",
                label2: "m",
                showDays: false,
            };
        }

        // More than 24 hours: show days and hours
        if (timeLeft.days > 0) {
            return {
                value1: timeLeft.days.toString().padStart(2, "0"),
                value2: timeLeft.hours.toString().padStart(2, "0"),
                label1: "d",
                label2: "h",
                showDays: true,
            };
        }

        // Less than 24 hours: show hours and minutes
        return {
            value1: timeLeft.hours.toString().padStart(2, "0"),
            value2: timeLeft.minutes.toString().padStart(2, "0"),
            label1: "h",
            label2: "m",
            showDays: false,
        };
    }, [timeLeft]);

    // Color based on time remaining
    const progressColor = useMemo(() => {
        if (!timeLeft) return "#00ADEF";

        const totalMinutes = Math.floor(timeLeft.total / (1000 * 60));

        // Less than 30 minutes - urgent red/orange
        if (totalMinutes <= 30) {
            return "#F97316";
        }
        // Less than 1 hour - warning orange/yellow
        if (totalMinutes <= 60) {
            return "#F59E0B";
        }
        // Less than 3 hours - yellow/green
        if (totalMinutes <= 180) {
            return "#FFB800";
        }
        // Less than 24 hours - green/blue
        if (totalMinutes <= 1440) {
            return "#22C55E";
        }
        // More than 24 hours - calm blue
        return "#00ADEF";
    }, [timeLeft]);

    const countdownLabel = countdownMode === "upcoming" ? "Starts in" : "Ended";

    return (
        <View style={styles.card}>
            <View style={styles.left}>
                <ThemedText style={styles.label} fontSize={13}>
                    {label}
                </ThemedText>

                {highlight && (
                    <ThemedText style={styles.highlight} fontSize={13}>
                        {highlight}
                    </ThemedText>
                )}
            </View>

            <DonutChart
                elapsed={elapsed}
                total={total}
                nextSessionDate={nextSessionDate}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        position: "absolute",
        top: 120,
        width: "80%",
        left: "10%",
        height: 72,
        borderRadius: 16,
        backgroundColor: "#FFF3DD",
        overflow: "hidden",
        flexDirection: "row",
        alignItems: "center",
        paddingLeft: 17,
        paddingRight: 12,
        justifyContent: "space-between",
    },
    left: {
        flex: 1,
        gap: 2,
    },
    label: {
        fontFamily: "Poppins-Regular",
        color: "#A4A3A3",
        textTransform: "lowercase",
    },
    highlight: {
        fontFamily: "Poppins-Medium",
        color: "#24ADE3",
        textTransform: "lowercase",
    },
    countdownContainer: {
        gap: 2,
    },
    timeContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 2,
    },
    timeUnit: {
        alignItems: "center",
    },
});
