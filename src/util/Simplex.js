class Simplex {

    constructor() {
        this.perm = [...Array(512)].map((_, i) => i);
        for (let i = 0; i < 512; i++) {
            const r = i + Math.floor(Math.random() * (512 - i));
            const tmp = this.perm[i];
            this.perm[i] = this.perm[r];
            this.perm[r] = tmp;
        }

        this.perm = this.perm.concat(this.perm);
    }

    grad3 = [
        [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
        [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
        [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]
    ];

    fastFloor(x) {
        return x > 0 ? Math.floor(x) : Math.floor(x) - 1;
    }

    dot(g, x, y) {
        return g[0] * x + g[1] * y;
    }

    noise(xin, yin) {
        const F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
        const s = (xin + yin) * F2;
        const i = this.fastFloor(xin + s);
        const j = this.fastFloor(yin + s);
        const G2 = (3.0 - Math.sqrt(3.0)) / 6.0;
        const t = (i + j) * G2;
        const X0 = i - t;
        const Y0 = j - t;
        const x0 = xin - X0;
        const y0 = yin - Y0;
        let i1, j1;

        if (x0 > y0) {
            i1 = 1;
            j1 = 0;
        } else {
            i1 = 0;
            j1 = 1;
        }

        const x1 = x0 - i1 + G2;
        const y1 = y0 - j1 + G2;
        const x2 = x0 - 1.0 + 2.0 * G2;
        const y2 = y0 - 1.0 + 2.0 * G2;

        const ii = i & 255;
        const jj = j & 255;
        const gi0 = this.perm[ii + this.perm[jj]] % 12;
        const gi1 = this.perm[ii + i1 + this.perm[jj + j1]] % 12;
        const gi2 = this.perm[ii + 1 + this.perm[jj + 1]] % 12;

        let t0 = 0.5 - x0 * x0 - y0 * y0;
        if (t0 < 0) t0 = 0.0;
        t0 *= t0;
        const n0 = t0 * t0 * this.dot(this.grad3[gi0], x0, y0);

        let t1 = 0.5 - x1 * x1 - y1 * y1;
        if (t1 < 0) t1 = 0.0;
        t1 *= t1;
        const n1 = t1 * t1 * this.dot(this.grad3[gi1], x1, y1);

        let t2 = 0.5 - x2 * x2 - y2 * y2;
        if (t2 < 0) t2 = 0.0;
        t2 *= t2;
        const n2 = t2 * t2 * this.dot(this.grad3[gi2], x2, y2);

        return 70.0 * (n0 + n1 + n2);
    }

    static Octave(simplex, x, y, octaves, amplitude=1, frequency=1, persistence=0.5, lacunarity=2) {
        let result = 0;
        let min = 0;
        let max = 1;
        for (let i = 0; i < octaves; i++) {
            const s = amplitude * simplex.noise(x * frequency, y * frequency) * 0.5 + 0.5;
            result += s;

            min = Math.min(min, s);
            max = Math.max(max, s);

            amplitude *= persistence;
            frequency *= lacunarity;
        }

        return ((result - (min * octaves)) / ((max * octaves) - (min * octaves))) * 2 - 1;
    }

    static Interpolate(a, b, t) { return a + (6 * t ** 5 - 15 * t ** 4 + 10 * t ** 3) * (b - a); }

    static InterpolatedOctave(simplex, x, y, octaves=1, amplitude=1, frequency=1, persistence=0.5, lacunarity=2) {
        const floorX = Math.floor(x), floorY = Math.floor(y);
        const tX = x - floorX, tY = y - floorY;

        const v00 = Simplex.Octave(simplex, floorX, floorY, octaves, amplitude, frequency, persistence, lacunarity);
        const v01 = Simplex.Octave(simplex, floorX, floorY+1, octaves, amplitude, frequency, persistence, lacunarity);
        const v10 = Simplex.Octave(simplex, floorX+1, floorY, octaves, amplitude, frequency, persistence, lacunarity);
        const v11 = Simplex.Octave(simplex, floorX+1, floorY+1, octaves, amplitude, frequency, persistence, lacunarity);

        const i1 = Simplex.Interpolate(v00, v10, tX);
        const i2 = Simplex.Interpolate(v01, v11, tX);

        return Simplex.Interpolate(i1, i2, tY);
    }

}

export default Simplex;