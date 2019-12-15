function setup() {
	pad = new Launchpad();

	// Set of all colors
	colors = [
		pad.red.off, pad.amber.off, pad.yellow.off, pad.green.off,
		pad.red.low, pad.amber.low, pad.yellow.low, pad.green.low,
		pad.red.medium, pad.amber.medium, pad.yellow.medium, pad.green.medium,
		pad.red.full, pad.amber.full, pad.yellow.full, pad.green.full
	];

	// Set of all green colors
	matrix = [pad.off, pad.green.low, pad.green.medium, pad.green.full];

	hues = ["off", "red", "amber", "yellow", "green"];
	brightnesses = ["off", "low", "medium", "full"];
	palette = {
		"off": "#000",
		"red": "#f00",
		"amber": "#f70",
		"yellow": "#fb0",
		"green": "#af0",
	};

	/* Move the horizontal row of round buttons from the end to the start of
	 * the Buttons.All array to reflect their physical location on the Launchpad
	 */
	for (let i = 0; i < 8; i++) {
		Buttons.All.unshift(Buttons.All.pop())
	}

	animation = 0;

	pad.connect().then(() => {
		pad.reset(0);
		updateSettings();

		document.querySelectorAll("input[type=range]")
			.forEach(slider => { slider.oninput = updateSettings })

		/* pad.on('key', k => {
			// Make button red while pressed, green after pressing
			pad.col(k.pressed ? pad.red : pad.green, k);
		}); */
		state("Connected to " + pad.midiIn.name);
	}).catch(reason => { state("Couldn't connect: " + reason) });
}

window.addEventListener("load", setup());

function updateSettings() {
	settings = document.forms.settings.elements;
	fps = settings.fps.value;
	rnd_matrix = settings.rnd_matrix.checked;
	rnd_anim = settings.rnd_anim.checked;
	chk_inv = settings.chk_inv.checked;
	chk_color = parseColor(settings.chk_color.value, settings.chk_level.value);
	aclk_cols = [settings.aclk_1.value, settings.aclk_2.value, settings.aclk_3.value, settings.aclk_d.value];
	aclk_face = settings.aclk_face.checked;
	aclk_dots = settings.aclk_dots.checked;
	aclk_spin = parseInt(settings.aclk_spin.value);

	// Set scene
	scene = settings.scene.value;
	if (animation) clearInterval(animation);
	draw();
}

