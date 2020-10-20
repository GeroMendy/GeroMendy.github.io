let element = document.querySelector(".js-animated_element_on_entry");
let css_animated_in_class = "js-entry_animation_element";
let css_animated_out_class = "js-out_animation_element";
let css_hidden_class = "js-entry_hidden_element";
const ANIMATION_DURATION = 1200;
let is_showing = false;
let timeout_id = null;

element.style.animationDuration = (ANIMATION_DURATION * 1.0) / 1000 + "s";

setInterval(() => {

    let rect = element.getBoundingClientRect();

    let is_visible = (rect.top >= 0) && (rect.bottom <= window.innerHeight);

    if (is_visible && !is_showing) {
        is_showing = true;
        element.classList.remove(css_animated_out_class);
        element.classList.add(css_animated_in_class);
        if (timeout_id) clearTimeout(timeout_id);
        element.classList.remove(css_hidden_class);

        timeout_id = setTimeout(() => {
            timeout_id = null;
            element.classList.remove(css_animated_in_class);
        }, ANIMATION_DURATION);

    } else if (!is_visible && is_showing) {
        is_showing = false;
        element.classList.remove(css_hidden_class);
        element.classList.add(css_animated_out_class);
        element.classList.remove(css_animated_in_class);
        if (timeout_id) clearTimeout(timeout_id);

        timeout_id = setTimeout(() => {
            timeout_id = null;
            element.classList.add(css_hidden_class);
            element.classList.remove(css_animated_out_class);
        }, ANIMATION_DURATION);
    }
}, 1000 / 30);