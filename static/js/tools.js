class Id {
    constructor() {
        this.index = 0;
    }
    next() {
        let output = this.index;
        this.index++
        return output
    }
}

class Link {
    constructor(obj, prop) {
        this.obj = obj;
        this.prop = prop
    }

    get() {return eval(`this.obj.${this.prop}`)}
}

class Vector {
    #magnitude = 0;
    constructor(x, y) {
        if (isGarbage(x)) x = null
        if (isGarbage(y)) y = null
        this.x = x
        this.y = y
    }

    get magnitude() {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    }

    equals(vec) {
        if (isGarbage(vec)) return null
        return this.x === vec.x && this.y === vec.y
    }

    add(vec) {
        if (isGarbage(vec)) return null

        let output = new Vector()
        output.x = this.x + vec.x
        output.y = this.y + vec.y
        return output
    }

    sub(vec) {
        if (isGarbage(vec)) return null

        let output = new Vector()
        output.x = this.x - vec.x
        output.y = this.y - vec.y
        return output
    }

    mult(val) {
        if (isGarbage(val)) return null

        let output = new Vector()
        let x = val
        let y = val
        if (val instanceof Vector) {
            x = val.x
            y = val.y
        }
        
        output.x = this.x * x
        output.y = this.y * y
        return output
    }

    invert() {
        return new Vector(-this.x, -this.y)
    }

    getUnitVec() {
        return this.getDivision(this.magnitude)
    }

    getDotProduct(vec) {
        if (!vec?.x && vec?.x !== 0) {
            console.log()
        }
        return this.x * vec.x + this.y * vec.y;
    }

    getScalarMult(num) {
        let x = this.x * num;
        let y = this.y * num;
        return new Vector(x, y)
    }

    getDivision(num) {
        let x = this.x / num
        let y = this.y / num
        return new Vector(x, y)
    }

    getProjection(vec) {
        return this.getScalarMult(vec.getDotProduct(this) / Math.pow(this.magnitude, 2))
    }

    map(func) {
        return [this.x, this.y].map(func)
    }

    draw(color, r) {
        if (r === undefined) r = 1
        c.fillStyle = color
        c.beginPath()
        c.arc(this.x, this.y, r, 0, Math.PI * 2)
        c.closePath()
        c.fill()
    }
}

function assignClassArgs(obj, args) {
    for (let prop in obj.defaults) {
        if (obj instanceof Body && prop == 'x') {
            console.log()
        }
        if(Object.hasOwn(args, prop)) {
            eval(`obj.${prop} = args.${prop}`)
        } else {
            eval(`obj.${prop} = obj.defaults.${prop}`)
        }
        console.log()
    }
    args = {}
}

function distance(vec1, vec2) {
    return Math.sqrt(Math.pow(vec2.x - vec1.x, 2) + Math.pow(vec2.y - vec1.y,2))
}

function getAngle(vec1, vec2) {
    let output = null
    if (!isGarbage(vec1) && !isGarbage(vec2)) {
        output = Math.atan2(vec2.y - vec1.y, vec2.x - vec1.x) * 180 / Math.PI;
    }
    return output
}

function calcCenter(obj, pos) {
    let x, y
    if (pos) {
        x = pos.x
        y = pos.y
    } else if (obj?.vertices) {
        x = obj.vertices[0].x;
        y = obj.vertices[0].y;
    } else {
        x = obj.x
        y = obj.y
    }
    return new Vector(x + obj.w/2, y + obj.h/2);
}

function calcVerts(vec, w, h) {
    return [
        new Vector(vec.x, vec.y),
        new Vector(vec.x + w, vec.y),
        new Vector(vec.x + w, vec.y + h),
        new Vector(vec.x, vec.y + h)
    ]
}

//Angle must be in radians
function getVecOnCircle(circle, angle, dist_mod, invert) {
    let sign = invert ? -1 : 1;
    let x = circle.x + circle.r * Math.cos(angle) * dist_mod * sign
    let y = circle.y + circle.r * Math.sin(angle) * dist_mod * sign
    return new Vector(x, y)
}


//args(vec1, vec2, radius)
const findC = (...args) => {
    const hDist = (p1, p2) => Math.hypot(...p1.map((e, i) => e - p2[i])) / 2;
    const pAng = (p1, p2) => Math.atan(p1.map((e, i) => e - p2[i]).reduce((p, c) => c / p, 1));
    const solveF = (p, r) => t => [r*Math.cos(t) + p[0], r*Math.sin(t) + p[1]];
    const diamPoints = (p1, p2) => p1.map((e, i) => e + (p2[i] - e) / 2);
    const [vec1, vec2, s] = args;
    p1 = [vec1.x, vec1.y]
    p2 = [vec2.x, vec2.y]
    const solve = solveF(p1, s);
    const halfDist = hDist(p1, p2);

    let output = null;
    switch (Math.sign(s - halfDist)) {
    case 0:
        output = s ? diamPoints(p1, p2) : null;
        console.log('asd')
        break;
    case 1:
        if (halfDist) {
            let theta = pAng(p1, p2);
            let theta2 = Math.acos(halfDist / s);
            output = [1, -1].map(e => solve(theta + e * theta2))
        }
        break;
  }
  return output;
};  

function findCircle(vec1, vec2, radius) {
    let x1 = vec1.x
    let y1 = vec1.y
    let x2 = vec2.x
    let y2 = vec2.y

    let output = {x: 0, y: 0}
    let radsq = radius * radius;
    let q = Math.sqrt(((x2 - x1) * (x2 - x1)) + ((y2 - y1) * (y2 - y1)));
    let x3 = (x1 + x2) / 2;
    output.x = x3 + Math.sqrt(radsq - ((q / 2) * (q / 2))) * ((y1 - y2) / q);

    radsq = radius * radius;
    q = Math.sqrt(((x2 - x1) * (x2 - x1)) + ((y2 - y1) * (y2 - y1)));
    let y3 = (y1 + y2) / 2;
    output.y = y3 + Math.sqrt(radsq - ((q / 2) * (q / 2))) * ((x2-x1) / q);
    return [[output.x, output.y]]
}


function isGarbage(data) {
    let output = false
    if (data instanceof Vector) {
        if (isGarbage(data.x) || isGarbage(data.y)) {
            output = true
        }
    } else {
        if (data === undefined || data === null) {
            output = true
        }
    }
    return output
}

function randomRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

Object.defineProperty(Array.prototype, 'removeById', {
    value: function(id) {
        let remove_i = null
        this.forEach((item, i) => {
            if (item.id === id) remove_i = i
        })
        if (remove_i) this.splice(remove_i, 1)
    }
});

Object.defineProperty(Array.prototype, 'removeDead', {
    value: function(id) {return this.filter((item) => {
        let output = true
        if (item instanceof Entity && !item.alive) output = false
        return output
    })}
});

Object.defineProperty(Array.prototype, 'findByNameId', {
    value: function(id) {
        let found_i = null
        this.forEach((item, i) => {
            if (item.name_id === id) found_i = i
        })
        return found_i || found_i === 0 ? this[found_i] : null
    }
});