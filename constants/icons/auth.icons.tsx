import { Palette } from "@/constants/theme";
import React from "react";
import Svg, { Circle, Path } from "react-native-svg";
import { TabIconProps } from ".";

const iconColor = Palette.brand[300];

export function EyeIcon({ size = 24 }: TabIconProps) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path
                d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z"
                stroke={iconColor}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <Circle
                cx="12"
                cy="12"
                r="3"
                stroke={iconColor}
                strokeWidth={1.5}
            />
        </Svg>
    );
}

export function EyeOffIcon({ size = 24 }: TabIconProps) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path
                d="M9.88 9.88C9.58 10.18 9.4 10.58 9.4 11C9.4 11.69 9.71 12.31 10.2 12.71C10.6 13.03 11.08 13.2 11.6 13.2C12.18 13.2 12.71 12.96 13.12 12.56"
                stroke={iconColor}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <Path
                d="M14.12 14.12C13.26 14.82 12.18 15.2 11 15.2C7.69 15.2 5 12 5 12C5 12 5.94 10.77 7.22 9.78"
                stroke={iconColor}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <Path
                d="M17 14.12C18.36 13.06 19.5 11.68 20 11C20 11 17.31 7.8 14 6.8"
                stroke={iconColor}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <Path
                d="M3 3L21 21"
                stroke={iconColor}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
}
