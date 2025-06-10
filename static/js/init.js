//Init global vars
const DEFAULT_ATK_PARTICLE_ARGS = {
	src: 'particle/swish_right', 
	frames: [new Vector(0, 0), new Vector(32, 0), new Vector(64, 0)],
	frame_w: 32, 
	frame_h: 48,
	h: 48
}

function init() {
	light_map_pos = new Vector(-canvas.width*2, -canvas.height*2)
	holo_key = {
		w: 32,
		h: 32,
		corner_r: 3,
		line_width: 2,
		offset: null,
		color: new Color(255, 136, 0, 0.8)
	}
	holo_key.offset = new Vector(0, -16)

	hurt_color = new Color(232, 36, 26, hurt_opacity_mx)
	hurt_color.limits.a.max = hurt_opacity_mx

	//Ids
	level_id = new Id()
	body_id = new Id()
	gui_id = new Id()

	let default_cam = new Camera()
	current_cam = default_cam

	args = {
		x: 300,
		y: 300,
		w: 32,
		h: 64,
		invulnerable: true,
		sprite: new Sprite({w: 32, h: 64, src: 'plr/idle'})
	}
	plr = new Player(args);

	buildInvLayer()
	buildSkillsLayer()

	//Levels
	contents = []
	GUIs = []
	title_screen()
	args = {
		background_color: 'rgba(217, 185, 89, 1.0)',
		contents,
		GUIs,
		playable: false
	}
	title_scrn = new Level(args)
	title_scrn.contents = contents

	level1()
	args = {
		background_color: new Color(218, 228, 245, 1.0),
		ambient_light: new Color(0, 0, 0, 0.5),
		contents,
		GUIs,
		lights
	}
	lvl1 = new Level(args)

	//currents
	lvl1.enter()

	current_lvl.addGUI(inv_layer)
	current_lvl.addGUI(skills_layer)
}

function buildInvLayer() {
	inv_layer = new GUILayer({visible: false})

	args = {
		parent: inv_layer,
		align: CENTER,
		vert_align: CENTER,
		w: 512,
		h: 368,
		padding: 12,
		items: []
	}
	let inv = new Inventory(args)

	args = {
		parent: inv_layer,
		align: CENTER,
		vert_align: CENTER,
		w: 344,
		h: 56,
		padding: 12
	}
	let equipment_bar = new Box(args)
	equipment_bar.relative_pos = new Vector(0, -inv.h/2 - equipment_bar.h + equipment_bar.border_width)

	args = {
		parent: equipment_bar,
		locked: true,
		item: plr.equipment.shield,
		vert_align: CENTER,
		align: RIGHT,
		updateFunc: () => {
			shield_slot.item = plr.equipment.shield
		}
	}
	shield_slot = new ItemSlot(args)

	args = {
		parent: equipment_bar,
		locked: true,
		item: plr.equipment.weapons[0],
		vert_align: CENTER,
		relative_pos: new Vector(0, 0),
		updateFunc: () => {
			primary_weapon_slot.item = plr.equipment.weapons[0]
		}
	}
	primary_weapon_slot = new ItemSlot(args)

	args = {
		parent: equipment_bar,
		locked: true,
		item: plr.equipment.weapons[1],
		vert_align: CENTER,
		relative_pos: new Vector(34, 0),
		updateFunc: () => {
			secondary_weapon_slot.item = plr.equipment.weapons[1]
		}
	}
	secondary_weapon_slot = new ItemSlot(args)

	args = {
		parent: equipment_bar,
		locked: true,
		item: plr.equipment.consumables[0],
		vert_align: CENTER,
		align: CENTER,
		relative_pos: new Vector(-67, 0),
		updateFunc: () => {
			consumable_slot_1.item = plr.equipment.consumables[0]
		}
	}
	consumable_slot_1 = new ItemSlot(args)

	args = {
		parent: equipment_bar,
		locked: true,
		item: plr.equipment.consumables[1],
		vert_align: CENTER,
		align: CENTER,
		relative_pos: new Vector(-33, 0),
		updateFunc: () => {
			consumable_slot_2.item = plr.equipment.consumables[1]
		}
	}
	consumable_slot_2 = new ItemSlot(args)

	args = {
		parent: equipment_bar,
		locked: true,
		item: plr.equipment.consumables[2],
		vert_align: CENTER,
		align: CENTER,
		relative_pos: new Vector(1, 0),
		updateFunc: () => {
			consumable_slot_3.item = plr.equipment.consumables[2]
		}
	}
	consumable_slot_3 = new ItemSlot(args)

	args = {
		parent: equipment_bar,
		locked: true,
		item: plr.equipment.consumables[3],
		vert_align: CENTER,
		align: CENTER,
		relative_pos: new Vector(35, 0),
		updateFunc: () => {
			consumable_slot_4.item = plr.equipment.consumables[3]
		}
	}
	consumable_slot_4 = new ItemSlot(args)
}

