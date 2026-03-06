import { Palette } from "@/constants/theme";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { PullToRefreshProvider } from "@/providers/PullToRefreshProvider";
import React, { type ReactNode } from "react";
import {
    FlatList,
    RefreshControl,
    ScrollView,
    type FlatListProps,
    type ScrollViewProps,
    type StyleProp,
    type ViewStyle,
} from "react-native";

type RefetchFn = () => Promise<unknown> | unknown;

interface PullToRefreshScrollViewProps extends Omit<
    ScrollViewProps,
    "refreshControl"
> {
    children: ReactNode;
    refetches?: RefetchFn[];
    tintColor?: string;
    onRefreshComplete?: () => void;
    onRefreshError?: (error: unknown) => void;
    style?: StyleProp<ViewStyle>;
    contentContainerStyle?: StyleProp<ViewStyle>;
}

export function PullToRefreshScrollView({
    children,
    refetches = [],
    tintColor,
    onRefreshComplete,
    onRefreshError,
    style,
    contentContainerStyle,
    ...scrollViewProps
}: PullToRefreshScrollViewProps) {
    return (
        <PullToRefreshProvider
            refetches={refetches}
            onRefreshComplete={onRefreshComplete}
            onRefreshError={onRefreshError}
        >
            <PullToRefreshScrollViewInner
                tintColor={tintColor}
                style={style}
                contentContainerStyle={contentContainerStyle}
                {...scrollViewProps}
            >
                {children}
            </PullToRefreshScrollViewInner>
        </PullToRefreshProvider>
    );
}

function PullToRefreshScrollViewInner({
    children,
    tintColor,
    style,
    contentContainerStyle,
    ...scrollViewProps
}: Omit<
    PullToRefreshScrollViewProps,
    "refetches" | "onRefreshComplete" | "onRefreshError"
>) {
    const { refreshing, onRefresh } = usePullToRefresh();

    return (
        <ScrollView
            style={style}
            contentContainerStyle={contentContainerStyle}
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor={tintColor ?? Palette.brand[500]}
                    colors={[tintColor ?? Palette.brand[500]]} // Android
                />
            }
            {...scrollViewProps}
        >
            {children}
        </ScrollView>
    );
}

export function RefreshableFlatList<T>({
    horizontal,
    ...props
}: FlatListProps<T>) {
    return (
        <FlatList
            {...props}
            horizontal={horizontal}
            // Only disable scroll for vertical lists — horizontal ones are fine
            scrollEnabled={horizontal ? true : false}
            nestedScrollEnabled={false}
            showsVerticalScrollIndicator={false}
        />
    );
}
