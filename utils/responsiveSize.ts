import { Dimensions, PixelRatio } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Base dimensions for scaling (adjust based on your design's reference device)
const BASE_WIDTH = 375; // e.g., iPhone 11 Pro width
const BASE_HEIGHT = 812; // e.g., iPhone 11 Pro height

/**
 * Scales a size value proportionally based on screen width.
 * @param {number} size - The size value to scale.
 * @returns {number} - The scaled size.
 */
export function horizontalScale(size: number) {
    return Math.round((SCREEN_WIDTH / BASE_WIDTH) * size);
}

/**
 * Scales a size value proportionally based on screen height.
 * @param {number} size - The size value to scale.
 * @returns {number} - The scaled size.
 */
export function verticalScale(size: number) {
    return Math.round((SCREEN_HEIGHT / BASE_HEIGHT) * size);
}

/**
 * Scales a size value with a customizable scaling factor for more control.
 * @param {number} size - The size value to scale.
 * @param {number} [factor=0.5] - The scaling factor to control intensity.
 * @returns {number} - The scaled size.
 */
export function moderateScale(size: number, factor = 0.5) {
    return size + (horizontalScale(size) - size) * factor;
}

/**
 * Scales a size value considering both screen dimensions and pixel density.
 * @param {number} size - The size value to scale.
 * @returns {number} - The density-aware scaled size.
 */
export function scaleWithDensity(size: number) {
    const scale = SCREEN_WIDTH / BASE_WIDTH;
    const newSize = size * scale;
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
}

// Export all responsive utilities
export const responsiveSize = {
    horizontalScale,
    verticalScale,
    moderateScale,
    scaleWithDensity,
};
