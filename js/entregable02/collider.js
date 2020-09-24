class Collider {
    x;
    y;
    width;
    height;

    constructor(x = 0, y = 0, width = 0, height = 0) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    //Devuelve 'true' solo si el cuadrado completo está dentro de la ficha.
    isTokenInsideCollider(ficha) {
        let x = this.x; let y = this.y;
        return ficha.isPointInsideToken(x, y) && ficha.isPointInsideToken(x + this.width, y + this.height);
    }

}