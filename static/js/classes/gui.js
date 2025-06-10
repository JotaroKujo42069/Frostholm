﻿let align_options = [LEFT, CENTER, RIGHT]
let vert_align_options = [TOP, CENTER, BOTTOM]

class GUIAnimation {
	constructor(args) {
	}
}

class Box {
	constructor(args, childDefaults) {
		if (isGarbage(args)) args = {}
		if (isGarbage(childDefaults)) childDefaults = {}
		this.defaults = {
			parent: null,
			relative_pos: new Vector(0, 0),
			x: 0,
			y: 0,
			z: 0,
			w: 64,
			h: 96,
			visible: true,
			tangible: true,
			background_color: 'rgba(255, 255, 255, 0.4)',
			text_color: 'rgba(0, 0, 0, 1.0)',
			border_color: 'rgba(100, 100, 100, 1.0)',
			border_width: 2,
			margin: 0,
			padding: 0,
			align: LEFT,
			vert_align: TOP,
			enterAnim: null,
			exitAnim: null,
			updateFunc: null,
			drawFunc: null,
			contents: []
		}
		Object.assign(this.defaults, childDefaults)
		assignClassArgs(this, args)
		this.id = gui_id.next()

		if (this.align) {
			let success = false
			align_options.forEach((item) => {
				if (this.align === item) success = true;
			})
			if (!success) this.align = this.defaults.align
		}
		if (this.vert_align) {
			let success = false
			vert_align_options.forEach((item) => {
				if (this.align === item) success = true;
			})
			if (!success) this.vert_align = this.defaults.vert_align
		}

		if (this?.parent instanceof Circle) {
			this.align = CIRCLE
			this.vert_align = CIRCLE
		}

		this.center = calcCenter(this)

		this.contents.forEach((item) => {item.parent = this})
		this.parent?.contents.push(this)
	}

	hide() {
		this.tangible = false;
		this.visible = false;
	}

	show() {
		this.tangible = true;
		this.visible = true;
	}

	calcPos() {
		let w = this.w
		let h = this.h
		let parent_x = 0
		let parent_y = 0
		let parent_w = 0
		let parent_h = 0
		let mod = 0

		if (this?.parent) {
			mod = this.parent.border_width + this.parent.padding
			parent_x = this.parent.x
			parent_y = this.parent.y
			parent_w = this.parent.w
			parent_h = this.parent.h
		}

		let x = parent_x + this.relative_pos.x
		let y = parent_y + this.relative_pos.y

		if (this instanceof Circle) {
			w = 0;
			h = 0;
		}

		switch (this.align) {
			case LEFT:
				x = parent_x + this.relative_pos.x + mod
				break;
			case CENTER:
				x = parent_x + parent_w/2 + this.relative_pos.x - w/2 + mod
				break;
			case RIGHT:
				x = parent_x + parent_w + this.relative_pos.x - w - mod
				break;
		}
		switch (this.vert_align) {
			case TOP:
				y = parent_y + this.relative_pos.y + mod
				break;
			case CENTER:
				y = parent_y  + this.relative_pos.y + (parent_h/2 - h/2) + mod
				if (mod * 2 + h > this.parent.h) y = parent_y + mod
				break;
			case BOTTOM:
				y = parent_y + parent_h + this.relative_pos.y - h - mod
				break;
		}	

		x += this.margin
		y += this.margin
		this.x = x;
		this.y = y;

	}

	init() {
		this.calcPos()
		this.contents.forEach((item) => {item.init()})
	}

	update() {
		this.center = calcCenter(this)
		this.updateFunc?.()
		this.contents.forEach((item) => {item?.update?.()})
	}

	classDraw() {
		if (this.border_width > 0) {
			c.fillStyle = this.border_color
			c.fillRect(this.x, this.y, this.w, this.h)
		}
		c.fillStyle = this.background_color
		c.fillRect(this.x + this.border_width, this.y + this.border_width, this.w - this.border_width*2, this.h - this.border_width*2)
	}

	draw(childFunc) {
		if (!this.visible) return
		this.classDraw()
		
		this.drawFunc?.()
		childFunc?.()

		this.contents.sort((a,b) => {return a.z - b.z})
		this.contents.forEach((item) => item.draw())
	}
}

class Circle extends Box {
	constructor(args) {
		args = args || {}
		let defaults = {
			r: 32
		}
		super(args, defaults)

		let diameter = this.r*2
		this.w = diameter
		this.h = diameter
	}

