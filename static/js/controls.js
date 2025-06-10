//Control Vars
let keys = []
let keys_up = []
let keys_down = []

let mouse = {
	pos: new Vector(-99, -99),
	click_pos: null,
	prev_click_pos: null,
	click: false,
	on_up: false,
	checkBounds: (obj, is_hover) => {
		let pos = is_hover ? mouse.pos : mouse.click_pos
		if (!pos) return false
		if (
			pos.x >= obj.x 
			&& pos.x <= obj.x + obj.w
			&& pos.y >= obj.y
			&& pos.y <= obj.y + obj.h
		) return true
		return false
	},
	reset: () => {
		mouse.prev_click_pos = mouse.click_pos || mouse.prev_click_pos
		mouse.click_pos = null
		mouse.on_up = false
	}
}

//Key events
window.onkeydown = (e) => {
	keys[e.keyCode] = true;
	keys_down[e.keyCode] = true;
}
window.onkeyup = (e) => {
	keys[e.keyCode] = false
	keys_up[e.keyCode] = true
}

//Remove defaults
window.addEventListener('keydown', function(e) {
  if(e.keyCode == 32 && e.target == document.body) {
    e.preventDefault();
  }
});

function getMousePos(canvas, evt) {
  let rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - Math.round(rect.left),
    y: evt.clientY - Math.round(rect.top)
  };
}

//Mouse Events
canvas.onmousemove = (e) => {
	let pos = getMousePos(canvas, e)
	mouse.pos = pos
}

canvas.onmousedown = (e) => {
	x = e.clientX
	y = e.clientY
	mouse.click_pos = new Vector(x, y)
	mouse.click = true;
}

canvas.onmouseup = (e) => {
	mouse.click = false;
	mouse.on_up = true;
}

function universalControls(obj) {
	if (keys_up[82]) {
		if (inv_layer.visible) {
			paused = false;
			inv_layer.hide()
		} else {
			paused = true;
			inv_layer.show()
		}
	}

//toggle Skill tree GUI (M)
	if (keys_up[77]) {
		if (skills_layer.visible) {
			paused = false;
			skills_layer.hide()
		} else {
			paused = true;
			skills_layer.show()
		}
	}

}

function reset_controls() {
	mouse.reset()
	keys_down = []
	keys_up = []
}

