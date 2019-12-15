// Bunny's first script

function setup() {
	cookies = 0
	modifier = 1
	cps = 0
	cost1 = 50
	cost2 = 10
	update()
}

function update() {
	document.getElementById("counter").innerHTML = cookies
	document.getElementById("modifier").innerHTML = modifier

	cost1 = modifier * 50
	btn1 = document.getElementById("button")
	btn1.innerHTML = "Double the modifier for " + cost1 + " cookies!"
	btn1.disabled = cookies < cost1 // returs true or false depending on the results of this condition!

	cost2 = (cps*cps) * 5 + 5
	btn2 = document.getElementById("cps")
	btn2.innerHTML = "Get 1 more cookie per second for " + cost2 + " cookies!"
	btn2.disabled = cookies < cost2
}

function addCookies() {
	cookies += modifier	// cookies = cookies + modifier
	update()
}

function buy() {
	cookies -= cost1	// cookies = cookies - cost
	modifier *= 2		// modifier = modifier * 2
	update()
}

function increment() {
	cookies -= cost2
	cps += 1
	update()
}

function second() {
	cookies += cps
	update()
}

setInterval(second, 1000)