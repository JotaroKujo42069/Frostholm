function drawRect(obj, stroked, force_color) {
	let verts = obj.draw_vertices || obj.vertices
	let color = obj.color || 'rgba(0, 0, 0, 1)'
	if (force_color) color = force_color
	if (stroked) {
		c.strokeStyle = color
		c.lineWidth = 1
		c.strokeRect(verts[0].x, verts[0].y, obj.w, obj.h)
	} else {
		c.fillStyle = color
		c.fillRect(verts[0].x, verts[0].y, obj.w, obj.h)
	}
}

function drawLightMap() {
	c.drawImage(lm_canvas, 0, 0)
}

function drawInteractables() {
	plr.interactables.forEach((item) => {
		item = item.obj
		let vert = item.draw_vertices[0]
		
		let back_color = new Color()
		Object.assign(back_color, holo_key.color)
		back_color.a = 0.2

		holo_key.color.stroke()
		back_color.fill()
		c.lineWidth = holo_key.line_width
		let w_offset = (item.w - holo_key.w) / 2
		let x = vert.x + w_offset + holo_key.offset.x
		let y = vert.y - item.h + holo_key.offset.y
		c.beginPath()
		c.roundRect(x, y, holo_key.w, holo_key.h, holo_key.corner_r)
		c.stroke()
		c.closePath()
		c.beginPath()
		c.roundRect(x, y, holo_key.w, holo_key.h, holo_key.corner_r)
		c.fill()
		c.closePath()

		let font_size = Math.round(holo_key.h * 0.95) - holo_key.line_width
		c.font = font_size + 'px Arial'
		holo_key.color.fill()
		let txt_w = c.measureText(INTERACT_KEY).width
		x += (holo_key.w - txt_w) / 2
		y += (holo_key.h - font_size) / 2
		c.fillText(INTERACT_KEY, x, y)
	})
}

function drawCounter(obj, num, right_aligned) {
	let font_scale = 0.8

	let txt_x = obj.x + obj.w
	let txt_y = obj.y
	let icon_x = obj.x
	let icon_y = obj.y
	if (right_aligned) {
		let txt_w = c.measureText(num + '').width
		txt_x = obj.x - obj.w - txt_w
		icon_x = obj.x - obj.w
	}
	obj.sprite.draw(icon_x, icon_y)

	let font_size = Math.round(obj.h * font_scale)
	c.font = `${font_size}px Arial`
	c.fillStyle = 'black'
	c.fillText(num, txt_x, txt_y)
}

function drawHpRing(pos, r, border_width, value) {
		let fade_alpha = hp_show_tmr < 0 ? (HP_FADE_TIME + hp_show_tmr) / HP_FADE_TIME : 1
		let ring_color = new Color(133, 124, 85, fade_alpha);
		let hp_color = new Color(235, 201, 52, fade_alpha)
		let blackness = new Color(0, 0, 0, fade_alpha)

		//Border
		blackness.fill()
		c.beginPath()
		c.arc(pos.x, pos.y, r, 0, Math.PI*2)
		c.fill()
		c.closePath()

		//Background
		ring_color.fill()
		c.beginPath()
		c.arc(pos.x, pos.y, r - border_width, 0, Math.PI*2)
		c.fill()
		c.closePath()

		//Amount filled
		let offset = -Math.PI / 2
		let arc_range = ((value * Math.PI * 2) / 6) + offset
		hp_color.fill()
		c.beginPath()
		c.moveTo(pos.x, pos.y)
		c.arc(pos.x, pos.y, r - border_width , arc_range, offset, true)
		c.fill()
		c.closePath()

		//Dividers
		blackness.both()
		let half_border = border_width / 2
		let x = pos.x - half_border
		let y = pos.y - r
		let h = r*2
		c.fillRect(x, y, border_width, h)

		x = r * Math.cos(Math.PI/6)
		y = r * Math.sin(Math.PI/6)
		c.lineWidth = border_width / 2
		c.beginPath()
		c.moveTo(pos.x + x, pos.y + y)
		c.lineTo(pos.x - x, pos.y - y)
		x = r * Math.cos(5*Math.PI/6)
		y = r * Math.sin(5*Math.PI/6)
		c.moveTo(pos.x + x, pos.y + y)
		c.lineTo(pos.x - x, pos.y - y)
		c.stroke()
		c.closePath()
	}

function drawHp(ent, x, y, r) {
	if (plr.hp < 1 || !current_lvl.playable || hide_hp) return
	let spacing = 16
	let slices_per_ring = 6
	let border_width = 1;
	let pos_y = y + r
	let current_x = x + r;
	for (let i = 0; i < Math.floor(ent.hp / slices_per_ring); i++) {
		drawHpRing(new Vector(current_x, pos_y), r, border_width, slices_per_ring)
		current_x += spacing
	}
	let remainder = ent.hp % slices_per_ring
	if (remainder !== 0) drawHpRing(new Vector(current_x, pos_y), r, border_width, remainder)
	
}

