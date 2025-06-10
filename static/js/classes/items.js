﻿﻿class Equipment {
	constructor(args, childDefaults) {
		if (isGarbage(args)) args = {}
		if (isGarbage(childDefaults)) childDefaults = {}
		this.defaults = {
			cooldown: 0,
			duration: 0,
			useFunc: null,
			usingFunc: null,
			endFunc: null
		}
		let sprite_args = {}
		this.defaults.sprite = new Sprite(sprite_args)
		Object.assign(this.defaults, childDefaults)
		assignClassArgs(this, args)
		this.cooldown_tmr = 0;
		this.duration_tmr = 0;
		this.sprite.load() //to-optimize
	}

	useEvent(childFunc) {
		if (this.cooldown_tmr !== 0) return
		childFunc?.()
		this.useFunc?.()
		this.duration_tmr = this.duration;
		this.cooldown_tmr = this.cooldown;
	}

	usingEvent(childFunc) {
		childFunc?.()
		this.usingFunc?.()
	}

	endEvent(childFunc) {
		childFunc?.()
		this.endFunc?.()
	}

	update() {
		if (this.duration_tmr > 0) this.usingEvent()
		if (this.duration_tmr === 1) this.endEvent()
		if (this.cooldown_tmr > 0 && this.duration_tmr === 0) this.cooldown_tmr--
		if (this.duration_tmr > 0) this.duration_tmr--
	}
}

class Shield extends Equipment {
	constructor(args) {
		let defaults = {
			duration: 100,
			cooldown: 1500
		}
		super(args, defaults)
	}

	useEvent() {
		let func = () => {
			plr.invincible = true;
		}
		super.useEvent(func)
	}

	usingEvent() {
		let func = null;
		super.usingEvent(func)
	}

	endEvent() {
		let func = () => {
			plr.invincible = false;
		}
		super.endEvent(func)
	}

	update() {
		super.update()
	}
}

class Weapon extends Equipment {
	constructor(args, child_defaults) {
		args = args || {}
		child_defaults = child_defaults || {}
		let defaults = {
			cooldown: 100,
			attacks: {
				light: {},
				heavy: {}
			}
		}
		Object.assign(defaults, child_defaults)
		super(args, defaults)
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

	update() {
		super.update()
	}
}

//Projectiles emit from owner's center
class RangedWeapon extends Weapon {
	constructor(args) {
		let defaults = {
			cooldown: 150,
			projectile_stats: {},
			max_projectiles: 5,
			projectiles: [],
			owner: plr
		}
		super(args, defaults)
	}

	shoot() {
		this.projectiles = this.projectiles.removeDead()
		if (this.projectiles.length >= this.max_projectiles) return

		args = this.projectile_stats
		if (!args.offset) args.offset = new Vector(0, 0)
		args.x = this.owner.center.x + args.offset.x
		args.y = this.owner.center.y + args.offset.y
		let projectile = new Projectile(args)
		

		if (this.owner.facing === LEFT) projectile.trajectory = new Vector(-projectile.base_speed.x, 0)
		this.projectiles.push(projectile)
		current_lvl.add(projectile)
	}

	useEvent() {
		let func = () => {this.shoot()}
		super.useEvent(func)
	}
}

class ProgressionItem extends Equipment {
	constructor(args) {
		let defaults = {
			cooldown: 100
		}
		super(args, defaults)
	}

	useEvent() {
		let func = null
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

	update() {
		super.update()
	}
}

class Consumable extends Equipment {
	constructor(args) {
		let defaults = {
			cooldown: 100,
			count: 1
		}
		super(args, defaults)
	}

	useEvent() {
		let func = () => {this.count--}
		super.useEvent(func)
	}
}

class Item extends Entity {
	constructor(args) {
		let defaults = {
			base_speed: 12,
			max_speed: new Vector(8, 8),
			invulnerable: true,
			auto_pickup: false,
			life_span: 18000,
			pickup_radius: 128,
			collect_radius: 48,
			item: null
		}
		super(args, defaults)
		this.sprite = this.args?.sprite || this.item?.sprite
		if (!this.sprite) this.sprite = new Sprite()
		this.interactable = true
		this.picked_up = false
	}

	pickup() {
		if (!this.picked_up && this.auto_pickup) {
			this.is_sensor = true;
			this.has_gravity = false;
			this.picked_up = true;
		} else {

		}
	}

	collect() {
		if (this.alive) {
			if (this.item instanceof Shield) plr.equipment.shield = this.item
			if (this.item instanceof Weapon) plr.pickupWeapon(this.item)
			if (this.item instanceof ProgressionItem) plr.equipment.progression = this.item
			if (this.item instanceof Item) plr.inventory.push(this.item)
			this.die()
		}
	}

	interactEvent() {
		this.collect()
	}
	
	updatePickup(plr_dist) {
		if (plr_dist <= this.collect_radius) {
			this.collect()
		} else {
			let x_dist = this.center.x - plr.center.x
			let y_dist = this.center.y - plr.center.y

			let x_speed = x_dist / this.base_speed
			let y_speed = y_dist / this.base_speed
			this.move(-x_speed, -y_speed)
		}
	}

	update() {
		super.update()
		
		let plr_dist = distance(this.center, plr.center)
		if (plr_dist <= this.pickup_radius) this.pickup()
		if (this.picked_up) this.updatePickup(plr_dist)
	}

	draw() {
		super.draw()
		// c.strokeStyle = 'red'
		// c.lineWidth = 1
		// c.strokeRect(this.vertices[0].x, this.vertices[0].y, this.w, this.h)
	}
}

