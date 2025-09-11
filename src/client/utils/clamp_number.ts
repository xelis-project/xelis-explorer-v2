export const clamp_number = (value: number, min: number, max: number) => {
    return Math.min(max, Math.max(min, value));
}