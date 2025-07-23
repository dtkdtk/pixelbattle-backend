import type { Point } from "@modules/canvas";

export function number(hex: number): [number, number, number] {
    return [(hex >> 16) & 0xff, (hex >> 8) & 0xff, hex & 0xff];
}

export function hexadecimal(hex: string): number[] {
    const R = parseInt(hex.slice(1, 3), 16);
    const G = parseInt(hex.slice(3, 5), 16);
    const B = parseInt(hex.slice(5, 7), 16);

    return [R, G, B];
}

export function RGB(RGB: Uint8ClampedArray | number[]): number {
    const [R, G, B] = RGB;
    return (R << 16) | (G << 8) | B;
}
