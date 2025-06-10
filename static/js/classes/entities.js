//Attribute descriptions(assuming true)
//anchored: prevents velocity being added, but not being pushed by other forces
//speed: base_speed + modifiers
class Entity extends Body {
	#velocity = new Vector(0, 0);
	constructor(args, childDefaults) {
		let defaults = {
			//Movement
			jump: 0,
			jump_height: 10,
			jump_sp: 9,
			jump_cooldown_tmr: 0,
			jump_cooldown: 30,
			base_speed: new Vector(3, 3),
			max_speed: new Vector(32, 32),
			speed: new Vector(0, 0),
			fall_speed: new Vector(0, 0),
			terminal_velocity: 6,
			sprint_mult: 1.3,
			//Stats
			base_hp: 100,
			hp: 0,
			age: -1,
			life_span: -1,
			base_dmg: 1,
			dmg_cooldown: 75,
			dmg_cooldown_tmr: 0,
			//States
			has_gravity: true,
			facing: RIGHT,
			invincible: false,
			invulnerable: false,
			anchored: false,
			alignment: NEUTRAL,
			//
			follow_target: null,
			follow_range: {min: 0, max: Number.POSITIVE_INFINITY},
			loot: [],
			drawFunc: null
		}
		Object.assign(defaults, childDefaults)
		defaults.hp = defaults.base_hp
		super(args, defaults)
		this.velocity = new Vector(0, 0)
		this.alive = true;
		this.on_ground = false;
		this.translation_vec = new Vector(0, 0)
		this.translation_range = {
			x: {min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY},
			y: {min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY}
		}

		this.jumping = false;
	}

	get velocity() {
		return this.#velocity
	}
	
	set velocity(val) {
		if (isGarbage(val) || this.anchored) return
		
		let x = val;
		let y = val;
		if (val instanceof Vector) {
			x = val.x
			y = val.y	
		}
		this.#velocity = new Vector(x, y)
	}

	resetCol() {
		super.resetCol()
		this.on_ground = false;
	}

	addVelocity(val, y) {
		if (!val && val !== 0) return
		let vec;
		if (typeof val === 'object') {
			vec = val
		} else {
			y = y || 0
			vec = new Vector(val, y)
		}
		
		if (isGarbage(vec) || this.anchored) return
		this.velocity = this.velocity.add(vec)
	}

	move(x, y, ignore_max) {
		if (!isGarbage(x) && !isGarbage(y)) {
			if (x > this.max_speed.x && !ignore_max) x = this.max_speed.x
			if (y > this.max_speed.y && !ignore_max) y = this.max_speed.y
			let vec = new Vector(this.vertices[0].x + x, this.vertices[0].y + y)
			this.moveUpdate(vec)
		}
	}

	jump() {
		if (this.jump <= 0) this.jumping = true;
	}

	applyGravity() {
		if (this.has_gravity) {
			this.fall_speed.y += g.y
			if (this.fall_speed.y > this.terminal_velocity) this.fall_speed.y = this.terminal_velocity
			// if (this.fall_speed.y < 0) this.fall_speed.y = 0
			let grav_pull = this.fall_speed
			this.addVelocity(grav_pull)
		} 
	}

	damage(dmg) {
		dmg = dmg || 0
		if (dmg <= 0) return
		if (!this.invincible && !this.invulnerable && this.dmg_cooldown_tmr === 0) {
			this.hp -= dmg
			this.dmg_cooldown_tmr = this.dmg_cooldown
			if (this.id === plr.id) showHp()
			args = {
				parent: this.sprite,
				drawFunc: function(ctx, pos) {
					hurt_color.a = (hurt_color.limits.a.max * this.parent.parent.dmg_cooldown_tmr) / this.parent.parent.dmg_cooldown
					hurt_color.fill(ctx)
					ctx.fillRect(pos.x, pos.y, 100, 100)
				}
			}
			let sfx = new SpecialEffect(args)
			this.sprite.effects.push(sfx)
		}
	}

	follow() {
		let obj = this.follow_target
		if (!obj || (!this.col_sides.bottom && !this.jumping)) return
		let dist = distance(this.center, obj.center)
		if (dist < this.follow_range.min || dist > this.follow_range.max) return

		let x_dist = obj.center.x - this.center.x
		let x = Math.abs(x_dist) >= this.speed.x ? this.speed.x * Math.sign(x_dist) : x_dist
		this.addVelocity(x, 0)
		if (Math.sign(x) < 0) {
			this.facing = LEFT
		} else {
			this.facing = RIGHT
		}
		// if (//stuck) this.jump()
	}

	spawnLoot() {
		if (this.loot.length < 1) return

		let half_w = this.w/2
		this.loot.forEach((item) => {
			let x = this.center.x - item.sprite.w/2 + randomRange(-half_w, half_w)
			let y = this.vertices[0].y + randomRange(0, this.h/2)
			let item_args = {
				item,
				x,
				y,
				sprite: item.sprite
			}
			let item_ent = new Item(item_args)
			current_lvl.add(item_ent)
		})
	}

