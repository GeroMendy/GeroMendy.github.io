class Figura {

    puntos = [];

    constructor(puntos = []) {
        puntos.forEach(punto => {

            this.puntos.push({
                x: punto[0], y: punto[1]
            });
        });

    }
    getPuntos() {
        return this.puntos;
    }
    getPuntoIndividual(index = 0) {
        if (this.puntos[index]) return this.puntos[index];
    }
}