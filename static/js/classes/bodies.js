class CollisionBoundary {
	constructor(args, childDefaults) {
		args = args || {}
		childDefaults = childDefaults || {}
		this.defaults = {
			x: -99,
			y: -99,
			z: 0,
			w: 32,
			h: 32,
			offset: new Vector(0, 0),
			tether_i: null,
			tether_obj: null,
			velocity: new Vector(0, 0),
			useFunc: null,
			usingFunc: null,
			endFunc: null
		}
		Object.assign(this.defaults, childDefaults)
		assignClassArgs(this, args)
		if (this.tether_obj && !this.tether_i) this.tether_i = new Vector(0, 0)

		this.is_sensor = true;
		this.calcVerts(new Vector(this.x, this.y))
	}

	calcVerts(vec) {
		this.vertices = [
			new Vector(vec.x, vec.y),
			new Vector(vec.x + this.w, vec.y),
			new Vector(vec.x + this.w, vec.y + this.h),
			new Vector(vec.x, vec.y + this.h)
		]
	}

	useEvent(childFunc) {
		childFunc?.()
		this.useFunc?.()
	}

	usingEvent(childFunc) {
		childFunc?.()
		this.usingFunc?.()
	}

	endEvent(childFunc) {
		childFunc?.()
		this.endFunc?.()
	}

	colEvent(obj) {
		this.colFunc?.(obj)
	}

	colCheck() {
		let success = false;
		current_lvl.contents.forEach((item) => {
			let r = checkSAT(this, item)
			if (r.will_intersect) {
				this.colEvent(item)
				success = true;
			}
		})
		return success;
	}

	update() {
		this.center = calcCenter(this);
		if (!isGarbage(this.tether_i) && this.tether_obj) {
			let verts = this.tether_obj.draw_vertices
			let x = verts[this.tether_i.x].x + this.offset.x
			let y = verts[this.tether_i.y].y + this.offset.y
			let vec = new Vector(x, y)
			this.calcVerts(vec)
		}
	}
}

class Attack extends CollisionBoundary {
	constructor(args) {
		let defaults = {
			dirc: NONE,
			duration: 25,
			cooldown: 15,
			life_span: null,
			hitFunc: null,
			base_dmg: 1,
			used: false,
			owner: null,
			sprite: null,
			sprite_args: null
		}
		super(args, defaults)
		if (this.sprite_args) {
			this.sprite_args.default_frame_duration = Math.round(this.duration / this.sprite_args.frames.length)
			let sprite = new Sprite(this.sprite_args)
			let right_pos = this.sprite_args.src.search(RIGHT_IMG)
			let left_pos = this.sprite_args.src.search(LEFT_IMG)
			let alt_args = {...this.sprite_args}
			if (right_pos >= 0) {
				this.right_sprite = sprite
				alt_args.src = alt_args.src.replace(RIGHT_IMG, LEFT_IMG)
				this.left_sprite = new Sprite(alt_args)
			} else if (left_pos >= 0) {
				this.left_sprite = sprite
				alt_args.src = alt_args.src.replace(LEFT_IMG, RIGTH_IMG)
				this.right_sprite = new Sprite(alt_args)
			}
			if (right_pos >= 0 || left_pos >= 0) {
				this.left_sprite.frames = [...this.sprite_args.frames].reverse()
				this.right_sprite.load()
				this.left_sprite.load()
			}
			this.sprite = sprite
		}
		// if (this.sprite) {
		// 	this.sprite.default_frame_duration = Math.round(this.duration / this.sprite.frames.length)
		// 	this.sprite.fillTimingMap(true)
		// }
		if (!this.life_span && this.life_span !== 0) this.life_span = this.duration
		this.age = -1;
		this.colFunc = this.hitEvent

		this.update()
	}

	useEvent(childFunc) {
		let func = childFunc
		super.useEvent(func)
	}

	usingEvent() {
		let func = null;
		super.usingEvent(func)
	}

	endEvent() {
		let func = null
		super.endEvent(func)
	}

	hitEvent(obj) {
		if (this.used || this?.tether_obj?.id === obj.id) return
		this.hitFunc?.(obj)
		obj.damage?.(this.base_dmg)
	}

	die() {
		this.age = this.life_span
		this.visible = false;
		this.tangible = false
	}

	colCheck() {
		let result = super.colCheck()
		if (result) this.used = true
	}

	update() {
		super.update()
		if (this.life_span >= 0) this.age++
	}