	die() {
		super.die()
		this.alive = false;
		this.spawnLoot()
	}

	updateJump() {
		if (this.jump_cooldown_tmr > 0) {
			this.jump_cooldown_tmr--
		} else {
			return
		}
		if (!this.jumping || this.jump >= this.jump_height) return
		this.addVelocity(0, -(this.jump_sp + g.y))
		jump++
	}

	update() {
		if (!this.alive) return
		this.anchored = false

		Object.assign(this.speed, this.base_speed)
		this.velocity = new Vector(0, 0)
		this.translation_vec = new Vector(0, 0)
		this.translation_range = {
			x: {min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY},
			y: {min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY}
		}
		if (this.hp <= 0) this.die()
		if (this.on_ground) {
			if (this.jumping) this.jump_cooldown_tmr = this.jump_cooldown
			this.jump = 0
			this.jumping = false
			this.fall_speed = new Vector(0, 0)
		}
		if (this.dmg_cooldown_tmr > 0) {
			this.dmg_cooldown_tmr--
			this.speed = new Vector(0, 0)
		}
		super.update()
		this.applyGravity()
	}
}

class Player extends Entity {
	constructor(args) {
		let defaults = {
			equipment: {
				weapons: [
					new Weapon({
						sprite: new Sprite({src: 'item/sword'}),
						attacks: {
							light: {base_dmg: 25, duration: 15, h: 48, sprite_args: DEFAULT_ATK_PARTICLE_ARGS},
							heavy: {base_dmg: 100, duration: 25, h: 48, sprite_args: DEFAULT_ATK_PARTICLE_ARGS}
						}
					})
				],
				max_weapons: 2,
				shield: new Shield({sprite: new Sprite({src: 'item/shield_red'})}),
				progression: new ProgressionItem(),
				consumables: [new Consumable()],
				max_consumables: 2
			},
			inventory: [],
			interact_radius: 96,
			base_hp: 30,
			jump_height: 15,
			climb_allowed: true,
			climb_speed: new Vector(10, 10),
			light: new CircleLight({r:48, color: new Color(255, 255, 255, 0.1)})
		}
		super(args, defaults)
		if (!this.climb_speed) Object.assign(this.climb_speed, this.base_speed)
		this.climbing = false;
		this.can_climb = false;
		this.actioning_tmr = 0;
		this.in_GUI = false;
		this.atk_body = null;
		this.interactables = []
		this.high_arm = NONE
	}

	controls() {
		if (!this.alive || this.in_GUI) return

		//Toggle climbing (H)
		if (keys_up[72] && this.can_climb) {
			if (this.climbing) {
				this.climbing = false;
				this.setActionTime(40)
			} else {
				this.climbing = true;
			}
			
		}
		
		let climb_step = false
		let climbing_vertically = false;
		if (this.climbing) {
			//Climbing Keys (J)(K)
			//alternate pressing them to climb
			if (keys_down[74] && this.high_arm !== LEFT) {
				climb_step = true
				if (this.high_arm === RIGHT) {
					this.high_arm = NONE
				} else {
					this.high_arm = LEFT
				}
			}
			if (keys_down[75] && this.high_arm !== RIGHT) {
				climb_step = true
				if (this.high_arm === LEFT) {
					this.high_arm = NONE
				} else {
					this.high_arm = RIGHT
				}
			}


			// Climb up(W) and down(S)
			if (keys[87] && !keys[83] && !this.col_sides.top && climb_step) {
				this.addVelocity(0, -this.speed.y)
				climbing_vertically = true;
			}
			if (keys[83] && !keys[87] && !this.col_sides.bottom && climb_step) {
				this.addVelocity(0, this.speed.y)
				climbing_vertically = true;
			}
			
			//Hold Position (Left Shift)
			if (keys[16]) {
				this.anchored = true
			}
		} else {
			//Jump (Space)
			if (keys[32] && this.jump < this.jump_height) {
				this.addVelocity(0, -(this.jump_sp + g.y))
				this.jump++
			}

			//Sprint (L Shift)
			if (keys[16]) this.speed.x *= this.sprint_mult
		}

		//Move left (A) - right (D)
		if ((!this.climbing || climb_step) && !climbing_vertically) {
			if (keys[68] && !keys[65] && !this.col_sides.right) {
				this.addVelocity(this.speed.x, 0)
				this.facing = RIGHT
			}
			if (keys[65] && !keys[68] && !this.col_sides.left) {
				this.addVelocity(-this.speed.x, 0)
				this.facing = LEFT
			}
		}

		//Interact (E)
		if (keys[69]) {
			if (!interact_key_down) this.interactables[0]?.obj?.interactEvent?.(this)
			interact_key_down = true
		} else {
			interact_key_down = false
		}
		
		this.combat_controls()
	}

