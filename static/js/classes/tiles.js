class Climbable extends Body{
	constructor(args) {
		let defaults = {
			isSensor: true
		}
		super(args, defaults)
	}

	colEvent(obj) {
		let body = {
			vertices: [
				new Vector(obj.vertices[0].x + 1, obj.vertices[0].y + 1),
				new Vector(obj.vertices[1].x - 1, obj.vertices[1].y + 1),
				new Vector(obj.vertices[2].x - 1, obj.center.y - 1),
				new Vector(obj.vertices[3].x + 1, obj.center.y - 1)
			]
		}
		if (obj.id === plr.id && checkSAT(this, body)) {
			obj.climbing = true
		}
		super.colEvent(obj)
	}
}
