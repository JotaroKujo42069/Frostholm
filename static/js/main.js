function checkObjs(ent) {
	current_lvl.contents.forEach((obj, i) => {
		if (obj.id !== ent.id && !ent.collisions?.[i] && !(obj instanceof Player)) {
			let col = collision(ent, obj)
			if ((col.instersect || col.will_intersect)) {
				if (zCheck(ent, obj) && !(obj instanceof Entity) && !obj.is_sensor) ent.markColSide(col)
				if (ent.col_sides.bottom) ent.on_ground = true

				ent.colEvent(obj)
				obj.colEvent(ent)

				ent.collisions[i] = col
			}
		}
	})
	enforceCol(ent)
}

function checkCollisions() {
	current_lvl.entities.forEach((ent) => {
		Object.assign(ent.translation_vec, ent.velocity)
		checkObjs(ent)
		ent.move(ent.translation_vec.x, ent.translation_vec.y)
		ent.velocity = new Vector(0, 0)
	})
}

function game_update() {
	if (paused) return
	if (hp_show_tmr > -HP_FADE_TIME) {
		hp_show_tmr--
	} else {
		hide_hp = true
	}

	current_lvl.update()

	plr.controls()

	checkCollisions()
	

	if (!isGarbage(plr.atk_body)) plr.atk_body.colCheck()

	
	plr.findInteractables()

	current_lvl.entities.forEach((item) => {
		item.follow()
		item.updateJump()

		Object.assign(item.translation_vec, item.velocity)
		item.move(item.translation_vec.x, item.translation_vec.y)
	})

	current_cam.update()
}

function update() {
	universalControls()

	game_update()
	
	current_lvl.GUIs.forEach((item) => {item?.update()})

	draw();
	
	reset_controls()
}

init()
setInterval(update, 10)