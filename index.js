(async () => {
	let fs = require("fs");
	let ejs = require("ejs");
	let crypto = require("crypto");
	let elementsOnScreen = 4;
	let sharp = require("sharp");
	let avatar = sharp({
		create: {
			width: 1024,
			height: 1024,
			channels: 4,
			background: "#334756",
			// noise: {
			// 	type: "gaussian",
			// 	mean: 10,
			// 	sigma: 5,
			// },
		},
	});

	let bg = await sharp("./assets/bg.svg")
		// .rotate(crypto.randomInt(180))

		.toBuffer();

	let elementsLength = fs.readdirSync("./assets/additionalElements").length;
	let inputs = await Promise.all(
		[
			...new Set(
				new Array(elementsLength)
					.fill(() => {
						return 1 + crypto.randomInt(elementsLength - 1);
					})
					.map((f) => f())
			),
		].map(async (e) => {
			// console.log(e);
			return await sharp(
				"./assets/additionalElements/" + e + ".svg"
			).toBuffer();
		})
	);
	let username = process.argv.slice(2).join(" ");
	let blends = [
		"over",

		"multiply",

		// "darken",
		"lighten",

		"hard-light",
		"soft-light",
		"darken",
		"difference",
		// "exclusion",
	];
	let emojis = await Promise.all(
		new Array(150)
			.fill(async () => {
				let left = crypto.randomInt(1024);
				return {
					input: await sharp(
						"./assets/emoji/" + crypto.randomInt(3576) + ".svg"
					).toBuffer(),
					top: crypto.randomInt(
						crypto.randomInt(10, 100) + Math.abs(512 - left)
					),
					left: left,
					density: crypto.randomInt(40, 120),
					blend: blends[Math.round(Math.random() * blends.length)],
				};
			})
			.map(async (e) => await e())
	);
	let bottomEmojis = [];
	let y = 512;
	let EDF = crypto.randomInt(3570);
	let EDT = crypto.randomInt(EDF, 3576);
	for (let x = 24; y < 1000; x += 50) {
		if (x > 1000) {
			x = 0;
			y += 50;
		}
		bottomEmojis.push({
			input: await sharp(
				"./assets/emoji/" + crypto.randomInt(EDF, EDT) + ".svg"
			).toBuffer(),
			top: y,
			left: x,
		});
	}
	await avatar.composite([
		{ input: bg },
		...emojis,
		...inputs.map((i) => ({
			input: i,
			left: crypto.randomInt(-300, 300),
			top: crypto.randomInt(-300, 300),
			blend: blends[Math.round(Math.random() * blends.length)],
		})),
		...bottomEmojis,
		{
			input: Buffer.from(
				await ejs.renderFile("./assets/text.svg", { username })
			),
		},
	]);
	if (fs.existsSync("./avatar.png")) {
		fs.unlinkSync("./avatar.png");
	}
	await avatar.png().toFile("./avatar.png");
})();
