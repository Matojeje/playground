function calculate(n, d) {
	out = []
	for (let i = 0; i <= n; i++) {
		out.push(
			(Math.pow(10, 1 / n) ** i)
				.toFixed(d)
		)
	}
	return out
}

function writeCalc() {
	let output = document.getElementById("out")
	output.innerHTML = calculate(
		document.getElementById("count").valueAsNumber,
		document.getElementById("decimal").valueAsNumber
	)
		.toString()
		.replace(/,/g, "\n")
}