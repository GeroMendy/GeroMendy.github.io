document.addEventListener("DOMContentLoaded",()=>{

    "use strict";

    const MAX_3DCARD_DEGREES = 20;
    
    let cards3D = [];
    let card_containers = document.querySelectorAll(".js-sinopsis_card_container");
    card_containers.forEach(cc => {

        let card3D = new Card3D(MAX_3DCARD_DEGREES, cc.querySelector(".js-card3D"), cc);
        cc.addEventListener("mouseover", (event) => {

            let card = buscar3DCard(event.target);
            if(card) card.setMoving(true);
            cc.addEventListener("mousemove", updateCard, false);

        });
        cc.addEventListener("mouseout", (event) => {

            cc.removeEventListener("mousemove", updateCard, false);
            let card = buscar3DCard(event.target);
            if(card) {
                card.setMoving(false);
                card.animateResetCard();
            }

        });
        cards3D.push(card3D);

    });
    function buscar3DCard(elem_card){

        let card = false;
        let i = 0;
        while (i < cards3D.length && !card) {
            let current_card = cards3D[i];
            if (current_card && current_card.isThisCard(elem_card)) card = current_card;
            i++;
        }
        return card;

    }

    function updateCard(mouseEvent) {
        let card = buscar3DCard(mouseEvent.target);
        if(card)card.updateCard(mouseEvent.layerX,mouseEvent.layerY)
    }
    

});