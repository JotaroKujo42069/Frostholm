class Light {
	constructor(args, child_defaults) {
		args = args || {}
		child_defaults = child_defaults || {}
		this.defaults = {
			parent: null,
			visible: true,
			pos: new Vector(0, 0),
			color: new Color(255, 255, 255, 0.3),
			pos_update_func: function() {
				return new Vector(this.parent.draw_center.x, this.parent.draw_center.y + this.parent.sprite.offset.y)
			}
		}
		Object.assign(this.defaults, child_defaults)
		assignClassArgs(this, args)
	}

	draw() {
		if (this?.parent) this.pos = this.pos_update_func?.()
	}
}

class CircleLight extends Light {
	constructor(args) {
		args = args || {}
		let defaults = {
			r: 32
		}
		super(args, defaults)
	}

	draw(context) {
		super.draw()
		context = context || c

		let gradient = context.createRadialGradient(this.pos.x, this.pos.y, this.r / 4, this.pos.x, this.pos.y, this.r)
		let grad = context.createRadialGradient(this.pos.x, this.pos.y, this.r / 4, this.pos.x, this.pos.y, this.r)
		

		let outer_color = new Color()
		Object.assign(outer_color, this.color)
		outer_color.a = '0'

		this.color.colorStop(0, grad)
		outer_color.colorStop(1, grad)

		gradient.addColorStop(0, "pink");
		gradient.addColorStop(0.9, "white");
		gradient.addColorStop(1, "green");

		context.fillStyle = grad
		context.beginPath()
		context.arc(this.pos.x, this.pos.y, this.r, 0, Math.PI*2)
		context.fill()
	}
}
