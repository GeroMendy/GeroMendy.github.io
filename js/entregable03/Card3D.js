class Card3D {
    max_degrees;
    card;
    card_container;
    constructor(max_degrees = 90, card, card_container) {

        this.max_degrees = max_degrees;
        this.card = card;
        this.card_container = card_container;
    }
    isThisCard(card) {
        return this.card == card;
    }
    resetCard() {
        this.card.style.transform = "";
    }

    updateCard(mouse_x, mouse_y) {

        let centro = {
            x: this.card.clientWidth / 2,
            y: this.card.clientHeight / 2
        }

        let new_ratios = {
            y: ((mouse_y - centro.y) / centro.y),
            x: ((mouse_x - centro.x) / centro.x)
        }
        let distancia_al_centro = Math.sqrt(Math.pow(new_ratios.y, 2) + Math.pow(new_ratios.x, 2));

        let new_degrees = this.max_degrees * distancia_al_centro;

        this.card.style.transform = "rotate3d(" + -new_ratios.y + "," + new_ratios.x + "," + 0 + "," + new_degrees + "deg)";

    }

}