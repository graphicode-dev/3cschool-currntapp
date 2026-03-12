import { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { ThemedText } from "../themed-text";

// ─── Countdown formatter ──────────────────────────────────────────────────────

/**
 * > 24 h  →  { top: "3",    bottom: "days" }
 * ≤ 24 h  →  { top: "2:45", bottom: "hrs"  }
 *    now  →  { top: "now",  bottom: ""     }
 * no session → { top: "--",  bottom: ""     }
 */
function formatCountdown(msLeft: number): { top: string; bottom: string } {
    if (msLeft <= 0) return { top: "now", bottom: "" };

    const totalMinutes = Math.floor(msLeft / 60_000);
    const totalHours = Math.floor(msLeft / 3_600_000);
    const days = Math.floor(msLeft / 86_400_000);

    if (totalHours >= 24) {
        return { top: `${days}`, bottom: "days" };
    }

    const h = totalHours;
    const m = totalMinutes % 60;
    return {
        top: `${h}:${String(m).padStart(2, "0")}`,
        bottom: "hrs",
    };
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DonutChart({
    elapsed,
    total,
    nextSessionDate,
}: {
    elapsed: number;
    total: number;
    nextSessionDate?: Date;
}) {
    const SIZE = 64;
    const STROKE = 7;
    const R = (SIZE - STROKE) / 2;
    const CIRC = 2 * Math.PI * R;

    // Ring progress = sessions completed ratio
    const pct = total > 0 ? Math.min(elapsed / total, 1) : 0;
    const filled = pct * CIRC;
    const cx = SIZE / 2;

    // Live countdown — ticks every minute
    const [msLeft, setMsLeft] = useState<number>(() =>
        nextSessionDate ? nextSessionDate.getTime() - Date.now() : -1,
    );
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (!nextSessionDate) {
            setMsLeft(-1);
            return;
        }
        const tick = () => {
            const newMsLeft = nextSessionDate.getTime() - Date.now();
            setMsLeft(newMsLeft);
        };
        tick();
        intervalRef.current = setInterval(tick, 60_000);
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [nextSessionDate?.getTime()]);

    // Center always shows countdown — never the session count
    const { top, bottom } = nextSessionDate
        ? formatCountdown(msLeft)
        : { top: "--", bottom: "" };

    return (
        <View style={styles.wrap}>
            <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
                {/* Track */}
                <Circle
                    cx={cx}
                    cy={cx}
                    r={R}
                    stroke="#E9F7FC"
                    strokeWidth={STROKE}
                    fill="none"
                />
                {/* Progress arc — starts at 12 o'clock */}
                {pct > 0 && (
                    <Circle
                        cx={cx}
                        cy={cx}
                        r={R}
                        stroke="#24ADE3"
                        strokeWidth={STROKE}
                        fill="none"
                        strokeDasharray={`${filled} ${CIRC - filled}`}
                        strokeLinecap="round"
                        rotation={-90}
                        origin={`${cx}, ${cx}`}
                    />
                )}
            </Svg>

            {/* Center countdown text */}
            <View style={styles.center}>
                <ThemedText style={styles.top}>{top}</ThemedText>
                {!!bottom && (
                    <ThemedText style={styles.bottom}>{bottom}</ThemedText>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        width: 64,
        height: 64,
        alignItems: "center",
        justifyContent: "center",
    },
    center: {
        position: "absolute",
        alignItems: "center",
        justifyContent: "center",
    },
    top: {
        fontSize: 12,
        fontFamily: "Poppins-SemiBold",
        color: "#24ADE3",
        lineHeight: 15,
        textAlign: "center",
    },
    bottom: {
        fontSize: 8,
        fontFamily: "Poppins-Regular",
        color: "#A4A3A3",
        lineHeight: 11,
        textAlign: "center",
    },
});
