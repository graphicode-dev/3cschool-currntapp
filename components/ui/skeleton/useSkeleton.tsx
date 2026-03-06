// useSkeleton.tsx

import React from "react";
import { useLoadingScope } from "./LoadingScopeContext";
import { SkeletonRegistry, SkeletonType } from "./SkeletonRegistry";

export function withSkeleton<P extends object>(
    type: SkeletonType,
    Component: React.ComponentType<P>,
) {
    const Wrapped = (props: P) => {
        const { isLoading } = useLoadingScope();
        if (isLoading) {
            const Skeleton = SkeletonRegistry[type];
            return Skeleton ? <Skeleton /> : null;
        }
        return <Component {...props} />;
    };
    Wrapped.displayName = `withSkeleton(${Component.displayName || Component.name || "Component"})`;
    Wrapped.skeletonType = type;
    return Wrapped;
}

export function SkeletonList<T>({
    data,
    type,
    count = 3,
    renderItem,
}: {
    data: T[];
    type: SkeletonType;
    count?: number;
    renderItem: (item: T, index?: number) => React.ReactNode;
}) {
    const { isLoading } = useLoadingScope();

    if (isLoading) {
        const Skeleton = SkeletonRegistry[type];
        if (!Skeleton) return null;
        return Array.from({ length: count }).map((_, i) => (
            <Skeleton key={i} />
        ));
    }

    return <>{data.map(renderItem)}</>;
}
