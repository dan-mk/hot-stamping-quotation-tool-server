export function cmToPixels(cm, dpi = 300) {
    return parseInt(cm * dpi / 2.54);
}