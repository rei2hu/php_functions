// ==UserScript==
// @name         9anime skips
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://9anime.to/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    document.querySelectorAll("a").forEach(n => {if (/\d*?\.com/.test(n.href)) n.style = "";}); // no popup ads
    // skip stuff
    document.onkeydown = function(evt){
        const episode = parseInt(document.querySelectorAll('a.active')[0].getAttribute('data-base'));
        if (evt.ctrlKey) {
            if (evt.keyCode === 37) { // go back
                window.location.href = document.querySelectorAll('a[data-base="'+(episode-1)+'"]')[0].getAttribute("href");
            }
            else if (evt.keyCode === 39) { // go forward
                window.location.href = document.querySelectorAll('a[data-base="'+(episode+1)+'"]')[0].getAttribute("href");
            }
        }
    };
})();
