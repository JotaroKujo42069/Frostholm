function level1() {
	clearContentArrays()

	//Cameras
	args = {
		bounds_pos: new Vector(0, -canvas.height),
		bounds_w: canvas.width*2,
		bounds_h: canvas.height*2
	}
	let main_cam = new Camera(args)
	current_cam = main_cam

	sprite_args = {
		src: 'tile/terrain',
		frames: [new Vector(288, 336)],
		frame_w: 48,
		frame_h: 48,
		w: 64,
		h: 64
	}
	args = {
		x: 0,
		y:	canvas.height - 64,
		w: canvas.width * 2,
		h: 64,
		sprite: new Sprite(sprite_args)
	}
	let ground = new Body(args)
	ground.sprite.tile_surface = ground.vertices

	// args = {
	// 	x: 100,
	// 	y:	736,
	// 	w: 16,
	// 	h: 16,
	// 	sprite: new Sprite({
	// 		w:16,
	// 		h: 16,
	// 		background_color: 'rgba(0, 200, 250, 1.0)'
	// 	})
	// }
	// let rect3 = new Body(args)

	// args = {
	// 	x: 100,
	// 	y:	720,
	// 	w: 16,
	// 	h: 16,
	// 	sprite: new Sprite({
	// 		w:16,
	// 		h: 16,
	// 		background_color: 'rgba(200, 200, 20, 1.0)'
	// 	})
	// }
	// let rect5 = new Body(args)

	// args = {
	// 	x: 100,
	// 	y:	704,
	// 	w: 16,
	// 	h: 16,
	// 	sprite: new Sprite({
	// 		w:16,
	// 		h: 16,
	// 		background_color: 'rgba(0, 200, 250, 1.0)'
	// 	})
	// }
	// let rect6 = new Body(args)

	sprite_args = {
		src: 'tile/terrain',
		w: 16,
		h: 16,
		frames: [new Vector(48, 432)],
		frame_w: 48,
		frame_h: 48
	}
	args = {
		x: 832,
		y: 672,
		w: 264,
		h: 16,
		sprite: new Sprite(sprite_args)
	}
	let platform = new Body(args)
	platform.sprite.tile_surface = platform.vertices

	sprite_args = {
		offset: new Vector(0, -4), 
		frames: [new Vector(0, 288), new Vector(48, 288), new Vector(96, 288)], 
		frame_w: 48, 
		frame_h: 48,
		default_frame_duration: 30,
		src: 'tile/lights'
	}
	args = {
		x: 896,
		y: 684,
		w: 32,
		h: 32,
		is_sensor: true,
		sprite: new Sprite(sprite_args)
	}
	let lamp = new Body(args)	

	args = {
		parent: lamp,
		r: 96,
		color: new Color(254, 243, 127, 0.2)
	}
	let lamp_light = new CircleLight(args)
	lights.push(lamp_light)

	sprite_args = {
		offset: new Vector(0, 8), 
		frames: [new Vector(0, 48), new Vector(48, 48), new Vector(96, 48)], 
		frame_w: 48, 
		frame_h: 48,
		default_frame_duration: 15,
		src: 'tile/lights'
	}
	args = {
		x: 224,
		y: 736,
		w: 32,
		h: 32,
		is_sensor: true,
		sprite: new Sprite(sprite_args)
	}
	let skull_candle = new Body(args)	

	args = {
		parent: skull_candle,
		r: 80,
		color: new Color(108, 236, 252, 0.2)
	}
	let skull_light = new CircleLight(args)
	lights.push(skull_light)


	sprite_args = {
		src: 'projectile/magic_bolt',
		frames: [new Vector(0, 0), new Vector(32, 0), new Vector(64, 0)],
		frame_w: 32,
		frame_h: 32
	}
	args = {
		x: 16,
		y: 600,
		sprite: new Sprite({src: 'item/key_steel_classic'}),
		projectile_stats: {
			offset: new Vector(0, -plr.h/2),
			sprite: new Sprite(sprite_args)
		}
	}
	let wand = new RangedWeapon(args)
	wand.attacks = {light: {useFunc: () => {
		plr.atk_body.owner.shoot()
	}, duration: 33}}

	args = {
		alignment: EVIL,
		x: 600,
		y: 400,
		w: 64,
		h: 64,
		base_dmg: 2,
		base_speed: new Vector(1.25, 1.25),
		sprite: new Sprite({w:64, h:64, src: 'entity/skeleton_right'}),
		follow_target: plr,
		follow_range: {min: plr.width/2, max: canvas.width},
		loot: [wand],
		drawFunc: function() {
			if (this.facing === RIGHT) {
				this.sprite.img.src = 'assets/entity/skeleton_right.png'
			} else {
				this.sprite.img.src = 'assets/entity/skeleton_left.png'
			}
		}
	}
	args.colFunc = function(obj) {
		obj?.damage?.(this.base_dmg)
	}
	let enemy1 = new Entity(args)

	args = {
		x: 664,
		y: 640,
		w: 64,
		h: 128,
		z: 1,
		is_sensor: true,
		sprite: new Sprite({w:64, h:128, src: 'decoration/pine_tree'})
	}
	let tree = new Body(args)

	args = {
		x: 216,
		y: 640,
		w: 64,
		h: 128,
		z: -1,
		is_sensor: true,
		sprite: new Sprite({w:64, h:128, src: 'decoration/pine_tree'})
	}
	let tree1 = new Body(args)

	args = {
		x: 1600,
		y: 640,
		w: 64,
		h: 128,
		z: -1,
		is_sensor: true,
		sprite: new Sprite({w:64, h:128, src: 'decoration/pine_tree'})
	}
	let tree2 = new Body(args)

	sprite_args = {
		src: 'tile/terrain',
		overlay_color: 'rgba(0, 0, 0, 0.3)',
		w: 64,
		h: 64,
		frames: [new Vector(48, 336)],
		frame_w: 48,
		frame_h: 48
	}
	args = {
		x: 832,
		y: 672,
		z: -1,
		w: 256,
		h: 96,
		sprite: new Sprite(sprite_args)
	}
	let back_rect = new Body(args)
	back_rect.sprite.tile_surface = back_rect.vertices

	args = {
		x: 768,
		y: 672,
		w: 64,
		h: 96,
		z: -1,
		z_range: {min: 0, max: 0},
		is_sensor: true,
		climbable: true,
		sprite: new Sprite({frames: [new Vector(336, 384)], frame_w: 48, frame_h: 48, w: 64, h: 96, src: 'tile/terrain'})
	}
	let climbable = new Body(args)

	sprite_args = {
		src: 'tile/terrain',
		w: 16,
		h: 96,
		frames: [new Vector(192, 336)],
		frame_w: 48,
		frame_h: 96
	}
	args = {
		x: 1200,
		y: 672,
		w: 16,
		h: 96,
		sprite: new Sprite(sprite_args)
	}
	let wall1 = new Body(args)
	sprite_args = {
		src: 'tile/terrain',
		w: 128,
		h: 16,
		frames: [new Vector(192, 432)],
		frame_w: 96,
		frame_h: 48
	}
	args = {
		x: 1200,
		y: 656,
		w: 128,
		h: 16,
		sprite: new Sprite(sprite_args)
	}
	let platform2 = new Body(args)

	sprite_args = {
		src: 'tile/terrain',
		w: 64,
		h: 16,
		frames: [new Vector(192, 432)],
		frame_w: 96,
		frame_h: 48
	}
	args = {
		x: 1100,
		y: 556,
		w: 64,
		h: 16,
		sprite: new Sprite(sprite_args)
	}
	let platform3 = new Body(args)

	args = {
		x: 1000,
		y: 456,
		w: 64,
		h: 16,
		sprite: new Sprite(sprite_args)
	}
	let platform4 = new Body(args)

	args = {
		x: 896,
		y: 352,
		w: 64,
		h: 16,
		sprite: new Sprite(sprite_args)
	}
	let platform5 = new Body(args)

	args = {
		x: 896,
		y: 96,
		w: 64,
		h: 256,
		z: -1,
		z_range: {min: 0, max: 0},
		is_sensor: true,
		climbable: true,
		sprite: new Sprite({frames: [new Vector(336, 384)], frame_w: 48, frame_h: 48, w: 64, h: 64, src: 'tile/terrain'})
	}
	let climbable2 = new Body(args)
	climbable2.sprite.tile_surface = climbable2.vertices

	sprite_args = {
		src: 'tile/terrain',
		frames: [new Vector(288, 336)],
		frame_w: 48,
		frame_h: 48,
		w: 64,
		h: 64
	}
	args = {
		x: 0,
		y: 96,
		w: 896,
		h: 64,
		sprite: new Sprite(sprite_args)
	}
	let ground2 = new Body(args)
	ground2.sprite.tile_surface = ground2.vertices

	args = {
		x: 960,
		y: 96,
		w: 896,
		h: 64,
		sprite: new Sprite(sprite_args)
	}
	let ground3 = new Body(args)
	ground3.sprite.tile_surface = ground3.vertices

	shield_args = {
		useFunc: () => console.log('Use'),
		usingFunc: () => console.log('Using'),
		endFunc: () => console.log('End'),
		sprite: new Sprite({src: 'item/shield_green'})
	}
	args = {
		x: 450,
		y: 500,
		item: new Shield(shield_args)
	}
	let shield1 = new Item(args)

	contents.push(plr)
	lights.push(plr.light)
}

