let fs = require("fs");
let emojis = fs.readdirSync("./assets/emoji/svg");
emojis.forEach((emoji, i) => {
	fs.renameSync("./assets/emoji/svg/" + emoji, "./assets/emoji/" + i + ".svg");
});
console.log(emojis);
