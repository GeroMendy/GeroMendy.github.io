document.addEventListener("DOMContentLoaded", () => {

    let div_comentarios = document.querySelector(".js-comentarios");
    let boton_enviar = document.querySelector("#js-enviar_comentario");
    let progress_bar = boton_enviar.querySelector("#js-enviar_comentario_progress_bar");

    const CSS_LOADING_CLASS_NAME = "js-boton_simular_carga";
    const TIEMPO_CARGA_BOTON = 2500;

    progress_bar.style.animationDuration = TIEMPO_CARGA_BOTON/1000 + "s";

    function crearComentario(titulo, texto) {

        let new_comentario = "<div class='comentario_individual'><p class='com_titulo'>" + titulo + "</p>";
        new_comentario += "<p>" + texto + "</p>";

        div_comentarios.innerHTML += new_comentario;
    }
    boton_enviar.addEventListener("click", (ev) => {
        ev.preventDefault();

        let inputs = document.querySelectorAll(".js-comentario_input");
        if (inputs[0].value != '' && inputs[1].value != '') {
            mostrar_carga(progress_bar);
            setTimeout(() => {
                crearComentario(inputs[0].value, inputs[1].value);
                clearInputs(inputs);
            }, TIEMPO_CARGA_BOTON);
        }
    });
    function clearInputs(inputs = []) {
        inputs.forEach(input => {
            input.value = '';
        });
    }

    function mostrar_carga(elem) {
        if (!elem.classList.contains(CSS_LOADING_CLASS_NAME)) {
            elem.classList.add(CSS_LOADING_CLASS_NAME);
            setTimeout(() => {
                elem.classList.remove(CSS_LOADING_CLASS_NAME)
            }, TIEMPO_CARGA_BOTON);
        }
    }












    // Comentarios Hardcodeados.
    crearComentario("Great Mix Of Action And Comedy", "Quentin Tarantino, one of the most iconic directors of the 21st (and late 20th) century, why? Simple. Because of masterpieces like this. Tarantino defies the laws of film, he shoots them in his own way, however he wants. Tarantino has always focused upon the action thriller genre from Reservoir Dogs up until Inglourious Basterds. However, Django Unchained is Tarantino's first look at the Western genre, his first attempt at it and he executed it beautifully. The scenes were shot perfectly alongside an amazing soundtrack as well as his own small cameo. Django Unchained tells the story of Django (Jamie Foxx), a slave who is soon picked up by bounty hunter Dr King Shultz (Christoph Waltz). The story follows on as Shultz takes on Django as his 'deputy' during their tasks of bounty hunting, in return Shultz says that after winter he will help find Django's lost wife, Broomhilda. This takes them to a huge plantation in Mississippi owned by Calvin Candie (Leonardo DiCaprio), from here they plan up a scheme on how to get away with Broombilda. The cast boast out amazing performances, particularly Christoph Waltz (also famous for his previous collaboration with Tarantino on Inglourious Bastards as Colonel Landa). Both Foxx and DiCaprio's performance are both equally amazing. All three are able to add some light-hearted humour in the mix to make sure it doesn't stay too serious, as well as having comic actor Jonah Hill play a member of the KKK.There's a reason the film has been nominated for 5 Oscars.");
    crearComentario("The Perfect Movie", "For anyone who isn't much into cinema, I would recommend watching Django Unchained and you will fall in love with films forever. This film is a classic western full of drama, suspense and tension with a tremendously unpredictable plot but with a sense of realism taken into consideration. I believe it would be hard to dislike this masterpiece as it has it all: action, adventure and even a sense of romance and the occasional humour.");
    crearComentario("Loved it! It's a hit.", "Absolutely loved every minute of this movie. Usually I'm not too crazy about Tarantino's movies, but this one is definitely the best one I've seen in a long time. The actors were picked perfectly. The overall experience of a movie is amazing. When we first went to watch it, I was a bit skeptical and thought I'd end up leaving an hour into the movie (it's a 3 hr movie), but it grabbed my attention from the very beginning and I didn't even wanna get up to go to the bathroom, afraid to miss something. I'm usually very particular about the movies, nothing can hardly satisfy me, but this one is definitely in the top 5. Soundtrack was perfect. When I got home, I've done some more research on it and loved it even more! Overall, I would highly recommend this film!");
    crearComentario("One of the best movies this year","At first I didn't want to see this movie because of some political remarks made by Jamie Foxx and Samuel Jackson, two of my previously favorite actors, but Quintin Tarentino is a great director, so I broke down and saw it. Glad I did. This was absolutely one of the best movies of the year. Although Jamie Foxx has top billing, this film would not have been anywhere as good without Christoph Waltz. He stole every scene he was in. Brilliant acting and great comedic delivery. Leo was great too. Lots of blood, something expected in most of Quintins movies, but a great story. Also expect to hear the N word about 2000 times. Cristoph Waltz should get the Oscar for his performance. Should get nominated for best picture. This is absolutely a must see.");

});