function drawHurt(obj) {
	// if (plr.dmg_cooldown_tmr > 0 && plr.alive) {
	// 	hurt_color.a = (hurt_color.limits.a.max * plr.dmg_cooldown_tmr) / plr.dmg_cooldown
	// 	hurt_color.fill()
	// 	c.fillRect(0, 0, canvas.width, canvas.height)
	// }
	if (obj.dmg_cooldown_tmr > 0 && obj.alive) {
		hurt_color.a = (hurt_color.limits.a.max * obj.dmg_cooldown_tmr) / obj.dmg_cooldown
		hurt_color.fill()
		c.fillRect(0, 0, canvas.width, canvas.height)
	}
}

function drawPlrSideCols() {
	let obj;
	let thickness = 2;
	if (plr.col_sides.bottom) {
		obj = {
			w: plr.w,
			h: thickness
		}
		obj.vertices = calcVerts(new Vector(plr.draw_vertices[0].x, plr.draw_vertices[2].y - obj.h), obj.w, obj.h)
		drawRect(obj, false, 'orange')
	}
	if (plr.col_sides.right) {
		obj = {
			w: thickness,
			h: plr.h
		}
		obj.vertices = calcVerts(new Vector(plr.draw_vertices[1].x - obj.w, plr.draw_vertices[0].y), obj.w, obj.h)
		drawRect(obj, false, 'orange')
	}
	if (plr.col_sides.top) {
		obj = {
			w: plr.w,
			h: thickness
		}
		obj.vertices = calcVerts(new Vector(plr.draw_vertices[0].x, plr.draw_vertices[0].y), obj.w, obj.h)
		drawRect(obj, false, 'orange')
	}
	if (plr.col_sides.left) {
		obj = {
			w: thickness,
			h: plr.h
		}
		obj.vertices = calcVerts(new Vector(plr.draw_vertices[0].x, plr.draw_vertices[0].y), obj.w, obj.h)
		drawRect(obj, false, 'orange')
	}
}

function drawDebug() {
	let dbug = {
		x: 0,
		y: 48
	}
	c.fillStyle = 'rgba(200, 200, 200, 0.6)'
	c.fillRect(0, 0 + dbug.y, 96, 128)

	c.fillStyle = 'black'
	c.font = '12px Arial'
	c.fillText('X: ' + mouse.pos.x, 4, 4 + dbug.y);
	c.fillText('Y: ' + mouse.pos.y, 4, 16 + dbug.y);
	c.fillText('X: ' + mouse.prev_click_pos?.x, 4, 28 + dbug.y);
	c.fillText('Y: ' + mouse.prev_click_pos?.y, 4, 40 + dbug.y);
	c.fillText('Velocity: (' + plr.velocity.x + ', ' + plr.velocity.y + ')', 4, 52 + dbug.y);
	c.fillText('actioning_tmr: ' + plr.actioning_tmr, 4, 64 + dbug.y);
	c.fillText('Atk_body_x: ' + plr.atk_body?.vertices[0].x, 4, 76 + dbug.y);
	c.fillText('fall_speed_y: ' + plr.fall_speed.y, 4, 88 + dbug.y);
}

function drawDeathMessage() {
	if (plr && !plr.alive) {
		c.fillStyle = 'rgba(122, 122, 122, 0.5)'
		c.fillRect(0, 0, canvas.width, canvas.height)

		c.font = '12px Lobster'
		c.fillStyle = 'rgba(186, 34, 34, 1.0)'
		let size = c.measureText(DEATH_MESSAGE)
		let width = size.width
		let height = 12
		c.fillText(DEATH_MESSAGE, canvas.width/2 - width/2, canvas.height/2 - height/2)
	}
}
	
function draw() {
	c.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight)
	sfx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight)

	current_lvl.draw()
	// current_lvl.entities.forEach((ent) => {
	// 	drawHurt(ent)
	// })

	if (draw_hit_boxes) {
		current_lvl.entities.forEach((item) => {
			drawRect(item, true, 'red')
		})
	}

	if (draw_side_cols) drawPlrSideCols()
	
	drawInteractables()

	//GUIs
	current_lvl.GUIs.forEach((item) => {
		item.draw()
	})
	drawHp(plr, 4, 4, 16)
	args = {
		x: canvas.width - 4, 
		y: 4, 
		w: 32,
		h: 32,
		sprite: new Sprite({src: 'icon/money'})
	}
	drawCounter(args)

	//Overlays

	//Outline Attacks
	if (plr.atk_body && debug_mode) drawRect(plr.atk_body, true, 'red')

	drawDebug()
	drawDeathMessage()

	if (plr.atk_body?.sprite.frame_i === 2) {
		console.log()
	}
}	

