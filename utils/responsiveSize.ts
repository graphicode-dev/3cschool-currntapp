import { Dimensions, PixelRatio } from "react-native";

// Base dimensions for scaling (adjust based on your design's reference device)
const BASE_WIDTH = 375; // e.g., iPhone 11 Pro width
const BASE_HEIGHT = 812; // e.g., iPhone 11 Pro height

// Maximum scaling factor to prevent oversized UI on tablets
const MAX_SCALE_FACTOR = 1.25;

/**
 * Scales a size value proportionally based on screen width.
 * Uses the shortest dimension to remain consistent in landscape mode.
 * @param {number} size - The size value to scale.
 * @returns {number} - The scaled size.
 */
export function horizontalScale(size: number) {
    const { width, height } = Dimensions.get("window");
    const shortDimension = Math.min(width, height);
    const scaleFactor = Math.min(shortDimension / BASE_WIDTH, MAX_SCALE_FACTOR);
    return Math.round(scaleFactor * size);
}

/**
 * Scales a size value proportionally based on screen height.
 * Uses the longest dimension to remain consistent in landscape mode.
 * @param {number} size - The size value to scale.
 * @returns {number} - The scaled size.
 */
export function verticalScale(size: number) {
    const { width, height } = Dimensions.get("window");
    const longDimension = Math.max(width, height);
    const scaleFactor = Math.min(longDimension / BASE_HEIGHT, MAX_SCALE_FACTOR);
    return Math.round(scaleFactor * size);
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
    const { width, height } = Dimensions.get("window");
    const shortDimension = Math.min(width, height);
    const scale = Math.min(shortDimension / BASE_WIDTH, MAX_SCALE_FACTOR);
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