function draw() {
	switch (scene) {

		case "Red":
			pad.col(pad.red, Buttons.All)
			break;

		case "Amber":
			pad.col(pad.amber, Buttons.All)
			break;

		case "Yellow":
			pad.col(pad.yellow, Buttons.All)
			break;

		case "Green":
			pad.col(pad.green, Buttons.All)
			break;

		case "Random dots":
			const colorset = rnd_matrix ? matrix : colors;
			if (rnd_anim) {
				animation = setInterval(function () {
					pad.col(randomItem(colorset), randomItem(Buttons.All));
				}, 1000 / fps);
			} else {
				Buttons.All.forEach(button => {
					pad.col(randomItem(colorset), button);
				})
			}
			break;

		case "Checkerboard":
			let odd = chk_inv;
			Buttons.All.forEach(button => {
				odd = !odd;
				pad.col(odd ? chk_color : pad.off, button);
			})
			break;

		case "Snake check":
			const interval = 50
			const heatmap = [pad.off, pad.green.low, pad.green.medium,
			pad.green, pad.yellow, pad.amber, pad.red]
			var buttonHistory = new Array(7).fill(Buttons.All[0]);
			animation = setInterval(
				Buttons.All.forEach((button, index) => {
					setTimeout(function () {

						buttonHistory.shift();
						buttonHistory.push(button);
						for (let age = 0; age < buttonHistory.length; age++) {
							pad.col(heatmap[age], buttonHistory[age]);
						}

					}, interval * index)
				}), interval * Buttons.All.length)
			break;

		case "Analog clock":
			let display = document.querySelector("#time")
			canvas = document.querySelector("canvas#clock")
			ctx = canvas.getContext("2d");
			const center = { x: 5, y: 5 };
			animation = firstInterval(function () {
				ctx.fillStyle = "#000";
				ctx.fillRect(0, 0, 9, 9);
				wipePad();

				if (aclk_face) {
					ctx.fillStyle = "rgba(255,0,0,0.4)";
					activeCol = pad.red.low;
					plotCircle(5, 5, 4);
				}

				function dots() {
					if (aclk_cols[3] !== "off") {
						setColor(aclk_cols[3])
						setPixel(center.x, center.y);
						for (let i = 0; i < 4; i++) {
							dot = polToRec(4, i * 90 + aclk_spin, true);
							setPixel(center.x + dot.x, center.y + dot.y)
						}
					}
				}

				function drawHand(length, angle, color) {
					setColor(color);
					const tip = polToRec(length, angle, true);
					plotLine(center.x, center.y, center.x + tip.x, center.y + tip.y);
				}

				if (!aclk_dots) dots();

				const d = new Date();
				const [s, m, h] = [d.getSeconds(), d.getMinutes(), d.getHours()]

				display.innerText = (aclk_cols[2] !== "off")
					? h + ":" + padDigits(m, 2) + ":" + padDigits(s, 2)
					: h + ":" + padDigits(m, 2);

				if (aclk_cols[0] !== "off") { // Hour hand
					drawHand(3,
						(h * (360 / 12)) +
						(m * (360 / 12 / 60)) +
						aclk_spin, aclk_cols[0]);
				}

				if (aclk_cols[1] !== "off") { // Minute hand
					drawHand(4,
						(m * (360 / 60)) +
						(s * 360 / 60 / 60) +
						aclk_spin, aclk_cols[1]);
				}

				if (aclk_cols[2] !== "off") { // Second hand
					drawHand(4,
						s * (360 / 60) +
						aclk_spin, aclk_cols[2]);
				}

				if (aclk_dots) dots();

			},
				// Refresh each 1 or 10 seconds depending on the second hand visibility
				aclk_cols[2] !== "off" ? 1000 : 1000 * 10)
			break;

		case "Black":
		default:
			pad.col(pad.off, Buttons.All)
			break;
	}
}

/**
 * Clears the Launchpad display once, then optionally redraws the current scene
 * @param {Boolean} [redraw] Redraw the current screne
 */
function wipePad(redraw) {
	const oldScene = scene;
	scene = "Black";
	draw();
	if (redraw) updateSettings();
	else scene = oldScene;
}

/**
 * Picks a random item from an array.
 * @param {Array} array Non-empty array
 * @returns {*} Random array item
 */
function randomItem(array) {
	return array[Math.floor(Math.random() * array.length)]
}

/**
 * Adds padding to a number in form of leading characters
 * to get the number to a specific length.
 *
 * @param {Number} number Input number to be padded
 * @param {Number} digits Minimal length of the result
 * @param {(String|Number)} [character] Character(s) to be used for padding, 0 by default
 * @returns {String} Padded number as a string
 * 
 * @example
 * padDigits(8, 2, 0) // → "08"
 * padDigits(13.4, 8, "-") // → "----13.4"
 * padDigits(15,5,"()") // → "()()()15"
 * padDigits(128,2,"!") // → "128"
 * 
 * @url https://stackoverflow.com/a/10075654/11933690
 */
function padDigits(number, digits, character) {
	return Array(
		Math.max(
			digits - String(number).length + 1,
			0
		)).join(character || 0) + number;
}

