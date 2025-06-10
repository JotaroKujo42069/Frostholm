function intervalDistance(range_a, range_b) {
    if (range_a.min < range_b.min) {
        return range_b.min - range_a.max;
    } else {
        return range_a.min - range_b.max;
    }
}

function projectPolygon(axis, polygon, range) {
    // To project a point on an axis use the dot product
    let dotProduct = axis.getDotProduct(polygon.vertices[0]);
    range.min = dotProduct;
    range.max = dotProduct;
    for (let i = 0; i < polygon.vertices.length; i++) {
        dotProduct = polygon.vertices[i].getDotProduct(axis);
        if (dotProduct < range.min) {
            range.min = dotProduct;
        } else {
            if (dotProduct > range.max) {
					range.max = dotProduct;
            }
        }
    }
}

function zCheck(obj1, obj2) {
	return obj1.z_range.min <= obj2.z_range.max && obj1.z_range.max >= obj2.z_range.min
}

function pushAxes(axes, obj) {
	let len = obj.vertices.length
	for (let i = 0; i < len; i++) {
		let axis
		if (i === len - 1) {
			axis = new Vector((obj.vertices[i].y - obj.vertices[0].y), -(obj.vertices[i].x - obj.vertices[0].x))
		} else {
			axis = new Vector((obj.vertices[i].y - obj.vertices[i + 1].y), -(obj.vertices[i].x - obj.vertices[i + 1].x))
		}
		axis = axis.getUnitVec()
		if (axes.find((a) => {
		return (a.x === axis.x && a.y === axis.y)
			|| (-a.x === axis.x && -a.y === axis.y)
		}) === undefined) {
			axes.push(axis)
		}
	}
}

function checkSAT(obj1, obj2) {
	let output = {
		intersect: true,
		will_intersect: true,
		obj1,
		obj2,
		min_translation_vec: new Vector(),
		axis: null
	};

	let axes = [];
	pushAxes(axes, obj1)
	pushAxes(axes, obj2)
	let translation_axis = new Vector()
	let min = Number.POSITIVE_INFINITY
	for (let i = 0; i < axes.length; i++) {
		let axis = axes[i]
		let obj1_calcs = {min: 0, max: 0}
		let obj2_calcs = {min: 0, max: 0}

		projectPolygon(axis, obj1, obj1_calcs);
		projectPolygon(axis, obj2, obj2_calcs);

		if (intervalDistance(obj1_calcs, obj2_calcs) > 0) output.intersect = false;
		//Will it collide?
		if (!obj1.velocity) console.log(obj1)
		let velocityProjection = axis.getDotProduct(obj1.velocity);
		if (velocityProjection < 0) {
      	obj1_calcs.min += velocityProjection;
		} else {
      	obj1_calcs.max += velocityProjection;
    	}

		let dist = intervalDistance(obj1_calcs, obj2_calcs);
      if (dist > 0) output.will_intersect = false;

		if (!output.intersect && !output.will_intersect) break;

		dist = Math.abs(dist);
      if (dist < min) {
			min = dist;
      	translation_axis = axis;

			let d = obj1.center.sub(obj2.center)
			if (d.getDotProduct(translation_axis) < 0) translation_axis = translation_axis.invert();
		}
	}
	if (output.will_intersect) {
		output.min_translation_vec = translation_axis.mult(min);
		output.axis = translation_axis
	}
	return output
}


function collision(ent, obj) {
	let r = checkSAT(ent, obj);
	let is_one_sensor = ent.is_sensor || obj.is_sensor
	if (r.will_intersect && zCheck(ent, obj) && !(obj instanceof Entity) && !is_one_sensor) {
  		if (ent.translation_range.x.min > r.min_translation_vec.x) ent.translation_range.x.min = r.min_translation_vec.x
  		if (ent.translation_range.x.max < r.min_translation_vec.x) ent.translation_range.x.max = r.min_translation_vec.x
  		if (ent.translation_range.y.min > r.min_translation_vec.y) ent.translation_range.y.min = r.min_translation_vec.y
  		if (ent.translation_range.y.max < r.min_translation_vec.y) ent.translation_range.y.max = r.min_translation_vec.y
	}

	return r
}

function enforceCol(ent) {
	let should_push = !(ent.translation_vec.x === 0 && ent.translation_vec.y === 0)
	if (should_push) {
		if (ent.translation_range.x.max === Number.NEGATIVE_INFINITY) ent.translation_range.x.max = 0
		if (ent.translation_range.y.max === Number.NEGATIVE_INFINITY) ent.translation_range.y.max = 0
		if (ent.translation_range.x.min === Number.POSITIVE_INFINITY) ent.translation_range.x.min = 0
		if (ent.translation_range.y.min === Number.POSITIVE_INFINITY) ent.translation_range.y.min = 0
		let x_not_zero = ent.translation_range.x.min !== 0 && ent.translation_range.x.max !== 0
		let y_not_zero = ent.translation_range.y.min !== 0 && ent.translation_range.y.max !== 0
		if (x_not_zero && Math.sign(ent.translation_range.x.min) !== Math.sign(ent.translation_range.x.max)) console.log('x:',ent.translation_range.x)
		if (y_not_zero && Math.sign(ent.translation_range.y.min) !== Math.sign(ent.translation_range.y.max)) console.log('y:',ent.translation_range.y)

		let x = Math.abs(ent.translation_range.x.min) > Math.abs(ent.translation_range.x.max) ? ent.translation_range.x.min : ent.translation_range.x.max
		let y = Math.abs(ent.translation_range.y.min) > Math.abs(ent.translation_range.y.max) ? ent.translation_range.y.min : ent.translation_range.y.max

		ent.translation_vec.x += x;
		ent.translation_vec.y += y;
	}
}

