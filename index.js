(async () => {
	let fs = require("fs");
	let ejs = require("ejs");
	let crypto = require("crypto");
	let elementsOnScreen = 4;
	let fetch = (await import("node-fetch")).default;
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

	let bottomEmojis = [];
	let y = 512;
	let EDF = crypto.randomInt(3570);
	let EDT = crypto.randomInt(EDF, 3576);
	// for (let x = 0; y < 1024; x += 20) {
	// 	if (x > 1000) {
	// 		x = 0;
	// 		y += 20;
	// 	}
	// 	bottomEmojis.push({
	// 		input: await sharp(
	// 			"./assets/emoji/" + crypto.randomInt(EDF, EDT) + ".svg",
	// 			{ density: 30 }
	// 		).toBuffer(),
	// 		top: y,
	// 		left: x,
	// 	});
	// }

	let cat = await (
		await fetch(`https://robohash.org/${username}.png?set=set4&size=200x200`)
	).buffer();
	let paths = new Array(crypto.randomInt(5, 20))
		.fill(() => {
			let g = `M${crypto.randomInt(0, 1024)} ${crypto.randomInt(0, 1024)} L `;

			let lines = new Array(crypto.randomInt(3, 15))
				.fill(() => {
					let posX = crypto.randomInt(0, 1024);
					let posY = crypto.randomInt(0, 1024);
					return (
						posX +
						crypto.randomInt(-30, 30) +
						" " +
						(posY + crypto.randomInt(-30, 30))
					);
				})
				.map((e) => e())
				.join(" L ");
			g += lines + " Z";
			return {
				g,
				color:
					"#" +
					crypto.randomInt(0x00, 0xff).toString(16) +
					crypto.randomInt(0x00, 0xff).toString(16) +
					crypto.randomInt(0x00, 0xff).toString(16) +
					crypto.randomInt(0x00, 0xff).toString(16),
			};
		})
		.map((e) => e());
	let usernameSprite = await sharp(
		Buffer.from(await ejs.renderFile("./assets/text.svg", { username }))
	);

	await avatar.composite([
		{ input: bg },
		// ...emojis,
		{
			input: Buffer.from(await ejs.renderFile("./assets/ex.svg", { paths })),
		},
		...inputs.map((i) => ({
			input: i,
			left: crypto.randomInt(-300, 500),
			top: crypto.randomInt(-300, 500),
			blend: blends[Math.round(Math.random() * blends.length)],
		})),

		{
			input: cat,
			left: 412,
			top: 512 - (await usernameSprite.metadata()).height / 2 - 190,
		},

		{
			input: await usernameSprite.toBuffer(),
		},
	]);

	fs.writeFileSync("avatar.png", await avatar.png().toBuffer());
})();
