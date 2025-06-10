class Level {
	constructor(args) {
		args = args || {}
		this.defaults = {
			contents: [],
			GUIs: [],
			lights: [],
			background_color: new Color(200, 200, 220, 1.0),
			ambient_light: null,
			playable: true
		}
		assignClassArgs(this, args)
		this.id = level_id.next()

		this.entities = []
		this.contents.forEach((item) => {
			if (item instanceof Entity) {this.entities.push(item)}
		})
	}

	add(obj) {
		this.contents.push(obj)
		if (obj instanceof Entity) {
			this.entities.push(obj)
		}
		if (obj instanceof Projectile) {
			console.log()
		}
		obj.sprite.load()
	}

	addGUI(obj) {
		if (obj instanceof Box) {
			this.GUIs.push(obj)
			obj?.init()
		}
	}

	addLight(light) {
		if (!(light instanceof Light)) return
		this.lights.push(light)
	}

	loadGUIs() {
		this.GUIs.forEach((item) => {
			item?.init()
		})
	}

	loadContents() {
		this.contents.forEach((item) => {
			item?.sprite.load()
		})
	}

	load() {
		this.loadContents()
		this.loadGUIs()
	}

	enter() {
		current_lvl = this;
		this.load()
	}

	generateLightMap() {
		lm.clearRect(0, 0, lm_canvas.width, lm_canvas.height)
		if (this.ambient_light) {
			this.ambient_light.fill(lm)
			lm.fillRect(0, 0, lm_canvas.width, lm_canvas.height)
			lm.globalCompositeOperation = 'destination-out'
			this.lights.forEach((light) => {
				if (light.visible) light.draw(lm)
			})
		}
		lm.globalCompositeOperation = 'source-over'
		this.lights.forEach((light) => {
			if (light.visible) light.draw(lm)
		})
	}

	update() {
		this.contents = this.contents.removeDead()
		this.entities = this.entities.removeDead()
		this.contents.forEach((item) => {
			item.update()
		})
	}

	draw() {
		let grad = c.createLinearGradient(0, 0, 0, canvas.height)
		let top_color = new Color()
		Object.assign(top_color, this.background_color)
		top_color.adjustBrightness(20)
		top_color.colorStop(0, grad)
		this.background_color.colorStop(1, grad)

		c.fillStyle = grad
		c.fillRect(0, 0, canvas.width, canvas.height)

		this.contents.sort((a, b) => {
			return a.z - b.z
		})
		this.contents.forEach((item) => {
			item.draw()
		})
	
		this.generateLightMap()
		drawLightMap()
	}
}

function clearContentArrays() {
	contents = []
	GUIs = []
	lights = []
}
