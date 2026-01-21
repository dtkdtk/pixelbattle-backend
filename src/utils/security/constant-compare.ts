import { timingSafeEqual } from "crypto";

export const constantTimeCompare = (a: string, b: string) => {
    const buf1 = Buffer.from(a);
    const buf2 = Buffer.from(b);

    if (buf1.length !== buf2.length) {
        return false;
    }
    return timingSafeEqual(buf1, buf2);
};
