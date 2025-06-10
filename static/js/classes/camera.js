class Camera {
	constructor(args, padding) {
		args = args || {}
		let cam_border = 64
		if (padding) cam_border = padding
		this.defaults = {
			pos: new Vector(0, 0),
			w: canvas.width,
			h: canvas.height,
			bounds_pos: new Vector(0, 0),
			bounds_w: canvas.width * 2,
			bounds_h: canvas.height,
			angle: 0,
			speed: 3
		}
		assignClassArgs(this, args)
		this.setBounds(this.pos)
	}

	checkBounds() {
		if (this.pos.x < this.bounds[0].x)  {
			this.pos.x = this.bounds[0].x
		} else if (this.pos.x + this.w > this.bounds[1].x) {
			this.pos.x = this.bounds[1].x - this.w
		}

		if (this.pos.y < this.bounds[0].y)  {
			this.pos.y = this.bounds[0].y
		} else if (this.pos.y + this.h > this.bounds[2].y) {
			this.pos.y = this.bounds[2].y - this.h
		}
	}

	setBounds(pos) {
		this.bounds = [
			pos,
			new Vector(pos.x + this.bounds_w, pos.y),
			new Vector(pos.x + this.bounds_w, pos.y + this.bounds_h),
			new Vector(pos.x, pos.y + this.bounds_h)
		]
	}
			
	move(x, y) {
		x = x || 0
		y = y || 0
		this.pos.x += x
		this.pos.y += y
		this.checkBounds()
	}

	follow(obj) {
		let x_offset = canvas.width/2
		if (Math.abs(obj.center.x - this.bounds_pos.x) > x_offset 
			&& Math.abs(obj.center.x - (this.bounds_pos.x + this.bounds_w)) > x_offset) {
			this.pos.x = obj.center.x - x_offset
		}
		let y_offset = canvas.height/2
		if (Math.abs(obj.center.y - this.bounds_pos.y) > y_offset 
			&& Math.abs(obj.center.y - (this.bounds_pos.y + this.bounds_h)) > y_offset) {
			this.pos.y = obj.center.y - y_offset
		}
		
	}

	update(obj) {
		obj = obj || plr
		this.follow(obj)
	}
}

