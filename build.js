const esbuild = require("esbuild");
const fs = require("fs");

esbuild.buildSync({
    bundle: true,
    minify: true,
    entryPoints: ["./src/index.ts"],
    outfile: "./dist/bundle.js"
});

fs.cpSync("./static", "./dist", { recursive: true });