/**
 * Converts strings to a Color object usable by launchpad-webmidi,
 * considering `pad = new Launchpad();`
 * @param {("off" | "red" | "amber" | "yellow" | "green")} hue
 * Color hue as a case-insensitive string or "off"
 * @param {("off" | "low" | "medium" | "full" | 0 | 1 | 2 | 3 | "0" | "1" | "2" | "3")} [level]
 * Brightness level as a string or number, or "off"
 * @returns {Color} A launchpad-webmidi color
 * 
 * @example
 *	// returns pad.red.low
 *	parseColor("red","low")
 */
function parseColor(hue, level) {
	// console.log({ "hue": hue, "level": level });
	const pad = new Launchpad();
	hue = hue.toLowerCase(); // Just in case, hehe
	if (hue === "off") return pad.off;
	if (level) {
		// Convert "1", "2"... to a number
		if (level.length === 1 && typeof level === "string") level = parseInt(level);
		if (level === "off" || level === 0) return pad.off;
		const levels = ["off", "low", "medium", "full"];
		if (typeof level === "number") level = levels[level];
		else level = level.toLowerCase();
		return pad[hue][level];
	} else return pad[hue];
}

/**
 * Converts polar coordinates to rectangular coordinates.
 * @param {Number} r Radius in pixels
 * @param {Number} θ Theta angle in degrees, where Up = 0°
 * @param {Boolean} [round] Whether or not to round to nearest integer
 * @returns {Object} Object with X and Y coordinates
 */
function polToRec(r, θ, round) {
	function round(i) { return (round) ? Math.round(i) : i }
	θ = (θ - 90) * Math.PI / 180;
	x = round(r * Math.cos(θ));
	y = round(r * Math.sin(θ));
	return {
		x: x,
		y: y
	}
}

/**
 * Draws a pixel on both the canvas and the launchpad.
 * @param {Number} x 1 → 9
 * @param {Number} y 1 ↓ 9
 */
function setPixel(x, y) {
	ctx.fillRect(x - 1, y - 1, 1, 1);
	pad.col(activeCol || pad.red, [x - 1, (y === 1) ? 8 : y - 2])
}

/**
 * Set the specified color for the given pixel(s).
 * @param {Color} launchpadColor One of the pre-defined colors.
 * @param {Array.<Array.<Number>>} buttons Array of [x,y] value pairs
 * @param {Boolean} [canvas] Whether or not to also draw on the canvas.
 * @param {String} [canvasColor] A color code to be used on the canvas.
 */
function setPixels(color, buttons, canvas, canvasColor) {

	if (canvasColor) ctx.fillStyle = canvasColor;

	if (buttons.length > 0 && buttons[0] instanceof Array) {
		if (canvas) {
			buttons.forEach(btn => {
				pad.col(color, [btn[0], (btn[1] === 8) ? 0 : btn[1]]);
				if (btn[1] === 8) ctx.fillRect(btn[0], 0, 1, 1);
				else ctx.fillRect(btn[0], btn[1] + 1, 1, 1);
			});
		} else buttons.forEach(btn => pad.col(color, btn));
	}
}

/**
 * Sets the active pad color for drawing the launchpad and emulates it on the canvas.
 * @param {"red" | "amber" | "yellow" | "green" | "off"} color
 */
function setColor(color) {
	activeCol = pad[color];
	ctx.fillStyle = palette[color];
}

/**
 * setInterval replacement that triggers immediately, and at the given interval
 * @author  jimm101
 * @date    6.4.2018
 * @version 1.0.0
 * @url https://github.com/jimm101/firstInterval
 *
 * @param {Function} f Function
 * @param {Number} m Interval in ms
 * @param {*} [p] Parameters
 * @returns {Number} Interval ID
 */
function firstInterval(f, m, ...p) {
	const h = setInterval(() => { f.apply(null, p) }, m);
	f.apply(null, p);
	return h;
}

/**
 * Gets or sets text of #midi_state.
 *
 * @param {String} text Text to write
 * @returns {String} Current text
 */
function state(text) {
	if (text) document.querySelector("#midi_state").innerText = text;
	return document.querySelector("#midi_state").innerText;
}