	classDraw() {
		if (this.border_width > 0) {
			c.fillStyle = this.border_color
			c.beginPath()
			c.arc(this.x, this.y, this.r, 0, Math.PI*2)
			c.fill()
		}
		c.fillStyle = this.background_color
		c.beginPath()
		c.arc(this.x, this.y, this.r - this.border_width, 0, Math.PI*2)
		c.fill()
	}
}

class Button extends Box {
	constructor(args, child_defaults) {
		child_defaults = child_defaults || {}
		let defaults = {
			mouseDownAnim: null,
			mouseUpAnim: null,
			clickFunc: null,
			releaseFunc: null,
			press_anim_visible: true
		}
		Object.assign(defaults, child_defaults)
		super(args, defaults)
		this.clicked = false;
	}

	clickEvent() {
		this.clickFunc?.()
	}

	releaseEvent() {
		this.releaseFunc?.()
	}

	checkClick() {
		if (!this.tangible) return
		if (mouse.checkBounds(this)) {
			this.clickEvent()
			this.clicked = true;
		}
		if (this.clicked && mouse.on_up) {
			this.clicked = false;
			this.releaseEvent()
		}
	}

	update() {
		this.checkClick()
		super.update()
	}

	draw(childFunc) {
		if (!this.visible) return
		super.draw()
		childFunc?.()
		if (this.press_anim_visible && this.clicked) {
			c.fillStyle = 'rgba(111, 111, 111, 0.3)'
			c.fillRect(this.x, this.y, this.w, this.h)
		}
	}	
}

class TextBox extends Box {
	constructor(args) {
		let defaults = {
			font: 'Arial',
			font_size: 12,
			text: '',
			lines: [],
			background_color: 'rgba(155, 155, 155, 0)',
			border_color: 'rgba(0, 0, 0, 0)',
			border_width: 0
		}
		super(args, defaults)
		this.calcTextWrap()
		this.h = this.font_size
	}

	calcTextWrap() {
		let text = this.text;
		if (c.measureText(text).width > this.w) {
			this.lines = []

			let error_len = 100
			let pos = text.indexOf(' ');
			let oldPos = pos;
			let line = text.substr(0, pos);
			let leftOver = text;
			let i = 0;
			let k = 0;
			while (c.measureText(leftOver).width > this.w) {
				pos = text.indexOf(' ');
				oldPos = pos;
				line = text.substr(0, pos);
				leftOver = text;
				while (c.measureText(text.substr(0, pos)).width <= this.w && leftOver.indexOf(' ') >= 0) {
					oldPos = pos;
					line = text.substr(0, pos);
					leftOver = text.substr(pos + 1, text.length);
					pos += leftOver.indexOf(' ') + 1;

					if (i >= error_len) {
						alert('Fatal Text Object ERROR at i');
						const error = new Error(`Fatal Text Object ERROR at ${i}`)
						error.data = {}
						throw error;
						
					}
					i++;
				}
				this.lines.push(line);
				text = leftOver;
				pos = oldPos;

				if (k >= error_len) {
					alert('Fatal Text Object ERROR atS k');
					console.log(this.lines);
					break;
				}
				k++;
			}
			this.lines.push(leftOver);
		} else {
			this.lines.push(this.text);
		}
	}

	draw() {
		if (!this.visible) return
		let func = () => {
			c.font = this.font_size + 'px Arial'
			c.fillStyle = this.text_color
		
			this.lines.forEach((item, i) => {
				let y = this.y + i * this.font_size
				if (y + this.font_size <= this.y + this.h) {
					c.fillText(item, this.x, y);
				}
			});
		}
		super.draw(func)
	}
}

class Bar extends Box {
	#value;
	#max;
	constructor(args) {
		args = args || {}
		let defaults = {
			h: 16,
			value: 0,
			max: 100,
			value_link: null,
			max_link: null,
			color: 'rgba(255, 255, 255, 0.2)'
		}
		super(args, defaults)
		this.#value = 0
		this.#max = 100
	}

	get value() {
		return this?.value_link ? this.value_link.get() : this.#value
	}

	set value(val) {
		if (#value in this) {
			if (!this?.value_link && val) this.#value = val
		}
	}

	get max() {
		return this?.max_link ? this.max_link.get() : this.#max
	}

	set max(val) {
		if (#max in this) {
			if (!this?.max_link && val) this.#max = val
		}
	}

	draw() {
		if (!this.visible) return
		let func = () => {
			c.fillStyle = this.color
			let max_width = this.w - this.border_width*2
			let width = (max_width * this.value) / this.max
			c.fillRect(x + this.border_width, y + this.border_width, width, this.h - this.border_width*2)
		}
		super.draw(func)
	}
}

