import { Rgb } from "@sparkengine";

function hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // Convert to a 32-bit integer
    }
    return hash;
}

export function uuidToRgb(uuid: string): Rgb {
    const i = hashCode(uuid);

    const red = (i >> 16) & 0xFF;
    const green = (i >> 8) & 0xFF;
    const blue = i & 0xFF;
    return new Rgb(red, green, blue);
}