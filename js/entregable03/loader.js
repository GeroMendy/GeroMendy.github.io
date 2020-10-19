document.addEventListener("DOMContentLoaded", () => {

    function showLoading(miliseconds = 3000) {

        let load_screen = document.querySelector("#pantalla_carga");
        load_screen.classList.remove("js-hide");
        document.body.classList.add("js-no_scroll");

        setTimeout(() => {

            load_screen.classList.add("js-hide");
            document.body.classList.remove("js-no_scroll");

        }, miliseconds);

    }

    showLoading();
});