class GUILayer extends Box {
	constructor(args) {
		args = args || {}
		let defaults = {
			x: 0,
			y: 0,
			w: canvas.width,
			h: canvas.height,
			background_color: 'rgba(155, 155, 155, 0)',
			border_color: 'rgba(0, 0, 0, 0)',
			border_width: 0
		}
		super(args, defaults)
		delete this.parent
	}
}

class HealthRing {
	constructor(args) {
		args = args || {}
		this.defaults = {
			pos: new Vector(canvas.width/2, canvas.height/2),
			r: 64,
			value: 6,
			border_width: 4
		}
		assignClassArgs(this, args)
	}	
}

class ItemSlot extends Button {
	constructor(args) {
		let defaults = {
			item: null,
			visible: true,
			locked: false,
			empty_sprite: null,
			w: 32,
			h: 32,
			border_width: 0,
			background_color: 'rgba(0, 0, 0, 0.2)'
		}
		super(args, defaults)
	}

	clickEvent() {
		if (this.item && !locked) {
			if (this.item instanceof Weapon) plr.addWeapon(this.item)
			if (this.item instanceof Consumable) plr.addConsumable(this.item)
			this.item = null
		}
		super.clickEvent()
	}

	draw() {
		if (!this.visible) return
		super.draw()
		if (this.item) {
			this.item.sprite.draw(new Vector(this.x, this.y), this.w, this.h)
		} else {
			this.empty_sprite?.draw(new Vector(this.x, this.y), this.w, this.h)
		}
	}
}

class Inventory extends Box {
	constructor(args) {
		let defaults = {
			items: [],
			max_slots: 25,
			row_size: 5,
			slot_margin: 1,
			slot_size: 32,
			border_width: 2
		}
		super(args, defaults)
		this.row_count = Math.ceil(this.max_slots / this.row_size)

		this.contents = [];
		this.buildSlots()
		let mod = this.border_width*2 + this.padding*2
		this.w = mod + this.slot_size*this.row_size + this.slot_margin*2 * this.row_size
		this.h = mod + this.slot_size*this.row_count + this.slot_margin*2 * this.row_size
	}

	buildSlots() {
		let i = 0
		for (let c = 0; c < this.row_count; c++) {
			for (let r = 0; r < this.row_size; r++) {
				if (i >= this.max_slots) break;

				let x = this.x + r * this.slot_size + r * this.slot_margin*2
				let y = this.y + c * this.slot_size + c * this.slot_margin*2

				let item = this.items[i] || null
				args = {
					parent: this,
					item,
					w: this.slot_size,
					h: this.slot_size,
					relative_pos: new Vector(x, y),
					margin: this.slot_margin,
					press_anim_visible: false
				}

				this.contents.push(new ItemSlot(args))
				i++
			}
		}
	}

	controls() {
		let hov_item = null;
		let hov_index = null;
		this.items.forEach((item, i) => {
			if (mouse.checkBounds(item, true)) {
				hov_item = item.item
				hov_index = i
			}
		})
		if (!hov_item) return

		let slot = null;

		//Replace shield (U)
		if (keys[82]) {
			slot = plr.equipment.shield
		}

		//Primary Weapon (J)
		if (keys[74]) {
			slot = plr.equipment.weapons[0]
		}
		//Secondary Weapon (K)
		if (keys[75]) {
			slot = plr.equipment.weapons[1]
		}
		//Consumable Slot 1 (1)
		if (keys[49] && plr.equipment.max_consumables >= 1) {
			slot = plr.equipment.consumables[0]
		}
		//Consumable Slot 2 (2)
		if (keys[50] && plr.equipment.max_consumables >= 2) {
			slot = plr.equipment.consumables[1]
		}
		//Consumable Slot 3 (3)
		if (keys[51] && plr.equipment.max_consumables >= 3) {
			slot = plr.equipment.consumables[2]
		}
		//Consumable Slot 4 (4)
		if (keys[52] && plr.equipment.max_consumables >= 4) {
			slot = plr.equipment.consumables[3]
		}

		if (slot) {
			slot = hov_item;
			this.items.splice(hov_index, 1)
		}
	}

	update() {
		this.updateFunc?.()
		this.items.forEach((item) => {item.update()})
		this.controls()
	}
}


function showHp() {
	hide_hp = false;
	hp_show_tmr = HP_SHOW_TIME
}




