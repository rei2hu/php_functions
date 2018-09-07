"use strict";
const PianoRhythm_1 = require("./lib/PianoRhythm");
console.info("custom junk");
$(function () {
    console.info("Main Script Started!");
    PianoRhythm_1.PianoRhythm.initialize(() => {
        let windowResize = debounce(function () {
            PianoRhythm_1.PianoRhythm.resize();
        }, 250);
        window.addEventListener('resize', windowResize);
        window.addEventListener('resize', () => {
            if (PianoRhythm_1.PianoRhythm.CANVAS_BG)
                PianoRhythm_1.PianoRhythm.CANVAS_BG.style.opacity = 0;
        });
    });
});
function debounce(func, wait, immediate) {
    let timeout;
    return function () {
        let context = this, args = arguments;
        let later = function () {
            timeout = null;
            if (!immediate)
                func.apply(context, args);
        };
        let callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow)
            func.apply(context, args);
    };
}
;
