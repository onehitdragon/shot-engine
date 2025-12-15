Math.Deg2Rad = Math.PI / 180;
Math.clamp = (value: number, min: number, max: number) => {
    return Math.min(Math.max(value, min), max);
}