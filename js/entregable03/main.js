document.addEventListener("DOMContentLoaded", () => {

    "use strict";

    const MAX_3DCARD_DEGREES = 20;

    const CARRUSEL_IMAGES = [
        "../img/entregable03/carrusel/carr_01.jpg",
        "../img/entregable03/carrusel/carr_02.jpg",
        "../img/entregable03/carrusel/carr_03.jpg",
        "../img/entregable03/carrusel/carr_04.jpg",
        "../img/entregable03/carrusel/carr_05.jpg"
    ];
    const CARRUSEL_AUTOMATIC_TIME = 1800;

    let hero_parallax_change_values = [
        // { layerID: 0, esPorcentual: true, property: "translateY", ratio: 0 },
        { layerID: 1, property: "scale", ratio: 1.5 },
        { layerID: 2, esPorcentual: true, property: "translateY", ratio: -0.65 },
        { layerID: 3, esPorcentual: true, property: "translateY", ratio: -0.37 },
        { layerID: 4, property: "scale", ratio: -0.6 }
        // { layerID: 5, esPorcentual: true, property: "translateY", ratio: 0 }
    ];

    let cards3D = [];

    let elem_carrusel = document.querySelector("#carrusel");
    let carrusel = new Carrusel(elem_carrusel, CARRUSEL_IMAGES);
    let carruselIntervalID;
    let carruselTimeoutID = null;

    let hero_parallax = document.querySelector("#hero_parallax_principal");
    let parallax_layers = document.querySelectorAll(".parallax_layer");
    // parallax_layers[parallax_layers.length-1].addEventListener("load",()=>{
    //     showLoading(0);
    // });

    let hero_parallax_controller = new HeroParallax(parallax_layers, hero_parallax_change_values);

    let position_helper = document.querySelector("#position_helper");
    let is_parallax_fixed = true;
    let min_position_parallax;
    let max_position_parallax;
    let image_size = 0;

    let scroll = window.requestAnimationFrame;

    //Reajusta el div al tamaño de las imágenes
    function ajustarHeightParallax() {
        image_size = parallax_layers[0].clientHeight;
        min_position_parallax = image_size;
        max_position_parallax = image_size * 4;
        document.querySelector("#limit_parallax_helper").style.margin = max_position_parallax + "px 0 0 0";

        //Vuelve a revisar el image_size en caso de que la barra de scroll le haya robado espacio.
        image_size = parallax_layers[0].clientHeight;
        hero_parallax.style.height = image_size + "px";
        ajustarScroll();
    }

    function ajustarScroll() {

        let rect = position_helper.getBoundingClientRect();

        if (is_parallax_fixed && rect.top < image_size) {

            hero_parallax.classList.add("js-parallax_absolute");
            hero_parallax.classList.remove("js-parallax_fixed");
            hero_parallax.style.top = max_position_parallax - image_size + "px";
            is_parallax_fixed = false;

        } else if (!is_parallax_fixed && rect.top > image_size + 1) {

            hero_parallax.classList.remove("js-parallax_absolute");
            hero_parallax.classList.add("js-parallax_fixed");
            hero_parallax.style.top = 0;
            is_parallax_fixed = true;

        }

        let pos_ratio = rect.top / max_position_parallax;
        pos_ratio = 1 - pos_ratio;

        if (is_parallax_fixed) changeParallaxValues(pos_ratio);

        scroll(ajustarScroll);
    }

    function changeParallaxValues(pos_ratio) {
        hero_parallax_controller.changeParallaxValues(pos_ratio);
    }

    function showLoading(miliseconds = 3000) {

        let load_screen = document.querySelector("#pantalla_carga");
        load_screen.classList.remove("js-hide");
        document.body.classList.add("js-no_scroll");

        setTimeout(() => {

            load_screen.classList.add("js-hide");
            document.body.classList.remove("js-no_scroll");

        }, miliseconds);

    }

    let card_containers = document.querySelectorAll(".js-card_container");
    card_containers.forEach(cc => {

        let card3D = new Card3D(MAX_3DCARD_DEGREES, cc.querySelector(".js-card3D"), cc);
        cc.addEventListener("mouseover", (event) => {

            let card = buscar3DCard(event.target);
            if (card) card.setMoving(true);
            cc.addEventListener("mousemove", updateCard, false);

        });
        cc.addEventListener("mouseout", (event) => {

            cc.removeEventListener("mousemove", updateCard, false);
            let card = buscar3DCard(event.target);
            if (card) {
                card.setMoving(false);
                card.animateResetCard();
            }

        });
        cards3D.push(card3D);

    });
    function buscar3DCard(elem_card) {

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
        if (card) card.updateCard(mouseEvent.layerX, mouseEvent.layerY)

    }

    /* Carrousel */


    carruselIntervalID = setInterval(changeImageCarrusel, CARRUSEL_AUTOMATIC_TIME);

    function stopIntervalCarrousel(miliseconds = 500) {
        clearInterval(carruselIntervalID);
        carruselIntervalID = null;
        if (carruselTimeoutID) clearTimeout(carruselTimeoutID);
        carruselTimeoutID = setTimeout(() => {
            carruselTimeoutID = null;
            carruselIntervalID = setInterval(changeImageCarrusel, CARRUSEL_AUTOMATIC_TIME)
        }, miliseconds);
    }
    function changeImageCarrusel(next = true) {

        if (next) carrusel.display(1);
        else carrusel.display(-1);
    }

    let carrusel_buttons = elem_carrusel.querySelectorAll(".js-carrusel_button");
    carrusel_buttons[0].addEventListener("click", () => {
        changeImageCarrusel(false);

        stopIntervalCarrousel();
    });
    carrusel_buttons[1].addEventListener("click", () => {
        changeImageCarrusel(true);

        stopIntervalCarrousel();
    });

    /* Fin carrousel */

    /* Actualizar reloj */

    function actualizarReloj() {
        let reloj = document.querySelector(".countdown").querySelector("p");
        let horario_actual = new Date();
        let horario_limite = new Date(2021, 9, 22, 27, 50, 0);
        let horario_restante = new Date(horario_limite.getTime() - horario_actual.getTime());

        let dias = horario_restante.getDate();
        let mes = horario_restante.getMonth();
        for (mes; mes >= 0; mes--) {
            dias += getCantDiasEnMes(mes);
        }
        dias += getCantDiasEnAnio(1, 0);
        let horas = horario_restante.getHours();
        let minutos = horario_restante.getMinutes();
        let segundos = horario_restante.getSeconds();

        let text = "Tiempo restante para la secuela: " + dias + " Días, " + horas + " Horas, " + minutos + " Minutos y " + segundos + " Segundos.";
        reloj.innerHTML = text;

    }
    function getCantDiasEnMes(mes = 0, bisiesto = false) {
        let dias = 0;
        switch (mes) {
            case 0, 2, 4, 6, 7, 9, 11:
                dias = 31;
                break;
            case 1:
                if (bisiesto) dias = 29;
                else dias = 28;
                break;
            case 3, 5, 8, 10:
                dias = 30;
                break;
        }
        return dias;
    }
    function getCantDiasEnAnio(cant_anios = 1, cant_bisiestos = 0) {
        let dias = 365 * cant_anios;
        dias += cant_bisiestos;
        return dias;
    }
    /* Fin actualizar reloj */

    // actualizarReloj();
    setInterval(actualizarReloj, 1000);

    showLoading(3000);

    window.addEventListener("resize", ajustarHeightParallax);

    ajustarHeightParallax();
});