	combat_controls() {
		//Shield (Q)
		if (keys[81]) {
			this.equipment.shield.useEvent()
		}

		//Light Attack (J)
		if (keys[74] && this.actioning_tmr === 0) {
			let atk = this.equipment.weapons[0].attacks.light
			this.attack(atk)
		}
		//Heavy Attack (K)
		if (keys[75] && this.actioning_tmr === 0) {
			let atk = this.equipment.weapons[0].attacks.heavy
			this.attack(atk)
		}
		//Switch Weapon (L)
		if (keys_up[76]) {
			this.switchWeapon()
		}

		//Use Consumable (U)
		if (keys[85]) {
			this.useConsumable()
		}
		//Cycle Consumable (I)
		if (keys[73]) {
			this.cycleConsumable()
		}
	}

	updateAtkVec() {
		if (!this.atk_body.tether_i) return
		let x_vert_i = 0;
		let y_vert_i = 0;
		if (this.facing === RIGHT) {
			x_vert_i = 1
			this.atk_body.offset = new Vector(0, 0)
			this.atk_body.dirc = RIGHT
		} else {
			this.atk_body.offset = new Vector(-this.w, 0)
			this.atk_body.dirc = LEFT
		}

		let vec = new Vector(x_vert_i, y_vert_i)
		if (this.atk_body.tether_i.x !== x_vert_i || this.atk_body.tether_i.y !== y_vert_i) this.atk_body.tether_i = vec
		this.atk_body.update()
	}

	attack(atk_args) {
		atk_args = atk_args || {}
		showHp()
		if (this.actioning_tmr === 0 && (!this.climbing || this.anchored)) {
			atk_args.tether_obj = this;
			atk_args.owner = this.equipment.weapons[0]
			this.atk_body = new Attack(atk_args)
			this.atk_body.sprite.load()
			this.updateAtkVec()
			this.setActionTime(this.atk_body.duration + this.atk_body.cooldown)
			this.atk_body.useEvent()
		}
	}

	useConsumable() {
		if ((this.climbing && !this.anchored)) return
		let slot = this.equipment.current_consumables_slot
		this.equipment.consumables[slot]?.useEvent()

		this.equipment.consumables.forEach((item, i) => {
			if (item.count <= 0) this.equipment.consumables.splice(i, 1)
		})
	}

	switchWeapon() {
		let temp = this.equipment.weapons[0]
		this.equipment.weapons.shift()
		this.equipment.weapons.push(temp)
	}

	cycleConsumable() {
		let temp = this.equipment.consumables[0]
		this.equipment.consumables.shift()
		this.equipment.consumables.push(temp)
	}

	addWeapon(item) {
		if (!(item instanceof Weapon)) return
		this.equipment.weapons.unshift(item)
		if (this.equipment.weapons.length > this.equipment.max_weapons) this.equipment.weapons.pop()
	}

	pickupWeapon(item) {
		if (plr.equipment.weapons.length > plr.equipment.max_weapons) {

		} else {
			plr.equipment.weapons.push(item)
		}
	}

	addConsumable(item) {
		if (!(item instanceof Consumable)) return
		this.equipment.consumables.unshift(item)
		if (this.equipment.consumables.length > this.equipment.max_consumables) this.equipment.consumables.pop()
	}

	die() {
		super.die()
		this.atk_body = null
		this.climbing = false;
	}

	findInteractables() {
		this.interactables = []
		current_lvl.contents.forEach((item) => {
			let dist = distance(this.center, item.center) 
			if (item.interactable && dist <= this.interact_radius) this.interactables.push({obj: item, dist})
		})
		this.interactables.sort((a, b) => {return a.dist - b.dist})
	}

	setActionTime(num) {
		if (num > this.actioning_tmr) this.actioning_tmr = num
	}

	climbCheck() {
		let old_climbing = this.climbing
		if (!this.can_climb) this.climbing = false
		if (old_climbing && !this.climbing) this.setActionTime(40)

		if (this.climbing) this.has_gravity = false;
		this.can_climb = false;
		if (!this.climb_allowed) return
		
		let should_end = false;
		this.collisions.forEach((col) => {
			if (!should_end) {
				let obj = col.obj1.id === this.id ? col.obj2 : col.obj1
				if (obj.climbable && col.intersect) {
					this.can_climb = true
					should_end = true;
				}
			}
		})
	}

	updateLightPos() {
		this.light.visible = current_lvl.ambient_light ? true : false
		this.light.pos = new Vector(this.draw_center.x, this.draw_center.y - plr.h/4)
	}

	update() {
		this.has_gravity = true
		if (this.actioning_tmr > 0) this.actioning_tmr--

		this.climbCheck()
		if (this.atk_body) {
			this.updateAtkVec()
			if (this.atk_body.age >= this.atk_body.life_span) this.atk_body = null
		}
		super.update()
		if (this.climbing) {
			Object.assign(this.speed, this.climb_speed)
		} else {
			Object.assign(this.speed, this.base_speed)
		}

		this.updateLightPos()
	}

	draw() {
		super.draw()
		let size = 32
		let x_offset = 0
		if (this.facing === LEFT) {
			x_offset = -size
		}
		this.equipment.weapons[0].sprite.draw(new Vector(this.draw_center.x + x_offset, this.draw_center.y - size), size, size)
		this.atk_body?.draw()
	}
}