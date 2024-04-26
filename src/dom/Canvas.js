import Vector2 from '../util/Vector2.js';

/**
 * @typedef {import('../util/Vector2.js').Vector2} Vector2
 * @typedef {function(Vector2): void} CanvasResizeCallback
 */

/**
 * @class
 */
class Canvas {

    /**
     * @private
     * @type {HTMLCanvasElement}
     */
    _element = null;

    /**
     * @private
     * @type {CanvasRenderingContext2D}
     */
    _ctx = null;

    /**
     * @private
     * @type {boolean}
     */
    _autoResize = true;

    /**
     * @private
     * @type {CanvasResizeCallback}
     */
    _onresize = null;

    /**
     * @param {HTMLCanvasElement|string} element 
     * @param {boolean} autoResize
     */
    constructor(element, autoResize=true) {
        if (element instanceof HTMLCanvasElement) this._element = element;
        else if (typeof element === 'string') {
            this._element = document.querySelector(element);
            if (!this._element) this._element = document.getElementById(element);
        }
        if (!this._element) throw new TypeError(`'element' must be a HTMLCanvasElement or a valid CSS query string.\nProvided: ${typeof element === 'object' ? JSON.stringify(element, null, 4) : element.toString()}`);
        this._ctx = this._element.getContext('2d');

        this._autoResize = autoResize;
        if (this._autoResize) {
            this._resize();
            window.addEventListener('resize', this._resize.bind(this));
        }
    }

    /**
     * @type {HTMLCanvasElement}
     */
    get element() { return this._element; }

    /**
     * @type {CanvasRenderingContext2D}
     */
    get ctx() { return this._ctx; }

    /**
     * @type {number}
     */
    get width() { return this._element.width; }

    /**
     * @type {number}
     */
    get height() { return this._element.height; }

    /**
     * @param {number} w
     */
    set width(w) { this._element.width = w; }

    /**
     * @param {number} h
     */
    set height(h) { this._element.height = h; }

    /**
     * @type {Vector2}
     */
    get size() { return Vector2(this._element.width, this._element.height); }

    /**
     * @type {boolean}
     */
    get autoResize() { return this._autoResize; }

    /**
     * @param {boolean} ar
     */
    set autoResize(ar) {
        if (ar !== autoResize) {
            if (ar) window.addEventListener('resize', this._resize.bind(this));
            else window.removeEventListener('resize', this._resize.bind(this));
            this._autoResize = ar;
        }
    }

    /**
     * @type {CanvasResizeCallback}
     */
    get onresize() { return this._onresize; }
    
    /**
     * @param {CanvasResizeCallback} or
     */
    set onresize(or) {
        this._onresize = or;
    }

    /**
     * @param {Vector2} size 
     * @returns {void}
     */
    resize(size) {
        this._element.width = size.x;
        this._element.height = size.y;
        if (this._onresize) this._onresize(this.size);
    }

    /**
     * @private
     * @returns {void}
     */
    _resize() {
        this.resize(Vector2(window.innerWidth, window.innerHeight));
    }

}

export default Canvas;