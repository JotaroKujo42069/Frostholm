class Color {
	constructor(r, g, b, a) {
		this.r = r || 0;
		this.g = g || 0;
		this.b = b || 0;
		this.a = typeof a === 'number' && a >= 0 && a <= 1 ? a : 1;

		this.limits = {
			r: {min: 0, max:255},
			g: {min: 0, max:255},
			b: {min: 0, max:255},
			a: {min: 0, max:1}
		}
	}

	getString() {return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a}`}

	fixValOverflow() {
		if (this.r > this.limits.r.max) this.r = this.limits.r.max
		if (this.r < this.limits.r.min) this.r = this.limits.r.min
		if (this.g > this.limits.g.max) this.g = this.limits.g.max
		if (this.g < this.limits.g.min) this.g = this.limits.g.min
		if (this.b > this.limits.b.max) this.b = this.limits.b.max
		if (this.b < this.limits.b.min) this.b = this.limits.b.min

		if (this.a > this.limits.a.max) this.a = this.limits.a.max
		if (this.a < this.limits.a.min) this.a = this.limits.a.min
	}

	adjustBrightness(num) {
		this.r += num
		this.g += num
		this.b += num
		this.fixValOverflow()
	}

	stroke(context) {
		context = context || c;
		context.strokeStyle = this.getString()
	}

	fill(context) {
		context = context || c;
		context.fillStyle = this.getString()
	}

	both() {
		this.stroke()
		this.fill()
	}

	colorStop(val, gradient) {
		gradient.addColorStop(val, this.getString())
	}
}

class SpecialEffect {
	constructor(args) {
		args = args || {}
		this.defaults = {
			parent: null,
			drawFunc: null,
			draw_mode: S_ATOP,
			persist: false,
			end_condition: (obj) => {return obj.parent.parent.dmg_cooldown_tmr === 0}
		}
		assignClassArgs(this, args)
	}

	draw(ctx, pos) {
		ctx.globalCompositeOperation = this.draw_mode
		this.drawFunc(ctx, pos)
		ctx.globalCompositeOperation = S_OVER
	}
}

class Sprite {
	constructor(args) {
		args = args || {}
		this.defaults = {
			parent: null,
			w: 32,
			h: 32,
			offset: new Vector(0, 0),
			background_color: null,
			overlay_color: null,
			src: 'missing',
			frame_i: 0,
			frame_w: null,
			frame_h: null,
			frames: [new Vector(0, 0)],
			default_frame_duration: 10,
			timing_map: null,
			tile_surface: null
		}
		assignClassArgs(this, args)

		this.effects = []
		this.loaded = false
		this.frame_tmr = 0;

		if (!this.timing_map || this.timing_map.length !== this.frames.length) {
			this.fillTimingMap()
		}
	}

	fillTimingMap(force) {
		if (!this.timing_map) this.timing_map = []
		let start = force ? 0 : this.timing_map.length
		for (let i = start; i < this.frames.length; i++) {
			this.timing_map[i] = this.default_frame_duration
		}
	}

	load() {
		this.img = new Image()
		this.img.onload = () => {
			if (!this.frame_w) this.frame_w = this.img.naturalWidth
			if (!this.frame_h) this.frame_h = this.img.naturalHeight
			this.loaded = true
		}
		this.img.src = 'assets/' + this.src + '.png'
	}

	applySFX() {
		this.effects.forEach((item) => {
			item?.draw?.(sfx, new Vector(0, 0))
		})
	}
	
	draw(pos, w, h) {
		if (isGarbage(pos)) return
		w = w || this.w
		h = h || this.h
		if (this.loaded) {
			let tile_surface_w, tile_surface_h, row_end, column_end, leftover_w, leftover_h

			if (this.tile_surface) {
				tile_surface_w = this.tile_surface[1].x - this.tile_surface[0].x
				tile_surface_h = this.tile_surface[2].y - this.tile_surface[1].y
				column_end = Math.ceil(tile_surface_h / this.h)
				row_end = Math.ceil(tile_surface_w / this.w)
				leftover_w = tile_surface_w % this.w
				leftover_h = tile_surface_h % this.h
			}

			let save = []
			this.effects.forEach((item) => {
				if (item.persist || !item.end_condition?.(item)) save.push(item)
			})
			this.effects = save

			//Draw Background
			if (this.background_color) {
				c.fillStyle = this.background_color
				let back_w = this.w
				let back_h = this.h
				if (this.tile_surface) {
					back_w = tile_surface_w
					back_h = tile_surface_h
				}
				c.fillRect(pos.x, pos.y, back_w, back_h)
			}
			//Draw Sprite
			if (!this?.img || this.src === 'missing') return

			let current_frame = this.frames[this.frame_i]

			let start_x = pos.x + this.offset.x
			let start_y = pos.y + this.offset.y
			let x;
			let y = start_y
			if (!column_end) column_end = 1
			if (!row_end) row_end = 1
			for (let i = 0; i < column_end; i++) {
				x = start_x
				for (let j = 0; j < row_end; j++) {
					
					let row_overflowing = j === row_end - 1 && leftover_w
					let column_overflowing = i === column_end - 1 && leftover_h

					let frame_w = row_overflowing ? this.frame_w * (leftover_w / w) : this.frame_w
					let actual_w = row_overflowing ? leftover_w : w
					let frame_h = column_overflowing ? this.frame_h * (leftover_h / h) : this.frame_h
					let actual_h = column_overflowing ? leftover_h : h

					if (this.effects.length > 0) {
						sfx.drawImage(this.img, current_frame.x, current_frame.y, frame_w, frame_h, 0, 0, actual_w, actual_h)
						this.applySFX()
						c.drawImage(sfx_canvas, 0, 0, actual_w, actual_h, x, y, actual_w, actual_h)
					} else {
						c.drawImage(this.img, current_frame.x, current_frame.y, frame_w, frame_h, x, y, actual_w, actual_h)
					}
					x += this.w
				}
				y += this.h
			}

			if (this.overlay_color) {
				c.fillStyle = this.overlay_color
				c.fillRect(start_x, start_y, tile_surface_w, tile_surface_h)
			}

			this.frame_tmr++
			if (this.frame_tmr > this.timing_map[this.frame_i]) {
				this.frame_tmr = 0
				this.frame_i++
			}
			if (this.frame_i >= this.frames.length) this.frame_i = 0
		}
	}
}

function calcArcData(vec1, vec2, r, invert) {
    let circles = findCircle(vec1, vec2, r)
    let i = invert ? 1 : 0
    let circle = new Vector(circles[i][0], circles[i][1])
    let start_vec = new Vector(circle.x + r, circle.y)

    let half_dist = (distance(start_vec, vec1) / 2) / r
    let start_angle = Math.asin(half_dist) * 2

    half_dist = (distance(start_vec, vec2) / 2) / r
    let end_angle = Math.asin(half_dist) * 2

    return {circle, start: -start_angle, end: -end_angle}
}