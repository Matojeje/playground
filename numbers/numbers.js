const o = document.getElementById("mono")
window.onload = update(1,7)
function update(p,n) {
	// p = Starting number
	// n = Number of iterations
	line = {}
	o.innerHTML = p
	line[1] = p
	for (let i = document.getElementById("n").min; i <= n; i++) {

		if (line[i-1].toString().length == 1) {
			line[i] = "1" + line[i-1].toString()[0] // Don't forget it starts at 0
		} else {
			line[i] = ""
			j = 0
			s = line[i-1].toString()
			while (j <= s.length-1) {
				c = 1
				x = s[j]
				while (j == x) {
					c++
					j++
				}
				console.log({"i":i,"j":j,"c":c})
				line[i] = `${line[i]}${c}${x}`
				j++
			}
		}
		o.innerHTML = o.innerHTML + "<br>" + line[i]
	}
}