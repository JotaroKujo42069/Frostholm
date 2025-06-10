class Projectile extends Entity {
	constructor(args) {
		let defaults = {
			is_sensor: true,
			life_span: 30000,
			base_speed: new Vector(5, 5),
			trajectory: null,
			invulnerable: true,
			has_gravity: false,
			offset: new Vector(0, 0),
			owner: plr
		}
		defaults.trajectory = defaults.trajectory || new Vector(defaults.base_speed.x, 0)
		super(args, defaults)
	}

	colEvent(obj) {
		if (this.owner.id === obj.id) return
		super.colEvent()
		if (obj instanceof Entity) {
			obj.damage(this.base_dmg)
			this.die()
		}
	}	

	update() {
		if (!this.alive) return
		super.update()
		if (!this.onScreen()) this.die()
		this.addVelocity(this.trajectory.x, this.trajectory.y)
	}
}