function buildSkillsLayer() {
	args = {
		background_color: 'rgba(203, 194, 204, 1)',
		visible: false
	}
	skills_layer = new GUILayer(args)
	

	args = {
		parent: skills_layer,
		align: CENTER,
		vert_align: CENTER,
		r: 352,
		border_width: 0
	}
	let background = new Circle(args)
	background.init()
	let grad_pos_start = getVecOnCircle(background, -Math.PI/4, 1)
	let grad_pos_end = getVecOnCircle(background, -5*Math.PI/4, 1)
	let back_grad = c.createLinearGradient(grad_pos_start.x, grad_pos_start.y, grad_pos_end.x, grad_pos_end.y)
	back_grad.addColorStop(0, 'rgba(54, 40, 176, 1)')
	back_grad.addColorStop(1, 'rgba(176, 40, 40, 1)')
	background.background_color = back_grad

	let main = new Circle(args)
	main.init()
	let grad = c.createRadialGradient(main.x, main.y, 0, main.x, main.y, main.r)
	grad.addColorStop(0, 'rgba(0, 0, 0, 0.5)')
	grad.addColorStop(1, 'rgba(0, 0, 0, 0)')
	main.background_color = grad

	function placeCircle(circle, pos) {
		circle.relative_pos = new Vector(circle.x - pos.x, circle.y - pos.y)
	}

	let r = 24
	let track_margin = r
	let border_margin = 8
	let track1_dist = (main.r - r - border_margin) / main.r
	main.track1_dist = track1_dist
 	let track2_dist = (main.r - r*4 - track_margin) / main.r
 	main.track2_dist = track2_dist
	let track2aa_dist = (main.r - r*2 - track_margin) / main.r
	let track2a_dist = (main.r - r*3 - track_margin) / main.r
	main.track2a_dist = track2a_dist
	let track2b_dist = (main.r - r*5 - track_margin) / main.r
	main.track2b_dist = track2b_dist
	let track2bb_dist = (main.r - r*6 - track_margin) / main.r
	let track3_dist = (main.r - r*8 - track_margin) / main.r
	main.track3_dist = track3_dist

	let main_axis = Math.PI/4
	let upgrade1_axis = Math.PI/5 + main_axis 
	let upgrade2_axis = 2*Math.PI/5 + main_axis 
	let upgrade3_axis = 3*Math.PI/5 + main_axis 
	let upgrade4_axis = 4*Math.PI/5 + main_axis 

	let circle_args = {
		parent: main,
		r,
		background_color: 'rgba(0, 0, 0, 0.1)',
		border_color: 'rgba(0, 0, 0, 0.3)'
	}
	let general1 = new Circle(circle_args)
	general1.name_id = 'general1'
	general1.init()
	placeCircle(general1, getVecOnCircle(main, main_axis, track2_dist))

	let weapon1 = new Circle(circle_args)
	weapon1.name_id = 'weapon1'
	weapon1.init()
	placeCircle(weapon1, getVecOnCircle(main, upgrade1_axis, track1_dist))

	let weapon2 = new Circle(circle_args)
	weapon2.name_id = 'weapon2'
	weapon2.init()
	placeCircle(weapon2, getVecOnCircle(main, upgrade2_axis, track1_dist))

	let weapon3 = new Circle(circle_args)
	weapon3.name_id = 'weapon3'
	weapon3.init()
	placeCircle(weapon3, getVecOnCircle(main, upgrade3_axis, track1_dist))

	let shield1 = new Circle(circle_args)
	shield1.name_id = 'shield1'
	shield1.init()
	placeCircle(shield1, getVecOnCircle(main, upgrade1_axis, track2_dist))

	let shield2 = new Circle(circle_args)
	shield2.name_id = 'shield2'
	shield2.init()
	placeCircle(shield2, getVecOnCircle(main, upgrade2_axis, track2_dist))

	let shield3 = new Circle(circle_args)
	shield3.name_id = 'shield3'
	shield3.init()
	placeCircle(shield3, getVecOnCircle(main, upgrade3_axis, track2a_dist))

	let shield4 = new Circle(circle_args)
	shield4.name_id = 'shield4'
	shield4.init()
	placeCircle(shield4, getVecOnCircle(main, upgrade3_axis, track2b_dist))

	let passive1 = new Circle(circle_args)
	passive1.name_id = 'passive1'
	passive1.init()
	placeCircle(passive1, getVecOnCircle(main, upgrade1_axis, track3_dist))

	let passive2 = new Circle(circle_args)
	passive2.name_id = 'passive2'
	passive2.init()
	placeCircle(passive2, getVecOnCircle(main, upgrade2_axis, track3_dist))

	let passive3 = new Circle(circle_args)
	passive3.name_id = 'passive3'
	passive3.init()
	placeCircle(passive3, getVecOnCircle(main, upgrade3_axis, track3_dist))

	let general3 = new Circle(circle_args)
	general3.name_id = 'general3'
	general3.init()
	placeCircle(general3, getVecOnCircle(main, upgrade4_axis, track2aa_dist))

	let general2 = new Circle(circle_args)
	general2.name_id = 'general2'
	general2.init()
	placeCircle(general2, getVecOnCircle(main, upgrade4_axis, track2bb_dist))


	//ENEMY HALF

	let e_general1 = new Circle(circle_args)
	e_general1.name_id = 'e_general1'
	e_general1.init()
	placeCircle(e_general1, getVecOnCircle(main, main_axis, track2_dist, true))

	let e_weapon1 = new Circle(circle_args)
	e_weapon1.name_id = 'e_weapon1'
	e_weapon1.init()
	placeCircle(e_weapon1, getVecOnCircle(main, upgrade1_axis, track1_dist, true))

	let e_weapon2 = new Circle(circle_args)
	e_weapon2.name_id = 'e_weapon2'
	e_weapon2.init()
	placeCircle(e_weapon2, getVecOnCircle(main, upgrade2_axis, track1_dist, true))

	let e_weapon3 = new Circle(circle_args)
	e_weapon3.name_id = 'e_weapon3'
	e_weapon3.init()
	placeCircle(e_weapon3, getVecOnCircle(main, upgrade3_axis, track1_dist, true))

	let e_shield1 = new Circle(circle_args)
	e_shield1.name_id = 'e_shield1'
	e_shield1.init()
	placeCircle(e_shield1, getVecOnCircle(main, upgrade1_axis, track2_dist, true))

	let e_shield2 = new Circle(circle_args)
	e_shield2.name_id = 'e_shield2'
	e_shield2.init()
	placeCircle(e_shield2, getVecOnCircle(main, upgrade2_axis, track2_dist, true))

	let e_shield3 = new Circle(circle_args)
	e_shield3.name_id = 'e_shield3'
	e_shield3.init()
	placeCircle(e_shield3, getVecOnCircle(main, upgrade3_axis, track2a_dist, true))

	let e_shield4 = new Circle(circle_args)
	e_shield4.name_id = 'e_shield4'
	e_shield4.init()
	placeCircle(e_shield4, getVecOnCircle(main, upgrade3_axis, track2b_dist, true))

	let e_passive1 = new Circle(circle_args)
	e_passive1.name_id = 'e_passive1'
	e_passive1.init()
	placeCircle(e_passive1, getVecOnCircle(main, upgrade1_axis, track3_dist, true))

	let e_passive2 = new Circle(circle_args)
	e_passive2.name_id = 'e_passive2'
	e_passive2.init()
	placeCircle(e_passive2, getVecOnCircle(main, upgrade2_axis, track3_dist, true))

	let e_passive3 = new Circle(circle_args)
	e_passive3.name_id = 'e_passive3'
	e_passive3.init()
	placeCircle(e_passive3, getVecOnCircle(main, upgrade3_axis, track3_dist, true))

	let e_general3 = new Circle(circle_args)
	e_general3.name_id = 'e_general3'
	e_general3.init()
	placeCircle(e_general3, getVecOnCircle(main, upgrade4_axis, track2aa_dist, true))

	let e_general2 = new Circle(circle_args)
	e_general2.name_id = 'e_general2'
	e_general2.init()
	placeCircle(e_general2, getVecOnCircle(main, upgrade4_axis, track2bb_dist, true))

	main.drawFunc = function() {
		c.strokeStyle = 'white'
		c.beginPath()
		c.arc(this.x, this.y, this.r * track1_dist, upgrade1_axis + Math.PI, upgrade3_axis + Math.PI)
		c.stroke()

		c.beginPath()
		c.arc(this.x, this.y, this.r * track2_dist, main_axis + Math.PI, upgrade2_axis + Math.PI)
		c.stroke()

		c.beginPath()
		c.arc(this.x, this.y, this.r * track3_dist, upgrade1_axis + Math.PI, upgrade3_axis + Math.PI)
		c.stroke()

		let radius = this.r * this.track2_dist
		let data = calcArcData(this.contents.findByNameId('general1'), this.contents.findByNameId('passive1'), radius)

		c.strokeStyle = 'white'
		c.beginPath()
		c.arc(data.circle.x, data.circle.y, radius, data.start, data.end)
		c.stroke()

		radius = this.r * this.track2_dist
		data = calcArcData(this.contents.findByNameId('general1'), this.contents.findByNameId('weapon1'), radius)

		c.beginPath()
		c.arc(data.circle.x, data.circle.y, radius, data.start, data.end)
		c.stroke()

		radius = this.r * this.track2_dist
		data = calcArcData(this.contents.findByNameId('shield2'), this.contents.findByNameId('shield4'), radius)

		c.beginPath()
		c.arc(data.circle.x, data.circle.y, radius, data.start, data.end)
		c.stroke()

		radius = this.r * this.track2_dist
		data = calcArcData(this.contents.findByNameId('shield2'), this.contents.findByNameId('shield3'), radius)

		c.beginPath()
		c.arc(data.circle.x, data.circle.y, radius, data.start, data.end)
		c.stroke()

		radius = this.r * this.track3_dist
		data = calcArcData(this.contents.findByNameId('passive3'), this.contents.findByNameId('general2'), radius)

		c.beginPath()
		c.arc(data.circle.x, data.circle.y, radius, data.start, data.end)
		c.stroke()

		radius = this.r * this.track2b_dist
		data = calcArcData(this.contents.findByNameId('shield4'), this.contents.findByNameId('general2'), radius)

		c.beginPath()
		c.arc(data.circle.x, data.circle.y, radius, data.start, -data.end)
		c.stroke()

		radius = this.r * this.track2a_dist
		data = calcArcData(this.contents.findByNameId('shield3'), this.contents.findByNameId('general3'), radius)

		c.beginPath()
		c.arc(data.circle.x, data.circle.y, radius, data.start, -data.end)
		c.stroke()

		radius = this.r * this.track1_dist
		data = calcArcData(this.contents.findByNameId('weapon3'), this.contents.findByNameId('general3'), radius)

		c.beginPath()
		c.arc(data.circle.x, data.circle.y, radius, data.start, -data.end)
		c.stroke()


		//Enemy Half
		c.beginPath()
		c.arc(this.x, this.y, this.r * track1_dist, upgrade1_axis, upgrade3_axis)
		c.stroke()

		c.beginPath()
		c.arc(this.x, this.y, this.r * track2_dist, main_axis, upgrade2_axis)
		c.stroke()

		c.beginPath()
		c.arc(this.x, this.y, this.r * track3_dist, upgrade1_axis, upgrade3_axis)
		c.stroke()

		radius = this.r * this.track2_dist
		data = calcArcData(this.contents.findByNameId('e_general1'), this.contents.findByNameId('e_passive1'), radius)

		c.beginPath()
		c.arc(data.circle.x, data.circle.y, radius, -data.start, -data.end)
		c.stroke()

		radius = this.r * this.track2_dist
		data = calcArcData(this.contents.findByNameId('e_general1'), this.contents.findByNameId('e_weapon1'), radius)

		c.beginPath()
		c.arc(data.circle.x, data.circle.y, radius, -data.start, -data.end)
		c.stroke()

		radius = this.r * this.track2_dist
		data = calcArcData(this.contents.findByNameId('e_shield2'), this.contents.findByNameId('e_shield4'), radius)

		c.beginPath()
		c.arc(data.circle.x, data.circle.y, radius, -data.start, -data.end)
		c.stroke()

		radius = this.r * this.track2_dist
		data = calcArcData(this.contents.findByNameId('e_shield2'), this.contents.findByNameId('e_shield3'), radius)

		c.beginPath()
		c.arc(data.circle.x, data.circle.y, radius, -data.start, -data.end)
		c.stroke()

		radius = this.r * this.track3_dist
		data = calcArcData(this.contents.findByNameId('e_passive3'), this.contents.findByNameId('e_general2'), radius)

		c.beginPath()
		c.arc(data.circle.x, data.circle.y, radius, -data.start, -data.end)
		c.stroke()

		radius = this.r * this.track2b_dist
		data = calcArcData(this.contents.findByNameId('e_shield4'), this.contents.findByNameId('e_general2'), radius)

		c.beginPath()
		c.arc(data.circle.x, data.circle.y, radius, -data.start, data.end)
		c.stroke()

		radius = this.r * this.track2a_dist
		data = calcArcData(this.contents.findByNameId('e_shield3'), this.contents.findByNameId('e_general3'), radius)

		c.beginPath()
		c.arc(data.circle.x, data.circle.y, radius, -data.start, data.end)
		c.stroke()

		radius = this.r * this.track1_dist
		data = calcArcData(this.contents.findByNameId('e_weapon3'), this.contents.findByNameId('e_general3'), radius)

		c.beginPath()
		c.arc(data.circle.x, data.circle.y, radius, -data.start, data.end)
		c.stroke()
	}
}