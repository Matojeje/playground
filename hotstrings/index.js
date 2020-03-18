function setup() {
	convert()

	inputBox = document.querySelector("#input")
	outputBox = document.querySelector("#output")
	new ResizeObserver(() => { outputBox.style["height"] = inputBox.style["height"] }).observe(inputBox)
	new ResizeObserver(() => { inputBox.style["height"] = outputBox.style["height"] }).observe(outputBox)

	copy = new ClipboardJS("#copybutton")
	copy.on("success", () => {
		let button = document.querySelector("#copybutton")
		const prevText = button.textContent
		button.textContent = "Copied!"
		setTimeout(() => { button.textContent = prevText }, 1000)
	})
	copy.on("error", () => {
		let button = document.querySelector("#copybutton")
		const prevText = button.textContent
		button.textContent = "Press Ctrl+C to copy!"
		setTimeout(() => { button.textContent = prevText }, 3000)
	})
}

function convert() {
	const string = document.querySelector("#input").value
	pattern = /:([\*\?]{0,2}):(.*)::(.*)/g
	let output = ""
	let count = 0
	string.split("\n").forEach((line, index, array) => {
		if (pattern.test(line)) {
			// console.log(line)
			let start = document.querySelector("#functionWrap").checked
				? count == 0
					? `function autoHotkeyScript(string) {\n    return string\n        `
					: "        "
				: count == 0 ? "string" : "      "
			line = line.replace(pattern, `${start}.replace($a$2$b, "$3")\n`)
			switch (RegExp.$1) {
				case "*?": line = line
						.replace("$a", '"')
						.replace("$b", '"')
					break
				case "?*": line = line
						.replace("$a", '"')
						.replace("$b", '"')
					break
				case "*": line = line
						.replace("$a", "/\\b")
						.replace("$b", "/g")
					break
				default: line = line
						.replace("$a", "/\\b")
						.replace("$b", "\\b/g")
					break
			}
			count++
			output += line
		} else if (document.querySelector("#comments").checked) { output += `// ${line.replace(/^;?/g, "").trim()}\n` }
		// console.log([line, RegExp.$1, RegExp.$2, RegExp.$3])
	})
	output = output.trimEnd()
	output += document.querySelector("#functionWrap").checked ? ";\n};" : "\n"
	document.querySelector("#output").value = output
}