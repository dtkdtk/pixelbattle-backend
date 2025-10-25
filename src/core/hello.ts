import { readFileSync } from "fs";

const splitAt = 60;

export default (function () {
    const art = readFileSync(import.meta.dirname + "/hello.txt", {
        encoding: "utf-8"
    }).toString();
    const lines = art.split("\n");

    if (process.stdout.columns < lines[0].length) {
        const top: string[] = [];
        const bottom: string[] = [];

        lines.forEach((line) => {
            const left = line.slice(0, splitAt).padEnd(splitAt, " ");
            const right = line.slice(splitAt);

            top.push(left);
            if (right.trim()) bottom.push(right);
        });

        console.log(top.join("\n"));
        console.log(bottom.join("\n"));
    } else console.log(art);

    [
        " by Pixelate It!",
        "    - https://github.com/pixelate-it/",
        "    mirdukkkkk",
        "    - https://github.com/mirdukkkkk/",
        ""
    ].map((str) => console.log(str));
})();