	draw() {
		if (!this.sprite) return
		if (this.dirc === RIGHT) {this.sprite = this.right_sprite}
		if (this.dirc === LEFT) {this.sprite = this.left_sprite}
		this.sprite.draw(this.vertices[0])
	}
}

//Attribute descriptions(assuming true)
//is_sensor: collision is detected, but the Body will not be forced out of the other object
//invulnerable: damage triggers are not detected at all
//invincible: damage triggers happen, but they will not be take away hp
//visible: Body will be drawn
//tangible: Collisions can be detected. If false it will not even attempt to detect collision
class Body {
	constructor(args, childDefaults) {
		args = args || {}
		if (isGarbage(childDefaults)) childDefaults = {}
		this.defaults = {
			life_span: -1,
			x: canvas.width / 2,
			y: canvas.height / 2,
			z: 0,
			z_range: null,
			w: 32,
			h: 32,
			base_dmg: 0,
			has_gravity: false,
			is_sensor: false,
			invulnerable: true,
			visible: true,
			tangible: true,
			interactable: false,
			climbable: false,
			colFunc: null
		}
		let sprite_args = {
			w: args.w || this.defaults.w,
			h: args.h || this.defaults.h,
			background_color: 'rgba(255, 0, 0, 1.0)'
		}
		this.defaults.sprite = new Sprite(sprite_args)
		Object.assign(this.defaults, childDefaults)
		assignClassArgs(this, args)

		this.id = body_id.next()
		this.age = -1

		//Collision Stuff
		if (!this.z_range) this.z_range = {min: this.z, max: this.z},
		this.collisions = []
		this.resetCol()
		this.colPush = new Vector(0, 0)
		this.col_pushes = []

		//Vertices
		this.calcVerts(new Vector(this.x, this.y))
		this.old_vertices = this.vertices
		this.draw_vertices = []
		this.calcDrawVerts()

		//Centers
		this.center = calcCenter(this);
		this.old_center = this.center

		this.moved = false;

		this.sprite.parent = this

		contents.push(this);
	}

	resetColSides() {
		this.col_sides = {
			top: false,
			right: false,
			bottom: false,
			left: false
		}
	}

	resetCol() {
		this.collisions = []
		this.resetColSides()
	}

	calcVerts(vec) {
		this.vertices = [
			new Vector(vec.x, vec.y),
			new Vector(vec.x + this.w, vec.y),
			new Vector(vec.x + this.w, vec.y + this.h),
			new Vector(vec.x, vec.y + this.h)
		]
	}

	setPos(vec) {
		if (isGarbage(vec)) return
		this.moveUpdate(vec)
	}

	saveOldVerts() {
		this.old_vertices = this.vertices
		this.old_center = this.center
	}

	markColSide(col) {
		if (col.axis.y === -1) {
			this.col_sides.bottom = true
		} else if (col.axis.y === 1) {
			this.col_sides.top = true
		}
		if (col.axis.x === -1) {
			this.col_sides.right = true
		} else if (col.axis.x === 1) {
			this.col_sides.left = true
		}
	}

	colEvent(obj) {
		if (this?.colFunc) this.colFunc(obj)
	}

	onScreen() {
		if (
			this.vertices[0].x > canvas.width
			|| this.vertices[1].x < 0
			|| this.vertices[0].y > canvas.height
			|| this.vertices[2].y < 0
		) {
			return false
		} else {
			return true
		}
	}

	die() {
		this.visible = false;
		this.tangible = false;
		this.alive = false;
	}

	moveUpdate(vec) {
		this.calcVerts(vec)
		this.center = calcCenter(this);
		this.moved = true;
	}

	update() {
		this.center = calcCenter(this);
		this.saveOldVerts()
		this.moved = false;
		this.resetCol()
		if (this.life_span > 0) {
			this.age++
			if (this.age >= this.life_span) this.die()
		}
	}

	calcDrawVerts() {
		let draw_verts = []
		this.vertices.forEach((vert) => {
			let vec = new Vector(vert.x - current_cam.pos.x, vert.y - current_cam.pos.y)
			draw_verts.push(vec)
		})
		this.draw_vertices = draw_verts
		this.draw_center = calcCenter(this, draw_verts[0])
	}

	draw() {
		if (this.visible) {
			this.calcDrawVerts()
			this.drawFunc?.()
			this.sprite.draw(this.draw_vertices[0])
		}
	}
}