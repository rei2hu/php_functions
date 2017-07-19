"use strict";
const Piano_1 = require("./Piano");
const AudioEngine_1 = require("./AudioEngine");
const user_1 = require("./user");
const PianoRhythmPlayer_1 = require("./PianoRhythmPlayer");
const PianoRhythmInstrument_1 = require("./PianoRhythmInstrument");
const PianoRhythmGames_1 = require("./PianoRhythmGames");
var GAMESTATE = PianoRhythmGames_1.PianoRhythmGame.GAMESTATE;
var LOBBY = PianoRhythmGames_1.PianoRhythmGame.LOBBY;
(function (IO_STATE) {
    IO_STATE[IO_STATE["INITIAL"] = 0] = "INITIAL";
    IO_STATE[IO_STATE["CONNECTED"] = 1] = "CONNECTED";
    IO_STATE[IO_STATE["DISCONNECTED"] = 2] = "DISCONNECTED";
    IO_STATE[IO_STATE["RECONNECTING"] = 3] = "RECONNECTING";
    IO_STATE[IO_STATE["ERROR"] = 4] = "ERROR";
})(exports.IO_STATE || (exports.IO_STATE = {}));
var IO_STATE = exports.IO_STATE;
(function (CLIENT_FOCUS) {
    CLIENT_FOCUS[CLIENT_FOCUS["LOGIN"] = 0] = "LOGIN";
    CLIENT_FOCUS[CLIENT_FOCUS["REGISTER"] = 1] = "REGISTER";
    CLIENT_FOCUS[CLIENT_FOCUS["PIANO"] = 2] = "PIANO";
    CLIENT_FOCUS[CLIENT_FOCUS["CHAT"] = 3] = "CHAT";
    CLIENT_FOCUS[CLIENT_FOCUS["BOTTOMBAR"] = 4] = "BOTTOMBAR";
    CLIENT_FOCUS[CLIENT_FOCUS["OPTIONS"] = 5] = "OPTIONS";
    CLIENT_FOCUS[CLIENT_FOCUS["NEWROOM"] = 6] = "NEWROOM";
    CLIENT_FOCUS[CLIENT_FOCUS["DIALOGUE"] = 7] = "DIALOGUE";
    CLIENT_FOCUS[CLIENT_FOCUS["MIDIPLAYER"] = 8] = "MIDIPLAYER";
    CLIENT_FOCUS[CLIENT_FOCUS["MIDIOPTIONS"] = 9] = "MIDIOPTIONS";
    CLIENT_FOCUS[CLIENT_FOCUS["MIDISEARCH"] = 10] = "MIDISEARCH";
    CLIENT_FOCUS[CLIENT_FOCUS["PASSWORD_PROMPT"] = 11] = "PASSWORD_PROMPT";
    CLIENT_FOCUS[CLIENT_FOCUS["ROOMSETTINGS"] = 12] = "ROOMSETTINGS";
    CLIENT_FOCUS[CLIENT_FOCUS["UPLINK"] = 13] = "UPLINK";
    CLIENT_FOCUS[CLIENT_FOCUS["TABS"] = 14] = "TABS";
    CLIENT_FOCUS[CLIENT_FOCUS["PROFILE"] = 15] = "PROFILE";
})(exports.CLIENT_FOCUS || (exports.CLIENT_FOCUS = {}));
var CLIENT_FOCUS = exports.CLIENT_FOCUS;
(function (SLOT_MODE) {
    SLOT_MODE[SLOT_MODE["SINGLE"] = 0] = "SINGLE";
    SLOT_MODE[SLOT_MODE["MULTI"] = 1] = "MULTI";
    SLOT_MODE[SLOT_MODE["PIANO_2"] = 2] = "PIANO_2";
    SLOT_MODE[SLOT_MODE["PIANO_4"] = 3] = "PIANO_4";
    SLOT_MODE[SLOT_MODE["PIANO_8"] = 4] = "PIANO_8";
})(exports.SLOT_MODE || (exports.SLOT_MODE = {}));
var SLOT_MODE = exports.SLOT_MODE;
class PianoRhythm {
    static showTOS() {
        return new Promise((resolve, reject) => {
            if (!this.TOS) {
                this.TOS = $("<div>");
                this.TOS.addClass("TOS");
                $.ajax({ url: "../changelog/tos.md", success: (data) => {
                        this.TOS.append(new showdown.Converter().makeHtml(data));
                        let buttonAccept = $("<button>");
                        buttonAccept.addClass("rkmd-btn");
                        buttonAccept.text("Accept");
                        buttonAccept.css({
                            position: "relative",
                            background: "green",
                            color: "white",
                            "margin-left": "calc(50% - 115px)"
                        });
                        buttonAccept.click(() => { resolve(true); });
                        this.TOS.append(buttonAccept);
                        let buttonDecline = $("<button>");
                        buttonDecline.addClass("rkmd-btn");
                        buttonDecline.text("Decline");
                        buttonDecline.css({
                            position: "relative",
                            background: "red",
                            color: "white",
                        });
                        buttonDecline.click(() => { reject(true); });
                        this.TOS.append(buttonDecline);
                    } });
                $("body").append(this.TOS);
                setTimeout(() => { this.TOS.children("hr").remove(); }, 500);
            }
        });
    }
    static checkElectron() {
        if (window.ELECTRON) {
            PianoRhythm.ELECTRON = window.nodeRequire('electron');
        }
    }
    static initialize(callback) {
        let online = PianoRhythm._online;
        PianoRhythm.ROLE_COLORS.set("OSOP", "#FF5722");
        PianoRhythm.ROLE_COLORS.set("MOD", "red");
        PianoRhythm.ROLE_COLORS.set("SYSOP", "black");
        PianoRhythm.ROLE_COLORS.set("DEV", "blue");
        PianoRhythm.ROLE_COLORS.set("BOT_DEV", "#3F51B5");
        PianoRhythm.ROLE_COLORS.set("EVT", "purple");
        PianoRhythm.ROLE_COLORS.set("SPT", "green");
        PianoRhythm.ROLE_COLORS.set("USER", "none");
        PianoRhythm.ROLE_COLORS.set("GUEST", "none");
        PianoRhythm.ROLE_RANK.set("OSOP", 8);
        PianoRhythm.ROLE_RANK.set("DEV", 7);
        PianoRhythm.ROLE_RANK.set("SYSOP", 6);
        PianoRhythm.ROLE_RANK.set("MOD", 5);
        PianoRhythm.ROLE_RANK.set("BOT_DEV", 4);
        PianoRhythm.ROLE_RANK.set("EVT", 3);
        PianoRhythm.ROLE_RANK.set("DESIGN", 2);
        PianoRhythm.ROLE_RANK.set("SPT", 1);
        PianoRhythm.ROLE_RANK.set("USER", 0);
        PianoRhythm.ROLE_RANK.set("GUEST", -1);
        PianoRhythm.ROLE_AMOUNT.set("OSOP", 0);
        PianoRhythm.ROLE_AMOUNT.set("DEV", 0);
        PianoRhythm.ROLE_AMOUNT.set("SYSOP", 0);
        PianoRhythm.ROLE_AMOUNT.set("MOD", 0);
        PianoRhythm.ROLE_AMOUNT.set("BOT_DEV", 0);
        PianoRhythm.ROLE_AMOUNT.set("EVT", 0);
        PianoRhythm.ROLE_AMOUNT.set("DESIGN", 0);
        PianoRhythm.ROLE_AMOUNT.set("SPT", 0);
        PianoRhythm.ROLE_AMOUNT.set("USER", 0);
        PianoRhythm.ROLE_AMOUNT.set("GUEST", 0);
        PianoRhythm.SETTINGS["VEL_BOOST"] = true;
        PianoRhythm.checkElectron();
        PianoRhythm.parseAgent();
        window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame
            || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame
            || function (cb) {
                setTimeout(cb, 1000 / 60);
            };
        PianoRhythm.loadSettings();
        PianoRhythm.loadJquery();
        PianoRhythm.connect(online);
        PianoRhythm.initializeWebMidi();
        PianoRhythm.initializeWorker();
        PianoRhythm.handleInput();
        PianoRhythm.initializeMouseMovement();
        PianoRhythm.checkDesktopNotifications();
        PianoRhythm.initializeQTIP();
        if (!online)
            PianoRhythm.displayMainContent();
        PianoRhythm.EventsCallback();
        if (callback)
            callback();
        if (PianoRhythm.DEBUG_MESSAGING)
            console.info("Connected the server at port: " + PianoRhythm.PORT);
    }
    static initialLogin() {
        PianoRhythm.PRELOADER = $(".preloader");
        if (PianoRhythm.PRELOADER && PianoRhythm.PRELOADER.length)
            PianoRhythm.PRELOADER.fadeOut(() => {
                let bg_setting = PianoRhythm.loadSetting("UI", "bg_animation");
                if (bg_setting === null)
                    PianoRhythm.saveSetting("UI", "bg_animation", false);
                if (bg_setting !== false)
                    $(".fullscreen-bg").fadeIn(1500);
            });
        PianoRhythm.PR_ICON = PianoRhythm.PRELOADER;
        PianoRhythm.LOGIN_PAGE = $('.loginPage');
        PianoRhythm.LOGIN_STATUS = $("#loginStatus");
        let enterBTN = $("#loginEnterBTN");
        let loginBTN = $("#loginBTN");
        let usernameInput = $('.usernameInput');
        let registerBTN = $("#loginRegisterBTN");
        let status = $("#formStatus");
        let form1 = $(".form1");
        let pressed = false, username = "Guest", logged;
        var loadingTimer;
        if (PianoRhythm.PR_ICON && PianoRhythm.PR_ICON.length) {
            PianoRhythm.UPLINK = new PianoRhythmUpLink(PianoRhythm.PR_ICON);
            PianoRhythm.SOCKET.emit("checkInbox");
            PianoRhythm.PR_ICON.hover(() => {
                PianoRhythm.PR_ICON.addClass("preloader_Hover");
                if (PianoRhythm.UPLINK && PianoRhythm.CLIENT && PianoRhythm.CLIENT.loggedIn) {
                    PianoRhythm.PR_ICON.attr("title", "Loading...");
                    PianoRhythm.PR_ICON.qtip();
                    PianoRhythm.UPLINK.getPendingFriendRequestCount((count) => {
                        var req_msg = "Friend Requests: " + count;
                        PianoRhythm.PR_ICON.attr("title", req_msg + " | Loading...");
                        PianoRhythm.PR_ICON.qtip();
                        PianoRhythm.UPLINK.getUnreadInboxCount((count) => {
                            PianoRhythm.PR_ICON.attr("title", req_msg + " | Unread Messages: " + count);
                            PianoRhythm.PR_ICON.qtip();
                        });
                    });
                }
            }, () => {
                PianoRhythm.PR_ICON.removeClass("preloader_Hover");
            });
            PianoRhythm.PR_ICON.click(() => {
                if (PianoRhythm.UPLINK) {
                    if (!PianoRhythm.UPLINK.visible) {
                        PianoRhythm.SOCKET.emit("checkFriendRequests");
                        PianoRhythm.SOCKET.emit("checkInbox");
                        PianoRhythm.UPLINK.show();
                    }
                    else {
                        PianoRhythm.UPLINK.hide();
                    }
                }
                pressed = false;
            });
        }
        PianoRhythm.LOGIN_PAGE.fadeIn(1500, () => {
            PianoRhythm.LOGIN_PAGE.css("transition", "all 0.2s");
            PianoRhythm.setGlobalColor(PianoRhythm.loadSetting("COLOR", "global_1") || PianoRhythm.COLORS.base4).then(() => {
                PianoRhythm.default_background_type = PianoRhythm.loadSetting("COLOR", "background_type") || PianoRhythm.default_background_type;
                PianoRhythm.setBackground(PianoRhythm.default_background_type, PianoRhythm.loadSetting("COLOR", "background_1") || PianoRhythm.default_background_color1, PianoRhythm.loadSetting("COLOR", "background_2") || PianoRhythm.default_background_color2);
            }, (err) => {
                PianoRhythm.notify("An error has occurred trying to set the global color.");
                console.error(err);
            });
        });
        usernameInput.focus();
        let token = window.localStorage.getItem("socketCluster.authToken");
        PianoRhythm.AUTH_TOKEN = token;
        let query_userName = PianoRhythm.getParameterByName('username');
        usernameInput.on("mousedown mouseup focus", () => {
            PianoRhythm.CLIENT_FOCUS = CLIENT_FOCUS.LOGIN;
        });
        usernameInput.keydown(function (evt) {
            if (PianoRhythm.AUTH_TOKEN && PianoRhythm.loadSetting("GENERAL", "autoLoginToken"))
                return;
            if (PianoRhythm.LOGIN_ENTERED)
                return;
            PianoRhythm.CLIENT_FOCUS = CLIENT_FOCUS.LOGIN;
            if (evt.which === 13) {
                if (PianoRhythm.STATE !== IO_STATE.CONNECTED) {
                    PianoRhythm.notify({ message: "The server is down. Unable to connect" });
                    return;
                }
                if (pressed)
                    return;
                pressed = true;
                $('.registration-form').fadeOut();
                PianoRhythm.login(usernameInput.val());
                setTimeout(() => {
                    pressed = false;
                }, 3000);
            }
        });
        enterBTN.click(() => {
            if (window.localStorage.getItem("socketCluster.authToken") && PianoRhythm.SETTINGS["autoLoginToken"] && PianoRhythm.LOGIN_ENTERED)
                return;
            if (pressed)
                return;
            pressed = true;
            if (PianoRhythm.STATE !== IO_STATE.CONNECTED) {
                PianoRhythm.notify({ message: "The server is down. Unable to connect" });
                return;
            }
            PianoRhythm.login(usernameInput.val() || username);
            setTimeout(() => {
                pressed = false;
            }, 5000);
        });
        registerBTN.click(() => {
            if (window.localStorage.getItem("socketCluster.authToken") && PianoRhythm.SETTINGS["autoLoginToken"] && PianoRhythm.LOGIN_ENTERED)
                return;
            if (PianoRhythm.SOCKET) {
                PianoRhythm.SOCKET.emit("databaseActive", {}, (error, result) => {
                    if ((error === "ERROR" && result)) {
                        $('.register-form').children().each((index, elem) => {
                            if ($(elem).attr('type') !== undefined) {
                                $(elem).prop("disabled", true);
                                $(elem).css("pointer-events", "none");
                            }
                        });
                        PianoRhythm.notify("Unable to register. PianoRhythm Database is : <span style='color: red'>offline!</span>", 3000);
                        return;
                    }
                    PianoRhythm.CLIENT_FOCUS = CLIENT_FOCUS.LOGIN;
                    $('.form1').fadeOut();
                    $('.registration-form').fadeIn();
                    $('.updatePassword-form').hide();
                    $('.forgotPassword-form').hide();
                    $('.forgotUsername-form').hide();
                    $('.register-form').fadeIn();
                    $('.login-form').fadeOut();
                });
            }
        });
        loginBTN.click(() => {
            if (window.localStorage.getItem("socketCluster.authToken") && PianoRhythm.SETTINGS["autoLoginToken"] && PianoRhythm.LOGIN_ENTERED)
                return;
            if (PianoRhythm.SOCKET) {
                PianoRhythm.SOCKET.emit("databaseActive", {}, (error, result) => {
                    if (error === "ERROR" && result) {
                        $('.login-form').children().each((index, elem) => {
                            if ($(elem).attr('type') !== undefined) {
                                $(elem).prop("disabled", true);
                                $(elem).css("pointer-events", "none");
                            }
                        });
                        PianoRhythm.notify("Unable to login. PianoRhythm Database is : <span style='color: red'>offline!</span>", 3000);
                        return;
                    }
                    PianoRhythm.CLIENT_FOCUS = CLIENT_FOCUS.LOGIN;
                    $('.form1').fadeOut();
                    $('.registration-form').fadeIn();
                    $('.register-form').fadeOut();
                    $('.updatePassword-form').hide();
                    $('.forgotPassword-form').hide();
                    $('.forgotUsername-form').hide();
                    $('.login-form').fadeIn();
                });
            }
        });
        $(".registration-form form").submit((evt) => {
            if (window.localStorage.getItem("socketCluster.authToken") && PianoRhythm.loadSetting("GENERAL", "autoLoginToken") && PianoRhythm.LOGIN_ENTERED)
                return false;
            evt.preventDefault();
            let id = $(evt.currentTarget).attr("id");
            let _class = $(evt.currentTarget).attr("class");
            PianoRhythm.CLIENT_FOCUS = CLIENT_FOCUS.LOGIN;
            if (_class === "forgotPassword-form") {
                let $f_input = $('.forgotPassword-form :input');
                let values = new Object();
                $f_input.each(function () {
                    if (this.name.length > 0)
                        values[this.name] = $(this).val();
                });
                if (values.email) {
                    if (PianoRhythm.SOCKET) {
                        PianoRhythm.SOCKET.emit("forgotPassword", {
                            email: values.email
                        }, (err, token) => {
                            if (err) {
                                PianoRhythm.notify("An error occurred or no account was found for that email.");
                                return;
                            }
                            PianoRhythm.notify("Please check your email for further instructions. You may also need to check your SPAM folder as well if you don't see it.");
                            let redirectWindow = window.open(window.location.origin + "/forgotUsernamePassword?token=" + token, '_blank', 'location=yes,height=350,width=520,scrollbars=yes,status=yes');
                            $.ajax({
                                type: 'POST',
                                url: '/echo/json/',
                                success: function (data) {
                                    redirectWindow.location;
                                }
                            });
                        });
                    }
                }
                return;
            }
            let $r_inputs = $('.register-form :input');
            let $l_inputs = $('.login-form :input');
            let $inputs = ($(evt.currentTarget).attr("class") === "register-form") ? $r_inputs : $l_inputs;
            let values = {};
            $inputs.each(function () {
                if (this.name.length > 0)
                    values[this.name] = $(this).val();
            });
            if (values.passwordOne && values.passwordTwo) {
                let f_nameForm = $('#registerForm_FirstName');
                let l_nameForm = $('#registerForm_LastName');
                let u_nameForm = $('#registerForm_Username');
                let emailForm = $('#registerForm_Email');
                let regForm = $('#registerForm_PW');
                let regForm2 = $('#registerForm_PW2');
                if (!PianoRhythm.validateName(values.firstname)) {
                    f_nameForm.css("border", "solid 2px lightcoral");
                    $(f_nameForm)[0].setCustomValidity("Name must contain only letters and/or underscores! (Min 3 chars)");
                    status.text("Name must contain only letters and/or underscores! (Min 3 chars)");
                    status.fadeIn();
                    setTimeout(() => {
                        f_nameForm.css("border", "");
                        $(f_nameForm)[0].setCustomValidity("");
                        status.fadeOut();
                    }, 5000);
                }
                if (values.lastname && values.lastname.length > 0)
                    if (!PianoRhythm.validateName(values.lastname)) {
                        l_nameForm.css("border", "solid 2px lightcoral");
                        $(l_nameForm)[0].setCustomValidity("Name must contain only letters and/or underscores! (Min 3 chars)");
                        status.text("Name must contain only letters and/or underscores! (Min 3 chars)");
                        status.fadeIn();
                        setTimeout(() => {
                            l_nameForm.css("border", "");
                            $(l_nameForm)[0].setCustomValidity("");
                            status.fadeOut();
                        }, 5000);
                    }
                if (!PianoRhythm.validateUserName(values.username)) {
                    u_nameForm.css("border", "solid 2px lightcoral");
                    $(u_nameForm)[0].setCustomValidity("Name must contain only letters, numbers or underscores! (3 - 15chars)");
                    status.text("Name must contain only letters, numbers or underscores! (3 - 15 chars)");
                    status.fadeIn();
                    setTimeout(() => {
                        u_nameForm.css("border", "");
                        $(u_nameForm)[0].setCustomValidity("");
                        status.fadeOut();
                    }, 5000);
                }
                if (!PianoRhythm.validateEmail(values.email)) {
                    emailForm.css("border", "solid 2px lightcoral");
                    $(emailForm)[0].setCustomValidity("Invalid e-mail!");
                    status.text("Invalid e-mail!");
                    status.fadeIn();
                    setTimeout(() => {
                        emailForm.css("border", "");
                        $(emailForm)[0].setCustomValidity("");
                        status.fadeOut();
                    }, 5000);
                }
                if (!PianoRhythm.validatePassword(values.passwordOne)) {
                    regForm.css("border", "solid 2px lightcoral");
                    $(regForm)[0].setCustomValidity("Password must be at least 6 characters");
                    status.text("Password must be at least 6 characters");
                    status.fadeIn();
                    setTimeout(() => {
                        regForm.css("border", "");
                        $(regForm)[0].setCustomValidity("");
                        status.fadeOut();
                    }, 5000);
                }
                if (!PianoRhythm.validatePassword(values.passwordTwo)) {
                    regForm2.css("border", "solid 2px lightcoral");
                    $(regForm2)[0].setCustomValidity("Password must be at least 6 characters");
                    status.text("Password must be at least 6 characters");
                    status.fadeIn();
                    setTimeout(() => {
                        regForm2.css("border", "");
                        $(regForm)[0].setCustomValidity("");
                        status.fadeOut();
                    }, 5000);
                }
                if (values.passwordOne !== values.passwordTwo) {
                    regForm2.css("border", "solid 2px lightcoral");
                    $(regForm2)[0].setCustomValidity("Passwords don't match!");
                    status.text("Passwords don't match!");
                    status.fadeIn();
                    setTimeout(() => {
                        regForm2.css("border", "");
                        $(regForm2)[0].setCustomValidity("");
                        status.fadeOut();
                    }, 5000);
                }
                try {
                    let roomName = (window.location.pathname.length > 1) ?
                        window.location.pathname : "lobby";
                    roomName = (roomName.indexOf("/") > -1) ?
                        roomName.substring(1, roomName.length).trim() : roomName;
                    values.roomName = roomName;
                    PianoRhythm.SOCKET.emit("registration", values, (error, callbackData) => {
                        if (error) {
                            PianoRhythm.notify({ message: callbackData.message });
                            return;
                        }
                        if (callbackData) {
                            if (PianoRhythm.DEBUG_MESSAGING)
                                console.log(callbackData);
                            if (callbackData.message === "success") {
                                $('.registration-form').fadeOut();
                                PianoRhythm.CLIENT.name = values.username;
                                PianoRhythm.CLIENT.loggedIn = true;
                                PianoRhythm.login(null);
                                return;
                            }
                            status.text(callbackData.message);
                            status.fadeIn();
                            setTimeout(() => {
                                status.fadeOut();
                            }, 6000);
                        }
                    });
                }
                catch (err) {
                    if (PianoRhythm.DEBUG_MESSAGING)
                        console.error(err);
                }
            }
            else {
                if (!PianoRhythm.validateUserName(values.username)) {
                    u_nameForm.css("border", "solid 2px lightcoral");
                    $(u_nameForm)[0].setCustomValidity("Name must contain only letters, numbers or underscores! (3 - 15chars)");
                    status.text("Name must contain only letters, numbers or underscores! (3 - 15 chars)");
                    status.fadeIn();
                    setTimeout(() => {
                        u_nameForm.css("border", "");
                        $(u_nameForm)[0].setCustomValidity("");
                        status.fadeOut();
                    }, 5000);
                }
                if (!PianoRhythm.validatePassword(values.password)) {
                    regForm2.css("border", "solid 2px lightcoral");
                    $(regForm2)[0].setCustomValidity("Password must be at least 6 characters");
                    status.text("Password must be at least 6 characters");
                    status.fadeIn();
                    setTimeout(() => {
                        regForm2.css("border", "");
                        $(regForm)[0].setCustomValidity("");
                        status.fadeOut();
                    }, 5000);
                }
                try {
                    let roomName = (window.location.pathname.length > 1) ?
                        window.location.pathname : "lobby";
                    roomName = (roomName.indexOf("/") > -1) ?
                        roomName.substring(1, roomName.length).trim() : roomName;
                    values.roomName = roomName;
                    setTimeout(() => {
                        if (PianoRhythm.globalLoadingBar === undefined)
                            PianoRhythm.globalLoadingBar = new ProgressBar.Line('.loadingBar', {
                                strokeWidth: 5,
                                text: {
                                    value: "You are being logged in. Please wait",
                                    style: {
                                        top: "",
                                        left: "",
                                        transform: ""
                                    }
                                },
                            });
                        if (PianoRhythm.globalLoadingBar) {
                            let increment = 0;
                            PianoRhythm.loadingTimer = setInterval(() => {
                                increment += 0.001;
                                if (PianoRhythm.globalLoadingBar)
                                    PianoRhythm.globalLoadingBar.set(increment);
                                else
                                    clearInterval(PianoRhythm.loadingTimer);
                            }, 50);
                        }
                        $(".loginPage").css("filter", "blur(5px)");
                        PianoRhythm.loadBar = $(".loadingBar");
                        if (PianoRhythm.loadBar && PianoRhythm.loadBar.length)
                            PianoRhythm.loadBar.fadeIn("fast");
                        PianoRhythm.SOCKET.emit("login", values);
                    }, 100);
                }
                catch (err) {
                    if (PianoRhythm.DEBUG_MESSAGING)
                        console.error(err);
                }
            }
        }).on("mousedown mouseup keydown focus", () => {
            PianoRhythm.CLIENT_FOCUS = CLIENT_FOCUS.LOGIN;
        });
        $('.formMessage a').click(function (evt) {
            evt.preventDefault();
            var id = $(evt.currentTarget).attr("id");
            if (!id) {
                PianoRhythm.SOCKET.emit("databaseActive", {}, (error, result) => {
                    if (error === "ERROR" && result) {
                        $('.login-form').children().each((index, elem) => {
                            if ($(elem).attr('type') !== undefined) {
                                $(elem).prop("disabled", true);
                                $(elem).css("pointer-events", "none");
                            }
                        });
                        $('.register-form').children().each((index, elem) => {
                            if ($(elem).attr('type') !== undefined) {
                                $(elem).prop("disabled", true);
                                $(elem).css("pointer-events", "none");
                            }
                        });
                        PianoRhythm.notify("PianoRhythm Database is : <span style='color: red'>offline!</span>", 3000);
                    }
                    PianoRhythm.CLIENT_FOCUS = CLIENT_FOCUS.LOGIN;
                    $('.updatePassword-form').hide();
                    $('.forgotPassword-form').hide();
                    $('.forgotUsername-form').hide();
                    $('.register-form').animate({ height: "toggle", opacity: "toggle" }, "slow", () => {
                    });
                    $('.login-form').animate({ height: "toggle", opacity: "toggle" }, "slow", () => {
                    });
                });
            }
            else {
                if (id.indexOf("enterAsGuest") > -1) {
                    $('.register-form').fadeOut();
                    $('.login-form').fadeOut();
                    $('.registration-form').fadeOut();
                    $('.updatePassword-form').hide();
                    $('.forgotPassword-form').hide();
                    $('.forgotUsername-form').hide();
                    $('.form1').fadeIn();
                    return;
                }
                switch (id) {
                    case "forgotUsername_Password":
                        $('.register-form').fadeOut();
                        $('.login-form').fadeOut();
                        $('.forgotPassword-form').hide();
                        $('.forgotUsername-form').hide();
                        $('.forgotPassword-form').show();
                        break;
                    case "signin":
                        $('.updatePassword-form').hide();
                        $('.forgotPassword-form').hide();
                        $('.forgotUsername-form').hide();
                        $('.register-form').fadeOut();
                        $('.login-form').fadeIn();
                        break;
                }
            }
        });
        PianoRhythm.setupHelloAuth();
    }
    static login(username, roomname = null, register = true, bypass = false) {
        let roomName = (window.location.pathname.length > 1) ?
            window.location.pathname : "lobby";
        roomName = (roomName.indexOf("/") > -1) ?
            roomName.substring(1, roomName.length).trim() : roomName;
        roomName = roomname || roomName || "lobby";
        if (username && register) {
            let savedRoom = null;
            try {
                let parsed = JSON.parse(PianoRhythm.loadSetting("ROOM", "SETTINGS"));
                savedRoom = parsed["list"] || parsed;
                if (savedRoom && savedRoom.name != roomName)
                    savedRoom = null;
                console.log("SENDING SAVED ROOM", parsed, savedRoom);
            }
            catch (err) { }
            PianoRhythm.SOCKET.emit('register', {
                name: username || "Guest",
                savedRoom: savedRoom,
                roomName: roomName
            });
        }
        else {
            if (!bypass)
                PianoRhythm.displayMainContent();
        }
    }
    static setupHelloAuth() {
        return;
        let logged = false;
        hello.logout('facebook');
        hello.logout('google');
        hello.init({
            facebook: '241389542881902',
            google: '39604874227-ti96273lajskclje97sgpbuhb4hi7qbk.apps.googleusercontent.com'
        }, {
            scope: "email",
            "redirect_uri": "redirect.html"
        });
        $("#loginSocialMediaBTN").click((evt) => {
            evt.preventDefault();
            if (window.localStorage.getItem("socketCluster.authToken") && PianoRhythm.loadSetting("GENERAL", "autoLoginToken") && PianoRhythm.LOGIN_ENTERED)
                return;
            PianoRhythm.CLIENT_FOCUS = CLIENT_FOCUS.LOGIN;
            PianoRhythm.SOCKET.emit("databaseActive", {}, (error, result) => {
                if ((error === "ERROR" && result) || error) {
                    PianoRhythm.notify("An error has occurred. The database may be offline.");
                    return;
                }
                let clicked = $(evt.target).attr("data-clicked");
                if (clicked === "false")
                    clicked = "true";
                else
                    clicked = "false";
                let socialMedia = $("#loginSocialMedia");
                if (clicked === "true")
                    socialMedia.fadeIn();
                else
                    socialMedia.fadeOut();
                $(evt.target).attr("data-clicked", clicked);
            });
        });
    }
    static initializeDragDrop() {
        if (window.File && window.FileList && window.FileReader) {
            PianoRhythm.DragDrop();
        }
    }
    static DragDrop() {
        let fileLimit = 100;
        let type = /mid.*/;
        let removeBorderTimeout = null;
        let over;
        window.addEventListener("dragover", function (e) {
            if (PianoRhythm.draggingInstrumentItem)
                return false;
            e = e || event;
            e.preventDefault();
            if (!over) {
                over = $(document.createElement("div"));
                over.addClass("midiDragOver");
                over.attr("draggable", "false");
                over.css("pointer-events", "none");
                $('body').prepend(over);
            }
            if (!removeBorderTimeout)
                removeBorderTimeout = setTimeout(() => {
                    if (over)
                        over.fadeOut(() => {
                            over.remove();
                            over = null;
                        });
                    removeBorderTimeout = null;
                }, 5000);
        }, false);
        window.addEventListener("dragleave", function (e) {
            e = e || event;
            e.preventDefault();
            removeBorderTimeout = null;
        }, false);
        window.addEventListener("dragexit dragleave dragend", function (e) {
            if (over)
                over.remove();
            over = null;
            removeBorderTimeout = null;
        }, false);
        window.addEventListener("drop", function (e) {
            e = e || event;
            e.preventDefault();
            if (over)
                over.remove();
            over = null;
            removeBorderTimeout = null;
            let file = e.dataTransfer.files[0];
            if (!file) {
                return;
            }
            let fileSize = Math.ceil(file.size / 1024);
            if (file.type.match(type)) {
                if (fileSize >= fileLimit && !PianoRhythm.OFFLINE_MODE) {
                    PianoRhythm.notify("Rejecting midi due to instability with large midi files. Limit: " + fileLimit + "kb");
                    return;
                }
                if (PianoRhythm.PLAYER) {
                    PianoRhythm.PLAYER.reset();
                    PianoRhythmPlayer_1.PianoRhythmPlayer.FILE_INFO = {
                        title: file.name.substring(0, file.name.lastIndexOf("."))
                    };
                    PianoRhythmPlayer_1.PianoRhythmPlayer.UI_SONG_TITLE.text(PianoRhythmPlayer_1.PianoRhythmPlayer.FILE_INFO.title);
                    PianoRhythm.PLAYER.parseMidiFile(file, PianoRhythm.PLAYER, false);
                }
            }
            else {
                PianoRhythm.notify("Please drop a valid .mid file!");
            }
        }, false);
        if (PianoRhythm.DEBUG_MESSAGING)
            console.info("Drag & Drop files ready.");
    }
    static EventsCallback() {
        PianoRhythm.EVENT_EMITTER = new EventEmitter();
        var self = this;
        var evt = new CustomEvent('PianoRhythmLoaded', {
            "detail": {
                _PIANORHYTHM: self,
                _PIANO: Piano_1.Piano
            }
        });
        $.getScript("/javascripts/modules/mod_template_1.js", function (response, status) {
            if (PianoRhythm.DEBUG_MESSAGING)
                console.log("D-Mod Script loaded but not necessarily executed.");
            window.dispatchEvent(evt);
        }).fail(function () {
            if (PianoRhythm.DEBUG_MESSAGING)
                console.log("D-Mod Script failed!");
            setTimeout(() => {
                window.dispatchEvent(evt);
            }, 1000);
        });
        if (PianoRhythm.EVENT_EMITTER) {
            PianoRhythm.EVENT_EMITTER.on("modSetPRMOD", (data) => {
                if (data && data.prMod) {
                    window.prMod = data.prMod;
                }
            });
        }
    }
    static loadJquery() {
        PianoRhythm.BODY = $('body');
        PianoRhythm.PING_OBJ = $("#displayPing");
        PianoRhythm.PLAYERSONLINE = $("#playersOnline");
        PianoRhythm.SUSTAIN_DISPLAY = $("#displaySustain");
        PianoRhythm.BOTTOM_BAR = $("#bottomBar");
        PianoRhythm.BOTTOM_BAR_OPTIONS = $("#bottomBar_UI_OPTIONS");
        PianoRhythm.NEWROOMBUTTON = $("#newRoomBTN");
        PianoRhythm.QUITGAMEBUTTON = $("#quitGameBTN");
        PianoRhythm.QUITGAMEBUTTON.hide();
        PianoRhythm.MIDIOPTIONSBUTTON = $("#midiOptionsBTN");
        PianoRhythm.ROOMSETTINGSBUTTON = $("#roomSettingsBTN");
        PianoRhythm.ROOMSETTINGSBUTTON.hide();
        PianoRhythm.VOLUMEDIV = $("#volumeBar");
        PianoRhythm.OPTIONSBUTTON = $("#optionsBTN");
        PianoRhythm.TRANSITION_OVERLAY = $("#transition_overlay");
        PianoRhythm.CONTENT = $('.contentWrap');
        PianoRhythm.PALSTAB_REQUESTSAMOUNT = $('.numberCircle_palsTab');
        PianoRhythm.CONTEXT_MENU = $("#ctxmenu-tpl");
        PianoRhythm.INSTRUMENTS_SELECT = $('#room_instruments_select');
        PianoRhythm.CONTEXT_MENU = $("#ctxmenu-tpl");
        PianoRhythm.CONTEXT_MENU2 = $("#ctxmenu2-tpl");
        PianoRhythm.CONTEXT_MENU_DOCK = $("#ctxmenu3-tpl");
        Piano_1.Piano.BOXSHADOW = $(".boxshadow");
        PianoRhythm.CMESSAGESUL = $("#chatMessagesUL");
        PianoRhythm.CMESSAGES = $("#chatMessages");
        PianoRhythm.DOCUMENT = $(document);
        PianoRhythm.CSUBMITFORM = $("#chatMessageSubmitForm");
        PianoRhythm.NEWMESSAGE = $("#newMessage");
        PianoRhythm.PLAYERSBUTTON = $("#UI_players_playersBTN");
        PianoRhythm.PALSBUTTON = $("#UI_players_friendsBTN");
        PianoRhythm.ROOMSBUTTON = $("#UI_players_roomBTN");
        PianoRhythm.PLAYERLIST = $("#UI_players_list");
        PianoRhythm.PLAYERLIST_UL = $("#UI_players_list ul");
        PianoRhythm.FRIENDLIST = $("#UI_friends_list");
        PianoRhythm.FRIENDLIST_UL = $("#UI_friends_list ul");
        PianoRhythm.FRIENDLIST_UL_LOGIN_TO_ADD_FRIENDS = $("#ul_noFriends");
        PianoRhythm.ROOMLIST = $("#UI_rooms_list");
        PianoRhythm.PLAYERSONLINE = $("#playersOnline");
        PianoRhythm.jUI = $("#UI");
        PianoRhythm.jUI2 = $("#UI2");
        PianoRhythm.HIDEUI = $("#HideUI");
        PianoRhythm.CANVAS_3D = $("#playCanvas");
        PianoRhythm.WHOISTYPING = $("#whoIsTyping");
        PianoRhythm.CMESSAGEINPUT = $("#chatMessageInput");
        PianoRhythm.CMESSAGEINPUTCONTAINER = $(".messageInput");
        PianoRhythm.MENTIONS = $("#messageInput_MentionContainer");
        PianoRhythm.MENTIONS_LIST = $("#messageInput_MentionContainer > ul");
        PianoRhythm.SIDEBAR_OFFSET = PianoRhythm.jUI.width();
        wdtEmojiBundle.on('afterPickerOpen', function (event) {
            console.log("OPen!");
        });
        wdtEmojiBundle.defaults.type = 'emojione';
        wdtEmojiBundle.defaults.emojiSheets.apple = './images/emojis/sheet_apple_64_indexed_128.png';
        wdtEmojiBundle.defaults.emojiSheets.google = './images/emojis/sheet_google_64_indexed_128.png';
        wdtEmojiBundle.defaults.emojiSheets.twitter = './images/emojis/sheet_twitter_64_indexed_128.png';
        wdtEmojiBundle.defaults.emojiSheets.emojione = './images/emojis/sheet_emojione_64_indexed_128.png';
        wdtEmojiBundle.init('body');
        wdtEmojiBundle.changeType("emojione");
        PianoRhythm.EMOJI_POPUP = $(".wdt-emoji-popup");
        PianoRhythm.EMOJI_PICKER = $(".wdt-emoji-picker");
        $("#messageBar").append(PianoRhythm.EMOJI_PICKER);
        wdtEmojiBundle.on('afterSelect', function (event) {
            PianoRhythm.CMESSAGEINPUT.val(PianoRhythm.CMESSAGEINPUT.val() + event.emoji);
            PianoRhythm.CMESSAGEINPUT.focus();
            PianoRhythm.FOCUS_CHAT();
        });
        console.info("JQuery Cache Complete.");
    }
    static initiate2D() {
        if (Piano_1.Piano.INITIALIZED)
            return;
        PianoRhythm.CANVAS_PARENT = document.getElementById("gameCanvas");
        PianoRhythm.CANVAS_2D = document.getElementById("canvas_2D");
        PianoRhythm.CANVAS_INPUT = document.getElementById("gameCanvasInput");
        PianoRhythm.CANVAS_BG = document.getElementById("gameCanvasBG");
        PianoRhythm.CANVAS_2D_CTX = PianoRhythm.CANVAS_2D.getContext("2d");
        PianoRhythm.CANVAS_2D_CTX.imageSmoothingEnabled = false;
        PianoRhythm.initializePiano();
        PianoRhythm.FOCUS_PIANO();
        PianoRhythm.CANVAS_3D.remove();
    }
    static movePiano(x = 0, y = 0) {
        if (x !== undefined && x !== null) {
        }
        if (y !== undefined && y !== null) {
            if (PianoRhythm.CANVAS_PARENT && PianoRhythm.CANVAS_INPUT && PianoRhythm.CANVAS_BG) {
                PianoRhythm.CANVAS_PARENT.style.marginTop = y + "px";
                PianoRhythm.CANVAS_INPUT.style.top = y + "px";
                PianoRhythm.CANVAS_BG.style.top = y + "px";
            }
        }
        Piano_1.Piano.setRawWidth();
        Piano_1.Piano.setBoxShadowPosition();
        Piano_1.Piano.checkForDock();
    }
    static initializePiano() {
        Piano_1.Piano.initialize();
        Piano_1.Piano.drawPiano();
        PianoRhythm.resize();
        Piano_1.Piano.startAnimating(60);
    }
    static getMidiInList() {
        let temp = [];
        for (let input in PianoRhythm.MIDI_IN_LIST) {
            if (PianoRhythm.MIDI_IN_LIST.hasOwnProperty(input)) {
                let i = PianoRhythm.MIDI_IN_LIST[input];
                if (i.connection === "open")
                    temp.push(i.name);
            }
        }
        return JSON.stringify(temp);
    }
    static getMidiOutList() {
        let temp = [];
        for (let input in PianoRhythm.MIDI_OUT_LIST) {
            if (PianoRhythm.MIDI_OUT_LIST.hasOwnProperty(input)) {
                let i = PianoRhythm.MIDI_OUT_LIST[input];
                if (i.connection === "open")
                    temp.push(i.name);
            }
        }
        return JSON.stringify(temp);
    }
    static getMidiList(type) {
        type = type.toLowerCase();
        let obj = (type === "input") ?
            PianoRhythm.MIDI_IN_LIST : PianoRhythm.MIDI_OUT_LIST;
        let arr = [];
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                arr.push(key);
            }
        }
        return arr;
    }
    ;
    static resizeUI() {
        if (PianoRhythm.jUI && PianoRhythm.jUI.length) {
            let uiWidth = PianoRhythm.jUI.width() || 0;
            if (!PianoRhythm.SIDBAR_HIDDEN)
                PianoRhythm.SIDEBAR_OFFSET = Math.ceil(uiWidth / 100) * 100;
            else
                PianoRhythm.SIDEBAR_OFFSET = 0;
            let newWidth = window.innerWidth - PianoRhythm.SIDEBAR_OFFSET;
            if (PianoRhythm.CMESSAGEINPUT && PianoRhythm.CMESSAGEINPUT.length) {
                let messageInputTop = PianoRhythm.CMESSAGEINPUT[0].getBoundingClientRect().top || 0;
                PianoRhythm.CMESSAGEINPUT.css("width", (newWidth - 115));
                PianoRhythm.CMESSAGES.css("width", newWidth - 12);
                PianoRhythm.CMESSAGESUL.css("width", newWidth - 12);
                PianoRhythm.CMESSAGES.css("margin-bottom", window.innerHeight - messageInputTop);
                PianoRhythm.EMOJI_PICKER.css("bottom", parseInt(PianoRhythm.CMESSAGEINPUT.css("bottom")) + 12);
                PianoRhythm.EMOJI_POPUP.css("bottom", parseInt(PianoRhythm.CMESSAGEINPUT.css("bottom")) + 32);
            }
            if (PianoRhythm.WHOISTYPING && PianoRhythm.WHOISTYPING.length)
                PianoRhythm.WHOISTYPING.css("left", (PianoRhythm.SIDEBAR_OFFSET + 26) + "px");
            if (PianoRhythm.NEWMESSAGE && PianoRhythm.NEWMESSAGE.length)
                if (PianoRhythm.NEWMESSAGE.is(":visible"))
                    PianoRhythm.NEWMESSAGE.css('visibility', 'hidden');
            let existingBox = $("#boxPR_PASSWORD_PROMPT");
            if (existingBox.length)
                existingBox.center3();
        }
    }
    static resize() {
        if (PianoRhythm.CANVAS_BG)
            PianoRhythm.CANVAS_BG.style.opacity = 0;
        PianoRhythm.resizeUI();
        if (PianoRhythm.CANVAS_PARENT) {
            PianoRhythm.CANVAS_PARENT.style.left = PianoRhythm.SIDEBAR_OFFSET + "px";
            PianoRhythm.CANVAS_PARENT.style.width = "calc(97% - " + PianoRhythm.SIDEBAR_OFFSET + "px)";
            Piano_1.Piano.resizePiano($(PianoRhythm.CANVAS_PARENT).width(), window.innerHeight);
        }
        if (GAMESTATE.initialized && GAMESTATE.ACTIVE_STATE !== null) {
            if (Piano_1.Piano.KEYS["C8"])
                PianoRhythm.movePiano(null, window.innerHeight - Piano_1.Piano.KEYS["C8"].height - 100);
            GAMESTATE.onResize();
        }
        if (PianoRhythm.PLAYER)
            PianoRhythm.PLAYER.onResize();
        if (PianoRhythm.RhythmBlobFactory)
            PianoRhythm.RhythmBlobFactory.onResize();
        PianoRhythmDock.setOffsetPosition();
    }
    static loadSettings() {
        if (PianoRhythm.loadSetting("rod", "rod") !== null)
            PianoRhythm.deleteSetting("Global_Settings_rod");
        let displayPing = PianoRhythm.loadSetting("GENERAL", "displayPING");
        let displaySideMenu = PianoRhythm.loadSetting("GENERAL", "displaySideMenu");
        let graphicsLevel = PianoRhythm.loadSetting("GRAPHICS", "babylonGraphicsLevel");
        let engineType = PianoRhythm.loadSetting("GRAPHICS", "engineType");
        let keyboardMap = PianoRhythm.loadSetting("INPUT", "keyboardMap");
        let notifications = PianoRhythm.loadSetting("GENERAL", "showNotifications");
        let pianoWireFrame = PianoRhythm.loadSetting("GRAPHICS", "pianoWireFrame");
        let pianoNoteEffect = PianoRhythm.loadSetting("GRAPHICS", "pianoNoteEffect");
        let helpNotifications = PianoRhythm.loadSetting("GENERAL", "helpNotifications");
        let tutCounter = PianoRhythm.loadSetting("GENERAL", "firstTimeTutorialCount");
        let chatMessages = PianoRhythm.loadSetting("UI", "displayChatMessages");
        let miscChat = PianoRhythm.loadSetting("GENERAL", "displayMiscChat");
        let dock1 = PianoRhythm.loadSetting("UI", "displayDock1");
        let dock2 = PianoRhythm.loadSetting("UI", "displayDock2");
        let enableMod = PianoRhythm.loadSetting("DEV", "enableBot");
        let autoForce2D = PianoRhythm.loadSetting("GRAPHICS", "autoForce2D");
        let autoLoginToken = PianoRhythm.loadSessionSetting("GENERAL", "autoLoginToken");
        let logMessages = PianoRhythm.loadSetting("MISC", "logMessages");
        let lastMidi_In = PianoRhythm.loadSessionSetting("MIDI", "lastMidi_In");
        let lastMidi_Out = PianoRhythm.loadSessionSetting("MIDI", "lastMidi_Out");
        let enableClientNQ = PianoRhythm.loadSessionSetting("MISC", "clientNQ");
        let velMeter = PianoRhythm.loadSessionSetting("MIDI", "VEL_METER");
        let enableVelocity = PianoRhythm.loadSetting("MIDI", "ENABLE_VELOCITY");
        let velMeterEnabled = PianoRhythm.loadSessionSetting("MIDI", "VEL_METER_ENABLED");
        let velBoostEnabled = PianoRhythm.loadSetting("MIDI", "VEL_BOOST_ENABLED");
        let showMyCursor = PianoRhythm.loadSetting("UI", "mouse_ShowMyCursor");
        let showEveryoneCursor = PianoRhythm.loadSetting("UI", "mouse_ShowEveryoneCursor");
        let showImAfk = PianoRhythm.loadSetting("USER", "showImAfk");
        let keepChatFocus = PianoRhythm.loadSetting("UI", "keepChatFocus");
        let piano_rounded_edges = PianoRhythm.loadSetting("PIANO", "rounded_edges");
        let piano_solid_color = PianoRhythm.loadSetting("PIANO", "solid_color");
        let suppress_link_warning = PianoRhythm.loadSetting("MISC", "suppress_link_warning");
        let blurEffect = PianoRhythm.loadSetting("UI", "blurEffect");
        let listScrollBar = PianoRhythm.loadSetting("UI", "listScrollBar");
        let chatMessageBackground = PianoRhythm.loadSetting("UI", "chat_message_background");
        let allowBotMessages = PianoRhythm.loadSetting("MISC", "allow_bot_messages");
        let friendOnlineMessage = PianoRhythm.loadSetting("MISC", "friendOnlineMessage");
        let enableColorContrast = PianoRhythm.loadSetting("GRAPHICS", "enableColorContrast");
        let animationStyle = PianoRhythm.loadSetting("GRAPHICS", "animationStyle");
        let enableGlow = PianoRhythm.loadSetting("GRAPHICS", "enableGlow");
        let particleGlow = PianoRhythm.loadSetting("GRAPHICS", "particleGlow");
        let shapeStyle = PianoRhythm.loadSetting("GRAPHICS", "shapeStyle");
        let enableParticles = PianoRhythm.loadSetting("GRAPHICS", "enableParticles");
        let enableParticles2 = PianoRhythm.loadSetting("GRAPHICS", "enableParticles2");
        let enableBlobs = PianoRhythm.loadSetting("GRAPHICS", "enableBlobs");
        let particlesBurstAmount = PianoRhythm.loadSetting("GRAPHICS", "particlesBurstAmount");
        let autoConvertEmojis = PianoRhythm.loadSetting("GRAPHICS", "autoConvertEmojis");
        let effectStyle = PianoRhythm.loadSetting("GRAPHICS", "effectStyle");
        let showPiano = PianoRhythm.loadSetting("GRAPHICS", "showPiano");
        PianoRhythm.SETTINGS["piano_rounded_edges"] = (piano_rounded_edges !== null) ? (piano_rounded_edges) : true;
        PianoRhythm.SETTINGS["enableColorContrast"] = (enableColorContrast !== null) ? (enableColorContrast) : false;
        PianoRhythm.SETTINGS["enableGlow"] = (enableGlow !== null) ? (enableGlow) : false;
        PianoRhythm.SETTINGS["enableParticles"] = (enableParticles !== null) ? (enableParticles) : true;
        PianoRhythm.SETTINGS["enableBlobs"] = (enableBlobs !== null) ? (enableBlobs) : true;
        PianoRhythm.SETTINGS["autoConvertEmojis"] = (autoConvertEmojis !== null) ? (autoConvertEmojis) : true;
        PianoRhythm.SETTINGS["enableParticles2"] = (enableParticles2 !== null) ? (enableParticles2) : false;
        PianoRhythm.SETTINGS["particleGlow"] = (particleGlow !== null) ? (particleGlow) : false;
        PianoRhythm.SETTINGS["particlesBurstAmount"] = (particlesBurstAmount !== null) ? (particlesBurstAmount) : 3;
        PianoRhythm.SETTINGS["friendOnlineMessage"] = (friendOnlineMessage !== null) ? (friendOnlineMessage) : true;
        PianoRhythm.SETTINGS["showPiano"] = (showPiano !== null) ? (showPiano) : true;
        PianoRhythm.SETTINGS["animationStyle"] = (animationStyle !== null) ? (animationStyle) : "STYLE 1";
        PianoRhythm.SETTINGS["effectStyle"] = (effectStyle !== null) ? (effectStyle) : "NONE";
        PianoRhythm.SETTINGS["shapeStyle"] = (shapeStyle !== null) ? (shapeStyle) : "SQUARES";
        PianoRhythm.SETTINGS["allow_bot_messages"] = (allowBotMessages !== null) ? (allowBotMessages) : true;
        PianoRhythm.SETTINGS["chat_message_background"] = (chatMessageBackground !== null) ? (chatMessageBackground) : true;
        PianoRhythm.SETTINGS["suppress_link_warning"] = (suppress_link_warning !== null) ? (suppress_link_warning) : false;
        PianoRhythm.SETTINGS["piano_solid_color"] = (piano_solid_color !== null) ? (piano_solid_color) : true;
        PianoRhythm.SETTINGS["blurEffect"] = (blurEffect !== null) ? (blurEffect) : false;
        PianoRhythm.SETTINGS["helpNotifications"] = (helpNotifications !== null) ? (helpNotifications) : true;
        PianoRhythm.SETTINGS["pianoWireFrame"] = (pianoWireFrame !== null) ? (pianoWireFrame) : true;
        PianoRhythm.SETTINGS["pianoNoteEffect"] = (pianoNoteEffect !== null) ? (pianoNoteEffect) : true;
        PianoRhythm.SETTINGS["showNotifications"] = (notifications !== null) ? (notifications) : true;
        PianoRhythm.SETTINGS["displayPING"] = (displayPing !== null) ? (displayPing) : true;
        PianoRhythm.SETTINGS["listScrollBar"] = (listScrollBar !== null) ? (listScrollBar) : false;
        PianoRhythm.SETTINGS["keyboardMap"] = (keyboardMap !== null) ? (keyboardMap) : "MULTIPLAYERPIANO";
        PianoRhythm.SETTINGS["babylonGraphicsLevel"] = (graphicsLevel !== null) ? (graphicsLevel) : 4;
        PianoRhythm.SETTINGS["engineType"] = (engineType !== null) ? (engineType) : ((PianoRhythm.MODE_3D) ? "3D" : "2D");
        PianoRhythm.SETTINGS["firstTimeTutorialCount"] = (tutCounter !== null) ? (tutCounter) : 0;
        PianoRhythm.SETTINGS["displayChatMessages"] = (chatMessages !== null) ? (chatMessages) : true;
        PianoRhythm.SETTINGS["displayDock1"] = (dock1 !== null) ? (dock1) : true;
        PianoRhythm.SETTINGS["displayDock2"] = (dock2 !== null) ? (dock2) : true;
        PianoRhythm.SETTINGS["enableMod"] = (enableMod !== null) ? (enableMod) : true;
        PianoRhythm.SETTINGS["showImAfk"] = (showImAfk !== null) ? (showImAfk) : true;
        PianoRhythm.SETTINGS["autoForce2D"] = (autoForce2D !== null) ? (autoForce2D) : true;
        PianoRhythm.SETTINGS["autoLoginToken"] = (autoLoginToken !== null) ? (autoLoginToken) : true;
        PianoRhythm.SETTINGS["logMessages"] = (logMessages !== null) ? (logMessages) : false;
        PianoRhythm.SETTINGS["lastMidi_In"] = (lastMidi_In !== null) ? (lastMidi_In) : null;
        PianoRhythm.SETTINGS["lastMidi_Out"] = (lastMidi_Out !== null) ? (lastMidi_Out) : null;
        PianoRhythm.SETTINGS["clientNQ"] = (enableClientNQ !== null) ? (enableClientNQ) : true;
        PianoRhythm.SETTINGS["VEL_METER"] = (velMeter !== null) ? (velMeter) : 5;
        PianoRhythm.SETTINGS["VEL_METER_ENABLED"] = (velMeterEnabled !== null) ? (velMeterEnabled) : true;
        PianoRhythm.SETTINGS["ENABLE_VELOCITY"] = (enableVelocity !== null) ? (enableVelocity) : true;
        PianoRhythm.SETTINGS["VEL_BOOST_ENABLED"] = (velBoostEnabled !== null) ? (velBoostEnabled) : true;
        PianoRhythm.SETTINGS["mouse_ShowMyCursor"] = (showMyCursor !== null) ? (showMyCursor) : true;
        PianoRhythm.SETTINGS["keepChatFocus"] = (keepChatFocus !== null) ? (keepChatFocus) : false;
        PianoRhythm.SETTINGS["mouse_ShowEveryoneCursor"] = (showEveryoneCursor !== null) ? (showEveryoneCursor) : true;
        PianoRhythm.SETTINGS["displayMiscChat"] = (miscChat !== null) ? miscChat : true;
        PianoRhythm.SETTINGS["displaySideMenu"] = (displaySideMenu !== null) ? displaySideMenu : true;
        PianoRhythm.DEBUG_MESSAGING = PianoRhythm.SETTINGS["logMessages"];
        if (PianoRhythm.DEBUG_MESSAGING)
            console.info("Settings loaded.");
        if (PianoRhythm.SETTINGS["autoLoginToken"] && window.localStorage.getItem("socketCluster.authToken"))
            PianoRhythm.LOGIN_ENTERED = true;
        PianoRhythm.SHOW_CURSOR = PianoRhythm.SETTINGS["mouse_ShowMyCursor"];
        PianoRhythm.SHOW_EVERYONES_CURSORS = PianoRhythm.SETTINGS["mouse_ShowEveryoneCursor"];
        PianoRhythm.SHOW_IM_AFK = PianoRhythm.SETTINGS["showImAfk"];
        PianoRhythm.ALWAYS_KEEP_CHAT_FOCUS = PianoRhythm.SETTINGS["keepChatFocus"];
        PianoRhythm.ENABLE_MOD = (PianoRhythm.SETTINGS["enableMod"]);
    }
    static initializeFPSMETER() {
        return;
        try {
            PianoRhythm.FPS_METER = new FPSMeter($("#fpsElement")[0], {
                top: "auto",
                left: "auto",
                right: "70px",
                bottom: "5px",
                "z-index": "1000",
                theme: "rgba(0,0,0,0)"
            });
            PianoRhythm.FPS_METER["element"] = $("#fpsElement");
            if (PianoRhythm.FPS_METER) {
                PianoRhythm.FPS_METER["element"].show();
            }
            console.warn(PianoRhythm.FPS_METER);
        }
        catch (err) {
            console.log(err, $("#fpsElement"));
        }
    }
    static chatMessageParsed(chat) {
        if (!chat)
            return;
        let extra = chat;
        let output = chat.output;
        let effect = chat.effect;
        if (GAMESTATE.initialized && GAMESTATE.ACTIVE_STATE === GAMESTATE.STATE_PREGAME) {
            let user = PianoRhythm.PLAYER_SOCKET_LIST.get(chat.sID);
            if (user && !chat.bot && chat.nameString && chat.parsedMessage && chat.parsedMessage.length < 100) {
                let slot = user["gameSlot"];
                if (slot) {
                    let img = slot.img;
                    if (img) {
                        let textWidth = PianoRhythm.getTextWidth(chat.from) + PianoRhythm.getTextWidth(chat.message) + (window.test2 || 75);
                        let target = $(img).parent();
                        let targetRect = target[0].getBoundingClientRect();
                        let at = ((targetRect.left + targetRect.width + textWidth) > window.innerWidth) ? "left" : "right";
                        let my = ("right") ? "left" : "right";
                        my += "bottom";
                        at += " top";
                        $(".gameChat_" + chat.sID).remove();
                        PianoRhythm.createGrowl(output, null, {
                            target: target,
                            width: textWidth,
                            style: "gameChat_" + chat.sID,
                            container: target,
                            my: my,
                            at: at,
                            lifeSpan: 3000,
                            showTip: false,
                            effectShow: (ev) => {
                                $(ev).addClass("Game_pointsbounce2").css({ display: "block" });
                            },
                            effectHide: (ev) => {
                                $(ev).animate({ opacity: 0 }, 250, 'swing');
                            },
                            adjust: {
                                x: window._x || -(targetRect.width / 2),
                                y: window._y || 20
                            },
                        });
                    }
                }
            }
        }
        output = PianoRhythm.replaceURLWithHTMLLinks(output, () => {
            if (!PianoRhythm.SETTINGS["suppress_link_warning"])
                return confirm('Be careful about opening external links! Are you really sure you want to open this link?');
        });
        let messageClass = (PianoRhythm.SETTINGS["chat_message_background"]) ? "message" : "message2";
        let chatmessage = $('<li class="' + messageClass + '" id="animateMessage">');
        if (extra && extra.time) {
            let result = new Date(extra.time);
            let dateString = (result.getMonth() + 1) + "/" + result.getDate() + "/" + result.getFullYear().toString().substr(2, 2);
            let timestamp = dateString + " | " + PianoRhythm.formatAMPM(result);
            chatmessage.attr("title", timestamp);
            chatmessage.qtip({
                style: {
                    classes: "qtip-light qtip_chatMessage"
                },
                position: {
                    my: "bottom center",
                    at: "top center"
                }
            });
        }
        if (PianoRhythm.CLIENT && PianoRhythm.CLIENT.name) {
            let regex = new RegExp("\\@" + PianoRhythm.CLIENT.name + "\\b", "i").test(output);
            if (regex) {
                chatmessage.css("background", "#FFEB3B");
                if (!PianoRhythm.TAB_VISIBLE) {
                    if (extra) {
                        let eMessage = (extra.from || "") + " : " + (extra.message || "No Message");
                        PianoRhythm.desktopNotify(eMessage);
                    }
                }
            }
        }
        let data = chatmessage.html((PianoRhythm.SETTINGS["autoConvertEmojis"] ? wdtEmojiBundle.render(output) : output));
        let nametag = $(data).find("#nameString");
        if (nametag && nametag.length) {
            nametag.click(() => {
                if (extra) {
                    if (PianoRhythm.SOCKET)
                        PianoRhythm.SOCKET.emit("mainProfileView", { userName: extra.name }, (err, results) => {
                            if (err)
                                return;
                            if (results && results.userName) {
                                try {
                                    PianoRhythm.setMainProfile({
                                        hasGifImageForProfile: results.hasGifImageForProfile,
                                        color: results.color,
                                        name: results.userName,
                                        nickname: results.nickname,
                                        level: results.level,
                                        rank: results.rank,
                                        points: results.points,
                                        status: results.status,
                                        rep: results.rep,
                                        accountID: results.accountID
                                    }, true);
                                }
                                catch (err) { }
                            }
                        });
                }
            });
        }
        if (effect && effect.length > 0) {
            switch (effect) {
                case "animateMarquee":
                    data = $('<marquee class="message" id="animateMessage" direction="right" style="width:40%">').html(output);
                    break;
            }
        }
        let scrollHeight = PianoRhythm.CMESSAGESUL[0].scrollHeight;
        let parent = PianoRhythm.CMESSAGESUL.parent();
        let scrollHeight2 = parent[0].scrollHeight;
        let scrollTop = PianoRhythm.CMESSAGESUL[0].scrollTop;
        if (PianoRhythm.CHAT_SETTINGS.totalMessages > PianoRhythm.CHAT_SETTINGS.maxMessages)
            PianoRhythm.CMESSAGESUL.children().first().remove();
        data.appendTo(PianoRhythm.CMESSAGESUL);
        if (scrollTop + PianoRhythm.CMESSAGESUL.innerHeight() >= scrollHeight) {
            PianoRhythm.CMESSAGESUL[0].scrollTop = PianoRhythm.CMESSAGESUL[0].scrollHeight;
            if (PianoRhythm.NEWMESSAGE.is(":visible"))
                PianoRhythm.NEWMESSAGE.css('visibility', 'hidden');
            PianoRhythm.CHAT_SETTINGS.oldMessages++;
        }
        else {
            PianoRhythm.CHAT_SETTINGS.newMessages = PianoRhythm.CHAT_SETTINGS.totalMessages - PianoRhythm.CHAT_SETTINGS.oldMessages + 1;
            if (PianoRhythm.CHAT_SETTINGS.newMessages > 0) {
                let messageOut = (PianoRhythm.CHAT_SETTINGS.newMessages === 1) ? " new message" : " new messages";
                PianoRhythm.NEWMESSAGE.text(" (" + PianoRhythm.CHAT_SETTINGS.newMessages + ")" + messageOut);
            }
            else {
                PianoRhythm.CMESSAGESUL[0].scrollTop = PianoRhythm.CMESSAGESUL[0].scrollHeight;
            }
        }
        PianoRhythm.CHAT_SETTINGS.totalMessages++;
    }
    ;
    static chatMessageToWorker(chat) {
        if (!chat)
            return;
        let socketID, id, bot, botOwner;
        if (chat.data && chat.data.sID)
            socketID = chat.data.sID;
        let user = PianoRhythm.PLAYER_SOCKET_LIST.get(socketID);
        let roomName = (chat.roomName) ? chat.roomName.toLowerCase() : "";
        let name = (chat.name) ? chat.name : "";
        if (user && user["nickname"])
            name = user["nickname"];
        let message = chat.message;
        let color = chat.color || PianoRhythm.stringToColour(name);
        let time;
        if (chat.data)
            time = chat.data.time;
        if (chat.data && chat.data.id)
            id = chat.data.sID;
        if (chat.data && chat.data.bot)
            bot = chat.data.bot;
        if (chat.data && chat.data.botOwner)
            botOwner = chat.data.botOwner;
        let nameString = "<b id='nameString' class='messageChat'  style=color:" + color + ">" + name + "</b>";
        if (bot) {
            nameString = ('<bot title="' + botOwner + '\'s Bot' + '"class="botTag">BOT</bot>') + nameString;
            if (!PianoRhythm.ROOM_SETTINGS.ALLOW_BOT_MESSAGES)
                return;
        }
        nameString = (name !== "") ? nameString + ":" : "";
        if (PianoRhythm.MIDI_WORKER) {
            PianoRhythm.MIDI_WORKER.postMessage({
                type: "parseMessageToHTML", data: {
                    nameString: nameString,
                    message: message,
                    from: name,
                    name: chat.name,
                    roomName: roomName,
                    time: time,
                    sID: socketID,
                    id: id,
                    bot: bot
                }
            });
        }
    }
    static chatMessage(data) {
        PianoRhythm.chatMessageToWorker({
            roomName: data.roomName,
            name: data.name,
            message: data.message,
            modify: data.modify,
            autoScroll: data.autoScroll,
            color: data.color,
            data: data.data,
            bot: data.bot
        });
    }
    static receiveServerTime(time) {
        let now = Date.now();
        let target = time - now;
        let duration = 1000;
        let step = 0;
        let steps = 50;
        let step_ms = duration / steps;
        let difference = target - PianoRhythm.serverTimeOffset;
        let inc = difference / steps;
        let iv;
        iv = setInterval(function () {
            PianoRhythm.serverTimeOffset += inc;
            if (++step >= steps) {
                clearInterval(iv);
                PianoRhythm.serverTimeOffset = target;
            }
        }, step_ms);
    }
    static setKeyboardLayout(layout = Piano_1.KEYBOARD_LAYOUT.MPP) {
        if (typeof layout == "number")
            PianoRhythm.ROOM_SETTINGS.KB_LAYOUT = layout;
        else if (typeof layout == "string") {
            switch (layout) {
                default:
                case "MPP":
                    PianoRhythm.ROOM_SETTINGS.KB_LAYOUT = Piano_1.KEYBOARD_LAYOUT.MPP;
                    break;
                case "VIRTUAL_PIANO":
                    PianoRhythm.ROOM_SETTINGS.KB_LAYOUT = Piano_1.KEYBOARD_LAYOUT.VIRTUAL_PIANO;
                    break;
                case "PIANORHYTHM":
                    PianoRhythm.ROOM_SETTINGS.KB_LAYOUT = Piano_1.KEYBOARD_LAYOUT.PIANORHYTHM;
                    break;
            }
        }
    }
    static socket_HandleChat(data) {
        if (data && data.type) {
            let user, userli;
            if (data.sID || data.socketID) {
                user = PianoRhythm.PLAYER_SOCKET_LIST.get(data.sID || data.socketID);
                if (user)
                    userli = user["userLI"];
            }
            switch (data.type) {
                case "chat":
                    if (data && data.message) {
                        let name = data.name || "";
                        let effect = data.effect || "";
                        let roomName = data.roomName;
                        let color = data.color;
                        let id = data.id;
                        if (data.notify)
                            PianoRhythm.notify(data.message);
                        if (id && name && name !== PianoRhythm.CLIENT.name) {
                            if (PianoRhythm.MUTED_CHAT_PLAYERS &&
                                PianoRhythm.MUTED_CHAT_PLAYERS.has(id))
                                return;
                        }
                        if (data.id === undefined && !PianoRhythm.SETTINGS["displayMiscChat"])
                            return;
                        if (data.bot && !PianoRhythm.SETTINGS["allow_bot_messages"])
                            return;
                        if (PianoRhythm.EVENT_EMITTER) {
                            PianoRhythm.EVENT_EMITTER.emit("bot_chatMessage", data);
                        }
                        PianoRhythm.chatMessage({
                            roomName: roomName,
                            name: name,
                            message: data.message,
                            effect: effect,
                            modify: null,
                            color: color,
                            data: data
                        });
                    }
                    break;
                case "isTyping":
                    {
                        if (data) {
                            let value = data.value;
                            let uuid = data.uuid;
                            let sID = data.id;
                            let name = (user && user["nickname"]) ? user["nickname"] : data.name;
                            if (sID === PianoRhythm.SOCKET.id)
                                return;
                            if (uuid) {
                                if (PianoRhythm.MUTED_CHAT_PLAYERS &&
                                    PianoRhythm.MUTED_CHAT_PLAYERS.has(uuid))
                                    return;
                            }
                            if (name && sID && value !== undefined) {
                                let index = PianoRhythm.WHO_IS_TYPING.indexOf(name);
                                if (index === -1) {
                                    if (value)
                                        PianoRhythm.WHO_IS_TYPING.push(name);
                                }
                                else {
                                    if (!value)
                                        PianoRhythm.WHO_IS_TYPING.splice(index, 1);
                                }
                                PianoRhythm.displayTypers();
                            }
                            if (PianoRhythm.EVENT_EMITTER) {
                                PianoRhythm.EVENT_EMITTER.emit("bot_isTyping", data);
                            }
                        }
                    }
                    break;
                case "playerColorUpdate":
                    {
                        if (PianoRhythm.DEBUG_MESSAGING)
                            console.log("PLAYER COLOR UPDATE", data);
                        if (data.socketID && data.name && data.color && user) {
                            PianoRhythm.PLAYER_SOCKET_LIST_SET(data.socketID, "color", data.color);
                            if (data.socketID === PianoRhythm.CLIENT.id) {
                                PianoRhythm.CLIENT.color = data.color;
                                if (PianoRhythm.RhythmBlobFactory) {
                                    var blob = PianoRhythm.RhythmBlobFactory.getClientBlob();
                                    if (blob) {
                                        blob.color = PianoRhythm.CLIENT.color;
                                    }
                                }
                            }
                            if (userli) {
                                let userImg = userli["img"];
                                if (userImg && userImg.length)
                                    userImg.css("border-color", data.color);
                            }
                            let mouse = user["mouse"];
                            if (mouse && mouse.nameElement) {
                                mouse.nameElement[0].style.background = data.color;
                                mouse.profile.img[0].style.borderColor = data.color;
                                mouse.profile.inst_name[0].style.background = data.color;
                            }
                            if (PianoRhythm.EVENT_EMITTER) {
                                PianoRhythm.EVENT_EMITTER.emit("bot_playerColorUpdate", data);
                            }
                        }
                    }
                    break;
                case "userlistUpdate":
                    PianoRhythm.userlistUpdate(data);
                    break;
                case "removePlayer":
                    if (data && data.player) {
                        let name = data.player.name;
                        let id = data.player.id;
                        let sID = data.player.socketID;
                        PianoRhythm.destroyUserLI(sID);
                        if (PianoRhythm.RhythmBlobFactory && PianoRhythm.RhythmBlobFactory.deleteBlob)
                            PianoRhythm.RhythmBlobFactory.deleteBlob(sID);
                        if (PianoRhythm.EVENT_EMITTER) {
                            PianoRhythm.EVENT_EMITTER.emit("bot_removePlayer", data);
                        }
                    }
                    break;
                case "roomUpdate":
                    if (data && data.list) {
                        if (PianoRhythm.DEBUG_MESSAGING)
                            console.log("ROOM UPDATE EVENT", data.list);
                        let name = data.list.name;
                        let count = data.list.count;
                        let prefix = data.list.prefix;
                        let type = data.list.type;
                        let owner = data.list.owner;
                        let roomID = data.list.roomID;
                        let onlyHost = data.list.onlyHost;
                        let hasPassword = data.list.hasPassword;
                        let maxPlayers = data.list.maxPlayers;
                        let instruments = data.list.instruments;
                        let slotsLocked = data.list.slotsLocked;
                        let slotsMode = data.list.slotsMode;
                        let latency = data.list.highestLatency;
                        let allowRecording = data.list.allowRecording;
                        let allowedTool = data.list.allowedTool;
                        let allowedKBLayout = data.list.allowedKBLayout;
                        if (name === undefined && PianoRhythm.CLIENT) {
                            PianoRhythm.ROOM_HIGHEST_LATENCY = latency || 0;
                            return;
                        }
                        let index = PianoRhythm.PLAYER_ROOM_LIST.has(roomID);
                        let existingRoom = PianoRhythm.ROOMLIST.find("[data-id='" + roomID + "']");
                        if (PianoRhythm.CLIENT) {
                            if (allowedKBLayout !== null && allowedKBLayout !== undefined) {
                                PianoRhythm.setKeyboardLayout(allowedKBLayout);
                            }
                            PianoRhythm.ROOM_SETTINGS.ALLOW_RECORDING = allowRecording;
                            if ((owner && roomID) && roomID === PianoRhythm.CLIENT.roomID) {
                                PianoRhythm.ownerOfRoom(owner, data.list);
                                if (owner === PianoRhythm.CLIENT.socketID && PianoRhythm.ROOM_OWNER_ID !== PianoRhythm.CLIENT.socketID)
                                    PianoRhythm.notify({
                                        message: "You are now the new owner of this room(" + name + ")!"
                                    });
                                PianoRhythm.ROOM_OWNER_ID = owner;
                                $(".crownImage").remove();
                                PianoRhythm.setCrown(owner);
                            }
                            if (owner !== PianoRhythm.CLIENT.id)
                                PianoRhythm.loadRoom(data.list, slotsMode, instruments);
                            if (onlyHost) {
                                PianoRhythm.ONLY_HOST = true;
                                if (PianoRhythm.ONLY_HOST_MESSAGE === null)
                                    PianoRhythm.ONLY_HOST_MESSAGE = PianoRhythm.onlyHostCanPlayGrowl();
                            }
                            else {
                                if (PianoRhythm.ONLY_HOST_MESSAGE) {
                                    $('.qtip_onlyHost').qtip('destroy', true);
                                    PianoRhythm.ONLY_HOST_MESSAGE = null;
                                }
                                PianoRhythm.ONLY_HOST = false;
                            }
                        }
                        if (existingRoom && existingRoom.length !== 0 && index) {
                            if (data.remove) {
                                if (existingRoom) {
                                    PianoRhythm.destroyRoomLI(roomID);
                                }
                            }
                            else {
                                let roomText = existingRoom.children().first().text();
                                if (roomText.indexOf("(") > -1)
                                    existingRoom.children().first().text("(" + count + ")");
                                else
                                    existingRoom.children().first().text(count + "/" + maxPlayers);
                                if (hasPassword) {
                                    let img = $("<img>");
                                    img.attr("src", "/images/icons/essential/locked-4.png");
                                    img.attr("title", "This room is password protected!");
                                    img.css({
                                        position: "absolute",
                                        width: "18px",
                                        top: "32px",
                                        left: "163px",
                                        "z-index": "1"
                                    });
                                    img.qtip();
                                    existingRoom.append(img);
                                }
                                else {
                                    let pImg = existingRoom.find("img");
                                    if (pImg.length)
                                        pImg.remove();
                                }
                            }
                        }
                        else {
                            if (name && count) {
                                let roomColor;
                                if (prefix === undefined)
                                    roomColor = PianoRhythm.COLORS.roomColor_Lobby;
                                let roomLI = PianoRhythm.createRoomLI(name, count, roomColor, type, {
                                    owner: owner,
                                    hasPassword: hasPassword,
                                    maxPlayers: maxPlayers,
                                    id: roomID
                                });
                                roomLI.appendTo(PianoRhythm.ROOMLIST).hide().fadeIn(1000);
                                PianoRhythm.PLAYER_ROOM_LIST.set(roomID, data.list);
                            }
                        }
                    }
                    break;
                case "turnQueue":
                    if (data.allowTurnQueue) {
                        if (data.turn_currentPlayer)
                            PianoRhythm.ROOM_CURRENT_TURN_ID = data.turn_currentPlayer;
                        if (data.name) {
                            if (PianoRhythm.ROOM_CURRENT_TURN_MESSAGE === null) {
                                PianoRhythm.ROOM_CURRENT_TURN_MESSAGE = PianoRhythm.turnQueueGrowl(data.name);
                            }
                            else {
                                PianoRhythm.ROOM_CURRENT_TURN_MESSAGE.qtip('option', 'content.text', "Current Turn: " + data.name);
                                PianoRhythm.ROOM_CURRENT_TURN_MESSAGE["turn_name"] = data.name;
                            }
                        }
                        if (data.time) {
                            if (PianoRhythm.ROOM_CURRENT_TURN_MESSAGE) {
                                PianoRhythm.ROOM_CURRENT_TURN_MESSAGE.qtip('option', 'content.text', "Current Turn: " +
                                    PianoRhythm.ROOM_CURRENT_TURN_MESSAGE["turn_name"] + " | Time Left: " + data.time);
                            }
                            return;
                        }
                    }
                    if (!data.name || !data.allowTurnQueue) {
                        if (PianoRhythm.ROOM_CURRENT_TURN_MESSAGE) {
                            $('.qtip_turnQueue').qtip('destroy', true);
                            PianoRhythm.ROOM_CURRENT_TURN_MESSAGE = null;
                        }
                        PianoRhythm.ROOM_CURRENT_TURN_ID = null;
                    }
                    break;
                case "roleChange":
                    if (data) {
                        if (data.otherAttr && data.otherAttrType) {
                            switch (data.otherAttrType.toLowerCase()) {
                                case "role":
                                    if (user && userli) {
                                        let divrole = userli["divRole"];
                                        if (divrole && divrole.length) {
                                            let role2 = data.otherAttr.newRole;
                                            if (role2 <= user_1.UserType.USER) {
                                                divrole.css("opacity", 0);
                                                if (user) {
                                                    if (user["guest"])
                                                        role2 = user_1.UserType.GUEST;
                                                    else
                                                        role2 = user_1.UserType.USER;
                                                }
                                            }
                                            else {
                                                divrole.css({
                                                    opacity: 1,
                                                    background: PianoRhythm.ROLE_COLORS.get(user_1.UserType[role2])
                                                });
                                                divrole.html(user_1.UserType[role2]);
                                            }
                                            PianoRhythm.PLAYER_SOCKET_LIST_SET(data.sID, "role", role2);
                                            PianoRhythm.USERLIST_SORT();
                                        }
                                    }
                                    break;
                                default:
                                    break;
                            }
                            if (PianoRhythm.EVENT_EMITTER) {
                                PianoRhythm.EVENT_EMITTER.emit("bot_playerRoleChange", data);
                            }
                        }
                    }
                    break;
                case "roomlistUpdate":
                    PianoRhythm.roomlistUpdate(data);
                    break;
                case "notify":
                    if (data) {
                        PianoRhythm.notify({
                            message: data.message,
                            time: data.time || 10000
                        });
                        if (!PianoRhythm.TAB_VISIBLE)
                            PianoRhythm.desktopNotify(data.message);
                    }
                    break;
                case 'profileImageUpdate':
                    if (data && data.ext) {
                        if (data.id && user) {
                            let li = user["userLI"];
                            if (li && li.length) {
                                let li_img = li["img"];
                                if (li_img && li_img.length)
                                    li_img.attr("src", "./profile_images/" + data.username + "/profile." + data.ext + "?" + Date.now());
                            }
                            if (PianoRhythm.EVENT_EMITTER) {
                                PianoRhythm.EVENT_EMITTER.emit("bot_playerProfileImageUpdate", data);
                            }
                        }
                    }
                    break;
                case "dnotify":
                    if (data) {
                        PianoRhythm.desktopNotify(data.body, data.title, data.icon, data.other);
                    }
                    break;
                case "userStatus":
                    if (data) {
                        let status = data.status;
                        let color = "green";
                        switch (status) {
                            case user_1.UserStatus.ONLINE:
                                color = "green";
                                break;
                            case user_1.UserStatus.DO_NOT_DISTURB:
                                color = "red";
                                break;
                            case user_1.UserStatus.IDLE:
                                color = "yellow";
                                break;
                        }
                        if (user && userli) {
                            let meter = userli["meter"];
                            if (meter)
                                meter[0].style.background = color;
                            PianoRhythm.setUserStatus(status);
                        }
                    }
                    break;
                case "playerNicknameUpdate":
                    if (data) {
                        if (user && userli && data.nickname) {
                            let divName = userli["divName"];
                            if (PianoRhythm.SETTINGS["autoConvertEmojis"])
                                divName.html(wdtEmojiBundle.render(data.nickname));
                            else
                                divName.text(data.nickname);
                            user["nickname"] = data.nickname;
                            let mouse = user["mouse"];
                            if (mouse && mouse.nameElement) {
                                if (PianoRhythm.SETTINGS["autoConvertEmojis"])
                                    mouse.nameElement.html(wdtEmojiBundle.render(data.nickname));
                                else
                                    mouse.nameElement.text(data.nickname);
                            }
                        }
                    }
                    break;
                case "status":
                    if (data) {
                        if (user && data.status !== undefined) {
                            let status = "";
                            switch (data.status) {
                                case user_1.UserStatus.AFK:
                                    status = "AFK";
                                    break;
                                case -1:
                                    status = data.text;
                                    break;
                                default:
                                    status = "";
                                    break;
                            }
                            if (data.text && data.text.length > 0)
                                status = data.text;
                            if (userli) {
                                let statusText = userli["divStatus"];
                                if (statusText) {
                                    if (PianoRhythm.SETTINGS["autoConvertEmojis"])
                                        statusText.html(wdtEmojiBundle.render(status));
                                    else
                                        statusText.text(status);
                                }
                                PianoRhythm.PLAYER_SOCKET_LIST_SET(data.socketID, "status", status);
                            }
                            if (PianoRhythm.EVENT_EMITTER) {
                                PianoRhythm.EVENT_EMITTER.emit("bot_playerStatusUpdate", data);
                            }
                        }
                    }
                    break;
            }
        }
    }
    static socket_HandleMouse(data) {
        if (!PianoRhythm.SHOW_EVERYONES_CURSORS)
            return;
        if (data) {
            let x = data.mX;
            let y = data.mY;
            let id = data.id;
            let socketID = data.socketID;
            let type = data.type;
            let name = data.name;
            let color = data.color;
            if (PianoRhythm.CLIENT.blockedUsers && PianoRhythm.CLIENT.blockedUsers[id])
                return;
            let user = PianoRhythm.PLAYER_SOCKET_LIST.get(socketID);
            if (user) {
                let mouse = user["mouse"];
                if (mouse) {
                    switch (type.toLowerCase()) {
                        case "pos":
                            {
                                if ((Math.abs(x - mouse.displayX) > 0.1 || Math.abs(y - mouse.displayY) > 0.1)) {
                                    mouse.displayX += ((x - mouse.displayX) * 0.75);
                                    mouse.displayY += (y - mouse.displayY) * 0.75;
                                    mouse.update(mouse.displayX, mouse.displayY);
                                }
                            }
                            break;
                        case "remove":
                            mouse.hide();
                            break;
                        case "add":
                            mouse.show();
                            break;
                        case "instrument":
                            mouse.setInstrument(data.instrument);
                            break;
                    }
                }
                else if (data.type === "add") {
                    if (socketID && name && user["userLI"]) {
                        var added_mouse = new playerMouse(socketID, name, color, user["userLI"]);
                        if (data.instrument)
                            added_mouse.setInstrument(data.instrument);
                        added_mouse.Interpolater = new Interpolater({
                            trackSpeed: 25,
                            fraction: 0.5,
                            elements: { mouse: added_mouse },
                            step: function (data) {
                                if (data.object.lastX !== data.position.x || data.object.lastY !== data.position.y)
                                    data.object.setPosition(data.position.x, data.position.y);
                                if (data.object.checkForPlayerCollision)
                                    data.object.checkForPlayerCollision();
                            }
                        });
                    }
                }
            }
        }
    }
    static socket_HandleMidi(data) {
        if (data && data.uuid && data.id) {
            if (PianoRhythm.MUTED_NOTE_PLAYERS &&
                PianoRhythm.MUTED_NOTE_PLAYERS.has(data.id) || PianoRhythm.MUTED_NOTE_PLAYERS.has(data.uuid))
                return;
            let mod = (!PianoRhythm.TAB_VISIBLE) ? 1000 : 500;
            let t = data.t - (PianoRhythm.serverTimeOffset || 0) + mod - Date.now();
            if (data.n)
                for (let i = 0; i < data.n.length; i++) {
                    let note = data.n[i];
                    let ms = (t + (note.d || 0));
                    if (ms < 0) {
                        ms = 0;
                    }
                    else if (ms > 10000)
                        continue;
                    if (Piano_1.Piano.INSTRUMENTS[data.inst] && !Piano_1.Piano.INSTRUMENTS[data.inst].loaded)
                        data.inst = Piano_1.Piano.ACTIVE_INSTRUMENT;
                    if (Piano_1.Piano.INSTRUMENTS[note.inst] && !Piano_1.Piano.INSTRUMENTS[note.inst].loaded)
                        note.inst = Piano_1.Piano.ACTIVE_INSTRUMENT;
                    if (note.s) {
                        Piano_1.Piano.release({
                            note: note.n,
                            delay: ms,
                            emit: false,
                            instrumentName: note.inst || data.inst || Piano_1.Piano.ACTIVE_INSTRUMENT,
                            socketID: data.id,
                        }, true);
                    }
                    else {
                        let vel = (typeof note.v !== "undefined") ? parseFloat(note.v) : AudioEngine_1.AudioEngine.maxVelocity;
                        if (vel < 0)
                            vel = 0;
                        Piano_1.Piano.press({
                            emit: false,
                            note: note.n,
                            velocity: vel,
                            socketID: data.id,
                            delay: ms,
                            instrumentName: note.inst || data.inst || Piano_1.Piano.ACTIVE_INSTRUMENT,
                            color: data.color
                        }, false, true);
                    }
                }
        }
    }
    static socket_HandleAvatar(data) {
        if (data && data.type != null) {
            if (PianoRhythm.RhythmBlobFactory) {
                let avatar = PianoRhythm.RhythmBlobFactory.blobColl.blobsSet.get(data.socketID);
                switch (data.type) {
                    case "pos":
                        if (avatar) {
                            let x = (parseFloat(data.mX2) / 100) * PianoRhythm.RhythmBlobFactory.canvasWidth();
                            let y = (parseFloat(data.mY2) / 100) * PianoRhythm.RhythmBlobFactory.canvasHeight();
                            var rect = PianoRhythm.RhythmBlobFactory.canvas.getBoundingClientRect();
                            let x2 = (x - rect.left) / PianoRhythm.RhythmBlobFactory.scaleFactor;
                            let y2 = (y - rect.top) / PianoRhythm.RhythmBlobFactory.scaleFactor;
                            avatar.moveTo(x2, y2);
                            PianoRhythm.RhythmBlobFactory.blobColl.BlobMoveTo(avatar, x, y);
                            console.log(avatar.x, x, x2, data.rect_left);
                        }
                        break;
                    case "pos2":
                        break;
                    case "pos3":
                        break;
                    case "pos4":
                        break;
                }
            }
        }
    }
    static setCrown(owner) {
        if (!owner)
            return;
        if (PianoRhythm.ROOM_OWNER_ID !== owner)
            return;
        if (PianoRhythm.crownImage) {
            PianoRhythm.crownImage[0].remove();
            PianoRhythm.crownImage = null;
        }
        let playerLI = PianoRhythm.PLAYERLIST_UL.find("[socketID='" + owner + "']");
        if (playerLI) {
            let crownImg = $("<img>");
            crownImg.attr("src", "/images/crown.png");
            crownImg.css({
                position: "absolute",
                width: "60px",
                top: "-14px",
                left: "17px",
                transform: "rotateZ(37deg)",
                "z-index": 1
            });
            crownImg.addClass("crownImage");
            let playerLI_name = playerLI.find("div[id^='userLI_']");
            if (playerLI_name) {
                crownImg.attr("title", playerLI_name.text() + " is the room owner!");
                crownImg.qtip();
            }
            playerLI.prepend(crownImg);
            PianoRhythm.crownImage = crownImg;
        }
    }
    static connect(login = true) {
        PianoRhythm.SOCKET = socketCluster.connect({
            port: PianoRhythm.USE_SSL ? PianoRhythm.SSL_PORT : PianoRhythm.PORT,
            autoReconnect: true,
        });
        if (PianoRhythm.SOCKET) {
            PianoRhythm.initializeSocketEvents();
            let roomName = (window.location.pathname.length > 1) ?
                window.location.pathname : "lobby";
            roomName = (roomName.indexOf("/") > -1) ?
                roomName.substring(1, roomName.length).trim() : roomName;
            PianoRhythm.SOCKET.emit("enableCursor", {
                enable: PianoRhythm.SHOW_CURSOR
            });
            PianoRhythm.SOCKET.emit("enableAuthLogin", {
                enable: PianoRhythm.SETTINGS["autoLoginToken"],
                roomName: roomName
            });
            if (login) {
                PianoRhythm.initialLogin();
            }
            else
                PianoRhythm.SOCKET.emit('register', {
                    name: "Guest",
                    roomName: roomName
                });
        }
    }
    static pingInterval() {
        console.info("Initialize - Pinging PianoRhythm...");
        if (PianoRhythm.SETTINGS["displayPING"] && PianoRhythm.PING_OBJ)
            PianoRhythm.PING_OBJ.show();
        clearInterval(PianoRhythm.STATS_INTERVAL);
        PianoRhythm.STATS_INTERVAL = setInterval(() => {
            if (!PianoRhythm.LOGIN_ENTERED && Piano_1.Piano.INITIALIZED) {
                clearInterval(PianoRhythm.STATS_INTERVAL);
                if (PianoRhythm.PING_OBJ)
                    PianoRhythm.PING_OBJ[0].textContent = "Ping: 0";
            }
            let startTime = Date.now();
            if (PianoRhythm.SOCKET) {
                PianoRhythm.SOCKET.emit("ping", null, (err, res) => {
                    if (res) {
                        PianoRhythm.PING = Date.now() - startTime;
                        if (PianoRhythm.PING_OBJ && PianoRhythm.PING_OBJ.length) {
                            PianoRhythm.PING_OBJ[0].textContent = "Ping: " + PianoRhythm.PING;
                        }
                        PianoRhythm.receiveServerTime(res);
                    }
                });
                PianoRhythm.SOCKET.emit("playersOnline");
            }
        }, 2000);
    }
    static saveRoomSettings(data) {
        if (!data)
            return;
        PianoRhythm.saveSetting("ROOM", "SETTINGS", JSON.stringify(data));
    }
    static deleteRoomSettings() {
        PianoRhythm.deleteSetting("Global_Settings_ROOM");
    }
    static initializeSocketEvents() {
        PianoRhythm.SOCKET.on("set2FA", function (data) {
            console.log("QR CODE", data);
            let div = $("<div>");
            div.attr("id", "qrcode_div");
            console.log("2FA", data);
            let box2FA = new BasicBox({
                id: "PR_ENABLE_2FA", height: 325, width: 500,
                title: "Two Factor Authentication - Please enter the code",
                color: "rgba(0,0,0,0.5)"
            });
            box2FA.box.css({
                "border": "4px solid white",
                "border-radius": "15px",
                "display": ""
            });
            box2FA.show();
            box2FA.createHeader({
                marginTop: "0px",
                icon_css: {
                    "margin-top": "5px"
                },
                onClose: () => {
                    if (PianoRhythm.SOCKET)
                        PianoRhythm.SOCKET.emit('set2FA', false);
                    box2FA.remove();
                    box2FA.destroyed = true;
                    PianoRhythm.dimPage(false);
                }
            });
            box2FA.box.append(div);
            let input = box2FA.addInput({
                type: "input",
                type2: "text",
                css: {
                    "width": "85%"
                }
            });
            let submitButton = BasicBox.createButton("Submit Code", () => {
                let val = (input["input"]) ? input["input"].val() : null;
                console.log("VAL", val);
                if (PianoRhythm.SOCKET)
                    PianoRhythm.SOCKET.emit('set2FA', val);
                box2FA.remove();
                box2FA.destroyed = true;
                PianoRhythm.dimPage(false);
            }, {
                "flex-grow": "1",
                "padding-left": "35%",
                "display": "inline-block",
                "margin-top": 15
            });
            submitButton.button.css({
                "background-color": PianoRhythm.COLORS.base4
            });
            box2FA.box.append(submitButton);
            box2FA.center3();
            PianoRhythm.BODY.append(box2FA.box);
            new QRCode(document.getElementById("qrcode_div"), {
                text: data,
                width: 150,
                height: 150
            });
        });
        PianoRhythm.SOCKET.on("enable2FA", function (data) {
        });
        PianoRhythm.SOCKET.emit("playersOnline");
        PianoRhythm.SOCKET.on("authTokenLogin", (data) => {
            if (data && data.failed) {
                PianoRhythm.LOGIN_ENTERED = false;
                return;
            }
            PianoRhythm.LOGIN_ENTERED = true;
            if (PianoRhythm.SETTINGS["autoLoginToken"] === false)
                return;
            var session = PianoRhythm.loadSessionSetting("GENERAL", "autoLoginToken");
            if (session === false)
                return;
            PianoRhythm.login(null);
            PianoRhythm.AUTH_TOKEN = null;
            if (PianoRhythm.CLIENT) {
                PianoRhythm.CLIENT.loggedIn = true;
            }
        });
        PianoRhythm.SOCKET.on("VERSION", function (data) {
            if (data && data.version) {
                PianoRhythm.VERSION = data.version;
                $("#displayVersion").text("[Alpha] " + PianoRhythm.VERSION);
                if (PianoRhythm.DEBUG_MESSAGING)
                    console.info("PianoRhythm Version: %c" + data.version, "color:blue");
                let lastVersion = PianoRhythm.loadSetting("VERSION", "version");
                let showedUplink = PianoRhythm.loadSetting("VERSION", "showedUplink");
                $(document).off('click');
                if (lastVersion) {
                    if (lastVersion !== data.version) {
                        PianoRhythm.notify("PianoRhythm has been updated to: " + data.version + "!");
                    }
                    else {
                        PianoRhythm.saveSetting("VERSION", "showedUplink", true);
                    }
                }
                else {
                }
                PianoRhythm.saveSetting("VERSION", "version", data.version);
            }
        });
        PianoRhythm.SOCKET.on("connect", function () {
            let roomName = (window.location.pathname.length > 1) ?
                window.location.pathname : "lobby";
            roomName = (roomName.indexOf("/") > -1) ?
                roomName.substring(1, roomName.length).trim() : roomName;
            console.info("%cConnected to PianoRhythm server! ", "color:green");
            PianoRhythm.CLIENT = new user_1.User({
                name: PianoRhythm.OFFLINE_NAME || "Guest",
                sID: PianoRhythm.SOCKET.id,
                id: PianoRhythm.SOCKET.id,
                color: PianoRhythm.stringToColour("Guest")
            });
            if (PianoRhythm.DEBUG_MESSAGING)
                console.info("PianoRhythm CLIENT successfully created!", PianoRhythm.CLIENT);
            if (PianoRhythm.STATE == IO_STATE.DISCONNECTED) {
                var rod = PianoRhythm.loadSessionSetting("rod", "rod");
                if (rod !== null && (PianoRhythm.CLIENT_FOCUS !== CLIENT_FOCUS.LOGIN && PianoRhythm.CLIENT_FOCUS !== CLIENT_FOCUS.REGISTER)) {
                    rod.rod = true;
                    rod.lr = PianoRhythm.loadSessionSetting("DISCONNECT", "lr");
                    PianoRhythm.SOCKET.emit("rod", rod, (error, callbackData) => {
                        if (error) {
                            if (PianoRhythm.CLIENT_FOCUS !== CLIENT_FOCUS.LOGIN)
                                PianoRhythm.SOCKET.emit('register', {
                                    id: PianoRhythm.CLIENT.id,
                                    name: PianoRhythm.CLIENT.name,
                                    roomName: roomName
                                });
                            return;
                        }
                        PianoRhythm.CLIENT.loggedIn = true;
                    });
                }
                else {
                    if (PianoRhythm.CLIENT_FOCUS !== CLIENT_FOCUS.LOGIN && PianoRhythm.CLIENT_FOCUS !== CLIENT_FOCUS.REGISTER) {
                        PianoRhythm.SOCKET.emit('register', {
                            id: PianoRhythm.CLIENT.id,
                            name: PianoRhythm.CLIENT.name,
                            roomName: roomName
                        });
                    }
                }
            }
            PianoRhythm.STATE = IO_STATE.CONNECTED;
            PianoRhythm.LOGIN_STATUS.text("Status: Connected to PianoRhythm.");
            PianoRhythm.LOGIN_STATUS.css("color", "white");
        });
        PianoRhythm.SOCKET.on("error", function (err) {
            if (PianoRhythm.DEBUG_MESSAGING)
                console.error("Socket Connection Error: ", err);
            PianoRhythm.disconnect(PianoRhythm.OFFLINE_MODE, true);
        });
        PianoRhythm.SOCKET.on("noteQuotaUpdate", function (data) {
            if (data && Piano_1.Piano.NOTE_QUOTA) {
                if (PianoRhythm.DEBUG_MESSAGING)
                    console.info("NOTE QUOTA UPDATE", data);
                if (data.maxPoints) {
                    Piano_1.Piano.NOTE_QUOTA.maxPoints = data.maxPoints;
                    Piano_1.Piano.NOTE_QUOTA.points = data.maxPoints;
                    Piano_1.Piano.NOTE_QUOTA.history = [data.maxPoints];
                }
                if (data.allowance) {
                    Piano_1.Piano.NOTE_QUOTA.allowance = data.allowance;
                }
            }
        });
        PianoRhythm.SOCKET.on("roomlistUpdate", function (data) {
            if (PianoRhythm.CLIENT === undefined)
                return;
            PianoRhythm.roomlistUpdate(data);
        });
        PianoRhythm.SOCKET.on("userlistUpdate", function (data) {
            PianoRhythm.userlistUpdate(data);
        });
        PianoRhythm.SOCKET.on('disconnect', function (err) {
            if (PianoRhythm.DEBUG_MESSAGING)
                console.error("Socket Disconnect: ", err);
            PianoRhythm.disconnect(PianoRhythm.OFFLINE_MODE, true);
        });
        PianoRhythm.SOCKET.on("setColor", function (data) {
            if (data && data.color) {
                if (PianoRhythm.CLIENT) {
                    PianoRhythm.CLIENT.color = data.color;
                    if (PianoRhythm.RhythmBlobFactory) {
                        var blob = PianoRhythm.RhythmBlobFactory.getClientBlob();
                        if (blob) {
                            blob.color = PianoRhythm.CLIENT.color;
                        }
                    }
                }
            }
        });
        function replyTOS(msg) {
            PianoRhythm.SOCKET.emit("TOS", msg);
            PianoRhythm.TOS.remove();
            PianoRhythm.dimPage(false);
            PianoRhythm.TOS = null;
            $(".loginPage").css("filter", "");
        }
        PianoRhythm.SOCKET.on("TOS", function (data) {
            console.log("TOS", data, PianoRhythm.LOGIN_ENTERED);
            if (Piano_1.Piano.INITIALIZED && PianoRhythm.LOGIN_ENTERED)
                return;
            if (data && data.reply === "success") {
                if (!PianoRhythm.LOGIN_ENTERED)
                    PianoRhythm.displayMainContent();
                return;
            }
            $(".loginPage").css("filter", "blur(3px)");
            if (PianoRhythm.PING_OBJ)
                PianoRhythm.PING_OBJ.text("Ping: 0");
            if (PianoRhythm.loadBar)
                PianoRhythm.loadBar.hide();
            if (PianoRhythm.loadingTimer)
                clearInterval(PianoRhythm.loadingTimer);
            PianoRhythm.showTOS().then(() => {
                console.log("SHOW MAIN CONTENT", PianoRhythm.LOGIN_ENTERED, data);
                if (!PianoRhythm.LOGIN_ENTERED && !data)
                    PianoRhythm.displayMainContent();
                replyTOS("accept");
            }, () => {
                replyTOS("decline");
            });
        });
        PianoRhythm.SOCKET.on("chatMessage", function (data) {
            if (PianoRhythm.CLIENT === undefined)
                return;
            if (PianoRhythm.CLIENT === null)
                return;
            if (typeof data.type === "undefined")
                if (data && data.message) {
                    if (data.whisper && data.from) {
                        PianoRhythm.LAST_WHISPERER = data.from;
                    }
                    let name = data.name || "";
                    let effect = data.effect || "";
                    let roomName = data.roomName;
                    let color = data.color;
                    if (data.notify)
                        PianoRhythm.notify(data.message);
                    if (PianoRhythm.DEBUG_MESSAGING)
                        console.info("Server Chat Message: ", data);
                    PianoRhythm.chatMessage({
                        roomName: roomName,
                        name: name,
                        message: data.message,
                        effect: effect,
                        modify: null,
                        color: color,
                        data: data
                    });
                }
        });
        PianoRhythm.SOCKET.on("setRoom", function (data, callback) {
            if (!PianoRhythm.SOCKET)
                return;
            if (data && data.roomID) {
                if (!PianoRhythm.CLIENT) {
                    PianoRhythm.SOCKET.emit("roomSet", false);
                    return;
                }
                clearInterval(PianoRhythm.MOUSE_INTERVAL);
                try {
                    if (PianoRhythm.CLIENT && PianoRhythm.CLIENT.roomID !== undefined) {
                        PianoRhythm.SOCKET.destroyChannel(PianoRhythm.CLIENT.roomID);
                        PianoRhythm.SOCKET.destroyChannel("midi_" + PianoRhythm.CLIENT.roomID);
                        PianoRhythm.SOCKET.destroyChannel("mouse_" + PianoRhythm.CLIENT.roomID);
                        PianoRhythm.SOCKET.destroyChannel("game_" + PianoRhythm.CLIENT.roomID);
                        PianoRhythm.SOCKET.destroyChannel("avatar_" + PianoRhythm.CLIENT.roomID);
                    }
                }
                catch (err) {
                }
                if (data.newRoom && PianoRhythm.CLIENT) {
                    if (PianoRhythm.DEBUG_MESSAGING)
                        console.info("Set Room: ", data);
                    if (PianoRhythm.LOGIN_ENTERED) {
                        PianoRhythm.transition("Entering " + data.newRoom, null, null, 500, 500);
                    }
                    if (PianoRhythm.loginTimeout) {
                        $('.registration-form').fadeOut();
                        PianoRhythm.CLIENT.loggedIn = true;
                        PianoRhythm.loginTimeout = false;
                        PianoRhythm.login(null);
                    }
                    PianoRhythm.CMESSAGESUL.empty();
                    PianoRhythm.PLAYERLIST_UL.empty();
                    PianoRhythm.PLAYER_SOCKET_LIST.clear();
                    PianoRhythm.CHAT_SETTINGS.totalMessages = 0;
                    PianoRhythm.CHAT_SETTINGS.oldMessages = 0;
                    PianoRhythm.CHAT_SETTINGS.newMessages = 0;
                    if (GAMESTATE.initialized)
                        GAMESTATE.reset();
                    $('.qtip_chatMessage').qtip('destroy', true);
                    PianoRhythm.updateURL(data.newRoom);
                    PianoRhythm.WHOISTYPING.text("");
                    PianoRhythm.WHO_IS_TYPING = [];
                    playerMouse.MOUSES.map((val) => {
                        val.remove();
                    });
                    $(".mouse_cursor").remove();
                    document.title = "PianoRhythm: " + data.newRoom;
                    if (data.owner) {
                        PianoRhythm.ROOM_OWNER_ID = data.owner;
                    }
                    if (data.newRoom)
                        PianoRhythm.CLIENT.roomName = data.newRoom;
                    if (PianoRhythm.NEW_ROOM_INSTRUMENT_SELECT) {
                        PianoRhythm.NEW_ROOM_INSTRUMENT_SELECT.val([Piano_1.Piano.DEFAULT_INSTRUMENT]).trigger("change");
                    }
                    PianoRhythm.CLIENT.roomID = data.roomID;
                    PianoRhythm.chatChannel = PianoRhythm.SOCKET.subscribe(data.roomID);
                    PianoRhythm.chatChannel.watch(PianoRhythm.socket_HandleChat);
                    PianoRhythm.midiChannel = PianoRhythm.SOCKET.subscribe("midi_" + data.roomID);
                    PianoRhythm.midiChannel.watch(PianoRhythm.socket_HandleMidi);
                    PianoRhythm.gameChannel = PianoRhythm.SOCKET.subscribe("game_" + data.roomID);
                    PianoRhythm.gameChannel.watch((data) => {
                        if (data) {
                            if (data.type) {
                                if (GAMESTATE.initialized) {
                                    GAMESTATE.PARSE_DATA(data);
                                }
                            }
                        }
                    });
                    PianoRhythm.mouseChannel = PianoRhythm.SOCKET.subscribe("mouse_" + data.roomID);
                    PianoRhythm.mouseChannel.watch(PianoRhythm.socket_HandleMouse);
                    PianoRhythm.avatarChannel = PianoRhythm.SOCKET.subscribe("avatar_" + data.roomID);
                    PianoRhythm.avatarChannel.watch(PianoRhythm.socket_HandleAvatar);
                    setTimeout(() => {
                        if (PianoRhythm.mouseChannel)
                            PianoRhythm.mouseChannel.publish({
                                id: PianoRhythm.CLIENT.id,
                                socketID: PianoRhythm.SOCKET.id,
                                name: PianoRhythm.CLIENT.name,
                                color: PianoRhythm.CLIENT.color,
                                instrument: Piano_1.Piano.ACTIVE_INSTRUMENT || Piano_1.Piano.DEFAULT_INSTRUMENT,
                                type: (PianoRhythm.SHOW_CURSOR) ? "add" : "remove"
                            });
                    }, 1500);
                    if (PianoRhythm.getMousePosition)
                        PianoRhythm.MOUSE_INTERVAL = setInterval(PianoRhythm.getMousePosition, 60);
                    if (PianoRhythm.ROOM_CURRENT_TURN_MESSAGE)
                        PianoRhythm.chatMessage({ name: "Server", message: "Type /join to get a turn to play! You can still play locally but others won't hear you play until it's your turn.", });
                }
            }
        });
        PianoRhythm.SOCKET.on('redirect', function (destination) {
            window.location.href = destination;
        });
        PianoRhythm.SOCKET.on("setName", function (data) {
            if (!PianoRhythm.CLIENT)
                return;
            if (data && data.name) {
                PianoRhythm.CLIENT.name = data.name;
                if (data.id)
                    PianoRhythm.CLIENT.id = data.id;
                PianoRhythm.CLIENT.color = PianoRhythm.stringToColour(data.name);
                if (PianoRhythm.RhythmBlobFactory) {
                    var blob = PianoRhythm.RhythmBlobFactory.getClientBlob();
                    if (blob) {
                        blob.color = PianoRhythm.CLIENT.color;
                    }
                }
                PianoRhythm.SOCKET.emit("getPlayerStats", { username: PianoRhythm.CLIENT.name });
            }
        });
        PianoRhythm.SOCKET.on('playersOnline', function (data) {
            if (PianoRhythm.PLAYERSONLINE && PianoRhythm.PLAYERSONLINE.length && !PianoRhythm.LOGIN_ENTERED) {
                if (data) {
                    if (PianoRhythm.PLAYERSONLINE && PianoRhythm.PLAYERSONLINE.length)
                        PianoRhythm.PLAYERSONLINE[0].textContent = "Players Online: " + (data.amount || 0);
                }
            }
        });
        PianoRhythm.SOCKET.on("chatclear", function (data) {
            if (data && data.clear && PianoRhythm.CMESSAGESUL && PianoRhythm.CMESSAGESUL.length) {
                PianoRhythm.CMESSAGESUL.empty();
                PianoRhythm.CHAT_SETTINGS.totalMessages = 0;
                PianoRhythm.CHAT_SETTINGS.newMessages = 0;
                PianoRhythm.CHAT_SETTINGS.oldMessages = 0;
                if (data.message) {
                    PianoRhythm.notify({
                        message: data.message
                    });
                }
            }
        });
        PianoRhythm.SOCKET.on("notify", function (data) {
            if (data)
                PianoRhythm.notify(data);
        });
        PianoRhythm.SOCKET.on('dnotify', function (data) {
            if (data)
                PianoRhythm.desktopNotify(data.body, data.title, data.icon, data.other);
        });
        PianoRhythm.SOCKET.on('loadInstruments', function (data) {
            if (data && data.list) {
                PianoRhythm.ownerOfRoom(data.list.owner, data);
                PianoRhythm.loadRoom(data.list, data.list.slotsMode, data.list.instruments);
            }
        });
        PianoRhythm.SOCKET.on("chatHistory", function (data) {
            if (PianoRhythm.CLIENT === undefined)
                return;
            if (data && data.history) {
                for (let i = 0; i < data.history.length; i++) {
                    let name = data.history[i].name;
                    let message = data.history[i].message;
                    let roomName = data.roomName;
                    let color = data.history[i].color;
                    PianoRhythm.chatMessage({
                        roomName: roomName,
                        name: name,
                        message: message,
                        effect: null,
                        modify: null,
                        color: color,
                        data: data.history[i]
                    });
                }
            }
            let messages = [
                "Want to support PianoRhythm and get donator benefits like animated .gif profiles? Donate here: https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=FXXHM5FKP6PVS",
                "Become a Patreon Supporter! https://www.patreon.com/pianorhythm",
                "Join PianoRhythm's Discord Server! https://www.discord.gg/Pm2xXxb",
                "Type /help to see the chat commands!",
                "Have a great idea for PianoRhythm? Suggest it here: https://feedback.userreport.com/d8b220d8-4a49-42ae-a81a-b4256d40ec43/",
                "Want to record the music here? Press F3 to show the recording tracks.",
                "Like PianoRhythm on Facebook! https://www.facebook.com/pianorhythm/",
                "Follow PianoRhythm on Instagram! https://www.instagram.com/pianorhythm_/",
                "Subscribe to PianoRhythm on Youtube! https://www.youtube.com/channel/UCgqeT2deXApAcLGbuBXBjAA"
            ];
            PianoRhythm.chatMessage({
                name: "Server",
                message: messages[Math.floor(Math.random() * messages.length)],
            });
        });
        PianoRhythm.SOCKET.on("friendRequestsList", function (data) {
            if (PianoRhythm.CLIENT === undefined)
                return;
            $(".friendRequest").remove();
            if (data)
                PianoRhythm.updateFriendsRequest(data);
        });
        PianoRhythm.SOCKET.on("inviteFromPlayer", function (data, callback) {
            let declined = false;
            if (data && data.from) {
                PianoRhythm.notify({
                    message: "You were invited by " + data.from + " to join their room: " + data.room + "!",
                    time: 15000,
                    onClick: () => {
                        if (declined)
                            return;
                        if (callback)
                            callback(null, true);
                        PianoRhythm.joinRoom(data.room);
                    },
                    onClose: () => {
                        if (callback)
                            callback(true, false);
                        declined = true;
                        PianoRhythm.notify("You declined " + data.from + "'s invitation.");
                    }
                });
            }
        });
        let offlineColor = pusher.color(PianoRhythm.COLORS.base4).contrastGray().html() || "gray";
        let onlineColor = "white";
        PianoRhythm.SOCKET.on("getFriendsList", function (data) {
            if (PianoRhythm.DEBUG_MESSAGING)
                console.log("GOT FRIEND LIST", data);
            if (PianoRhythm.CLIENT === undefined)
                return;
            if (data) {
                let friendListUI = PianoRhythm.FRIENDLIST_UL;
                friendListUI.empty();
                let offlineColor = pusher.color(PianoRhythm.COLORS.base4).contrastGray().html() || "gray";
                for (let i in data) {
                    let friend = data[i];
                    if (friend && friend.name) {
                        if (friendListUI) {
                            let color = friend.color || PianoRhythm.stringToColour(friend.name);
                            let li = PianoRhythm.createUserLI({
                                name: friend.name,
                                socketID: friend.socketID,
                                uuid: friend.id,
                                roomOwner: false,
                                guest: false,
                                color: color,
                                friendLI: true,
                                lastOnline: friend.lastOnline,
                                friendOnline: friend.online
                            });
                            if (li) {
                                friendListUI.append(li);
                                setTimeout(() => {
                                    li["divName"].resizeText();
                                }, 50);
                                let image = li["img"];
                                let name = li["divName"];
                                let status = li["divStatus"];
                                if (friend.online) {
                                    if (image)
                                        image.css({
                                            "opacity": "1 !important",
                                            "border-color": color
                                        });
                                    if (name)
                                        name.css({ "color": "white" });
                                    name.removeClass("friendOffline");
                                    let text = "Room:  " + friend.roomName;
                                    status.text(text);
                                    status.attr('title', text);
                                    status.css("color", "white");
                                    li.data("online", true);
                                }
                                else {
                                    if (image)
                                        image.css({
                                            "opacity": 0.3,
                                            "border-color": offlineColor
                                        });
                                    if (name) {
                                        name.addClass("friendOffline");
                                        name.css("color", offlineColor);
                                    }
                                    status.text("Offline");
                                    status.removeAttr('title');
                                    status.css("color", offlineColor);
                                    li.data("online", false);
                                }
                            }
                        }
                    }
                }
                if (PianoRhythm.FRIEND_REQUESTS && PianoRhythm.FRIEND_REQUESTS.length > 0) {
                    PianoRhythm.FRIEND_REQUESTS.map((val) => {
                        friendListUI.prepend(val);
                    });
                }
                PianoRhythm.FRIENDLIST_SORT();
            }
        });
        PianoRhythm.SOCKET.on("friendUpdate", function (data) {
            if (PianoRhythm.CLIENT === undefined)
                return;
            if (PianoRhythm.DEBUG_MESSAGING)
                console.log("GOT FRIEND UPDATE", data);
            let friendListUI = PianoRhythm.FRIENDLIST_UL;
            let li = friendListUI.find("#userLI_Friend_" + data.userName);
            if (li) {
                let image = li.find("img");
                let name = li.find("#userLI_Friend_Name_" + data.userName);
                let status = li.find("#divStatus_" + data.userName);
                let color = data.color;
                li.data("sID", data.socketID);
                li.data("_id", data.id);
                if (data.online) {
                    if (!li.data("online") && PianoRhythm.SETTINGS["friendOnlineMessage"])
                        PianoRhythm.notify({ message: "Your friend " + data.userName + " is now online!" });
                    if (image)
                        image.css({
                            "opacity": "",
                            "border-color": data.color || PianoRhythm.stringToColour(data.userName)
                        });
                    if (name)
                        name.css({ "color": onlineColor, "border-bottom": "solid white 1px" });
                    let text = "Room: " + data.roomName;
                    status.text(text);
                    status.attr('title', text);
                    li.data("online", true);
                    status.css("color", onlineColor);
                }
                else {
                    if (image)
                        image.css({
                            "opacity": 0.3,
                            "border-color": offlineColor
                        });
                    if (name && name.length)
                        name.css({ "color": offlineColor, "border-bottom": "none" });
                    status.text("Offline");
                    li.data("online", false);
                    status.css("color", offlineColor);
                }
            }
            PianoRhythm.FRIENDLIST_SORT();
        });
        PianoRhythm.SOCKET.on("newFriendRequest", function (data) {
            if (PianoRhythm.CLIENT === undefined)
                return;
            for (let i in data) {
                let item = data[i];
                PianoRhythm.notify({
                    message: "You got a new friend request from: " + item.from + ". Click on the PALS tab to see!",
                    time: 10000,
                });
            }
            if (data)
                PianoRhythm.updateFriendsRequest(data, true);
        });
        PianoRhythm.SOCKET.on("getMutedNotes", function (data) {
            if (PianoRhythm.DEBUG_MESSAGING)
                console.log("MUTED PLAYERS NOTES", data);
            if (data && data.list) {
                try {
                    data.list = JSON.parse(data.list);
                    for (let r = 0; r < data.list.length; r++) {
                        PianoRhythm.MUTED_NOTE_PLAYERS.add(data.list[r]);
                    }
                    PianoRhythm.saveSetting("MUTED_NOTES", "notes", JSON.stringify(Array.from(PianoRhythm.MUTED_NOTE_PLAYERS)));
                }
                catch (err) {
                }
            }
        });
        PianoRhythm.SOCKET.on("getMutedChat", function (data) {
            if (PianoRhythm.DEBUG_MESSAGING)
                console.log("MUTED PLAYERS CHAT", data);
            if (data && data.list) {
                try {
                    data.list = JSON.parse(data.list);
                    for (let r = 0; r < data.list.length; r++) {
                        PianoRhythm.MUTED_CHAT_PLAYERS.add(data.list[r]);
                    }
                    PianoRhythm.saveSetting("MUTED_CHAT", "chat", JSON.stringify(Array.from(PianoRhythm.MUTED_CHAT_PLAYERS)));
                }
                catch (err) {
                }
            }
        });
        PianoRhythm.SOCKET.on("inboxMessages", function (data) {
            if (data && PianoRhythm.UPLINK) {
                if (!PianoRhythm.UPLINK.messageOpened && !PianoRhythm.UPLINK.messageOpenedItem) {
                    PianoRhythm.UPLINK.mail_clearInbox();
                }
                else {
                    PianoRhythm.UPLINK.mail_clearInbox(PianoRhythm.UPLINK.messageOpenedItem);
                }
                for (let i = 0; i < data.length; i++) {
                    let mail = data[i];
                    let id = mail.id;
                    if (id === undefined)
                        continue;
                    let from = mail.sender;
                    let for2 = mail.from;
                    let msg = mail.message;
                    let read = mail.read;
                    let subject = mail.subject;
                    let date = new Date(Date.parse(mail.sent));
                    if (PianoRhythm.UPLINK.messageOpenedItem && PianoRhythm.UPLINK.messageOpenedItem.data("mail_id") === id) {
                        if (PianoRhythm.UPLINK.mailMessagesContainer && PianoRhythm.UPLINK.mailMessagesContainer.length && PianoRhythm.UPLINK.messageOpenedItem)
                            PianoRhythm.UPLINK.mailMessagesContainer.prepend(PianoRhythm.UPLINK.messageOpenedItem);
                    }
                    else {
                        PianoRhythm.UPLINK.mail_addNewMessage(id, subject, from, date.toDateString(), msg);
                    }
                }
                let unread = data[data.length - 1];
                PianoRhythm.UPLINK.updateUnreadMailAmount(unread);
                if (unread !== undefined && unread > 0) {
                    if (!PianoRhythm.UPLINK.visible) {
                        var notify = {
                            text: "New mail! Unread: " + unread,
                            options: {
                                target: PianoRhythm.PR_ICON,
                                style: "qtip_custom_newMail",
                                width: 195,
                                lifeSpan: 5000,
                                my: "bottom right",
                                at: "top left",
                                adjust: {
                                    y: -20,
                                    x: 15
                                },
                                onClick: () => {
                                    setTimeout(() => {
                                        PianoRhythm.UPLINK.show("mail");
                                    }, 1);
                                }
                            }
                        };
                        setTimeout(() => {
                            $(".qtip_custom_newMail").remove();
                            PianoRhythm.createGrowl(notify.text, null, notify.options);
                        }, 1000);
                    }
                    else {
                        PianoRhythm.notify({
                            message: "You got new mail! Unread messages: " + unread
                        });
                    }
                }
            }
        });
        PianoRhythm.SOCKET.on("enterPassword", function (data, callback) {
            if (PianoRhythm.CLIENT === undefined)
                return;
            $("#PR_PASSWORD_PROMPT").remove();
            if (data && callback) {
                PianoRhythm.CLIENT_FOCUS = CLIENT_FOCUS.PASSWORD_PROMPT;
                PianoRhythm.dimPage(true);
                var roomName = "";
                if (data.roomName)
                    roomName = data.roomName;
                var passwordBox = new BasicBox({
                    id: "PR_PASSWORD_PROMPT", height: 200, width: 600,
                    title: "Enter Password for Room " + roomName, color: PianoRhythm.COLORS.base4
                });
                passwordBox.show();
                passwordBox.box.css({
                    "border": "4px solid white",
                });
                var passwordInput;
                passwordBox.createHeader({
                    marginTop: "0px",
                    onClose: () => {
                        callback("userClosed");
                        if (passwordInput) {
                            try {
                                passwordInput.qtip('api').destroy();
                            }
                            catch (err) { }
                        }
                        passwordBox.remove();
                        PianoRhythm.dimPage(false);
                        if (!PianoRhythm.ROOM_OWNER_ID) {
                            PianoRhythm.joinRoom("lobby", "-999");
                        }
                    }
                });
                passwordInput = passwordBox.addInput({
                    type2: "text",
                    width: "90%"
                });
                passwordInput.attr("title", "Enter the room's password. It is case-sensitive!");
                passwordInput.qtip();
                var submitButton = BasicBox.createButton("Submit", () => {
                    let input = passwordInput.find("input");
                    let inputVal = "";
                    if (input)
                        inputVal = input.val();
                    if (callback)
                        callback(null, { password: inputVal });
                    passwordInput.qtip('api').destroy();
                    passwordBox.remove();
                    passwordBox.destroyed = true;
                    PianoRhythm.dimPage(false);
                }, {
                    "flex-grow": "1",
                    "padding-left": "40%",
                    "margin-top": 18
                });
                passwordBox.box.append(submitButton);
                passwordBox.center3();
                let body = PianoRhythm.BODY;
                if (!body)
                    body = $("body");
                body.append(passwordBox.box);
            }
        });
        PianoRhythm.SOCKET.on("login", (callbackData) => {
            if (PianoRhythm.DEBUG_MESSAGING)
                console.info("Logging in.", callbackData);
            PianoRhythm.LOGIN_PAGE.css({ "filter": "" });
            if (PianoRhythm.loadingTimer)
                clearInterval(PianoRhythm.loadingTimer);
            if (PianoRhythm.loadBar && PianoRhythm.loadBar.length)
                PianoRhythm.loadBar.fadeOut();
            if (callbackData) {
                if (callbackData.error) {
                    if (callbackData && callbackData.message) {
                        if (callbackData.type && callbackData.type === "logged")
                            PianoRhythm.notify({
                                message: "Account already logged in. Click here to disconnect all other accounts.",
                                onClick: () => {
                                    if (PianoRhythm.SOCKET) {
                                        PianoRhythm.SOCKET.emit("disconnectOtherAccounts", {
                                            username: callbackData.username
                                        }, (err, results) => {
                                            if (results) {
                                                PianoRhythm.notify({
                                                    message: "All other accounts have been disconnected. Please try logging in again!"
                                                });
                                            }
                                        });
                                    }
                                }
                            });
                        else
                            PianoRhythm.notify({ message: callbackData.message });
                    }
                    else {
                        PianoRhythm.notify({ message: "Almost done..." });
                    }
                    PianoRhythm.loginTimeout = true;
                    return;
                }
                if (callbackData.message === "success") {
                    $('.registration-form').fadeOut();
                    PianoRhythm.CLIENT.name = callbackData.username;
                    PianoRhythm.CLIENT.loggedIn = true;
                    PianoRhythm.displayMainContent();
                    PianoRhythm.notify({ message: "You've successfully logged in as " + callbackData.username + "!" });
                    PianoRhythm.saveSessionSetting("rod", "rod", {
                        r: callbackData.r,
                        d: callbackData.d,
                        b: callbackData.b,
                        cb: callbackData.cb
                    });
                }
                PianoRhythm.LOGIN_STATUS.text(callbackData.message);
                PianoRhythm.LOGIN_STATUS.fadeIn();
                setTimeout(() => {
                    PianoRhythm.LOGIN_STATUS.fadeOut();
                }, 6000);
            }
        });
        PianoRhythm.SOCKET.on("game", function (data) {
            console.warn("CLIENT GAME DATA", data);
            if (!GAMESTATE.initialized) {
                GAMESTATE.initialize();
                console.info("Game State initialized");
            }
            if (data) {
                if (data.type) {
                    switch (data.type.toLowerCase()) {
                        case "pregame":
                            console.info("PREGAME DATA", data);
                            GAMESTATE.SET_PREGAME(data);
                            break;
                        case "gamecancel":
                            if (LOBBY.initialized && LOBBY.VISIBLE)
                                LOBBY.enableAll();
                            break;
                        case "teams":
                            console.info("CLIENT UPDATE TEAM SLOTS", data);
                            LOBBY.updatePlayerSlots(data);
                            break;
                    }
                }
            }
        });
        PianoRhythm.SOCKET.on("setPlayerStats", function (data) {
            if (data) {
                if (PianoRhythm.CLIENT) {
                    PianoRhythm.CLIENT.level = data.level;
                    PianoRhythm.CLIENT.points = data.points;
                    PianoRhythm.CLIENT.exp = data.exp;
                    PianoRhythm.CLIENT.rank = data.rank;
                }
                if (GAMESTATE.initialized && GAMESTATE.ACTIVE_STATE == GAMESTATE.STATE_PREGAME) {
                    LOBBY.setPlayerInfo(PianoRhythm.CLIENT.name, PianoRhythm.CLIENT.level, PianoRhythm.CLIENT.rank);
                }
            }
        });
    }
    static updateFriendsRequest(data, newRequest = false) {
        if (PianoRhythm.DEBUG_MESSAGING)
            console.log("UPDATE FR", data);
        if (PianoRhythm.UPLINK) {
            PianoRhythm.UPLINK.requests_Clear();
        }
        let friendListUI = PianoRhythm.FRIENDLIST_UL;
        for (let i in data) {
            let item = data[i];
            if (PianoRhythm.UPLINK)
                PianoRhythm.UPLINK.requests_addNew(item.from, item.sent);
            if (friendListUI && friendListUI.length) {
                let li = PianoRhythm.createUserLI({
                    name: item.from,
                    friendLI: true,
                    friendRequest: true,
                    status: "Friend Request!"
                });
                setTimeout(() => {
                    li["divName"].resizeText();
                }, 50);
                li.data("friendRequest", "true");
                if (li && newRequest)
                    friendListUI.prepend(li);
                else {
                    let index = PianoRhythm.FRIEND_REQUESTS.indexOf(li);
                    if (index === -1)
                        PianoRhythm.FRIEND_REQUESTS.push(li);
                }
            }
        }
        if (newRequest) {
            PianoRhythm.FRIENDLIST_SORT();
        }
    }
    static userlistUpdate(data) {
        if (PianoRhythm.DEBUG_MESSAGING)
            console.info("Userlist UPDATE", data);
        if (!PianoRhythm.CLIENT)
            return;
        if (data && data.list) {
            if (!PianoRhythm.PLAYER_SOCKET_LIST) {
                if (PianoRhythm.DEBUG_MESSAGING)
                    console.log("UL List doesn't exist! Creating new list: " + data.roomName);
                PianoRhythm.PLAYER_SOCKET_LIST = new Map();
                PianoRhythm.PLAYERLIST.append(PianoRhythm.PLAYERLIST_UL);
            }
            let templist = [];
            try {
                let list2 = JSON.parse(PianoRhythm.loadSetting("MUTED_NOTES", "notes"));
                for (let r = 0; r < list2.length; r++) {
                    PianoRhythm.MUTED_NOTE_PLAYERS.add(list2[r]);
                }
            }
            catch (err) {
            }
            try {
                let list2 = JSON.parse(PianoRhythm.loadSetting("MUTED_CHAT", "chat"));
                for (let r = 0; r < list2.length; r++) {
                    PianoRhythm.MUTED_CHAT_PLAYERS.add(list2[r]);
                }
            }
            catch (err) {
            }
            try {
                let list3 = JSON.parse(PianoRhythm.loadSetting("BLOCKED", "users"));
                for (let r = 0; r < list3.length; r++) {
                    PianoRhythm.CLIENT.blockedUsers[list3[r].uuid] = list3[r];
                }
            }
            catch (err) { }
            for (let i = 0; i < data.list.length; i++) {
                let name = data.list[i].name;
                let nickname = data.list[i].nickname;
                let role = data.list[i].type || 0;
                let id = data.list[i].id;
                let socketID = data.list[i].socketID;
                let guest = data.list[i].guest || false;
                let status_text = data.list[i].statusText;
                let enableCursor = data.list[i].enableCursor;
                let color = data.list[i].color;
                let accountID = data.list[i].accountID;
                let hasGifImageForProfile = data.list[i].hasGifImageForProfile;
                templist.push(socketID);
                PianoRhythm.setCrown(socketID);
                let index = PianoRhythm.PLAYER_SOCKET_LIST.has(socketID);
                if (guest && role <= 0)
                    role = user_1.UserType.GUEST;
                if (!index) {
                    if (PianoRhythm.EVENT_EMITTER) {
                        PianoRhythm.EVENT_EMITTER.emit("bot_newPlayer", data.list[i]);
                    }
                    let extra;
                    if (socketID === PianoRhythm.ROOM_OWNER_ID) {
                        extra = { roomOwner: true };
                    }
                    else {
                        extra = { roomOwner: false };
                    }
                    extra.id = socketID;
                    extra.uuid = id || null;
                    extra.guest = guest;
                    if (PianoRhythm.CLIENT.blockedUsers) {
                        for (let t in PianoRhythm.CLIENT.blockedUsers) {
                            let mn_user = PianoRhythm.CLIENT.blockedUsers[t];
                            extra.blocked = (mn_user.uuid === id);
                        }
                    }
                    let userLI = PianoRhythm.createUserLI({
                        name: name,
                        role: role,
                        nickname: nickname,
                        hasGifImageForProfile: hasGifImageForProfile,
                        color: (color || PianoRhythm.stringToColour(name)),
                        socketID: extra.id,
                        accountID: accountID,
                        uuid: extra.uuid,
                        guest: guest,
                        roomOwner: extra.roomOwner,
                        status: status_text
                    });
                    if (userLI)
                        PianoRhythm.PLAYER_SOCKET_LIST_SET(socketID, "userLI", userLI);
                    if (extra.blocked && (PianoRhythm.SOCKET && socketID !== PianoRhythm.SOCKET.id)) {
                        userLI.data("blocked", true);
                        userLI.data("muteNotes", "Unmute Notes");
                        userLI["targetNameStatus"].text("MUTED");
                        userLI["targetNameStatus"].css("left", 81);
                        if (userLI["muteNotesButton"])
                            userLI["muteNotesButton"].text(userLI.data("muteNotes"));
                        userLI.data("muteChat", "Unmute Chat");
                        if (userLI["muteChatButton"])
                            userLI["muteChatButton"].text(userLI.data("muteChat"));
                    }
                    if (name === PianoRhythm.CLIENT.name) {
                        PianoRhythm.CLIENT.type = role;
                        if (color)
                            PianoRhythm.CLIENT.color = color;
                        if (PianoRhythm.RhythmBlobFactory) {
                            var blob = PianoRhythm.RhythmBlobFactory.getClientBlob();
                            if (blob) {
                                blob.color = PianoRhythm.CLIENT.color;
                            }
                        }
                        if (id)
                            PianoRhythm.CLIENT.id = id;
                    }
                    else {
                        if (PianoRhythm.MUTED_NOTE_PLAYERS &&
                            PianoRhythm.MUTED_NOTE_PLAYERS.has(id) || PianoRhythm.MUTED_NOTE_PLAYERS.has(socketID)) {
                            userLI.data("muteNotes", "Unmute Notes");
                            userLI["targetNameStatus"].text("MUTED");
                            userLI["targetNameStatus"].css("left", 81);
                        }
                        else {
                            userLI.data("muteNotes", "Mute Notes");
                        }
                        if (PianoRhythm.MUTED_CHAT_PLAYERS &&
                            PianoRhythm.MUTED_CHAT_PLAYERS.has(id) || PianoRhythm.MUTED_CHAT_PLAYERS.has(socketID)) {
                            userLI.data("muteChat", "Unmute Chat");
                            userLI["targetNameStatus"].text("MUTED");
                            userLI["targetNameStatus"].css("left", 81);
                        }
                        else {
                            userLI.data("muteChat", "Mute Chat");
                        }
                    }
                    userLI.appendTo(PianoRhythm.PLAYERLIST_UL).hide().fadeIn(500, () => {
                        setTimeout(() => {
                            userLI["divName"].resizeText();
                        }, 200);
                    });
                    if (socketID && color)
                        PianoRhythm.PLAYER_SOCKET_LIST_SET(socketID, "color", color);
                    if (role !== undefined || role !== null)
                        PianoRhythm.PLAYER_SOCKET_LIST_SET(socketID, "role", role);
                    if (PianoRhythm.RhythmBlobFactory && PianoRhythm.SETTINGS["enableBlobs"]) {
                        if (PianoRhythm.RhythmBlobFactory.blobColl.blobsSet && !PianoRhythm.RhythmBlobFactory.blobColl.blobsSet.has(socketID)) {
                            var blob = PianoRhythm.RhythmBlobFactory.blobColl.addBlob(socketID);
                            blob.color = (color || PianoRhythm.stringToColour(name));
                        }
                    }
                    PianoRhythm.PLAYER_SOCKET_LIST_SET(socketID, "guest", guest);
                    PianoRhythm.PLAYER_SOCKET_LIST_SET(socketID, "name", name);
                    PianoRhythm.PLAYER_SOCKET_LIST_SET(socketID, "nickname", nickname);
                    PianoRhythm.PLAYER_SOCKET_LIST_SET(socketID, "uuid", id);
                    PianoRhythm.PLAYER_SOCKET_LIST_SET(socketID, "status", status_text);
                    if (accountID)
                        PianoRhythm.PLAYER_SOCKET_LIST_SET(socketID, "accountID", accountID);
                    PianoRhythm.USERLIST_SORT();
                    let mouse = PianoRhythm.PLAYER_SOCKET_LIST.get(socketID)["mouse"];
                    if (!mouse) {
                        if (socketID !== PianoRhythm.SOCKET.id) {
                            let mouse = new playerMouse(socketID, name, color, userLI);
                            mouse.Interpolater = new Interpolater({
                                trackSpeed: 25,
                                fraction: 0.5,
                                elements: {
                                    mouse: mouse
                                },
                                step: function (data) {
                                    if (data.object.lastX !== data.position.x || data.object.lastY !== data.position.y)
                                        data.object.setPosition(data.position.x, data.position.y);
                                    if (data.object.checkForPlayerCollision)
                                        data.object.checkForPlayerCollision();
                                }
                            });
                            if (!PianoRhythm.SHOW_EVERYONES_CURSORS || !enableCursor)
                                mouse.hide();
                        }
                    }
                    else {
                        if (name)
                            mouse.nameElement.text(name);
                        if (color)
                            mouse.nameElement.css("background", color);
                    }
                }
            }
            if (GAMESTATE.initialized && GAMESTATE.ACTIVE_STATE == GAMESTATE.STATE_PREGAME) {
                LOBBY.setPlayerInfo(PianoRhythm.CLIENT.name, PianoRhythm.CLIENT.level, PianoRhythm.CLIENT.rank);
                LOBBY.setPlayerProfile();
                LOBBY.setRoomTitle(PianoRhythm.CLIENT.roomName);
                LOBBY.setRoomDetail(PianoRhythm.String_replaceAll(GAMESTATE.CURRENT_MODE, "_", " "), PianoRhythm.ROOM_OWNER_ID);
            }
            PianoRhythm.checkPLAYER_SOCKET_LIST(templist);
        }
    }
    static checkPLAYER_SOCKET_LIST(list) {
        if (!list)
            return;
        if (!PianoRhythm.PLAYER_SOCKET_LIST)
            return;
        PianoRhythm.PLAYER_SOCKET_LIST.forEach((value, key) => {
            let index = list.indexOf(key);
            if (index > -1) {
                list.splice(index, 1);
            }
            else {
                list.push(key);
            }
        });
        list.map((val) => {
            PianoRhythm.destroyUserLI(val);
        });
    }
    static checkPLAYER_ROOM_LIST(list) {
        if (!list)
            return;
        if (!PianoRhythm.PLAYER_ROOM_LIST)
            return;
        PianoRhythm.PLAYER_ROOM_LIST.forEach((value, key) => {
            let index = list.indexOf(key);
            if (index > -1) {
                list.splice(index, 1);
            }
            else {
                list.push(key);
            }
        });
        list.map((val) => {
            PianoRhythm.destroyRoomLI(val);
        });
    }
    static onlyHostCanPlayGrowl() {
        return PianoRhythm.createGrowl("Only Host Can Play", null, {
            target: $(window),
            noClick: true,
            persistent: true,
            style: "qtip_onlyHost noselect",
            my: "top center",
            at: "top center",
            adjust: {
                x: 100,
                y: 50,
            },
        });
    }
    static turnQueueGrowl(name) {
        if (!name)
            return false;
        let growlDiv = null;
        PianoRhythm.createGrowl("Current Turn: " + name, null, {
            target: $(window),
            noClick: true,
            persistent: true,
            style: "qtip_turnQueue noselect",
            my: "top center",
            at: "top center",
            getDiv: (div) => {
                growlDiv = div;
                growlDiv["turn_name"] = name;
            },
            adjust: {
                x: 100,
                y: 80,
            }
        });
        PianoRhythm.createGrowl("Type /join to join the queue. Other commands: /leave, /current, /pass", null, {
            target: $(window),
            noClick: true,
            persistent: true,
            style: "qtip_turnQueue qtip_turnQueueMessage noselect",
            my: "top center",
            at: "top center",
            adjust: {
                x: 100,
                y: 140,
            }
        });
        return growlDiv;
    }
    static roomlistUpdate(data) {
        if (PianoRhythm.DEBUG_MESSAGING)
            console.log("ROOM LIST UPDATE", data);
        if (data && data.list) {
            let incomingLength = data.list.length;
            let tempList = [];
            for (let i = 0; i < incomingLength; i++) {
                let name = data.list[i].name;
                let count = data.list[i].count;
                let id = data.list[i].roomID;
                let prefix = data.list[i].prefix;
                let type = data.list[i].type;
                let typeName = data.list[i].typeName;
                let owner = data.list[i].owner;
                let hasPassword = data.list[i].hasPassword;
                let onlyHost = data.list[i].onlyHost;
                let maxPlayers = data.list[i].maxPlayers;
                let destroyed = data.list[i].destroyed;
                let inProgress = data.list[i].inProgress;
                let allowTurnQueue = data.list[i].allowTurnQueue;
                let turn_currentPlayerName = data.list[i].turn_currentPlayerName;
                let turn_currentPlayer = data.list[i].turn_currentPlayer;
                let roomColor = "white";
                let roomLI;
                switch (type.toLowerCase()) {
                    case "lobby":
                        roomColor = PianoRhythm.COLORS.roomColor_Lobby;
                        break;
                    case "lobby_turn":
                    case "turn based":
                        roomColor = PianoRhythm.COLORS.roomColor_LobbyTurn;
                        break;
                    case "game":
                        roomColor = PianoRhythm.COLORS.roomColor_Game;
                        break;
                }
                let existingRoom;
                if (destroyed)
                    existingRoom = PianoRhythm.destroyRoomLI(id);
                tempList.push(id);
                let index = PianoRhythm.PLAYER_ROOM_LIST.has(id);
                if (!index && !existingRoom) {
                    if (PianoRhythm.DEBUG_MESSAGING)
                        console.log("(roomListUpdate) Adding new Room: " + name, prefix);
                    roomLI = PianoRhythm.createRoomLI(name, count, roomColor, type, {
                        owner: owner,
                        maxPlayers: maxPlayers,
                        hasPassword: hasPassword,
                        id: id,
                        typeName: typeName,
                        inProgress: inProgress
                    });
                    roomLI.appendTo(PianoRhythm.ROOMLIST).hide().fadeIn(1000);
                    PianoRhythm.PLAYER_ROOM_LIST.set(id, data.list[i]);
                    PianoRhythm.PLAYER_ROOM_LIST_SET(id, "roomLI", roomLI);
                }
                else {
                    let roomSetItem = PianoRhythm.PLAYER_ROOM_LIST.get(id);
                    if (roomSetItem)
                        roomLI = roomSetItem["roomLI"];
                    else
                        roomLI = PianoRhythm.ROOMLIST.find("[data-id='" + id + "']");
                    if (roomLI) {
                        let roomTextElem = roomLI["roomAmt"] || roomLI.children().first();
                        let roomText = roomTextElem.text();
                        if (roomText.indexOf("(") > -1)
                            roomTextElem.text("(" + count + ")");
                        else
                            roomTextElem.text(count + "/" + maxPlayers);
                        if (roomLI["roomType"]) {
                            roomLI["roomType"].css({
                                "font-style": (inProgress ? "italic" : "normal")
                            });
                            roomLI["roomType"].attr("title", "Room Type: " + (typeName ? typeName : type)
                                + (inProgress ? " | Game In Progress" : ""));
                        }
                        if (roomLI["roomName"]) {
                            roomLI["roomName"].css({
                                "font-style": (inProgress ? "italic" : "normal")
                            });
                        }
                        if (inProgress) {
                            let img = $("<img>");
                            img.attr("src", "/images/icons/essential/play-button-1.png");
                            img.attr("title", "The game has already started. You cannot enter yet.");
                            img.css({
                                position: "absolute",
                                width: "16px",
                                top: "34px",
                                left: "142px",
                                "z-index": "1"
                            });
                            img.qtip();
                            roomLI.append(img);
                            roomLI["inProgressImg"] = img;
                        }
                        else {
                            if (roomLI["inProgressImg"])
                                roomLI["inProgressImg"].remove();
                        }
                        if (roomLI["lockImg"])
                            if (hasPassword)
                                roomLI["lockImg"].show();
                            else
                                roomLI["lockImg"].hide();
                    }
                }
                if (id == PianoRhythm.CLIENT.roomID) {
                    if (roomLI) {
                        let bgColor = "inset 0 0 100px 100px rgba(255, 255, 255, 0.1)";
                        let nameColor = PianoRhythm.CLIENT.color || PianoRhythm.stringToColour(PianoRhythm.CLIENT.name);
                        roomLI.css("box-shadow", bgColor);
                        roomLI.css("border", "1px solid " + nameColor);
                        if (!allowTurnQueue) {
                            if (PianoRhythm.ROOM_CURRENT_TURN_MESSAGE) {
                                $('.qtip_turnQueue').qtip('destroy', true);
                                PianoRhythm.ROOM_CURRENT_TURN_MESSAGE = null;
                            }
                            PianoRhythm.ROOM_CURRENT_TURN_ID = null;
                        }
                        else {
                            if (turn_currentPlayer)
                                PianoRhythm.ROOM_CURRENT_TURN_ID = turn_currentPlayer;
                            if (PianoRhythm.ROOM_CURRENT_TURN_MESSAGE === null) {
                                PianoRhythm.ROOM_CURRENT_TURN_MESSAGE = PianoRhythm.turnQueueGrowl(turn_currentPlayerName || "-");
                            }
                            else {
                                PianoRhythm.ROOM_CURRENT_TURN_MESSAGE.qtip('option', 'content.text', "Current Turn: " + (turn_currentPlayerName || "-"));
                            }
                        }
                        if (onlyHost) {
                            PianoRhythm.ONLY_HOST = true;
                            if (PianoRhythm.ONLY_HOST_MESSAGE === null)
                                PianoRhythm.ONLY_HOST_MESSAGE = PianoRhythm.onlyHostCanPlayGrowl();
                        }
                        else {
                            if (PianoRhythm.ONLY_HOST_MESSAGE) {
                                $('.qtip_onlyHost').qtip('destroy', true);
                                PianoRhythm.ONLY_HOST_MESSAGE = null;
                            }
                            PianoRhythm.ONLY_HOST = false;
                        }
                        PianoRhythm.ROOM_OWNER_ID = owner;
                    }
                }
                else {
                    if (roomLI) {
                        roomLI.css("box-shadow", "");
                        roomLI.css("border", "");
                    }
                }
            }
            PianoRhythm.checkPLAYER_ROOM_LIST(tempList);
        }
    }
    static PLAYER_SOCKET_LIST_SET(socketID, prop, value) {
        if (!socketID)
            return;
        if (!prop)
            return;
        if (value === undefined)
            return;
        if (PianoRhythm.PLAYER_SOCKET_LIST.has(socketID)) {
            let obj = PianoRhythm.PLAYER_SOCKET_LIST.get(socketID);
            if (obj)
                obj[prop] = value;
            PianoRhythm.PLAYER_SOCKET_LIST.set(socketID, obj);
        }
        else {
            PianoRhythm.PLAYER_SOCKET_LIST.set(socketID, { [prop]: value });
        }
    }
    static PLAYER_ROOM_LIST_SET(roomID, prop, value) {
        if (!roomID)
            return;
        if (!prop)
            return;
        if (value === undefined)
            return;
        if (PianoRhythm.PLAYER_ROOM_LIST.has(roomID)) {
            let obj = PianoRhythm.PLAYER_ROOM_LIST.get(roomID);
            if (obj)
                obj[prop] = value;
            PianoRhythm.PLAYER_ROOM_LIST.set(roomID, obj);
        }
        else {
            PianoRhythm.PLAYER_ROOM_LIST.set(roomID, { [prop]: value });
        }
    }
    static mutePlayerChat(name, id, sid, callback) {
        if (!id)
            id = null;
        if (!sid)
            sid = null;
        PianoRhythm.SOCKET.emit("muteChat", {
            userName: name,
            id: id,
            sID: sid,
        }, callback);
    }
    static mutePlayerNotes(name, id, sid, callback) {
        if (!id)
            id = null;
        if (!sid)
            sid = null;
        PianoRhythm.SOCKET.emit("muteNotes", {
            userName: name,
            id: id,
            sID: sid,
        }, callback);
    }
    static createUserLI(user) {
        if (!user)
            return;
        if (!PianoRhythm.SOCKET)
            return;
        if (user.socketID && user.uuid && user.name || user.friendLI) {
            let userLI = $("<li>");
            let topOffset = 0;
            let crownImg;
            user.color = user.color || PianoRhythm.stringToColour(user.name);
            if (!user.friendLI) {
                userLI.attr("id", "userLI_" + user.socketID);
                userLI.attr("socketID", user.socketID);
                userLI.attr("draggable", "false");
                userLI.attr("uuid", user.uuid + "_" + user.name);
                userLI.data("username", user.name);
            }
            else {
                userLI.attr("id", "userLI_Friend_" + user.name);
                userLI.attr("friend", "true");
                userLI.data("online", user.friendOnline);
            }
            userLI.attr("class", "userLI noselect");
            let paddingTop = 5;
            let bHeight = 33;
            let divName = $("<div>");
            if (!user.friendLI) {
                divName.attr("id", "userLI_Name_" + user.name);
                divName.attr("id", "userLI_Name_" + user.socketID);
                divName.attr("title", "Player Name: " + user.name);
            }
            else {
                divName.attr("id", "userLI_Friend_Name_" + user.name);
                if (user.lastOnline)
                    divName.attr("title", "Last Online: " + new Date(user.lastOnline).toDateString());
            }
            divName["qtip"]({ style: { classes: "qTip_userLI_" + user.name + " qtip-light qtip_custom" } });
            if (PianoRhythm.SETTINGS["autoConvertEmojis"] && user.nickname)
                user.nickname = wdtEmojiBundle.render(user.nickname);
            divName.html(user.nickname || user.name);
            divName.css({
                "padding-top": paddingTop + "px",
                "border-bottom": (!user.friendOnline && !user.friendLI || user.friendLI && user.friendOnline) ? "solid white 1px" : "none",
                width: 124,
                height: bHeight,
                "line-height": bHeight + paddingTop + "px",
            });
            divName.addClass("userli_divname");
            userLI["divName"] = divName;
            let divName2;
            if (!user.friendLI) {
                divName2 = $("<span>");
                divName2.attr("id", "userLI_Name2_" + name);
                divName2.attr("id", "userLI_Name2_" + user.socketID);
                divName2.css({
                    position: "absolute",
                    top: "-1px",
                    left: "105px",
                    "font-size": "12px",
                    "line-height": "normal"
                });
                userLI["targetNameStatus"] = divName2;
                if (user.name.toLowerCase() === PianoRhythm.CLIENT.name.toLowerCase()) {
                    divName2.text("ME");
                }
                divName.append(divName2);
            }
            let img = $("<img>");
            img.attr("id", "userLI_Img_" + user.socketID);
            img.attr("draggable", "false");
            let ext = user.hasGifImageForProfile ? "gif" : "png";
            if (user.guest)
                img.attr("src", "./profile_images/default/profile.png");
            else
                img.attr("src", "./profile_images/" + user.name + "/profile." + ext + "?" + Date.now());
            img.on('error', () => {
                img.attr("src", "./profile_images/default/profile.png");
            });
            img.css({
                position: "absolute",
                width: "21%",
                height: 41,
                top: (0.5 + topOffset) + "em",
                left: "0.3em",
                "vertical-align": "middle",
                "border-width": "3px",
                "border-style": "solid",
                "border-color": user.color,
                "border-radius": "12px"
            });
            userLI["img"] = img;
            if (user.roomOwner) {
                crownImg = $("<img>");
                crownImg.attr("src", "/images/crown.png");
                crownImg.css({
                    position: "absolute",
                    width: "60px",
                    top: "-14px",
                    left: "17px",
                    transform: "rotateZ(37deg)",
                    "z-index": 1
                });
                crownImg.addClass("crownImage");
                crownImg.attr("title", user.name + " is the room owner!");
                crownImg["qtip"]({ style: { classes: "qTip_userLI_" + user.name + " qtip-light qtip_custom" } });
            }
            let divRole;
            if (user.role !== undefined && !user.friendLI) {
                divRole = $("<div>");
                divRole.css({
                    position: "absolute",
                    top: 46,
                    left: 3,
                    color: "white",
                    background: PianoRhythm.ROLE_COLORS.get(user_1.UserType[user.role]) || "none",
                    "border-radius": "20%",
                    "font-size": 8,
                    "padding": "0.5px",
                    "padding-left": 3,
                    "padding-right": 4
                });
                if (user.role <= user_1.UserType.USER || user.role == user_1.UserType.GUEST)
                    divRole.css("opacity", 0);
                let roleName = user_1.UserType[user.role].replace("_", " ");
                switch (user.role) {
                    case user_1.UserType.OSOP:
                        roleName = "CREATOR";
                        break;
                    case user_1.UserType.SPT:
                        roleName = "SUPPORT";
                        break;
                    case user_1.UserType.DESIGN:
                        roleName = "DESIGNER";
                        break;
                }
                divRole.html(roleName);
                divRole.attr("id", "userLI_Status_" + user.socketID);
                userLI["divRole"] = divRole;
            }
            let divStatus = $("<div>");
            divStatus.attr("id", "divStatus_" + (user.friendLI ? user.name : user.socketID));
            divStatus.addClass("userli_divstatus");
            if (user.status)
                divStatus.html(wdtEmojiBundle.render(user.status));
            userLI["divStatus"] = divStatus;
            if (user.color === "rainbow" || user.role == user_1.UserType.OSOP)
                img.addClass("rainbow_border");
            if (user.role === user_1.UserType.DESIGN)
                img.addClass("emex_border");
            let activeMeter;
            if (!user.friendLI) {
                activeMeter = $("<div>");
                activeMeter.attr("id", "userLI_meter_" + user.socketID);
                activeMeter.addClass("activeMeter");
                activeMeter.css({
                    position: "absolute",
                    top: "46px",
                    left: "175px",
                    background: "grey",
                    "-webkit-border-radius": "8px",
                    "-moz-border-radius": "8px",
                    "border-radius": "8px",
                    width: "8px",
                    height: "8px"
                });
                activeMeter.data("color", user.color);
                activeMeter.data("li", userLI);
                userLI["meter"] = activeMeter;
            }
            if (user.friendRequest) {
                userLI.css({
                    animation: "pulse 0.3s",
                    "animation-iteration-count": "infinite"
                });
                userLI.addClass("friendRequest");
            }
            if (crownImg)
                userLI.append(crownImg);
            userLI.append(img);
            userLI.append(divName);
            if (divRole)
                userLI.append(divRole);
            if (activeMeter)
                userLI.append(activeMeter);
            userLI.append(divStatus);
            if (!user.friendLI) {
                if (user.name.toLowerCase() === PianoRhythm.CLIENT.name.toLowerCase()) {
                    PianoRhythm.CLIENT["userLI"] = userLI;
                }
                userLI.on("contextmenu", function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (PianoRhythm.CONTEXT_MENU2)
                        PianoRhythm.CONTEXT_MENU2.hide();
                    if (PianoRhythm.CONTEXT_MENU_DOCK)
                        PianoRhythm.CONTEXT_MENU_DOCK.hide();
                    let context = PianoRhythm.CONTEXT_MENU;
                    if (context && context.length) {
                        context.show();
                        context.css({ "left": e.clientX, "top": e.clientY });
                        let subContext = context.find(".ctxmenu-menu");
                        if (subContext && subContext.length) {
                            let viewProfile = subContext.find("#vProfile");
                            let joinRoom = subContext.find("#jRoom");
                            let roomDetails = subContext.find("#jRoomDetails");
                            let muteUser = subContext.find("#muteUser");
                            let blockUser = subContext.find("#bUser");
                            blockUser.hide();
                            let roomOwner = subContext.find("#roomOwnerMenu");
                            let friendRequest = subContext.find("#friendRequest");
                            let whisper = subContext.find("#whisper");
                            let muteList = muteUser.find("ul");
                            let muteList_muteChat, muteList_muteNotes, muteList_muteAll;
                            if (user.guest)
                                friendRequest.hide();
                            else
                                friendRequest.show();
                            if (muteList.length) {
                                muteList.css("display", "none");
                                muteUser.data("active", false);
                                muteList_muteChat = muteList.find("#ctx_muteChat");
                                muteList_muteNotes = muteList.find("#ctx_muteNotes");
                                muteList_muteAll = muteList.find("#ctx_muteAll");
                            }
                            if (PianoRhythm.TAB_SELECTED) {
                                switch (PianoRhythm.TAB_SELECTED) {
                                    case "players":
                                        joinRoom.hide();
                                        roomDetails.hide();
                                        viewProfile.show();
                                        break;
                                    case "friends":
                                        joinRoom.show();
                                        roomDetails.hide();
                                        break;
                                }
                                if (user.name === PianoRhythm.CLIENT.name) {
                                    blockUser.hide();
                                    muteUser.hide();
                                    roomOwner.hide();
                                    joinRoom.hide();
                                    friendRequest.hide();
                                    whisper.hide();
                                }
                                else {
                                    blockUser.show();
                                    muteUser.show();
                                    whisper.show();
                                    if (PianoRhythm.CLIENT.loggedIn)
                                        friendRequest.show();
                                    if (PianoRhythm.SOCKET.id === PianoRhythm.ROOM_OWNER_ID) {
                                        roomOwner.show();
                                    }
                                    else {
                                        roomOwner.hide();
                                    }
                                }
                                if (Object.keys(userLI.data()).length > 0 && userLI.data().constructor === Object) {
                                    if (userLI.data("muteChat") !== undefined && muteList_muteChat ||
                                        userLI.data("muteNotes") !== undefined && muteList_muteNotes) {
                                        muteList_muteChat.text(userLI.data("muteChat") || "Mute Chat");
                                        muteList_muteNotes.text(userLI.data("muteNotes") || "Mute Notes");
                                        muteList_muteAll.text((muteList_muteChat.text() == "Mute Chat" && muteList_muteNotes.text() == "Mute Notes") ? "Mute All" : "Unmute All");
                                    }
                                }
                                else {
                                    muteList_muteChat.text("Mute Chat");
                                    muteList_muteNotes.text("Mute Notes");
                                    muteList_muteAll.text("Mute All");
                                }
                            }
                            if (viewProfile && viewProfile.length) {
                                subContext.data("profileName", user.name);
                                subContext.data("profileID", user.uuid);
                                subContext.data("profileSID", user.socketID);
                            }
                        }
                    }
                    return false;
                });
                userLI.data("guest", (user.guest || false));
                userLI.data("blocked", user.blocked || false);
            }
            userLI.click(() => {
                PianoRhythm.hideContextMenus();
                if (!user.friendRequest) {
                    PianoRhythm.setMiniProfile(user, userLI);
                }
                else {
                    function removeRequest() {
                        let index = PianoRhythm.FRIEND_REQUESTS.indexOf(userLI);
                        if (index > -1)
                            PianoRhythm.FRIEND_REQUESTS.splice(index, 1);
                        userLI.remove();
                        PianoRhythm.FRIENDLIST_SORT();
                    }
                    PianoRhythm.notify({
                        message: "Accept or Decline the friend request (Click one)",
                        time: 15000
                    });
                    PianoRhythm.CLIENT_FOCUS = CLIENT_FOCUS.DIALOGUE;
                    PianoRhythm.dimPage(true);
                    var friendRequestBox = new BasicBox({
                        id: "PR_FRIEND_REQUEST", height: 150, width: 300,
                        title: "Be friends with " + user.name + "?", color: PianoRhythm.COLORS.base4
                    });
                    friendRequestBox.box.css({
                        "border": "4px solid white",
                        "display": ""
                    });
                    friendRequestBox.show();
                    friendRequestBox.createHeader({
                        marginTop: "0px",
                        onClose: () => {
                            PianoRhythm.dimPage(false);
                            friendRequestBox.remove();
                            if (PianoRhythm.UPLINK)
                                PianoRhythm.UPLINK.updateRequestsAmount();
                        }
                    });
                    var acceptButton = BasicBox.createButton("Accept", () => {
                        if (PianoRhythm.SOCKET) {
                            PianoRhythm.SOCKET.emit('acceptFriendRequest', { from: user.name }, (err, data) => {
                                if (!err) {
                                    PianoRhythm.notify({
                                        message: "You are now friends with " + user.name + "!"
                                    });
                                    removeRequest();
                                }
                                else {
                                    PianoRhythm.notify({
                                        message: "An error has occurred!"
                                    });
                                }
                                if (PianoRhythm.UPLINK) {
                                    PianoRhythm.UPLINK.requests_Clear();
                                    PianoRhythm.UPLINK.updateRequestsAmount();
                                }
                            });
                        }
                        friendRequestBox.remove();
                        friendRequestBox.destroyed = true;
                        PianoRhythm.dimPage(false);
                    }, {
                        "flex-grow": "1",
                        "padding-left": "15%",
                        "display": "inline-block"
                    });
                    acceptButton.button.css({
                        "background-color": "green"
                    });
                    var declineButton = BasicBox.createButton("Decline", () => {
                        if (PianoRhythm.SOCKET) {
                            PianoRhythm.SOCKET.emit('deleteFriendRequest', { from: user.name }, (err, data) => {
                                if (!err) {
                                    PianoRhythm.notify({
                                        message: "You have denied " + user.name + "'s friend request!"
                                    });
                                    removeRequest();
                                }
                                else {
                                    PianoRhythm.notify({
                                        message: "An error has occurred!"
                                    });
                                }
                                if (PianoRhythm.UPLINK) {
                                    PianoRhythm.UPLINK.requests_Clear();
                                    PianoRhythm.UPLINK.updateRequestsAmount();
                                }
                            });
                        }
                        friendRequestBox.remove();
                        friendRequestBox.destroyed = true;
                        PianoRhythm.dimPage(false);
                    }, {
                        "flex-grow": "1",
                        "display": "inline-block"
                    });
                    declineButton.button.css({
                        "background-color": "red"
                    });
                    friendRequestBox.box.append(acceptButton);
                    friendRequestBox.box.append(declineButton);
                    friendRequestBox.center3();
                    PianoRhythm.BODY.append(friendRequestBox.box);
                }
                userLI.css("animation", "roomPressed 0.1s");
                setTimeout(() => {
                    userLI.css("animation", "none");
                }, 100);
            });
            userLI["textResized"] = false;
            return userLI;
        }
        return null;
    }
    static hideContextMenus() {
        if (PianoRhythm.CONTEXT_MENU)
            PianoRhythm.CONTEXT_MENU.css("display", "none");
        if (PianoRhythm.CONTEXT_MENU2)
            PianoRhythm.CONTEXT_MENU2.css("display", "none");
        if (PianoRhythm.CONTEXT_MENU_DOCK)
            PianoRhythm.CONTEXT_MENU_DOCK.css("display", "none");
    }
    static destroyUserLI(id) {
        if (!id)
            return;
        if (!PianoRhythm.PLAYER_SOCKET_LIST)
            return;
        if (!PianoRhythm.SOCKET)
            return;
        if (PianoRhythm.PLAYER_SOCKET_LIST.has(id)) {
            let user = PianoRhythm.PLAYER_SOCKET_LIST.get(id);
            let userli = user["userLI"];
            let mouse = user["mouse"];
            let name = user["name"];
            if (mouse)
                mouse.remove();
            let index = PianoRhythm.WHO_IS_TYPING.indexOf(name);
            PianoRhythm.WHO_IS_TYPING.splice(index, 1);
            PianoRhythm.displayTypers();
            try {
                let qtip = $(".qTip_userLI_" + name);
                if (qtip && qtip.length > 0) {
                    qtip.qtip('destroy', true);
                }
            }
            catch (err) { }
            if (user && userli && userli.length)
                userli.fadeOut(500, () => {
                    userli.remove();
                    PianoRhythm.PLAYER_SOCKET_LIST.delete(id);
                    PianoRhythm.SOCKET.emit("checkPlayerList", {
                        count: PianoRhythm.PLAYER_SOCKET_LIST.size
                    });
                    PianoRhythm.USERLIST_SORT();
                });
        }
    }
    static destroyRoomLI(id) {
        let existingRoom = PianoRhythm.ROOMLIST.find("[data-id='" + id + "']");
        if (existingRoom && existingRoom.length) {
            existingRoom.fadeOut(800, () => {
                existingRoom.remove();
            });
            PianoRhythm.PLAYER_ROOM_LIST.delete(id);
            return true;
        }
        return false;
    }
    static createRoomLI(name, amount = 0, color = "white", type = "Chat and Play", extra) {
        let roomLI = $("<li>");
        if (color === undefined || color === null)
            color = "white";
        if (type === undefined || type === null)
            type = "Chat and Play";
        roomLI.attr("data-name", "rm_" + name);
        roomLI.attr("draggable", "false");
        if (extra && extra.id)
            roomLI.attr("data-id", extra.id);
        roomLI.attr("class", "roomLI noselect");
        let roomAmt = $("<a>");
        roomAmt.css({
            "border-radius": "100%",
            "margin-left": "10px",
            "font-size": "15px",
            "width": "30px",
            "height": "22px",
            "text-align": "center",
            "padding-right": "10px"
        });
        roomAmt.attr("title", "Displays the amount of players currently in the room.");
        roomAmt.html("(" + amount + ")");
        roomLI["roomAmt"] = roomAmt;
        if (type && type.toLowerCase() !== "lobby" && type.toLowerCase() !== "lobby_turn" && type.toLowerCase() !== "turn based")
            roomAmt.html(amount + "/" + ((extra && extra.maxPlayers) ? extra.maxPlayers : 20));
        roomAmt.qtip();
        let img;
        img = $("<img>");
        img.attr("src", "/images/icons/essential/locked-4.png");
        img.attr("title", "This room is password protected!");
        img.css({
            position: "absolute",
            width: "18px",
            top: "32px",
            left: "163px",
            "z-index": "1"
        });
        img.qtip();
        img.hide();
        if (extra && extra.hasPassword) {
            img.show();
        }
        roomLI["lockImg"] = img;
        let roomName = $("<a>");
        roomName.css({
            position: "absolute",
            color: color,
            "width": "70%",
            "border-bottom": "1px solid white",
            "text-overflow": "ellipsis",
            "white-space": "nowrap",
            "overflow": "hidden",
            "font-style": (extra && extra.inProgress ? "italic" : "")
        });
        roomLI["roomName"] = roomName;
        if (type && type.toLowerCase() !== "lobby")
            roomName.css({ "width": "65%" });
        let extraMessage = "";
        roomName.attr("title", "Room: " + name + extraMessage);
        roomName.html(name);
        roomName.qtip();
        if (type === undefined)
            type = "Chat and Play";
        let roomType = $("<a>");
        roomType.css({
            position: "absolute",
            color: color,
            top: "32px",
            "font-size": "11px",
            "width": "70%",
            "text-overflow": "ellipsis",
            "white-space": "nowrap",
            "overflow": "hidden",
            "font-style": (extra && extra.inProgress ? "italic" : "")
        });
        roomType.attr("title", "Room Type: " + (extra && extra.typeName ? extra.typeName : type)
            + (extra && extra.inProgress ? " | Game In Progress" : ""));
        roomType.html(type);
        roomType.qtip();
        roomLI["roomType"] = roomType;
        if (extra && extra.inProgress) {
            let img2 = $("<img>");
            img2.attr("src", "/images/icons/essential/play-button-1.png");
            img2.attr("title", "The game has already started. You cannot enter yet.");
            img2.css({
                position: "absolute",
                width: "18px",
                top: "32px",
                left: "96px",
                "z-index": "1"
            });
            img2.qtip();
            roomLI.append(img2);
            roomLI["inProgressImg"] = img2;
        }
        roomLI.append(roomAmt);
        if (img && extra && extra.hasPassword)
            roomLI.append(img);
        roomLI.append(roomName);
        roomLI.append(roomType);
        let specialTag = false;
        if (name.indexOf("[BDEV]") === 0 || name.indexOf("[DEV]") === 0)
            specialTag = true;
        let join_roomName = (specialTag) ? name.substring(name.indexOf("]") + 2, name.length) : name;
        roomLI.click((e) => {
            roomLI.css("animation", "roomPressed 0.1s");
            setTimeout(() => {
                roomLI.css("animation", "none");
            }, 100);
            PianoRhythm.joinRoom(join_roomName);
            e.preventDefault();
        });
        roomLI.on("contextmenu", function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (PianoRhythm.CONTEXT_MENU2)
                PianoRhythm.CONTEXT_MENU2.hide();
            if (PianoRhythm.CONTEXT_MENU_DOCK)
                PianoRhythm.CONTEXT_MENU_DOCK.hide();
            let context = PianoRhythm.CONTEXT_MENU;
            if (context && context.length) {
                context.show();
                context.css({ "left": e.clientX, "top": e.clientY });
                let subContext = context.find(".ctxmenu-menu");
                if (subContext && subContext.length) {
                    let viewProfile = subContext.find("#vProfile");
                    let joinRoom = subContext.find("#jRoom");
                    let roomDetails = subContext.find("#jRoomDetails");
                    let muteUser = subContext.find("#muteUser");
                    let blockUser = subContext.find("#bUser");
                    let roomOwner = subContext.find("#roomOwnerMenu");
                    let friendRequest = subContext.find("#friendRequest");
                    let whisper = subContext.find("#whisper");
                    viewProfile.hide();
                    blockUser.hide();
                    muteUser.hide();
                    roomOwner.hide();
                    friendRequest.hide();
                    whisper.hide();
                    joinRoom.show();
                    roomDetails.show();
                    joinRoom.click(() => {
                        PianoRhythm.joinRoom(join_roomName);
                        context.hide();
                    });
                }
            }
            return false;
        });
        return roomLI;
    }
    static setMuteNotesButtonData(name, type, userLI, extra) {
        let message = "";
        let username = name;
        let color = "lightgray";
        let css = " style='color:" + color + ";font-weight: bold;'>";
        switch (type.toLowerCase()) {
            case "fail":
                message = "The attempt to mute " + username + " has failed.";
                if (username.toLowerCase() === PianoRhythm.CLIENT.name.toLowerCase())
                    message += " You can't mute yourself!";
                break;
            case "unmute":
                message = "You've successfully <span style='color:lawngreen'>unmuted</span> the notes from: <span" + css + username +
                    "</span>";
                if (userLI)
                    userLI.data("muteNotes", "Mute Notes");
                if (PianoRhythm.MINI_PROFILE_MUTE_NOTES_BUTTON)
                    PianoRhythm.MINI_PROFILE_MUTE_NOTES_BUTTON.text(userLI.data("muteNotes"));
                if (extra.socketID) {
                    var targetNameStatus = $("#userLI_Name2_" + extra.socketID);
                    if (userLI && userLI.data("muteChat") !== "Unmute Chat")
                        if (targetNameStatus && targetNameStatus.length) {
                            targetNameStatus.text("");
                            targetNameStatus.css("left", "");
                            userLI.targetNameStatus = targetNameStatus;
                        }
                    PianoRhythm.MUTED_NOTE_PLAYERS.delete(extra.uuid);
                }
                break;
            case "mute":
                message = "You've successfully <span style='color:red'>muted</span> the notes from: <span" + css + username +
                    "</span>";
                if (userLI)
                    userLI.data("muteNotes", "Unmute Notes");
                if (PianoRhythm.MINI_PROFILE_MUTE_NOTES_BUTTON)
                    PianoRhythm.MINI_PROFILE_MUTE_NOTES_BUTTON.text(userLI.data("muteNotes"));
                if (extra.socketID) {
                    var targetNameStatus = $("#userLI_Name2_" + extra.socketID);
                    if (targetNameStatus && targetNameStatus.length) {
                        targetNameStatus.text("MUTED");
                        targetNameStatus.css("left", 81);
                    }
                    PianoRhythm.MUTED_NOTE_PLAYERS.add(extra.uuid);
                }
                break;
        }
        if (PianoRhythm.CLIENT && PianoRhythm.MUTED_NOTE_PLAYERS) {
            PianoRhythm.saveSetting("MUTED_NOTES", "notes", JSON.stringify(Array.from(PianoRhythm.MUTED_NOTE_PLAYERS)));
        }
        if (message.length > 0)
            PianoRhythm.notify({
                message: message
            });
    }
    static setMuteChatButtonData(name, type, userLI, extra) {
        let message = "";
        let username = name;
        let color = "lightgray";
        let css = " style='color:" + color + ";font-weight: bold;'>";
        switch (type.toLowerCase()) {
            case "fail":
                message = "The attempt to mute " + username + " has failed.";
                if (username.toLowerCase() === PianoRhythm.CLIENT.name.toLowerCase())
                    message += " You can't mute yourself!";
                break;
            case "unmute":
                message = "You've successfully <span style='color:lawngreen'>unmuted</span> the chat from: <span" + css + username +
                    "</span>";
                if (userLI)
                    userLI.data("muteChat", "Mute Chat");
                if (PianoRhythm.MINI_PROFILE_MUTE_CHAT_BUTTON)
                    PianoRhythm.MINI_PROFILE_MUTE_CHAT_BUTTON.text(userLI.data("muteChat"));
                if (extra && extra.uuid) {
                    var targetNameStatus = $("#userLI_Name2_" + extra.socketID);
                    if (userLI && userLI.data("muteNotes") !== "Unmute Notes")
                        if (targetNameStatus && targetNameStatus.length) {
                            targetNameStatus.text("");
                            targetNameStatus.css("left", "");
                        }
                    PianoRhythm.MUTED_CHAT_PLAYERS.delete(extra.uuid);
                }
                break;
            case "mute":
                message = "You've successfully <span style='color:red'>muted</span> the chat from: <span" + css + username +
                    "</span>";
                if (userLI)
                    userLI.data("muteChat", "Unmute Chat");
                if (PianoRhythm.MINI_PROFILE_MUTE_CHAT_BUTTON)
                    PianoRhythm.MINI_PROFILE_MUTE_CHAT_BUTTON.text(userLI.data("muteChat"));
                if (extra && extra.uuid) {
                    var targetNameStatus = $("#userLI_Name2_" + extra.socketID);
                    if (targetNameStatus && targetNameStatus.length) {
                        targetNameStatus.text("MUTED");
                        targetNameStatus.css("left", 81);
                    }
                    PianoRhythm.MUTED_CHAT_PLAYERS.add(extra.uuid);
                }
                break;
        }
        if (message.length > 0) {
            PianoRhythm.notify({
                message: message
            });
        }
        PianoRhythm.saveSetting("MUTED_CHAT", "chat", JSON.stringify(Array.from(PianoRhythm.MUTED_CHAT_PLAYERS)));
    }
    static createMiniProfile() {
        let miniProfile = $(document.createElement('div'));
        miniProfile.addClass("miniProfile noselect miniProfileChild");
        let top = 0;
        let actualBottom = top + 420;
        if (actualBottom > window.innerHeight)
            top -= (actualBottom - window.innerHeight) + 55;
        miniProfile.css({
            left: PianoRhythm.SIDEBAR_OFFSET - 1,
            top: top,
            "z-index": 999
        });
        let miniProfile_header_image = $(document.createElement('div'));
        miniProfile_header_image.addClass("miniProfileHeaderImageParent miniProfileChild");
        miniProfile_header_image.css({
            width: "100%",
            height: "100%",
        });
        let headerImage = $("<img>");
        headerImage.addClass("miniProfileHeaderImage miniProfileChild");
        miniProfile_header_image.append(headerImage);
        let headerText = $("<div>");
        headerText.find("span").remove();
        headerText.css("border-bottom", "none");
        headerText.addClass("miniProfileHeaderText miniProfileChild");
        miniProfile_header_image.append(headerText);
        let miniProfile_header = $(document.createElement('header'));
        miniProfile_header.addClass("miniProfileHeader miniProfileChild");
        miniProfile_header.append(miniProfile_header_image);
        miniProfile_header.css({
            background: PianoRhythm.COLORS.UI_miniProfileHeader
        });
        let miniProfile_body = $(document.createElement('div'));
        miniProfile_body.addClass("miniProfileBody");
        let miniProfile_footer = $(document.createElement('div'));
        miniProfile_footer.addClass("miniProfileFooter miniProfileChild");
        miniProfile_footer.text("Status: Online");
        miniProfile_footer.css("color", "green");
        miniProfile.append(miniProfile_header);
        miniProfile.append(miniProfile_body);
        miniProfile.append(miniProfile_footer);
        PianoRhythm.MINI_PROFILE_MESSAGE_BUTTON = $(document.createElement('button'));
        PianoRhythm.MINI_PROFILE_MESSAGE_BUTTON.addClass("rkmd-btn miniProfileButton miniProfileChild");
        PianoRhythm.MINI_PROFILE_MESSAGE_BUTTON.text("Whisper");
        PianoRhythm.MINI_PROFILE_MESSAGE_BUTTON.click(() => {
            if (PianoRhythm.CMESSAGEINPUT && PianoRhythm.CMESSAGEINPUT.length) {
                let name = PianoRhythm.MINI_PROFILE_MESSAGE_BUTTON.data("name");
                if (name) {
                    PianoRhythm.CMESSAGEINPUT.val("/whisper (" + name + ") ");
                    PianoRhythm.hideContextMenus();
                    PianoRhythm.CMESSAGEINPUT.trigger("focus");
                    PianoRhythm.FOCUS_CHAT();
                    if (PianoRhythm.MINI_PROFILE) {
                        PianoRhythm.MINI_PROFILE.data("user", null);
                        PianoRhythm.MINI_PROFILE.hide();
                        PianoRhythm.MINI_PROFILE_VISIBLE = false;
                    }
                }
            }
        });
        PianoRhythm.MINI_PROFILE_FRIEND_BUTTON = $(document.createElement('button'));
        PianoRhythm.MINI_PROFILE_FRIEND_BUTTON.addClass("rkmd-btn miniProfileButton miniProfileChild");
        PianoRhythm.MINI_PROFILE_FRIEND_BUTTON.text("Friend Request");
        PianoRhythm.MINI_PROFILE_FRIEND_BUTTON.click(() => {
            if (PianoRhythm.CLIENT === undefined)
                return;
            if (!PianoRhythm.MINI_PROFILE.data("user"))
                return;
            PianoRhythm.MINI_PROFILE_FRIEND_BUTTON.data("user", PianoRhythm.MINI_PROFILE.data("user"));
            let name = PianoRhythm.MINI_PROFILE_FRIEND_BUTTON.data("user");
            if (PianoRhythm.MINI_PROFILE_FRIEND_BUTTON.text() === "Unfriend") {
                PianoRhythm.CLIENT_FOCUS = CLIENT_FOCUS.DIALOGUE;
                PianoRhythm.dimPage(true);
                let unfriendBox = new BasicBox({
                    id: "PR_UNFRIEND", height: 150, width: 350,
                    title: "Are you sure you want to unfriend " + (name) + "?", color: PianoRhythm.COLORS.base4
                });
                unfriendBox.box.css({
                    "border": "4px solid white",
                    "display": ""
                });
                unfriendBox.show();
                unfriendBox.createHeader({
                    marginTop: "0px",
                    onClose: () => {
                        unfriendBox.remove();
                        unfriendBox.destroyed = true;
                        PianoRhythm.dimPage(false);
                    }
                });
                let acceptButton = BasicBox.createButton("Yes", () => {
                    if (PianoRhythm.SOCKET) {
                        PianoRhythm.SOCKET.emit('unfriend', { userName: name }, function (err, results) {
                            var message = "";
                            if (err) {
                                message = "An error has occurred!";
                                if (results === "dbdown")
                                    message += " The database is down!";
                                if (results === "notfriends")
                                    message += " Seems like you guys were no longer friends!";
                            }
                            else {
                                message = "You have successfully unfriended " + name + "!";
                                PianoRhythm.MINI_PROFILE_FRIEND_BUTTON.text("Friend Request");
                                PianoRhythm.MINI_PROFILE_FRIEND_BUTTON.data("user", null);
                            }
                            PianoRhythm.notify({ message: message });
                            PianoRhythm.hideMiniProfile();
                        });
                    }
                    unfriendBox.remove();
                    unfriendBox.destroyed = true;
                    PianoRhythm.dimPage(false);
                }, {
                    "flex-grow": "1",
                    "padding-left": "28%",
                    "display": "inline-block"
                });
                acceptButton.button.css({
                    "background-color": "green"
                });
                let declineButton = BasicBox.createButton("No", () => {
                    unfriendBox.remove();
                    unfriendBox.destroyed = true;
                    PianoRhythm.dimPage(false);
                    PianoRhythm.MINI_PROFILE_FRIEND_BUTTON.data("user", null);
                    PianoRhythm.hideMiniProfile();
                }, {
                    "flex-grow": "1",
                    "display": "inline-block"
                });
                declineButton.button.css({
                    "background-color": "red"
                });
                unfriendBox.box.append(acceptButton);
                unfriendBox.box.append(declineButton);
                unfriendBox.center3();
                PianoRhythm.BODY.append(unfriendBox.box);
            }
            else {
                PianoRhythm.sendFriendRequest(name, function (err, results) {
                    if (err) {
                        PianoRhythm.notify({
                            message: "Friend request failed. You or they have already reached their friend limit or you are already friends with them."
                        });
                        if (PianoRhythm.DEBUG_MESSAGING)
                            console.log("Friend Request Result", results);
                        return;
                    }
                    var friended = false;
                    var message = "You have successfully sent a friend request to " + name + "!";
                    if (results && results === "success_add") {
                        message = "You are now friends with " + name + "!";
                        friended = true;
                        PianoRhythm.MINI_PROFILE_FRIEND_BUTTON.text("Unfriend");
                    }
                    if (!friended) {
                        PianoRhythm.MINI_PROFILE_FRIEND_BUTTON.text("Request Pending");
                        PianoRhythm.MINI_PROFILE_FRIEND_BUTTON.attr({
                            "title": "You have sent a friend request to " + name,
                            "disabled": "disabled"
                        });
                    }
                    PianoRhythm.notify({
                        message: message
                    });
                    PianoRhythm.MINI_PROFILE_FRIEND_requestPending = true;
                });
            }
        });
        PianoRhythm.MINI_PROFILE_FRIEND_BUTTON.attr({ "disabled": "disabled" });
        PianoRhythm.MINI_PROFILE_MUTE_NOTES_BUTTON = $(document.createElement('button'));
        PianoRhythm.MINI_PROFILE_MUTE_NOTES_BUTTON.addClass("rkmd-btn miniProfileButton miniProfileChild");
        PianoRhythm.MINI_PROFILE_MUTE_NOTES_BUTTON.text("Mute Notes");
        PianoRhythm.MINI_PROFILE_MUTE_NOTES_BUTTON.click(() => {
            let extra = PianoRhythm.MINI_PROFILE.data("user_data");
            if (extra) {
                let name = extra.name;
                let user = PianoRhythm.PLAYER_SOCKET_LIST.get(extra.socketID);
                if (user && extra.uuid && extra.socketID) {
                    let userLI = user["userLI"];
                    if (PianoRhythm.CLIENT.loggedIn) {
                        PianoRhythm.mutePlayerNotes(name, extra.uuid, extra.socketID, (err, result) => {
                            if (err) {
                                PianoRhythm.notify({
                                    message: "An error has occurred. " + (result.message) ? result.message : ""
                                });
                                return;
                            }
                            if (result) {
                                if (result.message && result.userName && result.list) {
                                    PianoRhythm.setMuteNotesButtonData(result.userName, result.message, userLI, extra);
                                }
                            }
                        });
                    }
                    else {
                        if (userLI.data("muteNotes")) {
                            let type = userLI.data("muteNotes") == "Unmute Notes" ? "unmute" : "mute";
                            PianoRhythm.setMuteNotesButtonData(name, type, userLI, extra);
                        }
                    }
                }
            }
            PianoRhythm.hideMiniProfile();
        });
        PianoRhythm.MINI_PROFILE_MUTE_CHAT_BUTTON = $(document.createElement('button'));
        PianoRhythm.MINI_PROFILE_MUTE_CHAT_BUTTON.addClass("rkmd-btn miniProfileButton miniProfileChild");
        PianoRhythm.MINI_PROFILE_MUTE_CHAT_BUTTON.text("Mute Chat");
        PianoRhythm.MINI_PROFILE_MUTE_CHAT_BUTTON.click(() => {
            let extra = PianoRhythm.MINI_PROFILE.data("user_data");
            if (extra) {
                let name = extra.name;
                let user = PianoRhythm.PLAYER_SOCKET_LIST.get(extra.socketID);
                if (user && extra.uuid && extra.socketID) {
                    let userLI = user["userLI"];
                    if (PianoRhythm.CLIENT.loggedIn) {
                        PianoRhythm.mutePlayerChat(name, extra.uuid, extra.socketID, (err, result) => {
                            if (err) {
                                PianoRhythm.notify({
                                    message: "An error has occurred. " + (result.message) ? result.message : ""
                                });
                                return;
                            }
                            if (result) {
                                if (result.message && result.userName && result.list) {
                                    PianoRhythm.setMuteChatButtonData(result.userName, result.message, userLI, extra);
                                }
                            }
                        });
                    }
                    else {
                        if (userLI.data("muteChat")) {
                            let type = userLI.data("muteChat") == "Unmute Chat" ? "unmute" : "mute";
                            PianoRhythm.setMuteChatButtonData(name, type, userLI, extra);
                        }
                    }
                }
            }
            PianoRhythm.hideMiniProfile();
        });
        PianoRhythm.MINI_PROFILE_MAIL_BUTTON = $(document.createElement('button'));
        PianoRhythm.MINI_PROFILE_MAIL_BUTTON.addClass("rkmd-btn miniProfileButton miniProfileChild");
        PianoRhythm.MINI_PROFILE_MAIL_BUTTON.text("Message");
        PianoRhythm.MINI_PROFILE_MAIL_BUTTON.click(() => {
        });
        PianoRhythm.MINI_PROFILE_HEADER = miniProfile_header;
        PianoRhythm.MINI_PROFILE_HEADER_IMAGE_PARENT = miniProfile_header_image;
        PianoRhythm.MINI_PROFILE_BODY = miniProfile_body;
        PianoRhythm.MINI_PROFILE_FOOTER = miniProfile_footer;
        PianoRhythm.MINI_PROFILE = miniProfile;
        PianoRhythm.MINI_PROFILE_BODY.append(PianoRhythm.MINI_PROFILE_MESSAGE_BUTTON);
        PianoRhythm.MINI_PROFILE_BODY.append(PianoRhythm.MINI_PROFILE_FRIEND_BUTTON);
        PianoRhythm.MINI_PROFILE_BODY.append(PianoRhythm.MINI_PROFILE_MAIL_BUTTON);
        PianoRhythm.MINI_PROFILE_BODY.append(PianoRhythm.MINI_PROFILE_MUTE_NOTES_BUTTON);
        PianoRhythm.MINI_PROFILE_BODY.append(PianoRhythm.MINI_PROFILE_MUTE_CHAT_BUTTON);
        $('body').append(miniProfile);
    }
    static setMiniProfile(user, userLI) {
        if (!PianoRhythm.SOCKET)
            return;
        if (!PianoRhythm.MINI_PROFILE)
            PianoRhythm.createMiniProfile();
        if (PianoRhythm.MINI_PROFILE) {
            if (user.name && user.socketID && userLI || user.friendLI) {
                let _user = PianoRhythm.PLAYER_SOCKET_LIST.get(user.socketID);
                if (_user) {
                    if (_user["nickname"])
                        user.nickname = _user["nickname"];
                }
                let oldName = PianoRhythm.MINI_PROFILE.data("user");
                if (oldName === user.name) {
                    PianoRhythm.hideMiniProfile();
                    return;
                }
                PianoRhythm.hideMiniProfile();
                PianoRhythm.MINI_PROFILE.data("user_data", user);
                let height = 420;
                PianoRhythm.MINI_PROFILE_MAIL_BUTTON.css('display', 'none');
                PianoRhythm.MINI_PROFILE_MESSAGE_BUTTON.css('display', 'none');
                PianoRhythm.MINI_PROFILE_FRIEND_BUTTON.css('display', 'none');
                PianoRhythm.MINI_PROFILE_MUTE_NOTES_BUTTON.css('display', 'none');
                PianoRhythm.MINI_PROFILE_MUTE_CHAT_BUTTON.css('display', 'none');
                try {
                    let qtip = $(".qTip_" + user.name);
                    if (qtip && qtip.length > 0) {
                        qtip.qtip('destroy', true);
                    }
                }
                catch (err) {
                }
                PianoRhythm.MINI_PROFILE.data("user", user.name);
                if (!user.friendLI)
                    PianoRhythm.MINI_PROFILE.data("id", user.socketID);
                PianoRhythm.MINI_PROFILE_MESSAGE_BUTTON.data("name", user.name);
                PianoRhythm.MINI_PROFILE_HEADER_IMAGE_PARENT.empty();
                PianoRhythm.MINI_PROFILE_HEADER_IMAGE = userLI["img"].clone(false);
                PianoRhythm.MINI_PROFILE_HEADER_IMAGE.addClass("miniProfileHeaderImage");
                PianoRhythm.MINI_PROFILE_HEADER_IMAGE.attr("draggable", "false");
                PianoRhythm.MINI_PROFILE_HEADER_IMAGE_PARENT.append(PianoRhythm.MINI_PROFILE_HEADER_IMAGE);
                PianoRhythm.MINI_PROFILE_viewProfileText = $(document.createElement('div'));
                PianoRhythm.MINI_PROFILE_viewProfileText.addClass("headerImageViewProfile");
                PianoRhythm.MINI_PROFILE_viewProfileText.text("View Profile");
                PianoRhythm.MINI_PROFILE_HEADER_IMAGE_PARENT.append(PianoRhythm.MINI_PROFILE_viewProfileText);
                PianoRhythm.MINI_PROFILE_HEADER_IMAGE.hover(() => {
                    PianoRhythm.MINI_PROFILE_viewProfileText.css("opacity", 1);
                }, () => {
                    PianoRhythm.MINI_PROFILE_viewProfileText.css("opacity", 0);
                });
                PianoRhythm.MINI_PROFILE_HEADER_IMAGE.click(() => {
                    PianoRhythm.MINI_PROFILE.css("display", "none");
                    PianoRhythm.setMainProfile(user, userLI);
                });
                PianoRhythm.MINI_PROFILE_HEADER_TEXT = $(document.createElement('div'));
                PianoRhythm.MINI_PROFILE_HEADER_TEXT.text(user.nickname || user.name);
                PianoRhythm.MINI_PROFILE_HEADER_TEXT.addClass("miniProfileHeaderText");
                PianoRhythm.MINI_PROFILE_HEADER_TEXT2 = $(document.createElement('div'));
                PianoRhythm.MINI_PROFILE_HEADER_TEXT2.html("#" + user.name);
                PianoRhythm.MINI_PROFILE_HEADER_TEXT2.addClass("miniProfileHeaderText2");
                PianoRhythm.MINI_PROFILE_HEADER_IMAGE_PARENT.append(PianoRhythm.MINI_PROFILE_HEADER_TEXT);
                PianoRhythm.MINI_PROFILE_HEADER_IMAGE_PARENT.append(PianoRhythm.MINI_PROFILE_HEADER_TEXT2);
                if (PianoRhythm.CLIENT && user.name.toLowerCase() !== PianoRhythm.CLIENT.name.toLowerCase()) {
                    if (PianoRhythm.MINI_PROFILE_SET_STATUS_BUTTON) {
                        PianoRhythm.MINI_PROFILE_SET_STATUS_BUTTON.css('display', 'none');
                        PianoRhythm.MINI_PROFILE_RESET_STATUS_BUTTON.css('display', 'none');
                        PianoRhythm.MINI_PROFILE_INPUT_STATUS.css('display', 'none');
                    }
                    if (PianoRhythm.CLIENT && PianoRhythm.CLIENT.loggedIn) {
                        PianoRhythm.MINI_PROFILE_MAIL_BUTTON.css('display', '');
                        PianoRhythm.MINI_PROFILE_FRIEND_BUTTON.css('display', '');
                        PianoRhythm.MINI_PROFILE_HEADER.css("height", "40%");
                        PianoRhythm.MINI_PROFILE_BODY.css("height", "55%");
                        PianoRhythm.MINI_PROFILE_FOOTER.css("height", "7%");
                        height = 420;
                        PianoRhythm.MINI_PROFILE_HEADER_TEXT[0].style.top = "28%";
                        PianoRhythm.MINI_PROFILE_HEADER_TEXT2[0].style.top = "35%";
                    }
                    else {
                        PianoRhythm.MINI_PROFILE_HEADER.css("height", "65%");
                        PianoRhythm.MINI_PROFILE_BODY.css("height", "55%");
                        PianoRhythm.MINI_PROFILE_FOOTER.css("height", "7%");
                        height = 330;
                        PianoRhythm.MINI_PROFILE_HEADER_TEXT[0].style.top = "36%";
                        PianoRhythm.MINI_PROFILE_HEADER_TEXT2[0].style.top = "45%";
                    }
                    if (!user.friendLI) {
                        PianoRhythm.MINI_PROFILE_MUTE_NOTES_BUTTON.css('display', '');
                        PianoRhythm.MINI_PROFILE_MUTE_CHAT_BUTTON.css('display', '');
                        PianoRhythm.MINI_PROFILE_MESSAGE_BUTTON.css('display', '');
                    }
                    else {
                        PianoRhythm.MINI_PROFILE_HEADER.css("height", "90%");
                        PianoRhythm.MINI_PROFILE_BODY.css("height", "55%");
                        PianoRhythm.MINI_PROFILE_FOOTER.css("height", "7%");
                        height = 300;
                        PianoRhythm.MINI_PROFILE_HEADER_TEXT[0].style.top = "39%";
                        PianoRhythm.MINI_PROFILE_HEADER_TEXT2[0].style.top = "50%";
                    }
                    let pendingMessage = "";
                    if (!user.guest)
                        PianoRhythm.SOCKET.emit('miniProfileView', { userName: user.name }, function (err, results) {
                            PianoRhythm.MINI_PROFILE_FOOTER.text("");
                            if (err) {
                                let message1 = "";
                                let message2 = "";
                                switch (results) {
                                    case "alreadyfriends":
                                        PianoRhythm.MINI_PROFILE_FRIEND_BUTTON.text("Unfriend");
                                        PianoRhythm.MINI_PROFILE_FRIEND_BUTTON.attr("title", "Unfriend " + name + "!");
                                        PianoRhythm.MINI_PROFILE_FRIEND_BUTTON.removeAttr("disabled");
                                        PianoRhythm.MINI_PROFILE_FOOTER.css("color", "green");
                                        PianoRhythm.MINI_PROFILE_FOOTER.text("Status: Online");
                                        break;
                                    case "me":
                                        PianoRhythm.MINI_PROFILE_FRIEND_BUTTON.css('display', 'none');
                                        PianoRhythm.MINI_PROFILE_MAIL_BUTTON.css('display', 'none');
                                        break;
                                    case "notlogged":
                                        message1 = "You must be logged in to send friend requests!";
                                        message2 = "You must be logged in to send messages!";
                                        break;
                                    case "p_notlogged":
                                        message1 = "Player must be logged in to receive friend requests!";
                                        message2 = "Player must be logged in to receive messages!";
                                        break;
                                    case "nodb":
                                        message1 = message2 = "The database is down. Unable to send request.";
                                        break;
                                    case "alreadysent-fr":
                                        message1 = "You've already sent a friend request!";
                                        PianoRhythm.MINI_PROFILE_FRIEND_BUTTON.text("Request Pending");
                                        PianoRhythm.MINI_PROFILE_FRIEND_requestPending = true;
                                        break;
                                    case "offline":
                                        PianoRhythm.MINI_PROFILE_FRIEND_BUTTON.text("Unfriend");
                                        PianoRhythm.MINI_PROFILE_FRIEND_BUTTON.attr("title", "Unfriend " + name + "!");
                                        if (user.lastOnline) {
                                            PianoRhythm.MINI_PROFILE_FOOTER.text("Status: Offline | Last Online: " + new Date(user.lastOnline).toDateString());
                                        }
                                        else {
                                            PianoRhythm.MINI_PROFILE_FOOTER.text("Status: Offline");
                                        }
                                        PianoRhythm.MINI_PROFILE_FOOTER.css("color", "red");
                                        PianoRhythm.MINI_PROFILE_FRIEND_BUTTON.removeAttr("disabled");
                                        break;
                                }
                                if (results === "nodb" && message2.length > 0) {
                                    PianoRhythm.MINI_PROFILE_MAIL_BUTTON.attr({
                                        "title": message2,
                                        "disabled": "disabled"
                                    });
                                }
                                pendingMessage = message1;
                                return;
                            }
                            PianoRhythm.MINI_PROFILE_FRIEND_BUTTON.text("Friend Request");
                            if (!user.blocked)
                                PianoRhythm.MINI_PROFILE_FRIEND_BUTTON.removeAttr("disabled");
                        });
                    else {
                        PianoRhythm.MINI_PROFILE_FOOTER.css("color", "green");
                        PianoRhythm.MINI_PROFILE_FOOTER.text("Status: Online");
                    }
                    if (userLI && userLI.data("muteChat"))
                        PianoRhythm.MINI_PROFILE_MUTE_CHAT_BUTTON.text(userLI.data("muteChat"));
                    if (userLI && userLI.data("muteNotes"))
                        PianoRhythm.MINI_PROFILE_MUTE_NOTES_BUTTON.text(userLI.data("muteNotes"));
                    PianoRhythm.MINI_PROFILE_MAIL_BUTTON.attr("title", "Send a message to " + user.name + " through the UPLINK!");
                    PianoRhythm.MINI_PROFILE_MESSAGE_BUTTON.attr("title", "Whisper a message to " + user.name + "!");
                    PianoRhythm.MINI_PROFILE_FRIEND_BUTTON.attr("title", "Send a friend request to " + user.name + "!");
                    PianoRhythm.MINI_PROFILE_MUTE_NOTES_BUTTON.attr("title", "Mute " + user.name + "'s notes!");
                    PianoRhythm.MINI_PROFILE_MUTE_CHAT_BUTTON.attr("title", "Mute/Unmute " + user.name + "'s chat messages!");
                    PianoRhythm.MINI_PROFILE_MAIL_BUTTON["qtip"]({ style: { classes: "qTip_" + user.name + " qtip-light qtip_custom" } });
                    PianoRhythm.MINI_PROFILE_FRIEND_BUTTON["qtip"]({ style: { classes: "qTip_" + user.name + " qtip-light qtip_custom" } });
                    PianoRhythm.MINI_PROFILE_MESSAGE_BUTTON["qtip"]({ style: { classes: "qTip_" + user.name + " qtip-light qtip_custom" } });
                    PianoRhythm.MINI_PROFILE_MUTE_NOTES_BUTTON["qtip"]({ style: { classes: "qTip_" + user.name + " qtip-light qtip_custom" } });
                    PianoRhythm.MINI_PROFILE_MUTE_CHAT_BUTTON["qtip"]({ style: { classes: "qTip_" + user.name + " qtip-light qtip_custom" } });
                    if (user.blocked || user.guest) {
                        PianoRhythm.MINI_PROFILE_MAIL_BUTTON.attr('disabled', 'disabled');
                        PianoRhythm.MINI_PROFILE_FRIEND_BUTTON.attr('disabled', 'disabled');
                    }
                    else {
                        PianoRhythm.MINI_PROFILE_MAIL_BUTTON.removeAttr('disabled');
                        PianoRhythm.MINI_PROFILE_FRIEND_BUTTON.removeAttr('disabled');
                    }
                }
                else {
                    if (PianoRhythm.MINI_PROFILE_SET_STATUS_BUTTON) {
                        PianoRhythm.MINI_PROFILE_SET_STATUS_BUTTON.css('display', '');
                        PianoRhythm.MINI_PROFILE_RESET_STATUS_BUTTON.css('display', '');
                        PianoRhythm.MINI_PROFILE_INPUT_STATUS.css('display', '');
                        PianoRhythm.MINI_PROFILE_INPUT_STATUS.attr("id", "userLI_InputStatus_" + user.name);
                        PianoRhythm.MINI_PROFILE_INPUT_STATUS.attr("id", "userLI_InputStatus_" + user.socketID);
                        PianoRhythm.MINI_PROFILE_INPUT_STATUS.attr("name", user.name);
                    }
                    PianoRhythm.MINI_PROFILE_BODY.css("height", "51%");
                    if (!PianoRhythm.MINI_PROFILE_SET_STATUS_BUTTON) {
                        PianoRhythm.MINI_PROFILE_INPUT_STATUS = $("<input>");
                        PianoRhythm.MINI_PROFILE_INPUT_STATUS.attr("class", "miniProfileChild");
                        PianoRhythm.MINI_PROFILE_INPUT_STATUS.attr("id", "userLI_InputStatus_" + user.name);
                        PianoRhythm.MINI_PROFILE_INPUT_STATUS.attr("id", "userLI_InputStatus_" + user.socketID);
                        PianoRhythm.MINI_PROFILE_INPUT_STATUS.attr("type", "text");
                        PianoRhythm.MINI_PROFILE_INPUT_STATUS.attr("maxlength", "15");
                        PianoRhythm.MINI_PROFILE_INPUT_STATUS.attr("placeholder", "Enter status here...");
                        PianoRhythm.MINI_PROFILE_INPUT_STATUS.attr("name", user.name);
                        PianoRhythm.MINI_PROFILE_INPUT_STATUS.css({
                            "width": "48%",
                            height: 30,
                            "margin-top": 5,
                            "margin-left": "29%",
                            overflow: "hidden",
                        });
                        PianoRhythm.MINI_PROFILE_SET_STATUS_BUTTON = $(document.createElement('button'));
                        PianoRhythm.MINI_PROFILE_SET_STATUS_BUTTON.addClass("rkmd-btn miniProfileButton miniProfileChild");
                        PianoRhythm.MINI_PROFILE_SET_STATUS_BUTTON.attr("title", "Set your status!");
                        PianoRhythm.MINI_PROFILE_SET_STATUS_BUTTON.text("Submit Status");
                        PianoRhythm.MINI_PROFILE_RESET_STATUS_BUTTON = $(document.createElement('button'));
                        PianoRhythm.MINI_PROFILE_RESET_STATUS_BUTTON.addClass("rkmd-btn miniProfileButton miniProfileChild");
                        PianoRhythm.MINI_PROFILE_RESET_STATUS_BUTTON.attr("title", "Set your status!");
                        PianoRhythm.MINI_PROFILE_RESET_STATUS_BUTTON.text("Clear Status");
                        function submitStatus(input) {
                            if (PianoRhythm && PianoRhythm.CMESSAGEINPUT && PianoRhythm.CMESSAGEINPUT.length && PianoRhythm.CSUBMITFORM && PianoRhythm.CSUBMITFORM.length) {
                                PianoRhythm.CMESSAGEINPUT.val(input);
                                PianoRhythm.CSUBMITFORM.trigger("submit");
                                PianoRhythm.MINI_PROFILE.hide();
                                PianoRhythm.FOCUS_PIANO();
                                PianoRhythm.MINI_PROFILE.data("user", null);
                            }
                        }
                        PianoRhythm.MINI_PROFILE_INPUT_STATUS.on("keydown", (evt) => {
                            PianoRhythm.CLIENT_FOCUS = CLIENT_FOCUS.DIALOGUE;
                            if (evt.which === 13) {
                                submitStatus('/setstatus ' + PianoRhythm.MINI_PROFILE_INPUT_STATUS.val());
                            }
                        });
                        PianoRhythm.MINI_PROFILE_SET_STATUS_BUTTON.click(() => {
                            submitStatus('/setstatus ' + PianoRhythm.MINI_PROFILE_INPUT_STATUS.val());
                        });
                        PianoRhythm.MINI_PROFILE_RESET_STATUS_BUTTON.click(() => {
                            PianoRhythm.MINI_PROFILE_INPUT_STATUS.val("");
                            submitStatus('/resetstatus');
                        });
                        PianoRhythm.MINI_PROFILE_BODY.append(PianoRhythm.MINI_PROFILE_INPUT_STATUS);
                        PianoRhythm.MINI_PROFILE_BODY.append(PianoRhythm.MINI_PROFILE_SET_STATUS_BUTTON);
                        PianoRhythm.MINI_PROFILE_BODY.append(PianoRhythm.MINI_PROFILE_RESET_STATUS_BUTTON);
                    }
                    PianoRhythm.MINI_PROFILE_FOOTER.css("color", "green");
                    PianoRhythm.MINI_PROFILE_FOOTER.text("");
                    height = 330;
                    PianoRhythm.MINI_PROFILE_HEADER.css("height", "70%");
                    PianoRhythm.MINI_PROFILE_HEADER_TEXT.addClass("miniProfileHeaderTextHover");
                    PianoRhythm.MINI_PROFILE_HEADER_TEXT.attr("title", "Change your nickname!");
                    PianoRhythm.MINI_PROFILE_HEADER_TEXT.click(() => {
                        PianoRhythm.hideMiniProfile();
                        $("#PR_CHANGE_NICKNAME").remove();
                        PianoRhythm.CLIENT_FOCUS = CLIENT_FOCUS.DIALOGUE;
                        PianoRhythm.dimPage(true);
                        var changeNicknameBox = new BasicBox({
                            id: "PR_CHANGE_NICKNAME", height: 200, width: 600,
                            title: "Nickname Change", color: PianoRhythm.COLORS.base4
                        });
                        changeNicknameBox.show();
                        changeNicknameBox.box.css({
                            "border": "4px solid white",
                        });
                        var changeNicknameInput;
                        changeNicknameBox.createHeader({
                            marginTop: "0px",
                            onClose: () => {
                                if (changeNicknameInput) {
                                    try {
                                        changeNicknameInput.qtip('api').destroy();
                                    }
                                    catch (err) { }
                                }
                                changeNicknameBox.remove();
                                PianoRhythm.dimPage(false);
                            }
                        });
                        changeNicknameInput = changeNicknameBox.addInput({
                            type2: "text",
                            width: "90%"
                        });
                        changeNicknameInput.attr("title", "You can change your nickname every 30 seconds!");
                        changeNicknameInput.qtip();
                        var submitButton = BasicBox.createButton("Submit", () => {
                            let input = changeNicknameInput.find("input");
                            let inputVal = "";
                            if (input)
                                inputVal = input.val().trim();
                            if (inputVal)
                                PianoRhythm.SOCKET.emit("changeNickname", {
                                    nickname: inputVal
                                });
                            changeNicknameInput.qtip('api').destroy();
                            changeNicknameBox.remove();
                            changeNicknameBox.destroyed = true;
                            PianoRhythm.dimPage(false);
                        }, {
                            "flex-grow": "1",
                            "padding-left": "40%",
                            "margin-top": 18
                        });
                        changeNicknameBox.box.append(submitButton);
                        changeNicknameBox.center3();
                        let body = PianoRhythm.BODY;
                        if (!body)
                            body = $("body");
                        body.append(changeNicknameBox.box);
                    });
                }
                let top = userLI.offset().top;
                let actualBottom = top + height;
                if (actualBottom > window.innerHeight)
                    top -= (actualBottom - window.innerHeight) + 55;
                PianoRhythm.MINI_PROFILE.css("top", top);
                PianoRhythm.MINI_PROFILE.css("height", height);
                PianoRhythm.MINI_PROFILE.css('display', '');
                PianoRhythm.MINI_PROFILE_VISIBLE = true;
            }
        }
    }
    static createMainProfile() {
        let profile = $(document.createElement('div'));
        profile.addClass("mainProfile noselect mainProfileChild");
        profile.attr("draggable", "false");
        let mainProfile_header = $(document.createElement('header'));
        mainProfile_header.addClass("mainProfileHeader mainProfileChild");
        mainProfile_header.css({
            "background": pusher.color(PianoRhythm.COLORS.base4).shade(0.2).hex6()
        });
        PianoRhythm.MAIN_PROFILE_HEADER = mainProfile_header;
        let mainProfile_header_text = $(document.createElement('div'));
        mainProfile_header_text.addClass("mainProfileChild");
        mainProfile_header_text.css({
            position: "absolute",
            color: "white",
            top: 21,
            left: 205,
            "font-size": 40,
            width: 193,
            "white-space": "nowrap",
            overflow: "hidden",
            "text-overflow": "ellipsis",
        });
        PianoRhythm.MAIN_PROFILE_HEADER_TEXT = mainProfile_header_text;
        PianoRhythm.MAIN_PROFILE_HEADER_TEXT2 = $(document.createElement('div'));
        PianoRhythm.MAIN_PROFILE_HEADER_TEXT2.addClass("mainProfileChild");
        PianoRhythm.MAIN_PROFILE_HEADER_TEXT2.css({
            position: "absolute",
            color: "#cedbfa",
            top: 71,
            left: 205,
            "font-size": 22,
            width: 193,
            "white-space": "nowrap",
            overflow: "hidden",
            "text-overflow": "ellipsis",
        });
        mainProfile_header.append(mainProfile_header_text);
        mainProfile_header.append(PianoRhythm.MAIN_PROFILE_HEADER_TEXT2);
        let mainProfile_subHeader = $(document.createElement('header'));
        mainProfile_subHeader.addClass("mainProfileSubHeader mainProfileChild");
        PianoRhythm.MAIN_PROFILE_SUB_HEADER = mainProfile_subHeader;
        let mainProfile_body = $(document.createElement('div'));
        mainProfile_body.addClass("mainProfileBody mainProfileChild");
        PianoRhythm.MAIN_PROFILE_BODY = mainProfile_body;
        let mainProfile_footer = $(document.createElement('div'));
        mainProfile_footer.addClass("mainProfileFooter mainProfileChild");
        PianoRhythm.MAIN_PROFILE_FOOTER = mainProfile_footer;
        let blockButton = $(document.createElement('button'));
        blockButton.addClass("rkmd-btn mainProfileFooterButton mainProfileChild");
        blockButton.text("Block User");
        mainProfile_footer.append(blockButton);
        PianoRhythm.MAIN_PROFILE_BLOCK_BUTTON = blockButton;
        let reportButton = $(document.createElement('button'));
        reportButton.addClass("rkmd-btn mainProfileFooterButton mainProfileChild");
        reportButton.text("Report User");
        reportButton.attr('disabled', 'disabled');
        mainProfile_footer.append(reportButton);
        PianoRhythm.MAIN_PROFILE_REPORT_BUTTON = reportButton;
        let messageButton = $(document.createElement('button'));
        messageButton.addClass("rkmd-btn mainProfileButton");
        messageButton.text("Send Message");
        messageButton.click(() => {
        });
        mainProfile_subHeader.append(messageButton);
        PianoRhythm.MAIN_PROFILE_MESSAGE_BUTTON = messageButton;
        let friendButton = $(document.createElement('button'));
        friendButton.addClass("rkmd-btn mainProfileButton");
        friendButton.text("Friend Request");
        PianoRhythm.MAIN_PROFILE_FRIEND_BUTTON = friendButton;
        mainProfile_subHeader.append(friendButton);
        let deleteAccount = $(document.createElement('button'));
        deleteAccount.addClass("rkmd-btn mainProfileFooterButton");
        deleteAccount.text("Delete Account");
        deleteAccount.attr('disabled', 'disabled');
        PianoRhythm.MAIN_PROFILE_DELETE_BUTTON = deleteAccount;
        let updateProf = $(document.createElement('button'));
        updateProf.addClass("rkmd-btn mainProfileButton");
        updateProf.css({
            "width": "50%",
            "margin-left": "48%"
        });
        updateProf.text("Update Profile");
        updateProf.click(() => {
            if (PianoRhythm.SOCKET) {
                PianoRhythm.SOCKET.emit("updateProfile", {
                    userName: PianoRhythm.CLIENT.name,
                    id: PianoRhythm.CLIENT.id,
                    type: "verify"
                }, (err, results) => {
                    console.log(err, results);
                });
            }
        });
        PianoRhythm.MAIN_PROFILE_UPDATEPROF_BUTTON = updateProf;
        profile.append(mainProfile_header);
        profile.append(mainProfile_subHeader);
        profile.append(mainProfile_body);
        profile.append(mainProfile_footer);
        $('body').append(profile);
        PianoRhythm.MAIN_PROFILE = profile;
    }
    static setMainProfile(user, userLI) {
        if (!PianoRhythm.MAIN_PROFILE)
            PianoRhythm.createMainProfile();
        if (PianoRhythm.MAIN_PROFILE && user && userLI) {
            let oldName = PianoRhythm.MAIN_PROFILE.data("user");
            if (oldName === user.name) {
                PianoRhythm.MAIN_PROFILE.data("user", null);
                PianoRhythm.MAIN_PROFILE.css('display', 'none');
                PianoRhythm.MAIN_PROFILE_VISIBLE = false;
                PianoRhythm.FOCUS_PIANO();
                return;
            }
            PianoRhythm.MAIN_PROFILE.css('display', "none");
            PianoRhythm.hideSelectionLists();
            PianoRhythm.dimPage(true, null, true);
            PianoRhythm.CLIENT_FOCUS = CLIENT_FOCUS.DIALOGUE;
            let USER = PianoRhythm.PLAYER_SOCKET_LIST.get(user.socketID);
            PianoRhythm.MAIN_PROFILE_BLOCK_BUTTON.css("display", "none");
            PianoRhythm.MAIN_PROFILE_REPORT_BUTTON.css("display", "none");
            PianoRhythm.MAIN_PROFILE_MESSAGE_BUTTON.css("display", "none");
            PianoRhythm.MAIN_PROFILE_FRIEND_BUTTON.css("display", "none");
            PianoRhythm.MAIN_PROFILE_UPDATEPROF_BUTTON.css("display", "none");
            PianoRhythm.MAIN_PROFILE.data("user", user.name);
            PianoRhythm.MAIN_PROFILE.data("id", user.socketID);
            let image = userLI["img"];
            if (PianoRhythm.MAIN_PROFILE_IMAGE)
                PianoRhythm.MAIN_PROFILE_IMAGE.remove();
            if (image) {
                PianoRhythm.MAIN_PROFILE_IMAGE = image.clone();
                PianoRhythm.MAIN_PROFILE_IMAGE.removeClass("miniProfileHeaderImage");
                PianoRhythm.MAIN_PROFILE_IMAGE.addClass("mainProfileImage");
            }
            else {
                let ext = (user.hasGifImageForProfile) ? "gif" : "png";
                PianoRhythm.MAIN_PROFILE_IMAGE = $("<img>");
                PianoRhythm.MAIN_PROFILE_IMAGE.css({
                    "border": "7px solid " + user.color
                });
                PianoRhythm.MAIN_PROFILE_IMAGE.addClass("mainProfileImage");
                PianoRhythm.MAIN_PROFILE_IMAGE.attr("draggable", "false");
                PianoRhythm.MAIN_PROFILE_IMAGE.attr("src", "./profile_images/" + user.name + "/profile." + ext + "?" + Date.now());
                PianoRhythm.MAIN_PROFILE_IMAGE.on('error', () => {
                    image.attr("src", "./profile_images/default/profile.png");
                });
            }
            if (PianoRhythm.MAIN_PROFILE_IMAGE) {
                PianoRhythm.MAIN_PROFILE_IMAGE.attr("draggable", "false");
                PianoRhythm.MAIN_PROFILE_IMAGE.css({
                    "border": "solid 7px " + user.color + " !important"
                });
                PianoRhythm.MAIN_PROFILE_HEADER.append(PianoRhythm.MAIN_PROFILE_IMAGE);
            }
            PianoRhythm.MAIN_PROFILE_BODY.empty();
            if (user.accountID)
                PianoRhythm.MAIN_PROFILE_BODY.append("<div style=''>Profile:<a target='_black' href='https://pianorhythm.bitnamiapp.com/user/" + user.accountID + "'> Click Here</a></div>");
            if (user && user.name)
                PianoRhythm.SOCKET.emit("getPlayerStats", { username: user.name }, (err, results) => {
                    if (results) {
                        PianoRhythm.MAIN_PROFILE_BODY.append("<div style=''>Username: " + user.name + "</div>");
                        PianoRhythm.MAIN_PROFILE_BODY.append("<div style=''>Level: " + ((Boolean(results.level)) ? results.level : user.level || 1) + "</div>");
                        PianoRhythm.MAIN_PROFILE_BODY.append("<div style=''>Points: " + ((Boolean(results.points)) ? results.points : user.points || 0) + "</div>");
                        PianoRhythm.MAIN_PROFILE_BODY.append("<div style=''>Rank: " + ((Boolean(results.rank)) ? results.rank : "Newbie") + "</div>");
                        PianoRhythm.MAIN_PROFILE_BODY.append("<div style=''>Status: " + ((Boolean(user.status)) ? user.status : "-") + "</div>");
                        PianoRhythm.MAIN_PROFILE_BODY.append("<div style=''>Band: " + ((Boolean(results.band)) ? results.band : "N/A") + "</div>");
                        PianoRhythm.MAIN_PROFILE_BODY.append("<div style=''>Description:</div>");
                        PianoRhythm.MAIN_PROFILE_BODY.append("<textarea rows='6' cols='40' style='padding:7px;background-color:white;resize:none' disabled>" + ((Boolean(results.desc)) ? results.desc : "N/A") + "</textarea>");
                    }
                });
            PianoRhythm.MAIN_PROFILE_HEADER_TEXT.text(user.nickname || user.name);
            PianoRhythm.MAIN_PROFILE_HEADER_TEXT2.text("#" + user.name);
            setTimeout(() => {
                PianoRhythm.MAIN_PROFILE_HEADER_TEXT["resizeText"]({
                    maxfont: 40, minfont: 20, offset: 5
                });
            }, 50);
            if (user.name.toLowerCase() !== PianoRhythm.CLIENT.name.toLowerCase()) {
                PianoRhythm.MAIN_PROFILE_BLOCK_BUTTON.css("display", "");
                PianoRhythm.MAIN_PROFILE_REPORT_BUTTON.css("display", "");
                if (userLI && userLI.data && userLI.data("blocked") !== undefined)
                    PianoRhythm.MAIN_PROFILE_BLOCK_BUTTON.text((userLI.data("blocked")) ? "Unblock User" : "Block User");
                else if (user && user.blocked !== undefined)
                    PianoRhythm.MAIN_PROFILE_BLOCK_BUTTON.text((user.blocked) ? "Unblock User" : "Block User");
                else
                    PianoRhythm.MAIN_PROFILE_BLOCK_BUTTON.text("Block User");
                if (PianoRhythm.CLIENT && PianoRhythm.CLIENT.loggedIn) {
                    if (USER && USER["loggedIn"]) {
                        PianoRhythm.MAIN_PROFILE_FRIEND_BUTTON.css("display", "");
                        PianoRhythm.MAIN_PROFILE_MESSAGE_BUTTON.css("display", "");
                    }
                }
            }
            else {
                if (PianoRhythm.CLIENT && PianoRhythm.CLIENT.loggedIn) {
                    if (PianoRhythm.MAIN_PROFILE_IMAGE) {
                        let uploadBox;
                        PianoRhythm.MAIN_PROFILE_IMAGE.hover(() => {
                            PianoRhythm.MAIN_PROFILE_IMAGE.addClass("mainProfileImage_hover");
                        }, () => {
                            PianoRhythm.MAIN_PROFILE_IMAGE.removeClass("mainProfileImage_hover");
                        });
                        PianoRhythm.MAIN_PROFILE_IMAGE.click(() => {
                            if (!PianoRhythm.SOCKET)
                                return;
                            BasicBox.BOX_VISIBLE = true;
                            if (PianoRhythm.AVATAR_IMAGE_UPLOAD_BOX || $(".uploadBox").length)
                                return;
                            uploadBox = $(document.createElement('div'));
                            PianoRhythm.AVATAR_IMAGE_UPLOAD_BOX = uploadBox;
                            uploadBox.addClass("uploadBox");
                            uploadBox.css({
                                width: "300px",
                                top: 0,
                                left: 0,
                                position: "fixed",
                                background: "white",
                                color: "black",
                                padding: "0.5%",
                                "border-radius": "2%",
                                "z-index": "1005"
                            });
                            var uploadHeader = $(document.createElement('h1'));
                            uploadHeader.text("Avatar Image");
                            uploadHeader.css({
                                "text-align": "center",
                                background: PianoRhythm.COLORS.base4,
                                width: "100%",
                                color: "white"
                            });
                            let uploadContentWrap = $(document.createElement('div'));
                            let uploadCanvas = $(document.createElement('canvas'));
                            let gifImage = $(document.createElement('img'));
                            uploadCanvas.css({ "margin-left": "72px" });
                            gifImage.css({
                                "margin-left": "72px",
                                "margin-top": 4,
                                width: 150,
                                height: 150,
                                position: "absolute"
                            });
                            let uploadInput = $('<input type="file" name="avatarImagefile" id="avatarImagefile" class="avatarImage_input" />');
                            let uploadInput_url = $('<input placeholder="Or enter image url here..." type="url" name="avatarImageURL" id="avatarImageURL" class="avatarImage_url" />');
                            let label = $('<label for="avatarImagefile">Choose a file</label>');
                            let fileExt = "png";
                            let gifFileData = null;
                            let size = 150;
                            let canvas = uploadCanvas[0];
                            canvas.width = size;
                            canvas.height = size;
                            let ctx = canvas.getContext("2d");
                            uploadInput.addClass("avatarImage_input");
                            function uploadChange(use_url = -1, src_url) {
                                PianoRhythm.CLIENT_FOCUS = CLIENT_FOCUS.DIALOGUE;
                                ctx.clearRect(0, 0, size, size);
                                let img = document.createElement("img");
                                if (use_url == 1 && src_url) {
                                    PianoRhythm.toDataUrl(src_url, (data) => {
                                        if (data != -1) {
                                            img.src = data;
                                            img.onload = function () {
                                                ctx.drawImage(img, 0, 0, size, size);
                                            };
                                        }
                                        else {
                                            let message = "An error has occurred with that image link. Please try something else.";
                                            if (!PianoRhythm.notifyMessagesSet.has(message))
                                                PianoRhythm.notify(message);
                                        }
                                    });
                                }
                                else {
                                    let file = this.files[0];
                                    if (!file) {
                                        PianoRhythm.notify({
                                            message: "Not a valid image file!"
                                        });
                                        return;
                                    }
                                    let fileSize = file.size / 1024;
                                    if (file) {
                                        if (file.type.split("/")[1] === "gif") {
                                            fileExt = "gif";
                                            if (fileSize > 800) {
                                                PianoRhythm.notify({
                                                    message: "The .gif file is too big. The current limit is 500kb"
                                                });
                                                return;
                                            }
                                        }
                                    }
                                    if (!file.type.match(/image.*/)) {
                                        PianoRhythm.notify({
                                            message: "Not a valid image file!"
                                        });
                                        return;
                                    }
                                    img.src = window.URL.createObjectURL(file);
                                    img.onload = function () {
                                        if (fileExt === "gif") {
                                            PianoRhythm.notify({
                                                message: "Processing..."
                                            });
                                            gifImage.attr("src", img.src);
                                            var reader = new FileReader();
                                            reader.readAsBinaryString(file);
                                            reader.onload = function (readerEvt) {
                                                var binaryString = readerEvt.target["result"];
                                                gifFileData = "data:image/gif;base64," + btoa(binaryString);
                                            };
                                        }
                                        else
                                            ctx.drawImage(img, 0, 0, size, size);
                                    };
                                    uploadInput_url.value = "";
                                }
                            }
                            uploadInput_url.bind('paste change', function (event) {
                                let _this = this;
                                setTimeout(function () {
                                    uploadChange(1, $(_this).val());
                                }, 100);
                            });
                            uploadInput.on("change", uploadChange);
                            if (PianoRhythm.MAIN_PROFILE) {
                                PianoRhythm.hideMainProfile();
                            }
                            var submitButton = BasicBox.createButton("Submit", () => {
                                BasicBox.BOX_VISIBLE = false;
                                PianoRhythm.MAIN_PROFILE_VISIBLE = false;
                                PianoRhythm.AVATAR_IMAGE_UPLOAD_BOX = null;
                                var imageData = uploadCanvas[0].toDataURL("image/" + fileExt);
                                if (gifFileData)
                                    imageData = gifFileData;
                                PianoRhythm.SOCKET.emit("uploadProfilePic", {
                                    username: PianoRhythm.CLIENT.name,
                                    image: imageData
                                }, (err, results) => {
                                    if (results) {
                                        if (results.success) {
                                            if (PianoRhythm.MAIN_PROFILE_IMAGE)
                                                PianoRhythm.MAIN_PROFILE_IMAGE.attr("src", "./profile_images/" + name + "/profile." + fileExt + "?" + Date.now());
                                        }
                                        if (results.message) {
                                            PianoRhythm.notify({
                                                message: results.message
                                            });
                                        }
                                    }
                                });
                                uploadBox.remove();
                                PianoRhythm.FOCUS_PIANO();
                            }, {
                                "margin-left": "47px",
                                "display": "inline-block"
                            });
                            var cancelButton = BasicBox.createButton("Cancel", () => {
                                BasicBox.BOX_VISIBLE = false;
                                PianoRhythm.MAIN_PROFILE_VISIBLE = false;
                                PianoRhythm.AVATAR_IMAGE_UPLOAD_BOX = null;
                                uploadBox.remove();
                                PianoRhythm.FOCUS_PIANO();
                            }, {
                                "display": "inline-block"
                            });
                            submitButton.button.css({
                                "color": "white",
                                "background": PianoRhythm.COLORS.base4
                            });
                            cancelButton.button.css({
                                "color": "white",
                                "background": PianoRhythm.COLORS.base4
                            });
                            uploadBox.center2();
                            uploadContentWrap.append(gifImage);
                            uploadContentWrap.append(uploadCanvas);
                            uploadContentWrap.append(uploadInput);
                            uploadContentWrap.append(label);
                            uploadContentWrap.append(uploadInput_url);
                            uploadContentWrap.append(submitButton);
                            uploadContentWrap.append(cancelButton);
                            uploadBox.append(uploadHeader);
                            uploadBox.append(uploadContentWrap);
                            PianoRhythm.MAIN_PROFILE.after(uploadBox);
                        });
                        PianoRhythm.MAIN_PROFILE_IMAGE.attr("title", "Upload a new profile image!");
                        PianoRhythm.MAIN_PROFILE_IMAGE["qtip"]();
                    }
                }
            }
            PianoRhythm.MAIN_PROFILE.css('display', '');
            PianoRhythm.MAIN_PROFILE["center3"]();
            PianoRhythm.MAIN_PROFILE_VISIBLE = true;
        }
    }
    static hideMiniProfile() {
        if (PianoRhythm.MINI_PROFILE && PianoRhythm.MINI_PROFILE_VISIBLE) {
            PianoRhythm.MINI_PROFILE.data("user", null);
            PianoRhythm.MINI_PROFILE.data("user_data", null);
            PianoRhythm.MINI_PROFILE.css('display', 'none');
            PianoRhythm.MINI_PROFILE_VISIBLE = false;
        }
    }
    static hideMainProfile() {
        if (PianoRhythm.MAIN_PROFILE && PianoRhythm.MAIN_PROFILE_VISIBLE) {
            PianoRhythm.MAIN_PROFILE.data("user", null);
            PianoRhythm.MAIN_PROFILE.css('display', 'none');
            PianoRhythm.MAIN_PROFILE_VISIBLE = false;
            PianoRhythm.dimPage(false);
        }
    }
    static sendFriendRequest(name, callback) {
        if (callback == undefined)
            callback = function () {
            };
        if (PianoRhythm.SOCKET)
            PianoRhythm.SOCKET.emit('sendFriendRequest', { userName: name }, callback);
    }
    static PLAYER_LIST_ROLES_COUNT() {
        let globalCount = {};
        PianoRhythm.ROLE_AMOUNT.forEach((value, key) => {
            globalCount[key] = 0;
            PianoRhythm.ROLE_AMOUNT.set(key, 0);
        });
        PianoRhythm.PLAYER_SOCKET_LIST.forEach((value, key) => {
            let role = user_1.UserType[value["role"]];
            globalCount[role]++;
            PianoRhythm.ROLE_AMOUNT.set(role, globalCount[role]);
        });
        PianoRhythm.ROLE_AMOUNT.forEach((value, key) => {
            let existing_divider = PianoRhythm.PLAYER_LIST_DIVIDERS[key];
            if (existing_divider && PianoRhythm.ROLE_AMOUNT.get(key) <= 0) {
                existing_divider.remove();
                delete PianoRhythm.PLAYER_LIST_DIVIDERS[key];
            }
        });
    }
    static USERLIST_SORT() {
        if (PianoRhythm.PLAYERLIST_UL) {
            PianoRhythm.PLAYER_LIST_ROLES_COUNT();
            let items = PianoRhythm.PLAYERLIST_UL.children().get();
            items = items.filter((elem) => {
                return Boolean($(elem).attr("socketID"));
            });
            items.sort(function (a, b) {
                let keyA = $(a).attr("socketID");
                let keyB = $(b).attr("socketID");
                if (keyA && keyB) {
                    let userA = PianoRhythm.PLAYER_SOCKET_LIST.get(keyA);
                    let userB = PianoRhythm.PLAYER_SOCKET_LIST.get(keyB);
                    if (userA && userB) {
                        let userRoleA = userA["role"];
                        let userRoleB = userB["role"];
                        let rankA = PianoRhythm.ROLE_RANK.get(user_1.UserType[userRoleA]);
                        let rankB = PianoRhythm.ROLE_RANK.get(user_1.UserType[userRoleB]);
                        if (rankA < rankB)
                            return 1;
                        if (rankA > rankB)
                            return -1;
                        return 0;
                    }
                }
                return -1;
            });
            $.each(items, function (i, li) {
                PianoRhythm.PLAYERLIST_UL.append(li);
            });
            let firstItem = {};
            items.map((value) => {
                let id = $(value).attr("socketID");
                let user = PianoRhythm.PLAYER_SOCKET_LIST.get(id);
                if (user) {
                    let role = user_1.UserType[user["role"]];
                    let existing_divider = PianoRhythm.PLAYER_LIST_DIVIDERS[role];
                    if (!firstItem[role])
                        firstItem[role] = value;
                    if (!existing_divider) {
                        let divider = $("<div>");
                        divider.addClass("UI_divider");
                        let dividerName = $("<div>");
                        dividerName.addClass("UI_dividerName");
                        let role_name = role;
                        switch (user["role"]) {
                            case user_1.UserType.USER:
                                role_name = "Members";
                                break;
                            case user_1.UserType.GUEST:
                                role_name = "Guests";
                                break;
                            case user_1.UserType.BOT_DEV:
                                role_name = "Bot Developers";
                                break;
                            case user_1.UserType.DESIGN:
                                role_name = "Designers";
                                break;
                            case user_1.UserType.SPT:
                                role_name = "Support Staff";
                                break;
                            case user_1.UserType.MOD:
                                role_name = "Moderators";
                                break;
                            case user_1.UserType.SYSOP:
                                role_name = "Admins";
                                break;
                            case user_1.UserType.OSOP:
                                role_name = "Owner";
                                break;
                        }
                        dividerName.text(role_name + " - " + PianoRhythm.ROLE_AMOUNT.get(role));
                        divider["name_div"] = dividerName;
                        divider["role_name"] = role_name;
                        divider.append(dividerName);
                        PianoRhythm.PLAYER_LIST_DIVIDERS[role] = divider;
                        divider.insertBefore($(firstItem[role]));
                    }
                    else if (existing_divider.length) {
                        existing_divider.insertBefore($(firstItem[role]));
                        if (existing_divider["name_div"])
                            existing_divider["name_div"].text(existing_divider["role_name"] + " - " + PianoRhythm.ROLE_AMOUNT.get(role));
                    }
                }
            });
        }
    }
    static FRIENDLIST_SORT() {
        if (PianoRhythm.FRIENDLIST_UL) {
            let online = 0, offline = 0, requests = 0;
            let items = PianoRhythm.FRIENDLIST_UL.children().get();
            items = items.filter((elem) => {
                let friend = $(elem).attr("friend");
                let friendRequest = $(elem).data("friendRequest");
                if (friend) {
                    if ($(elem).data("online"))
                        online++;
                    else
                        offline++;
                }
                if (friendRequest)
                    requests++;
                return Boolean(friend) || Boolean(friendRequest);
            });
            items.sort(function (a, b) {
                let keyA = $(a).data("online");
                let keyB = $(b).data("online");
                let keyA_r = $(a).data("friendRequest");
                let keyB_r = $(b).data("friendRequest");
                if (keyA_r || keyB_r)
                    return -2;
                if (keyA && !keyB)
                    return -1;
                if (keyB && !keyA)
                    return 1;
                return 0;
            });
            $.each(items, function (i, li) {
                PianoRhythm.FRIENDLIST_UL.append(li);
            });
            let firstItem = {};
            items.map((value) => {
                let friend_online = $(value).data("online");
                let friend_request = $(value).data("friendRequest");
                let roleName = friend_online ? "Online" : "Offline";
                let count = roleName == "Online" ? online : offline;
                if (friend_request) {
                    roleName = "Friend Requests";
                    count = requests;
                }
                let existing_divider = PianoRhythm.FRIEND_LIST_DIVIDERS[roleName];
                if (!firstItem[roleName])
                    firstItem[roleName] = value;
                if (!existing_divider) {
                    let divider = $("<div>");
                    divider.addClass("UI_divider");
                    let dividerName = $("<div>");
                    dividerName.addClass("UI_dividerName");
                    let role_name = roleName;
                    dividerName.text(role_name + " - " + count);
                    divider["name_div"] = dividerName;
                    divider["role_name"] = role_name;
                    divider.append(dividerName);
                    PianoRhythm.FRIEND_LIST_DIVIDERS[roleName] = divider;
                    divider.insertBefore($(firstItem[roleName]));
                }
                else if (existing_divider.length) {
                    existing_divider.insertBefore($(firstItem[roleName]));
                    if (existing_divider["name_div"])
                        existing_divider["name_div"].text(existing_divider["role_name"] + " - " + count);
                }
            });
            if (online <= 0) {
                let divider = PianoRhythm.FRIEND_LIST_DIVIDERS["Online"];
                if (divider) {
                    divider.remove();
                    delete PianoRhythm.FRIEND_LIST_DIVIDERS["Online"];
                }
            }
            if (offline <= 0) {
                let divider = PianoRhythm.FRIEND_LIST_DIVIDERS["Offline"];
                if (divider) {
                    divider.remove();
                    delete PianoRhythm.FRIEND_LIST_DIVIDERS["Offline"];
                }
            }
            if (requests <= 0) {
                PianoRhythm.PALSTAB_REQUESTSAMOUNT.css("display", "none");
                PianoRhythm.PALSTAB_REQUESTSAMOUNT.removeClass("beat_noBorder");
                let divider = PianoRhythm.FRIEND_LIST_DIVIDERS["Friend Requests"];
                if (divider) {
                    divider.remove();
                    delete PianoRhythm.FRIEND_LIST_DIVIDERS["Friend Requests"];
                }
            }
            else {
                PianoRhythm.PALSTAB_REQUESTSAMOUNT.css("display", "block");
                PianoRhythm.PALSTAB_REQUESTSAMOUNT.addClass("beat_noBorder");
                PianoRhythm.PALSTAB_REQUESTSAMOUNT.text(requests);
                if (requests > 9)
                    PianoRhythm.PALSTAB_REQUESTSAMOUNT.css("text-indent", "-4px");
                else
                    PianoRhythm.PALSTAB_REQUESTSAMOUNT.css("text-indent", "");
            }
        }
    }
    static initializeMouseMovement() {
        let mousePos;
        let prevX = -1;
        let prevY = -1;
        function handleMouseMove(event) {
            let dot, eventDoc, doc, body, pageX, pageY;
            event = event || window.event;
            if (event.pageX == null && event.clientX != null) {
                eventDoc = (event.target && event.target.ownerDocument) || document;
                doc = eventDoc.documentElement;
                body = eventDoc.body;
                event.pageX = event.clientX +
                    (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
                    (doc && doc.clientLeft || body && body.clientLeft || 0);
                event.pageY = event.clientY +
                    (doc && doc.scrollTop || body && body.scrollTop || 0) -
                    (doc && doc.clientTop || body && body.clientTop || 0);
            }
            mousePos = {
                x: event.clientX,
                y: event.clientY
            };
            PianoRhythm.mouseX = mousePos.x;
            PianoRhythm.mouseY = mousePos.y;
            Piano_1.Piano.KEYBOARD_VELOCITY = PianoRhythm.mouseY / window.innerHeight;
            Piano_1.Piano.KEYBOARD_VELOCITY = PianoRhythm.map(Piano_1.Piano.KEYBOARD_VELOCITY, 0, 1, 50, 127);
            if (PianoRhythm.mouseX >= window.innerWidth - 15) {
                PianoRhythm.MOUSE_OVER_SCROLL_BAR = true;
                if (PianoRhythmPlayer_1.PianoRhythmSelection.ACTIVE_LIST && PianoRhythmPlayer_1.PianoRhythmSelection.ACTIVE_LIST.originalStage) {
                    if (PianoRhythmPlayer_1.PianoRhythmSelection.ACTIVE_LIST.originalStage[0].style.pointerEvents !== "all")
                        PianoRhythmPlayer_1.PianoRhythmSelection.ACTIVE_LIST.originalStage[0].style.pointerEvents = "all";
                }
            }
            else {
                PianoRhythm.MOUSE_OVER_SCROLL_BAR = false;
                if (PianoRhythmPlayer_1.PianoRhythmSelection.ACTIVE_LIST && PianoRhythmPlayer_1.PianoRhythmSelection.ACTIVE_LIST.originalStage) {
                    if (PianoRhythmPlayer_1.PianoRhythmSelection.ACTIVE_LIST.originalStage[0].style.pointerEvents !== "none")
                        PianoRhythmPlayer_1.PianoRhythmSelection.ACTIVE_LIST.originalStage[0].style.pointerEvents = "none";
                }
            }
            return mousePos;
        }
        window.addEventListener("mousemove", handleMouseMove);
        function translateMouseEvent(evt) {
            let element = evt.target;
            let offx = 0;
            let offy = 0;
            do {
                if (!element)
                    break;
                offx += element.offsetLeft;
                offy += element.offsetTop;
            } while (element = element.offsetParent);
            return {
                x: evt.pageX - offx,
                y: evt.pageY - offy
            };
        }
        PianoRhythm.translateMouseEvent = translateMouseEvent;
        function getMousePosition() {
            let pos = mousePos;
            if (pos) {
                if (PianoRhythm.SHOW_CURSOR)
                    if (prevX !== pos.x || prevY !== pos.y) {
                        if (PianoRhythm.mouseChannel)
                            PianoRhythm.mouseChannel.publish({
                                mX: (((pos.x) / $(window).width()) * 100).toFixed(2),
                                mY: ((pos.y / $(window).height()) * 100).toFixed(2),
                                w: window.innerWidth,
                                h: window.innerHeight,
                                type: "pos",
                                id: PianoRhythm.CLIENT.id,
                                socketID: PianoRhythm.SOCKET.id
                            });
                    }
                prevX = pos.x;
                prevY = pos.y;
            }
        }
        PianoRhythm.getMousePosition = getMousePosition;
    }
    static shift_key_reset(layout) {
        this.shift_key_set.forEach(function (n) {
            let keyVal = Piano_1.Piano.getKeyFromNote(n);
            if (keyVal) {
                let pKey = Piano_1.Piano.KEYS[keyVal];
                if (pKey && layout)
                    Piano_1.Piano.release({
                        note: pKey.id,
                        channel: 0,
                        emit: true,
                        socketID: PianoRhythm.CLIENT.socketID,
                        source: Piano_1.NOTE_SOURCE.KEYBOARD,
                        kb_source: Piano_1.KEYBOARD_LAYOUT[layout],
                        instrumentName: Piano_1.Piano.ACTIVE_INSTRUMENT
                    });
            }
        });
        this.shift_key_set.clear();
    }
    static alt_key_reset(layout) {
        this.alt_key_set.forEach(function (n) {
            let keyVal = Piano_1.Piano.getKeyFromNote(n);
            if (keyVal) {
                let pKey = Piano_1.Piano.KEYS[keyVal];
                if (pKey && layout)
                    Piano_1.Piano.release({
                        note: pKey.id,
                        channel: 0,
                        emit: true,
                        socketID: PianoRhythm.CLIENT.socketID,
                        source: Piano_1.NOTE_SOURCE.KEYBOARD,
                        kb_source: Piano_1.KEYBOARD_LAYOUT[layout],
                        instrumentName: Piano_1.Piano.ACTIVE_INSTRUMENT
                    });
            }
        });
        this.alt_key_set.clear();
    }
    static setupPianoKeyBind(i) {
        Mousetrap.bind([
            String.fromCharCode(i).toLowerCase(),
            "shift+" + String.fromCharCode(i).toLowerCase(),
            "ctrl+" + String.fromCharCode(i).toLowerCase(),
            "alt+" + String.fromCharCode(i).toLowerCase(),
            "option+" + String.fromCharCode(i).toLowerCase(),
        ], (e) => {
            if (!PianoRhythm.CANVAS_PIANO_DRAWN)
                return;
            if (PianoRhythm.ROOM_SETTINGS.ALLOWED_TOOL != Piano_1.NOTE_SOURCE.ANY && PianoRhythm.ROOM_SETTINGS.ALLOWED_TOOL != Piano_1.NOTE_SOURCE.KEYBOARD)
                return false;
            if (PianoRhythm.onlyHostCanPlay())
                return;
            if (!Piano_1.Piano.keysDown[e.keyCode]) {
                Piano_1.Piano.keysDown[e.keyCode] = true;
                let note = null;
                let layout = (PianoRhythm.ROOM_SETTINGS.KB_LAYOUT === Piano_1.KEYBOARD_LAYOUT.ANY) ?
                    PianoRhythm.SETTINGS["keyboardMap"] : Piano_1.KEYBOARD_LAYOUT[PianoRhythm.ROOM_SETTINGS.KB_LAYOUT];
                if ((layout === "VIRTUAL_PIANO")) {
                    note = Piano_1.Piano.keyCode_to_note_vp(e.keyCode, PianoRhythm.TRANSPOSE);
                }
                else {
                    note = (layout === "PIANORHYTHM")
                        ? Piano_1.Piano.keyCode_to_note(e.keyCode, PianoRhythm.TRANSPOSE)
                        : Piano_1.Piano.keyCode_to_note_mpp(e.keyCode, PianoRhythm.TRANSPOSE);
                }
                if (note !== "-1") {
                    let n = parseInt(note.substring(1)) + (12 * (PianoRhythm.OCTAVE - 1));
                    if (e.shiftKey) {
                        n += (layout === "VIRTUAL_PIANO") ? 1 : 12;
                        PianoRhythm.shift_key_set.add(n);
                    }
                    if (e.altKey || e.keyCode == 20) {
                        n -= (layout === "VIRTUAL_PIANO") ? 1 : 12;
                        PianoRhythm.alt_key_set.add(n);
                    }
                    let keyVal = Piano_1.Piano.getKeyFromNote(n);
                    if (keyVal) {
                        let pKey = Piano_1.Piano.KEYS[keyVal];
                        if (pKey) {
                            Piano_1.Piano.press({
                                color: (PianoRhythm.CLIENT && PianoRhythm.CLIENT.color) ? PianoRhythm.CLIENT.color : PianoRhythm.COLORS.base4,
                                note: pKey.id,
                                velocity: Piano_1.Piano.KEYBOARD_VELOCITY,
                                channel: 0,
                                emit: true,
                                source: Piano_1.NOTE_SOURCE.KEYBOARD,
                                socketID: PianoRhythm.CLIENT.socketID,
                                kb_source: Piano_1.KEYBOARD_LAYOUT[layout],
                                instrumentName: Piano_1.Piano.ACTIVE_INSTRUMENT
                            });
                        }
                    }
                }
            }
        }, "keydown");
        Mousetrap.bind([
            String.fromCharCode(i).toLowerCase(),
            "shift+" + String.fromCharCode(i).toLowerCase(),
            "ctrl+" + String.fromCharCode(i).toLowerCase(),
            "alt+" + String.fromCharCode(i).toLowerCase(),
            "option+" + String.fromCharCode(i).toLowerCase(),
        ], (e) => {
            if (PianoRhythm.ROOM_SETTINGS.ALLOWED_TOOL != Piano_1.NOTE_SOURCE.ANY && PianoRhythm.ROOM_SETTINGS.ALLOWED_TOOL != Piano_1.NOTE_SOURCE.KEYBOARD)
                return false;
            if (Piano_1.Piano.keysDown[e.keyCode]) {
                Piano_1.Piano.keysDown[e.keyCode] = false;
                let note = null;
                let layout = (PianoRhythm.ROOM_SETTINGS.KB_LAYOUT === Piano_1.KEYBOARD_LAYOUT.ANY) ?
                    PianoRhythm.SETTINGS["keyboardMap"] : Piano_1.KEYBOARD_LAYOUT[PianoRhythm.ROOM_SETTINGS.KB_LAYOUT];
                if ((layout === "VIRTUAL_PIANO")) {
                    note = Piano_1.Piano.keyCode_to_note_vp(e.keyCode, PianoRhythm.TRANSPOSE);
                }
                else {
                    note = (layout === "PIANORHYTHM")
                        ? Piano_1.Piano.keyCode_to_note(e.keyCode, PianoRhythm.TRANSPOSE)
                        : Piano_1.Piano.keyCode_to_note_mpp(e.keyCode, PianoRhythm.TRANSPOSE);
                }
                if (note !== "-1") {
                    let n = parseInt(note.substring(1)) + (12 * (PianoRhythm.OCTAVE - 1));
                    if (e.shiftKey)
                        n += (layout === "VIRTUAL_PIANO") ? 1 : 12;
                    if (e.altKey || e.keyCode == 20)
                        n -= (layout === "VIRTUAL_PIANO") ? 1 : 12;
                    let keyVal = Piano_1.Piano.getKeyFromNote(n);
                    if (keyVal) {
                        let pKey = Piano_1.Piano.KEYS[keyVal];
                        if (pKey)
                            Piano_1.Piano.release({
                                note: pKey.id,
                                channel: 0,
                                emit: true,
                                socketID: PianoRhythm.CLIENT.socketID,
                                source: Piano_1.NOTE_SOURCE.KEYBOARD,
                                kb_source: Piano_1.KEYBOARD_LAYOUT[layout],
                                instrumentName: Piano_1.Piano.ACTIVE_INSTRUMENT
                            });
                    }
                }
            }
        }, "keyup");
    }
    static handleInput() {
        for (let i = 39; i <= 95; i++)
            PianoRhythm.setupPianoKeyBind(i);
        PianoRhythm.setupDefaultKeybinds();
        PianoRhythm.setupDefaultFunctionKeys();
        PianoRhythm.loadKeyBinds();
        $(document).on("keypress", (e) => {
            if (e.which === 32 && PianoRhythm.PLAYER) {
                if (PianoRhythm.CLIENT)
                    if (PianoRhythm.CLIENT_FOCUS !== CLIENT_FOCUS.PIANO)
                        return;
                if (PianoRhythmPlayer_1.PianoRhythmPlayer.isPLAYING || PianoRhythmPlayer_1.PianoRhythmPlayer.midiPlayerPreview) {
                    PianoRhythm.PLAYER.pause();
                }
                else {
                    PianoRhythm.PLAYER.resume();
                }
            }
        });
        document.onkeydown = (ev) => {
            let key = ev.which || ev.keyCode || 0;
            if (key === 32 && !Piano_1.Piano.SUSTAIN)
                Piano_1.Piano.pressSustain();
            if (key === 27) {
                if (PianoRhythm.INSTRUMENT_SELECTION)
                    PianoRhythm.INSTRUMENT_SELECTION.hide();
                if (PianoRhythmPlayer_1.PianoRhythmPlayer.MIDI_SELECTION)
                    PianoRhythmPlayer_1.PianoRhythmPlayer.MIDI_SELECTION.hide();
                if (AudioEngine_1.AudioEngine.REVERB_LIST)
                    AudioEngine_1.AudioEngine.REVERB_LIST.hide();
                if (AudioEngine_1.AudioEngine.RECORDED_LIST)
                    AudioEngine_1.AudioEngine.RECORDED_LIST.hide();
                if (PianoRhythmDock.HIDE_LIST_BUTTON && PianoRhythmDock.HIDE_LIST_BUTTON.length) {
                    PianoRhythmDock.HIDE_LIST_BUTTON.text("Clear");
                    PianoRhythmDock.HIDE_LIST_BUTTON.trigger("click");
                }
            }
            if (key === 13 && PianoRhythm.LOGIN_ENTERED) {
                if (PianoRhythm.CLIENT_FOCUS === CLIENT_FOCUS.PIANO) {
                    if (PianoRhythm.CMESSAGEINPUT && PianoRhythm.CMESSAGEINPUT.length) {
                        setTimeout(function () {
                            PianoRhythm.CMESSAGEINPUT.focus();
                            PianoRhythm.FOCUS_CHAT();
                        });
                    }
                }
                else if (PianoRhythm.CLIENT_FOCUS === CLIENT_FOCUS.CHAT) {
                    if (PianoRhythm.CMESSAGEINPUT && PianoRhythm.CMESSAGEINPUT.length) {
                        if (PianoRhythm.CMESSAGEINPUT.val() <= 0) {
                            PianoRhythm.CMESSAGEINPUT.blur();
                            PianoRhythm.FOCUS_PIANO();
                        }
                    }
                }
            }
        };
        document.onkeyup = (ev) => {
            let key = ev.which || ev.keyCode || 0;
            if (key === 32 && Piano_1.Piano.SUSTAIN)
                Piano_1.Piano.releaseSustain();
            let layout = (PianoRhythm.ROOM_SETTINGS.KB_LAYOUT === Piano_1.KEYBOARD_LAYOUT.ANY) ?
                PianoRhythm.SETTINGS["keyboardMap"] : Piano_1.KEYBOARD_LAYOUT[PianoRhythm.ROOM_SETTINGS.KB_LAYOUT];
            if (key == 16)
                PianoRhythm.shift_key_reset(layout);
            if (key == 18)
                PianoRhythm.shift_key_reset(layout);
        };
        window.onbeforeunload = function (event) {
            if (PianoRhythm.SOCKET && PianoRhythm.LOGIN_ENTERED && PianoRhythm.ROOM_OWNER_ID === PianoRhythm.SOCKET.ID) {
            }
        };
    }
    static setupDefaultKeybinds(reset = false) {
        if (!PianoRhythm.loadSetting("KEYBIND", "transpose_up") || reset)
            PianoRhythm.saveSetting("KEYBIND", "transpose_up", "home");
        if (!PianoRhythm.loadSetting("KEYBIND", "transpose_down") || reset)
            PianoRhythm.saveSetting("KEYBIND", "transpose_down", "end");
        if (!PianoRhythm.loadSetting("KEYBIND", "octave_up") || reset)
            PianoRhythm.saveSetting("KEYBIND", "octave_up", "pageup");
        if (!PianoRhythm.loadSetting("KEYBIND", "octave_down") || reset)
            PianoRhythm.saveSetting("KEYBIND", "octave_down", "pagedown");
        if (!PianoRhythm.loadSetting("KEYBIND", "toggle_dock") || reset)
            PianoRhythm.saveSetting("KEYBIND", "toggle_dock", "`");
        if (!PianoRhythm.loadSetting("KEYBIND", "toggle_sustain") || reset)
            PianoRhythm.saveSetting("KEYBIND", "toggle_sustain", "backspace");
        if (!PianoRhythm.loadSetting("KEYBIND", "activate_sustain") || reset)
            PianoRhythm.saveSetting("KEYBIND", "activate_sustain", "space");
        if (!PianoRhythm.loadSetting("KEYBIND", "toggle_instrumentslist") || reset)
            PianoRhythm.saveSetting("KEYBIND", "toggle_instrumentslist", "f1");
        if (!PianoRhythm.loadSetting("KEYBIND", "toggle_midilist") || reset)
            PianoRhythm.saveSetting("KEYBIND", "toggle_midilist", "f2");
        if (!PianoRhythm.loadSetting("KEYBIND", "toggle_recordingtracks") || reset)
            PianoRhythm.saveSetting("KEYBIND", "toggle_recordingtracks", "f3");
        if (!PianoRhythm.loadSetting("KEYBIND", "toggle_reverblist") || reset)
            PianoRhythm.saveSetting("KEYBIND", "toggle_reverblist", "f4");
    }
    static setupFunctionKey(key, func) {
        Mousetrap.bind(key, function (e) {
            e.preventDefault();
            if (func)
                func();
        });
    }
    static setupDefaultFunctionKeys() {
        Mousetrap.bind("f1", function (e) {
            if (PianoRhythmPlayer_1.PianoRhythmPlayer.MIDI_SELECTION)
                PianoRhythmPlayer_1.PianoRhythmPlayer.MIDI_SELECTION.hide();
            if (AudioEngine_1.AudioEngine.RECORDED_LIST)
                AudioEngine_1.AudioEngine.RECORDED_LIST.hide();
            if (AudioEngine_1.AudioEngine.REVERB_LIST)
                AudioEngine_1.AudioEngine.REVERB_LIST.hide();
            if (PianoRhythm.INSTRUMENT_SELECTION)
                PianoRhythm.INSTRUMENT_SELECTION.toggle();
            e.preventDefault();
        });
        Mousetrap.bind("f2", function (e) {
            if (PianoRhythm.INSTRUMENT_SELECTION)
                PianoRhythm.INSTRUMENT_SELECTION.hide();
            if (AudioEngine_1.AudioEngine.RECORDED_LIST)
                AudioEngine_1.AudioEngine.RECORDED_LIST.hide();
            if (AudioEngine_1.AudioEngine.REVERB_LIST)
                AudioEngine_1.AudioEngine.REVERB_LIST.hide();
            if (PianoRhythmPlayer_1.PianoRhythmPlayer.MIDI_SELECTION)
                PianoRhythmPlayer_1.PianoRhythmPlayer.MIDI_SELECTION.toggle();
            e.preventDefault();
        });
        Mousetrap.bind("f3", function (e) {
            if (PianoRhythmPlayer_1.PianoRhythmPlayer.MIDI_SELECTION)
                PianoRhythmPlayer_1.PianoRhythmPlayer.MIDI_SELECTION.hide();
            if (PianoRhythm.INSTRUMENT_SELECTION)
                PianoRhythm.INSTRUMENT_SELECTION.hide();
            if (AudioEngine_1.AudioEngine.REVERB_LIST)
                AudioEngine_1.AudioEngine.REVERB_LIST.hide();
            if (AudioEngine_1.AudioEngine.RECORDED_LIST)
                AudioEngine_1.AudioEngine.RECORDED_LIST.toggle();
            e.preventDefault();
        });
        Mousetrap.bind("f4", function (e) {
            if (PianoRhythmPlayer_1.PianoRhythmPlayer.MIDI_SELECTION)
                PianoRhythmPlayer_1.PianoRhythmPlayer.MIDI_SELECTION.hide();
            if (PianoRhythm.INSTRUMENT_SELECTION)
                PianoRhythm.INSTRUMENT_SELECTION.hide();
            if (AudioEngine_1.AudioEngine.RECORDED_LIST)
                AudioEngine_1.AudioEngine.RECORDED_LIST.hide();
            if (AudioEngine_1.AudioEngine.REVERB_LIST)
                AudioEngine_1.AudioEngine.REVERB_LIST.toggle();
            e.preventDefault();
        });
        Mousetrap.bind("f5", function (e) {
            e.preventDefault();
        });
        Mousetrap.bind("f6", function (e) {
            e.preventDefault();
        });
        Mousetrap.bind("f7", function (e) {
            e.preventDefault();
        });
        Mousetrap.bind("f8", function (e) {
            e.preventDefault();
        });
        Mousetrap.bind("tab", function (e) {
            e.preventDefault();
        });
        Mousetrap.bind("up", function (e) { e.preventDefault(); console.log("UP PRESSED"); });
        Mousetrap.bind("left", function (e) { e.preventDefault(); });
        Mousetrap.bind("right", function (e) { e.preventDefault(); });
        Mousetrap.bind("down", function (e) { e.preventDefault(); });
    }
    static loadKeyBinds() {
        try {
            Mousetrap.bind(PianoRhythm.loadSetting("KEYBIND", "transpose_up"), function (e) {
                PianoRhythm.bind_transpose();
                e.preventDefault();
            });
        }
        catch (err) {
        }
        try {
            Mousetrap.bind(PianoRhythm.loadSetting("KEYBIND", "transpose_down"), function (e) {
                PianoRhythm.bind_transpose(-1);
                e.preventDefault();
            });
        }
        catch (err) {
        }
        try {
            Mousetrap.bind(PianoRhythm.loadSetting("KEYBIND", "octave_up"), function (e) {
                PianoRhythm.bind_octave();
                e.preventDefault();
            });
        }
        catch (err) {
        }
        try {
            Mousetrap.bind(PianoRhythm.loadSetting("KEYBIND", "octave_down"), function (e) {
                PianoRhythm.bind_octave(-1);
                e.preventDefault();
            });
        }
        catch (err) {
        }
        try {
            Mousetrap.bind(PianoRhythm.loadSetting("KEYBIND", "toggle_dock"), function (e) {
                PianoRhythm.toggleDock();
                e.preventDefault();
            });
        }
        catch (err) {
        }
        try {
            Mousetrap.bind(PianoRhythm.loadSetting("KEYBIND", "toggle_sustain"), function (e) {
                PianoRhythm.toggleSustain();
                e.preventDefault();
            });
        }
        catch (err) {
        }
    }
    static initializeWorker() {
        try {
            PianoRhythm.MIDI_WORKER = new Worker('../javascripts/workers/midiWorker.js');
            setTimeout(() => {
                if (PianoRhythm.MIDI_WORKER)
                    if (PianoRhythm.DEBUG_MESSAGING)
                        console.info("Web Worker created.");
            }, 1000);
        }
        catch (err) {
        }
    }
    static initializeWebMidi() {
        if (typeof navigator !== 'undefined') {
            if (typeof navigator.requestMIDIAccess === 'function') {
                navigator.requestMIDIAccess().then(onsuccesscallback, (err) => {
                    let browser = window.navigator.userAgent;
                    if (PianoRhythm.DEBUG_MESSAGING)
                        console.error("Uh-Oh! Something went wrong! Error code: " + err.code);
                    PianoRhythm.notify("<span style='color: red'>Web Midi: </span> Error! " + browser + " isn't really compatible with this site. Use Chrome instead!", 10000);
                });
            }
            else {
                PianoRhythm.notify("<span style='color: red'>Web Midi API: </span> Incompatible with this browser!", 7000);
            }
        }
        else {
            PianoRhythm.notify("<span style='color: red'>Web Midi: </span> Incompatible with this browser!", 7000);
        }
        let current_in;
        let current_out;
        function onsuccesscallback(access) {
            PianoRhythm.MIDI_PARSER = new midiParser();
            let midi = access;
            console.log("[DEBUG] ---------WEB MIDI ACCESS-------");
            let inputs = midi.inputs;
            let outputs = midi.outputs;
            let iteratorInputs = inputs.values();
            let iteratorOutputs = outputs.values();
            inputs.forEach(function (port) {
                PianoRhythm.MIDI_IN_LIST[port.name] = port;
                if (PianoRhythm.DEBUG_MESSAGING)
                    console.log("[DEBUG] MIDI Input ports: " + port.name + " | Status: " + port.connection);
            });
            outputs.forEach(function (port) {
                PianoRhythm.MIDI_OUT_LIST[port.name] = port;
                if (PianoRhythm.DEBUG_MESSAGING)
                    console.log("[DEBUG] MIDI Output ports: " + port.name + " | Status: " + port.connection);
            });
            midi.onstatechange = function (e) {
                let port = e.port;
                let input_message = "MIDI INPUT opened!";
                let output_message = "MIDI OUTPUT opened!";
                let color = "lime";
                if (port.type === 'input') {
                    if (port.connection === "closed") {
                        input_message = "MIDI INPUT closed!";
                        color = "red";
                    }
                    if (PianoRhythm.MIDI_IN_LIST[port.name] === undefined)
                        PianoRhythm.MIDI_IN_LIST[port.name] = port;
                    if (PianoRhythm.LOGIN_ENTERED && PianoRhythm.UI_INITIALIZED)
                        setTimeout(() => {
                            PianoRhythm.notify({
                                message: "<span style='color:whitesmoke'>" + port.name + "</span> <span style='color:" + color + "'>" + input_message + "</span>"
                            }, 3000);
                        }, 50);
                }
                else {
                    if (port.connection === "closed") {
                        output_message = "MIDI OUTPUT closed!";
                        color = "red";
                    }
                    if (PianoRhythm.MIDI_OUT_LIST[port.name] === undefined)
                        PianoRhythm.MIDI_OUT_LIST[port.name] = port;
                    if (PianoRhythm.LOGIN_ENTERED && PianoRhythm.UI_INITIALIZED)
                        setTimeout(() => {
                            PianoRhythm.notify({
                                message: "<span style='color: whitesmoke'>" + port.name + "</span> <span style='color:" + color + "'>" + output_message + "</span>"
                            }, 3000);
                        }, 50);
                }
            };
            try {
                let storage_inputs = JSON.parse(PianoRhythm.loadSessionSetting("MIDI", "lastMidi_In"));
                if (storage_inputs) {
                    for (let si = 0; si < storage_inputs.length; si++) {
                        let port = PianoRhythm.MIDI_IN_LIST[storage_inputs[si]];
                        if (port) {
                            port.open();
                            port.onmidimessage = PianoRhythm.midiMessageParse;
                        }
                    }
                }
                else {
                    PianoRhythm.MIDI_CURRENT_IN = iteratorInputs.next().value;
                    PianoRhythm.MIDI_CURRENT_IN.open();
                    PianoRhythm.MIDI_CURRENT_IN.onmidimessage = PianoRhythm.midiMessageParse;
                }
                PianoRhythm.saveSessionSetting("MIDI", "lastMidi_In", PianoRhythm.getMidiInList());
                let storage_outputs = JSON.parse(PianoRhythm.loadSessionSetting("MIDI", "lastMidi_Out"));
                if (storage_outputs) {
                    for (let si = 0; si < storage_outputs.length; si++) {
                        let port = PianoRhythm.MIDI_OUT_LIST[storage_outputs[si]];
                        if (port)
                            port.open();
                    }
                }
            }
            catch (err) {
                console.error(err);
            }
            PianoRhythm.workerListener();
        }
    }
    static initializeUI() {
        return new Promise((resolve, reject) => {
            if (PianoRhythm.UI_INITIALIZED)
                return reject(true);
            let volSetting = PianoRhythm.loadSetting("VOLUME", "volume");
            let volVal = (volSetting !== null) ? (volSetting) : 1;
            AudioEngine_1.AudioEngine.volume = Math.max(volVal, 1);
            let lastVolume = AudioEngine_1.AudioEngine.volume;
            let volumeMuted = (lastVolume === 0);
            if (!PianoRhythm.VOLUMESLIDER) {
                PianoRhythm.VOLUMESLIDER = noUiSlider.create(document.getElementById("volumeSlider"), {
                    start: volVal,
                    step: 0.1,
                    connect: "lower",
                    range: {
                        'min': 0,
                        'max': AudioEngine_1.AudioEngine.maxVolume
                    }
                });
                let sliderTip = null;
                PianoRhythm.VOLUMESLIDER.on('end', function (values) {
                    let val = parseFloat(values[0]);
                    AudioEngine_1.AudioEngine.volume = val;
                    lastVolume = (val !== 0) ? val : lastVolume;
                    volumeMuted = (lastVolume === 0);
                    PianoRhythm.saveSetting("VOLUME", "volume", val);
                    if (sliderTip === null)
                        sliderTip = $(".noUi-tooltip");
                    else {
                        sliderTip.fadeOut();
                    }
                    if (PianoRhythmPlayer_1.PianoRhythmPlayer.UI_VOLUME_BAR && PianoRhythmPlayer_1.PianoRhythmPlayer.isPLAYING)
                        PianoRhythmPlayer_1.PianoRhythmPlayer.UI_VOLUME_BAR.set(val);
                });
                PianoRhythm.VOLUMESLIDER.on('update', function (values, handle) {
                    let val = parseFloat(values[0]);
                    AudioEngine_1.AudioEngine.volume = val;
                    lastVolume = (val !== 0) ? val : lastVolume;
                    volumeMuted = (lastVolume === 0);
                    if (sliderTip === null)
                        sliderTip = $(".noUi-tooltip");
                    else {
                        if (sliderTip.is(":hidden")) {
                            sliderTip.fadeIn();
                        }
                    }
                });
                $("#volumeBarSpan").click(() => {
                    let val;
                    if (!volumeMuted) {
                        val = 0;
                    }
                    else {
                        if (lastVolume === 0)
                            lastVolume = AudioEngine_1.AudioEngine.maxVolume;
                        val = lastVolume;
                    }
                    if (PianoRhythm.VOLUMESLIDER)
                        PianoRhythm.VOLUMESLIDER["set"](val);
                    AudioEngine_1.AudioEngine.volume = val;
                    if (PianoRhythmPlayer_1.PianoRhythmPlayer.UI_VOLUME_BAR && PianoRhythmPlayer_1.PianoRhythmPlayer.isPLAYING)
                        PianoRhythmPlayer_1.PianoRhythmPlayer.UI_VOLUME_BAR.set(val);
                    PianoRhythm.saveSetting("VOLUME", "volume", val);
                    volumeMuted = (val === 0);
                });
            }
            if (!PianoRhythm.NQ_SLIDER) {
                var slider = $(document.createElement("div")).attr({ id: "prNQ_slider" });
                slider.css({
                    "position": "absolute",
                    bottom: 0,
                    height: "4px",
                    width: "100%",
                    "z-index": 2,
                });
                PianoRhythm.NQ_SLIDER_ELEMENT = slider;
                PianoRhythm.BODY.append(PianoRhythm.NQ_SLIDER_ELEMENT);
                if (pusher) {
                    PianoRhythm.NQ_SLIDER = new BasicSlider("#prNQ_slider", { color: "white" });
                    PianoRhythm.NQ_SLIDER.set(1);
                    PianoRhythm.NQ_SLIDER_ELEMENT.hide();
                }
            }
            if (!PianoRhythm.PLAYER) {
                PianoRhythmPlayer_1.PianoRhythmPlayer.initialize();
                PianoRhythm.PLAYER = new PianoRhythmPlayer_1.PianoRhythmPlayer();
            }
            if (!PianoRhythmPlayer_1.PianoRhythmPlayer.MIDI_SELECTION) {
                PianoRhythmPlayer_1.PianoRhythmPlayer.MIDI_SELECTION = new PianoRhythmPlayer_1.PianoRhythmSelection("PR_MIDI_STAGE", PianoRhythm.PLAYER);
                PianoRhythmPlayer_1.PianoRhythmPlayer.MIDI_SELECTION.createItemList();
                PianoRhythmPlayer_1.PianoRhythmPlayer.MIDI_SELECTION.hide();
            }
            let lastAFK = 0;
            let tabVisible = (function () {
                let stateKey, eventKey, keys = {
                    hidden: "visibilitychange",
                    webkitHidden: "webkitvisibilitychange",
                    mozHidden: "mozvisibilitychange",
                    msHidden: "msvisibilitychange"
                };
                for (stateKey in keys) {
                    if (stateKey in document) {
                        eventKey = keys[stateKey];
                        break;
                    }
                }
                return function (c) {
                    if (c)
                        document.addEventListener(eventKey, c);
                    return !document[stateKey];
                };
            })();
            tabVisible(function () {
                PianoRhythm.TAB_VISIBLE = tabVisible(null);
                if (!PianoRhythm.TAB_VISIBLE) {
                    PianoRhythm.hideMainProfile();
                    PianoRhythm.hideMiniProfile();
                    if (PianoRhythm.SHOW_IM_AFK && PianoRhythm.SOCKET)
                        PianoRhythm.SOCKET.emit("afk");
                    lastAFK = Date.now();
                }
                else {
                    if (PianoRhythm.SHOW_IM_AFK && PianoRhythm.SOCKET)
                        PianoRhythm.SOCKET.emit("resetafk");
                }
                if (PianoRhythm.PLAYER && PianoRhythmPlayer_1.PianoRhythmPlayer) {
                    if (!PianoRhythm.TAB_VISIBLE) {
                        if (PianoRhythmPlayer_1.PianoRhythmPlayer.isPLAYING || PianoRhythmPlayer_1.PianoRhythmPlayer.midiPlayerPreview)
                            PianoRhythm.PLAYER.pause();
                    }
                    else {
                        if (!PianoRhythmPlayer_1.PianoRhythmPlayer.isPLAYING || PianoRhythmPlayer_1.PianoRhythmPlayer.midiPlayerPreview)
                            PianoRhythm.PLAYER.resume();
                    }
                }
            });
            $(window).on("blur focus", function (e) {
                switch (e.type) {
                    case "blur":
                        PianoRhythm.WINDOW_FOCUS = "BLUR";
                        if (PianoRhythm.CONTEXT_MENU)
                            PianoRhythm.CONTEXT_MENU.css("display", "none");
                        if (PianoRhythm.CONTEXT_MENU2)
                            PianoRhythm.CONTEXT_MENU2.css("display", "none");
                        if (PianoRhythm.CONTEXT_MENU_DOCK)
                            PianoRhythm.CONTEXT_MENU_DOCK.css("display", "none");
                        PianoRhythm.hideMiniProfile();
                        break;
                    case "focus":
                        PianoRhythm.WINDOW_FOCUS = "FOCUS";
                        break;
                }
            });
            if (PianoRhythm.HIDEUI) {
                PianoRhythm.HIDEUI.hover(function () {
                    $(this).attr("class", (PianoRhythm.SIDBAR_HIDDEN) ? "icon-eye" : "icon-eye-blocked");
                }, function () {
                    $(this).attr("class", (PianoRhythm.SIDBAR_HIDDEN) ? "icon-menu" : "icon-arrow-left");
                });
                PianoRhythm.HIDEUI.click(function (e, bypass) {
                    if (GAMESTATE.initialized && GAMESTATE.ACTIVE_STATE !== null && !bypass)
                        return false;
                    PianoRhythm.CLIENT_FOCUS = CLIENT_FOCUS.BOTTOMBAR;
                    PianoRhythm.SIDBAR_HIDDEN = !PianoRhythm.SIDBAR_HIDDEN;
                    let visible = PianoRhythm.SIDBAR_HIDDEN;
                    if (visible) {
                        PianoRhythm.jUI.addClass("AnimateOutLeft");
                        PianoRhythm.PrefixedEvent(PianoRhythm.jUI[0], "AnimationEnd", () => {
                        });
                        PianoRhythm.jUI2.addClass("AnimateOutLeft");
                        PianoRhythm.PrefixedEvent(PianoRhythm.jUI2[0], "AnimationEnd", () => {
                        });
                        $(this).attr("title", "Press me to show the side bar!");
                        PianoRhythm.SIDEBAR_OFFSET = 0;
                    }
                    else {
                        PianoRhythm.jUI.removeClass();
                        PianoRhythm.jUI.show();
                        PianoRhythm.jUI.css("margin-left", "0");
                        PianoRhythm.jUI2.show();
                        PianoRhythm.jUI2.removeClass();
                        PianoRhythm.jUI2.css("margin-left", "0");
                        $(this).attr("title", "Press me to hide the side bar!");
                        PianoRhythm.SIDEBAR_OFFSET = PianoRhythm.jUI.width();
                    }
                    if (PianoRhythm.NEWMESSAGE.is(":visible")) {
                        PianoRhythm.NEWMESSAGE.css('left', PianoRhythm.SIDEBAR_OFFSET + 15);
                    }
                    $(this).attr("class", (visible) ? "icon-menu" : "icon-arrow-left");
                    PianoRhythm.resize();
                });
                if (!PianoRhythm.SETTINGS["displaySideMenu"])
                    PianoRhythm.HIDEUI.trigger("click");
            }
            PianoRhythm.BODY["contextmenu"](function (evt) {
                let target = $(evt.target);
                if (target) {
                    let targetClass = target.attr("class");
                    let targetID = target[0].id;
                    if (targetClass && targetClass.indexOf("message") > -1)
                        return;
                    if (targetID && targetID.indexOf("chatMessageInput") > -1)
                        return;
                    if (targetID && targetID.indexOf("avatarImageURL") > -1)
                        return;
                }
                evt.preventDefault();
            });
            PianoRhythm.CONTEXT_MENU.children().click((e) => {
                if (!PianoRhythm.SOCKET)
                    return;
                let item = e.target;
                let $item = $(item);
                let itemParent = $item.parent();
                let itemData = itemParent.parent().data();
                let li = $(".UI_players_list > #userLI_" + itemData.profileSID);
                if (li && li.length === 0)
                    li = $(".UI_players_list > #userLI_" + itemData.profileName);
                switch (item.textContent.toLowerCase()) {
                    case "give crown":
                        if (PianoRhythm.SOCKET) {
                            PianoRhythm.SOCKET.emit("giveCrown", {
                                target: itemData
                            });
                            PianoRhythm.hideContextMenus();
                        }
                        break;
                    case "ban":
                        if (PianoRhythm.SOCKET) {
                            console.log("KICK PLAYER", itemData);
                            itemData.roomID = PianoRhythm.CLIENT.roomID;
                            PianoRhythm.SOCKET.emit("kickPlayer", {
                                target: itemData
                            }, (err, results) => {
                                if (results === "success") {
                                    PianoRhythm.notify("You've banned " + itemData.profileName + " from your room for infinite time! Use /banlist to see the users you've banned.");
                                }
                                else if (results === "OSOP") {
                                    PianoRhythm.notify("Hah, you can't ban him. :)");
                                }
                                else {
                                    PianoRhythm.notify("Something went wrong. Unable to use the command.");
                                }
                            });
                            PianoRhythm.hideContextMenus();
                        }
                        break;
                    case "friend request":
                        PianoRhythm.notify({
                            message: "You have sent a friend request to " + itemData.profileName + "!"
                        });
                        if (PianoRhythm.sendFriendRequest)
                            PianoRhythm.sendFriendRequest(itemData.profileName, (err, results) => {
                                if (err) {
                                    let message = "Request failed. Either the database is down or you're already friends with that person!";
                                    if (results === "request already sent")
                                        message = "Request failed. You already sent one!";
                                    PianoRhythm.notify({
                                        message: message
                                    });
                                    return;
                                }
                            });
                        PianoRhythm.hideContextMenus();
                        break;
                    case "whisper":
                        if (PianoRhythm.CMESSAGEINPUT && PianoRhythm.CMESSAGEINPUT.length) {
                            PianoRhythm.CMESSAGEINPUT.val("/whisper (" + itemData.profileName + ") ");
                            PianoRhythm.hideContextMenus();
                            PianoRhythm.CMESSAGEINPUT.trigger("focus");
                            PianoRhythm.FOCUS_CHAT();
                        }
                        break;
                    case "view mini profile":
                        if (li)
                            li.trigger("click");
                        break;
                    case "room":
                        {
                            let active = (itemParent.data("roomMenu_active") !== undefined) ?
                                itemParent.data("roomMenu_active") : false;
                            if (!active)
                                itemParent.find('ul').css("display", "block");
                            else
                                itemParent.find('ul').css("display", "none");
                            itemParent.data("roomMenu_active", !active);
                        }
                        break;
                    case "mute":
                        {
                            let active = (itemParent.data("active") !== undefined) ?
                                itemParent.data("active") : false;
                            if (!active)
                                itemParent.find('ul').css("display", "block");
                            else
                                itemParent.find('ul').css("display", "none");
                            itemParent.data("active", !active);
                        }
                        break;
                    case "block user":
                        if (itemData.profileName) {
                        }
                        break;
                    case "mute notes":
                    case "unmute notes":
                        if (itemData && itemData.profileName && itemData.profileID) {
                            let extra = {
                                name: itemData.profileName,
                                socketID: itemData.profileSID,
                                uuid: itemData.profileID
                            };
                            if (extra) {
                                let name = extra.name;
                                let user = PianoRhythm.PLAYER_SOCKET_LIST.get(extra.socketID);
                                if (user && extra.uuid && extra.socketID) {
                                    let userLI = user["userLI"];
                                    if (PianoRhythm.CLIENT.loggedIn) {
                                        PianoRhythm.mutePlayerNotes(name, extra.uuid, extra.socketID, (err, result) => {
                                            if (err) {
                                                PianoRhythm.notify({
                                                    message: "An error has occurred. " + (result.message) ? result.message : ""
                                                });
                                                return;
                                            }
                                            if (result) {
                                                if (result.message && result.userName && result.list) {
                                                    PianoRhythm.setMuteNotesButtonData(result.userName, result.message, userLI, extra);
                                                }
                                            }
                                        });
                                    }
                                    else {
                                        if (userLI.data("muteNotes")) {
                                            let type = userLI.data("muteNotes") == "Unmute Notes" ? "unmute" : "mute";
                                            PianoRhythm.setMuteNotesButtonData(name, type, userLI, extra);
                                        }
                                    }
                                }
                            }
                        }
                        PianoRhythm.hideContextMenus();
                        break;
                    case "mute chat":
                    case "unmute chat":
                        if (itemData && itemData.profileName) {
                            let extra = {
                                name: itemData.profileName,
                                socketID: itemData.profileSID,
                                uuid: itemData.profileID
                            };
                            if (extra) {
                                let name = extra.name;
                                let user = PianoRhythm.PLAYER_SOCKET_LIST.get(extra.socketID);
                                if (user && extra.uuid && extra.socketID) {
                                    let userLI = user["userLI"];
                                    if (PianoRhythm.CLIENT.loggedIn) {
                                        PianoRhythm.mutePlayerChat(name, extra.uuid, extra.socketID, (err, result) => {
                                            if (err) {
                                                PianoRhythm.notify({
                                                    message: "An error has occurred. " + (result.message) ? result.message : ""
                                                });
                                                return;
                                            }
                                            if (result) {
                                                if (result.message && result.userName && result.list) {
                                                    PianoRhythm.setMuteChatButtonData(result.userName, result.message, userLI, extra);
                                                }
                                            }
                                        });
                                    }
                                    else {
                                        if (userLI.data("muteNotes")) {
                                            let type = userLI.data("muteNotes") == "Unmute Notes" ? "unmute" : "mute";
                                            PianoRhythm.setMuteChatButtonData(name, type, userLI, extra);
                                        }
                                    }
                                }
                            }
                        }
                        PianoRhythm.hideContextMenus();
                        break;
                    case "mute all":
                    case "unmute all":
                        PianoRhythm.hideContextMenus();
                        if (itemData && itemData.profileName && itemData.profileID) {
                            let extra = {
                                name: itemData.profileName,
                                socketID: itemData.profileSID,
                                uuid: itemData.profileID
                            };
                            if (extra) {
                                let name = extra.name;
                                let user = PianoRhythm.PLAYER_SOCKET_LIST.get(extra.socketID);
                                if (user && extra.uuid && extra.socketID) {
                                    let userLI = user["userLI"];
                                    if (PianoRhythm.CLIENT.loggedIn) {
                                        PianoRhythm.SOCKET.emit("muteAll", {
                                            userName: itemData.profileName,
                                            id: itemData.profileID,
                                            sID: itemData.profileSID,
                                            force: (item.textContent.toLowerCase() === "mute all") ? 1 : 2
                                        }, (err, results) => {
                                            console.log("MUTE ALL RESULTS", results);
                                            if (err || (results && results.mutedNotes.message === "fail")
                                                || (results && results.mutedChat.message === "fail")) {
                                                PianoRhythm.notify({
                                                    message: "An error has occurred. Please try again!"
                                                });
                                                return;
                                            }
                                            if (results) {
                                                let message = "";
                                                let type1 = "unmute";
                                                let type2 = "unmute";
                                                if (results.mutedNotes && results.mutedNotes.message && results.mutedNotes.message !== "unmute") {
                                                    type1 = "mute";
                                                }
                                                if (!results.mutedNotes.message)
                                                    type1 = null;
                                                if (type1)
                                                    PianoRhythm.setMuteNotesButtonData(name, type1, userLI, extra);
                                                if (results.mutedChat && results.mutedChat.message && results.mutedChat.message !== "unmute") {
                                                    type2 = "mute";
                                                }
                                                if (!results.mutedChat.message)
                                                    type1 = null;
                                                if (type2)
                                                    PianoRhythm.setMuteChatButtonData(name, type2, userLI, extra);
                                                if (message.length > 0) {
                                                    PianoRhythm.notify({
                                                        message: message
                                                    });
                                                }
                                                $item.text((item.textContent.toLowerCase() === "mute all") ? "Unmute All" : "Mute All");
                                            }
                                        });
                                    }
                                    else {
                                        let type = (item.textContent.toLowerCase() === "mute all") ? "mute" : "unmute";
                                        PianoRhythm.setMuteNotesButtonData(name, type, userLI, extra);
                                        PianoRhythm.setMuteChatButtonData(name, type, userLI, extra);
                                        $item.text((item.textContent.toLowerCase() === "mute all") ? "Unmute All" : "Mute All");
                                    }
                                }
                            }
                        }
                        break;
                }
            });
            PianoRhythm.CMESSAGESUL.click(function (e) {
                e.stopPropagation();
            });
            PianoRhythm.CMESSAGESUL.css({
                "position": "absolute",
                "bottom": "100px",
                "overflow-y": "scroll",
                "width": "100%",
                "overflow-x": "hidden",
                "max-height": "calc(100% - 90px)"
            });
            PianoRhythm.CMESSAGESUL.on('scroll', function () {
                if ($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {
                    PianoRhythm.CHAT_SETTINGS.newMessages = 0;
                    PianoRhythm.CHAT_SETTINGS.oldMessages = PianoRhythm.CHAT_SETTINGS.totalMessages;
                    if (PianoRhythm.NEWMESSAGE.is(":visible"))
                        PianoRhythm.NEWMESSAGE.css('visibility', 'hidden');
                }
            });
            PianoRhythm.NEWMESSAGE.on('click', () => {
                PianoRhythm.CMESSAGESUL.animate({ scrollTop: PianoRhythm.CMESSAGESUL[0].scrollHeight }, 500);
                PianoRhythm.FOCUS_CHAT();
                if (PianoRhythm.NEWMESSAGE.is(":visible"))
                    PianoRhythm.NEWMESSAGE.css('visibility', 'hidden');
            });
            PianoRhythm.PLAYERSBUTTON.css('background-color', PianoRhythm.COLORS.UI_selected);
            PianoRhythm.ROOMSBUTTON.css('background-color', PianoRhythm.COLORS.UI_unselected);
            PianoRhythm.PALSBUTTON.css('background-color', PianoRhythm.COLORS.UI_unselected);
            PianoRhythm.TAB_SELECTED = "players";
            PianoRhythm.PLAYERLIST.show();
            PianoRhythm.ROOMLIST.hide();
            PianoRhythm.FRIENDLIST.hide();
            let PALSLIST_NOFRIENDS = PianoRhythm.FRIENDLIST_UL_LOGIN_TO_ADD_FRIENDS;
            PianoRhythm.PLAYERSBUTTON.click(function (e) {
                if (PianoRhythm.TAB_SELECTED === "players")
                    return;
                PianoRhythm.CLIENT_FOCUS = CLIENT_FOCUS.TABS;
                $(this).css('background-color', PianoRhythm.COLORS.UI_selected);
                PianoRhythm.PALSBUTTON.css('background-color', PianoRhythm.COLORS.UI_unselected);
                PianoRhythm.ROOMSBUTTON.css('background-color', PianoRhythm.COLORS.UI_unselected);
                PianoRhythm.TAB_SELECTED = "players";
                PianoRhythm.PLAYERLIST.show();
                PianoRhythm.FRIENDLIST.hide();
                PianoRhythm.ROOMLIST.hide();
                PianoRhythm.PLAYER_SOCKET_LIST.forEach((value, key) => {
                    let userli = value["userLI"];
                    if (userli)
                        setTimeout(() => {
                            userli["divName"].resizeText();
                        }, 200);
                });
            });
            PianoRhythm.PALSBUTTON.click(function (e) {
                if (PianoRhythm.TAB_SELECTED === "friends")
                    return;
                PianoRhythm.CLIENT_FOCUS = CLIENT_FOCUS.TABS;
                $(this).css('background-color', PianoRhythm.COLORS.UI_selected);
                PianoRhythm.PLAYERSBUTTON.css('background-color', PianoRhythm.COLORS.UI_unselected);
                PianoRhythm.ROOMSBUTTON.css('background-color', PianoRhythm.COLORS.UI_unselected);
                PianoRhythm.TAB_SELECTED = "friends";
                PianoRhythm.FRIENDLIST.show();
                PianoRhythm.PLAYERLIST.hide();
                PianoRhythm.ROOMLIST.hide();
                if (PALSLIST_NOFRIENDS.length) {
                    if (PianoRhythm.FRIENDLIST_UL.children().length > 0)
                        PALSLIST_NOFRIENDS.hide();
                    else {
                        if (PianoRhythm.CLIENT && PianoRhythm.CLIENT.loggedIn)
                            PALSLIST_NOFRIENDS.text("Add some friends!");
                        else
                            PALSLIST_NOFRIENDS.text("Login to add friends!");
                        PALSLIST_NOFRIENDS.show();
                    }
                }
            });
            PianoRhythm.ROOMSBUTTON.click(function (e) {
                if (PianoRhythm.TAB_SELECTED === "rooms")
                    return;
                PianoRhythm.CLIENT_FOCUS = CLIENT_FOCUS.TABS;
                $(this).css('background-color', PianoRhythm.COLORS.UI_selected);
                PianoRhythm.PLAYERSBUTTON.css('background-color', PianoRhythm.COLORS.UI_unselected);
                PianoRhythm.PALSBUTTON.css('background-color', PianoRhythm.COLORS.UI_unselected);
                PianoRhythm.TAB_SELECTED = "rooms";
                PianoRhythm.ROOMLIST.show();
                PianoRhythm.PLAYERLIST.hide();
                PianoRhythm.FRIENDLIST.hide();
            });
            PianoRhythm.BOTTOM_BAR_OPTIONS.children().hover(function () {
                if ($(this)[0].id === "volumeBar") {
                    return;
                }
                let clicked = $(this).attr('data-clicked') || 'false';
                if (clicked === "false")
                    $(this).css({
                        "color": "white"
                    });
            }, function () {
                let clicked = $(this).attr('data-clicked') || "false";
                if (clicked === "false")
                    $(this).css({
                        "background": "",
                        "color": ""
                    });
            });
            window.addEventListener("mousedown", function (e) {
                let target = e.target;
                if (target) {
                    let targetClass = target.className || "noclass";
                    let targetID = target.id;
                    let parent = target.parentNode;
                    let parentClass = target.parentNode.className || "noclass";
                    if (PianoRhythm.MINI_PROFILE && PianoRhythm.MINI_PROFILE_VISIBLE) {
                        if (parent && parentClass && parentClass.indexOf("miniProfileChild") === -1) {
                            if (targetClass && targetClass.indexOf("miniProfileChild") === -1) {
                                PianoRhythm.hideMiniProfile();
                            }
                        }
                    }
                    if (!target.closest(".ctxmenu-menu")) {
                        if (PianoRhythm.CONTEXT_MENU)
                            PianoRhythm.CONTEXT_MENU.css("display", "none");
                        if (PianoRhythm.CONTEXT_MENU2)
                            PianoRhythm.CONTEXT_MENU2.css("display", "none");
                        if (PianoRhythm.CONTEXT_MENU_DOCK)
                            PianoRhythm.CONTEXT_MENU_DOCK.css("display", "none");
                    }
                    switch (targetID) {
                        case "chatMessages":
                        case "chatMessagesUL":
                            if (PianoRhythm.MOUSE_OVER_SCROLL_BAR)
                                return;
                            if (PianoRhythm.CLIENT_FOCUS != CLIENT_FOCUS.PIANO && PianoRhythm.CMESSAGES[0].style.opacity == "1")
                                PianoRhythm.FOCUS_PIANO();
                            break;
                        case "bottomBar":
                            if (PianoRhythm.CLIENT_FOCUS == CLIENT_FOCUS.CHAT)
                                PianoRhythm.FOCUS_PIANO();
                            break;
                    }
                    switch (targetClass) {
                        case "dimPage":
                            if (PianoRhythm.MAIN_PROFILE_VISIBLE) {
                                PianoRhythm.hideMainProfile();
                                PianoRhythm.dimPage(false);
                                return;
                            }
                            if (PianoRhythmUpLink.VISIBLE) {
                                PianoRhythm.UPLINK.hide();
                                return;
                            }
                            let bool = (PianoRhythm.CLIENT_FOCUS == CLIENT_FOCUS.CHAT);
                            if (BasicBox.BOX_VISIBLE)
                                bool = true;
                            PianoRhythm.FOCUS_PIANO(bool);
                            break;
                        case "messageChat":
                        case "message":
                            PianoRhythm.CMESSAGEINPUTCONTAINER.css("z-index", 1005);
                            PianoRhythm.CLIENT_FOCUS = CLIENT_FOCUS.CHAT;
                            break;
                    }
                }
            });
            window.addEventListener("mouseup", function (e) {
                PianoRhythm.TAGMODIF_VISIBLE = false;
            });
            PianoRhythm.CMESSAGEINPUT.on("mousedown", function (evt) {
                if (window.getSelection) {
                    if (window.getSelection().empty) {
                        window.getSelection().empty();
                    }
                    else if (window.getSelection().removeAllRanges) {
                        window.getSelection().removeAllRanges();
                    }
                }
            });
            PianoRhythm.CMESSAGEINPUT.focus(function (evt) {
                PianoRhythm.INPUT_BAR_FOCUSED = true;
                PianoRhythm.FOCUS_CHAT();
            });
            PianoRhythm.CMESSAGEINPUT.on("blur", function (evt) {
                PianoRhythm.INPUT_BAR_FOCUSED = false;
                if (PianoRhythm.TAGMODIF && PianoRhythm.TAGMODIF_VISIBLE)
                    PianoRhythm.CMESSAGEINPUT.focus();
                else {
                }
            });
            let charBeforeCaret = '';
            let charAfterCaret = '';
            let indexOfMention = -1;
            PianoRhythm.CMESSAGEINPUT.on('input', function (e) {
                let caretIndex = PianoRhythm.CMESSAGEINPUT[0].selectionStart;
                charBeforeCaret = PianoRhythm.CMESSAGEINPUT.val().charAt(caretIndex - 1);
                if (charBeforeCaret === '@') {
                    indexOfMention = caretIndex;
                }
                if (PianoRhythm.CLIENT_FOCUS !== CLIENT_FOCUS.CHAT)
                    PianoRhythm.FOCUS_CHAT();
                if (e.which !== 8)
                    PianoRhythm.updateTyping();
                let val = PianoRhythm.CMESSAGEINPUT.val();
                if (val.length <= 0) {
                    if (PianoRhythm.MENTIONS)
                        PianoRhythm.MENTIONS.hide();
                }
                if ((val.indexOf("/r ") === 0 || val.indexOf("/w ") === 0) && PianoRhythm.LAST_WHISPERER && PianoRhythm.LAST_WHISPERER.length > 0) {
                    PianoRhythm.CMESSAGEINPUT.val("/whisper (" + PianoRhythm.LAST_WHISPERER + ") ");
                }
            });
            PianoRhythm.CMESSAGEINPUT.keyup(function (evt) {
                let caretIndex = PianoRhythm.CMESSAGEINPUT[0].selectionStart;
                charBeforeCaret = PianoRhythm.CMESSAGEINPUT.val().charAt(caretIndex - 1);
                charAfterCaret = PianoRhythm.CMESSAGEINPUT.val().charAt(caretIndex);
            });
            PianoRhythm.CMESSAGEINPUT.keydown(function (evt) {
                if (PianoRhythm.CLIENT_FOCUS !== CLIENT_FOCUS.CHAT)
                    PianoRhythm.FOCUS_CHAT();
                if (evt.which === 13 && PianoRhythm.CMESSAGEINPUT && PianoRhythm.CMESSAGEINPUT.val().length > 0) {
                    PianoRhythm.CHAT_SETTINGS.keyCount = 0;
                    if (PianoRhythm.CHAT_SETTINGS.prevCommand[PianoRhythm.CHAT_SETTINGS.commandCount] !== PianoRhythm.CMESSAGEINPUT.val()) {
                        PianoRhythm.CHAT_SETTINGS.commandCount++;
                        if (PianoRhythm.CHAT_SETTINGS.commandCount >= PianoRhythm.CHAT_SETTINGS.maxCommands)
                            PianoRhythm.CHAT_SETTINGS.commandCount = 0;
                        PianoRhythm.CHAT_SETTINGS.prevCommand[PianoRhythm.CHAT_SETTINGS.commandCount] =
                            PianoRhythm.CMESSAGEINPUT.val();
                    }
                }
                if (evt.which === 38 && PianoRhythm.CMESSAGEINPUT.is(":focus")) {
                    if (PianoRhythm.CHAT_SETTINGS.keyCount < PianoRhythm.CHAT_SETTINGS.prevCommand.length - 1)
                        PianoRhythm.CHAT_SETTINGS.keyCount++;
                    if (typeof PianoRhythm.CHAT_SETTINGS.prevCommand[PianoRhythm.CHAT_SETTINGS.keyCount] !== "undefined") {
                        let index = PianoRhythm.CHAT_SETTINGS.prevCommand.length - PianoRhythm.CHAT_SETTINGS.keyCount;
                        PianoRhythm.CMESSAGEINPUT.val(PianoRhythm.CHAT_SETTINGS.prevCommand[index]);
                    }
                }
                if (evt.which === 40 && PianoRhythm.CMESSAGEINPUT.is(":focus")) {
                    if (PianoRhythm.CHAT_SETTINGS.keyCount > 1)
                        PianoRhythm.CHAT_SETTINGS.keyCount--;
                    if (typeof PianoRhythm.CHAT_SETTINGS.prevCommand[PianoRhythm.CHAT_SETTINGS.keyCount] !== "undefined") {
                        let index = PianoRhythm.CHAT_SETTINGS.prevCommand.length - PianoRhythm.CHAT_SETTINGS.keyCount;
                        PianoRhythm.CMESSAGEINPUT.val(PianoRhythm.CHAT_SETTINGS.prevCommand[index]);
                    }
                }
            });
            PianoRhythm.CSUBMITFORM.submit(function () {
                if (!PianoRhythm.CHAT_SETTINGS.canChat)
                    return;
                PianoRhythm.CHAT_SETTINGS.canChat = false;
                setTimeout(() => {
                    PianoRhythm.CHAT_SETTINGS.canChat = true;
                }, 400);
                let message = PianoRhythm.CMESSAGEINPUT.val();
                if (PianoRhythm.CLIENT.type !== user_1.UserType.OSOP)
                    message = PianoRhythm.strip(message);
                if (message.toLowerCase().indexOf("/offline") === 0) {
                    PianoRhythm.goOFFLINE();
                    PianoRhythm.CMESSAGEINPUT.val('');
                    return;
                }
                if (message.toLowerCase().indexOf("/donate") === 0) {
                    PianoRhythm.CMESSAGEINPUT.val('');
                    PianoRhythm.chatMessage({ message: "https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=FXXHM5FKP6PVS.", name: "Server" });
                    return;
                }
                if (message.toLowerCase().indexOf("/patreon") === 0) {
                    PianoRhythm.CMESSAGEINPUT.val('');
                    PianoRhythm.chatMessage({ message: "https://www.patreon.com/pianorhythm", name: "Server" });
                    return;
                }
                if (message.toLowerCase().indexOf("/online") === 0) {
                    PianoRhythm.goONLINE();
                    PianoRhythm.CMESSAGEINPUT.val('');
                    return;
                }
                if (message.toLowerCase().indexOf("/clear") === 0) {
                    PianoRhythm.CMESSAGESUL.empty();
                    PianoRhythm.CMESSAGEINPUT.val('');
                    PianoRhythm.CHAT_SETTINGS.totalMessages = 0;
                    PianoRhythm.CHAT_SETTINGS.oldMessages = 0;
                    PianoRhythm.CHAT_SETTINGS.newMessages = 0;
                    PianoRhythm.chatMessage({ message: "You've cleared the chat.", name: "Browser" });
                    return;
                }
                if (message.toLowerCase().indexOf("/refresh_rooms") === 0) {
                    if (PianoRhythm.CLIENT && PianoRhythm.SOCKET) {
                        PianoRhythm.SOCKET.emit("checkRoomList");
                        PianoRhythm.chatMessage({ message: "You've refreshed the rooms list.", name: "Browser" });
                    }
                    PianoRhythm.CMESSAGEINPUT.val('');
                    PianoRhythm.FOCUS_PIANO();
                    return;
                }
                if (message.toLowerCase().indexOf("/refresh_users") === 0) {
                    if (PianoRhythm.CLIENT && PianoRhythm.SOCKET) {
                        PianoRhythm.SOCKET.emit("checkPlayerList");
                        PianoRhythm.chatMessage({ message: "You've refreshed the players list.", name: "Browser" });
                    }
                    PianoRhythm.CMESSAGEINPUT.val('');
                    PianoRhythm.FOCUS_PIANO();
                    return;
                }
                if (message.length > 220)
                    return;
                if (/\S/.test(message)) {
                    if (!PianoRhythm.SOCKET)
                        return;
                    PianoRhythm.SOCKET.emit("chatMessage", message);
                    PianoRhythm.USER_IS_TYPING = false;
                    if (PianoRhythm.RhythmBlobFactory && PianoRhythm.SETTINGS["enableBlobs"]) {
                        if (PianoRhythm.RhythmBlobFactory.getClientBlob())
                            PianoRhythm.RhythmBlobFactory.getClientBlob().isTalking = false;
                    }
                    if (PianoRhythm && PianoRhythm.CLIENT && PianoRhythm.chatChannel)
                        PianoRhythm.chatChannel.publish({
                            type: "isTyping",
                            value: false,
                            id: PianoRhythm.SOCKET.id,
                            uuid: PianoRhythm.CLIENT.id,
                            name: PianoRhythm.CLIENT.name
                        });
                    PianoRhythm.CMESSAGEINPUT.val('');
                    PianoRhythm.CMESSAGEINPUT.blur();
                }
                if (!PianoRhythm.checkMajorElementsDim())
                    PianoRhythm.FOCUS_PIANO();
                return false;
            });
            let boxDimensions = {
                width: 620,
                height: 350
            };
            if (PianoRhythm.DEBUG_MESSAGING)
                console.warn("UI CREATED!");
            PianoRhythm.NEWROOMBUTTON.click(() => {
                PianoRhythm.CLIENT_FOCUS = CLIENT_FOCUS.NEWROOM;
                PianoRhythm.hideOptionBoxes(PianoRhythm.NEW_ROOM_BOX);
                PianoRhythm.setButtonActive(PianoRhythm.NEWROOMBUTTON, true, "white", PianoRhythm.COLORS.base4, true);
                let newRoomBox, inst_select;
                if (!PianoRhythm.NEW_ROOM_BOX) {
                    newRoomBox = new BasicBox({
                        id: "PR_NEWROOM",
                        height: boxDimensions.height,
                        width: boxDimensions.width,
                        title: "PianoRhythm New Room",
                        color: PianoRhythm.COLORS.base4
                    });
                    newRoomBox.box.css({
                        bottom: (PianoRhythm.BOTTOM_BAR.height()) + "px",
                        top: "",
                        "border": "4px solid white",
                        "border-left": "none",
                    });
                    let nr_RoomNameInput, nr_RoomPrivate = false, nr_RoomWelcomeMessage, nr_RoomPassword, nr_GameMode, nr_RoomType, nr_OnlyHostCanPlay, nr_SlotMode = SLOT_MODE.SINGLE, nr_maxPlayers = 20, nr_allowedTool = "ANY", nr_kblayout = "ANY", nr_allowBotMessages = true, nr_allowRecording = true;
                    newRoomBox.createSideMenu({
                        menuItems: [
                            {
                                name: "BASIC",
                                content: function (evt) {
                                    let content = $(document.createElement("div"));
                                    let counter = 0;
                                    var label1 = $(document.createElement("label"));
                                    label1.addClass("sideMenuContentItem");
                                    var optionInput = newRoomBox.addInput({
                                        type2: "text",
                                        appendToBox: false,
                                        paddingLeft: "0px",
                                        css: {
                                            "margin": "0", "margin-left": '5px', "margin-top": "10px"
                                        }
                                    });
                                    optionInput.find("input").attr("maxlength", 24);
                                    nr_RoomNameInput = optionInput;
                                    label1.attr("title", "Enter a name for your channel!");
                                    label1.text("Channel Name:");
                                    label1.append(optionInput);
                                    label1.qtip();
                                    content.append(label1);
                                    var label1 = $(document.createElement("label"));
                                    label1.addClass("sideMenuContentItem");
                                    var optionInput = newRoomBox.addInput({
                                        type: "select",
                                        removeNoneOption: true,
                                        list: ["CHAT AND PLAY", "GUESS THAT CHORD"],
                                        value: "CHAT AND PLAY",
                                        appendToBox: false,
                                        paddingLeft: "5px",
                                        stateChange: (evt) => {
                                            nr_GameMode = evt.currentTarget.value;
                                        }
                                    });
                                    label1.attr("title", "Choose the game mode for the channel!");
                                    label1.text("Game Mode");
                                    label1.append(optionInput);
                                    label1.qtip();
                                    content.append(label1);
                                    var label1 = $(document.createElement("label"));
                                    label1.addClass("sideMenuContentItem");
                                    var optionInput = newRoomBox.addInput({
                                        type2: "text",
                                        appendToBox: false,
                                        paddingLeft: "0px",
                                        css: {
                                            "margin": "0", "margin-left": '5px', "margin-top": "10px"
                                        }
                                    });
                                    optionInput.find("input").attr("maxlength", 24);
                                    nr_RoomPassword = optionInput;
                                    label1.attr("title", "(Optional) Enter a password for your room.");
                                    label1.text("Password:");
                                    label1.append(optionInput);
                                    label1.qtip();
                                    content.append(label1);
                                    var label1 = $(document.createElement("label"));
                                    label1.addClass("sideMenuContentItem");
                                    var id = "ui_newRoomBasic" + counter;
                                    counter++;
                                    var checkBox1 = $(document.createElement('input')).attr({
                                        "class": "noselect checkbox-custom",
                                        id: id,
                                        type: 'checkbox'
                                    });
                                    checkBox1.prop("checked", false);
                                    checkBox1.change(function () {
                                        nr_RoomPrivate = this.checked;
                                    });
                                    label1.attr("title", "Make your room private (invisible from global channel list)");
                                    label1.text("Make channel private ");
                                    label1.prepend(checkBox1);
                                    label1.qtip();
                                    checkBox1.after("<label class='noselect checkbox-custom-label' for='" + id + "'></label>");
                                    content.append(label1);
                                    var label1 = $(document.createElement("label"));
                                    label1.addClass("sideMenuContentItem");
                                    var id = "ui_newRoomBasic" + counter;
                                    counter++;
                                    var checkBox1 = $(document.createElement('input')).attr({
                                        "class": "noselect checkbox-custom",
                                        id: id,
                                        type: 'checkbox'
                                    });
                                    checkBox1.prop("checked", false);
                                    checkBox1.change(function () {
                                        nr_OnlyHostCanPlay = this.checked;
                                    });
                                    label1.attr("title", "Only room host can play notes. Everyone else will just have to listen!");
                                    label1.text("Only Room Host can play ");
                                    label1.prepend(checkBox1);
                                    label1.qtip();
                                    checkBox1.after("<label class='noselect checkbox-custom-label' for='" + id + "'></label>");
                                    content.append(label1);
                                    var label1 = $(document.createElement("label"));
                                    label1.addClass("sideMenuContentItem");
                                    var id = "ui_newRoomBasic" + counter;
                                    counter++;
                                    var checkBox1 = $(document.createElement('input')).attr({
                                        "class": "noselect checkbox-custom",
                                        id: id,
                                        type: 'checkbox'
                                    });
                                    checkBox1.prop("checked", true);
                                    checkBox1.change(function () {
                                        nr_allowRecording = this.checked;
                                    });
                                    label1.attr("title", "If unchecked then players will not be allowed to record other players.");
                                    label1.text("Allow recording");
                                    label1.prepend(checkBox1);
                                    label1.qtip();
                                    checkBox1.after("<label class='noselect checkbox-custom-label' for='" + id + "'></label>");
                                    content.append(label1);
                                    var label1 = $(document.createElement("label"));
                                    label1.addClass("sideMenuContentItem");
                                    var id = "ui_newRoomBasic" + counter;
                                    counter++;
                                    var checkBox1 = $(document.createElement('input')).attr({
                                        "class": "noselect checkbox-custom",
                                        id: id,
                                        type: 'checkbox'
                                    });
                                    checkBox1.prop("checked", true);
                                    checkBox1.change(function () {
                                        nr_allowBotMessages = this.checked;
                                    });
                                    label1.attr("title", "If unchecked then other players' bot messages will be not be shown.");
                                    label1.text("Allow Bot Messages");
                                    label1.prepend(checkBox1);
                                    label1.qtip();
                                    checkBox1.after("<label class='noselect checkbox-custom-label' for='" + id + "'></label>");
                                    content.append(label1);
                                    return content;
                                },
                                onClick: function (evt) {
                                    if (newRoomBox.sideMenu) {
                                        if (newRoomBox.sideMenu.selectedContent === "menuItemContent_" + evt.target.innerText)
                                            return;
                                        newRoomBox.sideMenu.hideAllContent(evt.target.innerText);
                                    }
                                }
                            },
                            {
                                name: "ADVANCED",
                                content: function (evt) {
                                    let content = $(document.createElement("div"));
                                    let counter = 0;
                                    var label1 = $(document.createElement("label"));
                                    label1.addClass("sideMenuContentItem");
                                    var optionInput = newRoomBox.addInput({
                                        type2: "text",
                                        width: "90%",
                                        appendToBox: false,
                                        paddingLeft: "0px",
                                        css: {
                                            "margin": "0", "margin-left": '5px', "margin-top": "10px"
                                        }
                                    });
                                    optionInput.children().attr("value", "Welcome to my room");
                                    nr_RoomWelcomeMessage = optionInput;
                                    label1.attr("title", "Enter a message to greet new players!");
                                    label1.text("Welcome Message:");
                                    label1.append(optionInput);
                                    label1.qtip();
                                    content.append(label1);
                                    var label1 = $(document.createElement("label"));
                                    label1.addClass("sideMenuContentItem");
                                    var optionInput = newRoomBox.addInput({
                                        type: "select",
                                        removeNoneOption: true,
                                        list: ["SINGLE", "MULTI", "PIANO_2", "PIANO_4", "PIANO_8"],
                                        value: "SINGLE",
                                        appendToBox: false,
                                        paddingLeft: "5px",
                                        stateChange: (evt) => {
                                            var val = evt.currentTarget.value;
                                            PianoRhythmDock.CURRENT_SLOT_MODE = SLOT_MODE[SLOT_MODE[val]];
                                        }
                                    });
                                    label1.attr("title", "Set the slot mode for the room!");
                                    label1.text("Slots Mode");
                                    label1.append(optionInput);
                                    label1.qtip();
                                    content.append(label1);
                                    var label1 = $(document.createElement("label"));
                                    label1.addClass("sideMenuContentItem");
                                    let kb_optionInput;
                                    function disableKBLAYOUT() {
                                        if (kb_optionInput && kb_optionInput["input"])
                                            kb_optionInput["input"].attr("disabled", "disabled");
                                        kb_optionInput["input"].css("opacity", "0.2");
                                    }
                                    function enableKBLAYOUT() {
                                        if (kb_optionInput && kb_optionInput["input"]) {
                                            kb_optionInput["input"].removeAttr("disabled");
                                            kb_optionInput["input"].css("opacity", "1");
                                        }
                                    }
                                    var optionInput = newRoomBox.addInput({
                                        type: "select",
                                        removeNoneOption: true,
                                        list: ["ANY", "KEYBOARD", "MOUSE", "MIDI"],
                                        value: nr_allowedTool,
                                        appendToBox: false,
                                        paddingLeft: "5px",
                                        stateChange: (evt) => {
                                            let value = $(evt.currentTarget).val();
                                            if (kb_optionInput && value === "KEYBOARD")
                                                enableKBLAYOUT();
                                            else
                                                disableKBLAYOUT();
                                            nr_allowedTool = value;
                                        }
                                    });
                                    label1.attr("title", "Set the method that players must use to play in the room!");
                                    label1.text("Allowed Tool");
                                    label1.append(optionInput);
                                    label1.qtip();
                                    content.append(label1);
                                    var label1 = $(document.createElement("label"));
                                    label1.addClass("sideMenuContentItem");
                                    kb_optionInput = newRoomBox.addInput({
                                        type: "select",
                                        removeNoneOption: true,
                                        list: ["ANY", "VIRTUAL_PIANO", "MPP", "PIANORHYTHM"],
                                        value: nr_kblayout,
                                        appendToBox: false,
                                        paddingLeft: "5px",
                                        stateChange: (evt) => {
                                            nr_kblayout = $(evt.currentTarget).val();
                                        }
                                    });
                                    label1.attr("title", "Set the keyboard layout that players must use!");
                                    label1.text("Keyboard Layout");
                                    label1.append(kb_optionInput);
                                    label1.qtip();
                                    content.append(label1);
                                    disableKBLAYOUT();
                                    var label3d = $(document.createElement("label"));
                                    label3d.addClass("sideMenuContentItem");
                                    label3d.attr("id", "options_maxPlayers");
                                    label3d.attr("title", "Set the max amount of players that can join your room.");
                                    var labeltext = $(document.createElement("label"));
                                    labeltext.text("Max Players");
                                    label3d.append(labeltext);
                                    label3d.css({
                                        "height": "75px",
                                        "padding-top": "10px"
                                    });
                                    label3d.qtip({ style: { classes: "qTip_optionsBox qtip-light" } });
                                    content.append(label3d);
                                    setTimeout(() => {
                                        var slider = noUiSlider.create(document.getElementById("options_maxPlayers"), {
                                            start: 20,
                                            step: 1,
                                            connect: "lower",
                                            behaviour: 'snap',
                                            range: {
                                                'min': 1,
                                                'max': 20
                                            }
                                        });
                                        slider.on('update', function (values, handle) {
                                            var value = values[0];
                                            nr_maxPlayers = Math.floor(value);
                                            labeltext.text("Max Players - " + nr_maxPlayers);
                                        });
                                        label3d.removeClass("noUi-connect noUi-target");
                                        label3d.find('.noUi-base').css({
                                            "height": "17px",
                                            "top": "10px",
                                            "width": "95%",
                                            "background": "rgba(0,0,0,0.3)"
                                        });
                                    }, 50);
                                    var label1 = $(document.createElement("label"));
                                    label1.addClass("sideMenuContentItem");
                                    label1.attr("title", "You can select up to 8 instruments or don't select any to have them all available.");
                                    label1.text("Instruments Selection");
                                    inst_select = $(document.createElement("select"));
                                    var inst_select_parent = $(document.createElement("div"));
                                    label1.append(inst_select_parent);
                                    inst_select.attr("multiple", "multiple");
                                    inst_select.attr("draggable", "false");
                                    inst_select.css({ width: 450 });
                                    inst_select_parent.append(inst_select);
                                    inst_select.select2({
                                        tags: true,
                                        data: PianoRhythmPlayer_1.PianoRhythmInstrumentSelection.INSTRUMENT_SELECTION_SELECT2_LIST,
                                        maximumSelectionLength: 8,
                                        placeholder: "Select the instrument(s)",
                                        allowClear: true,
                                        templateResult: PianoRhythmPlayer_1.PianoRhythmInstrumentSelection.formatInstrument,
                                    });
                                    inst_select.val([Piano_1.Piano.DEFAULT_INSTRUMENT]).trigger("change");
                                    PianoRhythm.NEW_ROOM_INSTRUMENT_SELECT = inst_select;
                                    label1.qtip();
                                    content.append(label1);
                                    return content;
                                },
                                onClick: function (evt) {
                                    if (newRoomBox.sideMenu) {
                                        if (newRoomBox.sideMenu.selectedContent === "menuItemContent_" + evt.target.innerText)
                                            return;
                                        newRoomBox.sideMenu.hideAllContent(evt.target.innerText);
                                    }
                                }
                            }
                        ]
                    });
                    newRoomBox.show();
                    PianoRhythm.BODY.append(newRoomBox.box);
                    newRoomBox.box.css({
                        overflow: "hidden",
                        marginTop: boxDimensions.height,
                        height: 0,
                        opacity: 0.1
                    })
                        .animate({
                        marginTop: 0,
                        opacity: 1,
                        height: boxDimensions.height
                    }, 250, "swing", function () {
                        $(this).css({
                            display: "",
                            marginTop: ""
                        });
                        let button1 = BasicBox.createButton("CREATE", () => {
                            let roomName = nr_RoomNameInput.children().val() || "";
                            let welcomeMessage = nr_RoomWelcomeMessage.children().val() || "";
                            let gameMode = nr_GameMode || "CHAT AND PLAY";
                            let roomPassword = nr_RoomPassword.children().val() || "";
                            let onlyHost = nr_OnlyHostCanPlay || false;
                            let room = {};
                            let submit = true;
                            if (roomName.length < 1) {
                                let randLetter = String.fromCharCode(65 + Math.floor(Math.random() * 5));
                                let uniqid = randLetter + Date.now();
                                roomName = "Room_" + (uniqid.slice(-5));
                            }
                            else if (roomName.length > PianoRhythm.maxRoomnameChar) {
                                PianoRhythm.notify("The room name exceeds the limit of " + PianoRhythm.maxRoomnameChar);
                                return;
                            }
                            room["name"] = roomName;
                            room["welcomeMessage"] = welcomeMessage;
                            room["private"] = nr_RoomPrivate;
                            room["gameMode"] = gameMode;
                            room["password"] = roomPassword;
                            room["onlyHost"] = onlyHost;
                            let instArray = inst_select.val();
                            PianoRhythm.ROOM_INSTRUMENTS = instArray;
                            room["instruments"] = (instArray && instArray.length > 0) ? instArray : [];
                            room["slotMode"] = nr_SlotMode;
                            room["maxPlayers"] = nr_maxPlayers;
                            room["allowRecording"] = nr_allowRecording;
                            room["allowBotMessages"] = nr_allowBotMessages;
                            room["allowedTool"] = Piano_1.NOTE_SOURCE[nr_allowedTool];
                            room["allowedKBLayout"] = Piano_1.KEYBOARD_LAYOUT[nr_kblayout];
                            switch (gameMode) {
                                case "GUESS THAT CHORD":
                                    room["type"] = "game";
                                    break;
                                case "CHAT AND PLAY":
                                default:
                                    room["type"] = "chat and play";
                                    break;
                            }
                            if (submit) {
                                PianoRhythm.setButtonActive(PianoRhythm.NEWROOMBUTTON, false);
                                newRoomBox.hide();
                                console.log("NEW ROOM EMIT", room);
                                PianoRhythm.createRoom(room, null, (data) => {
                                });
                            }
                        }, { left: "8px", bottom: "105px", "position": "absolute" });
                        button1.find("button").css("background-color", PianoRhythm.COLORS.base4);
                        newRoomBox.box.append(button1);
                    });
                    PianoRhythm.NEW_ROOM_BOX = newRoomBox;
                }
                else {
                    newRoomBox = PianoRhythm.NEW_ROOM_BOX;
                    if (newRoomBox.visible) {
                        newRoomBox.hide(true);
                        PianoRhythm.setButtonActive(PianoRhythm.NEWROOMBUTTON, false);
                    }
                    else {
                        newRoomBox.show(true, boxDimensions.height);
                    }
                }
            });
            PianoRhythm.QUITGAMEBUTTON.click(() => {
                PianoRhythm.CLIENT_FOCUS = CLIENT_FOCUS.BOTTOMBAR;
                PianoRhythm.setButtonActive(PianoRhythm.QUITGAMEBUTTON, true, "white", PianoRhythm.COLORS.base4, true);
                PianoRhythm.notify({
                    message: "<span style='font-weight:bold; color:#ff2233; font-size:larger; text-shadow: 0 0 15px gray'>Are you sure you want to quit the game? Click here to leave.</span>",
                    onClick: () => {
                        PianoRhythm.SOCKET.emit("game", {
                            gameID: PianoRhythm.CLIENT.roomID,
                            type: "quitgame",
                        });
                        PianoRhythm.QUITGAMEBUTTON.hide();
                    },
                    onClose: () => {
                        PianoRhythm.dimPage(false);
                        PianoRhythm.setButtonActive(PianoRhythm.QUITGAMEBUTTON, null);
                    }
                });
            });
            PianoRhythm.MIDIOPTIONSBUTTON.click(() => {
                PianoRhythm.CLIENT_FOCUS = CLIENT_FOCUS.MIDIOPTIONS;
                PianoRhythm.hideOptionBoxes(PianoRhythm.MIDI_BOX);
                PianoRhythm.setButtonActive(PianoRhythm.MIDIOPTIONSBUTTON, true, "white", PianoRhythm.COLORS.base4, true);
                if (!PianoRhythm.MIDI_BOX) {
                    let midi_IO_Box = new BasicBox({
                        id: "PR_MIDIOPTIONS",
                        title: "Midi I/O",
                        height: boxDimensions.height,
                        width: boxDimensions.width,
                        color: PianoRhythm.COLORS.base4
                    });
                    midi_IO_Box.box.css({
                        bottom: (PianoRhythm.BOTTOM_BAR.height()) + "px",
                        top: "",
                        "border": "4px solid white",
                        "border-left": "none",
                        "padding-top": 0
                    });
                    midi_IO_Box.createSideMenu({
                        menuItems: [
                            {
                                name: "MIDI I/O",
                                content: function (evt) {
                                    let content = $(document.createElement("div"));
                                    var label1 = $(document.createElement("label"));
                                    label1.addClass("sideMenuContentItem");
                                    label1.text("MIDI INPUT");
                                    function midi_li_click(evt, itemName, type = "in") {
                                        if (type === undefined)
                                            type = "in";
                                        if (evt && evt.target || itemName && type) {
                                            let name = itemName || $(evt.target).text();
                                            let old_port = (type && type === "in") ? PianoRhythm.MIDI_IN_LIST[name] : PianoRhythm.MIDI_OUT_LIST[name];
                                            if (old_port) {
                                                if (type === "in")
                                                    old_port.onmidimessage = null;
                                                old_port.close();
                                                if (type === "in")
                                                    PianoRhythm.saveSessionSetting("MIDI", "lastMidi_In", PianoRhythm.getMidiInList());
                                                else {
                                                    PianoRhythm.saveSessionSetting("MIDI", "lastMidi_Out", PianoRhythm.getMidiOutList());
                                                }
                                            }
                                        }
                                    }
                                    function add_click(evt, ul, val, type = "in") {
                                        try {
                                            let $ul = ul;
                                            let mLI = $(document.createElement("li"));
                                            mLI.addClass("multiSelect_LI");
                                            mLI.text(val);
                                            let cross_icon = $(document.createElement("span"));
                                            cross_icon.addClass("icon-cross");
                                            cross_icon.addClass("multiSelect_LI_crossIcon");
                                            mLI.append(cross_icon);
                                            if (midi_li_click) {
                                                let clickFunct = function (data) {
                                                    mLI.off('click');
                                                    cross_icon.off('click');
                                                    mLI.fadeOut("fast", () => {
                                                        mLI.remove();
                                                    });
                                                    cross_icon.fadeOut("fast", () => {
                                                        cross_icon.remove();
                                                    });
                                                    midi_li_click(data, val, type);
                                                    data.preventDefault();
                                                    data.stopPropagation();
                                                };
                                                mLI.on("click", clickFunct);
                                                cross_icon.on("click", clickFunct);
                                            }
                                            if ($ul) {
                                                mLI.appendTo($ul).hide().fadeIn(500);
                                            }
                                            var new_port = (type && type === "in") ? PianoRhythm.MIDI_IN_LIST[val] : PianoRhythm.MIDI_OUT_LIST[val];
                                            if (new_port) {
                                                new_port.open();
                                                if (type && type === "in") {
                                                    new_port.onmidimessage = PianoRhythm.midiMessageParse;
                                                    PianoRhythm.saveSessionSetting("MIDI", "lastMidi_In", PianoRhythm.getMidiInList());
                                                }
                                                else {
                                                    PianoRhythm.saveSessionSetting("MIDI", "lastMidi_Out", PianoRhythm.getMidiOutList());
                                                }
                                            }
                                        }
                                        catch (err) {
                                        }
                                    }
                                    let lastMidi_In;
                                    try {
                                        lastMidi_In = JSON.parse(PianoRhythm.loadSessionSetting("MIDI", "lastMidi_In"));
                                    }
                                    catch (err) {
                                        lastMidi_In = PianoRhythm.MIDI_CURRENT_IN ? [PianoRhythm.MIDI_CURRENT_IN.name] : [];
                                    }
                                    var input = midi_IO_Box.addInput({
                                        type: "multi",
                                        appendToBox: false,
                                        removeNoneOption: true,
                                        list: PianoRhythm.getMidiList("input"),
                                        value: lastMidi_In || "none",
                                        li_click: midi_li_click,
                                        add_click: (evt, ul, val) => {
                                            if (val !== "none" && PianoRhythm.MIDI_IN_LIST[val] && PianoRhythm.MIDI_IN_LIST[val].connection !== "open")
                                                add_click(evt, ul, val);
                                        },
                                        stateChange: (evt, ul) => {
                                            var val = evt || evt.currentTarget.value;
                                            if (val !== "none" && PianoRhythm.MIDI_IN_LIST[val] && PianoRhythm.MIDI_IN_LIST[val].connection !== "open") {
                                                add_click(evt, ul, val);
                                            }
                                        }
                                    });
                                    label1.append(input);
                                    content.append(label1);
                                    var label2 = $(document.createElement("label"));
                                    label2.addClass("sideMenuContentItem");
                                    label2.text("MIDI OUTPUT");
                                    let lastMidi_Out;
                                    try {
                                        lastMidi_Out = JSON.parse(PianoRhythm.loadSessionSetting("MIDI", "lastMidi_Out"));
                                    }
                                    catch (err) {
                                        lastMidi_Out = PianoRhythm.MIDI_CURRENT_OUT ? [PianoRhythm.MIDI_CURRENT_OUT.name] : [];
                                    }
                                    var output = midi_IO_Box.addInput({
                                        type: "multi",
                                        appendToBox: false,
                                        removeNoneOption: true,
                                        list: PianoRhythm.getMidiList("output"),
                                        midi_type: "out",
                                        value: lastMidi_Out || [],
                                        li_click: midi_li_click,
                                        add_click: (evt, ul, val) => {
                                            if (val !== "none" && PianoRhythm.MIDI_OUT_LIST[val] && PianoRhythm.MIDI_OUT_LIST[val].connection !== "open")
                                                add_click(evt, ul, val, "out");
                                        },
                                        stateChange: (evt, ul) => {
                                            var val = evt || evt.currentTarget.value;
                                            if (val !== "none" && PianoRhythm.MIDI_OUT_LIST[val] && PianoRhythm.MIDI_OUT_LIST[val].connection !== "open") {
                                                add_click(evt, ul, val, "out");
                                            }
                                        }
                                    });
                                    label2.append(output);
                                    content.append(label2);
                                    return content;
                                },
                                onClick: function (evt) {
                                    if (midi_IO_Box.sideMenu) {
                                        if (midi_IO_Box.sideMenu.selectedContent === "menuItemContent_" + evt.target.innerText)
                                            return;
                                        midi_IO_Box.sideMenu.hideAllContent(evt.target.innerText);
                                    }
                                }
                            },
                            {
                                name: "ADVANCED",
                                content: function (evt) {
                                    var slider;
                                    var content = $(document.createElement("div"));
                                    let counter = 0;
                                    counter++;
                                    var header1 = BasicBox.createSideMenuHeader("Velocity Effects");
                                    content.append(header1);
                                    var label1 = $(document.createElement("label"));
                                    label1.addClass("sideMenuContentItem");
                                    var id = "ui_midiAdv" + counter;
                                    counter++;
                                    var checkBox1 = $(document.createElement('input')).attr({
                                        "class": "noselect checkbox-custom",
                                        id: id,
                                        type: 'checkbox'
                                    });
                                    var setting = PianoRhythm.loadSetting("MIDI", "ENABLE_VELOCITY");
                                    var val = (setting !== null) ? setting : true;
                                    checkBox1.prop("checked", val);
                                    checkBox1.change(function () {
                                        PianoRhythm.saveSetting("MIDI", "ENABLE_VELOCITY", this.checked);
                                        PianoRhythm.SETTINGS["ENABLE_VELOCITY"] = this.checked;
                                    });
                                    label1.attr("title", "If unchecked, the raw velocity values from the source will not be used. Instead it'll be set to the max value (127)");
                                    label1.text("Enable Velocity");
                                    label1.prepend(checkBox1);
                                    label1.qtip({ style: { classes: "qTip_optionsBox qtip-light" } });
                                    checkBox1.after("<label class='noselect checkbox-custom-label' for='" + id + "'></label>");
                                    content.append(label1);
                                    var label1 = $(document.createElement("label"));
                                    label1.addClass("sideMenuContentItem");
                                    var id = "ui_midiAdv" + counter;
                                    counter++;
                                    var checkBox1 = $(document.createElement('input')).attr({
                                        "class": "noselect checkbox-custom",
                                        id: id,
                                        type: 'checkbox'
                                    });
                                    var setting = PianoRhythm.loadSetting("MIDI", "VEL_BOOST_ENABLED");
                                    var val = (setting !== null) ? setting : true;
                                    checkBox1.prop("checked", val);
                                    checkBox1.change(function () {
                                        PianoRhythm.saveSetting("MIDI", "VEL_BOOST_ENABLED", this.checked);
                                        PianoRhythm.SETTINGS["VEL_BOOST_ENABLED"] = this.checked;
                                    });
                                    label1.attr("title", "Toggle the boosting of incoming midi notes at a lower velocity.");
                                    label1.text("Enable Velocity Boost");
                                    label1.prepend(checkBox1);
                                    label1.qtip({ style: { classes: "qTip_optionsBox qtip-light" } });
                                    checkBox1.after("<label class='noselect checkbox-custom-label' for='" + id + "'></label>");
                                    content.append(label1);
                                    var label1 = $(document.createElement("label"));
                                    label1.addClass("sideMenuContentItem");
                                    var id = "ui_midiAdv" + counter;
                                    counter++;
                                    var checkBox1 = $(document.createElement('input')).attr({
                                        "class": "noselect checkbox-custom",
                                        id: id,
                                        type: 'checkbox'
                                    });
                                    var setting = PianoRhythm.loadSessionSetting("MIDI", "VEL_METER_ENABLED");
                                    var val = (setting !== null) ? setting : true;
                                    checkBox1.prop("checked", val);
                                    checkBox1.change(function () {
                                        PianoRhythm.saveSessionSetting("MIDI", "VEL_METER_ENABLED", this.checked);
                                        PianoRhythm.SETTINGS["VEL_METER_ENABLED"] = this.checked;
                                        if (slider) {
                                            if (!this.checked) {
                                                slider.target.setAttribute('disabled', true);
                                                slider.set(5);
                                                PianoRhythm.saveSessionSetting("MIDI", "VEL_METER", 5);
                                                PianoRhythm.SETTINGS["VEL_METER"] = 5;
                                            }
                                            else
                                                slider.target.removeAttribute('disabled');
                                        }
                                    });
                                    label1.attr("title", "Toggle the velocity meter for notes.");
                                    label1.text("Enable Velocity Muting");
                                    label1.prepend(checkBox1);
                                    label1.qtip({ style: { classes: "qTip_optionsBox qtip-light" } });
                                    checkBox1.after("<label class='noselect checkbox-custom-label' for='" + id + "'></label>");
                                    content.append(label1);
                                    var label = $(document.createElement("label"));
                                    label.addClass("sideMenuContentItem");
                                    label.attr("id", "options_midi_velMute");
                                    var velMeter = PianoRhythm.loadSessionSetting("MIDI", "VEL_METER");
                                    label.attr("title", "Mute notes with a velocity that is less than or equal to the meter value.");
                                    var labeltext = $(document.createElement("label"));
                                    label.append(labeltext);
                                    label.css({
                                        "height": "75px",
                                        "padding-left": "35px"
                                    });
                                    label.qtip({ style: { classes: "qTip_optionsBox qtip-light" } });
                                    content.append(label);
                                    setTimeout(() => {
                                        slider = noUiSlider.create(document.getElementById("options_midi_velMute"), {
                                            start: (velMeter !== undefined && velMeter !== null) ? velMeter : 5,
                                            step: 1,
                                            connect: "lower",
                                            behaviour: 'snap',
                                            range: {
                                                'min': 0,
                                                'max': 127
                                            }
                                        });
                                        slider.on('update', function (values, handle) {
                                            var value = parseInt(values[0]);
                                            labeltext.text("Velocity Mute - " + value);
                                            PianoRhythm.saveSessionSetting("MIDI", "VEL_METER", value);
                                            PianoRhythm.SETTINGS["VEL_METER"] = value;
                                            if (PianoRhythm.MIDI_WORKER)
                                                PianoRhythm.MIDI_WORKER.postMessage({
                                                    type: "setVelMeter",
                                                    velMeter: (PianoRhythm.SETTINGS) ? PianoRhythm.SETTINGS["VEL_METER"] : 5
                                                });
                                        });
                                        label.removeClass("noUi-connect noUi-target");
                                        label.find('.noUi-base').css({
                                            "height": "17px",
                                            "top": "10px",
                                            "width": "95%",
                                            "background": "rgba(0,0,0,0.3)"
                                        });
                                    }, 50);
                                    return content;
                                },
                                onClick: function (evt) {
                                    if (midi_IO_Box.sideMenu) {
                                        if (midi_IO_Box.sideMenu.selectedContent === "menuItemContent_" + evt.target.innerText)
                                            return;
                                        midi_IO_Box.sideMenu.hideAllContent(evt.target.innerText);
                                    }
                                }
                            },
                        ]
                    });
                    PianoRhythm.BODY.append(midi_IO_Box.box);
                    midi_IO_Box.box.css({
                        overflow: "hidden",
                        marginTop: boxDimensions.height,
                        height: 0,
                        opacity: 0.1
                    }).animate({
                        marginTop: 0,
                        opacity: 1,
                        height: boxDimensions.height
                    }, 250, "swing", function () {
                        $(this).css({
                            display: "",
                            marginTop: ""
                        });
                    });
                    let button1 = BasicBox.createButton("Midi Player", () => {
                        if (PianoRhythmPlayer_1.PianoRhythmPlayer && PianoRhythmPlayer_1.PianoRhythmPlayer.MIDI_SELECTION) {
                            PianoRhythm.hideSelectionLists();
                            PianoRhythmPlayer_1.PianoRhythmPlayer.MIDI_SELECTION.show();
                            midi_IO_Box.hide();
                            PianoRhythm.setButtonActive(PianoRhythm.MIDIOPTIONSBUTTON, false);
                        }
                    }, { right: "5px", bottom: "10px", "position": "absolute" });
                    midi_IO_Box.box.append(button1);
                    midi_IO_Box.visible = true;
                    PianoRhythm.MIDI_BOX = midi_IO_Box;
                }
                else {
                    if (PianoRhythm.MIDI_BOX && PianoRhythm.MIDI_BOX.visible) {
                        PianoRhythm.MIDI_BOX.hide(true);
                        PianoRhythm.setButtonActive(PianoRhythm.MIDIOPTIONSBUTTON, false);
                    }
                    else {
                        PianoRhythm.MIDI_BOX.show(true, boxDimensions.height);
                    }
                }
            });
            let setting_gameMode, setting_makeRoomPrivateCheckBox, setting_onlyHostCheckBox, setting_allowRecordingCheckbox, setting_allowBotMessagesCheckBox, setting_welcomeMessage, setting_slotMode, setting_allowedTool, setting_kblayout, setting_maxPlayers, setting_maxPlayersLabel, setting_Instruments;
            let kb_optionInput;
            function disableKBLAYOUT() {
                if (kb_optionInput && kb_optionInput["input"])
                    kb_optionInput["input"].attr("disabled", "disabled");
                kb_optionInput["input"].css("opacity", "0.2");
            }
            function enableKBLAYOUT() {
                if (kb_optionInput && kb_optionInput["input"]) {
                    kb_optionInput["input"].removeAttr("disabled");
                    kb_optionInput["input"].css("opacity", "1");
                }
            }
            PianoRhythm.ROOMSETTINGSBUTTON.click(function (e) {
                PianoRhythm.CLIENT_FOCUS = CLIENT_FOCUS.BOTTOMBAR;
                PianoRhythm.hideOptionBoxes(PianoRhythm.ROOM_SETTINGS_BOX);
                let inst_select;
                if (PianoRhythm && PianoRhythm.SOCKET) {
                    PianoRhythm.SOCKET.emit("getRoomSettings", { id: PianoRhythm.CLIENT.roomID }, (err, result) => {
                        if (PianoRhythm.DEBUG_MESSAGING)
                            console.info("Get Room Settings: ", result);
                        if (!PianoRhythm.ROOM_SETTINGS_BOX) {
                            PianoRhythm.CLIENT_FOCUS = CLIENT_FOCUS.ROOMSETTINGS;
                            PianoRhythm.setButtonActive(PianoRhythm.ROOMSETTINGSBUTTON, true, "white", PianoRhythm.COLORS.base4, true);
                            let roomSettingsBox = new BasicBox({
                                id: "PR_ROOMSETTINGS",
                                height: boxDimensions.height,
                                width: boxDimensions.width,
                                title: "Room Settings",
                                color: PianoRhythm.COLORS.base4
                            });
                            roomSettingsBox.box.css({
                                bottom: (PianoRhythm.BOTTOM_BAR.height()) + "px",
                                top: "",
                                "border": "4px solid white",
                                "border-left": "none"
                            });
                            let nr_RoomNameInput, inst_select, nr_RoomPrivate = false, nr_RoomWelcomeMessage, nr_RoomPassword, nr_MaxPlayers, nr_GameMode, nr_allowBotMessages, nr_allowRecording, nr_onlyHostCanPlay, nr_SlotMode, nr_maxPlayers = 20, nr_Select, nr_allowedTool, nr_kblayout;
                            roomSettingsBox.createSideMenu({
                                menuItems: [
                                    {
                                        name: "BASIC",
                                        content: function (evt) {
                                            var content = $(document.createElement("div"));
                                            let counter = 0;
                                            var label1 = $(document.createElement("label"));
                                            label1.addClass("sideMenuContentItem");
                                            var optionInput = roomSettingsBox.addInput({
                                                type: "select",
                                                removeNoneOption: true,
                                                list: ["CHAT AND PLAY"],
                                                value: "CHAT AND PLAY",
                                                appendToBox: false,
                                                paddingLeft: "0px",
                                                stateChange: (evt) => {
                                                    nr_GameMode = evt.currentTarget.value;
                                                },
                                                css: {
                                                    "margin-left": 5
                                                }
                                            });
                                            setting_gameMode = optionInput;
                                            label1.attr("title", "Choose the game mode for the channel!");
                                            label1.text("Game Mode");
                                            label1.append(optionInput);
                                            label1.qtip();
                                            content.append(label1);
                                            var label1 = $(document.createElement("label"));
                                            label1.addClass("sideMenuContentItem");
                                            var optionInput = roomSettingsBox.addInput({
                                                type2: "text",
                                                appendToBox: false,
                                                paddingLeft: "0px",
                                                css: {
                                                    "margin": "0", "margin-left": '5px', "margin-top": "10px", "padding": "1%"
                                                }
                                            });
                                            optionInput.find("input").attr("maxlength", 24);
                                            nr_RoomPassword = optionInput;
                                            label1.attr("title", "(Optional) Enter a password for your room.");
                                            label1.text("Password:");
                                            label1.append(optionInput);
                                            label1.qtip();
                                            content.append(label1);
                                            var label1 = $(document.createElement("label"));
                                            label1.addClass("sideMenuContentItem");
                                            var id = "ui_roomSettings" + counter;
                                            counter++;
                                            var checkBox1 = $(document.createElement('input')).attr({
                                                "class": "noselect checkbox-custom",
                                                id: id,
                                                type: 'checkbox'
                                            });
                                            nr_RoomPrivate = (result.status == "PRIVATE");
                                            checkBox1.prop("checked", nr_RoomPrivate);
                                            checkBox1.change(function () {
                                                nr_RoomPrivate = this.checked;
                                            });
                                            setting_makeRoomPrivateCheckBox = checkBox1;
                                            label1.attr("title", "Make your room private (invisible from global channel list)");
                                            label1.text("Make channel private ");
                                            label1.prepend(checkBox1);
                                            label1.qtip();
                                            checkBox1.after("<label class='noselect checkbox-custom-label' for='" + id + "'></label>");
                                            content.append(label1);
                                            var label1 = $(document.createElement("label"));
                                            label1.addClass("sideMenuContentItem");
                                            var id = "ui_roomSettings" + counter;
                                            counter++;
                                            var checkBox1 = $(document.createElement('input')).attr({
                                                "class": "noselect checkbox-custom",
                                                id: id,
                                                type: 'checkbox'
                                            });
                                            var hostCheck = (result.onlyHost > 0);
                                            nr_onlyHostCanPlay = hostCheck;
                                            checkBox1.prop("checked", hostCheck);
                                            checkBox1.change(function () {
                                                nr_onlyHostCanPlay = this.checked;
                                            });
                                            setting_onlyHostCheckBox = checkBox1;
                                            label1.attr("title", "Makes it so that only the room owner can play music while everyone just listens!");
                                            label1.text("Only Room owner can play");
                                            label1.prepend(checkBox1);
                                            label1.qtip();
                                            checkBox1.after("<label class='noselect checkbox-custom-label' for='" + id + "'></label>");
                                            content.append(label1);
                                            var label1 = $(document.createElement("label"));
                                            label1.addClass("sideMenuContentItem");
                                            var id = "ui_roomSettings" + counter;
                                            counter++;
                                            var checkBox1 = $(document.createElement('input')).attr({
                                                "class": "noselect checkbox-custom",
                                                id: id,
                                                type: 'checkbox'
                                            });
                                            nr_allowRecording = (result.allowRecording !== undefined) ? result.allowRecording : true;
                                            checkBox1.prop("checked", nr_allowRecording);
                                            checkBox1.change(function () {
                                                nr_allowRecording = this.checked;
                                            });
                                            setting_allowRecordingCheckbox = checkBox1;
                                            label1.attr("title", "If unchecked then players will not be allowed to record other players.");
                                            label1.text("Allow recording");
                                            label1.prepend(checkBox1);
                                            label1.qtip();
                                            checkBox1.after("<label class='noselect checkbox-custom-label' for='" + id + "'></label>");
                                            content.append(label1);
                                            var label1 = $(document.createElement("label"));
                                            label1.addClass("sideMenuContentItem");
                                            var id = "ui_roomSettingsAdvanced" + counter;
                                            counter++;
                                            var checkBox1 = $(document.createElement('input')).attr({
                                                "class": "noselect checkbox-custom",
                                                id: id,
                                                type: 'checkbox'
                                            });
                                            nr_allowBotMessages = (result.allowBotMessage !== undefined) ? result.allowBotMessage : true;
                                            checkBox1.prop("checked", nr_allowBotMessages);
                                            checkBox1.change(function () {
                                                nr_allowBotMessages = this.checked;
                                            });
                                            setting_allowBotMessagesCheckBox = checkBox1;
                                            label1.attr("title", "If unchecked then other players' bot messages will be not be shown.");
                                            label1.text("Allow Bot Messages");
                                            label1.prepend(checkBox1);
                                            label1.qtip();
                                            checkBox1.after("<label class='noselect checkbox-custom-label' for='" + id + "'></label>");
                                            content.append(label1);
                                            return content;
                                        },
                                        onClick: function (evt) {
                                            if (roomSettingsBox.sideMenu) {
                                                if (roomSettingsBox.sideMenu.selectedContent === "menuItemContent_" + evt.target.innerText)
                                                    return;
                                                roomSettingsBox.sideMenu.hideAllContent(evt.target.innerText);
                                            }
                                        }
                                    },
                                    {
                                        name: "ADVANCED",
                                        content: function (evt) {
                                            var content = $(document.createElement("div"));
                                            let counter = 0;
                                            var label1 = $(document.createElement("label"));
                                            label1.addClass("sideMenuContentItem");
                                            var optionInput = roomSettingsBox.addInput({
                                                type2: "text",
                                                width: "90%",
                                                appendToBox: false,
                                                paddingLeft: "0px",
                                                css: {
                                                    "margin": "0", "margin-left": '5px', "margin-top": "10px"
                                                }
                                            });
                                            var message = result.welcomeMessage || "Welcome to my room";
                                            optionInput.children().attr("value", message);
                                            nr_RoomWelcomeMessage = optionInput;
                                            setting_welcomeMessage = optionInput;
                                            label1.attr("title", "Enter a message to greet new players!");
                                            label1.text("Welcome Message:");
                                            label1.append(optionInput);
                                            label1.qtip();
                                            content.append(label1);
                                            var label1 = $(document.createElement("label"));
                                            label1.addClass("sideMenuContentItem");
                                            var val = (result.slotsMode !== undefined && result.slotsMode !== -1) ? SLOT_MODE[result.slotsMode] : "SINGLE";
                                            nr_SlotMode = SLOT_MODE[val];
                                            var optionInput = roomSettingsBox.addInput({
                                                type: "select",
                                                removeNoneOption: true,
                                                list: ["SINGLE", "MULTI", "PIANO_2", "PIANO_4", "PIANO_8"],
                                                value: val,
                                                appendToBox: false,
                                                paddingLeft: "5px",
                                                stateChange: (evt) => {
                                                    var val = evt.currentTarget.value;
                                                    nr_SlotMode = SLOT_MODE[val];
                                                }
                                            });
                                            setting_slotMode = optionInput;
                                            label1.attr("title", "Set the slot mode for the room!");
                                            label1.text("Slots Mode");
                                            label1.append(optionInput);
                                            label1.qtip();
                                            content.append(label1);
                                            var label1 = $(document.createElement("label"));
                                            label1.addClass("sideMenuContentItem");
                                            var val = (result.allowedTool !== undefined && result.allowedTool !== -1) ? Piano_1.NOTE_SOURCE[result.allowedTool] : "ANY";
                                            nr_allowedTool = val;
                                            var optionInput = roomSettingsBox.addInput({
                                                type: "select",
                                                removeNoneOption: true,
                                                list: ["ANY", "KEYBOARD", "MOUSE", "MIDI"],
                                                value: val,
                                                appendToBox: false,
                                                paddingLeft: "5px",
                                                stateChange: (evt) => {
                                                    let value = $(evt.currentTarget).val();
                                                    console.log("VALUE", value, evt.currentTarget);
                                                    if (kb_optionInput && value === "KEYBOARD")
                                                        enableKBLAYOUT();
                                                    else
                                                        disableKBLAYOUT();
                                                    nr_allowedTool = value;
                                                }
                                            });
                                            setting_allowedTool = optionInput;
                                            label1.attr("title", "Set the method that players must use to play in the room!");
                                            label1.text("Allowed Tool");
                                            label1.append(optionInput);
                                            label1.qtip();
                                            content.append(label1);
                                            var label1 = $(document.createElement("label"));
                                            label1.addClass("sideMenuContentItem");
                                            var val = (result.allowedKBLayout !== undefined && result.allowedKBLayout !== -1) ? Piano_1.KEYBOARD_LAYOUT[result.allowedKBLayout] : "ANY";
                                            nr_kblayout = val;
                                            kb_optionInput = roomSettingsBox.addInput({
                                                type: "select",
                                                removeNoneOption: true,
                                                list: ["ANY", "VIRTUAL_PIANO", "MPP", "PIANORHYTHM"],
                                                value: val,
                                                appendToBox: false,
                                                paddingLeft: "5px",
                                                stateChange: (evt) => {
                                                    nr_kblayout = $(evt.currentTarget).val();
                                                }
                                            });
                                            label1.attr("title", "Set the keyboard layout that players must use!");
                                            label1.text("Keyboard Layout");
                                            label1.append(kb_optionInput);
                                            setting_kblayout = kb_optionInput;
                                            label1.qtip();
                                            content.append(label1);
                                            if (kb_optionInput && (result.allowedTool === "KEYBOARD" || result.allowedTool == 2))
                                                enableKBLAYOUT();
                                            else
                                                disableKBLAYOUT();
                                            var label3d = $(document.createElement("label"));
                                            label3d.addClass("sideMenuContentItem");
                                            label3d.attr("id", "options_maxPlayers2");
                                            label3d.attr("title", "Set the max amount of players that can join your room.");
                                            var labeltext = $(document.createElement("label"));
                                            labeltext.text("Max Players");
                                            setting_maxPlayersLabel = labeltext;
                                            label3d.append(labeltext);
                                            label3d.css({
                                                "height": "75px",
                                                "padding-top": "10px"
                                            });
                                            label3d.qtip({ style: { classes: "qTip_optionsBox qtip-light" } });
                                            content.append(label3d);
                                            setTimeout(() => {
                                                var slider = noUiSlider.create(document.getElementById("options_maxPlayers2"), {
                                                    start: (result.maxPlayers) || 20,
                                                    step: 1,
                                                    connect: "lower",
                                                    behaviour: 'snap',
                                                    range: {
                                                        'min': 1,
                                                        'max': 20
                                                    }
                                                });
                                                slider.on('update', function (values, handle) {
                                                    var value = values[0];
                                                    nr_maxPlayers = Math.floor(value);
                                                    labeltext.text("Max Players - " + nr_maxPlayers);
                                                });
                                                setting_maxPlayers = slider;
                                                label3d.removeClass("noUi-connect noUi-target");
                                                label3d.find('.noUi-base').css({
                                                    "height": "17px",
                                                    "top": "10px",
                                                    "width": "95%",
                                                    "background": "rgba(0,0,0,0.3)"
                                                });
                                            }, 50);
                                            var label1 = $(document.createElement("label"));
                                            label1.addClass("sideMenuContentItem");
                                            label1.attr("title", "You can select up to 8 instruments or don't select any to have them all available.");
                                            label1.text("Instruments Selection");
                                            inst_select = $(document.createElement("select"));
                                            var inst_select_parent = $(document.createElement("div"));
                                            label1.append(inst_select_parent);
                                            inst_select.attr("multiple", "multiple");
                                            inst_select.attr("draggable", "false");
                                            inst_select.css({ width: 450 });
                                            inst_select_parent.append(inst_select);
                                            inst_select.select2({
                                                tags: true,
                                                data: PianoRhythmPlayer_1.PianoRhythmInstrumentSelection.INSTRUMENT_SELECTION_SELECT2_LIST,
                                                maximumSelectionLength: 8,
                                                placeholder: "Select the instrument(s)",
                                                allowClear: true,
                                                templateResult: PianoRhythmPlayer_1.PianoRhythmInstrumentSelection.formatInstrument,
                                            });
                                            inst_select.val(PianoRhythm.ROOM_INSTRUMENTS && PianoRhythm.ROOM_INSTRUMENTS.length > 0 ? PianoRhythm.ROOM_INSTRUMENTS : [Piano_1.Piano.DEFAULT_INSTRUMENT]).trigger("change");
                                            PianoRhythm.ROOM_SETTINGS_INSTRUMENT_SELECT = inst_select;
                                            setting_Instruments = inst_select;
                                            label1.qtip();
                                            content.append(label1);
                                            return content;
                                        },
                                        onClick: function (evt) {
                                            if (roomSettingsBox.sideMenu) {
                                                if (roomSettingsBox.sideMenu.selectedContent === "menuItemContent_" + evt.target.innerText)
                                                    return;
                                                roomSettingsBox.sideMenu.hideAllContent(evt.target.innerText);
                                            }
                                        }
                                    }
                                ]
                            });
                            let button1 = BasicBox.createButton("UPDATE", () => {
                                let welcomeMessage = nr_RoomWelcomeMessage.children().val() || "";
                                let gameMode = nr_GameMode || "CHAT AND PLAY";
                                let roomPassword = nr_RoomPassword.children().val() || "";
                                let room = {};
                                let submit = true;
                                room["id"] = PianoRhythm.CLIENT.roomID;
                                room["name"] = PianoRhythm.CLIENT.roomName;
                                room["welcomeMessage"] = welcomeMessage;
                                room["private"] = nr_RoomPrivate;
                                room["gameMode"] = gameMode;
                                room["password"] = roomPassword;
                                room["onlyHost"] = nr_onlyHostCanPlay || false;
                                let instArray = inst_select.val();
                                room["instruments"] = (instArray && instArray.length > 0) ? instArray : [];
                                room["slotMode"] = nr_SlotMode;
                                room["maxPlayers"] = nr_maxPlayers;
                                room["allowRecording"] = nr_allowRecording;
                                room["allowBotMessages"] = nr_allowBotMessages;
                                room["allowedTool"] = Piano_1.NOTE_SOURCE[nr_allowedTool];
                                room["allowedKBLayout"] = Piano_1.KEYBOARD_LAYOUT[nr_kblayout];
                                if (submit) {
                                    PianoRhythm.updateRoom(room, null, (data) => {
                                        PianoRhythm.CLIENT_FOCUS = CLIENT_FOCUS.ROOMSETTINGS;
                                        PianoRhythm.loadRoom(data, data.slotMode, instArray);
                                    });
                                    PianoRhythm.setButtonActive(PianoRhythm.NEWROOMBUTTON, false);
                                    PianoRhythm.ROOM_SETTINGS_BOX.hide(true);
                                }
                            }, { left: "8px", bottom: "105px", "position": "absolute", });
                            button1.find("button").css("background-color", PianoRhythm.COLORS.base4);
                            roomSettingsBox.box.append(button1);
                            PianoRhythm.BODY.append(roomSettingsBox.box);
                            roomSettingsBox.box.css({
                                overflow: "hidden",
                                marginTop: boxDimensions.height,
                                height: 0,
                                opacity: 0.1
                            }).animate({
                                marginTop: 0,
                                opacity: 1,
                                height: boxDimensions.height
                            }, 250, "swing", function () {
                                $(this).css({
                                    display: "",
                                    marginTop: ""
                                });
                            });
                            roomSettingsBox.visible = true;
                            PianoRhythm.ROOM_SETTINGS_BOX = roomSettingsBox;
                        }
                        else {
                            if (PianoRhythm.ROOM_SETTINGS_BOX && PianoRhythm.ROOM_SETTINGS_BOX.visible) {
                                PianoRhythm.ROOM_SETTINGS_BOX.hide(true);
                                PianoRhythm.setButtonActive(PianoRhythm.ROOMSETTINGSBUTTON, false);
                            }
                            else {
                                PianoRhythm.CLIENT_FOCUS = CLIENT_FOCUS.ROOMSETTINGS;
                                PianoRhythm.setButtonActive(PianoRhythm.ROOMSETTINGSBUTTON, true, "white", PianoRhythm.COLORS.base4, true);
                                setting_makeRoomPrivateCheckBox.prop("checked", true);
                                if (setting_makeRoomPrivateCheckBox) {
                                    setting_makeRoomPrivateCheckBox.prop("checked", (result.status == "PRIVATE"));
                                }
                                if (setting_onlyHostCheckBox)
                                    setting_onlyHostCheckBox.prop("checked", result.onlyHost);
                                if (setting_allowRecordingCheckbox)
                                    setting_allowRecordingCheckbox.prop("checked", result.allowRecording);
                                if (setting_allowBotMessagesCheckBox)
                                    setting_allowBotMessagesCheckBox.prop("checked", result.allowBotMessage);
                                if (setting_welcomeMessage)
                                    setting_welcomeMessage.children().attr("value", result.welcomeMessage);
                                if (setting_slotMode)
                                    setting_slotMode["input"].val(SLOT_MODE[result.slotsMode] || "SINGLE");
                                if (setting_allowedTool) {
                                    setting_allowedTool["input"].val(Piano_1.NOTE_SOURCE[result.allowedTool] || "ANY");
                                    if (result.allowedTool == 2) {
                                        enableKBLAYOUT();
                                    }
                                    else {
                                        disableKBLAYOUT();
                                    }
                                }
                                if (setting_kblayout)
                                    setting_kblayout["input"].val(Piano_1.KEYBOARD_LAYOUT[result.allowedKBLayout] || "ANY");
                                if (setting_maxPlayers)
                                    setting_maxPlayers.set(result.maxPlayers);
                                if (setting_maxPlayersLabel)
                                    setting_maxPlayersLabel.text("Max Players - " + result.maxPlayers);
                                if (setting_Instruments)
                                    setting_Instruments.val(result.instruments).trigger("change");
                                PianoRhythm.ROOM_SETTINGS_BOX.show(true, boxDimensions.height);
                            }
                        }
                    });
                }
                else {
                    PianoRhythm.notify({
                        message: "Something went wrong. The room settings were unable to be retrieved!"
                    });
                }
            });
            PianoRhythm.OPTIONSBUTTON.click(() => {
                PianoRhythm.CLIENT_FOCUS = CLIENT_FOCUS.OPTIONS;
                PianoRhythm.hideOptionBoxes(PianoRhythm.OPTIONS_BOX);
                PianoRhythm.setButtonActive(PianoRhythm.OPTIONSBUTTON, true, "white", PianoRhythm.COLORS.base4, true);
                if (!PianoRhythm.OPTIONS_BOX) {
                    let optionsBox = new BasicBox({
                        id: "PR_OPTIONS",
                        height: boxDimensions.height,
                        width: boxDimensions.width,
                        title: "PianoRhythm Options",
                        color: PianoRhythm.COLORS.base4
                    });
                    optionsBox.box.css({
                        bottom: (PianoRhythm.BOTTOM_BAR.height()) + "px",
                        top: "",
                        "border": "4px solid white",
                        "border-left": "none"
                    });
                    function setArrowKeyNames(value) {
                        if (!value)
                            return "";
                        let arrowIndex = value.toLowerCase().indexOf("arrow");
                        if (arrowIndex == 0)
                            value = value.substring("arrow".length);
                        return value;
                    }
                    optionsBox.createSideMenu({
                        menuItems: [
                            {
                                name: "GENERAL",
                                content: function () {
                                    var content = $(document.createElement("div"));
                                    var header1 = BasicBox.createSideMenuHeader("Basic");
                                    content.append(header1);
                                    var label1 = $(document.createElement("label"));
                                    label1.addClass("sideMenuContentItem");
                                    var id = "ui_g1";
                                    var checkBox1 = $(document.createElement('input')).attr({
                                        "class": "noselect checkbox-custom",
                                        id: id,
                                        type: 'checkbox'
                                    });
                                    var setting = PianoRhythm.loadSetting("GENERAL", "displaySideMenu");
                                    var val = (setting !== null) ? setting : true;
                                    checkBox1.prop("checked", val);
                                    checkBox1.change(function () {
                                        PianoRhythm.saveSetting("GENERAL", "displaySideMenu", this.checked);
                                    });
                                    label1.attr("title", "Display the side menu (users, pals, rooms) list upon page load.");
                                    label1.text("Display Side Menu on Login");
                                    label1.prepend(checkBox1);
                                    label1.qtip({ style: { classes: "qTip_optionsBox qtip-light" } });
                                    checkBox1.after("<label class='noselect checkbox-custom-label' for='" + id + "'></label>");
                                    content.append(label1);
                                    var label1 = $(document.createElement("label"));
                                    label1.addClass("sideMenuContentItem");
                                    var id = "ui_g2";
                                    var checkBox1 = $(document.createElement('input')).attr({
                                        "class": "noselect checkbox-custom",
                                        id: id,
                                        type: 'checkbox'
                                    });
                                    var setting = PianoRhythm.loadSetting("GENERAL", "displayMiscChat");
                                    var val = (setting !== null) ? setting : true;
                                    checkBox1.prop("checked", val);
                                    PianoRhythm.SETTINGS["displayMiscChat"] = val;
                                    checkBox1.change(function () {
                                        PianoRhythm.SETTINGS["displayMiscChat"] = this.checkd;
                                        PianoRhythm.saveSetting("GENERAL", "displayMiscChat", this.checked);
                                    });
                                    label1.attr("title", "Display extra server messages such 'Player X has joined the room'.");
                                    label1.text("Display Server Messages");
                                    label1.prepend(checkBox1);
                                    label1.qtip({ style: { classes: "qTip_optionsBox qtip-light" } });
                                    checkBox1.after("<label class='noselect checkbox-custom-label' for='" + id + "'></label>");
                                    content.append(label1);
                                    var label1 = $(document.createElement("label"));
                                    label1.addClass("sideMenuContentItem");
                                    var id = "ui_g3";
                                    var checkBox1 = $(document.createElement('input')).attr({
                                        "class": "noselect checkbox-custom",
                                        id: id,
                                        type: 'checkbox'
                                    });
                                    var setting = PianoRhythm.loadSetting("GENERAL", "displayPING");
                                    var val = (setting !== null) ? setting : true;
                                    checkBox1.prop("checked", val);
                                    checkBox1.change(function () {
                                        PianoRhythm.SETTINGS["displayPING"] = this.checked;
                                        PianoRhythm.saveSetting("GENERAL", "displayPING", this.checked);
                                        if (PianoRhythm.PING_OBJ && PianoRhythm.PING_OBJ.length)
                                            if (this.checked)
                                                PianoRhythm.PING_OBJ.show();
                                            else
                                                PianoRhythm.PING_OBJ.hide();
                                    });
                                    label1.attr("title", "Displays the latency of your connection to the server. A lower ping means a better and more responsive connection");
                                    label1.text("Display PING");
                                    label1.prepend(checkBox1);
                                    label1.qtip({ style: { classes: "qTip_optionsBox qtip-light" } });
                                    checkBox1.after("<label class='noselect checkbox-custom-label' for='" + id + "'></label>");
                                    content.append(label1);
                                    var label1 = $(document.createElement("label"));
                                    label1.addClass("sideMenuContentItem");
                                    var id = "ui_g4";
                                    var checkBox2 = $(document.createElement('input')).attr({
                                        "class": "noselect checkbox-custom",
                                        id: id,
                                        type: 'checkbox'
                                    });
                                    var setting = PianoRhythm.loadSetting("GRAPHICS", "displayFPS");
                                    var val = (setting !== null) ? setting : true;
                                    checkBox2.prop("checked", val);
                                    checkBox2.change(function () {
                                        PianoRhythm.SETTINGS["displayFPS"] = this.checked;
                                        PianoRhythm.saveSetting("GRAPHICS", "displayFPS", this.checked);
                                        if (PianoRhythm.FPS_METER) {
                                            if (!this.checked)
                                                PianoRhythm.FPS_METER["element"].hide();
                                            else
                                                PianoRhythm.FPS_METER["element"].show();
                                        }
                                    });
                                    label1.attr("title", "Displays the FPS (Frames Per Second) for the rendering. Higher is better and the max is 60.");
                                    label1.text("Display FPS");
                                    label1.prepend(checkBox2);
                                    label1.qtip({ style: { classes: "qTip_optionsBox qtip-light" } });
                                    checkBox2.after("<label class='noselect checkbox-custom-label' for='" + id + "'></label>");
                                    content.append(label1);
                                    var label1 = $(document.createElement("label"));
                                    label1.addClass("sideMenuContentItem");
                                    var id = "ui_g5";
                                    var checkBox2 = $(document.createElement('input')).attr({
                                        "class": "noselect checkbox-custom",
                                        id: id,
                                        type: 'checkbox'
                                    });
                                    var setting = PianoRhythm.loadSetting("GENERAL", "showNotifications");
                                    var val = (setting !== null) ? setting : true;
                                    checkBox2.prop("checked", val);
                                    checkBox2.change(function () {
                                        PianoRhythm.SETTINGS["showNotifications"] = this.checked;
                                        PianoRhythm.saveSetting("GENERAL", "showNotifications", this.checked);
                                    });
                                    label1.attr("title", "Displays notifications.");
                                    label1.text("Display Notifications");
                                    label1.prepend(checkBox2);
                                    label1.qtip({ style: { classes: "qTip_optionsBox qtip-light" } });
                                    checkBox2.after("<label class='noselect checkbox-custom-label' for='" + id + "'></label>");
                                    content.append(label1);
                                    var label1 = $(document.createElement("label"));
                                    label1.addClass("sideMenuContentItem");
                                    var id = "ui_g6";
                                    var checkBox2 = $(document.createElement('input')).attr({
                                        "class": "noselect checkbox-custom",
                                        id: id,
                                        type: 'checkbox'
                                    });
                                    var setting = PianoRhythm.loadSetting("GENERAL", "helpNotifications");
                                    var val = (setting !== null) ? setting : true;
                                    checkBox2.prop("checked", val);
                                    checkBox2.change(function () {
                                        PianoRhythm.SETTINGS["helpNotifications"] = this.checked;
                                        PianoRhythm.saveSetting("GENERAL", "helpNotifications", this.checked);
                                        PianoRhythm.tutorialNotifications = this.checked;
                                    });
                                    label1.attr("title", "Displays tutorial notifications upon page load.");
                                    label1.text("Display Tutorial Notifications");
                                    label1.prepend(checkBox2);
                                    label1.qtip({ style: { classes: "qTip_optionsBox qtip-light" } });
                                    checkBox2.after("<label class='noselect checkbox-custom-label' for='" + id + "'></label>");
                                    content.append(label1);
                                    var label1 = $(document.createElement("label"));
                                    label1.addClass("sideMenuContentItem");
                                    var id = "ui_g7";
                                    var checkBox2 = $(document.createElement('input')).attr({
                                        "class": "noselect checkbox-custom",
                                        id: id,
                                        type: 'checkbox'
                                    });
                                    var setting = PianoRhythm.loadSessionSetting("GENERAL", "autoLoginToken");
                                    var val = (setting !== null) ? setting : true;
                                    checkBox2.prop("checked", val);
                                    checkBox2.change(function () {
                                        PianoRhythm.SETTINGS["autoLoginToken"] = this.checked;
                                        PianoRhythm.saveSessionSetting("GENERAL", "autoLoginToken", this.checked);
                                    });
                                    label1.attr("title", "Toggle auto logging in with authToken.");
                                    label1.text("Enable Auto Login");
                                    label1.prepend(checkBox2);
                                    label1.qtip({ style: { classes: "qTip_optionsBox qtip-light" } });
                                    checkBox2.after("<label class='noselect checkbox-custom-label' for='" + id + "'></label>");
                                    content.append(label1);
                                    var header1 = BasicBox.createSideMenuHeader("Language");
                                    content.append(header1);
                                    var label1 = $(document.createElement("label"));
                                    label1.addClass("sideMenuContentItem");
                                    var setting = PianoRhythm.loadSetting("GENERAL", "language");
                                    var list = [
                                        "en - English",
                                        "es - Spanish",
                                        "fr - French",
                                        "de - German",
                                        "jp - Japanese",
                                        "kr - Korean",
                                        "it - Italian",
                                        "nl - Dutch",
                                        "cn - Simplified Chinese",
                                        "tw - Traditional Chinese",
                                        "ru - Russian",
                                        "tr - Turkish",
                                        "dk - Danish",
                                        "pl - Polish",
                                        "fi - Finnish"
                                    ];
                                    var langVal = list[0];
                                    for (var i = 0; i < list.length; i++)
                                        if (list[i].substring(0, 2) === setting)
                                            langVal = list[i];
                                    var optionInput = optionsBox.addInput({
                                        type: "select",
                                        removeNoneOption: true,
                                        list: list,
                                        value: langVal || "en - English",
                                        appendToBox: false,
                                        paddingLeft: "0px",
                                        stateChange: (evt) => {
                                            var val = evt.currentTarget.value;
                                            var lang = val.substring(0, 2);
                                            PianoRhythm.saveSetting("GENERAL", "language", lang);
                                            var langSelect = $('.languageSelect');
                                            if (langSelect.length) {
                                                langSelect.val(lang);
                                                langSelect.trigger("change");
                                            }
                                            PianoRhythm.SETTINGS["language"] = val;
                                        }
                                    });
                                    label1.attr("title", "Change the language.");
                                    label1.text("Language");
                                    label1.append(optionInput);
                                    label1.qtip({ style: { classes: "qTip_optionsBox qtip-light" } });
                                    content.append(label1);
                                    return content;
                                },
                                onClick: function (evt) {
                                    if (optionsBox.sideMenu) {
                                        if (optionsBox.sideMenu.selectedContent === "menuItemContent_" + evt.target.innerText)
                                            return;
                                        optionsBox.sideMenu.hideAllContent(evt.target.innerText);
                                    }
                                }
                            },
                            {
                                name: "GRAPHICS",
                                content: function (evt) {
                                    var content = $(document.createElement("div"));
                                    let counter = 0, contrast_checkBox1;
                                    var header1 = BasicBox.createSideMenuHeader("2D - Piano");
                                    content.append(header1);
                                    var label1 = $(document.createElement("label"));
                                    label1.addClass("sideMenuContentItem");
                                    var optionInput = optionsBox.addInput({
                                        type: "select",
                                        removeNoneOption: true,
                                        list: ["STYLE 1", "STYLE 2"],
                                        value: PianoRhythm.loadSetting("GRAPHICS", "animationStyle") || "STYLE 1",
                                        appendToBox: false,
                                        paddingLeft: "0px",
                                        stateChange: (evt) => {
                                            var val = evt.currentTarget.value;
                                            PianoRhythm.saveSetting("GRAPHICS", "animationStyle", val);
                                            PianoRhythm.SETTINGS["animationStyle"] = val;
                                            switch (val.toLowerCase()) {
                                                case "style 1":
                                                    Piano_1.Piano.BLIP_ANIMATE_TIME_TYPE = 0;
                                                    break;
                                                case "style 2":
                                                    Piano_1.Piano.BLIP_ANIMATE_TIME_TYPE = 1;
                                                    contrast_checkBox1.prop("checked", true);
                                                    contrast_checkBox1.trigger("change");
                                                    break;
                                            }
                                        }
                                    });
                                    label1.attr("title", "Set the animation timing style for the note blips.");
                                    label1.text("Note Blips Animation Style");
                                    label1.append(optionInput);
                                    label1.qtip({ style: { classes: "qTip_optionsBox qtip-light" } });
                                    content.append(label1);
                                    var label1 = $(document.createElement("label"));
                                    label1.addClass("sideMenuContentItem");
                                    var optionInput = optionsBox.addInput({
                                        type: "select",
                                        removeNoneOption: true,
                                        list: ["SQUARES", "CIRCLES"],
                                        value: PianoRhythm.loadSetting("GRAPHICS", "shapeStyle") || "SQUARES",
                                        appendToBox: false,
                                        paddingLeft: "0px",
                                        stateChange: (evt) => {
                                            var val = evt.currentTarget.value;
                                            PianoRhythm.saveSetting("GRAPHICS", "shapeStyle", val);
                                            PianoRhythm.SETTINGS["shapeStyle"] = val;
                                            switch (val) {
                                                case "SQUARES":
                                                    Piano_1.Piano.ANIMATION_TYPE = Piano_1.eAnimationType.SQUARES;
                                                    break;
                                                case "CIRCLES":
                                                    Piano_1.Piano.ANIMATION_TYPE = Piano_1.eAnimationType.CIRCLES;
                                                    break;
                                            }
                                        }
                                    });
                                    label1.attr("title", "Set the shape style for the note blips.");
                                    label1.text("Note Blips Shape Style");
                                    label1.append(optionInput);
                                    label1.qtip({ style: { classes: "qTip_optionsBox qtip-light" } });
                                    content.append(label1);
                                    var label1 = $(document.createElement("label"));
                                    label1.addClass("sideMenuContentItem");
                                    var optionInput = optionsBox.addInput({
                                        type: "select",
                                        removeNoneOption: true,
                                        list: ["NONE", "EFFECT 1", "EFFECT 2"],
                                        value: PianoRhythm.loadSetting("GRAPHICS", "effectStyle") || "NONE",
                                        appendToBox: false,
                                        paddingLeft: "0px",
                                        stateChange: (evt) => {
                                            var val = evt.currentTarget.value;
                                            PianoRhythm.saveSetting("GRAPHICS", "effectStyle", val);
                                            PianoRhythm.SETTINGS["effectStyle"] = val;
                                            switch (val.toLowerCase()) {
                                                case "none":
                                                    Piano_1.Piano.BLIP_EFFECT = 0;
                                                    break;
                                                case "effect 1":
                                                    Piano_1.Piano.BLIP_EFFECT = 1;
                                                    break;
                                                case "effect 2":
                                                    Piano_1.Piano.BLIP_EFFECT = 2;
                                                    break;
                                            }
                                        }
                                    });
                                    label1.attr("title", "Set the extra effects for the note blips.");
                                    label1.text("Note Blips Extra Effects");
                                    label1.append(optionInput);
                                    label1.qtip({ style: { classes: "qTip_optionsBox qtip-light" } });
                                    content.append(label1);
                                    var label1 = $(document.createElement("label"));
                                    label1.addClass("sideMenuContentItem");
                                    var id = "ui_graphics" + counter;
                                    counter++;
                                    contrast_checkBox1 = $(document.createElement('input')).attr({
                                        "class": "noselect checkbox-custom",
                                        id: id,
                                        type: 'checkbox'
                                    });
                                    var setting = PianoRhythm.loadSetting("GRAPHICS", "enableColorContrast");
                                    contrast_checkBox1.prop("checked", (setting !== null) ? setting : true);
                                    contrast_checkBox1.change(function () {
                                        Piano_1.Piano.PUSHER_COLORIZE = this.checked;
                                        PianoRhythm.saveSetting("GRAPHICS", "enableColorContrast", this.checked);
                                    });
                                    label1.attr("title", "Set a stronger contrast of the note blip when a note is played.");
                                    label1.text("Enable Note Blip Color Contrast");
                                    label1.prepend(contrast_checkBox1);
                                    label1.qtip({ style: { classes: "qTip_optionsBox qtip-light" } });
                                    contrast_checkBox1.after("<label class='noselect checkbox-custom-label' for='" + id + "'></label>");
                                    content.append(label1);
                                    var label1 = $(document.createElement("label"));
                                    label1.addClass("sideMenuContentItem");
                                    var id = "ui_graphics" + counter;
                                    counter++;
                                    var checkBox1 = $(document.createElement('input')).attr({
                                        "class": "noselect checkbox-custom",
                                        id: id,
                                        type: 'checkbox'
                                    });
                                    var setting = PianoRhythm.loadSetting("GRAPHICS", "enableGlow");
                                    checkBox1.prop("checked", (setting !== null) ? setting : false);
                                    checkBox1.change(function () {
                                        Piano_1.Piano.GLOW = this.checked;
                                        PianoRhythm.saveSetting("GRAPHICS", "enableGlow", this.checked);
                                    });
                                    label1.attr("title", "Enable the key and note blips to glow.");
                                    label1.text("Enable Note Blip Glow.");
                                    label1.prepend(checkBox1);
                                    label1.qtip({ style: { classes: "qTip_optionsBox qtip-light" } });
                                    checkBox1.after("<label class='noselect checkbox-custom-label' for='" + id + "'></label>");
                                    content.append(label1);
                                    var label1 = $(document.createElement("label"));
                                    label1.addClass("sideMenuContentItem");
                                    var id = "ui_graphics" + counter;
                                    counter++;
                                    var checkBox1 = $(document.createElement('input')).attr({
                                        "class": "noselect checkbox-custom",
                                        id: id,
                                        type: 'checkbox'
                                    });
                                    var setting = PianoRhythm.loadSetting("GRAPHICS", "showPiano");
                                    checkBox1.prop("checked", (setting !== null) ? setting : true);
                                    checkBox1.change(function () {
                                        Piano_1.Piano.SHOW_PIANO = this.checked;
                                        PianoRhythm.saveSetting("GRAPHICS", "showPiano", this.checked);
                                    });
                                    label1.attr("title", "Toggle the display of the piano.");
                                    label1.text("Show Piano.");
                                    label1.prepend(checkBox1);
                                    label1.qtip({ style: { classes: "qTip_optionsBox qtip-light" } });
                                    checkBox1.after("<label class='noselect checkbox-custom-label' for='" + id + "'></label>");
                                    content.append(label1);
                                    var label1 = $(document.createElement("label"));
                                    label1.addClass("sideMenuContentItem");
                                    var id = "ui_graphics" + counter;
                                    counter++;
                                    var checkBox1 = $(document.createElement('input')).attr({
                                        "class": "noselect checkbox-custom",
                                        id: id,
                                        type: 'checkbox'
                                    });
                                    var setting = PianoRhythm.loadSetting("GRAPHICS", "particleGlow");
                                    checkBox1.prop("checked", (setting !== null) ? setting : false);
                                    checkBox1.change(function () {
                                        if (PianoRhythmPlayer_1.PianoRhythmPlayer.PARTICLE_SYSTEM)
                                            PianoRhythmPlayer_1.PianoRhythmPlayer.PARTICLE_SYSTEM.setGlow(this.checked);
                                        PianoRhythm.saveSetting("GRAPHICS", "particleGlow", this.checked);
                                    });
                                    label1.attr("title", "Enable the particle effects to glow.");
                                    label1.text("Enable Particle Glow.");
                                    label1.prepend(checkBox1);
                                    label1.qtip({ style: { classes: "qTip_optionsBox qtip-light" } });
                                    checkBox1.after("<label class='noselect checkbox-custom-label' for='" + id + "'></label>");
                                    content.append(label1);
                                    var particleBurst_optionInput;
                                    var label1 = $(document.createElement("label"));
                                    label1.addClass("sideMenuContentItem");
                                    var id = "ui_graphics" + counter;
                                    counter++;
                                    var checkBox1 = $(document.createElement('input')).attr({
                                        "class": "noselect checkbox-custom",
                                        id: id,
                                        type: 'checkbox'
                                    });
                                    var setting_enableParticles2 = PianoRhythm.loadSetting("GRAPHICS", "enableParticles2");
                                    checkBox1.prop("checked", (setting_enableParticles2 !== null) ? setting_enableParticles2 : false);
                                    checkBox1.change(function () {
                                        Piano_1.Piano.USE_PARTICLES = this.checked;
                                        PianoRhythm.saveSetting("GRAPHICS", "enableParticles2", this.checked);
                                        if (particleBurst_optionInput && particleBurst_optionInput["input"]) {
                                            if (!this.checked) {
                                                particleBurst_optionInput["input"].attr('disabled', 'disabled');
                                                particleBurst_optionInput["input"].css({
                                                    "border": "solid gray",
                                                    "color": "gray"
                                                });
                                                PianoRhythmPlayer_1.PianoRhythmPlayer.CTX.clearRect(0, 0, PianoRhythmPlayer_1.PianoRhythmPlayer.CANVAS.width, PianoRhythmPlayer_1.PianoRhythmPlayer.CANVAS.height);
                                            }
                                            else {
                                                particleBurst_optionInput["input"].removeAttr("disabled");
                                                particleBurst_optionInput["input"].css({
                                                    "border": "solid white",
                                                    "color": "white"
                                                });
                                            }
                                        }
                                    });
                                    label1.attr("title", "Toggle the display of particles when a key is pressed.");
                                    label1.text("Enable particles.");
                                    label1.prepend(checkBox1);
                                    label1.qtip({ style: { classes: "qTip_optionsBox qtip-light" } });
                                    checkBox1.after("<label class='noselect checkbox-custom-label' for='" + id + "'></label>");
                                    content.append(label1);
                                    var label1 = $(document.createElement("label"));
                                    label1.addClass("sideMenuContentItem");
                                    particleBurst_optionInput = optionsBox.addInput({
                                        type: "select",
                                        removeNoneOption: true,
                                        list: ["1", "3", "5", "10", "25", "50"],
                                        value: PianoRhythm.loadSetting("GRAPHICS", "particlesBurstAmount") || "3",
                                        appendToBox: false,
                                        paddingLeft: "0px",
                                        stateChange: (evt) => {
                                            var val = evt.currentTarget.value;
                                            var parsed = parseInt(val);
                                            PianoRhythm.saveSetting("GRAPHICS", "particlesBurstAmount", parsed);
                                            if (PianoRhythmPlayer_1.PianoRhythmPlayer.PARTICLE_SYSTEM) {
                                                PianoRhythmPlayer_1.PianoRhythmPlayer.PARTICLE_SYSTEM.setBurstAmount(parsed);
                                            }
                                        }
                                    });
                                    if (!setting_enableParticles2) {
                                        particleBurst_optionInput["input"].attr('disabled', 'disabled');
                                        particleBurst_optionInput["input"].css({
                                            "border": "solid gray",
                                            "color": "gray"
                                        });
                                    }
                                    label1.attr("title", "Set the amount of particles that burst when a key is pressed.");
                                    label1.text("Particle Burst Amount");
                                    label1.append(particleBurst_optionInput);
                                    label1.qtip({ style: { classes: "qTip_optionsBox qtip-light" } });
                                    content.append(label1);
                                    var header1 = BasicBox.createSideMenuHeader("Midi Player");
                                    content.append(header1);
                                    var label1 = $(document.createElement("label"));
                                    label1.addClass("sideMenuContentItem");
                                    var id = "ui_graphics" + counter;
                                    counter++;
                                    var checkBox1 = $(document.createElement('input')).attr({
                                        "class": "noselect checkbox-custom",
                                        id: id,
                                        type: 'checkbox'
                                    });
                                    var setting = PianoRhythm.loadSetting("GRAPHICS", "enableParticles");
                                    checkBox1.prop("checked", (setting !== null) ? setting : true);
                                    checkBox1.change(function () {
                                        Piano_1.Piano.PLAYER_USE_PARTICLES = this.checked;
                                        PianoRhythm.saveSetting("GRAPHICS", "enableParticles", this.checked);
                                    });
                                    label1.attr("title", "Enable the particle effects when a note activates during midi playback.");
                                    label1.text("Enable Midi Player Particles.");
                                    label1.prepend(checkBox1);
                                    label1.qtip({ style: { classes: "qTip_optionsBox qtip-light" } });
                                    checkBox1.after("<label class='noselect checkbox-custom-label' for='" + id + "'></label>");
                                    content.append(label1);
                                    var header1 = BasicBox.createSideMenuHeader("Avatar Blobs");
                                    content.append(header1);
                                    var label1 = $(document.createElement("label"));
                                    label1.addClass("sideMenuContentItem");
                                    var id = "ui_graphics" + counter;
                                    counter++;
                                    var checkBox1 = $(document.createElement('input')).attr({
                                        "class": "noselect checkbox-custom",
                                        id: id,
                                        type: 'checkbox'
                                    });
                                    var setting = PianoRhythm.loadSetting("GRAPHICS", "enableBlobs");
                                    checkBox1.prop("checked", (setting !== null) ? setting : true);
                                    checkBox1.change(function () {
                                        if (PianoRhythm.RhythmBlobFactory) {
                                            if (this.checked)
                                                PianoRhythm.RhythmBlobFactory.start();
                                            else
                                                PianoRhythm.RhythmBlobFactory.stop();
                                        }
                                        PianoRhythm.SETTINGS["enableBlobs"] = this.checked;
                                        PianoRhythm.saveSetting("GRAPHICS", "enableBlobs", this.checked);
                                    });
                                    label1.attr("title", "Enable the avatar blobs.");
                                    label1.text("Enable Avatar blobs.");
                                    label1.prepend(checkBox1);
                                    label1.qtip({ style: { classes: "qTip_optionsBox qtip-light" } });
                                    checkBox1.after("<label class='noselect checkbox-custom-label' for='" + id + "'></label>");
                                    content.append(label1);
                                    var header1 = BasicBox.createSideMenuHeader("Emojis");
                                    content.append(header1);
                                    var label1 = $(document.createElement("label"));
                                    label1.addClass("sideMenuContentItem");
                                    var id = "ui_graphics" + counter;
                                    counter++;
                                    var checkBox1 = $(document.createElement('input')).attr({
                                        "class": "noselect checkbox-custom",
                                        id: id,
                                        type: 'checkbox'
                                    });
                                    var setting = PianoRhythm.loadSetting("GRAPHICS", "autoConvertEmojis");
                                    checkBox1.prop("checked", (setting !== null) ? setting : true);
                                    checkBox1.change(function () {
                                        PianoRhythm.SETTINGS["autoConvertEmojis"] = this.checked;
                                        PianoRhythm.saveSetting("GRAPHICS", "autoConvertEmojis", this.checked);
                                    });
                                    label1.attr("title", "Automatically convert text emotes to an emoji graphic.");
                                    label1.text("Auto convert emojis.");
                                    label1.prepend(checkBox1);
                                    label1.qtip({ style: { classes: "qTip_optionsBox qtip-light" } });
                                    checkBox1.after("<label class='noselect checkbox-custom-label' for='" + id + "'></label>");
                                    content.append(label1);
                                    return content;
                                },
                                onClick: function (evt) {
                                    if (optionsBox.sideMenu) {
                                        if (optionsBox.sideMenu.selectedContent === "menuItemContent_" + evt.target.innerText)
                                            return;
                                        optionsBox.sideMenu.hideAllContent(evt.target.innerText);
                                    }
                                }
                            },
                            {
                                name: "AUDIO",
                                content: function (evt) {
                                    var content = $(document.createElement("div"));
                                    let counter = 0, contrast_checkBox1;
                                    var header1 = BasicBox.createSideMenuHeader("Piano");
                                    content.append(header1);
                                    var label = $(document.createElement("label"));
                                    label.addClass("sideMenuContentItem");
                                    label.attr("id", "options_audio_pianoSustain");
                                    var meterVal = PianoRhythm.loadSessionSetting("AUDIO", "SUSTAIN_CUTOFF");
                                    label.attr("title", "Set the fade cutoff point for sustained instrument sounds. (Higher values = shorter sustain)");
                                    var labeltext = $(document.createElement("label"));
                                    label.append(labeltext);
                                    label.css({
                                        "height": "75px",
                                        "padding-left": "35px"
                                    });
                                    label.qtip({ style: { classes: "qTip_optionsBox qtip-light" } });
                                    content.append(label);
                                    setTimeout(() => {
                                        slider = noUiSlider.create(document.getElementById("options_audio_pianoSustain"), {
                                            start: (meterVal !== undefined && meterVal !== null) ? meterVal : 0.35,
                                            step: 0.05,
                                            connect: "lower",
                                            behaviour: 'snap',
                                            range: {
                                                'min': 0,
                                                'max': 2.5
                                            }
                                        });
                                        slider.on('update', function (values, handle) {
                                            var value = parseFloat(values[0]);
                                            labeltext.text("Sustain Cutoff - " + value);
                                            PianoRhythm.saveSessionSetting("AUDIO", "SUSTAIN_CUTOFF", value);
                                            AudioEngine_1.AudioEngine.sustain_cutoff = value;
                                        });
                                        label.removeClass("noUi-connect noUi-target");
                                        label.find('.noUi-base').css({
                                            "height": "17px",
                                            "top": "10px",
                                            "width": "95%",
                                            "background": "rgba(0,0,0,0.3)"
                                        });
                                    }, 50);
                                    return content;
                                },
                                onClick: function (evt) {
                                    if (optionsBox.sideMenu) {
                                        if (optionsBox.sideMenu.selectedContent === "menuItemContent_" + evt.target.innerText)
                                            return;
                                        optionsBox.sideMenu.hideAllContent(evt.target.innerText);
                                    }
                                }
                            },
                            {
                                name: "UI",
                                content: function () {
                                    var content = $(document.createElement("div"));
                                    var bg1_label1, bg1_label2, counter = 0;
                                    var header1 = BasicBox.createSideMenuHeader("Effects");
                                    content.append(header1);
                                    var label1 = $(document.createElement("label"));
                                    label1.addClass("sideMenuContentItem");
                                    var id = "ui_ui" + counter;
                                    counter++;
                                    var checkBox1 = $(document.createElement('input')).attr({
                                        "class": "noselect checkbox-custom",
                                        id: id,
                                        type: 'checkbox'
                                    });
                                    var setting = PianoRhythm.loadSetting("UI", "blurEffect");
                                    var val = (setting !== null) ? setting : false;
                                    checkBox1.prop("checked", val);
                                    checkBox1.change(function () {
                                        PianoRhythm.SETTINGS["blurEffect"] = this.checked;
                                        PianoRhythm.saveSetting("UI", "blurEffect", this.checked);
                                    });
                                    label1.attr("title", "Enable Blur Effects.");
                                    label1.text("Enable Blur Effects");
                                    label1.prepend(checkBox1);
                                    label1.qtip({ style: { classes: "qTip_optionsBox qtip-light" } });
                                    checkBox1.after("<label class='noselect checkbox-custom-label' for='" + id + "'></label>");
                                    content.append(label1);
                                    var label1 = $(document.createElement("label"));
                                    label1.addClass("sideMenuContentItem");
                                    var background_type_setting = PianoRhythm.loadSetting("COLOR", "background_type") || "Gradient";
                                    var optionInput = optionsBox.addInput({
                                        type: "select",
                                        removeNoneOption: true,
                                        list: ["Gradient", "Solid"],
                                        value: background_type_setting,
                                        appendToBox: false,
                                        paddingLeft: "0px",
                                        stateChange: (evt) => {
                                            var val = evt.currentTarget.value;
                                            PianoRhythm.saveSetting("COLOR", "background_type", val);
                                            PianoRhythm.SETTINGS["background_type"] = val;
                                            if (val === "Gradient") {
                                                bg1_label2.show();
                                            }
                                            else {
                                                bg1_label2.hide();
                                            }
                                            console.log("Val", val);
                                            PianoRhythm.setBackground(val, PianoRhythm.default_background_color1, PianoRhythm.default_background_color2);
                                        }
                                    });
                                    label1.attr("title", "");
                                    label1.text("Background Type");
                                    label1.append(optionInput);
                                    label1.qtip({ style: { classes: "qTip_optionsBox qtip-light" } });
                                    content.append(label1);
                                    bg1_label1 = $(document.createElement("label"));
                                    bg1_label1.addClass("sideMenuContentItem");
                                    var id = "ui_ui" + counter;
                                    counter++;
                                    var checkBox1 = $(document.createElement('input')).attr({
                                        "class": "noselect checkbox-custom",
                                        id: id,
                                        type: 'checkbox'
                                    });
                                    var setting = PianoRhythm.loadSetting("COLOR", "background_1");
                                    var val = (setting !== null) ? setting : PianoRhythm.default_background_color1;
                                    bg1_label1.text("Background Color");
                                    var mod = $("<div>");
                                    mod.css({ width: 100, height: 40 });
                                    var colorMod = $("<input>");
                                    colorMod.attr("type", "text");
                                    colorMod.attr("id", "custom");
                                    colorMod.attr("value", val);
                                    colorMod.hide();
                                    mod.append(colorMod);
                                    colorMod.spectrum({
                                        preferredFormat: "name",
                                        showInput: true,
                                        showInitial: true,
                                        appendTo: mod,
                                        containerClassName: "spectrumBackgroundColor1_Container",
                                        replacerClassName: "spectrumUserOptions_Replacer",
                                        allowEmpty: true,
                                        chooseText: "SELECT",
                                        cancelText: "CANCEL",
                                        show: function (data) {
                                            $(this).data('changed', false);
                                            mod.css({
                                                width: 100,
                                                height: 235,
                                            });
                                            PianoRhythm.CLIENT_FOCUS = CLIENT_FOCUS.OPTIONS;
                                        },
                                        hide: function (data) {
                                            if ($(this).data('changed')) {
                                                if (data) {
                                                    var color = data.toHexString();
                                                    if (color) {
                                                        PianoRhythm.saveSetting("COLOR", "background_1", color);
                                                        PianoRhythm.setBackground(PianoRhythm.SETTINGS["background_type"], color, PianoRhythm.default_background_color2);
                                                    }
                                                }
                                            }
                                            else {
                                                colorMod.spectrum("set", PianoRhythm.default_background_color1);
                                            }
                                            mod.css({ width: 100, height: 40 });
                                        },
                                        change: function (data) {
                                            $(this).data('changed', true);
                                        },
                                    });
                                    bg1_label1.append(mod);
                                    bg1_label1.qtip({ style: { classes: "qTip_optionsBox qtip-light" } });
                                    content.append(bg1_label1);
                                    bg1_label2 = $(document.createElement("label"));
                                    bg1_label2.addClass("sideMenuContentItem");
                                    var id = "ui_ui" + counter;
                                    counter++;
                                    var checkBox1 = $(document.createElement('input')).attr({
                                        "class": "noselect checkbox-custom",
                                        id: id,
                                        type: 'checkbox'
                                    });
                                    var setting = PianoRhythm.loadSetting("COLOR", "background_2");
                                    var val = (setting !== null) ? setting : PianoRhythm.default_background_color2;
                                    bg1_label2.text("Background Color 2");
                                    var mod1 = $("<div>");
                                    mod1.css({ width: 100, height: 40 });
                                    var colorMod1 = $("<input>");
                                    colorMod1.attr("type", "text");
                                    colorMod1.attr("id", "custom");
                                    colorMod1.attr("value", val);
                                    colorMod1.hide();
                                    mod1.append(colorMod1);
                                    colorMod1.spectrum({
                                        preferredFormat: "name",
                                        showInput: true,
                                        showInitial: true,
                                        appendTo: mod1,
                                        containerClassName: "spectrumBackgroundColor2_Container",
                                        replacerClassName: "spectrumUserOptions_Replacer",
                                        allowEmpty: true,
                                        chooseText: "SELECT",
                                        cancelText: "CANCEL",
                                        show: function (data) {
                                            $(this).data('changed', false);
                                            mod1.css({
                                                width: 100,
                                                height: 235,
                                            });
                                            PianoRhythm.CLIENT_FOCUS = CLIENT_FOCUS.OPTIONS;
                                        },
                                        hide: function (data) {
                                            if ($(this).data('changed')) {
                                                if (data) {
                                                    var color = data.toHexString();
                                                    if (color) {
                                                        PianoRhythm.saveSetting("COLOR", "background_2", color);
                                                        PianoRhythm.setBackground(PianoRhythm.SETTINGS["background_type"], PianoRhythm.default_background_color1, color);
                                                    }
                                                }
                                            }
                                            else {
                                                colorMod1.spectrum("set", PianoRhythm.default_background_color2);
                                            }
                                            mod1.css({ width: 100, height: 40 });
                                        },
                                        change: function (data) {
                                            $(this).data('changed', true);
                                        },
                                    });
                                    bg1_label2.append(mod1);
                                    bg1_label2.qtip({ style: { classes: "qTip_optionsBox qtip-light" } });
                                    content.append(bg1_label2);
                                    if (background_type_setting === "Solid")
                                        bg1_label2.hide();
                                    var g_label1 = $(document.createElement("label"));
                                    g_label1.addClass("sideMenuContentItem");
                                    var id = "ui_ui" + counter;
                                    counter++;
                                    var checkBox1 = $(document.createElement('input')).attr({
                                        "class": "noselect checkbox-custom",
                                        id: id,
                                        type: 'checkbox'
                                    });
                                    var setting = PianoRhythm.loadSetting("COLOR", "global_1");
                                    var val = (setting !== null) ? setting : PianoRhythm.COLORS.base4;
                                    g_label1.text("Global Color");
                                    var mod3 = $("<div>");
                                    mod3.css({ width: 100, height: 40 });
                                    var colorMod3 = $("<input>");
                                    colorMod3.attr("type", "text");
                                    colorMod3.attr("id", "custom");
                                    colorMod3.attr("value", val);
                                    colorMod3.hide();
                                    mod3.append(colorMod3);
                                    colorMod3.spectrum({
                                        preferredFormat: "name",
                                        showInput: true,
                                        showInitial: true,
                                        appendTo: mod3,
                                        containerClassName: "spectrumGlobalColor_Container",
                                        replacerClassName: "spectrumUserOptions_Replacer",
                                        allowEmpty: true,
                                        chooseText: "SELECT",
                                        cancelText: "CANCEL",
                                        show: function (data) {
                                            $(this).data('changed', false);
                                            mod3.css({
                                                width: 100,
                                                height: 235,
                                            });
                                            PianoRhythm.CLIENT_FOCUS = CLIENT_FOCUS.OPTIONS;
                                        },
                                        hide: function (data) {
                                            if ($(this).data('changed')) {
                                                if (data) {
                                                    var color = data.toHexString();
                                                    if (color) {
                                                        PianoRhythm.setGlobalColor(color);
                                                        PianoRhythm.saveSetting("COLOR", "global_1", color);
                                                    }
                                                }
                                            }
                                            else {
                                                colorMod3.spectrum("set", PianoRhythm.COLORS.base4);
                                            }
                                            mod3.css({ width: 100, height: 40 });
                                        },
                                        change: function (data) {
                                            $(this).data('changed', true);
                                        },
                                    });
                                    g_label1.append(mod3);
                                    g_label1.qtip({ style: { classes: "qTip_optionsBox qtip-light" } });
                                    content.append(g_label1);
                                    var label1 = $(document.createElement("label"));
                                    label1.addClass("sideMenuContentItem");
                                    label1.attr("title", "Reset the UI Colors.");
                                    label1.text("Reset all colors");
                                    var button1 = BasicBox.createButton("Reset", () => {
                                        PianoRhythm.setGlobalColor().then(() => {
                                            PianoRhythm.COLORS.base4 = PianoRhythm.default_global_color;
                                            PianoRhythm.default_background_color1 = "white";
                                            PianoRhythm.default_background_color2 = PianoRhythm.COLORS.base4;
                                            colorMod.spectrum("set", PianoRhythm.default_background_color1);
                                            colorMod1.spectrum("set", PianoRhythm.default_background_color2);
                                            colorMod3.spectrum("set", PianoRhythm.COLORS.base4);
                                            PianoRhythm.saveSetting("COLOR", "background_1", PianoRhythm.default_background_color1);
                                            PianoRhythm.saveSetting("COLOR", "background_2", PianoRhythm.default_background_color2);
                                            PianoRhythm.saveSetting("COLOR", "global_1", PianoRhythm.COLORS.base4);
                                            PianoRhythm.resetBackground();
                                        }, (err) => {
                                            PianoRhythm.notify("An error has occurred trying to set the global color.");
                                            console.error(err);
                                        });
                                    }, { "margin-top": "10px" });
                                    label1.append(button1);
                                    label1.qtip({ style: { classes: "qTip_optionsBox qtip-light" } });
                                    content.append(label1);
                                    var header1 = BasicBox.createSideMenuHeader("Tool Tips");
                                    content.append(header1);
                                    var label1 = $(document.createElement("label"));
                                    label1.addClass("sideMenuContentItem");
                                    var id = "ui_ui" + counter;
                                    counter++;
                                    var checkBox1 = $(document.createElement('input')).attr({
                                        "class": "noselect checkbox-custom",
                                        id: id,
                                        type: 'checkbox'
                                    });
                                    var setting = PianoRhythm.loadSetting("UI", "displayToolTip");
                                    var val = (setting !== null) ? setting : true;
                                    checkBox1.prop("checked", val);
                                    checkBox1.change(function () {
                                        PianoRhythm.SETTINGS["displayToolTip"] = this.checked;
                                        PianoRhythm.saveSetting("UI", "displayToolTip", this.checked);
                                    });
                                    label1.attr("title", "Display ToolTips (qTip2 Library)");
                                    label1.text("Display ToolTips");
                                    label1.prepend(checkBox1);
                                    label1.qtip({ style: { classes: "qTip_optionsBox qtip-light" } });
                                    checkBox1.after("<label class='noselect checkbox-custom-label' for='" + id + "'></label>");
                                    content.append(label1);
                                    var header1 = BasicBox.createSideMenuHeader("Mouse");
                                    content.append(header1);
                                    var label1 = $(document.createElement("label"));
                                    label1.addClass("sideMenuContentItem");
                                    var id = "ui_ui" + counter;
                                    counter++;
                                    var checkBox1 = $(document.createElement('input')).attr({
                                        "class": "noselect checkbox-custom",
                                        id: id,
                                        type: 'checkbox'
                                    });
                                    var setting = PianoRhythm.loadSetting("UI", "mouse_ShowEveryoneCursor");
                                    var val = (setting !== null) ? setting : true;
                                    checkBox1.prop("checked", val);
                                    checkBox1.change(function () {
                                        PianoRhythm.SETTINGS["mouse_ShowEveryoneCursor"] = this.checked;
                                        PianoRhythm.saveSetting("UI", "mouse_ShowEveryoneCursor", this.checked);
                                        PianoRhythm.SHOW_EVERYONES_CURSORS = this.checked;
                                        if (playerMouse.MOUSES) {
                                            playerMouse.displayMouses(this.checked);
                                        }
                                    });
                                    label1.attr("title", "Toggle seeing everyone else's cursors");
                                    label1.text("Enable cursors.");
                                    label1.prepend(checkBox1);
                                    label1.qtip({ style: { classes: "qTip_optionsBox qtip-light" } });
                                    checkBox1.after("<label class='noselect checkbox-custom-label' for='" + id + "'></label>");
                                    content.append(label1);
                                    var header1 = BasicBox.createSideMenuHeader("Chat");
                                    content.append(header1);
                                    var label1 = $(document.createElement("label"));
                                    label1.addClass("sideMenuContentItem");
                                    var id = "ui_ui" + counter;
                                    counter++;
                                    var checkBox1 = $(document.createElement('input')).attr({
                                        "class": "noselect checkbox-custom",
                                        id: id,
                                        type: 'checkbox'
                                    });
                                    var setting = PianoRhythm.loadSetting("UI", "displayChatMessages");
                                    var val = (setting !== null) ? setting : true;
                                    checkBox1.prop("checked", val);
                                    checkBox1.change(function () {
                                        PianoRhythm.SETTINGS["displayChatMessages"] = this.checked;
                                        PianoRhythm.saveSetting("UI", "displayChatMessages", this.checked);
                                        if (PianoRhythm.CMESSAGES)
                                            if (!this.checked) {
                                                PianoRhythm.CMESSAGES.hide();
                                                PianoRhythm.CMESSAGEINPUT.hide();
                                            }
                                            else {
                                                PianoRhythm.CMESSAGES.show();
                                                PianoRhythm.CMESSAGEINPUT.show();
                                            }
                                    });
                                    label1.attr("title", "Display the Chat messages.");
                                    label1.text("Display Chat Messages");
                                    label1.prepend(checkBox1);
                                    label1.qtip({ style: { classes: "qTip_optionsBox qtip-light" } });
                                    checkBox1.after("<label class='noselect checkbox-custom-label' for='" + id + "'></label>");
                                    content.append(label1);
                                    var label1 = $(document.createElement("label"));
                                    label1.addClass("sideMenuContentItem");
                                    var id = "ui_ui" + counter;
                                    counter++;
                                    var checkBox1 = $(document.createElement('input')).attr({
                                        "class": "noselect checkbox-custom",
                                        id: id,
                                        type: 'checkbox'
                                    });
                                    var setting = PianoRhythm.loadSetting("UI", "chat_message_background");
                                    var val = (setting !== null) ? setting : true;
                                    checkBox1.prop("checked", val);
                                    checkBox1.change(function () {
                                        PianoRhythm.SETTINGS["chat_message_background"] = this.checked;
                                        PianoRhythm.saveSetting("UI", "chat_message_background", this.checked);
                                        if (PianoRhythm.CMESSAGESUL) {
                                            if (this.checked)
                                                PianoRhythm.CMESSAGESUL.children().attr("class", "message");
                                            else
                                                PianoRhythm.CMESSAGESUL.children().attr("class", "message2");
                                        }
                                    });
                                    label1.attr("title", "Display the white background of chat messages.");
                                    label1.text("Display Chat Message Background");
                                    label1.prepend(checkBox1);
                                    label1.qtip({ style: { classes: "qTip_optionsBox qtip-light" } });
                                    checkBox1.after("<label class='noselect checkbox-custom-label' for='" + id + "'></label>");
                                    content.append(label1);
                                    var header1 = BasicBox.createSideMenuHeader("Other");
                                    content.append(header1);
                                    var label1 = $(document.createElement("label"));
                                    label1.addClass("sideMenuContentItem");
                                    var id = "ui_ui" + counter;
                                    counter++;
                                    var checkBox1 = $(document.createElement('input')).attr({
                                        "class": "noselect checkbox-custom",
                                        id: id,
                                        type: 'checkbox'
                                    });
                                    var setting = PianoRhythm.loadSetting("UI", "displayMIDI_IO");
                                    var val = (setting !== null) ? setting : true;
                                    checkBox1.prop("checked", val);
                                    checkBox1.change(function () {
                                        PianoRhythm.SETTINGS["displayMIDI_IO"] = this.checked;
                                        PianoRhythm.saveSetting("UI", "displayMIDI_IO", this.checked);
                                        if (PianoRhythm.MIDIOPTIONSBUTTON)
                                            if (!this.checked)
                                                PianoRhythm.MIDIOPTIONSBUTTON.hide();
                                            else
                                                PianoRhythm.MIDIOPTIONSBUTTON.show();
                                    });
                                    label1.attr("title", "Display MIDI I/O (Midi Input / Output) Button on bottom.");
                                    label1.text("Display MIDI I/O Button");
                                    label1.prepend(checkBox1);
                                    label1.qtip({ style: { classes: "qTip_optionsBox qtip-light" } });
                                    checkBox1.after("<label class='noselect checkbox-custom-label' for='" + id + "'></label>");
                                    content.append(label1);
                                    var checkBox_instrDock;
                                    var label1 = $(document.createElement("label"));
                                    label1.addClass("sideMenuContentItem");
                                    var id = "ui_ui" + counter;
                                    counter++;
                                    var checkBox1 = $(document.createElement('input')).attr({
                                        "class": "noselect checkbox-custom",
                                        id: id,
                                        type: 'checkbox'
                                    });
                                    var setting = PianoRhythm.loadSetting("UI", "displayDock1");
                                    var val = (setting !== null) ? setting : true;
                                    checkBox1.prop("checked", val);
                                    checkBox1.change(function () {
                                        PianoRhythm.SETTINGS["displayDock1"] = this.checked;
                                        PianoRhythm.saveSetting("UI", "displayDock1", this.checked);
                                        if (PianoRhythmDock.DOCK_SLOTS)
                                            if (!this.checked) {
                                                PianoRhythmDock.SEARCH_BAR_SELECT.hide();
                                                PianoRhythmDock.SEARCH_BAR_INPUT.hide();
                                                PianoRhythmDock.OCTAVE.hide();
                                                PianoRhythmDock.TRANSPOSE.hide();
                                            }
                                            else {
                                                PianoRhythmDock.SEARCH_BAR_SELECT.show();
                                                PianoRhythmDock.OCTAVE.show();
                                                PianoRhythmDock.TRANSPOSE.show();
                                                PianoRhythmDock.SEARCH_BAR_INPUT.show();
                                            }
                                    });
                                    label1.attr("title", "Display the transpose, octave, and search bar.");
                                    label1.text("Display Transpose, Octave & Search");
                                    label1.prepend(checkBox1);
                                    label1.qtip({ style: { classes: "qTip_optionsBox qtip-light" } });
                                    checkBox1.after("<label class='noselect checkbox-custom-label' for='" + id + "'></label>");
                                    content.append(label1);
                                    var label1 = $(document.createElement("label"));
                                    label1.addClass("sideMenuContentItem");
                                    var id = "ui_ui" + counter;
                                    counter++;
                                    checkBox_instrDock = $(document.createElement('input')).attr({
                                        "class": "noselect checkbox-custom",
                                        id: id,
                                        type: 'checkbox'
                                    });
                                    var setting = PianoRhythm.loadSetting("UI", "displayDock2");
                                    var val = (setting !== null) ? setting : true;
                                    checkBox_instrDock.prop("checked", val);
                                    checkBox_instrDock.change(function () {
                                        PianoRhythm.SETTINGS["displayDock2"] = this.checked;
                                        PianoRhythm.saveSetting("UI", "displayDock2", this.checked);
                                        if (PianoRhythmDock.DOCK_SLOTS)
                                            PianoRhythm.toggleDockDisplay(this.checked);
                                    });
                                    label1.attr("title", "Display the entire instruments dock.");
                                    label1.text("Display Instrument Dock");
                                    label1.prepend(checkBox_instrDock);
                                    label1.qtip({ style: { classes: "qTip_optionsBox qtip-light" } });
                                    checkBox_instrDock.after("<label class='noselect checkbox-custom-label' for='" + id + "'></label>");
                                    content.append(label1);
                                    var label1 = $(document.createElement("label"));
                                    label1.addClass("sideMenuContentItem");
                                    var id = "ui_ui" + counter;
                                    counter++;
                                    var checkBox1 = $(document.createElement('input')).attr({
                                        "class": "noselect checkbox-custom",
                                        id: id,
                                        type: 'checkbox'
                                    });
                                    var setting = PianoRhythm.loadSetting("UI", "keepChatFocus");
                                    var val = (setting !== null) ? setting : false;
                                    checkBox1.prop("checked", val);
                                    checkBox1.change(function () {
                                        return;
                                        PianoRhythm.SETTINGS["keepChatFocus"] = this.checked;
                                        PianoRhythm.saveSetting("UI", "keepChatFocus", this.checked);
                                        PianoRhythm.ALWAYS_KEEP_CHAT_FOCUS = this.checked;
                                        if (this.checked)
                                            PianoRhythm.FOCUS_CHAT();
                                        else
                                            PianoRhythm.FOCUS_PIANO();
                                    });
                                    label1.attr("title", "Keep the chat messages in focus in front of the piano.");
                                    label1.text("Keep Chat Messages in Focus");
                                    label1.prepend(checkBox1);
                                    label1.qtip({ style: { classes: "qTip_optionsBox qtip-light" } });
                                    checkBox1.after("<label class='noselect checkbox-custom-label' for='" + id + "'></label>");
                                    content.append(label1);
                                    var label1 = $(document.createElement("label"));
                                    label1.addClass("sideMenuContentItem");
                                    var id = "ui_ui" + counter;
                                    counter++;
                                    var checkBox1 = $(document.createElement('input')).attr({
                                        "class": "noselect checkbox-custom",
                                        id: id,
                                        type: 'checkbox'
                                    });
                                    var setting = PianoRhythm.loadSetting("UI", "bg_animation");
                                    var val = (setting !== null) ? setting : true;
                                    checkBox1.prop("checked", val);
                                    checkBox1.change(function () {
                                        PianoRhythm.SETTINGS["bg_animation"] = this.checked;
                                        PianoRhythm.saveSetting("UI", "bg_animation", this.checked);
                                        PianoRhythm.default_show_bg = this.checked;
                                        if (this.checked)
                                            $(".fullscreen-bg").fadeIn(1500);
                                        else
                                            $(".fullscreen-bg").fadeOut(1500);
                                    });
                                    label1.text("Toggle background animation");
                                    label1.prepend(checkBox1);
                                    checkBox1.after("<label class='noselect checkbox-custom-label' for='" + id + "'></label>");
                                    content.append(label1);
                                    var label1 = $(document.createElement("label"));
                                    label1.addClass("sideMenuContentItem");
                                    var id = "ui_ui" + counter;
                                    counter++;
                                    var checkBox1 = $(document.createElement('input')).attr({
                                        "class": "noselect checkbox-custom",
                                        id: id,
                                        type: 'checkbox'
                                    });
                                    var setting = PianoRhythm.loadSetting("UI", "listScrollBar");
                                    var val = (setting !== null) ? setting : false;
                                    checkBox1.prop("checked", val);
                                    checkBox1.change(function () {
                                        PianoRhythm.toggleListScrollBar(this.checked);
                                    });
                                    label1.text("Toggle showing the scrollbar for the Users/Pals/Rooms lists.");
                                    label1.prepend(checkBox1);
                                    checkBox1.after("<label class='noselect checkbox-custom-label' for='" + id + "'></label>");
                                    content.append(label1);
                                    return content;
                                },
                                onClick: function (evt) {
                                    if (optionsBox.sideMenu) {
                                        if (optionsBox.sideMenu.selectedContent === "menuItemContent_" + evt.target.innerText)
                                            return;
                                        optionsBox.sideMenu.hideAllContent(evt.target.innerText);
                                    }
                                }
                            },
                            {
                                name: "INPUT",
                                content: function (evt) {
                                    var content = $(document.createElement("div"));
                                    var label1 = $(document.createElement("label"));
                                    label1.addClass("sideMenuContentItem");
                                    var setting = PianoRhythm.loadSetting("INPUT", "keyboardMap");
                                    var header1 = BasicBox.createSideMenuHeader("Keyboard");
                                    content.append(header1);
                                    var optionInput = optionsBox.addInput({
                                        type: "select",
                                        removeNoneOption: true,
                                        list: ["PIANORHYTHM", "MULTIPLAYERPIANO", "VIRTUAL_PIANO"],
                                        value: setting || "MULTIPLAYERPIANO",
                                        appendToBox: false,
                                        paddingLeft: "0px",
                                        stateChange: (evt) => {
                                            var val = evt.currentTarget.value;
                                            PianoRhythm.saveSetting("INPUT", "keyboardMap", val);
                                            PianoRhythm.SETTINGS["keyboardMap"] = val;
                                        }
                                    });
                                    label1.attr("title", "Select the keyboard input mapping. MPP = MultiplayerPiano");
                                    label1.text("Keyboard Input Mapping");
                                    label1.append(optionInput);
                                    label1.qtip({ style: { classes: "qTip_optionsBox qtip-light" } });
                                    content.append(label1);
                                    var label1 = $(document.createElement("label"));
                                    label1.addClass("sideMenuContentItem");
                                    label1.attr("title", "Clears your message input history.");
                                    label1.text("Delete Message Input History");
                                    var button1 = BasicBox.createButton("Delete", () => {
                                        PianoRhythm.CHAT_SETTINGS.prevCommand = [];
                                        PianoRhythm.CHAT_SETTINGS.keyCount = 0;
                                        PianoRhythm.CHAT_SETTINGS.commandCount = 0;
                                        PianoRhythm.notify({ message: "You have successfully cleared your message input history!" });
                                    }, { "margin-top": "10px" });
                                    label1.append(button1);
                                    label1.qtip({ style: { classes: "qTip_optionsBox qtip-light" } });
                                    content.append(label1);
                                    var header1 = BasicBox.createSideMenuHeader("Bindings");
                                    content.append(header1);
                                    var binding1 = PianoRhythm.loadSetting("KEYBIND", "transpose_up") || "home";
                                    var label_transpose_up = $(document.createElement("label"));
                                    label_transpose_up.addClass("sideMenuContentItem");
                                    label_transpose_up.text("Transpose Up: (" + binding1 + ")");
                                    label_transpose_up.css({
                                        "font-size": 18,
                                        "font-weight": "bold"
                                    });
                                    var button1 = BasicBox.createButton("Change", (b) => {
                                        PianoRhythm.changeKeyBind({
                                            title: "Change the key for 'TRANSPOSE UP'",
                                            val: binding1.toLowerCase(),
                                            callbackPressDown: (e, input, cb) => {
                                                if (input) {
                                                    var pre = "";
                                                    if (e.metaKey || e.ctrlKey)
                                                        pre = "ctrl-";
                                                    if (e.shiftKey)
                                                        pre = "shift-";
                                                    var val = pre + e.key;
                                                    if (e.key == "Shift" || e.key === "Control")
                                                        val = e.key;
                                                    if (val === " ")
                                                        val = "space";
                                                    input.find("input").val(val.toLowerCase());
                                                    if (cb)
                                                        cb(val);
                                                }
                                                return false;
                                            },
                                            callbackSubmit: (val) => {
                                                var re = /([fF]\d+)/g;
                                                var fkey = binding1.toLowerCase().match(re);
                                                if (fkey)
                                                    PianoRhythm.setupFunctionKey(binding1.toLowerCase());
                                                val = setArrowKeyNames(val);
                                                PianoRhythm.saveSetting("KEYBIND", "transpose_up", val.toLowerCase());
                                                PianoRhythm.setButtonActive(PianoRhythm.OPTIONSBUTTON, false);
                                                Mousetrap.unbind(binding1.toLowerCase());
                                                Mousetrap.bind(val.toLowerCase(), function (e) {
                                                    PianoRhythm.bind_transpose();
                                                    e.preventDefault();
                                                });
                                                label_transpose_up[0].firstChild.nodeValue = "Transpose Up: (" + val.toLowerCase() + ")";
                                            }
                                        });
                                    }, { "margin-top": "10px" });
                                    label_transpose_up.append(button1);
                                    label_transpose_up.qtip({ style: { classes: "qTip_optionsBox qtip-light" } });
                                    content.append(label_transpose_up);
                                    var binding2 = PianoRhythm.loadSetting("KEYBIND", "transpose_down") || "end";
                                    var label_transpose_down = $(document.createElement("label"));
                                    label_transpose_down.addClass("sideMenuContentItem");
                                    label_transpose_down.text("Transpose Down: (" + binding2 + ")");
                                    label_transpose_down.css({
                                        "font-size": 18,
                                        "font-weight": "bold"
                                    });
                                    var button1 = BasicBox.createButton("Change", () => {
                                        PianoRhythm.changeKeyBind({
                                            title: "Change the key for 'TRANSPOSE DOWN'",
                                            val: binding2.toLowerCase(),
                                            callbackPressDown: (e, input, cb) => {
                                                if (input) {
                                                    var pre = "";
                                                    if (e.metaKey || e.ctrlKey)
                                                        pre = "ctrl-";
                                                    if (e.shiftKey)
                                                        pre = "shift-";
                                                    var val = pre + e.key;
                                                    if (e.key == "Shift" || e.key === "Control")
                                                        val = e.key;
                                                    if (val === " ")
                                                        val = "space";
                                                    input.find("input").val(val.toLowerCase());
                                                    if (cb)
                                                        cb(val);
                                                }
                                                return false;
                                            },
                                            callbackSubmit: (val) => {
                                                var re = /([fF]\d+)/g;
                                                var fkey = binding2.toLowerCase().match(re);
                                                if (fkey)
                                                    PianoRhythm.setupFunctionKey(binding2.toLowerCase());
                                                PianoRhythm.saveSetting("KEYBIND", "transpose_down", val.toLowerCase());
                                                Mousetrap.unbind(binding2.toLowerCase());
                                                Mousetrap.bind(val.toLowerCase(), function (e) {
                                                    PianoRhythm.bind_transpose(-1);
                                                    e.preventDefault();
                                                });
                                                label_transpose_down[0].firstChild.nodeValue = "Transpose Down: (" + val.toLowerCase() + ")";
                                            }
                                        });
                                    }, { "margin-top": "10px" });
                                    label_transpose_down.append(button1);
                                    label_transpose_down.qtip({ style: { classes: "qTip_optionsBox qtip-light" } });
                                    content.append(label_transpose_down);
                                    var binding3 = PianoRhythm.loadSetting("KEYBIND", "octave_up") || "pageup";
                                    var label_octave_up = $(document.createElement("label"));
                                    label_octave_up.addClass("sideMenuContentItem");
                                    label_octave_up.text("Octave Up: (" + binding3 + ")");
                                    label_octave_up.css({
                                        "font-size": 18,
                                        "font-weight": "bold"
                                    });
                                    var button1 = BasicBox.createButton("Change", () => {
                                        PianoRhythm.changeKeyBind({
                                            title: "Change the key for 'OCTAVE UP'",
                                            val: binding3.toLowerCase(),
                                            callbackPressDown: (e, input, cb) => {
                                                if (input) {
                                                    var pre = "";
                                                    if (e.metaKey || e.ctrlKey)
                                                        pre = "ctrl-";
                                                    if (e.shiftKey)
                                                        pre = "shift-";
                                                    var val = pre + e.key;
                                                    if (e.key == "Shift" || e.key === "Control")
                                                        val = e.key;
                                                    if (val === " ")
                                                        val = "space";
                                                    input.find("input").val(val.toLowerCase());
                                                    if (cb)
                                                        cb(val);
                                                }
                                                return false;
                                            },
                                            callbackSubmit: (val) => {
                                                var re = /([fF]\d+)/g;
                                                var fkey = binding3.toLowerCase().match(re);
                                                if (fkey)
                                                    PianoRhythm.setupFunctionKey(binding3.toLowerCase());
                                                val = setArrowKeyNames(val);
                                                PianoRhythm.saveSetting("KEYBIND", "octave_up", val.toLowerCase());
                                                Mousetrap.unbind(binding3.toLowerCase());
                                                Mousetrap.bind(val.toLowerCase(), function (e) {
                                                    PianoRhythm.bind_octave();
                                                    e.preventDefault();
                                                });
                                                label_octave_up[0].firstChild.nodeValue = "Octave Up: (" + val.toLowerCase() + ")";
                                            }
                                        });
                                    }, { "margin-top": "10px" });
                                    label_octave_up.append(button1);
                                    label_octave_up.qtip({ style: { classes: "qTip_optionsBox qtip-light" } });
                                    content.append(label_octave_up);
                                    var binding4 = PianoRhythm.loadSetting("KEYBIND", "octave_down") || "pagedown";
                                    var label_octave_down = $(document.createElement("label"));
                                    label_octave_down.addClass("sideMenuContentItem");
                                    label_octave_down.text("Octave Down: (" + binding4 + ")");
                                    label_octave_down.css({
                                        "font-size": 18,
                                        "font-weight": "bold"
                                    });
                                    var button1 = BasicBox.createButton("Change", () => {
                                        PianoRhythm.changeKeyBind({
                                            title: "Change the key for 'OCTAVE DOWN'",
                                            val: binding4.toLowerCase(),
                                            callbackPressDown: (e, input, cb) => {
                                                if (input) {
                                                    var pre = "";
                                                    if (e.metaKey || e.ctrlKey)
                                                        pre = "ctrl-";
                                                    if (e.shiftKey)
                                                        pre = "shift-";
                                                    var val = pre + e.key;
                                                    if (e.key == "Shift" || e.key === "Control")
                                                        val = e.key;
                                                    if (val === " ")
                                                        val = "space";
                                                    input.find("input").val(val.toLowerCase());
                                                    if (cb)
                                                        cb(val);
                                                }
                                                return false;
                                            },
                                            callbackSubmit: (val) => {
                                                var re = /([fF]\d+)/g;
                                                var fkey = binding4.toLowerCase().match(re);
                                                if (fkey)
                                                    PianoRhythm.setupFunctionKey(binding4.toLowerCase());
                                                val = setArrowKeyNames(val);
                                                PianoRhythm.saveSetting("KEYBIND", "octave_down", val.toLowerCase());
                                                Mousetrap.unbind(binding4.toLowerCase());
                                                Mousetrap.bind(val.toLowerCase(), function (e) {
                                                    PianoRhythm.bind_octave(-1);
                                                    e.preventDefault();
                                                });
                                                label_octave_down[0].firstChild.nodeValue = "Octave Down: (" + val.toLowerCase() + ")";
                                            }
                                        });
                                    }, { "margin-top": "10px" });
                                    label_octave_down.append(button1);
                                    label_octave_down.qtip({ style: { classes: "qTip_optionsBox qtip-light" } });
                                    content.append(label_octave_down);
                                    var binding5 = PianoRhythm.loadSetting("KEYBIND", "toggle_dock") || "`";
                                    var label_toggle_dock = $(document.createElement("label"));
                                    label_toggle_dock.addClass("sideMenuContentItem");
                                    label_toggle_dock.text("Toggle Dock Display: (" + binding5 + ")");
                                    label_toggle_dock.css({
                                        "font-size": 18,
                                        "font-weight": "bold"
                                    });
                                    var button1 = BasicBox.createButton("Change", () => {
                                        PianoRhythm.changeKeyBind({
                                            title: "Change the key for 'TOGGLE DOCK DISPLAY'",
                                            val: binding5.toLowerCase(),
                                            callbackPressDown: (e, input, cb) => {
                                                if (input) {
                                                    var pre = "";
                                                    if (e.metaKey || e.ctrlKey)
                                                        pre = "ctrl-";
                                                    if (e.shiftKey)
                                                        pre = "shift-";
                                                    var val = pre + e.key;
                                                    if (e.key == "Shift" || e.key === "Control")
                                                        val = e.key;
                                                    if (val === " ")
                                                        val = "space";
                                                    input.find("input").val(val.toLowerCase());
                                                    if (cb)
                                                        cb(val);
                                                }
                                                return false;
                                            },
                                            callbackSubmit: (val) => {
                                                var re = /([fF]\d+)/g;
                                                var fkey = binding5.toLowerCase().match(re);
                                                if (fkey)
                                                    PianoRhythm.setupFunctionKey(binding5.toLowerCase());
                                                val = setArrowKeyNames(val);
                                                PianoRhythm.saveSetting("KEYBIND", "toggle_dock", val.toLowerCase());
                                                Mousetrap.unbind(binding5.toLowerCase());
                                                Mousetrap.bind(val.toLowerCase(), function (e) {
                                                    PianoRhythm.toggleDock();
                                                    e.preventDefault();
                                                });
                                                label_toggle_dock[0].firstChild.nodeValue = "Toggle Dock Display: (" + val.toLowerCase() + ")";
                                            }
                                        });
                                    }, { "margin-top": "10px" });
                                    label_toggle_dock.append(button1);
                                    label_toggle_dock.qtip({ style: { classes: "qTip_optionsBox qtip-light" } });
                                    content.append(label_toggle_dock);
                                    var binding6 = PianoRhythm.loadSetting("KEYBIND", "toggle_sustain") || "backspace";
                                    var label_master_sustain = $(document.createElement("label"));
                                    label_master_sustain.addClass("sideMenuContentItem");
                                    label_master_sustain.text("Toggle Master Sustain: (" + binding6 + ")");
                                    label_master_sustain.css({
                                        "font-size": 18,
                                        "font-weight": "bold"
                                    });
                                    var button1 = BasicBox.createButton("Change", () => {
                                        PianoRhythm.changeKeyBind({
                                            title: "Change the key for 'TOGGLE SUSTAIN'",
                                            val: binding6.toLowerCase(),
                                            callbackPressDown: (e, input, cb) => {
                                                if (input) {
                                                    var pre = "";
                                                    if (e.metaKey || e.ctrlKey)
                                                        pre = "ctrl-";
                                                    if (e.shiftKey)
                                                        pre = "shift-";
                                                    var val = pre + e.key;
                                                    if (e.key == "Shift" || e.key === "Control")
                                                        val = e.key;
                                                    if (val === " ")
                                                        val = "space";
                                                    input.find("input").val(val.toLowerCase());
                                                    if (cb)
                                                        cb(val);
                                                }
                                                return false;
                                            },
                                            callbackSubmit: (val) => {
                                                var re = /([fF]\d+)/g;
                                                var fkey = binding5.toLowerCase().match(re);
                                                if (fkey)
                                                    PianoRhythm.setupFunctionKey(binding6.toLowerCase());
                                                val = setArrowKeyNames(val);
                                                PianoRhythm.saveSetting("KEYBIND", "toggle_sustain", val.toLowerCase());
                                                Mousetrap.unbind(binding6.toLowerCase());
                                                Mousetrap.bind(val.toLowerCase(), function (e) {
                                                    PianoRhythm.toggleSustain();
                                                    e.preventDefault();
                                                });
                                                label_master_sustain[0].firstChild.nodeValue = "Toggle Master Sustain: (" + val.toLowerCase() + ")";
                                            }
                                        });
                                    }, { "margin-top": "10px" });
                                    label_master_sustain.append(button1);
                                    label_master_sustain.qtip({ style: { classes: "qTip_optionsBox qtip-light" } });
                                    content.append(label_master_sustain);
                                    var binding7 = PianoRhythm.loadSetting("KEYBIND", "activate_sustain") || "space";
                                    var label_active_sustain = $(document.createElement("label"));
                                    label_active_sustain.addClass("sideMenuContentItem");
                                    label_active_sustain.text("Activate Sustain: (" + binding7 + ")");
                                    label_active_sustain.css({
                                        "font-size": 18,
                                        "font-weight": "bold"
                                    });
                                    var button1 = BasicBox.createButton("Change", () => {
                                        PianoRhythm.changeKeyBind({
                                            title: "Change the key for 'ACTIVATE SUSTAIN'",
                                            val: binding7.toLowerCase(),
                                            callbackPressDown: (e, input, cb) => {
                                                if (input) {
                                                    var pre = "";
                                                    if (e.metaKey || e.ctrlKey)
                                                        pre = "ctrl-";
                                                    if (e.shiftKey)
                                                        pre = "shift-";
                                                    var val = pre + e.key;
                                                    if (e.key == "Shift" || e.key === "Control")
                                                        val = e.key;
                                                    if (val === " ")
                                                        val = "space";
                                                    input.find("input").val(val.toLowerCase());
                                                    if (cb)
                                                        cb(val);
                                                }
                                                return false;
                                            },
                                            callbackSubmit: (val) => {
                                                var re = /([fF]\d+)/g;
                                                var fkey = binding5.toLowerCase().match(re);
                                                if (fkey)
                                                    PianoRhythm.setupFunctionKey(binding7.toLowerCase());
                                                val = setArrowKeyNames(val);
                                                PianoRhythm.saveSetting("KEYBIND", "activate_sustain", val.toLowerCase());
                                                Mousetrap.unbind(binding7.toLowerCase());
                                                Mousetrap.bind(val.toLowerCase(), function (e) {
                                                    PianoRhythm.toggleSustain();
                                                    e.preventDefault();
                                                });
                                                label_active_sustain[0].firstChild.nodeValue = "Active Sustain: (" + val.toLowerCase() + ")";
                                            }
                                        });
                                    }, { "margin-top": "10px" });
                                    label_active_sustain.append(button1);
                                    label_active_sustain.qtip({ style: { classes: "qTip_optionsBox qtip-light" } });
                                    content.append(label_active_sustain);
                                    var binding8 = PianoRhythm.loadSetting("KEYBIND", "toggle_midilist") || "f2";
                                    var label_master_sustain = $(document.createElement("label"));
                                    label_master_sustain.addClass("sideMenuContentItem");
                                    label_master_sustain.text("Toggle Midi List: (" + binding8 + ")");
                                    label_master_sustain.css({
                                        "font-size": 18,
                                        "font-weight": "bold"
                                    });
                                    var button1 = BasicBox.createButton("Change", () => {
                                        PianoRhythm.changeKeyBind({
                                            title: "Change the key for 'TOGGLE MIDI LIST'",
                                            val: binding8.toLowerCase(),
                                            callbackPressDown: (e, input, cb) => {
                                                if (input) {
                                                    var pre = "";
                                                    if (e.metaKey || e.ctrlKey)
                                                        pre = "ctrl-";
                                                    if (e.shiftKey)
                                                        pre = "shift-";
                                                    var val = pre + e.key;
                                                    if (e.key == "Shift" || e.key === "Control")
                                                        val = e.key;
                                                    if (val === " ")
                                                        val = "space";
                                                    input.find("input").val(val.toLowerCase());
                                                    if (cb)
                                                        cb(val);
                                                }
                                                return false;
                                            },
                                            callbackSubmit: (val) => {
                                                var re = /([fF]\d+)/g;
                                                var fkey = binding8.toLowerCase().match(re);
                                                if (fkey)
                                                    PianoRhythm.setupFunctionKey(binding8.toLowerCase());
                                                val = setArrowKeyNames(val);
                                                PianoRhythm.saveSetting("KEYBIND", "toggle_midilist", val.toLowerCase());
                                                Mousetrap.unbind(binding8.toLowerCase());
                                                Mousetrap.bind(val.toLowerCase(), function (e) {
                                                    e.preventDefault();
                                                });
                                                label_master_sustain[0].firstChild.nodeValue = "Toggle Midi List: (" + val.toLowerCase() + ")";
                                            }
                                        });
                                    }, { "margin-top": "10px" });
                                    label_master_sustain.append(button1);
                                    label_master_sustain.qtip({ style: { classes: "qTip_optionsBox qtip-light" } });
                                    content.append(label_master_sustain);
                                    return content;
                                },
                                onClick: function (evt) {
                                    if (optionsBox.sideMenu) {
                                        if (optionsBox.sideMenu.selectedContent === "menuItemContent_" + evt.target.innerText)
                                            return;
                                        optionsBox.sideMenu.hideAllContent(evt.target.innerText);
                                    }
                                }
                            },
                            {
                                name: "MISC",
                                content: function (evt) {
                                    var content = $(document.createElement("div"));
                                    let counter = 0;
                                    var header1 = BasicBox.createSideMenuHeader("Friends");
                                    content.append(header1);
                                    var label1 = $(document.createElement("label"));
                                    label1.addClass("sideMenuContentItem");
                                    var id = "ui_misc" + counter;
                                    counter++;
                                    var checkBox1 = $(document.createElement('input')).attr({
                                        "class": "noselect checkbox-custom",
                                        id: id,
                                        type: 'checkbox'
                                    });
                                    var setting = PianoRhythm.loadSetting("MISC", "friendOnlineMessage");
                                    var val = (setting !== null) ? setting : true;
                                    checkBox1.prop("checked", val);
                                    checkBox1.change(function () {
                                        PianoRhythm.SETTINGS["friendOnlineMessage"] = this.checked;
                                        PianoRhythm.saveSetting("MISC", "friendOnlineMessage", this.checked);
                                    });
                                    label1.attr("title", "Enable notifications when a friend comes online.");
                                    label1.text("Display Friend Online Notification.");
                                    label1.prepend(checkBox1);
                                    label1.qtip({ style: { classes: "qTip_optionsBox qtip-light" } });
                                    checkBox1.after("<label class='noselect checkbox-custom-label' for='" + id + "'></label>");
                                    content.append(label1);
                                    var header1 = BasicBox.createSideMenuHeader("Other");
                                    content.append(header1);
                                    var label1 = $(document.createElement("label"));
                                    label1.addClass("sideMenuContentItem");
                                    var id = "ui_misc" + counter;
                                    counter++;
                                    var checkBox1 = $(document.createElement('input')).attr({
                                        "class": "noselect checkbox-custom",
                                        id: id,
                                        type: 'checkbox'
                                    });
                                    var setting = PianoRhythm.loadSetting("MISC", "logMessages");
                                    var val = (setting !== null) ? setting : false;
                                    checkBox1.prop("checked", val);
                                    checkBox1.change(function () {
                                        PianoRhythm.saveSetting("MISC", "logMessages", this.checked);
                                        PianoRhythm.DEBUG_MESSAGING = this.checked;
                                    });
                                    label1.attr("title", "Toggle console debug log messages.");
                                    label1.text("Enable debug messages.");
                                    label1.prepend(checkBox1);
                                    label1.qtip({ style: { classes: "qTip_optionsBox qtip-light" } });
                                    checkBox1.after("<label class='noselect checkbox-custom-label' for='" + id + "'></label>");
                                    content.append(label1);
                                    var label1 = $(document.createElement("label"));
                                    label1.addClass("sideMenuContentItem");
                                    var id = "ui_misc" + counter;
                                    counter++;
                                    var checkBox1 = $(document.createElement('input')).attr({
                                        "class": "noselect checkbox-custom",
                                        id: id,
                                        type: 'checkbox'
                                    });
                                    var setting = PianoRhythm.SETTINGS["suppress_link_warning"];
                                    var val = (setting !== null) ? setting : false;
                                    checkBox1.prop("checked", val);
                                    checkBox1.change(function () {
                                        PianoRhythm.saveSetting("MISC", "suppress_link_warning", this.checked);
                                        PianoRhythm.SETTINGS["suppress_link_warning"] = this.checked;
                                    });
                                    label1.text("Suppress external link warnings.");
                                    label1.prepend(checkBox1);
                                    label1.qtip({ style: { classes: "qTip_optionsBox qtip-light" } });
                                    checkBox1.after("<label class='noselect checkbox-custom-label' for='" + id + "'></label>");
                                    content.append(label1);
                                    var header1 = BasicBox.createSideMenuHeader("Bots");
                                    content.append(header1);
                                    var label1 = $(document.createElement("label"));
                                    label1.addClass("sideMenuContentItem");
                                    var id = "ui_misc" + counter;
                                    counter++;
                                    var checkBox1 = $(document.createElement('input')).attr({
                                        "class": "noselect checkbox-custom",
                                        id: id,
                                        type: 'checkbox'
                                    });
                                    var setting = PianoRhythm.loadSetting("MISC", "allow_bot_messages");
                                    var val = (setting !== null) ? setting : true;
                                    checkBox1.prop("checked", val);
                                    checkBox1.change(function () {
                                        PianoRhythm.SETTINGS["allow_bot_messages"] = this.checked;
                                        PianoRhythm.saveSetting("MISC", "allow_bot_messages", this.checked);
                                    });
                                    label1.attr("title", "Display the chat messages from bots.");
                                    label1.text("Display Chat Bot Messages");
                                    label1.prepend(checkBox1);
                                    label1.qtip({ style: { classes: "qTip_optionsBox qtip-light" } });
                                    checkBox1.after("<label class='noselect checkbox-custom-label' for='" + id + "'></label>");
                                    content.append(label1);
                                    var header1 = BasicBox.createSideMenuHeader("Local Storage");
                                    content.append(header1);
                                    var label1 = $(document.createElement("label"));
                                    label1.addClass("sideMenuContentItem");
                                    label1.attr("title", "Clears the local storage of all saved SETTINGS.");
                                    label1.text("Delete All Saved Settings");
                                    var button1 = BasicBox.createButton("Delete", () => {
                                        PianoRhythm.notify({
                                            message: "Are you sure you want to <span style='color:orangered'>delete your saved SETTINGS</span>? Click on this notification" +
                                                " to confirm or else just ignore it to cancel!",
                                            onClick: () => {
                                                PianoRhythm.deleteAllSettings();
                                                optionsBox.remove();
                                                PianoRhythm.setButtonActive(PianoRhythm.OPTIONSBUTTON, false);
                                            }
                                        });
                                    }, { "margin-top": "10px" });
                                    label1.append(button1);
                                    label1.qtip({ style: { classes: "qTip_optionsBox qtip-light" } });
                                    content.append(label1);
                                    var header1 = BasicBox.createSideMenuHeader("Tutorials");
                                    content.append(header1);
                                    var label1 = $(document.createElement("label"));
                                    label1.addClass("sideMenuContentItem");
                                    label1.attr("title", "Basic Tutorial on how to navigate PianoRhythm");
                                    label1.text("Tutorial 1 (Navigation)");
                                    var buttonText = (PianoRhythm.tutorialNotifications && PianoRhythm.currentTutorial === 1) ? "Stop" : "Start";
                                    var button1 = BasicBox.createButton(buttonText, function (e) {
                                        $('.qtip_custom2').qtip('hide');
                                        $('.qtip_custom2').qtip('destroy', true);
                                        if (PianoRhythm.tutorialNotifications && PianoRhythm.currentTutorial === 1) {
                                            PianoRhythm.notify({ message: "Tutorial 1 has been stopped." });
                                            $(this).text("Start");
                                            PianoRhythm.tutorialNotifications = false;
                                        }
                                        else {
                                            PianoRhythm.notify({ message: "Tutorial 1 has started." });
                                            PianoRhythm.loadNotifications(PianoRhythm.tutorial1(), "qtip_custom2");
                                            PianoRhythm.setButtonActive(PianoRhythm.OPTIONSBUTTON, false);
                                        }
                                    }, { "margin-top": "10px" });
                                    label1.append(button1);
                                    label1.qtip({ style: { classes: "qTip_optionsBox qtip-light" } });
                                    content.append(label1);
                                    var label1 = $(document.createElement("label"));
                                    label1.addClass("sideMenuContentItem");
                                    label1.attr("title", "Basic Tutorial on how to use the instrument dock and load instruments.");
                                    label1.text("Tutorial 2 (Instrument Dock)");
                                    var buttonText = (PianoRhythm.tutorialNotifications && PianoRhythm.currentTutorial === 2) ? "Stop" : "Start";
                                    var button1 = BasicBox.createButton(buttonText, function (e) {
                                        $('.qtip_custom2').qtip('hide');
                                        $('.qtip_custom2').qtip('destroy', true);
                                        if (PianoRhythm.tutorialNotifications && PianoRhythm.currentTutorial === 2) {
                                            PianoRhythm.notify({ message: "Tutorial 2 has been stopped." });
                                            $(this).text("Start");
                                            PianoRhythm.tutorialNotifications = false;
                                        }
                                        else {
                                            PianoRhythm.notify({ message: "Tutorial 2 has started." });
                                            PianoRhythm.loadNotifications(PianoRhythm.tutorial2(), "qtip_custom2");
                                            PianoRhythm.setButtonActive(PianoRhythm.OPTIONSBUTTON, false);
                                        }
                                    }, { "margin-top": "10px" });
                                    label1.append(button1);
                                    label1.qtip({ style: { classes: "qTip_optionsBox qtip-light" } });
                                    content.append(label1);
                                    var label1 = $(document.createElement("label"));
                                    label1.addClass("sideMenuContentItem");
                                    label1.attr("title", "Advanced Tutorial on how to use and navigate the instrument dock and channel slots.");
                                    label1.text("Tutorial 3 (Instrument Dock & Channel Slots)");
                                    var buttonText = (PianoRhythm.tutorialNotifications && PianoRhythm.currentTutorial === 2) ? "Stop" : "Start";
                                    var button1 = BasicBox.createButton(buttonText, function (e) {
                                        $('.qtip_custom2').qtip('hide');
                                        $('.qtip_custom2').qtip('destroy', true);
                                        if (PianoRhythm.tutorialNotifications && PianoRhythm.currentTutorial === 3) {
                                            PianoRhythm.notify({ message: "Tutorial 3 has been stopped." });
                                            $(this).text("Start");
                                            PianoRhythm.tutorialNotifications = false;
                                        }
                                        else {
                                            PianoRhythm.notify({ message: "Tutorial 3 has started." });
                                            PianoRhythm.loadNotifications(PianoRhythm.tutorial3(), "qtip_custom2");
                                            PianoRhythm.setButtonActive(PianoRhythm.OPTIONSBUTTON, false);
                                        }
                                    }, { "margin-top": "10px" });
                                    label1.append(button1);
                                    label1.qtip({ style: { classes: "qTip_optionsBox qtip-light" } });
                                    content.append(label1);
                                    return content;
                                },
                                onClick: function (evt) {
                                    if (optionsBox.sideMenu) {
                                        if (optionsBox.sideMenu.selectedContent === "menuItemContent_" + evt.target.innerText)
                                            return;
                                        optionsBox.sideMenu.hideAllContent(evt.target.innerText);
                                    }
                                }
                            },
                            {
                                name: "USER",
                                content: function (evt) {
                                    var content = $(document.createElement("div"));
                                    var header1 = BasicBox.createSideMenuHeader("User Options");
                                    content.append(header1);
                                    var label1 = $(document.createElement("label"));
                                    label1.addClass("sideMenuContentItem");
                                    var id = "ui_user1";
                                    var checkBox1 = $(document.createElement('input')).attr({
                                        "class": "noselect checkbox-custom",
                                        id: id,
                                        type: 'checkbox'
                                    });
                                    var setting = PianoRhythm.loadSetting("USER", "showImAfk");
                                    var val = (setting !== null) ? setting : true;
                                    checkBox1.prop("checked", val);
                                    checkBox1.change(function () {
                                        PianoRhythm.SHOW_IM_AFK = this.checked;
                                        PianoRhythm.saveSetting("USER", "showImAfk", this.checked);
                                        PianoRhythm.SETTINGS["showImAfk"] = this.checked;
                                    });
                                    label1.attr("title", "Toggle emitting your AFK status when you're on a different tab.");
                                    label1.text("Show that I'm AFK.");
                                    label1.prepend(checkBox1);
                                    label1.qtip({ style: { classes: "qTip_optionsBox qtip-light" } });
                                    checkBox1.after("<label class='noselect checkbox-custom-label' for='" + id + "'></label>");
                                    content.append(label1);
                                    if (PianoRhythm.CLIENT.loggedIn) {
                                        var label1 = $(document.createElement("label"));
                                        label1.addClass("sideMenuContentItem");
                                        var id = "ui_user3";
                                        var checkBox1 = $(document.createElement('input')).attr({
                                            "class": "noselect checkbox-custom",
                                            id: id,
                                            type: 'checkbox'
                                        });
                                        var setting = PianoRhythm.loadSetting("USER", "user_color");
                                        var val = (setting !== null) ? setting : true;
                                        label1.attr("title", "Change your color.");
                                        label1.text("USER COLOR");
                                        var mod = $("<div>");
                                        mod.css({ width: 100, height: 40 });
                                        var colorMod = $("<input>");
                                        colorMod.attr("type", "text");
                                        colorMod.attr("id", "custom");
                                        var val = PianoRhythm.CLIENT.color || stringToColour(PianoRhythm.CLIENT.name);
                                        colorMod.attr("value", val);
                                        colorMod.hide();
                                        mod.append(colorMod);
                                        colorMod.spectrum({
                                            preferredFormat: "name",
                                            showInput: true,
                                            showInitial: true,
                                            appendTo: mod,
                                            containerClassName: "spectrumUserOptions_Container",
                                            replacerClassName: "spectrumUserOptions_Replacer",
                                            allowEmpty: true,
                                            chooseText: "SELECT",
                                            cancelText: "RESET",
                                            show: function (data) {
                                                $(this).data('changed', false);
                                                mod.css({
                                                    width: 100,
                                                    height: 235,
                                                });
                                                PianoRhythm.CLIENT_FOCUS = CLIENT_FOCUS.OPTIONS;
                                            },
                                            hide: function (data) {
                                                if ($(this).data('changed')) {
                                                    if (data) {
                                                        var color = data.toHexString();
                                                        if (color) {
                                                            PianoRhythm.SOCKET.emit("changeColor", { color: color }, (err, result) => {
                                                                if (err) {
                                                                    PianoRhythm.notify({
                                                                        message: "Please wait at least 30 seconds before changing colors."
                                                                    });
                                                                    colorMod.spectrum("set", PianoRhythm.CLIENT.color);
                                                                    return;
                                                                }
                                                                if (result) {
                                                                    PianoRhythm.CLIENT.color = color;
                                                                    if (PianoRhythm.RhythmBlobFactory) {
                                                                        var blob = PianoRhythm.RhythmBlobFactory.getClientBlob();
                                                                        if (blob) {
                                                                            blob.color = PianoRhythm.CLIENT.color;
                                                                        }
                                                                    }
                                                                    PianoRhythm.notify({
                                                                        message: "You have changed your color to: <span style='color:" + color + "'>" + color + "</span>"
                                                                    });
                                                                }
                                                            });
                                                        }
                                                    }
                                                }
                                                else {
                                                    colorMod.spectrum("set", PianoRhythm.CLIENT.color);
                                                }
                                                mod.css({ width: 100, height: 40 });
                                            },
                                            change: function (data) {
                                                $(this).data('changed', true);
                                            },
                                        });
                                        label1.append(mod);
                                        label1.qtip({ style: { classes: "qTip_optionsBox qtip-light" } });
                                        content.append(label1);
                                    }
                                    var header1 = BasicBox.createSideMenuHeader("Mouse");
                                    content.append(header1);
                                    var label1 = $(document.createElement("label"));
                                    label1.addClass("sideMenuContentItem");
                                    var id = "ui_user2";
                                    var checkBox1 = $(document.createElement('input')).attr({
                                        "class": "noselect checkbox-custom",
                                        id: id,
                                        type: 'checkbox'
                                    });
                                    var setting = PianoRhythm.loadSetting("UI", "mouse_ShowMyCursor");
                                    var val = (setting !== null) ? setting : true;
                                    checkBox1.prop("checked", val);
                                    checkBox1.change(function () {
                                        PianoRhythm.SETTINGS["mouse_ShowMyCursor"] = this.checked;
                                        PianoRhythm.saveSetting("UI", "mouse_ShowMyCursor", this.checked);
                                        PianoRhythm.SHOW_CURSOR = this.checked;
                                        if (PianoRhythm.SOCKET) {
                                            PianoRhythm.SOCKET.emit("enableCursor", {
                                                enable: this.checked
                                            });
                                            if (PianoRhythm.mouseChannel)
                                                PianoRhythm.mouseChannel.publish({
                                                    id: PianoRhythm.CLIENT.id,
                                                    name: PianoRhythm.CLIENT.name,
                                                    color: PianoRhythm.CLIENT.color,
                                                    socketID: PianoRhythm.SOCKET.id,
                                                    type: (this.checked) ? "add" : "remove"
                                                });
                                        }
                                    });
                                    label1.attr("title", "Toggle showing your cursor to other players");
                                    label1.text("Show My Cursor to Others");
                                    label1.prepend(checkBox1);
                                    label1.qtip({ style: { classes: "qTip_optionsBox qtip-light" } });
                                    checkBox1.after("<label class='noselect checkbox-custom-label' for='" + id + "'></label>");
                                    content.append(label1);
                                    return content;
                                },
                                onClick: function (evt) {
                                    if (optionsBox.sideMenu) {
                                        if (optionsBox.sideMenu.selectedContent === "menuItemContent_" + evt.target.innerText)
                                            return;
                                        optionsBox.sideMenu.hideAllContent(evt.target.innerText);
                                    }
                                }
                            },
                            {
                                name: "DEV",
                                content: function (evt) {
                                    var content = $(document.createElement("div"));
                                    var header1 = BasicBox.createSideMenuHeader("Module");
                                    content.append(header1);
                                    var label1 = $(document.createElement("label"));
                                    label1.addClass("sideMenuContentItem");
                                    var id = "ui_d1";
                                    var checkBox1 = $(document.createElement('input')).attr({
                                        "class": "noselect checkbox-custom",
                                        id: id,
                                        type: 'checkbox'
                                    });
                                    var setting = PianoRhythm.loadSetting("DEV", "enableBot");
                                    var val = (setting !== null) ? setting : true;
                                    checkBox1.prop("checked", val);
                                    checkBox1.change(function () {
                                        PianoRhythm.ENABLE_MOD = this.checked;
                                        PianoRhythm.saveSetting("DEV", "enableBot", this.checked);
                                    });
                                    label1.attr("title", "Enable the bot module.");
                                    label1.text("Enable bot module.");
                                    label1.prepend(checkBox1);
                                    label1.qtip({ style: { classes: "qTip_optionsBox qtip-light" } });
                                    checkBox1.after("<label class='noselect checkbox-custom-label' for='" + id + "'></label>");
                                    content.append(label1);
                                    return content;
                                },
                                onClick: function (evt) {
                                    if (optionsBox.sideMenu) {
                                        if (optionsBox.sideMenu.selectedContent === "menuItemContent_" + evt.target.innerText)
                                            return;
                                        optionsBox.sideMenu.hideAllContent(evt.target.innerText);
                                    }
                                }
                            }
                        ]
                    });
                    PianoRhythm.BODY.append(optionsBox.box);
                    optionsBox.box.css({
                        overflow: "hidden",
                        marginTop: boxDimensions.height,
                        height: 0,
                        opacity: 0.1
                    }).animate({
                        marginTop: 0,
                        opacity: 1,
                        height: boxDimensions.height
                    }, 250, "swing", function () {
                        $(this).css({
                            display: "",
                            marginTop: ""
                        });
                    });
                    optionsBox.box.data("shown", true);
                    optionsBox.visible = true;
                    PianoRhythm.OPTIONS_BOX = optionsBox;
                }
                else {
                    if (PianoRhythm.OPTIONS_BOX && PianoRhythm.OPTIONS_BOX.visible) {
                        PianoRhythm.OPTIONS_BOX.hide(true);
                        PianoRhythm.setButtonActive(PianoRhythm.OPTIONSBUTTON, false);
                    }
                    else {
                        PianoRhythm.OPTIONS_BOX.show(true, boxDimensions.height);
                    }
                }
            });
            PianoRhythm.loadColorTheme();
            if (!PianoRhythm.INSTRUMENT_SELECTION) {
                PianoRhythm.INSTRUMENT_SELECTION = new PianoRhythmPlayer_1.PianoRhythmInstrumentSelection("PR_INSTRUMENT_SELECTION");
                PianoRhythm.INSTRUMENT_SELECTION.hide();
                PianoRhythm.INSTRUMENT_SELECTION.getInstrumentListFromServer().then(() => {
                    resolve(true);
                });
            }
            PianoRhythm.toggleListScrollBar(PianoRhythm.SETTINGS["listScrollBar"]);
            PianoRhythm.initializeFPSMETER();
            PianoRhythm.UI_INITIALIZED = true;
        });
    }
    static hideSelectionLists() {
        if (PianoRhythm.INSTRUMENT_SELECTION)
            PianoRhythm.INSTRUMENT_SELECTION.hide();
        if (PianoRhythmPlayer_1.PianoRhythmPlayer.MIDI_SELECTION)
            PianoRhythmPlayer_1.PianoRhythmPlayer.MIDI_SELECTION.hide();
        if (AudioEngine_1.AudioEngine.RECORDED_LIST)
            AudioEngine_1.AudioEngine.RECORDED_LIST.hide();
        if (AudioEngine_1.AudioEngine.REVERB_LIST)
            AudioEngine_1.AudioEngine.REVERB_LIST.hide();
    }
    static initializeQTIP() {
        let toolTipSetting = PianoRhythm.loadSetting("UI", "displayToolTip");
        PianoRhythm.SETTINGS["displayToolTip"] = (toolTipSetting !== null) ? toolTipSetting : true;
        if ($.fn.qtip)
            $.fn.qtip.defaults = $.extend(true, {}, $.fn.qtip.defaults, {
                style: {
                    classes: "qtip-light qtip_custom",
                    "padding": "50px",
                    "font-size": "12.5px"
                },
                position: {
                    my: "top center",
                    at: "bottom center",
                    viewport: $(window)
                },
                show: {
                    delay: 700,
                },
                hide: {
                    event: "mouseleave blur unfocus",
                },
                events: {
                    show: function (evt) {
                        if (!PianoRhythm.SETTINGS["displayToolTip"])
                            evt.preventDefault();
                    },
                }
            });
        $('[title!=""]').qtip();
    }
    static midiMessageParse(data) {
        if (PianoRhythm.MIDI_PARSER && data.target && data.target.connection === "open") {
            PianoRhythm.MIDI_PARSER.parse(data.data);
        }
    }
    static processMidi(msg) {
        let data = msg.data;
        if (data[1] > 7)
            data[1] = 0;
        data[2] += PianoRhythm.TRANSPOSE;
        let instrument = Piano_1.Piano.ACTIVE_INSTRUMENT;
        if (PianoRhythmDock.DOCK_INSTRUMENTS && PianoRhythmDock.DOCK_INSTRUMENTS[data[1]])
            switch (PianoRhythmDock.CURRENT_SLOT_MODE) {
                case SLOT_MODE.MULTI:
                    instrument = PianoRhythmDock.DOCK_INSTRUMENTS[data[1]].instrument;
                    break;
            }
        let pKey = Piano_1.Piano.KEYS[Piano_1.Piano.getKeyFromNote(data[2])] || Piano_1.Piano.KEYS[data[2]];
        if (pKey) {
            if (data[0] === 1) {
                let color = PianoRhythm.COLORS.base4;
                if (PianoRhythm.CLIENT && PianoRhythm.CLIENT.color) {
                    if (PianoRhythmDock.CURRENT_SLOT_MODE === SLOT_MODE.SINGLE)
                        color = PianoRhythm.CLIENT.color;
                }
                if (PianoRhythmDock.CURRENT_SLOT_MODE !== SLOT_MODE.SINGLE) {
                    if (PianoRhythmPlayer_1.PianoRhythmPlayer.TRACK_COLORS)
                        color = PianoRhythmPlayer_1.PianoRhythmPlayer.TRACK_COLORS[data[1]];
                }
                Piano_1.Piano.press({
                    velocity: data[3],
                    channel: data[1],
                    emit: true,
                    source: Piano_1.NOTE_SOURCE.MIDI,
                    instrumentName: instrument,
                    note: pKey.id,
                    socketID: PianoRhythm.CLIENT.socketID,
                    color: color
                });
            }
            else if (data[0] === 0) {
                Piano_1.Piano.release({
                    channel: data[1],
                    emit: true,
                    source: Piano_1.NOTE_SOURCE.MIDI,
                    instrumentName: instrument,
                    note: pKey.id,
                    socketID: PianoRhythm.CLIENT.socketID,
                });
            }
        }
    }
    static workerListener() {
        function messageListen(msg) {
            if (msg.data) {
                switch (msg.data.type || msg.type) {
                    case "parsedMessage":
                        PianoRhythm.chatMessageParsed(msg.data);
                        break;
                    case "sustainOn":
                        Piano_1.Piano.pressSustain();
                        break;
                    case "allNotesOff":
                    case "all-sound-off":
                        Piano_1.Piano.stopAllNotes();
                        break;
                    case "sustainOff":
                        Piano_1.Piano.releaseSustain();
                        break;
                    case "pM":
                        PianoRhythm.processMidi(msg);
                        break;
                    case "preAudio":
                        let data = msg.data.data || msg.data;
                        if (data) {
                            if (data.action === 0)
                                AudioEngine_1.AudioEngine.play(data.inst, data.id, data.vol, data.time, data.socketID, data.color);
                            else
                                AudioEngine_1.AudioEngine.stop(data.inst, data.id, data.time, data.socketID);
                        }
                        break;
                }
            }
        }
        PianoRhythm.messageListen = messageListen;
        if (PianoRhythm.MIDI_WORKER) {
            PianoRhythm.MIDI_WORKER.onmessage = messageListen;
        }
    }
    static bind_transpose(dir = 1) {
        let tran_input = PianoRhythmDock.TRANSPOSE.find("input");
        let val = parseInt(tran_input.val()) + dir;
        if (val > 12)
            val = 12;
        if (val < -12)
            val = -12;
        tran_input.val(val);
        tran_input.trigger("change");
        PianoRhythmDock.TRANSPOSE.css({ opacity: 1 });
        if (PianoRhythm.tranTimeout)
            clearTimeout(PianoRhythm.tranTimeout);
        PianoRhythm.tranTimeout = setTimeout(() => {
            PianoRhythmDock.TRANSPOSE.css("opacity", "");
            PianoRhythm.tranTimeout = null;
        }, 1000);
    }
    static bind_octave(dir = 1) {
        let tran_input = PianoRhythmDock.OCTAVE.find("input");
        let val = parseInt(tran_input.val()) + dir;
        if (val > 8)
            val = 8;
        if (val < 1)
            val = 1;
        tran_input.val(val);
        tran_input.trigger("change");
        PianoRhythmDock.OCTAVE.css({ opacity: 1 });
        if (PianoRhythm.octTimeout)
            clearTimeout(PianoRhythm.octTimeout);
        PianoRhythm.octTimeout = setTimeout(() => {
            PianoRhythmDock.OCTAVE.css("opacity", "");
            PianoRhythm.octTimeout = null;
        }, 1000);
    }
    static toggleDock() {
        PianoRhythm.INSTRUMENT_DOCK_DISPLAYED = !PianoRhythm.INSTRUMENT_DOCK_DISPLAYED;
        PianoRhythm.toggleDockDisplay(PianoRhythm.INSTRUMENT_DOCK_DISPLAYED);
    }
    static toggleDockDisplay(show = true) {
        if (show === undefined || show === null)
            show = true;
        if (!PianoRhythmDock.DOCK_SLOTS)
            return;
        PianoRhythm.INSTRUMENT_DOCK_DISPLAYED = show;
        if (!show) {
            PianoRhythmDock.DOCK_SLOTS.hide();
            PianoRhythmDock.SLOT_MODE_BUTTON.hide();
            PianoRhythmDock.SEARCH_BAR_SELECT.hide();
            PianoRhythmDock.SEARCH_BAR_INPUT.hide();
            PianoRhythmDock.OCTAVE.hide();
            PianoRhythmDock.TRANSPOSE.hide();
        }
        else {
            PianoRhythmDock.DOCK_SLOTS.show();
            PianoRhythmDock.SLOT_MODE_BUTTON.show();
            PianoRhythmDock.SEARCH_BAR_SELECT.show();
            PianoRhythmDock.OCTAVE.show();
            PianoRhythmDock.TRANSPOSE.show();
            PianoRhythmDock.SEARCH_BAR_INPUT.show();
        }
    }
    static toggleSustain(sustain) {
        Piano_1.Piano.AUTO_SUSTAIN = sustain || !Piano_1.Piano.AUTO_SUSTAIN;
        Piano_1.Piano.SUSTAIN = Piano_1.Piano.AUTO_SUSTAIN;
        if (PianoRhythm.SUSTAIN_DISPLAY) {
            PianoRhythm.SUSTAIN_DISPLAY.text("Sustain: " + (Piano_1.Piano.SUSTAIN ? "ON" : "OFF"));
        }
    }
    static updateLanguage() {
        let langSetting = PianoRhythm.loadSetting("GENERAL", "language");
        let langSelect = window['language'];
        if (PianoRhythm.SETTINGS["language"] == langSelect)
            return;
        if (langSelect === undefined)
            PianoRhythm.SETTINGS["language"] = (langSetting !== null) ? (langSetting) : "en";
        else
            PianoRhythm.SETTINGS["language"] = langSelect;
        let langSelectElem = $('.languageSelect');
        if (langSelectElem.length) {
            langSelectElem.val(PianoRhythm.SETTINGS["language"]);
            langSelectElem.trigger("change");
        }
        PianoRhythm.saveSetting("GENERAL", "language", PianoRhythm.SETTINGS["language"]);
    }
    static transition(slideText, slideDownEnd, slideUpEnd, slideDownTime = 800, slideUpTimeDelay = 500, slideUpTime = 800) {
        if (this.TRANSITIONING)
            return;
        if (PianoRhythm.TRANSITION_OVERLAY && slideDownTime) {
            if (slideText)
                PianoRhythm.TRANSITION_OVERLAY.text(slideText);
            else
                PianoRhythm.TRANSITION_OVERLAY.text("");
            PianoRhythm.PRELOADER.children().addClass("preloaderAnimate");
            PianoRhythm.PRELOADER.fadeIn("slow").css({
                left: "",
                top: "",
                bottom: "",
                right: "",
                "z-index": 99999
            });
            PianoRhythm.TRANSITIONING = true;
            PianoRhythm.TRANSITION_OVERLAY.animate({ height: "100vh" }, slideDownTime, () => {
                if (slideDownEnd)
                    slideDownEnd();
                if (PianoRhythm.UI_INITIALIZED)
                    PianoRhythm.SOCKET.emit("roomSet", true);
                if (slideUpTimeDelay) {
                    setTimeout(() => {
                        PianoRhythm.PRELOADER.fadeOut(slideUpTimeDelay);
                        PianoRhythm.PRELOADER.children().removeClass("preloaderAnimate");
                        PianoRhythm.PRELOADER.fadeIn("slow").css({
                            left: "auto", top: "auto",
                            bottom: "10px", right: "90px",
                            "z-index": 1001
                        });
                        PianoRhythm.TRANSITION_OVERLAY.animate({ height: "0" }, slideUpTime, () => {
                            if (slideUpEnd)
                                slideUpEnd();
                            PianoRhythm.TRANSITION_OVERLAY.text("");
                            PianoRhythm.TRANSITIONING = false;
                        });
                    }, slideUpTimeDelay);
                }
                else {
                    PianoRhythm.TRANSITIONING = false;
                }
            });
        }
    }
    static setUserStatus(status) {
        switch (status) {
            case user_1.UserStatus.ONLINE:
                break;
            case user_1.UserStatus.DO_NOT_DISTURB:
                break;
            case user_1.UserStatus.IDLE:
                break;
        }
    }
    static displayMainContent() {
        PianoRhythm.LOGIN_ENTERED = true;
        PianoRhythm.updateLanguage();
        PianoRhythm.pingInterval();
        if (PianoRhythm.LOGIN_PAGE)
            PianoRhythm.LOGIN_PAGE.css("filter", "");
        if (PianoRhythm.BODY)
            PianoRhythm.BODY.css("background", "");
        if (PianoRhythm.RhythmBlobFactory && PianoRhythm.SETTINGS["enableBlobs"])
            PianoRhythm.RhythmBlobFactory.start();
        if (Piano_1.Piano.INITIALIZED && PianoRhythm.UI_INITIALIZED) {
            if (PianoRhythm.LOGIN_PAGE)
                PianoRhythm.LOGIN_PAGE.fadeOut();
            PianoRhythm.transition("PianoRhythm", () => {
                PianoRhythm.CONTENT.fadeIn().css({ opacity: 0, visibility: "visible" }).animate({ opacity: 1 }, 1500);
                if (PianoRhythm.NQ_SLIDER && PianoRhythm.NQ_SLIDER_ELEMENT)
                    PianoRhythm.NQ_SLIDER_ELEMENT.fadeIn("slow");
                if (PianoRhythm.CMESSAGESUL)
                    PianoRhythm.CMESSAGESUL[0].scrollTop = PianoRhythm.CMESSAGESUL[0].scrollHeight;
            }, () => {
                PianoRhythm.resize();
            });
            return;
        }
        if (PianoRhythm.TRANSITION_OVERLAY) {
            PianoRhythm.PRELOADER.fadeIn("slow").css({
                "z-index": 99999
            });
            PianoRhythm.transition("Loading PianoRhythm...", () => {
                PianoRhythm.initiate2D();
                if (PianoRhythm.LOGIN_PAGE)
                    PianoRhythm.LOGIN_PAGE.css("display", "none");
                PianoRhythm.initializeUI().then(() => {
                    PianoRhythmDock.initialize().then(() => {
                        let $canvas = $(PianoRhythm.CANVAS_PARENT);
                        if (PianoRhythm.CANVAS_BG)
                            PianoRhythm.CANVAS_BG.style.opacity = 0;
                        let counter = 0;
                        let count = 0.5;
                        let instrumentLoaded = false;
                        let timer2Started = false;
                        let spinner = $('<div class="icon-spinner2 spinner_PianoLoad spinner" ></div>');
                        $(PianoRhythm.CANVAS_PARENT).prepend(spinner);
                        spinner.css({ "margin-top": '7%', "margin-left": '50%' });
                        Piano_1.Piano.LOADING_PIANO = true;
                        function startTimer2() {
                            let counter2 = 0;
                            timer2Started = true;
                            let fadeTimer2 = setInterval(() => {
                                counter2 += 0.01;
                                let value2 = "-webkit-gradient(linear, left top, 150% top,   from(rgba(0,0,0,1)), to(rgba(0,0,0," + counter2 + ")))";
                                if (counter2 >= 1) {
                                    clearInterval(fadeTimer2);
                                    $canvas.css("-webkit-mask-image", "-webkit-gradient(linear, left top, " + counter + "% top,   from(rgba(0,0,0,1)), to(rgba(0,0,0,1)))");
                                    if (PianoRhythm.CANVAS_BG)
                                        PianoRhythm.CANVAS_BG.style.opacity = 1;
                                    spinner.fadeOut().remove();
                                    Piano_1.Piano.LOADING_PIANO = false;
                                    PianoRhythm.initializeDragDrop();
                                    if (PianoRhythm.CMESSAGESUL)
                                        PianoRhythm.CMESSAGESUL[0].scrollTop = PianoRhythm.CMESSAGESUL[0].scrollHeight;
                                    PianoRhythm.CONTENT.css({ opacity: 0, visibility: "visible" }).animate({ opacity: 1 }, 800, () => {
                                        if (PianoRhythm.SUSTAIN_DISPLAY)
                                            PianoRhythm.SUSTAIN_DISPLAY.show();
                                        if (PianoRhythm.NQ_SLIDER && PianoRhythm.NQ_SLIDER_ELEMENT)
                                            PianoRhythm.NQ_SLIDER_ELEMENT.fadeIn("slow");
                                        if (PianoRhythm.SETTINGS["displayFPS"] && PianoRhythm.FPS_METER)
                                            PianoRhythm.FPS_METER["element"].show();
                                        setTimeout(() => {
                                            PianoRhythm.TRANSITION_OVERLAY.animate({ height: "0" }, 800, () => {
                                                PianoRhythm.TRANSITION_OVERLAY.text("");
                                                setTimeout(() => {
                                                    if (PianoRhythm._online && !LOBBY.VISIBLE) {
                                                        setTimeout(() => {
                                                            if (PianoRhythm.LOGIN_ENTERED)
                                                                PianoRhythm.notify("F1 - Toggle Instrument Selection, F2 - Toggle Midi Player, F3 - Recording Track list, F4 - Reverb List.", 10000);
                                                        }, 5000);
                                                    }
                                                }, 1000);
                                            });
                                        }, 250);
                                    });
                                    PianoRhythm.PRELOADER.fadeOut(500, () => {
                                        PianoRhythm.TRANSITION_OVERLAY.fadeIn("slow").text("Loading complete.");
                                        setTimeout(() => {
                                            PianoRhythm.PRELOADER.unwrap();
                                            PianoRhythm.PRELOADER.children().removeClass("preloaderAnimate");
                                            PianoRhythm.PRELOADER.fadeIn("slow");
                                            PianoRhythm.PRELOADER.css({
                                                left: "auto",
                                                top: "auto",
                                                bottom: "10px",
                                                right: "90px",
                                                "z-index": 1001
                                            });
                                        }, 1000);
                                    });
                                }
                            }, 1000 / 60);
                        }
                        let fadeTimer = setInterval(() => {
                            counter += count;
                            let value = "-webkit-gradient(linear, left top, " + counter + "% top,   from(rgba(0,0,0,1)), to(rgba(0,0,0,0)))";
                            $canvas.css("-webkit-mask-image", value);
                            if (counter >= 100) {
                                clearInterval(fadeTimer);
                                if (instrumentLoaded && !timer2Started) {
                                    startTimer2();
                                }
                                else {
                                    (function waitForInstrument() {
                                        if (!instrumentLoaded)
                                            setTimeout(waitForInstrument, 1000);
                                        else {
                                            if (!timer2Started)
                                                startTimer2();
                                        }
                                    })();
                                }
                            }
                        }, 1000 / 60);
                        PianoRhythmDock.reloadSlot(0, true, Piano_1.Piano.INSTRUMENTS["high_quality_acoustic_grand_piano"], () => {
                            count = 2;
                            instrumentLoaded = true;
                        });
                        PianoRhythmDock.setOffsetPosition();
                    });
                }, () => { });
            }, null, 800, null);
        }
    }
    static FOCUS_PIANO(undim = true) {
        if (PianoRhythm.CMESSAGES) {
            PianoRhythm.CLIENT_FOCUS = CLIENT_FOCUS.PIANO;
            PianoRhythm.CHAT_SETTINGS.active = false;
            if (PianoRhythm.WHOISTYPING && PianoRhythm.WHOISTYPING.length)
                PianoRhythm.WHOISTYPING.css({
                    color: "",
                    "z-index": ""
                });
            if (PianoRhythmDock.SEARCH_BAR_INPUT)
                PianoRhythmDock.SEARCH_BAR_INPUT.blur();
            if (!PianoRhythm.ALWAYS_KEEP_CHAT_FOCUS) {
                PianoRhythm.CMESSAGES.css("z-index", 0);
                PianoRhythm.CMESSAGES.css("opacity", 0.5);
            }
            else {
                PianoRhythm.CMESSAGES.css("z-index", 1001);
                PianoRhythm.CMESSAGES.css("opacity", 1);
            }
            PianoRhythm.hideOptionBoxes();
            let zindex = 999;
            if (PianoRhythm.checkMajorElementsDim()) {
                zindex = 1001;
            }
            else {
                switch (PianoRhythm.GAME_MODE) {
                    default:
                        if (Piano_1.Piano.INITIALIZED && !PianoRhythm.MODE_3D)
                            try {
                                if (PianoRhythm.CANVAS_PARENT) {
                                    PianoRhythm.CANVAS_PARENT.style.opacity = (PianoRhythm.ALWAYS_KEEP_CHAT_FOCUS) ? 0.9 : 1;
                                    PianoRhythm.CANVAS_BG.style.opacity = 1;
                                }
                            }
                            catch (err) {
                            }
                        break;
                    case "GUESS_THAT_CHORD":
                        switch (PianoRhythm.GAME_MODE_STATE) {
                            case "pregame":
                                break;
                        }
                        break;
                }
            }
            PianoRhythm.CMESSAGESUL.addClass("noselect");
            PianoRhythm.CMESSAGEINPUT.addClass("noselect");
            PianoRhythm.CMESSAGESUL.css("width", window.innerWidth - PianoRhythm.SIDEBAR_OFFSET - 12);
            PianoRhythm.CMESSAGEINPUTCONTAINER.css("z-index", zindex);
            PianoRhythm.CMESSAGEINPUT.blur();
            if (undim)
                PianoRhythm.dimPage(false);
            wdtEmojiBundle.close();
        }
    }
    static FOCUS_CHAT(index) {
        PianoRhythm.CLIENT_FOCUS = CLIENT_FOCUS.CHAT;
        if (PianoRhythm.CMESSAGESUL)
            PianoRhythm.CMESSAGESUL[0].scrollTop = PianoRhythm.CMESSAGESUL[0].scrollHeight;
        if (PianoRhythm.NEWMESSAGE.is(":visible"))
            PianoRhythm.NEWMESSAGE.css('visibility', 'hidden');
        if (PianoRhythm.WHOISTYPING && PianoRhythm.WHOISTYPING.length)
            PianoRhythm.WHOISTYPING.css({
                color: "white",
                "z-index": "1006"
            });
        PianoRhythm.CMESSAGES.css("opacity", 1);
        PianoRhythm.CMESSAGES.css("z-index", 1005);
        PianoRhythm.CMESSAGEINPUTCONTAINER.css("z-index", 1005);
        PianoRhythm.CMESSAGESUL.css("width", window.innerWidth - PianoRhythm.SIDEBAR_OFFSET - 25);
        PianoRhythm.CMESSAGESUL.removeClass("noselect");
        PianoRhythm.CMESSAGEINPUT.removeClass("noselect");
        if (!PianoRhythm.checkMajorElementsDim()) {
            switch (PianoRhythm.GAME_MODE) {
                default:
                    if (Piano_1.Piano.INITIALIZED || !PianoRhythm.MODE_3D)
                        try {
                            if (PianoRhythm.CANVAS_PARENT && PianoRhythm.CANVAS_PARENT) {
                            }
                        }
                        catch (err) {
                        }
                    break;
                case "GUESS_THAT_CHORD":
                    switch (PianoRhythm.GAME_MODE_STATE) {
                        case "pregame":
                            break;
                    }
                    break;
            }
            PianoRhythm.dimPage(true, index);
        }
        PianoRhythm.hideOptionBoxes();
    }
    static checkMajorElementsDim() {
        return (PianoRhythmPlayer_1.PianoRhythmSelection.GLOBAL_VISIBLE
            || PianoRhythmUpLink.VISIBLE
            || BasicBox.BOX_VISIBLE
            || PianoRhythmPlayer_1.PianoRhythmPlayer.isPLAYING
            || PianoRhythmPlayer_1.PianoRhythmPlayer.isPAUSED != null
            || PianoRhythm.MAIN_PROFILE_VISIBLE);
    }
    static fadeGradient(color_array, callback) {
        let colors = color_array || [[255, 0, 0],
            [0, 255, 0],
            [0, 0, 255],
            [255, 255, 255]];
        let step = 0;
        let colorIndices = [0, 1, 2, 3];
        let gradientSpeed = 0.005;
        function updateGradient() {
            if ($ === undefined)
                return;
            if (!PianoRhythm.BODY)
                return;
            let c0_0 = colors[colorIndices[0]];
            let c0_1 = colors[colorIndices[1]];
            let c1_0 = colors[colorIndices[2]];
            let c1_1 = colors[colorIndices[3]];
            let istep = 1 - step;
            let r1 = Math.round(istep * c0_0[0] + step * c0_1[0]);
            let g1 = Math.round(istep * c0_0[1] + step * c0_1[1]);
            let b1 = Math.round(istep * c0_0[2] + step * c0_1[2]);
            let color1 = "rgb(" + r1 + "," + g1 + "," + b1 + ")";
            let r2 = Math.round(istep * c1_0[0] + step * c1_1[0]);
            let g2 = Math.round(istep * c1_0[1] + step * c1_1[1]);
            let b2 = Math.round(istep * c1_0[2] + step * c1_1[2]);
            let color2 = "rgb(" + r2 + "," + g2 + "," + b2 + ")";
            PianoRhythm.BODY.css({
                background: "-webkit-gradient(linear, left top, right bottom, from(" + color1 + "), to(" + color2 + "))"
            });
            if (LOBBY && LOBBY.lobby) {
                LOBBY.lobby.css({
                    background: "-webkit-gradient(linear, left top, right bottom, from(" + color1 + "), to(" + color2 + "))"
                });
                LOBBY.pianoDiv.css({
                    background: "-webkit-gradient(linear, left top, right bottom, from(" + color1 + "), to(" + color2 + "))"
                });
            }
            step += gradientSpeed;
            if (step >= 1) {
                step %= 1;
                colorIndices[0] = colorIndices[1];
                colorIndices[2] = colorIndices[3];
                colorIndices[1] += 1;
                if (colorIndices[1] >= colors.length)
                    colorIndices[1] = 0;
                colorIndices[3] += 1;
                if (colorIndices[3] >= colors.length)
                    colorIndices[3] = 0;
                if (callback)
                    callback(color1, color2, colorIndices[1], colorIndices[3]);
            }
        }
        let timer = setInterval(updateGradient, 10);
        return timer;
    }
    static setBackground(type = "gradient", color1 = "white", color2 = "#363942", angle = "to bottom right") {
        PianoRhythm.default_background_type = type;
        PianoRhythm.default_background_angle = angle;
        let grad, fadeTimer;
        if (type.toLowerCase() === "gradient") {
            grad = "linear-gradient(" + angle + "," + color1 + " 0%," + color2 + " 100%";
            PianoRhythm.default_background_gradient = grad;
            let oldp1 = pusher.color(PianoRhythm.default_background_color1);
            let oldp2 = pusher.color(PianoRhythm.default_background_color2);
            let p1 = pusher.color(color1);
            let p2 = pusher.color(color2);
            let colorArray = [[oldp1.red(), oldp1.green(), oldp1.blue()],
                [p1.red(), p1.green(), p1.blue()],
                [oldp2.red(), oldp2.green(), oldp2.blue()],
                [p2.red(), p2.green(), p2.blue()]];
            fadeTimer = PianoRhythm.fadeGradient(colorArray, (c1, c2, i1, i2) => {
                if (i1 === 2 && i2 === 0) {
                    clearInterval(fadeTimer);
                    PianoRhythm.default_background_color1 = color1;
                    PianoRhythm.default_background_color2 = color2;
                }
            });
        }
        else {
            PianoRhythm.default_background_color1 = color1;
            clearInterval(fadeTimer);
            PianoRhythm.BODY.css({
                background: PianoRhythm.default_background_color1
            });
            if (LOBBY && LOBBY.lobby)
                LOBBY.lobby.css({ background: PianoRhythm.default_background_color1 });
        }
    }
    static resetBackground() {
        PianoRhythm.setBackground(PianoRhythm.default_background_type);
    }
    static setGlobalColor(color = "#363942") {
        return new Promise((resolve, reject) => {
            let pColor = pusher.color(color), newColor, newColor2, baseColor = pusher.color(PianoRhythm.COLORS.base4).hex6();
            $("*").filter(function () {
                let item = $(this);
                let tagName = item[0].tagName.toLowerCase();
                if (tagName === "script" || tagName === "head" || tagName === "meta" || tagName === "link")
                    return;
                let backgroundColor = item.css("background-color");
                let borderColor = item.css("border-color");
                let textColor = item.css("color");
                let borderBottomColor = item.css("border-bottom-color");
                let p1 = pusher.color(backgroundColor);
                let p2;
                let p3 = pusher.color(textColor);
                let p4 = pusher.color(borderBottomColor);
                let alpha = p1.alpha() || 1;
                newColor = "rgba(" + pColor.red() + "," + pColor.green() + "," + pColor.blue() + "," + alpha + ")";
                try {
                    try {
                        if (borderColor)
                            p2 = pusher.color(borderColor);
                    }
                    catch (err) { }
                    if (p2) {
                        newColor2 = "rgba(" + pColor.red() + "," + pColor.green() + "," + pColor.blue() + "," + p2.alpha() + ")";
                        if (p2.hex6() === baseColor) {
                            item.css("border-color", newColor2);
                        }
                    }
                    if (p1.hex6() === baseColor) {
                        item.css("background-color", newColor);
                    }
                    if (p4.hex6() === baseColor) {
                        item.css("border-bottom-color", newColor);
                    }
                }
                catch (err) {
                    return reject(err);
                }
            });
            $(".basicBox").children().filter(function () {
                let item = $(this);
                if (!item[0].id) {
                    let sideItem = item.children();
                    sideItem.children().filter(function () {
                        let item2 = $(this);
                        item2.css("color", newColor);
                    });
                }
            });
            if (newColor)
                $(".slotsTriangle").css("border-bottom-color", newColor);
            PianoRhythm.COLORS.base4 = pColor.html();
            PianoRhythm.COLORS.UI_unselected = pColor.shade(0.5).html();
            PianoRhythm.COLORS.UI_miniProfileHeader = "rgba(" + pColor.red() + "," + pColor.green() + "," + pColor.blue() + ", 0.85)";
            if (PianoRhythm.NQ_SLIDER_ELEMENT)
                PianoRhythm.NQ_SLIDER_ELEMENT.find("svg").children().eq(1).attr("stroke", pusher.color(PianoRhythm.COLORS.base1).blend("white", 0.15).hex6());
            $("#volumeSlider").css("background-color", pColor.shade(0.2).html());
            resolve(true);
        });
    }
    static loadColorTheme() {
        PianoRhythm.setGlobalColor(PianoRhythm.loadSetting("COLOR", "global_1") || PianoRhythm.COLORS.base4).then(() => {
            PianoRhythm.default_background_type = PianoRhythm.loadSetting("COLOR", "background_type") || PianoRhythm.default_background_type;
            PianoRhythm.setBackground(this.default_background_type, PianoRhythm.loadSetting("COLOR", "background_1") || PianoRhythm.default_background_color1, PianoRhythm.loadSetting("COLOR", "background_2") || PianoRhythm.default_background_color2);
        }, (err) => {
            PianoRhythm.notify("An error has occurred trying to set the global color.");
            console.error(err);
        });
    }
    static goOFFLINE() {
        PianoRhythm.dimPage(false);
        PianoRhythm.notify("YOU ARE NOW IN OFFLINE MODE. NOTEQUOTA HAS BEEN DISABLED!", 15000);
        PianoRhythm.OFFLINE_MODE = true;
        PianoRhythm.disconnect(true);
        for (let t in PianoRhythm.SOCKET._callbacks) {
            PianoRhythm.SOCKET.off(t.replace("$", ""));
        }
        PianoRhythm.SOCKET = null;
        PianoRhythm.CLIENT.socketID = "offline";
        PianoRhythm.CLIENT = new user_1.User();
        PianoRhythm.CMESSAGESUL.empty();
        if (!PianoRhythm.SIDBAR_HIDDEN)
            PianoRhythm.HIDEUI.trigger("click");
    }
    static goONLINE() {
        if (!PianoRhythm.OFFLINE_MODE)
            return;
        if (PianoRhythm.SIDBAR_HIDDEN)
            PianoRhythm.HIDEUI.trigger("click");
        PianoRhythm.dimPage(false);
        PianoRhythm.OFFLINE_MODE = false;
        PianoRhythm.connect(false);
    }
    static logout() {
        if (PianoRhythm.LOGIN_ENTERED) {
            if (PianoRhythm.CLIENT.loggedIn) {
                PianoRhythm.notify({ message: "You have successfully logged out!" });
            }
            PianoRhythm.disconnect();
            PianoRhythm.SOCKET.deauthenticate();
            PianoRhythm.CONTENT.css({ "visibility": "hidden" });
            PianoRhythm.CONTENT.fadeOut("fast");
            PianoRhythm.LOGIN_PAGE.fadeIn();
            PianoRhythm.LOGIN_PAGE.find(".form1").show();
            PianoRhythm.AUTH_TOKEN = null;
            PianoRhythm.deleteSetting("Global_Settings_rod");
            PianoRhythm.deleteSessionSetting("Global_Settings_rod");
            PianoRhythm.CLIENT.name = "Guest";
            PianoRhythm.STATE = IO_STATE.RECONNECTING;
            PianoRhythm.LOGIN_ENTERED = false;
            PianoRhythm.loginTimeout = false;
            PianoRhythm.SOCKET.connect();
            PianoRhythm.SOCKET.emit("playersOnline");
        }
    }
    static disconnect(bypass = false, fromEvent = false) {
        if (PianoRhythm.STATE === IO_STATE.DISCONNECTED)
            return;
        if (PianoRhythm.LOGIN_PAGE)
            PianoRhythm.LOGIN_PAGE.css("filter", "");
        if (PianoRhythm.BODY)
            PianoRhythm.BODY.css("background", "");
        if (PianoRhythm.LOGIN_STATUS) {
            PianoRhythm.LOGIN_STATUS.text("Status: Disconnected.");
            PianoRhythm.LOGIN_STATUS.css("color", "red");
        }
        PianoRhythm.STATE = IO_STATE.DISCONNECTED;
        clearInterval(PianoRhythm.STATS_INTERVAL);
        clearInterval(PianoRhythm.MOUSE_INTERVAL);
        if (PianoRhythm.PING_OBJ)
            PianoRhythm.PING_OBJ.text("Ping: 0");
        PianoRhythm.dimPage(false);
        try {
            PianoRhythm.SOCKET.destroyChannel(PianoRhythm.CLIENT.roomID);
            PianoRhythm.SOCKET.destroyChannel("midi_" + PianoRhythm.CLIENT.roomID);
            PianoRhythm.SOCKET.destroyChannel("mouse_" + PianoRhythm.CLIENT.roomID);
            PianoRhythm.SOCKET.destroyChannel("game_" + PianoRhythm.CLIENT.roomID);
            PianoRhythm.SOCKET.destroyChannel("avatar_" + PianoRhythm.CLIENT.roomID);
            PianoRhythm.mouseChannel = null;
            PianoRhythm.midiChannel = null;
            PianoRhythm.chatChannel = null;
            PianoRhythm.gameChannel = null;
        }
        catch (err) {
        }
        if (PianoRhythm.SOCKET && !fromEvent)
            PianoRhythm.SOCKET.disconnect();
        if (PianoRhythm.CLIENT) {
            $('.qtip_turnQueue').qtip('destroy', true);
            $('.qtip_onlyHost').qtip('destroy', true);
            if (PianoRhythm.PLAYER_SOCKET_LIST)
                PianoRhythm.PLAYER_SOCKET_LIST.clear();
            if (PianoRhythm.PLAYER_ROOM_LIST)
                PianoRhythm.PLAYER_ROOM_LIST.clear();
            PianoRhythm.CHAT_SETTINGS.totalMessages = 0;
            PianoRhythm.CHAT_SETTINGS.oldMessages = 0;
            PianoRhythm.CHAT_SETTINGS.newMessages = 0;
            if (playerMouse.MOUSES)
                playerMouse.MOUSES.map((val) => { val.remove(); });
            $(".mouse_cursor").remove();
            PianoRhythm.saveSessionSetting("DISCONNECT", "lr", PianoRhythm.CLIENT.roomName);
            PianoRhythm.CLIENT.roomID = null;
            PianoRhythm.CLIENT.roomName = null;
            PianoRhythm.OFFLINE_NAME = PianoRhythm.CLIENT.name;
            PianoRhythm.CLIENT.loggedIn = false;
            if (PianoRhythm.NQ_SLIDER)
                $("#prNQ_slider").css("display", "none");
            PianoRhythm.hideMainProfile();
            PianoRhythm.hideMiniProfile();
            if (PianoRhythm.AVATAR_IMAGE_UPLOAD_BOX) {
                PianoRhythm.AVATAR_IMAGE_UPLOAD_BOX.remove();
                PianoRhythm.AVATAR_IMAGE_UPLOAD_BOX = null;
            }
            if (!bypass)
                PianoRhythm.chatMessage({
                    message: "You've disconnected from the server.",
                    name: "Browser"
                });
            if (PianoRhythm.RhythmBlobFactory)
                PianoRhythm.RhythmBlobFactory.stop();
        }
        if (PianoRhythm.PLAYERLIST_UL)
            PianoRhythm.PLAYERLIST_UL.empty();
        if (PianoRhythm.ROOMLIST)
            PianoRhythm.ROOMLIST.empty();
        if (PianoRhythm.FRIENDLIST_UL) {
            PianoRhythm.FRIENDLIST_UL.empty();
        }
    }
    static gameIsPlaying() {
        return (GAMESTATE && GAMESTATE.initialized && GAMESTATE.ACTIVE_STATE !== null);
    }
    static updateTyping() {
        if (!PianoRhythm.USER_IS_TYPING) {
            PianoRhythm.USER_IS_TYPING = true;
            if (PianoRhythm && PianoRhythm.CLIENT && PianoRhythm.chatChannel)
                PianoRhythm.chatChannel.publish({
                    type: "isTyping",
                    value: true,
                    id: PianoRhythm.SOCKET.id,
                    uuid: PianoRhythm.CLIENT.id,
                    name: PianoRhythm.CLIENT.name
                });
            if (PianoRhythm.RhythmBlobFactory) {
                if (PianoRhythm.RhythmBlobFactory.getClientBlob())
                    PianoRhythm.RhythmBlobFactory.getClientBlob().isTalking = true;
            }
        }
        PianoRhythm.USER_LAST_TYPING_TIME = Date.now();
        setTimeout(function () {
            let typingTimer = Date.now();
            let timeDiff = typingTimer - PianoRhythm.USER_LAST_TYPING_TIME;
            if (timeDiff >= PianoRhythm.TYPING_TIMER_LENGTH &&
                PianoRhythm.USER_IS_TYPING) {
                PianoRhythm.USER_IS_TYPING = false;
                if (PianoRhythm.RhythmBlobFactory) {
                    if (PianoRhythm.RhythmBlobFactory.getClientBlob())
                        PianoRhythm.RhythmBlobFactory.getClientBlob().isTalking = false;
                }
                if (PianoRhythm && PianoRhythm.CLIENT && PianoRhythm.chatChannel)
                    PianoRhythm.chatChannel.publish({
                        type: "isTyping",
                        value: false,
                        id: PianoRhythm.SOCKET.id,
                        uuid: PianoRhythm.CLIENT.id,
                        name: PianoRhythm.CLIENT.name
                    });
            }
        }, PianoRhythm.TYPING_TIMER_LENGTH);
    }
    static updateRoom(roomObject, BUTTON, callback) {
        if (PianoRhythm.SOCKET) {
            PianoRhythm.SOCKET.emit("updateRoom", roomObject, (err, data) => {
                if (data !== undefined) {
                    PianoRhythm.notify("The channel " + roomObject.name + " was successfully updated!");
                    if (callback)
                        callback(data);
                }
                else {
                    PianoRhythm.notify("An error has occurred trying to update room " + roomObject.name);
                }
            });
        }
    }
    static leaveRoom(roomName) {
        if (PianoRhythm.SOCKET) {
            PianoRhythm.SOCKET.emit("leaveRoom", {
                roomName: roomName,
                roomID: PianoRhythm.CLIENT.roomID
            });
        }
    }
    static joinRoom(roomName = "lobby", roomID, extra) {
        if (PianoRhythm.SOCKET) {
            if (extra && extra.li)
                delete extra.li;
            PianoRhythm.SOCKET.emit("joinRoom", {
                roomName: roomName,
                ID: roomID,
                other: extra
            }, (err, result) => {
                if (err) {
                    let existingRoom = PianoRhythm.ROOMLIST.find("[data-id='" + result.id + "']");
                    if (existingRoom)
                        existingRoom.remove();
                    PianoRhythm.PLAYER_ROOM_LIST.delete(result.id);
                }
            });
        }
    }
    static ownerOfRoom(owner, settings) {
        if (PianoRhythm.ROOMSETTINGSBUTTON && owner.length > 0)
            if (owner === PianoRhythm.SOCKET.id) {
                PianoRhythm.ROOMSETTINGSBUTTON.show();
                PianoRhythm.ROOMSETTINGSBUTTON.css("display", "table-cell");
                if (settings) {
                    console.warn("SAVING ROOM SETTINGS", settings);
                    if (settings.status && settings.status !== "LOBBY")
                        PianoRhythm.saveRoomSettings(settings);
                }
            }
            else {
                PianoRhythm.ROOMSETTINGSBUTTON.css("display", "none");
                PianoRhythm.ROOMSETTINGSBUTTON.hide();
                if (PianoRhythm.ROOM_SETTINGS_BOX) {
                    PianoRhythm.ROOM_SETTINGS_BOX.remove();
                    PianoRhythm.ROOM_SETTINGS_BOX = null;
                }
                PianoRhythm.deleteRoomSettings();
            }
    }
    static createRoom(roomObject, BUTTON, callback) {
        if (PianoRhythm.SOCKET) {
            PianoRhythm.SOCKET.emit("createRoom", roomObject, (err, data) => {
                if (data.create === 1) {
                    PianoRhythm.notify("The channel " + roomObject.name + " was successfully created!");
                    if (callback)
                        callback(data);
                }
                else if (data.create === 0) {
                    PianoRhythm.notify("An error has occurred trying to create room " + roomObject.name + ". Please make sure the name" +
                        " doesn't contain any special characters!");
                }
            });
        }
    }
    static loadRoom(data, nr_SlotMode, instArray) {
        if (!PianoRhythmDock.INITIALIZED && PianoRhythm.EVENT_EMITTER) {
            PianoRhythm.EVENT_EMITTER.once("dockLoaded", () => {
                PianoRhythm.loadRoom(data, nr_SlotMode, instArray);
            });
            return;
        }
        if (!instArray && data && data.instruments && data.instruments.length > 0)
            instArray = data.instruments;
        if (!instArray || (instArray && instArray.length <= 0))
            instArray = [Piano_1.Piano.DEFAULT_INSTRUMENT];
        if (PianoRhythm.DEBUG_MESSAGING)
            console.info("Loading Room Instruments", PianoRhythm.CLIENT, data);
        let reloadInstruments = true;
        if (PianoRhythmDock.INITIALIZED) {
            let incomingSet = new Set(instArray);
            let currentSet = new Set(PianoRhythmDock.getInstrumentsFromSlots());
            let diff = incomingSet["difference"](currentSet);
            if (diff.size < 1 && data.instruments != null)
                reloadInstruments = false;
        }
        if (instArray && instArray.length > 0) {
            if (reloadInstruments) {
                PianoRhythmDock.removeAllSlots(true);
                let growlDiv = null;
                PianoRhythm.createGrowl("Loading Instrument(s)... ", null, {
                    target: $(window),
                    noClick: true,
                    persistent: true,
                    style: "qtip_onlyHost",
                    my: "top center",
                    at: "right bottom",
                    getDiv: (div) => {
                        growlDiv = div;
                    },
                    adjust: {
                        x: -225,
                        y: -150,
                    },
                });
                let promises = [];
                let count = 0;
                for (let p = 0; p < instArray.length; p++) {
                    let instrument = Piano_1.Piano.INSTRUMENTS[instArray[p]];
                    if (instrument) {
                        promises.push(function () {
                            PianoRhythmDock.reloadSlot(p, true, instrument).then(() => {
                                if (growlDiv) {
                                    count++;
                                    growlDiv.qtip('option', 'content.text', count + " / " + instArray.length + " instrument(s) loaded.");
                                    if (count >= instArray.length) {
                                        setTimeout(() => {
                                            growlDiv.fadeOut(() => {
                                                growlDiv.remove();
                                            });
                                        }, 1000);
                                    }
                                }
                            });
                        });
                    }
                }
                if (promises.length > 0) {
                    function pseries(list) {
                        var p = Promise.resolve();
                        return list.reduce(function (pacc, fn) {
                            return pacc = pacc.then(fn);
                        }, p);
                    }
                    pseries(promises);
                }
            }
        }
        else {
            if (Piano_1.Piano.INSTRUMENTS[Piano_1.Piano.ACTIVE_INSTRUMENT]) {
                PianoRhythmDock.removeAllSlots(true);
                PianoRhythmDock.reloadSlot(0, true, Piano_1.Piano.INSTRUMENTS[Piano_1.Piano.ACTIVE_INSTRUMENT]);
            }
        }
        if (data) {
            if (data.owner === PianoRhythm.SOCKET.id) {
                PianoRhythm.ROOM_INSTRUMENTS = instArray;
                if (PianoRhythm.ROOM_SETTINGS_INSTRUMENT_SELECT)
                    PianoRhythm.ROOM_SETTINGS_INSTRUMENT_SELECT.val(PianoRhythm.ROOM_INSTRUMENTS).trigger("change");
            }
            if (data.updatedBy && data.updatedBy !== PianoRhythm.CLIENT.name)
                PianoRhythm.notify({
                    message: data.updatedBy + " has updated the room!"
                });
            if (data.allowedKBLayout != null && data.allowedKBLayout != undefined)
                PianoRhythm.setKeyboardLayout(data.allowedKBLayout);
            if (data.allowRecording != null && data.allowRecording != undefined)
                PianoRhythm.ROOM_SETTINGS.ALLOW_RECORDING = data.allowRecording;
            if (data.allowedTool != null && data.allowedTool != undefined)
                PianoRhythm.ROOM_SETTINGS.ALLOWED_TOOL = data.allowedTool;
            if (data.allowBotMessage != null && data.allowBotMessage != undefined)
                PianoRhythm.ROOM_SETTINGS.ALLOW_BOT_MESSAGES = data.allowBotMessage;
        }
        if (PianoRhythmDock.SLOT_MODE_BUTTON && nr_SlotMode !== undefined && PianoRhythmDock.CURRENT_SLOT_MODE !== nr_SlotMode) {
            PianoRhythmDock.CURRENT_SLOT_MODE = (nr_SlotMode <= 0) ? SLOT_MODE.PIANO_8 : nr_SlotMode - 1;
            PianoRhythmDock.SLOT_MODE_BUTTON.trigger("click");
        }
    }
    static setButtonActive(button, bool = true, color = "white", textColor = PianoRhythm.COLORS.base4, border = false) {
        if (PianoRhythm && PianoRhythm.BOTTOM_BAR_OPTIONS) {
            PianoRhythm.BOTTOM_BAR_OPTIONS.children().attr("data-clicked", "false");
            PianoRhythm.BOTTOM_BAR_OPTIONS.children().css({
                background: "",
                color: "",
                "border-left": "",
                "border-right": ""
            });
            if (button) {
                button.attr("data-clicked", bool);
                if (bool) {
                    let borderCSS = "white 3px solid";
                    button.css("background", color);
                    button.css("color", textColor);
                    if (PianoRhythm.CMESSAGES && PianoRhythm.CMESSAGES.length) {
                        PianoRhythm.CMESSAGES.css("z-index", 0);
                        PianoRhythm.CMESSAGES.css("opacity", 0.5);
                        PianoRhythm.CMESSAGEINPUTCONTAINER.css("z-index", 0);
                    }
                    let zindex = 999;
                    if (PianoRhythmPlayer_1.PianoRhythmSelection.GLOBAL_VISIBLE || BasicBox.BOX_VISIBLE || (PianoRhythmPlayer_1.PianoRhythmPlayer.isPLAYING && PianoRhythmPlayer_1.PianoRhythmPlayer.isPAUSED != null)) {
                        zindex = 998;
                    }
                    PianoRhythm.dimPage(true, zindex);
                }
                else {
                    if (bool === false)
                        PianoRhythm.FOCUS_PIANO();
                    button.css({
                        background: "",
                        color: "",
                        "border-left": "",
                        "border-right": ""
                    });
                }
            }
        }
    }
    static hideOptionBoxes(box) {
        if (PianoRhythm.NEW_ROOM_BOX && PianoRhythm.NEW_ROOM_BOX.visible && box !== PianoRhythm.NEW_ROOM_BOX) {
            PianoRhythm.setButtonActive(PianoRhythm.NEWROOMBUTTON, null);
            PianoRhythm.NEW_ROOM_BOX.hide(true);
        }
        if (PianoRhythm.OPTIONS_BOX && PianoRhythm.OPTIONS_BOX.visible && box !== PianoRhythm.OPTIONS_BOX) {
            PianoRhythm.setButtonActive(PianoRhythm.OPTIONSBUTTON, null);
            PianoRhythm.OPTIONS_BOX.hide(true);
        }
        if (PianoRhythm.MIDI_BOX && PianoRhythm.MIDI_BOX.visible && box !== PianoRhythm.MIDI_BOX) {
            PianoRhythm.setButtonActive(PianoRhythm.MIDIOPTIONSBUTTON, null);
            PianoRhythm.MIDI_BOX.hide(true);
        }
        if (PianoRhythm.ROOM_SETTINGS_BOX && PianoRhythm.ROOM_SETTINGS_BOX.visible && box !== PianoRhythm.ROOM_SETTINGS_BOX) {
            PianoRhythm.setButtonActive(PianoRhythm.ROOMSETTINGSBUTTON, null);
            PianoRhythm.ROOM_SETTINGS_BOX.hide(true);
        }
        PianoRhythm.setButtonActive(PianoRhythm.QUITGAMEBUTTON, null);
        PianoRhythm.dimPage(false);
    }
    static displayTypers() {
        if (PianoRhythm.WHOISTYPING && PianoRhythm.WHOISTYPING.length) {
            let tempArray = [];
            let maxShown = 3;
            let finalMessage = "";
            for (let i = 0; i < maxShown; i++) {
                let tempName = PianoRhythm.WHO_IS_TYPING[i];
                if (tempName)
                    tempArray.push(tempName);
            }
            let namesLeftAmount = PianoRhythm.WHO_IS_TYPING.length - tempArray.length;
            finalMessage = tempArray.join(", ") + ((namesLeftAmount >= 1) ?
                (" and " + namesLeftAmount + " other(s) are typing...") : tempArray.length == 1 ? " is typing..." : " are typing...");
            if (PianoRhythm.WHO_IS_TYPING.length == 0)
                finalMessage = "";
            PianoRhythm.WHOISTYPING.text(finalMessage);
        }
    }
    static tutorial1() {
        PianoRhythm.currentTutorial = 1;
        let tut = [
            {
                text: "Welcome to PianoRhythm! I hope you enjoy your stay here! <span class='icon-smile2'></span>",
                options: {
                    target: $(window),
                    my: "center center",
                    at: "center right",
                    adjust: {
                        x: -300,
                        y: -200
                    },
                }
            },
            {
                text: "This bad boy is the piano. You can play it by using your <span style='color:lime'>mouse</span>, " +
                    " <span style='color:lime'>keyboard</span>, and/or" +
                    "  <span style='color:lime'>midi device</span>!",
                options: {
                    target: $(window),
                    my: "center center",
                    at: "center center",
                    adjust: {
                        y: -50
                    }
                }
            },
            {
                text: "You can control the sustain pedal by using the <span style='color:yellow'>SPACEBAR</span>!",
                options: {
                    target: $(window),
                    my: "center center",
                    at: "center center",
                    adjust: {
                        y: -50
                    }
                }
            },
            {
                text: "<span class='icon-arrow-down2'></span> This is the <span style='color:deepskyblue'>instrument dock</span>. " +
                    "You can change the <span style='color:mediumspringgreen'>transpose</span>, <span style='color:mediumspringgreen'>octave</span>, " +
                    "and even <span style='color:mediumspringgreen'>load different instruments</span>!",
                options: {
                    target: PianoRhythmDock.DOCK_SLOTS,
                    at: "top left",
                    my: "left bottom",
                    width: 400,
                    adjust: {
                        y: -50
                    }
                }
            },
            {
                text: "You can find out more by starting " +
                    "<span style='color:cyan'>Tutoral 2</span> at <span style='color:yellow'>Options > Misc > Tutorials > Tutorial 2</span>",
                options: {
                    target: PianoRhythmDock.DOCK_SLOTS,
                    at: "top left",
                    my: "left bottom",
                    width: 300,
                    adjust: {
                        y: -50
                    }
                }
            },
            {
                text: "Chat with people by entering your message down here! <span class='icon-arrow-down'></span>",
                options: {
                    target: PianoRhythm.CMESSAGEINPUT,
                    at: "top left",
                    adjust: {
                        y: -50
                    }
                }
            },
            {
                text: "<span class='icon-arrow-down2'></span> Down here is the toolbar. You can adjust the volume, create your own room, and many other things!",
                options: {
                    target: PianoRhythm.BOTTOM_BAR,
                    at: "top left",
                    onOpen: (life) => {
                        PianoRhythm.CLIENT_FOCUS = CLIENT_FOCUS.BOTTOMBAR;
                        PianoRhythm.dimPage(true);
                        setTimeout(() => {
                            PianoRhythm.dimPage(false);
                        }, life);
                    },
                    onDestroy: () => {
                        PianoRhythm.dimPage(false);
                    },
                    adjust: {
                        y: -50
                    }
                }
            },
            {
                text: "That icon on the bottom right is the <span style='color:yellow'>PianoRhythm Uplink</span>. You can find the latest news, read your mail and accept friend requests there! <span class='icon-arrow-right'></span>",
                options: {
                    target: PianoRhythm.PR_ICON,
                    width: 380,
                    lifeSpan: 7000,
                    my: "bottom right",
                    at: "top left",
                    adjust: {
                        y: -40,
                        x: 10
                    }
                }
            },
            {
                text: "<span class='icon-arrow-left2'></span> This side bar has <span style='color:#f7ff00'>tabs</span> that shows the lists of the " +
                    "current <span style='color:lime'>users</span> in your room, " +
                    "your <span style='color:lime'>friends</span>, and " +
                    "all of the available <span style='color:lime'>rooms</span>!",
                options: {
                    target: PianoRhythm.ROOMSBUTTON,
                    width: 310,
                    onOpen: (life) => {
                        if (PianoRhythm.SIDBAR_HIDDEN) {
                            PianoRhythm.HIDEUI.trigger("click");
                            setTimeout(() => {
                                PianoRhythm.HIDEUI.trigger("click");
                            }, life);
                        }
                    },
                    my: "left center",
                    at: "top right",
                    adjust: {
                        y: 100,
                        x: 10
                    },
                }
            },
            {
                text: "That's all for the basic navigation around here! There will be more tutorials soon. You can check them out by going " +
                    "to <span style='color:yellow'>Options > Misc > Tutorials</span>",
                options: {
                    target: $(window),
                    width: 420,
                    my: "center center",
                    at: "center center",
                    lifeSpan: 10000,
                    adjust: {
                        x: 50,
                        y: -150
                    }
                }
            },
        ];
        return tut;
    }
    static tutorial2() {
        PianoRhythm.currentTutorial = 2;
        let tut = [
            {
                text: "Welcome to PianoRhythm! This mini tutorial will cover the <span style='color:cyan'>instrument dock</span> " +
                    "and how to play different instruments! <span class='icon-smile2'></span>",
                options: {
                    target: $(window),
                    width: 380,
                    my: "center center",
                    at: "center right",
                    adjust: {
                        x: -300,
                        y: -220
                    },
                }
            },
            {
                text: "<span class='icon-arrow-down2'></span> This is the <span style='color:deepskyblue'>instrument dock</span>. " +
                    "You can change the <span style='color:mediumspringgreen'>transpose</span>, <span style='color:mediumspringgreen'>octave</span>, " +
                    "and even <span style='color:mediumspringgreen'>load different instruments</span>!",
                options: {
                    target: PianoRhythmDock.DOCK_SLOTS,
                    at: "top left",
                    my: "left bottom",
                    width: 400,
                    onOpen: () => {
                        if (PianoRhythmDock.DOCK_SLOTS && PianoRhythmDock.DOCK_SLOTS.length) {
                            PianoRhythmDock.DOCK_SLOTS.css("opacity", "1");
                        }
                    },
                    onDestroy: () => {
                        if (PianoRhythmDock.DOCK_SLOTS && PianoRhythmDock.DOCK_SLOTS.length) {
                            PianoRhythmDock.DOCK_SLOTS.css("opacity", "");
                        }
                    },
                    adjust: {
                        y: -50
                    }
                }
            },
            {
                text: "You can tranpose (change pitch) the piano keys by pressing the <span style='color:lime'>up and down arrows</span> on the Transpose input. To reset the value (Default: 0), just press" +
                    " on the word 'Tranpose'.",
                options: {
                    target: PianoRhythmDock.TRANSPOSE,
                    at: "top left",
                    my: "left bottom",
                    lifeSpan: 7000,
                    width: 500,
                    onOpen: () => {
                        if (PianoRhythmDock.TRANSPOSE && PianoRhythmDock.TRANSPOSE.length) {
                            PianoRhythmDock.TRANSPOSE.css("opacity", "1");
                        }
                    },
                    onDestroy: () => {
                        if (PianoRhythmDock.TRANSPOSE && PianoRhythmDock.TRANSPOSE.length) {
                            PianoRhythmDock.TRANSPOSE.css("opacity", "");
                        }
                    },
                    adjust: {
                        y: -5
                    }
                }
            },
            {
                text: "The same functionality of the Tranpose applies to " +
                    "the <span style='color:lime'>Octave</span>  (add/subtract <span style='color:yellow'>8</span> note values from your current key) input, " +
                    "except its default value is 3!",
                options: {
                    target: PianoRhythmDock.OCTAVE,
                    at: "top left",
                    my: "left bottom",
                    lifeSpan: 6000,
                    width: 500,
                    onOpen: () => {
                        if (PianoRhythmDock.OCTAVE && PianoRhythmDock.OCTAVE.length) {
                            PianoRhythmDock.OCTAVE.css("opacity", "1");
                        }
                    },
                    onDestroy: () => {
                        if (PianoRhythmDock.OCTAVE && PianoRhythmDock.OCTAVE.length) {
                            PianoRhythmDock.OCTAVE.css("opacity", "");
                        }
                    },
                    adjust: {
                        y: -5
                    }
                }
            },
            {
                text: "This is the <span style='color:cyan'>instrument and midi file search</span> bar. " +
                    "You can search through a list of instruments and midi files to load! <span class='icon-arrow-down2'></span>",
                options: {
                    target: PianoRhythmDock.SEARCH_BAR_SELECT,
                    at: "top left",
                    my: "left bottom",
                    lifeSpan: 6000,
                    width: 400,
                    onOpen: () => {
                        if (PianoRhythmDock.SEARCH_BAR_SELECT && PianoRhythmDock.SEARCH_BAR_SELECT.length) {
                            PianoRhythmDock.SEARCH_BAR_SELECT.css("opacity", "1");
                        }
                    },
                    onDestroy: () => {
                        if (PianoRhythmDock.SEARCH_BAR_SELECT && PianoRhythmDock.SEARCH_BAR_SELECT.length) {
                            PianoRhythmDock.SEARCH_BAR_SELECT.css("opacity", "");
                        }
                    },
                    adjust: {
                        y: -5
                    }
                }
            },
            {
                text: "<span class='icon-arrow-left2'></span> This is the <span style='color:cyan'>slot mode gear</span>. You can click on this to change the channel mode for the different slots! " +
                    "Start <span style='color:yellow'>Tutorial 3</span> to find out more! ",
                options: {
                    target: PianoRhythmDock.SLOT_MODE_BUTTON,
                    at: "center right",
                    my: "center left",
                    lifeSpan: 6000,
                    width: 400,
                    onOpen: () => {
                        if (PianoRhythmDock.SLOT_MODE_BUTTON && PianoRhythmDock.SLOT_MODE_BUTTON.length) {
                            PianoRhythmDock.SLOT_MODE_BUTTON.css({
                                border: "3px solid red"
                            });
                            PianoRhythmDock.DOCK_SLOTS.css("opacity", "1");
                        }
                    },
                    onDestroy: () => {
                        if (PianoRhythmDock.SLOT_MODE_BUTTON && PianoRhythmDock.SLOT_MODE_BUTTON.length) {
                            PianoRhythmDock.SLOT_MODE_BUTTON.css({
                                border: ""
                            });
                            PianoRhythmDock.DOCK_SLOTS.css("opacity", "");
                        }
                    },
                    adjust: {
                        y: -5
                    }
                }
            },
            {
                text: "That's all for this tutorial on the basics of the instrument dock! There will be more tutorials soon. You can check them out by going " +
                    "to <span style='color:yellow'>Options > Misc > Tutorials</span>",
                options: {
                    target: $(window),
                    width: 420,
                    my: "center center",
                    at: "center center",
                    lifeSpan: 10000,
                    adjust: {
                        x: 50,
                        y: -150
                    }
                }
            },
        ];
        return tut;
    }
    static tutorial3() {
        PianoRhythm.currentTutorial = 3;
        let tut = [
            {
                text: "Welcome to PianoRhythm! This mini tutorial will cover the <span style='color:cyan'>instrument dock and the channel slots</span> " +
                    " in detail! <span class='icon-smile'></span>",
                options: {
                    target: $(window),
                    width: 380,
                    my: "center center",
                    at: "center right",
                    adjust: {
                        x: -300,
                        y: -220
                    },
                }
            },
            {
                text: "<span class='icon-arrow-down2'></span> As you may recall, this is the <span style='color:deepskyblue'>instrument dock</span>!",
                options: {
                    target: PianoRhythmDock.DOCK_SLOTS,
                    at: "top left",
                    my: "left bottom",
                    onOpen: () => {
                        if (PianoRhythmDock.DOCK_SLOTS && PianoRhythmDock.DOCK_SLOTS.length)
                            PianoRhythmDock.DOCK_SLOTS.css("opacity", "1");
                    },
                    adjust: {
                        y: -50
                    }
                }
            },
            {
                text: "The <span style='color:deepskyblue'>instrument dock</span> has 8 slots. Each one can contain a different instrument.",
                options: {
                    target: PianoRhythmDock.DOCK_SLOTS,
                    at: "top left",
                    my: "left bottom",
                    onOpen: () => {
                        if (PianoRhythmDock.DOCK_SLOTS && PianoRhythmDock.DOCK_SLOTS.length)
                            PianoRhythmDock.DOCK_SLOTS.css("opacity", "1");
                    },
                    adjust: {
                        y: -50
                    }
                }
            },
            {
                text: "Let's begin by showing all of the available instruments!",
                options: {
                    target: PianoRhythmDock.DOCK_SLOTS,
                    at: "top left",
                    my: "left bottom",
                    lifeSpan: 3000,
                    onOpen: () => {
                        setTimeout(() => {
                            if (PianoRhythm.INSTRUMENT_SELECTION) {
                                PianoRhythm.INSTRUMENT_SELECTION.show();
                            }
                            if (PianoRhythmPlayer_1.PianoRhythmPlayer.MIDI_SELECTION)
                                PianoRhythmPlayer_1.PianoRhythmPlayer.MIDI_SELECTION.hide();
                        }, 300);
                    },
                    adjust: {
                        y: -50
                    }
                }
            },
            {
                text: "Gosh golly! Look at all of these instruments!",
                options: {
                    target: PianoRhythm.INSTRUMENT_SELECTION.stage,
                    at: "top left",
                    my: "top right",
                    lifeSpan: 8000,
                    onOpen: () => {
                        if (PianoRhythm.INSTRUMENT_SELECTION && PianoRhythm.INSTRUMENT_SELECTION.stage && PianoRhythm.INSTRUMENT_SELECTION.stage.length) {
                            var stage = PianoRhythm.INSTRUMENT_SELECTION.stage;
                            stage.animate({ scrollTop: 600 }, 10000);
                        }
                    },
                    adjust: {
                        y: 50,
                        x: 150
                    }
                }
            },
            {
                text: "Right now, most of these instruments haven't been loaded on to the site yet. A loaded instrument will turn  <span style='color:lime'>green</span>." +
                    " One way to <span style='color:lime'>load</span> it is simply by <span style='color:yellow'>clicking on the instrument</span>.",
                options: {
                    target: PianoRhythm.INSTRUMENT_SELECTION.stage,
                    at: "top left",
                    my: "top right",
                    lifeSpan: 8000,
                    width: 400,
                    onOpen: () => {
                    },
                    adjust: {
                        y: 100,
                        x: 125
                    }
                }
            },
            {
                text: "You can also <span style='color:cyan'>auto load an instrument by dragging the instrument</span>  item into one of the Instrument Dock Slots. So, for the instrument item just " +
                    "<span style='color:yellow'>Click > Hold & Drag > Instrument Dock Slot</span>",
                options: {
                    target: PianoRhythm.INSTRUMENT_SELECTION.stage,
                    at: "top left",
                    my: "top right",
                    lifeSpan: 8000,
                    width: 400,
                    adjust: {
                        y: 120,
                        x: 100
                    }
                }
            },
            {
                text: "So as you drag the instrument item over one of the slots, it should be reacting like this. " +
                    "It looks very hungry. It needs to be fed! <span class='icon-evil'></span>",
                options: {
                    target: PianoRhythmDock.DOCK_SLOTS,
                    at: "top left",
                    my: "left bottom",
                    lifeSpan: 7000,
                    width: 380,
                    onOpen: () => {
                        if (PianoRhythmDock.DOCK_SLOTS && PianoRhythmDock.DOCK_SLOTS.length)
                            PianoRhythmDock.DOCK_SLOTS.css("opacity", "1");
                        var element = PianoRhythmDock.DOCK_SLOT_ELEMENTS[1];
                        if (element && element.length)
                            element.addClass("beat");
                    },
                    onDestroy: () => {
                        var element = PianoRhythmDock.DOCK_SLOT_ELEMENTS[1];
                        if (element && element.length)
                            element.removeClass("beat");
                    },
                    adjust: {
                        y: -50
                    }
                }
            },
            {
                text: "Currently, the slot mode is: <span style='color:cyan'>SINGLE</span>. " +
                    "That means that the only sounds that can be heard will only come from a single instrument that's <span style='color:lime'>ACTIVE</span>. Click on the instrument in the slot to see the available actions with it.",
                options: {
                    target: PianoRhythmDock.DOCK_SLOTS,
                    at: "top left",
                    my: "left bottom",
                    lifeSpan: 7000,
                    width: 400,
                    onOpen: () => {
                        if (PianoRhythmDock.DOCK_SLOTS && PianoRhythmDock.DOCK_SLOTS.length)
                            PianoRhythmDock.DOCK_SLOTS.css("opacity", "1");
                        var element = PianoRhythmDock.DOCK_SLOT_ELEMENTS[0];
                        if (element && element.length)
                            element.addClass("beat");
                    },
                    onDestroy: () => {
                        var element = PianoRhythmDock.DOCK_SLOT_ELEMENTS[0];
                        if (element && element.length)
                            element.removeClass("beat");
                    },
                    adjust: {
                        y: -50
                    }
                }
            },
            {
                text: "<span class='icon-arrow-left2'></span> By clicking on the <span style='color:cyan'>slot mode gear</span> you can change the different modes!",
                options: {
                    target: PianoRhythmDock.SLOT_MODE_BUTTON,
                    at: "center right",
                    my: "center left",
                    lifeSpan: 6000,
                    width: 400,
                    onOpen: () => {
                        if (PianoRhythmDock.SLOT_MODE_BUTTON && PianoRhythmDock.SLOT_MODE_BUTTON.length) {
                            PianoRhythmDock.SLOT_MODE_BUTTON.css({
                                border: "3px solid red"
                            });
                            if (PianoRhythmDock.DOCK_SLOTS && PianoRhythmDock.DOCK_SLOTS.length)
                                PianoRhythmDock.DOCK_SLOTS.css("opacity", "1");
                        }
                    },
                    onDestroy: () => {
                        if (PianoRhythmDock.SLOT_MODE_BUTTON && PianoRhythmDock.SLOT_MODE_BUTTON.length) {
                            PianoRhythmDock.SLOT_MODE_BUTTON.css({
                                border: ""
                            });
                            if (PianoRhythmDock.DOCK_SLOTS && PianoRhythmDock.DOCK_SLOTS.length)
                                PianoRhythmDock.DOCK_SLOTS.css("opacity", "");
                        }
                    },
                    adjust: {
                        y: -5
                    }
                }
            },
            {
                text: "So after SINGLE, the next Slot Mode is: <span style='color:lime'>MULTI</span> mode. This mode is mostly used when playing a midi file." +
                    " Each colored slot corrosponds to a different midi track from the file. Most piano midi files only have 2 tracks!",
                options: {
                    target: PianoRhythmDock.DOCK_SLOTS,
                    at: "top left",
                    my: "left bottom",
                    lifeSpan: 8000,
                    width: 450,
                    onOpen: () => {
                        if (PianoRhythmDock.DOCK_SLOTS && PianoRhythmDock.DOCK_SLOTS.length)
                            PianoRhythmDock.DOCK_SLOTS.css("opacity", "1");
                        if (PianoRhythmDock.SLOT_MODE_BUTTON && PianoRhythmDock.SLOT_MODE_BUTTON.length) {
                            PianoRhythm.CURRENT_SLOT_MODE = SLOT_MODE.SINGLE;
                            PianoRhythm.SLOT_MODE_BUTTON.trigger("click");
                        }
                    },
                    adjust: {
                        y: -50
                    }
                }
            },
            {
                text: "This Slot Mode is: <span style='color:lime'>PIANO 2</span> mode. This mode reserves the first two slots from the instrument dock " +
                    " for any instrument! So, as you can see from the keys of the piano, the green and blue portion corrosponds to slots 1 and 2, respectively. ",
                options: {
                    target: PianoRhythmDock.DOCK_SLOTS,
                    at: "top left",
                    my: "left bottom",
                    lifeSpan: 8000,
                    width: 450,
                    onOpen: () => {
                        if (PianoRhythmDock.DOCK_SLOTS && PianoRhythmDock.DOCK_SLOTS.length)
                            PianoRhythmDock.DOCK_SLOTS.css("opacity", "1");
                        if (PianoRhythmDock.SLOT_MODE_BUTTON && PianoRhythmDock.SLOT_MODE_BUTTON.length) {
                            PianoRhythmDock.CURRENT_SLOT_MODE = SLOT_MODE.MULTI;
                            PianoRhythmDock.SLOT_MODE_BUTTON.trigger("click");
                        }
                    },
                    adjust: {
                        y: -50
                    }
                }
            },
            {
                text: "After PIANO 2, the next Slot Mode is: <span style='color:lime'>PIANO 4</span> mode. You probably already figured it out that it functions " +
                    "just like the previous mode but it just uses more slots!",
                options: {
                    target: PianoRhythmDock.DOCK_SLOTS,
                    at: "top left",
                    my: "left bottom",
                    lifeSpan: 6000,
                    width: 450,
                    onOpen: () => {
                        if (PianoRhythmDock.DOCK_SLOTS && PianoRhythmDock.DOCK_SLOTS.length)
                            PianoRhythmDock.DOCK_SLOTS.css("opacity", "1");
                        if (PianoRhythmDock.SLOT_MODE_BUTTON && PianoRhythmDock.SLOT_MODE_BUTTON.length) {
                            PianoRhythmDock.CURRENT_SLOT_MODE = SLOT_MODE.PIANO_2;
                            PianoRhythmDock.SLOT_MODE_BUTTON.trigger("click");
                        }
                    },
                    adjust: {
                        y: -50
                    }
                }
            },
            {
                text: "The last Slot Mode is: <span style='color:lime'>PIANO 8</span> mode.",
                options: {
                    target: PianoRhythmDock.DOCK_SLOTS,
                    at: "top left",
                    my: "left bottom",
                    lifeSpan: 4000,
                    width: 450,
                    onOpen: () => {
                        if (PianoRhythmDock.DOCK_SLOTS && PianoRhythmDock.DOCK_SLOTS.length)
                            PianoRhythmDock.DOCK_SLOTS.css("opacity", "1");
                        if (PianoRhythmDock.SLOT_MODE_BUTTON && PianoRhythmDock.SLOT_MODE_BUTTON.length) {
                            PianoRhythmDock.CURRENT_SLOT_MODE = SLOT_MODE.PIANO_4;
                            PianoRhythmDock.SLOT_MODE_BUTTON.trigger("click");
                        }
                    },
                    adjust: {
                        y: -50
                    }
                }
            },
            {
                text: "Also, you can click on the instrument slots to find more options. You can" +
                    " <span style='color:yellow'>Favorite, Mute, and finally open the instruments list</span> from any of the slots.",
                options: {
                    target: PianoRhythmDock.DOCK_SLOTS,
                    at: "top left",
                    my: "left bottom",
                    lifeSpan: 7000,
                    width: 450,
                    onOpen: () => {
                        if (PianoRhythmDock.SLOT_MODE_BUTTON && PianoRhythmDock.SLOT_MODE_BUTTON.length) {
                            PianoRhythmDock.CURRENT_SLOT_MODE = SLOT_MODE.PIANO_8;
                            PianoRhythmDock.SLOT_MODE_BUTTON.trigger("click");
                        }
                        if (PianoRhythmDock.DOCK_SLOTS && PianoRhythmDock.DOCK_SLOTS.length)
                            PianoRhythmDock.DOCK_SLOTS.css("opacity", "1");
                        var element = PianoRhythmDock.DOCK_SLOT_ELEMENTS[0];
                        if (element && element.length)
                            element.click();
                    },
                    adjust: {
                        y: -50,
                        x: 70
                    }
                }
            },
            {
                text: "You can overwrite instruments in their slots just by dragging another instrument over it. You can remove an instrument from a slot " +
                    " just by dragging it out and dropping it anywhere. Lastly, you can drag an existing instrument from slot to slot (It will make a copy of it)",
                options: {
                    target: PianoRhythmDock.DOCK_SLOTS,
                    at: "top left",
                    my: "left bottom",
                    lifeSpan: 8000,
                    width: 480,
                    onOpen: () => {
                        if (PianoRhythmDock.DOCK_SLOTS && PianoRhythmDock.DOCK_SLOTS.length)
                            PianoRhythmDock.DOCK_SLOTS.css("opacity", "1");
                    },
                    adjust: {
                        y: -50
                    }
                }
            },
            {
                text: "That's all for this tutorial of the instrument dock, instruments list, and slot modes! There will be more tutorials soon. You can check them out by going " +
                    "to <span style='color:yellow'>Options > Misc > Tutorials</span>",
                options: {
                    target: $(window),
                    width: 420,
                    my: "center center",
                    at: "center center",
                    lifeSpan: 10000,
                    adjust: {
                        x: 50,
                        y: -150
                    }
                }
            },
        ];
        return tut;
    }
    static loadNotifications(notifications, style) {
        if (!notifications || !notifications.length)
            return;
        if (PianoRhythm.SETTINGS["helpNotifications"] === false) {
            PianoRhythm.notify({
                message: "You currently have the Tutorial Notifications <span style='color:red'>DISABLED</span>!" +
                    " Please click here to <span style='color:lime'>ENABLE</span> it to continue the tutorial.",
                time: 100000,
                onClick: () => {
                    PianoRhythm.saveSetting("GENERAL", "helpNotifications", true);
                    PianoRhythm.SETTINGS["helpNotifications"] = true;
                    PianoRhythm.loadNotifications(notifications, style);
                }
            });
            return;
        }
        PianoRhythm.tutorialNotifications = true;
        notifications.reduce(function (cur, next) {
            return cur.then(() => {
                if (!PianoRhythm.tutorialNotifications) {
                    notifications = [];
                    PianoRhythm.currentTutorial = -1;
                    return Promise.resolve(false);
                }
                if (style)
                    next.options.style = style;
                return PianoRhythm.createGrowl(next.text, next.title, next.options);
            });
        }, Promise.resolve()).then(function () {
            $('.qtip_custom2').qtip('destroy', true);
            PianoRhythm.tutorialNotifications = false;
            PianoRhythm.currentTutorial = -1;
        }, () => {
            if (PianoRhythm.DEBUG_MESSAGING)
                console.error("Notification Popup failed!");
        });
    }
    static createGrowl(text = "", title = "", options) {
        return new Promise((resolve, reject) => {
            let persistent = (options && options.persistent != null) ? options.persistent : false;
            let target = (options) ?
                (options.target) ? options.target :
                    (options.x && options.y) ? [options.x, options.y] : [0, 0]
                : false;
            let lifespan = (options && options.lifeSpan != null) ? options.lifeSpan : 5000;
            let destroyOnHide = (options && options.destroyOnHide != null) ? options.destroyOnHide : true;
            if (options) {
                if (options.onOpen) {
                    options.onOpen(lifespan);
                }
            }
            let div = $('<div/>');
            div.qtip({
                content: {
                    text: text,
                    title: {
                        text: (title && title.length > 0) ? title : false,
                        button: (options && options.button) ? options.button : false,
                    }
                },
                position: {
                    viewport: $(window),
                    target: target,
                    my: (options && options.my) ? options.my : "top center",
                    at: (options && options.at) ? options.at : "bottom center",
                    adjust: (options && options.adjust) ?
                        {
                            x: (options.adjust.x !== undefined) ? options.adjust.x : 0,
                            y: (options.adjust.y !== undefined) ? options.adjust.y : 0,
                            resize: (options.resize !== undefined) ? options.resize : false,
                            mouse: (options.mouse !== undefined) ? options.mouse : true
                        } : {
                        x: 0, y: 0,
                        mouse: true,
                        resize: true,
                        method: 'flip flip'
                    },
                    container: (options && options.container) ? options.container : false
                },
                show: {
                    event: false,
                    ready: true,
                    effect: function () {
                        if (options && options.effectShow)
                            options.effectShow(this);
                        else
                            $(this).stop(0, 1).animate({ height: 'toggle' }, 400, 'swing');
                    },
                    delay: 0,
                    persistent: persistent
                },
                hide: {
                    event: false,
                    effect: function (api) {
                        if (options && options.effectHide)
                            options.effectHide(this);
                        else
                            $(this).stop(0, 1).animate({ height: 'toggle' }, 400, 'swing');
                    }
                },
                style: {
                    width: (options && options.width) ? options.width : false,
                    height: (options && options.height) ? options.height : false,
                    classes: 'qtip-light qtip_custom jgrowl ' + ((options && options.style) ? options.style : ""),
                    tip: (options && options.showTip) ? options.showTip : false
                },
                events: {
                    move: function (event, api) { if (options && options.onMove)
                        options.onMove(this); },
                    focus: function (event, api) { if (options && options.onFocus)
                        options.onFocus(this); },
                    blur: function (event, api) { if (options && options.onBlur)
                        options.onBlur(this); },
                    hidden: function (event, api) {
                        clearTimeout(api.timer);
                        if (destroyOnHide) {
                            if (options && options.onDestroy)
                                options.onDestroy();
                            api.destroy();
                            $(this).remove();
                        }
                        resolve(true);
                    },
                    render: function (event, api) {
                        if (options.getDiv)
                            options.getDiv($(this));
                        $(this).click((e) => {
                            if (options && options.onClick)
                                options.onClick($(this));
                            if (api.options.show.persistent)
                                return;
                            if (options && options.noClick === true)
                                return;
                            if (options && options.onDestroy)
                                options.onDestroy();
                            api.destroy();
                            resolve(true);
                        });
                        if (!api.options.show.persistent) {
                            $(this).bind('mouseover mouseout', function (e) {
                                clearTimeout(api.timer);
                                if (e.type !== 'mouseover') {
                                    api.timer = setTimeout(function () {
                                        if (!api.destroyed)
                                            api.hide(e);
                                    }, lifespan);
                                }
                            }).triggerHandler('mouseout');
                        }
                    }
                }
            });
        });
    }
    static onlyHostCanPlay() {
        return (PianoRhythm.ONLY_HOST && PianoRhythm.CLIENT.socketID !== PianoRhythm.ROOM_OWNER_ID);
    }
    static currentTurnInRoom() {
        return (PianoRhythm.CLIENT.socketID !== PianoRhythm.ROOM_CURRENT_TURN_ID);
    }
    static toggleListScrollBar(show = true) {
        PianoRhythm.SETTINGS["listScrollBar"] = show;
        PianoRhythm.saveSetting("UI", "listScrollBar", show);
        if (PianoRhythm.PLAYERLIST_UL && PianoRhythm.PLAYERLIST_UL.length) {
            if (show) {
                PianoRhythm.PLAYERLIST_UL.addClass("UI_players_list_scrollBar");
                PianoRhythm.jUI.css("overflow", "visible");
            }
            else {
                PianoRhythm.PLAYERLIST_UL.removeClass("UI_players_list_scrollBar");
                PianoRhythm.jUI.css("overflow", "hidden");
            }
        }
    }
    static checkDesktopNotifications() {
        if (!("Notification" in window)) {
            console.warn("This browser does not support desktop notifications.");
        }
        else {
            if (Notification.permission === "granted") {
                PianoRhythm.DESKTOP_NOTIFY = true;
            }
            else if (Notification.permission !== 'denied') {
                Notification.requestPermission(function (permission) {
                    if (permission === "granted") {
                        PianoRhythm.DESKTOP_NOTIFY = true;
                        PianoRhythm.desktopNotify("You've enabled browser notifications.");
                    }
                });
            }
        }
    }
    static desktopNotify(theBody, theTitle, theIcon, other) {
        if (!PianoRhythm.DESKTOP_NOTIFY)
            return;
        function spawnNotification(theBody, theIcon, theTitle) {
            let options = {
                body: theBody,
                icon: theIcon
            };
            let n = new Notification(theTitle, options);
            n.onshow = () => {
                if (other && other.onlick)
                    other.onshow();
                if (other && other.timeoutTimer) {
                    setTimeout(() => {
                        n.close();
                        if (other.timeout)
                            other.timeout();
                    }, other.timeoutTimer);
                }
                else {
                    setTimeout(() => {
                        n.close();
                        if (other && other.timeout)
                            other.timeout();
                    }, 10000);
                }
            };
            n.onclick = () => {
                n.close();
                if (other && other.onlick)
                    other.onclick();
            };
            n.onclose = () => {
                if (other && other.onlick)
                    other.onclose();
            };
        }
        spawnNotification(theBody || "", theIcon || "./profile_images/default/profile.png", theTitle || "PianoRhythm");
    }
    static updateURL(name) {
        history.replaceState({}, null, name.toLowerCase());
    }
    static map(value, in_min, in_max, out_min, out_max) {
        return (value - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
    }
    static getTextWidth(text, font) {
        let canvas = document.createElement("canvas");
        let context = canvas.getContext("2d");
        context.font = font;
        let metrics = context.measureText(text);
        return metrics.width;
    }
    static titleCase(str) {
        let splitStr = str.toLowerCase().split(' ');
        for (let i = 0; i < splitStr.length; i++) {
            splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
        }
        return splitStr.join(' ');
    }
    static findUsersByUUID(id) {
        let temp = [];
        for (let t in PianoRhythm.USERS) {
            let user = PianoRhythm.USERS[t];
            if (user.id === id)
                temp.push(user);
        }
        return temp;
    }
    static findUserBySID(id) {
        for (let t in PianoRhythm.USERS) {
            let user = PianoRhythm.USERS[t];
            if (user.socketID === id)
                return false;
        }
    }
    static strip(html) {
        let tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText;
    }
    static stringToColour(str) {
        let hash = 0;
        if (!str)
            return "#000";
        if (str && str.length <= 0)
            return "#000";
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        let colour = '#';
        for (let i = 0; i < 3; i++) {
            let value = (hash >> (i * 8)) & 0xFF;
            colour += ('00' + value.toString(16)).substr(-2);
        }
        if (pusher && pusher.color(colour).value() > 85)
            colour = pusher.color(colour).value(85).hex6();
        return colour;
    }
    static dimPage(bool, zIndex, blur) {
        let dimPage = $(".dimPage");
        if (bool) {
            if (dimPage.length)
                dimPage.remove();
            if (PianoRhythm.jUI)
                PianoRhythm.jUI.css("z-index", 990);
            PianoRhythm.CONTENT.before("<div class='dimPage' style='z-index:" + (zIndex || "") + "'" + "></div>").fadeIn("fast", () => {
                PianoRhythm.PAGE_DIM = true;
                if (PianoRhythm.CONTENT && PianoRhythm.CONTENT.length && blur && PianoRhythm.SETTINGS["blurEffect"])
                    PianoRhythm.CONTENT.css("filter", "blur(3px)");
            });
        }
        else {
            if (PianoRhythm.checkMajorElementsDim())
                return;
            if (PianoRhythm.CMESSAGES.css("opacity") === "1")
                return;
            if (PianoRhythm.jUI)
                PianoRhythm.jUI.css("z-index", 1001);
            if (window.getSelection) {
                window.getSelection().removeAllRanges();
            }
            else if (document.selection) {
                document.selection.empty();
            }
            dimPage.css("z-index", "995");
            dimPage.fadeOut("fast", () => {
                dimPage.remove();
            });
            if (PianoRhythm.CONTENT && PianoRhythm.CONTENT.length)
                PianoRhythm.CONTENT.css("filter", "");
            PianoRhythm.PAGE_DIM = false;
        }
    }
    ;
    static getUTF8Size(str) {
        let sizeInBytes = str.split('')
            .map(function (ch) {
            return ch.charCodeAt(0);
        }).map(function (uchar) {
            return uchar < 128 ? 1 : 2;
        }).reduce(function (curr, next) {
            return curr + next;
        });
        return sizeInBytes;
    }
    static saveData(data, filename) {
        let a = document.createElement("a");
        document.body.appendChild(a);
        a.style = "display: none";
        let json = JSON.stringify(data), blob = new Blob([json], { type: "octet/stream" }), url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }
    static collision(div1, div2) {
        let rect1 = div1.getBoundingClientRect(), rect2 = div2.getBoundingClientRect();
        return {
            collision: !(rect1.right < rect2.left ||
                rect1.left > rect2.right ||
                rect1.bottom < rect2.top ||
                rect1.top > rect2.bottom),
            rect1: rect1,
            rect2: rect2
        };
    }
    static PrefixedEvent(element, type, callback) {
        var pfx = ["webkit", "moz", "MS", "o", ""];
        if (element.attached) {
            return;
        }
        for (var p = 0; p < pfx.length; p++) {
            if (!pfx[p])
                type = type.toLowerCase();
            element.addEventListener(pfx[p] + type, callback, false);
        }
        element.attached = true;
    }
    static replaceURLWithHTMLLinks(text, func) {
        window.func = func;
        let exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
        let element = $("<a>");
        element.html("<a id='replacedURL' target='_blank' onclick='return window.func()' href='$1'>$1</a>");
        return text.replace(exp, element.html());
    }
    static formatAMPM(date) {
        let hours = date.getHours();
        let minutes = date.getMinutes();
        let ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        let strTime = hours + ':' + minutes + ' ' + ampm;
        return strTime;
    }
    static changeKeyBind(options) {
        if (!options)
            return;
        let value = null;
        let keybindBox = new BasicBox({
            id: "PR_KEYBIND", height: 200, width: 600,
            title: options.title || "KeyBind",
            color: options.color || "rgba(0,0,0,0.5)",
        });
        keybindBox.box.css({
            "border": "4px solid white",
        });
        let keyBindInput;
        keybindBox.createHeader({
            marginTop: "0px",
            onClose: () => {
                if (options.callbackClose)
                    options.callbackClose();
                if (keyBindInput) {
                    try {
                        keyBindInput.qtip('api').destroy();
                    }
                    catch (err) {
                    }
                }
                PianoRhythm.dimPage(false);
                PianoRhythm.setButtonActive(PianoRhythm.OPTIONSBUTTON, false);
            }
        });
        keyBindInput = keybindBox.addInput({
            type2: "text",
            width: "90%"
        });
        if (options.callbackPressUp) {
            keyBindInput.on("keyup", (evt) => {
                options.callbackPressUp(evt, keyBindInput, (newVal) => {
                    value = newVal;
                });
            });
        }
        if (options.callbackPressDown) {
            keyBindInput.on("keydown", (evt) => {
                evt.preventDefault();
                options.callbackPressDown(evt, keyBindInput, (newVal) => {
                    value = newVal;
                });
            });
        }
        keyBindInput.attr("title", options.title);
        keyBindInput.qtip();
        if (options.val) {
            keyBindInput.find("input").val(options.val);
            value = options.val;
        }
        let submitButton = BasicBox.createButton("Submit", () => {
            var input = keyBindInput.find("input");
            var inputVal = "";
            if (input)
                inputVal = input.val();
            if (options.callbackSubmit)
                options.callbackSubmit(value);
            try {
                keyBindInput.qtip('api').destroy();
            }
            catch (err) {
            }
            ;
            keybindBox.remove();
            keybindBox.destroyed = true;
            PianoRhythm.dimPage(false);
            PianoRhythm.setButtonActive(PianoRhythm.OPTIONSBUTTON, false);
        }, {
            "flex-grow": "1",
            "padding-left": "40%"
        });
        keybindBox.box.append(submitButton);
        keybindBox.center3();
        PianoRhythm.BODY.append(keybindBox.box);
    }
    static getParameterByName(name, url) {
        if (!url)
            url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"), results = regex.exec(url);
        if (!results)
            return null;
        if (!results[2])
            return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }
    static validateUserName(str) {
        if (str === "___")
            return false;
        var re = /^[a-zA-Z0-9_-]{2,15}$/;
        return re.test(str);
    }
    ;
    static validateName(str) {
        if (str === "___")
            return false;
        var re = /^[a-zA-Z0-9_-]{3,}$/;
        return re.test(str);
    }
    ;
    static validateEmail(email) {
        var re = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:[A-Z]{2}|com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|museum|edu)\b/;
        return re.test(email);
    }
    static validatePassword(str) {
        var re = /(?=.*[a-zA-Z0-9]).{6,}$/;
        return re.test(str);
    }
    ;
    static toTitleCase(str) {
        return str.replace(/\w\S*/g, function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    }
    static getRandomArbitrary(min, max) {
        return Math.random() * (max - min) + min;
    }
    static String_replaceAll(String, search, replacement) {
        return String.replace(new RegExp(search, 'g'), replacement);
    }
    static toDataUrl(url, callback) {
        var xhr = new XMLHttpRequest();
        xhr.onload = function () {
            var reader = new FileReader();
            reader.onloadend = function () {
                if (callback)
                    callback(reader.result);
            };
            reader.readAsDataURL(xhr.response);
        };
        xhr.onerror = function (e) {
            if (callback)
                callback(-1);
        };
        xhr.open('GET', url);
        xhr.responseType = 'blob';
        xhr.send();
    }
    static getDataUri(url, callback) {
        var image = new Image();
        image.onload = function () {
            var canvas = document.createElement('canvas');
            canvas.width = 100;
            canvas.height = 100;
            canvas.getContext('2d').drawImage(this, 0, 0);
            if (callback) {
                callback(image, canvas.toDataURL('image/png'));
            }
        };
        image.src = url;
    }
}
PianoRhythm.USE_SSL = false;
PianoRhythm.SSL_PORT = 443;
PianoRhythm.PORT = 3000;
PianoRhythm.DEBUG_MESSAGING = false;
PianoRhythm.CHAT_ACTIVE = false;
PianoRhythm.MODE_3D = false;
PianoRhythm.CLIENT_FOCUS = CLIENT_FOCUS.LOGIN;
PianoRhythm.INITIALIZED = false;
PianoRhythm.SETTINGS = {};
PianoRhythm.GLOBAL_SETTINGS = {};
PianoRhythm.TRANSPOSE = 0;
PianoRhythm.OCTAVE = 3;
PianoRhythm.STATE = IO_STATE.INITIAL;
PianoRhythm.OFFLINE_MODE = false;
PianoRhythm.USERS = {};
PianoRhythm.MOBILE = false;
PianoRhythm.TAB_VISIBLE = true;
PianoRhythm.SIDEBAR_OFFSET = 0;
PianoRhythm.SIDBAR_HIDDEN = false;
PianoRhythm.TAB_SELECTED = "players";
PianoRhythm.draggingInstrumentItem = false;
PianoRhythm.mouseX = -999;
PianoRhythm.mouseY = -999;
PianoRhythm.SHOW_CURSOR = true;
PianoRhythm.serverTimeOffset = 0;
PianoRhythm.LAST_WHISPERER = "";
PianoRhythm.ROOM_CURRENT_TURN_ID = null;
PianoRhythm.ROOM_CURRENT_TURN_MESSAGE = null;
PianoRhythm.ONLY_HOST = false;
PianoRhythm.PING_TIMER = null;
PianoRhythm.SLOTS_LOCKED = false;
PianoRhythm.AUTH_TOKEN = null;
PianoRhythm.SHOW_EVERYONES_CURSORS = true;
PianoRhythm.SHOW_IM_AFK = true;
PianoRhythm.GAME_MODE = null;
PianoRhythm.GAME_MODE_STATE = null;
PianoRhythm.ALWAYS_KEEP_CHAT_FOCUS = false;
PianoRhythm.PAGE_DIM = false;
PianoRhythm.LOGIN_ENTERED = false;
PianoRhythm.USER_LAST_TYPING_TIME = 0;
PianoRhythm.USER_IS_TYPING = false;
PianoRhythm.TYPING_TIMER_LENGTH = 2500;
PianoRhythm.WHO_IS_TYPING = [];
PianoRhythm.WHO_IS_TYPING_TIMERS = {};
PianoRhythm.maxRoomnameChar = 24;
PianoRhythm.CHAT_SETTINGS = {
    totalMessages: 0,
    autoScroll: true,
    scrollPer: 0,
    scroll: "",
    scrollPosition: {},
    messagesHeight: 0,
    newMessages: 0,
    oldMessages: 0,
    maxMessages: 150,
    messageList: {},
    friendList: {},
    roomList: [],
    canChat: true,
    commandCount: 0,
    keyCount: 0,
    maxCommands: 10,
    prevCommand: [],
    active: false,
};
PianoRhythm.CANVAS_PIANO_DRAWN = false;
PianoRhythm.MIDI_IN_LIST = {};
PianoRhythm.MIDI_OUT_LIST = {};
PianoRhythm.MIDI_CURRENT_IN = null;
PianoRhythm.MIDI_CURRENT_OUT = null;
PianoRhythm.ENABLE_MOD = false;
PianoRhythm.ISMOBILE = false;
PianoRhythm.TAGMODIF = null;
PianoRhythm.TAGMODIF_VISIBLE = false;
PianoRhythm.TAGFONTMOD = null;
PianoRhythm.ONLY_HOST_MESSAGE = null;
PianoRhythm.ROOM_HIGHEST_LATENCY = 0;
PianoRhythm.COLORS = {
    base1: "#16A085",
    base2: "rgba(0,0,0,0)",
    base3: "#2C3E50",
    base4: "#363942",
    base5: "#3B73A9",
    UI_unselected: "",
    UI_selected: "rgba(0,0,0,0)",
    UI_miniProfileHeader: "#363942",
    roomColor_Lobby: "gold",
    roomColor_LobbyTurn: "#00BCD4",
    roomColor_Game: "orange",
};
PianoRhythm.ROLE_COLORS = new Map();
PianoRhythm.ROLE_RANK = new Map();
PianoRhythm.ROLE_AMOUNT = new Map();
PianoRhythm.PLAYER_SOCKET_LIST = new Map();
PianoRhythm.PLAYER_ROOM_LIST = new Map();
PianoRhythm.MUTED_NOTE_PLAYERS = new Set();
PianoRhythm.MUTED_CHAT_PLAYERS = new Set();
PianoRhythm._online = true;
PianoRhythm.ROOM_SETTINGS = {
    ALLOWED_TOOL: Piano_1.NOTE_SOURCE.ANY,
    KB_LAYOUT: Piano_1.KEYBOARD_LAYOUT.ANY,
    LAST_KB_LAYOUT: Piano_1.KEYBOARD_LAYOUT.ANY,
    ALLOW_RECORDING: true,
    ALLOW_BOT_MESSAGES: true
};
PianoRhythm.parseAgent = function () {
    let parser = new UAParser();
    let result = parser.getResult();
    PianoRhythm.BROWSER = result.browser;
    PianoRhythm.DEVICE = result.device;
    PianoRhythm.ENGINE = result.engine;
    PianoRhythm.OS = result.os;
    if (PianoRhythm.DEVICE.type === 'mobile')
        PianoRhythm.ISMOBILE = true;
    if (document.fullscreenEnabled ||
        document.webkitFullscreenEnabled ||
        document.mozFullScreenEnabled ||
        document.msFullscreenEnabled) {
        PianoRhythm.CANFULLSCREEN = true;
    }
    let browserName = PianoRhythm.BROWSER.name;
    let incompatible = false;
    if (PianoRhythm.BROWSER && browserName) {
        if (browserName.toLowerCase().indexOf("firefox") !== -1)
            incompatible = true;
    }
    if (incompatible) {
        PianoRhythm.notify("Sorry but PianoRhythm is currently not compatible with " + browserName + ". Please use Chrome!", 15000);
        $("body").prepend("<div class=\"overlay_disable\"></div>");
        $(".overlay_disable").css({
            "position": "absolute",
            "width": $(document).width(),
            "height": $(document).height(),
            "z-index": 99999,
            "background": "gray"
        }).fadeTo(0, 0.8);
    }
    console.log("BROWSER", result);
};
PianoRhythm.STATS_INTERVAL = 0;
PianoRhythm.ROOM_INSTRUMENTS = null;
PianoRhythm.FRIEND_REQUESTS = [];
PianoRhythm.MINI_PROFILE_FRIEND_requestPending = false;
PianoRhythm.MINI_PROFILE_VISIBLE = false;
PianoRhythm.MAIN_PROFILE_VISIBLE = false;
PianoRhythm.AVATAR_IMAGE_UPLOADING = false;
PianoRhythm.PLAYER_LIST_DIVIDERS = {};
PianoRhythm.FRIEND_LIST_DIVIDERS = {};
PianoRhythm.MOUSE_OVER_SCROLL_BAR = false;
PianoRhythm.shift_key_set = new Set();
PianoRhythm.alt_key_set = new Set();
PianoRhythm.INPUT_BAR_FOCUSED = false;
PianoRhythm.UI_INITIALIZED = false;
PianoRhythm.tranTimeout = null;
PianoRhythm.octTimeout = null;
PianoRhythm.INSTRUMENT_DOCK_DISPLAYED = true;
PianoRhythm.TRANSITIONING = false;
PianoRhythm.default_global_color = "#363942";
PianoRhythm.default_background_color1 = "white";
PianoRhythm.default_background_color2 = "#363942";
PianoRhythm.default_background_type = "Gradient";
PianoRhythm.default_background_gradient = "";
PianoRhythm.default_background_angle = "bottom right";
PianoRhythm.default_show_bg = true;
PianoRhythm.tutorialNotifications = false;
PianoRhythm.currentTutorial = -1;
PianoRhythm.notifyMessagesSet = new Set();
PianoRhythm.notify = function (data, time, color) {
    if (!data)
        return;
    if (PianoRhythm.SETTINGS["showNotifications"] === false)
        return;
    time = data.time || ((time) ? time : 4000);
    let type = data.type || 'notice';
    let message = (typeof data === "string") ? data : data.message;
    if (!message || message === "undefined")
        return;
    if (time >= 15000)
        time = 15000;
    let addColor = false;
    let addColorSpan = "";
    if (color) {
        addColor = true;
        addColorSpan = "style='color:" + color + "'";
    }
    let notification = new NotificationFx({
        wrapper: document.getElementsByTagName("BODY")[0],
        message: "<span class='icon-bubbles4'></span><p>" + message + "</p>",
        layout: 'bar',
        effect: 'slidetop',
        type: type,
        ttl: time,
        onClick: (data.onClick) ? data.onClick : function () {
            return false;
        },
        onClose: function () {
            if (data.onClose)
                data.onClose();
            PianoRhythm.notifyMessagesSet.delete(message);
            return false;
        },
        onOpen: (data.onOpen) ? data.onOpen : function () {
            return false;
        }
    });
    PianoRhythm.notifyMessagesSet.add(message);
    notification.show();
};
PianoRhythm.saveSessionSetting = function (group, key, value) {
    if (typeof (Storage) !== "undefined") {
        if (typeof PianoRhythm.GLOBAL_SETTINGS[group] === "undefined")
            PianoRhythm.GLOBAL_SETTINGS[group] = {};
        let setting = PianoRhythm.GLOBAL_SETTINGS[group];
        setting[key] = value;
        window.sessionStorage.setItem("Global_Settings_" + group, JSON.stringify(PianoRhythm.GLOBAL_SETTINGS[group]));
        return true;
    }
    return false;
};
PianoRhythm.loadSessionSetting = function (group, key) {
    if (typeof (Storage) !== "undefined") {
        let groupSetting = window.sessionStorage.getItem("Global_Settings_" + group);
        if (groupSetting) {
            let parsed = JSON.parse(groupSetting);
            let value = null;
            if (parsed)
                value = parsed[key];
            if (typeof value !== "undefined") {
                if (typeof PianoRhythm.GLOBAL_SETTINGS[group] === "undefined")
                    PianoRhythm.GLOBAL_SETTINGS[group] = {};
                let setting = PianoRhythm.GLOBAL_SETTINGS[group];
                setting[key] = value;
                return value;
            }
            return null;
        }
        return null;
    }
    return null;
};
PianoRhythm.saveSetting = function (group, key, value) {
    if (typeof (Storage) !== "undefined") {
        if (typeof PianoRhythm.GLOBAL_SETTINGS[group] === "undefined")
            PianoRhythm.GLOBAL_SETTINGS[group] = {};
        let setting = PianoRhythm.GLOBAL_SETTINGS[group];
        setting[key] = value;
        window.localStorage.setItem("Global_Settings_" + group, JSON.stringify(PianoRhythm.GLOBAL_SETTINGS[group]));
        return true;
    }
    return false;
};
PianoRhythm.loadSetting = function (group, key) {
    if (typeof (Storage) !== "undefined") {
        let groupSetting = window.localStorage.getItem("Global_Settings_" + group);
        if (groupSetting) {
            let parsed = JSON.parse(groupSetting);
            let value = null;
            if (parsed)
                value = parsed[key];
            if (value !== undefined) {
                if (PianoRhythm.GLOBAL_SETTINGS[group] === undefined)
                    PianoRhythm.GLOBAL_SETTINGS[group] = {};
                let setting = PianoRhythm.GLOBAL_SETTINGS[group];
                setting[key] = value;
                if (group.indexOf("KEYBIND") > -1) {
                    let arrowIndex = value.toLowerCase().indexOf("arrow");
                    if (arrowIndex == 0)
                        value = value.substring("arrow".length);
                }
                return value;
            }
            return null;
        }
        return null;
    }
    return null;
};
PianoRhythm.deleteSetting = function (key) {
    if (typeof (Storage) !== "undefined") {
        window.localStorage.removeItem(key);
        return true;
    }
    return false;
};
PianoRhythm.deleteSessionSetting = function (key) {
    if (typeof (Storage) !== "undefined") {
        window.sessionStorage.removeItem(key);
        return true;
    }
    return false;
};
PianoRhythm.deleteAllSettings = function () {
    window.localStorage.clear();
};
exports.PianoRhythm = PianoRhythm;
class PianoRhythmUpLink {
    constructor(icon) {
        this.messageOpened = false;
        this.messageOpenedItem = null;
        this.currentUnreadMailAmount = 0;
        this.visible = false;
        this.lastTabActive = "news";
        this.scrollSection = 0;
        this.lastScale = 1;
        this.maxUplinkHeight = 520;
        this.minUplinkHeight = 490;
        if (icon)
            this.icon = icon.clone();
        this.mainContainer = $(".prUplink_Container");
        this.uplinkContainer = $(".prUplink");
        this.mainContainerTitle = $(".prUplinkTitle");
        this.tabsSubContainer = $("#prTabsSubContainer");
        this.tabsContainer = $(".prTabs");
        this.tabsArrowLeft = $("#upLinkArrowNav_Left");
        this.tabsArrowRight = $("#upLinkArrowNav_Right");
        this.icon.attr("title", "PianoRhythm Uplink (You can press this to close)");
        this.icon.css({
            "z-index": 1000,
            left: "auto",
            top: "auto",
            "margin-left": "645px",
            "position": "auto !important",
            "transform": "scale(0.8) translateY(-40px)"
        });
        this.icon.insertAfter(this.mainContainerTitle);
        this.icon.hover(() => {
            this.icon.addClass("preloader_Hover");
        }, () => {
            this.icon.removeClass("preloader_Hover");
        });
        this.icon.click(() => {
            this.hide();
        });
        this.newsTab = $("#news-toggle");
        this.mailTab = $("#mail-toggle");
        this.requestsTab = $("#requests-toggle");
        this.shopTab = $("#shop-toggle");
        this.leaderboardsTab = $("#leaderboards-toggle");
        this.requestsAmount = $("#requestsAmount");
        this.unreadMailAmount = $("#mailAmount");
        this.mainContentContainer = $(".prUplink .content");
        this.newsContent = $(".news-content");
        this.mailContent = $(".mail-content");
        this.requestsContent = $(".requests-content");
        this.leaderboardsContent = $(".leaderboards-content");
        this.mailContentMenu = this.mailContent.find("#content_menu");
        this.mailComposeButton = this.mailContentMenu.find("button");
        this.leaderboardsUL = this.leaderboardsContent.find("#leaderboards_mostfriends");
        this.mailLabels = this.mailContent.find("#labels");
        this.requestsLabel = $("#rquestsLabel");
        this.newsLabel = $("#nwsLabel");
        this.shopLabel = $("#sopLabel");
        this.leaderboardsLabel = $("#lbLabel");
        this.mailLabel = $("#milLabel");
        this.composeMessageContainer = $(".composeMessageContainer");
        this.composeMessageSubject = $(".headerSubject");
        this.composeMessagRecipient = $(".headerRecipient");
        this.loginButton = $("#prUplink_loginButton");
        this.loginText = $("#prUplink_loginText");
        this.accountBar = $("#prUplink_accountBar");
        this.composeMessagTextArea = this.composeMessageContainer.find("textarea");
        this.mailSendMessageButton = this.composeMessageContainer.find("#messageTextAreaLabel");
        this.mailMessagesContainer = this.mailContent.find(".list");
        this.mailComposeButton.click(() => {
            let button = this.mailComposeButton;
            let clicked = button.data("clicked") !== undefined ? button.data("clicked") : true;
            if (clicked) {
                this.mailMessagesContainer.fadeOut("fast", () => {
                    this.composeMessageContainer.fadeIn("fast");
                });
                this.mailComposeButton.text("Discard");
                this.mailLabels.css("opacity", 0);
            }
            else {
                this.mailLabels.css("opacity", 1);
                this.composeMessageContainer.fadeOut("fast", () => {
                    this.mailMessagesContainer.fadeIn("fast");
                });
                this.mailComposeButton.text("Compose");
                this.composeMessagTextArea.val("");
                this.composeMessageSubject.val("");
                this.composeMessagRecipient.val("");
            }
            button.data("clicked", !clicked);
        });
        this.composeMessagTextArea.on("input", () => {
            PianoRhythm.CLIENT_FOCUS = CLIENT_FOCUS.UPLINK;
        });
        this.composeMessageSubject.on("input", () => {
            PianoRhythm.CLIENT_FOCUS = CLIENT_FOCUS.UPLINK;
        });
        this.composeMessagRecipient.on("input", () => {
            PianoRhythm.CLIENT_FOCUS = CLIENT_FOCUS.UPLINK;
        });
        this.mailSendMessageButton.click(() => {
            let message = this.composeMessagTextArea.val();
            let subject = this.composeMessageSubject.val();
            let recipient = this.composeMessagRecipient.val();
            if (recipient.length <= 0) {
                PianoRhythm.notify("Please enter a recipient!");
                return;
            }
            if (subject.length <= 0) {
                PianoRhythm.notify("Please enter a subject!");
                return;
            }
            if (message.length <= 0) {
                PianoRhythm.notify("Please enter a message!");
                return;
            }
            else {
                let output = {
                    message: message,
                    subject: subject,
                    recipient: recipient,
                };
                if (PianoRhythm.SOCKET) {
                    PianoRhythm.SOCKET.emit("sendMessage", output, (err, data) => {
                        PianoRhythm.notify({
                            message: data.message
                        });
                        this.hide();
                        this.mailLabels.css("opacity", 1);
                        this.composeMessageContainer.fadeOut("fast", () => {
                            this.mailMessagesContainer.fadeIn("fast");
                        });
                        this.mailComposeButton.text("Compose");
                        this.composeMessagTextArea.val("");
                        this.composeMessageSubject.val("");
                        this.composeMessagRecipient.val("");
                    });
                }
                else {
                    PianoRhythm.notify("An error has occurred. Please try again later!");
                }
                if (PianoRhythm.DEBUG_MESSAGING)
                    console.log("MESSAGE SENT", output);
            }
        });
        this.mailMessagesContainer.children().click((e) => {
            var target = $(e.target);
            this.mail_setClick(target);
        });
        let scrollTimer = null;
        this.tabsSubContainer.scroll((evt) => {
            if (scrollTimer !== null) {
                clearTimeout(scrollTimer);
            }
            scrollTimer = setTimeout(() => {
                var element = this.tabsSubContainer[0];
                var a = element.scrollTop;
                var b = element.scrollHeight - element.clientHeight;
                var c = a / b;
                this.scrollSection = c;
                this.executeScroll();
            }, 100);
        });
        this.fb = $('.fb-like');
        let content = PianoRhythm.CONTENT;
        let usernameInput = $('.usernameInput');
        let loginpage = $('.loginPage');
        let loginStatus = $("#loginStatus");
        let enterBTN = $("#loginEnterBTN");
        let loginBTN = $("#loginBTN");
        this.loginButton.click((e) => {
            if (PianoRhythm.CLIENT) {
                this.hide();
                $(".qtip_custom_newMail").remove();
                this.mailLabels.css("opacity", 1);
                this.composeMessageContainer.fadeOut("fast", () => {
                    this.mailMessagesContainer.fadeIn("fast");
                });
                this.mailComposeButton.text("Compose");
                this.composeMessagTextArea.val("");
                this.composeMessageSubject.val("");
                this.composeMessagRecipient.val("");
                PianoRhythm.transition("Logging Out", () => {
                    PianoRhythm.logout();
                });
            }
        });
        this.newsTab.click((e) => {
            if (PianoRhythm.CLIENT)
                PianoRhythm.CLIENT_FOCUS = CLIENT_FOCUS.UPLINK;
            this.lastTabActive = "news";
        });
        this.mailTab.click((e) => {
            if (PianoRhythm.CLIENT)
                PianoRhythm.CLIENT_FOCUS = CLIENT_FOCUS.UPLINK;
            this.lastTabActive = "mail";
        });
        this.requestsTab.click((e) => {
            if (PianoRhythm.CLIENT)
                PianoRhythm.CLIENT_FOCUS = CLIENT_FOCUS.UPLINK;
            this.lastTabActive = "requests";
        });
        this.shopTab.click((e) => {
            if (PianoRhythm.CLIENT)
                PianoRhythm.CLIENT_FOCUS = CLIENT_FOCUS.UPLINK;
            this.lastTabActive = "shop";
        });
        this.leaderboardsTab.click((e) => {
            if (PianoRhythm.CLIENT)
                PianoRhythm.CLIENT_FOCUS = CLIENT_FOCUS.UPLINK;
            this.lastTabActive = "leaderboards";
            if (PianoRhythm.SOCKET) {
                PianoRhythm.SOCKET.emit("getLeaderboards", {}, (err, results) => {
                    if (results && !err) {
                        if (!this.mostFriendsData)
                            this.mostFriendsData = results.data;
                        else if (this.mostFriendsData !== results.data)
                            this.mostFriendsData = results.data;
                        this.updateLeaderboard(results.type, this.mostFriendsData);
                    }
                });
            }
        });
        this.tabsArrowLeft.click((e) => {
            if (PianoRhythm.CLIENT) {
                PianoRhythm.CLIENT_FOCUS = CLIENT_FOCUS.UPLINK;
                var element = this.tabsSubContainer[0];
                if (element)
                    element.scrollTop = 0;
            }
        });
        this.tabsArrowRight.click((e) => {
            if (PianoRhythm.CLIENT) {
                PianoRhythm.CLIENT_FOCUS = CLIENT_FOCUS.UPLINK;
                var element = this.tabsSubContainer[0];
                if (element)
                    element.scrollTop = element.scrollHeight;
            }
        });
        if (showdown) {
            this.converter = new showdown.Converter();
            $.ajax({
                url: "../changelog/uplink.md",
                success: (data) => {
                    this.newsContent.find("#list").append(this.converter.makeHtml(data));
                    this.newsContent.find("#list").children().slice(-10).remove();
                }
            });
        }
        let scale = Math.min(this.mainContainer.width() / $(window).width(), this.mainContainer.height() / $(window).height());
        this.executeScroll();
    }
    displayTab(tab = "news") {
        switch (tab.toLowerCase()) {
            default:
            case "news":
                this.newsTab.trigger("click");
                break;
            case "mail":
                this.mailTab.trigger("click");
                break;
            case "requests":
                this.requestsTab.trigger("click");
                break;
            case "shop":
                this.shopTab.trigger("click");
                break;
            case "leaderboards":
                this.leaderboardsTab.trigger("click");
                break;
        }
    }
    show(tab = "news") {
        if (this.visible)
            return;
        this.visible = true;
        PianoRhythmUpLink.VISIBLE = true;
        PianoRhythm.CLIENT_FOCUS = CLIENT_FOCUS.UPLINK;
        PianoRhythm.dimPage(true);
        PianoRhythm.FOCUS_PIANO(false);
        PianoRhythm.hideContextMenus();
        PianoRhythm.hideMiniProfile();
        PianoRhythm.hideMainProfile();
        if (PianoRhythm.ISMOBILE) {
            if (this.mainContainer.css("transform") === "none") {
                let ratio = window.devicePixelRatio || 1;
                let w = screen.width * ratio;
                let h = screen.height * ratio;
                let scale = Math.max(this.mainContainer.width() / w, this.mainContainer.height() / h);
                this.mainContainer.css({ '-webkit-transform': 'scale(' + scale + ')' });
            }
        }
        this.displayTab(tab);
        if ((PianoRhythm.CLIENT && !PianoRhythm.CLIENT.loggedIn) || PianoRhythm.CLIENT === undefined) {
            this.mailTab.prop("disabled", "disabled");
            this.requestsTab.prop("disabled", "disabled");
            this.shopTab.prop("disabled", "disabled");
            this.loginText.css("right", "145px");
            this.loginText.text("You are not logged in!");
            this.loginButton.text("Login");
        }
        else {
            this.mailTab.prop("disabled", "");
            this.requestsTab.prop("disabled", "");
            this.shopTab.prop("disabled", "");
            this.loginText.css("right", "155px");
            this.loginText.text("Logged in as: " + PianoRhythm.CLIENT.name);
            this.loginButton.text("Logout");
        }
        this.mainContainer.fadeIn("fast");
        this.mainContainer["center3"]();
        this.updateRequestsAmount();
        if (PianoRhythm.LOGIN_ENTERED)
            this.accountBar.show();
        if (this.fb)
            this.fb.show();
        this.onResize();
        $(".qtip_custom_newMail").remove();
    }
    hide() {
        if (!this.visible)
            return;
        this.visible = false;
        PianoRhythm.dimPage(false);
        PianoRhythmUpLink.VISIBLE = false;
        var element = this.tabsSubContainer[0];
        if (element)
            element.scrollTop = 0;
        this.scrollSection = 0;
        this.executeScroll();
        if (this.fb) {
            this.fb.css('left', "-9999999px !important");
            this.fb.hide();
        }
        this.accountBar.hide();
        this.mainContainer.fadeOut("fast");
        PianoRhythm.FOCUS_PIANO();
        this.mainContainer.css({ '-webkit-transform': 'scale(1)' });
        $(".qtip_custom_newMail").remove();
    }
    getInboxCount(callback) {
        if (PianoRhythm.CLIENT && PianoRhythm.SOCKET) {
            PianoRhythm.SOCKET.emit("getInboxCount", {}, (err, data) => {
                if (err) {
                    if (callback)
                        callback(-1);
                    return;
                }
                if (data && data.count !== undefined) {
                    if (callback)
                        callback(data.count);
                }
            });
        }
    }
    getUnreadInboxCount(callback) {
        if (PianoRhythm.CLIENT && PianoRhythm.SOCKET) {
            PianoRhythm.SOCKET.emit("getUnreadInboxCount", {}, (err, data) => {
                if (err) {
                    if (callback)
                        callback(-1);
                    return;
                }
                if (data && data.count !== undefined) {
                    if (callback)
                        callback(data.count);
                }
            });
        }
    }
    getPendingFriendRequestCount(callback) {
        if (PianoRhythm.CLIENT && PianoRhythm.SOCKET) {
            PianoRhythm.SOCKET.emit("getPendingFriendRequestCount", {}, (err, data) => {
                if (err) {
                    if (callback)
                        callback(-1);
                    return;
                }
                if (data && data.count !== undefined) {
                    if (callback)
                        callback(data.count);
                }
            });
        }
    }
    onResize() {
        if (!this.visible)
            return;
        let link = this.mainContainer;
        let offset = link.offset();
        let top = offset.top;
        let left = offset.left;
        let bottom = top + link.outerHeight();
        let right = left + link.outerWidth();
        let scale = 0;
        let rect = link[0].getBoundingClientRect();
        top = rect.top;
        let height1 = parseInt(this.uplinkContainer.css("height"));
        let height2 = parseInt(this.mainContentContainer.css("height"));
        let difference = (bottom + 90) - window.innerHeight;
        if (window.innerHeight < bottom + 90) {
            let newHeight1 = height1 - (bottom - window.innerHeight);
            if (newHeight1 >= this.minUplinkHeight) {
                this.uplinkContainer.css("height", height1 - difference);
                height1 = parseInt(this.uplinkContainer.css("height"));
                this.mainContentContainer.css("height", height1 - 100);
            }
            if (top <= 90)
                link.css("top", 350);
            else
                link.css("top", "50%");
        }
        else {
            link.css("top", "50%");
            if (height1 < this.maxUplinkHeight) {
                this.uplinkContainer.css("height", height1 + Math.abs(difference));
                this.mainContentContainer.css("height", height2 + Math.abs(difference - 10));
            }
            else if (height1 >= this.maxUplinkHeight) {
                this.uplinkContainer.css("height", this.maxUplinkHeight);
                this.mainContentContainer.css("height", 450);
            }
        }
        if (this.fb) {
            this.fb.css('left', "15px");
            this.fb.css('top', "10px");
        }
    }
    mail_discardComposedMessage() {
        this.mailLabels.css("opacity", 1);
        this.composeMessageContainer.fadeOut("fast", () => {
            this.mailMessagesContainer.fadeIn("fast");
        });
        this.mailComposeButton.text("Compose");
        this.composeMessagTextArea.val("");
        this.composeMessageSubject.val("");
        this.composeMessagRecipient.val("");
    }
    mail_setClick(target, sender, subject) {
        var targetID = target.attr("id");
        var targetClass = target.attr("class");
        if (targetID === "messageTitle" || targetID === "messageSender" || targetID === "messageDate") {
            var clicked = target.parent().data("clicked") !== undefined ? target.parent().data("clicked") : true;
            var read = target.parent().data("read") !== undefined ? target.parent().data("read") : false;
            this.messageOpened = clicked;
            if (clicked) {
                this.messageOpenedItem = target.parent();
            }
            else
                this.messageOpenedItem = null;
            if (clicked && !read) {
                target.parent().data("read", true);
                if (PianoRhythm.CLIENT && PianoRhythm.SOCKET) {
                    PianoRhythm.SOCKET.emit("setMessageRead", {
                        id: target.parent().data("mail_id"),
                        date: Date.now()
                    });
                }
                this.updateUnreadMailAmount(this.currentUnreadMailAmount - 1);
            }
            var message = target.parent().find("#message-container #message");
            var newHeight = 100 + message.height() + 10;
            if (!clicked)
                newHeight = 45;
            target.parent().css({
                "height": newHeight
            });
            target.parent().data("clicked", !clicked);
        }
        else {
            if (targetClass === "rkmd-btn") {
                if (target.text() === "Reply") {
                    if (PianoRhythm.DEBUG_MESSAGING)
                        console.log("REPLYING");
                    if (sender) {
                        this.composeMessageSubject.val("RE: " + subject);
                        this.composeMessagRecipient.val(sender);
                        this.mailComposeButton.trigger("click");
                    }
                }
                else {
                    if (PianoRhythm.CLIENT && PianoRhythm.SOCKET) {
                        PianoRhythm.SOCKET.emit("deleteMessage", {
                            id: target.parent().parent().parent().data("mail_id") || null,
                        }, (err, data) => {
                            if (err) {
                                PianoRhythm.notify({
                                    message: "Unable to delete the message. An error has occurred!"
                                });
                                return;
                            }
                            this.messageOpenedItem.remove();
                            this.messageOpenedItem = null;
                            this.messageOpened = false;
                        });
                    }
                }
            }
        }
    }
    mail_addNewMessage(id, subject, sender, date, msg, read) {
        if (subject === undefined || subject.length <= 0)
            subject = "No Subject";
        var mailItem = $("<li>");
        mailItem.data("mail_id", id);
        if (read !== undefined)
            mailItem.data("read", read);
        var messageSubject = $("<div>");
        messageSubject.attr("id", "messageTitle");
        messageSubject.text(subject);
        mailItem.append(messageSubject);
        var messageSender = $("<div>");
        messageSender.attr("id", "messageSender");
        messageSender.text(sender);
        mailItem.append(messageSender);
        var messageDate = $("<div>");
        messageDate.attr("id", "messageDate");
        messageDate.text(date);
        mailItem.append(messageDate);
        var message_container = $("<div>");
        message_container.attr("id", "message-container");
        var message = $("<div>");
        message.attr("id", "message");
        var finalMessage = "From: " + sender + "<br> <br>" + msg + "<br>";
        message.html(finalMessage);
        var messageFooter = $("<div>");
        messageFooter.attr("id", "messageFooter");
        var btnReply = $("<button>");
        btnReply.text("Reply");
        btnReply.attr("class", "rkmd-btn");
        btnReply.css("position", "relative");
        var btnDelete = $("<button>");
        btnDelete.text("Delete");
        btnDelete.attr("class", "rkmd-btn");
        btnDelete.css("position", "relative");
        messageFooter.append(btnReply);
        messageFooter.append(btnDelete);
        message_container.append(message);
        message_container.append(messageFooter);
        mailItem.append(message_container);
        mailItem.children().click((e) => {
            var target = $(e.target);
            this.mail_setClick(target, sender, subject);
        });
        if (this.mailMessagesContainer && this.mailMessagesContainer.length)
            this.mailMessagesContainer.prepend(mailItem);
    }
    mail_clearInbox(div) {
        if (div) {
            if (this.mailMessagesContainer && this.mailMessagesContainer.length) {
                this.mailMessagesContainer.contents().filter(function () {
                    return $(this).data("mail_id") !== div.data("mail_id");
                }).remove();
                return;
            }
        }
        if (this.mailMessagesContainer && this.mailMessagesContainer.length)
            this.mailMessagesContainer.empty();
    }
    requests_Clear() {
        var list = this.requestsContent.find('ul');
        if (list.length > 0)
            list.empty();
    }
    updateUnreadMailAmount(amount) {
        if (this.unreadMailAmount) {
            var list = this.requestsContent.find('ul');
            var val = (amount !== undefined) ? amount : list.children().length;
            if (val < 0)
                val = 0;
            this.currentUnreadMailAmount = val;
            if (list.length || val !== undefined)
                this.unreadMailAmount.text(val);
            else
                this.unreadMailAmount.text(0);
        }
    }
    updateRequestsAmount() {
        if (this.requestsAmount) {
            var list = this.requestsContent.find('ul');
            if (list.length)
                this.requestsAmount.text(list.children().length);
            else
                this.requestsAmount.text(0);
        }
    }
    requests_addNew(sender, date) {
        if (this.requestsContent) {
            var list = this.requestsContent.find('ul');
            if (list.length > 0) {
                var item = $(document.createElement('li')).text(sender + " has requested to be friends!");
                var cross = $(document.createElement('span')).css({
                    "right": 20,
                    "top": 14
                }).addClass("icon-cross");
                cross.attr("title", "Deny " + sender + "'s friend request!");
                cross.click(() => {
                    if (PianoRhythm.SOCKET) {
                        PianoRhythm.SOCKET.emit('deleteFriendRequest', { from: sender }, (err, data) => {
                            if (!err) {
                                PianoRhythm.notify({
                                    message: "You have denied " + sender + "'s friend request!"
                                });
                                item.remove();
                                this.updateRequestsAmount();
                            }
                            else {
                                PianoRhythm.notify({
                                    message: "An error has occurred!"
                                });
                            }
                        });
                    }
                });
                var check = $(document.createElement('span')).css({
                    "right": 63,
                    "top": 11,
                    "font-size": 24
                }).addClass("icon-checkmark");
                check.attr("title", "Accept " + sender + "'s friend request!");
                check.click(() => {
                    if (PianoRhythm.SOCKET) {
                        PianoRhythm.SOCKET.emit('acceptFriendRequest', { from: sender }, (err, data) => {
                            if (!err) {
                                PianoRhythm.notify({
                                    message: "You are now friends with " + sender + "!"
                                });
                                item.remove();
                                this.updateRequestsAmount();
                            }
                            else {
                                PianoRhythm.notify({
                                    message: "An error has occurred!"
                                });
                            }
                        });
                    }
                });
                item.append(check);
                item.append(cross);
                list.attr("title", "Date Sent - " + date);
                list.append(item);
                this.updateRequestsAmount();
            }
        }
    }
    executeScroll() {
        try {
            if (this.scrollSection !== undefined) {
                switch (this.scrollSection) {
                    case 0:
                        this.requestsAmount.css("display", "");
                        this.unreadMailAmount.css("display", "");
                        this.tabsArrowLeft.fadeOut();
                        this.tabsArrowRight.fadeIn();
                        this.newsLabel.find("span").css("display", "");
                        this.mailLabel.find("span").css("display", "");
                        this.requestsLabel.find("span").css("opacity", 1);
                        this.shopLabel.find("span").css("display", "none");
                        this.leaderboardsLabel.find("span").css("display", "none");
                        this.displayTab();
                        break;
                    case 1:
                        this.requestsAmount.css("display", "none");
                        this.unreadMailAmount.css("display", "none");
                        this.tabsArrowLeft.fadeIn();
                        this.tabsArrowRight.fadeOut();
                        this.newsLabel.find("span").css("display", "none");
                        this.mailLabel.find("span").css("display", "none");
                        this.requestsLabel.find("span").css("display", "none");
                        this.shopLabel.find("span").css("display", "");
                        this.leaderboardsLabel.find("span").css("display", "");
                        this.displayTab("shop");
                        break;
                    case 2:
                        break;
                }
            }
        }
        catch (err) {
            console.error(err);
        }
    }
    updateLeaderboard(type, list) {
        if (!type)
            return;
        if (!list)
            return;
        if (this.leaderboardsUL)
            this.leaderboardsUL.empty();
        switch (type) {
            case "MOST_FRIENDS":
                for (let i = 0; i < list.length; i++) {
                    let name = list[i].name;
                    let amount = list[i].friendsAmount;
                    let li = $("<li>");
                    let span1 = $("<span>");
                    span1.addClass("list_num");
                    span1.text(i + 1);
                    let img = $("<img>");
                    img.attr("draggable", "false");
                    img.attr("src", "./profile_images/" + name + "/profile.png?" + Date.now());
                    img.on('error', () => { img.attr("src", "./profile_images/default/profile.png"); });
                    let h2 = $("<h2>");
                    let span2 = $("<span>");
                    span2.addClass("number");
                    span2.text(amount);
                    let color = "";
                    let color2 = "";
                    let size = "";
                    let weight = "";
                    switch (i) {
                        case 0:
                            color = "gold";
                            color2 = PianoRhythm.COLORS.base1;
                            size = "larger";
                            weight = "bolder";
                            break;
                        case 1:
                            color = "silver";
                            weight = "bolder";
                            break;
                        case 2:
                            color = "#A67D3D";
                            break;
                    }
                    span1.css("color", color);
                    span2.css("color", color2);
                    h2.css("font-weight", weight);
                    h2.css("font-size", size);
                    li.append(span1);
                    li.append(img);
                    h2.text(name);
                    h2.append(span2);
                    h2.append(span2);
                    li.append(h2);
                    this.leaderboardsUL.append(li);
                }
                break;
        }
    }
}
PianoRhythmUpLink.VISIBLE = false;
exports.PianoRhythmUpLink = PianoRhythmUpLink;
class PianoRhythmDock {
    static initialize() {
        return new Promise((resolve, reject) => {
            PianoRhythmDock.DOCK_SLOT_ELEMENTS = [];
            PianoRhythmDock.SEARCH_BAR = $(".prSearch");
            PianoRhythmDock.SEARCH_BAR.fadeIn("slow");
            PianoRhythmDock.TRANSPOSE = $(".prTrans");
            PianoRhythmDock.OCTAVE = $(".prOct");
            if (PianoRhythmDock.OCTAVE) {
                let oct_input = PianoRhythmDock.OCTAVE.find("input");
                if (oct_input) {
                    if (!PianoRhythm.MOBILE)
                        oct_input.on("keydown", (e) => {
                            e.preventDefault();
                        });
                    PianoRhythmDock.OCTAVE.find("text").click(() => {
                        oct_input.val(3);
                        PianoRhythm.OCTAVE = 3;
                        if (PianoRhythm.CONTEXT_MENU_DOCK)
                            PianoRhythm.CONTEXT_MENU_DOCK.hide();
                    });
                    oct_input.on('change', (ev) => {
                        PianoRhythm.OCTAVE = parseInt($(ev.target).val());
                    });
                }
            }
            if (PianoRhythmDock.TRANSPOSE) {
                let tran_input = PianoRhythmDock.TRANSPOSE.find("input");
                if (tran_input) {
                    if (!PianoRhythm.MOBILE)
                        tran_input.on("keydown", (e) => {
                            e.preventDefault();
                        });
                    PianoRhythmDock.TRANSPOSE.find("text").click(() => {
                        tran_input.val(0);
                        PianoRhythm.TRANSPOSE = 0;
                        if (PianoRhythm.CONTEXT_MENU_DOCK)
                            PianoRhythm.CONTEXT_MENU_DOCK.hide();
                    });
                    tran_input.on('change', (ev) => {
                        PianoRhythm.TRANSPOSE = parseInt($(ev.target).val());
                    });
                }
            }
            PianoRhythmDock.SEARCH_BAR_SELECT = $(".prSearch select");
            PianoRhythmDock.SLOT_MODE_BUTTON = $("#slotsMode");
            let maxKeys = 88;
            let slotMessageShown = false;
            PianoRhythmDock.SLOT_MODE_BUTTON.click((e) => {
                if (PianoRhythmDock.SLOTS_LOCKED && e.originalEvent !== undefined)
                    return;
                PianoRhythmDock.SLOT_MODE_BUTTON.css({
                    "animation": "slotsMode 0.2s",
                });
                setTimeout(() => {
                    PianoRhythmDock.SLOT_MODE_BUTTON.css("animation", "none");
                }, 205);
                PianoRhythmDock.CURRENT_SLOT_MODE++;
                if (PianoRhythmDock.CURRENT_SLOT_MODE > SLOT_MODE.PIANO_8)
                    PianoRhythmDock.CURRENT_SLOT_MODE = SLOT_MODE.SINGLE;
                switch (PianoRhythmDock.CURRENT_SLOT_MODE) {
                    case SLOT_MODE.SINGLE:
                        if (PianoRhythmDock.DOCK_SLOT_ELEMENTS && PianoRhythmPlayer_1.PianoRhythmPlayer) {
                            for (let i in PianoRhythmDock.DOCK_SLOT_ELEMENTS) {
                                let element = PianoRhythmDock.DOCK_SLOT_ELEMENTS[i];
                                element.find("triangle").css({
                                    "border-color": "rgba(0,0,0,0) rgba(0,0,0,0) " + PianoRhythm.COLORS.base4 + " rgba(0,0,0,0)"
                                });
                            }
                            for (let k in Piano_1.Piano.KEYS) {
                                let key = Piano_1.Piano.KEYS[k];
                                key.reset();
                            }
                        }
                        break;
                    case SLOT_MODE.MULTI:
                        if (PianoRhythmDock.DOCK_SLOT_ELEMENTS && PianoRhythmPlayer_1.PianoRhythmPlayer) {
                            for (let i in PianoRhythmDock.DOCK_SLOT_ELEMENTS) {
                                let element = PianoRhythmDock.DOCK_SLOT_ELEMENTS[i];
                                let color = PianoRhythmPlayer_1.PianoRhythmPlayer.TRACK_COLORS[parseInt(i)];
                                element.find("triangle").css({
                                    "border-color": "rgba(0,0,0,0) rgba(0,0,0,0) " + color + " rgba(0,0,0,0)"
                                });
                            }
                            for (let k in Piano_1.Piano.KEYS) {
                                let key = Piano_1.Piano.KEYS[k];
                                key.reset();
                            }
                        }
                        break;
                    case SLOT_MODE.PIANO_2:
                        if (PianoRhythmDock.DOCK_SLOT_ELEMENTS && PianoRhythmPlayer_1.PianoRhythmPlayer) {
                            for (let i in PianoRhythmDock.DOCK_SLOT_ELEMENTS) {
                                let element = PianoRhythmDock.DOCK_SLOT_ELEMENTS[i];
                                let num = parseInt(i);
                                let color = (num < 2) ? PianoRhythmPlayer_1.PianoRhythmPlayer.TRACK_COLORS[num] : PianoRhythm.COLORS.base4;
                                element.find("triangle").css({
                                    "border-color": "rgba(0,0,0,0) rgba(0,0,0,0) " + color + " rgba(0,0,0,0)"
                                });
                            }
                            maxKeys = 51;
                            let color2;
                            for (let k in Piano_1.Piano.KEYS) {
                                let key = Piano_1.Piano.KEYS[k];
                                let color = key.type == "white" ? Piano_1.Piano.DEFAULT_WHITEKEY_COLOR : Piano_1.Piano.DEFAULT_BLACKKEY_COLOR;
                                if (key.key < maxKeys / 2) {
                                    color2 = pusher.color(PianoRhythmPlayer_1.PianoRhythmPlayer.TRACK_COLORS[1]).blend(color, 0.5).hex6();
                                    key.instrumentSlot = 1;
                                }
                                else {
                                    color2 = pusher.color(PianoRhythmPlayer_1.PianoRhythmPlayer.TRACK_COLORS[0]).blend(color, 0.5).hex6();
                                    key.instrumentSlot = 0;
                                }
                                let out = { color: color2, width: null, height: null, solid: null, rounded: null };
                                key.render = key.type == "white" ? Piano_1.Piano.WhiteKeyRender(null, out) : Piano_1.Piano.BlackKeyRender(null, out);
                            }
                        }
                        break;
                    case SLOT_MODE.PIANO_4:
                        if (PianoRhythmDock.DOCK_SLOT_ELEMENTS && PianoRhythmPlayer_1.PianoRhythmPlayer) {
                            for (let i in PianoRhythmDock.DOCK_SLOT_ELEMENTS) {
                                let element = PianoRhythmDock.DOCK_SLOT_ELEMENTS[i];
                                let num = parseInt(i);
                                let color = (num < 4) ? PianoRhythmPlayer_1.PianoRhythmPlayer.TRACK_COLORS[num] : PianoRhythm.COLORS.base4;
                                element.find("triangle").css({
                                    "border-color": "rgba(0,0,0,0) rgba(0,0,0,0) " + color + " rgba(0,0,0,0)"
                                });
                            }
                            maxKeys = 51;
                            let num, color3;
                            let divided = maxKeys / 4;
                            for (let k in Piano_1.Piano.KEYS) {
                                let key = Piano_1.Piano.KEYS[k];
                                let color = key.type == "white" ? Piano_1.Piano.DEFAULT_WHITEKEY_COLOR : Piano_1.Piano.DEFAULT_BLACKKEY_COLOR;
                                num = key.key;
                                if (num < divided) {
                                    color3 = pusher.color(PianoRhythmPlayer_1.PianoRhythmPlayer.TRACK_COLORS[0]).blend(color, 0.5).hex6();
                                    key.instrumentSlot = 1;
                                }
                                else if (num < divided * 2 && num > divided) {
                                    color3 = pusher.color(PianoRhythmPlayer_1.PianoRhythmPlayer.TRACK_COLORS[1]).blend(color, 0.5).hex6();
                                    key.instrumentSlot = 0;
                                }
                                else if (num > divided * 2 && num <= divided * 3) {
                                    color3 = pusher.color(PianoRhythmPlayer_1.PianoRhythmPlayer.TRACK_COLORS[2]).blend(color, 0.5).hex6();
                                    key.instrumentSlot = 2;
                                }
                                else if (num >= divided * 3) {
                                    color3 = pusher.color(PianoRhythmPlayer_1.PianoRhythmPlayer.TRACK_COLORS[3]).blend(color, 0.5).hex6();
                                    key.instrumentSlot = 3;
                                }
                                let out = { color: color3, width: null, height: null, solid: null, rounded: null };
                                key.render = key.type == "white" ? Piano_1.Piano.WhiteKeyRender(null, out) : Piano_1.Piano.BlackKeyRender(null, out);
                            }
                        }
                        break;
                    case SLOT_MODE.PIANO_8:
                        if (PianoRhythmDock.DOCK_SLOT_ELEMENTS && PianoRhythmPlayer_1.PianoRhythmPlayer) {
                            for (let i in PianoRhythmDock.DOCK_SLOT_ELEMENTS) {
                                let element = PianoRhythmDock.DOCK_SLOT_ELEMENTS[i];
                                let num = parseInt(i);
                                let color = PianoRhythmPlayer_1.PianoRhythmPlayer.TRACK_COLORS[num];
                                element.find("triangle").css({
                                    "border-color": "rgba(0,0,0,0) rgba(0,0,0,0) " + color + " rgba(0,0,0,0)"
                                });
                            }
                            maxKeys = 51;
                            let num, color4, startColor4;
                            let divided = maxKeys / 8;
                            for (let k in Piano_1.Piano.KEYS) {
                                let key = Piano_1.Piano.KEYS[k];
                                num = key.key;
                                let color = key.type == "white" ? Piano_1.Piano.DEFAULT_WHITEKEY_COLOR : Piano_1.Piano.DEFAULT_BLACKKEY_COLOR;
                                if (num < divided) {
                                    color4 = pusher.color(PianoRhythmPlayer_1.PianoRhythmPlayer.TRACK_COLORS[0]).blend(color, 0.5).hex6();
                                    key.instrumentSlot = 1;
                                }
                                else if (num < divided * 2 && num > divided) {
                                    color4 = pusher.color(PianoRhythmPlayer_1.PianoRhythmPlayer.TRACK_COLORS[1]).blend(color, 0.5).hex6();
                                    key.instrumentSlot = 0;
                                }
                                else if (num >= divided * 2 && num < divided * 3) {
                                    color4 = pusher.color(PianoRhythmPlayer_1.PianoRhythmPlayer.TRACK_COLORS[2]).blend(color, 0.5).hex6();
                                    key.instrumentSlot = 2;
                                }
                                else if (num >= divided * 3 && num < divided * 4) {
                                    color4 = pusher.color(PianoRhythmPlayer_1.PianoRhythmPlayer.TRACK_COLORS[3]).blend(color, 0.5).hex6();
                                    key.instrumentSlot = 3;
                                }
                                else if (num >= divided * 4 && num < divided * 5) {
                                    color4 = pusher.color(PianoRhythmPlayer_1.PianoRhythmPlayer.TRACK_COLORS[4]).blend(color, 0.5).hex6();
                                    key.instrumentSlot = 4;
                                }
                                else if (num >= divided * 5 && num < divided * 6) {
                                    color4 = pusher.color(PianoRhythmPlayer_1.PianoRhythmPlayer.TRACK_COLORS[5]).blend(color, 0.5).hex6();
                                    key.instrumentSlot = 5;
                                }
                                else if (num >= divided * 6 && num < divided * 7) {
                                    color4 = pusher.color(PianoRhythmPlayer_1.PianoRhythmPlayer.TRACK_COLORS[6]).blend(color, 0.5).hex6();
                                    key.instrumentSlot = 6;
                                }
                                else if (num >= divided * 7) {
                                    color4 = pusher.color(PianoRhythmPlayer_1.PianoRhythmPlayer.TRACK_COLORS[7]).blend(color, 0.5).hex6();
                                    key.instrumentSlot = 7;
                                }
                                let out = { color: color4, width: null, height: null, solid: null, rounded: null };
                                key.render = key.type == "white" ? Piano_1.Piano.WhiteKeyRender(null, out) : Piano_1.Piano.BlackKeyRender(null, out);
                            }
                        }
                        break;
                }
                PianoRhythmDock.SLOT_MODE_BUTTON.qtip('option', 'content.text', "Change the current slot mode! - Current Mode: " + SLOT_MODE[PianoRhythmDock.CURRENT_SLOT_MODE]);
                if (!slotMessageShown) {
                    PianoRhythm.notify({
                        message: "<span style='color: springgreen'>Slot Channel Mode: </span>" + SLOT_MODE[PianoRhythmDock.CURRENT_SLOT_MODE],
                        time: 1500,
                        onOpen: () => {
                            slotMessageShown = true;
                        },
                        onClose: () => {
                            slotMessageShown = false;
                        },
                        onClick: () => {
                            slotMessageShown = false;
                        }
                    });
                }
            });
            PianoRhythmDock.SEARCH_BAR_RESULTS = $(".prSearch results");
            let hideListButton = $("#hideList");
            PianoRhythmDock.HIDE_LIST_BUTTON = hideListButton;
            let hideListButtonTimer;
            hideListButton.click(() => {
                if (PianoRhythm.CONTEXT_MENU_DOCK)
                    PianoRhythm.CONTEXT_MENU_DOCK.hide();
                if (hideListButton.text().indexOf("Instrument") > -1) {
                    if (PianoRhythmPlayer_1.PianoRhythmPlayer.MIDI_SELECTION)
                        PianoRhythmPlayer_1.PianoRhythmPlayer.MIDI_SELECTION.hide();
                    if (AudioEngine_1.AudioEngine.RECORDED_LIST)
                        AudioEngine_1.AudioEngine.RECORDED_LIST.hide();
                    if (AudioEngine_1.AudioEngine.REVERB_LIST)
                        AudioEngine_1.AudioEngine.REVERB_LIST.hide();
                    if (PianoRhythm.INSTRUMENT_SELECTION) {
                        PianoRhythm.INSTRUMENT_SELECTION.show();
                        PianoRhythm.INSTRUMENT_SELECTION.showChildren(true, PianoRhythmDock.CURRENT_SEARCH_FILTER);
                    }
                    hideListButton.text("Hide List");
                }
                else if (hideListButton.text().indexOf("Midi") > -1) {
                    if (PianoRhythm.INSTRUMENT_SELECTION)
                        PianoRhythm.INSTRUMENT_SELECTION.hide();
                    if (AudioEngine_1.AudioEngine.RECORDED_LIST)
                        AudioEngine_1.AudioEngine.RECORDED_LIST.hide();
                    if (AudioEngine_1.AudioEngine.REVERB_LIST)
                        AudioEngine_1.AudioEngine.REVERB_LIST.hide();
                    if (PianoRhythmPlayer_1.PianoRhythmPlayer.MIDI_SELECTION)
                        PianoRhythmPlayer_1.PianoRhythmPlayer.MIDI_SELECTION.show();
                    hideListButton.text("Hide List");
                }
                else if (hideListButton.text().indexOf("Reverb") > -1) {
                    if (PianoRhythm.INSTRUMENT_SELECTION)
                        PianoRhythm.INSTRUMENT_SELECTION.hide();
                    if (PianoRhythmPlayer_1.PianoRhythmPlayer.MIDI_SELECTION)
                        PianoRhythmPlayer_1.PianoRhythmPlayer.MIDI_SELECTION.hide();
                    if (AudioEngine_1.AudioEngine.REVERB_LIST)
                        AudioEngine_1.AudioEngine.REVERB_LIST.show();
                    hideListButton.text("Hide List");
                }
                else {
                    if (AudioEngine_1.AudioEngine.RECORDED_LIST)
                        AudioEngine_1.AudioEngine.RECORDED_LIST.hide();
                    if (PianoRhythm.INSTRUMENT_SELECTION)
                        PianoRhythm.INSTRUMENT_SELECTION.hide();
                    if (PianoRhythmPlayer_1.PianoRhythmPlayer.MIDI_SELECTION)
                        PianoRhythmPlayer_1.PianoRhythmPlayer.MIDI_SELECTION.hide();
                    if (AudioEngine_1.AudioEngine.REVERB_LIST)
                        AudioEngine_1.AudioEngine.REVERB_LIST.hide();
                    if (PianoRhythmDock.SEARCH_BAR_RESULTS)
                        PianoRhythmDock.SEARCH_BAR_RESULTS.text("");
                    if (PianoRhythmDock.SEARCH_BAR_INPUT)
                        PianoRhythmDock.SEARCH_BAR_INPUT.val("");
                    hideListButton.fadeOut("fast");
                }
            });
            PianoRhythmDock.SEARCH_BAR_SELECT.change(function (e) {
                if (PianoRhythm.CONTEXT_MENU_DOCK)
                    PianoRhythm.CONTEXT_MENU_DOCK.hide();
                if (PianoRhythm.CLIENT)
                    PianoRhythm.CLIENT_FOCUS = CLIENT_FOCUS.MIDISEARCH;
                let $this = $(this);
                let text = $this.find("option:selected").text();
                let width = PianoRhythm.getTextWidth(text, "18px Lucida Sans Unicode");
                $this.width(Math.floor(width) + 1);
                PianoRhythmDock.CURRENT_SEARCH_FILTER = $this.val();
                if (PianoRhythmDock.CURRENT_SEARCH_FILTER.indexOf("midi") > -1) {
                    if (AudioEngine_1.AudioEngine.RECORDED_LIST)
                        AudioEngine_1.AudioEngine.RECORDED_LIST.hide();
                    if (PianoRhythm.INSTRUMENT_SELECTION)
                        PianoRhythm.INSTRUMENT_SELECTION.hide();
                    if (AudioEngine_1.AudioEngine.REVERB_LIST)
                        AudioEngine_1.AudioEngine.REVERB_LIST.hide();
                    if (PianoRhythmPlayer_1.PianoRhythmPlayer.MIDI_SELECTION)
                        PianoRhythmPlayer_1.PianoRhythmPlayer.MIDI_SELECTION.show();
                }
                else if (PianoRhythmDock.CURRENT_SEARCH_FILTER.indexOf("instrument") > -1) {
                    if (AudioEngine_1.AudioEngine.RECORDED_LIST)
                        AudioEngine_1.AudioEngine.RECORDED_LIST.hide();
                    if (PianoRhythmPlayer_1.PianoRhythmPlayer.MIDI_SELECTION)
                        PianoRhythmPlayer_1.PianoRhythmPlayer.MIDI_SELECTION.hide();
                    if (AudioEngine_1.AudioEngine.REVERB_LIST)
                        AudioEngine_1.AudioEngine.REVERB_LIST.hide();
                    if (PianoRhythm.INSTRUMENT_SELECTION)
                        PianoRhythm.INSTRUMENT_SELECTION.show();
                }
                else if (PianoRhythmDock.CURRENT_SEARCH_FILTER.indexOf("reverb") > -1) {
                    if (PianoRhythm.INSTRUMENT_SELECTION)
                        PianoRhythm.INSTRUMENT_SELECTION.hide();
                    if (PianoRhythmPlayer_1.PianoRhythmPlayer.MIDI_SELECTION)
                        PianoRhythmPlayer_1.PianoRhythmPlayer.MIDI_SELECTION.hide();
                    if (AudioEngine_1.AudioEngine.RECORDED_LIST)
                        AudioEngine_1.AudioEngine.RECORDED_LIST.hide();
                    if (AudioEngine_1.AudioEngine.REVERB_LIST)
                        AudioEngine_1.AudioEngine.REVERB_LIST.show();
                }
                PianoRhythmDock.ShowFilterList();
                hideListButton.text("Hide List");
                hideListButton.show();
            });
            PianoRhythmDock.SEARCH_BAR_SELECT.on('mouseup', function (e) {
                let $this = $(this);
                let text = $this.find("option:selected").text();
                if (hideListButton && hideListButton.length) {
                    clearTimeout(hideListButtonTimer);
                    if (PianoRhythm.INSTRUMENT_SELECTION && PianoRhythm.INSTRUMENT_SELECTION.visible) {
                        return;
                    }
                    if (PianoRhythmPlayer_1.PianoRhythmPlayer.MIDI_SELECTION && PianoRhythmPlayer_1.PianoRhythmPlayer.MIDI_SELECTION.visible) {
                        return;
                    }
                    if (AudioEngine_1.AudioEngine.REVERB_LIST && AudioEngine_1.AudioEngine.REVERB_LIST.visible)
                        return;
                    if (AudioEngine_1.AudioEngine.RECORDED_LIST && AudioEngine_1.AudioEngine.RECORDED_LIST.visible)
                        return;
                    if (!hideListButton.is(":visible")) {
                        hideListButton.show();
                        if (text.indexOf("Instrument") > -1)
                            hideListButton.text("Show Instrument List");
                        else if (text.indexOf("Midi") > -1)
                            hideListButton.text("Show Midi Files List");
                        else
                            hideListButton.text("Show Reverb Types List");
                        hideListButtonTimer = setTimeout(() => {
                            if (PianoRhythm.INSTRUMENT_SELECTION && PianoRhythm.INSTRUMENT_SELECTION.visible) {
                                return;
                            }
                            if (PianoRhythmPlayer_1.PianoRhythmPlayer.MIDI_SELECTION && PianoRhythmPlayer_1.PianoRhythmPlayer.MIDI_SELECTION.visible) {
                                return;
                            }
                            if (AudioEngine_1.AudioEngine.REVERB_LIST && AudioEngine_1.AudioEngine.REVERB_LIST.visible)
                                return;
                            if (AudioEngine_1.AudioEngine.RECORDED_LIST && AudioEngine_1.AudioEngine.RECORDED_LIST.visible)
                                return;
                            hideListButton.fadeOut(10, "linear", () => {
                                hideListButton.text("Clear");
                            });
                        }, 5000);
                    }
                }
            });
            PianoRhythmDock.SEARCH_BAR_SELECT.trigger("change");
            hideListButton.trigger("click");
            PianoRhythmDock.SEARCH_BAR_INPUT = $(".prSearch input");
            PianoRhythmDock.DOCK_SLOTS = $(".slots");
            PianoRhythmDock.DOCK_SLOTS.fadeIn("slow");
            PianoRhythmDock.DOCK_SLOTS.find("ul").children().each(function (index) {
                index = parseInt(index);
                PianoRhythmDock.DOCK_SLOT_ELEMENTS[index] = $(this);
                PianoRhythmDock.DOCK_SLOT_ELEMENTS[index].data("slot", index);
                PianoRhythmDock.DOCK_SLOT_ELEMENTS[index].click(PianoRhythmDock.slotCLICK.bind(this));
                PianoRhythmDock.DOCK_SLOT_ELEMENTS[index].attr("title", "Click me to insert an instrument here!");
                PianoRhythmDock.DOCK_SLOT_ELEMENTS[index].qtip();
                PianoRhythmDock.DOCK_SLOT_ELEMENTS[index].on("dragenter dragover", (ev) => {
                    if (PianoRhythmDock.SLOTS_LOCKED)
                        return;
                    ev.preventDefault();
                    let me = $(this);
                    if (!me.hasClass("beat")) {
                        me.addClass("beat");
                        PianoRhythmDock.DOCK_SLOTS.css({ "opacity": 1, "transition": "all 0.1s" });
                        ev.originalEvent.dataTransfer.dropEffect = "move";
                        if (PianoRhythmDock.ACTIVE_SLOT_OPTIONS) {
                            PianoRhythmDock.ACTIVE_SLOT_OPTIONS.remove();
                            PianoRhythmDock.ACTIVE_SLOT_OPTIONS = null;
                        }
                    }
                });
                PianoRhythmDock.DOCK_SLOT_ELEMENTS[index].on("dragleave", (ev) => {
                    if (PianoRhythmDock.SLOTS_LOCKED)
                        return;
                    ev.preventDefault();
                    let me = $(this);
                    if (me.hasClass("beat")) {
                        me.removeClass("beat");
                    }
                });
                PianoRhythmDock.DOCK_SLOT_ELEMENTS[index].on("dragover2", (ev) => {
                    ev.preventDefault();
                });
                PianoRhythmDock.DOCK_SLOT_ELEMENTS[index].on("drop", (ev) => {
                    index = parseInt(index);
                    if (PianoRhythmDock.SLOTS_LOCKED)
                        return;
                    ev.preventDefault();
                    let me = $(this);
                    if (me.hasClass("beat")) {
                        me.removeClass("beat");
                        if (PianoRhythmDock.ACTIVE_SLOT_OPTIONS) {
                            PianoRhythmDock.ACTIVE_SLOT_OPTIONS.remove();
                            PianoRhythmDock.ACTIVE_SLOT_OPTIONS = null;
                        }
                        let incoming_instrumentName = ev.originalEvent.dataTransfer.getData("text");
                        let incoming_instrument = Piano_1.Piano.INSTRUMENTS[incoming_instrumentName];
                        let existing_instrument = PianoRhythmDock.DOCK_INSTRUMENTS[index];
                        if (incoming_instrument) {
                            if (existing_instrument)
                                PianoRhythmDock.reloadSlot(incoming_instrument.currentSlot, true, existing_instrument);
                            PianoRhythmDock.reloadSlot(index, true, incoming_instrument);
                        }
                    }
                });
                PianoRhythmDock.DOCK_SLOT_ELEMENTS[index].attr("draggable", true);
                PianoRhythmDock.DOCK_SLOT_ELEMENTS[index].on("dragstart", (ev) => {
                    PianoRhythm.draggingInstrumentItem = true;
                    if (PianoRhythmDock.SLOTS_LOCKED)
                        return;
                    if (PianoRhythmDock.DOCK_INSTRUMENTS[index]) {
                        ev.originalEvent.dataTransfer.setData("text/plain", PianoRhythmDock.DOCK_INSTRUMENTS[index].instrumentName);
                        $('body').css({
                            cursor: 'url("../images/icons/cursors/x1/dnd-move.png") 15 0, auto !important'
                        });
                    }
                });
                PianoRhythmDock.DOCK_SLOT_ELEMENTS[index].on("dragend", (ev) => {
                    PianoRhythm.draggingInstrumentItem = false;
                    if (PianoRhythmDock.SLOTS_LOCKED)
                        return;
                    if (ev.originalEvent.dataTransfer.dropEffect === "none") {
                        if (PianoRhythmDock.DOCK_INSTRUMENTS[index]) {
                            if (PianoRhythmDock.AtleastOneInstrumentLeft(index))
                                PianoRhythmDock.removeSlot(index);
                        }
                    }
                });
            });
            if (PianoRhythm.CONTEXT_MENU_DOCK && PianoRhythm.CONTEXT_MENU_DOCK.length) {
                let dockImport = PianoRhythm.CONTEXT_MENU_DOCK.find("#dock_Import_input");
                let fr = new FileReader();
                if (dockImport) {
                    dockImport.change(function (evt) {
                        let fileList = evt.target.files;
                        if (fileList[0]) {
                            fr.readAsText(fileList[0]);
                            fr.onload = (e) => {
                                let file = e.target["result"];
                                try {
                                    let parsedFile = JSON.parse(file);
                                    if (!Array.isArray(parsedFile))
                                        throw "err";
                                    PianoRhythm.notify("Importing instruments into the dock...");
                                    for (let p = 0; p < parsedFile.length; p++) {
                                        let instrument = Piano_1.Piano.INSTRUMENTS[parsedFile[p]];
                                        if (instrument) {
                                            PianoRhythmDock.reloadSlot(p, true, instrument);
                                        }
                                    }
                                }
                                catch (err) {
                                    PianoRhythm.notify("Something went wrong. Unable to parse the file.");
                                }
                            };
                        }
                        dockImport.attr("value", "");
                        this.value = null;
                    });
                }
                PianoRhythm.CONTEXT_MENU_DOCK.children().click((e) => {
                    let item = e.target;
                    let $item = $(item);
                    let itemParent = $item.parent();
                    let id = $item[0].id || itemParent[0].id;
                    let itemData = itemParent.parent().data();
                    switch (id) {
                        case "dock_Reset":
                            PianoRhythmDock.removeAllSlots(true);
                            PianoRhythmDock.reloadSlot(0, true, Piano_1.Piano.INSTRUMENTS["high_quality_acoustic_grand_piano"]);
                            PianoRhythm.CONTEXT_MENU_DOCK.hide();
                            break;
                        case "dock_Import":
                            if (dockImport)
                                dockImport.trigger('click');
                            PianoRhythm.CONTEXT_MENU_DOCK.hide();
                            break;
                        case "dock_Export":
                            PianoRhythm.saveData(PianoRhythmDock.getInstrumentsFromSlots(), "PianoRhythmDock.prdock");
                            PianoRhythm.notify("The dock was successfully exported to the disk", 2000);
                            PianoRhythm.CONTEXT_MENU_DOCK.hide();
                            break;
                    }
                });
            }
            PianoRhythmDock.DOCK_SLOTS.contextmenu((e) => {
                if (PianoRhythm.CONTEXT_MENU_DOCK && PianoRhythm.CONTEXT_MENU_DOCK.length) {
                    PianoRhythm.CONTEXT_MENU_DOCK.show();
                    PianoRhythm.CONTEXT_MENU_DOCK.css({
                        "left": e.clientX,
                        "top": e.clientY - PianoRhythm.CONTEXT_MENU_DOCK.height()
                    });
                }
                e.preventDefault();
            });
            let timeSinceLastPress = Date.now();
            PianoRhythmDock.SEARCH_BAR_INPUT.on('click', '.ui-input-clear', function () {
            });
            PianoRhythmDock.SEARCH_BAR_INPUT.on('focus', function (e) {
                PianoRhythm.CLIENT_FOCUS = CLIENT_FOCUS.MIDISEARCH;
            });
            PianoRhythmDock.SEARCH_BAR_INPUT.on('mouseleave', function (e) {
            });
            PianoRhythmDock.SEARCH_BAR_INPUT.on('keydown', function (e) {
                if (PianoRhythm.CLIENT) {
                    if (PianoRhythm.CLIENT_FOCUS === CLIENT_FOCUS.PIANO) {
                        PianoRhythmDock.SEARCH_BAR_INPUT.blur();
                        return;
                    }
                    PianoRhythm.CLIENT_FOCUS = CLIENT_FOCUS.MIDISEARCH;
                }
            });
            PianoRhythmDock.SEARCH_BAR_INPUT.on('keyup', function (e) {
                let value = PianoRhythmDock.SEARCH_BAR_INPUT.val();
                switch (PianoRhythmDock.CURRENT_SEARCH_FILTER) {
                    case "midi_all":
                    case "midi_favorites":
                        if (PianoRhythmPlayer_1.PianoRhythmPlayer.MIDI_SELECTION && PianoRhythmPlayer_1.PianoRhythmPlayer.MIDI_SELECTION.visible) {
                            if (value !== undefined && value.length <= 0) {
                                if (PianoRhythmPlayer_1.PianoRhythmPlayer.MIDI_SELECTION)
                                    PianoRhythmPlayer_1.PianoRhythmPlayer.MIDI_SELECTION.hide();
                                if (PianoRhythmDock.SEARCH_BAR_RESULTS)
                                    PianoRhythmDock.SEARCH_BAR_RESULTS.text("");
                                hideListButton.fadeOut();
                            }
                        }
                        else if (PianoRhythmPlayer_1.PianoRhythmPlayer.MIDI_SELECTION && !PianoRhythmPlayer_1.PianoRhythmPlayer.MIDI_SELECTION.visible) {
                            if (value !== undefined && value.length > 0) {
                                if (PianoRhythmPlayer_1.PianoRhythmPlayer.MIDI_SELECTION)
                                    PianoRhythmPlayer_1.PianoRhythmPlayer.MIDI_SELECTION.show();
                                if (PianoRhythm.INSTRUMENT_SELECTION)
                                    PianoRhythm.INSTRUMENT_SELECTION.hide();
                                hideListButton.fadeIn();
                            }
                        }
                        else {
                            if (PianoRhythm.INSTRUMENT_SELECTION)
                                PianoRhythm.INSTRUMENT_SELECTION.hide();
                            hideListButton.fadeOut();
                        }
                        break;
                    case "reverb_all":
                        break;
                    default:
                        if (PianoRhythm.INSTRUMENT_SELECTION && PianoRhythm.INSTRUMENT_SELECTION.visible) {
                            if (value !== undefined && value.length <= 0) {
                                PianoRhythmDock.CURRENT_SEARCH_FILTER = "instruments_all";
                                if (PianoRhythm.INSTRUMENT_SELECTION)
                                    PianoRhythm.INSTRUMENT_SELECTION.hide();
                                if (PianoRhythmDock.SEARCH_BAR_RESULTS)
                                    PianoRhythmDock.SEARCH_BAR_RESULTS.text("");
                                hideListButton.fadeOut();
                                return;
                            }
                            if (Date.now() - timeSinceLastPress > 100) {
                                let array = PianoRhythm.INSTRUMENT_SELECTION.origItems;
                                hideListButton.fadeIn();
                                if (value.length > 0)
                                    if (array && array.length) {
                                        let searchedList = [];
                                        for (let i in array) {
                                            let instrument = array[i];
                                            if (instrument.title.toLowerCase().indexOf(value.toLowerCase()) > -1) {
                                                searchedList.push(instrument.instrument);
                                            }
                                        }
                                        PianoRhythm.INSTRUMENT_SELECTION.setSearchListArray(searchedList, array, PianoRhythmDock.CURRENT_SEARCH_FILTER);
                                    }
                            }
                        }
                        else if (PianoRhythm.INSTRUMENT_SELECTION && !PianoRhythm.INSTRUMENT_SELECTION.visible) {
                            if (value !== undefined && value.length > 0) {
                                if (PianoRhythm.INSTRUMENT_SELECTION)
                                    PianoRhythm.INSTRUMENT_SELECTION.show();
                                if (PianoRhythmPlayer_1.PianoRhythmPlayer.MIDI_SELECTION)
                                    PianoRhythmPlayer_1.PianoRhythmPlayer.MIDI_SELECTION.hide();
                                hideListButton.fadeIn();
                            }
                        }
                        break;
                }
                timeSinceLastPress = Date.now();
            });
            if (PianoRhythm.SETTINGS["displayDock2"] !== undefined) {
                if (PianoRhythmDock.DOCK_SLOTS)
                    if (!PianoRhythm.SETTINGS["displayDock2"]) {
                        PianoRhythmDock.DOCK_SLOTS.hide();
                        PianoRhythmDock.SLOT_MODE_BUTTON.hide();
                        PianoRhythmDock.SEARCH_BAR_SELECT.hide();
                        PianoRhythmDock.SEARCH_BAR_INPUT.hide();
                        PianoRhythmDock.OCTAVE.hide();
                        PianoRhythmDock.TRANSPOSE.hide();
                    }
                    else {
                        PianoRhythmDock.DOCK_SLOTS.show();
                        PianoRhythmDock.SLOT_MODE_BUTTON.show();
                        PianoRhythmDock.SEARCH_BAR_SELECT.show();
                        PianoRhythmDock.OCTAVE.show();
                        PianoRhythmDock.TRANSPOSE.show();
                        PianoRhythmDock.SEARCH_BAR_INPUT.show();
                    }
            }
            if (PianoRhythm.SETTINGS["displayDock1"] !== undefined) {
                if (PianoRhythmDock.DOCK_SLOTS)
                    if (!PianoRhythm.SETTINGS["displayDock1"]) {
                        PianoRhythmDock.SEARCH_BAR_SELECT.hide();
                        PianoRhythmDock.SEARCH_BAR_INPUT.hide();
                        PianoRhythmDock.OCTAVE.hide();
                        PianoRhythmDock.TRANSPOSE.hide();
                    }
                    else {
                        PianoRhythmDock.SEARCH_BAR_SELECT.show();
                        PianoRhythmDock.OCTAVE.show();
                        PianoRhythmDock.TRANSPOSE.show();
                        PianoRhythmDock.SEARCH_BAR_INPUT.show();
                    }
            }
            resolve(true);
            PianoRhythmDock.INITIALIZED = true;
            if (PianoRhythm.EVENT_EMITTER)
                PianoRhythm.EVENT_EMITTER.emit("dockLoaded");
            if (PianoRhythm.DEBUG_MESSAGING)
                console.info("Dock initialized.");
            setTimeout(() => {
                Piano_1.Piano.checkForDock();
            }, 1000);
        });
    }
    static AtleastOneInstrumentLeft(index) {
        for (let i in PianoRhythmDock.DOCK_INSTRUMENTS) {
            if (parseInt(i) < 0)
                continue;
            let inst = PianoRhythmDock.DOCK_INSTRUMENTS[i];
            if (inst !== null && inst.currentSlot !== -1 && parseInt(i) !== index)
                return true;
        }
        return false;
    }
    static firstAvailableInstrument() {
        for (let i in PianoRhythmDock.DOCK_INSTRUMENTS) {
            if (PianoRhythmDock.DOCK_INSTRUMENTS.hasOwnProperty(i)) {
                let inst = PianoRhythmDock.DOCK_INSTRUMENTS[i];
                if (inst !== null)
                    return {
                        index: i,
                        inst: inst
                    };
            }
        }
        return null;
    }
    static reloadSlot(index, load, loadInstrument, loadCallback) {
        return new Promise((resolve, reject) => {
            index = parseInt(index);
            if (index < 0 || index === null || index === undefined) {
                reject(true);
                return;
            }
            let element = PianoRhythmDock.DOCK_SLOT_ELEMENTS[(index)];
            if (element) {
                element.css({
                    "background-image": "url(../images/icons/essential/infinity.png)"
                });
                element.attr("title", "Loading...");
            }
            function finalizeSlot() {
                if (loadInstrument)
                    PianoRhythmDock.DOCK_INSTRUMENTS[index] = loadInstrument;
                let instrument;
                if (index !== undefined)
                    instrument = PianoRhythmDock.DOCK_INSTRUMENTS[index];
                if (instrument && PianoRhythmDock.DOCK_SLOT_ELEMENTS) {
                    if (element && instrument.imageSrc) {
                        element.css({
                            "background-image": "url(" + instrument.imageSrc + ")"
                        });
                        element.attr("title", "Slot " + (parseInt(index) + 1) + " | " + PianoRhythm.titleCase(instrument.title));
                        element.qtip();
                    }
                    for (let t in PianoRhythmDock.DOCK_SLOT_ELEMENTS) {
                        let l = PianoRhythmDock.DOCK_SLOT_ELEMENTS[t];
                        if (l)
                            l.css("border-color", "");
                    }
                    PianoRhythmDock.SINGLE_ACTIVE_SLOT = index;
                    if (PianoRhythmDock.DOCK_SLOT_ELEMENTS[PianoRhythmDock.SINGLE_ACTIVE_SLOT])
                        PianoRhythmDock.DOCK_SLOT_ELEMENTS[PianoRhythmDock.SINGLE_ACTIVE_SLOT].css("border-color", "white");
                    instrument.currentSlot = index;
                }
            }
            if (load && loadInstrument) {
                loadInstrument.setActive(index, true).then(() => {
                    finalizeSlot();
                    if (loadCallback)
                        loadCallback();
                    resolve(true);
                });
            }
            else {
                resolve(true);
                finalizeSlot();
            }
        });
    }
    static removeSlot(index, bypass = false) {
        index = parseInt(index);
        if (PianoRhythmDock.DOCK_INSTRUMENTS[(index)]) {
            if (PianoRhythmDock.DOCK_SLOT_ELEMENTS[(index)]) {
                PianoRhythmDock.DOCK_SLOT_ELEMENTS[(index)].css({
                    "background-image": ""
                }).attr("title", "Insert an instrument here!");
                PianoRhythmDock.DOCK_SLOT_ELEMENTS[(index)].qtip();
                PianoRhythmDock.DOCK_SLOT_ELEMENTS[index].css("border-color", "");
            }
            PianoRhythmDock.DOCK_INSTRUMENTS[(index)].removeFolderActive();
            PianoRhythmDock.DOCK_INSTRUMENTS[(index)] = null;
            if (bypass)
                return;
            let inst = PianoRhythmDock.firstAvailableInstrument();
            if (inst)
                PianoRhythmDock.reloadSlot(inst.index, true, inst.inst);
        }
    }
    static removeAllSlots(bypass) {
        for (let i = 0; i < 8; i++)
            PianoRhythmDock.removeSlot(i, bypass);
    }
    static reloadDock() {
        for (let i in PianoRhythmDock.DOCK_INSTRUMENTS) {
            PianoRhythmDock.reloadSlot(i);
        }
    }
    static slotCLICK() {
        let me = $(this);
        let popup = $('.slotOptions');
        if (popup.length > 0) {
            popup.remove();
        }
        let slotOptions;
        let items = $(document.createElement('ul'));
        for (let i = 0; i < 4; i++) {
            let item = $(document.createElement('li'));
            let background = "";
            ((i, item) => {
                let myInstrument = PianoRhythmDock.DOCK_INSTRUMENTS[me.data("slot")];
                switch (i) {
                    case 0:
                        {
                            background = "windows-2";
                            item.attr("title", "Change the current instrument for this slot!");
                            item.click(() => {
                                item.css({
                                    "animation": "settings 0.2s",
                                });
                                setTimeout(() => {
                                    item.css("animation", "none");
                                }, 205);
                                if (PianoRhythm.INSTRUMENT_SELECTION) {
                                    PianoRhythmDock.CURRENT_SEARCH_FILTER = "instruments_all";
                                    PianoRhythmDock.SEARCH_BAR_SELECT.val("instruments_all");
                                    let width = PianoRhythm.getTextWidth("Instruments - All", "18px Lucida Sans Unicode");
                                    PianoRhythmDock.SEARCH_BAR_SELECT.width(Math.floor(width) + 1);
                                    if (PianoRhythmPlayer_1.PianoRhythmPlayer.MIDI_SELECTION)
                                        PianoRhythmPlayer_1.PianoRhythmPlayer.MIDI_SELECTION.hide();
                                    if (AudioEngine_1.AudioEngine.REVERB_LIST)
                                        AudioEngine_1.AudioEngine.REVERB_LIST.hide();
                                    if (AudioEngine_1.AudioEngine.RECORDED_LIST)
                                        AudioEngine_1.AudioEngine.RECORDED_LIST.hide();
                                    PianoRhythm.INSTRUMENT_SELECTION.toggle();
                                    if (PianoRhythm.INSTRUMENT_SELECTION.visible) {
                                        PianoRhythmDock.ShowFilterList();
                                        PianoRhythmDock.HIDE_LIST_BUTTON.show();
                                    }
                                }
                            });
                        }
                        break;
                    case 1:
                        {
                            background = "speaker-4";
                            let clicked = item.data("clicked") || false;
                            item.attr("title", "Mute this slot channel! (Feature not available yet)");
                            item.click(() => {
                                let clicked = item.data("clicked");
                                let title = (clicked) ? "Mute this slot channel!" : "Unmute this slot channel!";
                                item.attr("title", title);
                                let image = item.data("clicked") ? "speaker-4" : "speaker-8";
                                item.css({
                                    "animation": "heart 0.2s",
                                    "background-image": "url(../images/icons/essential/" + image + ".png"
                                });
                                setTimeout(() => {
                                    item.css("animation", "none");
                                }, 205);
                                item.data("clicked", !clicked);
                            });
                        }
                        break;
                    case 2:
                        {
                            if (myInstrument !== undefined && myInstrument !== null) {
                                let favorite = myInstrument.favorited;
                                background = !favorite ? "like-0" : "like-1";
                                let title = (!favorite) ? "Add this instrument to your favorites list!" : "Remove this instrument from your favorites list!";
                                item.attr("title", title);
                                item.click(() => {
                                    let title = (myInstrument.favorited) ? "Add this instrument to your favorites list!" : "Remove this instrument from your favorites list!";
                                    item.attr("title", title);
                                    let image = myInstrument.favorited ? "like-0" : "like-1";
                                    item.css({
                                        "animation": "heart 0.2s",
                                        "background-image": "url(../images/icons/essential/" + image + ".png"
                                    });
                                    setTimeout(() => {
                                        item.css("animation", "none");
                                    }, 205);
                                    if (myInstrument !== undefined && myInstrument !== null)
                                        myInstrument.favorited = !myInstrument.favorited;
                                });
                            }
                            else
                                background = "like-0";
                        }
                        break;
                    case 3:
                        {
                            if (myInstrument !== undefined && myInstrument !== null && PianoRhythmDock.CURRENT_SLOT_MODE === SLOT_MODE.SINGLE) {
                                let active = (PianoRhythmDock.SINGLE_ACTIVE_SLOT === me.data("slot"));
                                background = active ? "stop-1" : "play-button";
                                let title = (!active) ? "Activate this instrument!" : "This slot is now active!";
                                item.attr("title", title);
                                item.click(() => {
                                    if (!active) {
                                        let title = (active) ? "Activate this instrument!" : "This slot is now active!";
                                        item.attr("title", title);
                                        let image = !active ? "stop-1" : "play-button";
                                        item.css({
                                            "animation": "heart 0.2s",
                                            "background-image": "url(../images/icons/essential/" + image + ".png"
                                        });
                                        setTimeout(() => {
                                            item.css("animation", "none");
                                        }, 205);
                                        for (let t in PianoRhythmDock.DOCK_SLOT_ELEMENTS) {
                                            let l = PianoRhythmDock.DOCK_SLOT_ELEMENTS[t];
                                            if (l)
                                                l.css("border-color", "");
                                        }
                                        myInstrument.load(0, true);
                                        PianoRhythmDock.SINGLE_ACTIVE_SLOT = me.data("slot");
                                        PianoRhythmDock.DOCK_SLOT_ELEMENTS[PianoRhythmDock.SINGLE_ACTIVE_SLOT].css("border-color", "white");
                                    }
                                });
                            }
                            else
                                background = "error";
                        }
                        break;
                }
            })(i, item);
            item.css({
                "transition": "all 0.2s",
                "background-image": "url(../images/icons/essential/" + background + ".png"
            });
            item.qtip({
                position: {
                    my: "left center",
                    at: "right center"
                }
            });
            items.append(item);
        }
        slotOptions = $(document.createElement("div")).attr({
            "class": "slotOptions",
        }).append(items).fadeIn("fast").insertAfter($('body'));
        slotOptions.css({
            left: me.offset().left,
            top: me.offset().top - slotOptions.height() - 10 + "px",
            "border-color": PianoRhythm.COLORS.base4
        });
        PianoRhythmDock.ACTIVE_SLOT_OPTIONS = slotOptions;
        let timer;
        function removeFunction() {
            slotOptions.fadeOut().remove();
            try {
                items.children().qtip('api').destroy();
            }
            catch (err) {
            }
            PianoRhythmDock.ACTIVE_SLOT_OPTIONS = null;
        }
        slotOptions.hover(function () {
            clearTimeout(timer);
        }, function () {
            timer = setTimeout(removeFunction, 1500);
        });
        timer = setTimeout(removeFunction, 1500);
        if (PianoRhythm.CLIENT)
            PianoRhythm.CLIENT_FOCUS = CLIENT_FOCUS.MIDISEARCH;
    }
    ;
    static getInstrumentsFromSlots() {
        let iArray = [];
        for (let i in PianoRhythmDock.DOCK_INSTRUMENTS) {
            if (PianoRhythmDock.DOCK_INSTRUMENTS.hasOwnProperty(i)) {
                let inst = PianoRhythmDock.DOCK_INSTRUMENTS[i];
                if (inst && inst.instrument)
                    iArray.push(inst.instrument);
            }
        }
        return iArray;
    }
    static hideTopBar() {
        if (PianoRhythmDock.SEARCH_BAR && PianoRhythmDock.OCTAVE && PianoRhythmDock.TRANSPOSE && PianoRhythmDock.SEARCH_BAR_SELECT) {
            PianoRhythmDock.SEARCH_BAR.css({ "opacity": 0, "pointer-events": "none" });
            PianoRhythmDock.OCTAVE.css({ "opacity": 0, "pointer-events": "none" });
            PianoRhythmDock.TRANSPOSE.css({ "opacity": 0, "pointer-events": "none" });
            PianoRhythmDock.SEARCH_BAR_SELECT.css({ "opacity": 0, "pointer-events": "none" });
        }
    }
    static unhideTopBar() {
        if (PianoRhythmDock.SEARCH_BAR && PianoRhythmDock.OCTAVE && PianoRhythmDock.TRANSPOSE && PianoRhythmDock.SEARCH_BAR_SELECT) {
            PianoRhythmDock.SEARCH_BAR.css({ "opacity": "", "pointer-events": "" });
            PianoRhythmDock.OCTAVE.css({ "opacity": "", "pointer-events": "" });
            PianoRhythmDock.TRANSPOSE.css({ "opacity": "", "pointer-events": "" });
            PianoRhythmDock.SEARCH_BAR_SELECT.css({ "opacity": "", "pointer-events": "" });
        }
    }
    static hideSlots() {
        if (PianoRhythmDock.DOCK_SLOTS && PianoRhythmDock.SLOT_MODE_BUTTON) {
            PianoRhythmDock.DOCK_SLOTS.css({ "opacity": 0, "pointer-events": "none" });
            PianoRhythmDock.SLOT_MODE_BUTTON.css({ "opacity": 0, "pointer-events": "none" });
        }
    }
    static unhideSlots() {
        if (PianoRhythmDock.DOCK_SLOTS && PianoRhythmDock.SLOT_MODE_BUTTON) {
            PianoRhythmDock.DOCK_SLOTS.css({ "opacity": "", "pointer-events": "" });
            PianoRhythmDock.SLOT_MODE_BUTTON.css({ "opacity": "", "pointer-events": "" });
        }
    }
    static setOffsetPosition() {
        if (PianoRhythm.SIDEBAR_OFFSET === 0) {
            if (PianoRhythmDock.DOCK_SLOTS && PianoRhythmDock.DOCK_SLOTS.length)
                PianoRhythmDock.DOCK_SLOTS.css("left", "calc(50vw - 250px)");
            if (PianoRhythmDock.TRANSPOSE && PianoRhythmDock.TRANSPOSE.length)
                PianoRhythmDock.TRANSPOSE.css("left", "calc(50vw - 250px)");
            if (PianoRhythmDock.OCTAVE && PianoRhythmDock.OCTAVE.length)
                PianoRhythmDock.OCTAVE.css("left", "calc(50vw - 112px)");
            if (PianoRhythmDock.SEARCH_BAR && PianoRhythmDock.SEARCH_BAR.length)
                PianoRhythmDock.SEARCH_BAR.css("left", "calc(50vw - 7px)");
        }
        else {
            if (PianoRhythmDock.DOCK_SLOTS && PianoRhythmDock.DOCK_SLOTS.length)
                PianoRhythmDock.DOCK_SLOTS.css("left", "calc(50vw - 150px)");
            if (PianoRhythmDock.TRANSPOSE && PianoRhythmDock.TRANSPOSE.length)
                PianoRhythmDock.TRANSPOSE.css("left", "calc(50vw - 150px)");
            if (PianoRhythmDock.OCTAVE && PianoRhythmDock.OCTAVE.length)
                PianoRhythmDock.OCTAVE.css("left", "calc(50vw - 12px)");
            if (PianoRhythmDock.SEARCH_BAR && PianoRhythmDock.SEARCH_BAR.length)
                PianoRhythmDock.SEARCH_BAR.css("left", "calc(50vw - -92px)");
        }
    }
}
PianoRhythmDock.SLOTS_LOCKED = false;
PianoRhythmDock.MAX_SLOTS = 8;
PianoRhythmDock.DOCK_INSTRUMENTS = {};
PianoRhythmDock.CURRENT_SLOT_MODE = SLOT_MODE.SINGLE;
PianoRhythmDock.INITIALIZED = false;
PianoRhythmDock.ShowFilterList = function () {
    switch (PianoRhythmDock.CURRENT_SEARCH_FILTER) {
        case "midi_all":
        case "midi_favorites":
            if (PianoRhythmPlayer_1.PianoRhythmPlayer.MIDI_SELECTION && PianoRhythm.INSTRUMENT_SELECTION) {
                if (PianoRhythmDock.SEARCH_BAR_RESULTS)
                    PianoRhythmDock.SEARCH_BAR_RESULTS.text("");
                if (PianoRhythmPlayer_1.PianoRhythmPlayer.MIDI_SELECTION.visible) {
                    PianoRhythmPlayer_1.PianoRhythmPlayer.MIDI_SELECTION.scrollItems(null, 0, true);
                }
                else if (!PianoRhythmPlayer_1.PianoRhythmPlayer.MIDI_SELECTION.visible && PianoRhythm.INSTRUMENT_SELECTION.visible) {
                    PianoRhythm.INSTRUMENT_SELECTION.hide();
                    PianoRhythmPlayer_1.PianoRhythmPlayer.MIDI_SELECTION.show();
                    PianoRhythmPlayer_1.PianoRhythmPlayer.MIDI_SELECTION.scrollItems(null, 0, true);
                }
            }
            break;
        default:
            if (PianoRhythm.INSTRUMENT_SELECTION) {
                if (PianoRhythm.INSTRUMENT_SELECTION.visible) {
                    PianoRhythm.INSTRUMENT_SELECTION.showChildren(true, PianoRhythmDock.CURRENT_SEARCH_FILTER);
                }
            }
            break;
    }
};
exports.PianoRhythmDock = PianoRhythmDock;
class BasicSlider {
    constructor(containerID, options) {
        this.enableDragging = true;
        this.showValue = false;
        this.showPercentage = false;
        this.id = containerID;
        let color = (options && options.color) ? options.color : PianoRhythm.COLORS.base4;
        let textColor = (options && options.textColor) ? options.textColor : PianoRhythm.COLORS.base4;
        let textTopPosition = (options && options.textTopPosition) ? options.textTopPosition : 30;
        this.bar = new ProgressBar.Line(containerID, {
            strokeWidth: 4,
            easing: 'easeInOut',
            duration: 1400,
            color: color,
            trailColor: '#eee',
            trailWidth: 1,
            svgStyle: {
                width: '100%',
                height: '100%'
            },
            text: {
                style: {
                    color: textColor,
                    position: 'absolute',
                    right: '0',
                    top: textTopPosition + "px",
                    padding: 0,
                    margin: 0,
                    transform: null
                },
                autoStyleContainer: false
            },
            step: (state, bar) => {
                if (options && options.text) {
                    let text = options.text + (options.showValue ? Math.round(bar.value() * 100) : "") +
                        (options.showPercentage ? " %" : "");
                    bar.setText(text);
                }
            }
        });
        if (options && options.draggable) {
            this.eventEmitter = new EventEmitter();
            let container = document.getElementById(containerID.substring(1, containerID.length));
            let maxWidth = container.offsetWidth;
            let dragging = false, canDrag = false;
            let progress;
            container.addEventListener('mousedown', (e) => {
                if (!this.enableDragging)
                    return;
                canDrag = true;
                if (!dragging) {
                    let oX = e.pageX - container.offsetLeft;
                    progress = oX / maxWidth;
                    this.bar.set(progress);
                    this.eventEmitter.emitEvent('setProgress', [progress]);
                }
            });
            container.addEventListener('mousemove', (e) => {
                if (!this.enableDragging)
                    return;
                if (canDrag) {
                    dragging = true;
                    let oX = e.clientX - container.offsetLeft;
                    progress = oX / maxWidth;
                    progress = Math.min(Math.max(progress, 0), 1).toFixed(2);
                    this.bar.set(progress);
                    this.eventEmitter.emitEvent('setProgress', [progress]);
                    return false;
                }
            });
            container.addEventListener('mouseup', (e) => {
                if (!this.enableDragging)
                    return;
                if (canDrag) {
                    dragging = false;
                    canDrag = false;
                    this.eventEmitter.emitEvent('setProgressDone', [progress]);
                }
                e.cancelBubble = true;
            });
        }
    }
    setText(text) {
        this.bar.setText(text);
    }
    setTextPos(x, y) {
        if (x)
            this.bar.text.style.left = x;
        if (y)
            this.bar.text.style.top = y;
    }
    setTextPos_Right(x, y) {
        if (x) {
            this.bar.text.style.left = "";
            this.bar.text.style.right = x;
        }
        if (y)
            this.bar.text.style.top = y;
    }
    get value() {
        return this.bar.value();
    }
    set(value) {
        if (value >= 1)
            value = 1;
        this.bar.set(value);
    }
    hide() {
        if (this.bar && this.bar.length)
            this.bar.hide();
    }
    show() {
        if (this.bar && this.bar.length)
            this.bar.show();
    }
}
exports.BasicSlider = BasicSlider;
class BasicBox {
    constructor(ibox) {
        this.x = 0;
        this.y = 0;
        this.width = 500;
        this._height = 150;
        this.color = "#FFF";
        this.dragging = false;
        this.destroyed = false;
        this.visible = false;
        this.inputs = [];
        if (ibox) {
            if (ibox.id)
                this.id = ibox.id;
            if (ibox.x)
                this.x = ibox.x;
            if (ibox.y)
                this.y = ibox.y;
            if (ibox.width)
                this.width = ibox.width;
            if (ibox.height)
                this._height = ibox.height;
            if (ibox.color)
                this.color = ibox.color;
            if (ibox.title)
                this.title = ibox.title;
        }
        let box = $(document.createElement('div'));
        box.attr({ 'class': 'basicBox' });
        box.css({
            'background-color': this.color || PianoRhythm.COLORS.base4,
            'z-index': 1002,
            'position': "fixed",
            'top': (this.y + "px") || "0px",
            'left': (this.x + "px") || "0px",
            "display": "flex",
            "flex-direction": "column",
            "justify-content": "space-between",
            "font-size": "15px"
        });
        box.height((index, height) => {
            return ((this._height));
        });
        box.width((index, width) => {
            return ((this.width));
        });
        box.offset = 0;
        if (this.id)
            box.attr("id", "box" + this.id);
        this.box = box;
    }
    show(animate = false, _height, callback) {
        if (this.box) {
            if (animate) {
                let height = _height || this.box.height();
                this.box.css({
                    bottom: PianoRhythm.BOTTOM_BAR.height(),
                    "z-index": 1002
                }).animate({
                    marginTop: 0,
                    opacity: 1,
                    height: height,
                }, 250, "swing", function () {
                    $(this).css({
                        display: "",
                        marginTop: ""
                    });
                    if (callback)
                        callback();
                });
            }
            this.box.css("display", "");
            this.visible = true;
        }
        BasicBox.BOX_VISIBLE = true;
    }
    hide(animate = false) {
        if (this.box) {
            if (animate) {
                let height = this.box.height();
                this.box.css({
                    overflow: "hidden",
                    marginTop: 0,
                    height: height
                }).animate({
                    marginTop: height,
                    height: 0,
                    opacity: 0
                }, 250, () => {
                    this.box.css("z-index", 0);
                    this.box.css("bottom", -20);
                });
            }
            else
                this.box.css("display", "none");
            this.visible = false;
        }
        BasicBox.BOX_VISIBLE = false;
    }
    remove() {
        if (this.box)
            this.box.remove();
        BasicBox.BOX_VISIBLE = false;
    }
    createHeader(ihead = { color: "white", height: "initial", align: "center" }) {
        if (this.box) {
            let boxheader = $(document.createElement('h3'));
            boxheader.css({
                'padding': '10px',
                'margin-top': ihead.marginTop || '-30px',
                'cursor': 'url("../images/icons/cursors/x1/default.png") 5 2, auto',
                'background': ihead.color || 'white',
                "height": ihead.height || "initial",
                "text-align": ihead.align || "center",
                "margin-bottom": "30px",
                "border": (ihead.border + " " + ihead.borderSize + " " + ihead.borderColor) || "initial"
            });
            boxheader.addClass("noselect");
            boxheader.attr('align', 'center');
            boxheader.text(this.title);
            let closeIcon = $(document.createElement("span"));
            closeIcon.attr("class", "icon-cross");
            closeIcon.attr("title", "Close this window!");
            closeIcon.css({
                "float": "right",
                "cursor": "pointer"
            });
            closeIcon.qtip();
            closeIcon.click(() => {
                if (this.box) {
                    closeIcon.qtip('api').destroy();
                    this.box.remove();
                    this.destroyed = true;
                    if (ihead.onClose)
                        ihead.onClose();
                }
            });
            if (ihead.icon_css)
                closeIcon.css(ihead.icon_css);
            boxheader.append(closeIcon);
            this.header = boxheader;
            this.box.append(this.header);
        }
    }
    createSideMenu(iMenu = { height: null, width: null, paddingTop: null, bgColor: null }) {
        if (this.box) {
            let sideMenu = $(document.createElement("div"));
            let height = iMenu.height || "100%";
            let width = iMenu.width || "100%";
            let padTop = iMenu.paddingTop || 5;
            let bg = iMenu.bgColor || "white";
            sideMenu.css({
                height: height,
                width: width,
                "padding-right": "20px",
                "padding-left": "6px",
                "overflow-y": "scroll",
                "background": bg
            });
            let sideMenuParent = $(document.createElement("div"));
            sideMenuParent.css({
                height: "100%",
                width: "20%",
                'max-width': "20%",
                "overflow": "hidden"
            });
            sideMenuParent.content = {};
            sideMenuParent.label = {};
            sideMenuParent.selectedContent = "";
            sideMenuParent.hideAllContent = (excludedID = '99ASD') => {
                if (sideMenuParent.content) {
                    for (let i in sideMenuParent.content) {
                        let content = sideMenuParent.content[i];
                        let id = content[0].id;
                        try {
                            if (content && id.indexOf(excludedID) === -1) {
                                content.hide();
                                sideMenuParent.label[i].css("border-bottom", "");
                            }
                            else {
                                sideMenuParent.selectedContent = id;
                                content.show();
                                let label = sideMenuParent.label[excludedID];
                                label.css("border-bottom", "2px solid " + this.color);
                            }
                        }
                        catch (err) {
                        }
                    }
                }
            };
            sideMenu.addMenuItem = (item, itemOnClick, itemOnHover, itemContent) => {
                let span = $(document.createElement("span"));
                span.addClass("sideMenuLabel noselect");
                span.attr("id", "sideMenuLabel_" + item);
                span.css({
                    "display": "block",
                    "padding-bottom": "10px",
                    "padding-top": "10px",
                    "text-align": "center",
                    "margin-bottom": "5px",
                    "color": this.color
                });
                span.text(item);
                sideMenuParent.label[item] = span;
                if (itemOnClick)
                    span.on("click", itemOnClick);
                if (itemOnHover)
                    span.hover(itemOnHover);
                let content = $(document.createElement("div"));
                content.css({
                    "width": "80%",
                    "height": "95%",
                    "padding-top": padTop + "px",
                    "position": "absolute",
                    "top": "0",
                    "left": "20%",
                    "overflow-y": "scroll"
                });
                content.addClass("noselect");
                content.attr("id", "menuItemContent_" + item);
                if (itemContent)
                    content.append(itemContent);
                sideMenuParent.content[item] = content;
                if (this.box)
                    this.box.append(content);
                sideMenu.append(span);
            };
            if (iMenu.menuItems) {
                let length = iMenu.menuItems.length;
                if (length)
                    for (let i = 0; i < length; i++) {
                        if (sideMenu) {
                            let name = iMenu.menuItems[i].name;
                            let onClick = iMenu.menuItems[i].onClick;
                            let onHover = iMenu.menuItems[i].onHover;
                            let content = iMenu.menuItems[i].content;
                            if (name && name.length > 0 && onClick) {
                                if (PianoRhythm.CLIENT) {
                                    if (PianoRhythm.CLIENT.type === 0 && name === "DEV") {
                                        break;
                                    }
                                    sideMenu.addMenuItem(name, onClick, onHover, content);
                                }
                            }
                        }
                    }
                sideMenuParent.hideAllContent(iMenu.menuItems[0].name);
            }
            sideMenuParent.append(sideMenu);
            this.sideMenu = sideMenuParent;
            this.box.append(this.sideMenu);
        }
    }
    addInput(_input = {
            flex: "1", max: 10, min: 1, value: 1,
            type: "number", maxLength: 10, borderColor: "rgba(0,0,0,0)", removeNoneOption: false
        }) {
        if (this.box) {
            let inputDiv = $(document.createElement('div'));
            inputDiv.attr("id", this.title + "_inputDiv");
            inputDiv.css({
                "width": "100%",
                "max-width": "90%",
                "flex-grow": _input.flex || "1",
                "padding-left": _input.paddingLeft || "10%"
            });
            let type = (_input.type !== undefined && _input.type !== "input") ? _input.type : "input";
            let input = $(document.createElement((type !== "input") ? "select" : "input"));
            let multiUL;
            if (type !== "select" && type !== "multi") {
                let inputType = _input.type2 || "number";
                input.attr('type', inputType);
                switch (inputType) {
                    case "number":
                        input.attr('max', _input.max || 10);
                        input.attr('maxlength', _input.maxLength || 10);
                        input.attr('min', _input.min || 1);
                        inputDiv.keydown(function (e) {
                            return false;
                        });
                        break;
                    case "text":
                        break;
                    default:
                        break;
                }
            }
            else {
                if (type === "multi") {
                    multiUL = $(document.createElement('ul'));
                    multiUL.addClass("multiSelect_UL");
                    input.append(multiUL);
                }
            }
            input.css({
                'position': 'relative',
                display: "inline",
                "margin-top": "10px",
                background: "rgba(1,1,1,0.2)",
                color: "white",
                border: "white solid",
                width: _input.width || "50%",
                "font-family": "sans-serif",
                "font-size": "18px",
                outline: "none",
                "box-shadow": "none",
                padding: "1%",
            });
            if (_input.css)
                input.css(_input.css);
            if (_input.label) {
                let inputLabel = $(document.createElement('span'));
                inputLabel.text(_input.label);
                inputDiv.attr("id", this.title + "_inputDiv_" + _input.label);
                inputLabel.css({
                    'position': 'relative',
                    display: "inline",
                    width: "100%",
                    "font-family": "sans-serif",
                    "font-size": "18px",
                    padding: "10px",
                    color: 'white',
                });
                inputDiv.append(inputLabel);
            }
            if (_input.list) {
                let array = _input.list;
                if (_input.removeNoneOption === false || typeof _input.removeNoneOption === "undefined") {
                    let noneOption = $(document.createElement("option"));
                    noneOption.val("none");
                    noneOption.text("NONE");
                    input.append(noneOption);
                }
                for (let i = 0; i < array.length; i++) {
                    let option = $(document.createElement("option"));
                    option.val(array[i]);
                    option.text(array[i]);
                    option.css("background", this.color);
                    input.append(option);
                }
                if (_input.value !== null && _input.value !== undefined) {
                    if (typeof _input.value === "string")
                        input.val(_input.value);
                    if (_input.value !== undefined && _input.value.length > 0 && Array.isArray(_input.value)) {
                        for (let p = 0; p < _input.value.length; p++) {
                            let in_item = _input.value[p];
                            let mLI = $(document.createElement("li"));
                            mLI.addClass("multiSelect_LI");
                            mLI.text(in_item);
                            let cross_icon = $(document.createElement("span"));
                            cross_icon.addClass("icon-cross");
                            cross_icon.addClass("multiSelect_LI_crossIcon");
                            mLI.append(cross_icon);
                            if (_input.li_click) {
                                (function (mLI, cross_icon, in_item, li_click) {
                                    let clickFunct = function (data) {
                                        mLI.fadeOut("fast", () => {
                                            mLI.remove();
                                        });
                                        cross_icon.fadeOut("fast", () => {
                                            cross_icon.remove();
                                        });
                                        li_click(data, in_item, _input.midi_type);
                                        data.preventDefault();
                                        data.stopPropagation();
                                    };
                                    mLI.on("click", clickFunct);
                                    cross_icon.on("click", clickFunct);
                                })(mLI, cross_icon, in_item, _input.li_click);
                            }
                            if (multiUL)
                                multiUL.append(mLI);
                        }
                    }
                }
                if (type === "multi") {
                    if (_input.stateChange) {
                        input.on("change", function () {
                            _input.stateChange(input.val(), multiUL);
                        });
                    }
                }
                else {
                    if (_input.stateChange) {
                        input.on("change", _input.stateChange);
                    }
                }
            }
            inputDiv.append(input);
            if (multiUL && type === "multi") {
                multiUL.insertBefore(input);
                let plus_icon = $(document.createElement("span"));
                plus_icon.addClass("icon-plus");
                plus_icon.addClass("multiSelect_LI_plusIcon");
                if (_input.add_click) {
                    let clickFunct = function (data) {
                        if (input && multiUL)
                            _input.add_click(data, multiUL, input.val());
                    };
                    plus_icon.on("click", clickFunct);
                }
                inputDiv.append(plus_icon);
            }
            this.inputs.push(inputDiv);
            inputDiv["input"] = input;
            if (_input.appendToBox === false)
                return inputDiv;
            this.box.append(inputDiv);
            return inputDiv;
        }
    }
    center() {
        if (this.box) {
            this.box.center();
        }
    }
    center2(x = 0, y = 0) {
        if (this.box) {
            this.box.center2(x, y);
        }
    }
    center3() {
        if (this.box) {
            this.box.center3();
        }
    }
    draggable() {
        if (this.box) {
            this.dragging = true;
            this.box.on('mousedown', function (evt) {
                $(this).addClass('draggable').parents().on('mousemove', function (e) {
                    $('.draggable').offset({
                        top: e.pageY - $('.draggable').outerHeight() / 2,
                        left: e.pageX - $('.draggable').outerWidth() / 2
                    }).on('mouseup', function () {
                        $(this).removeClass('draggable');
                    });
                });
                evt.preventDefault();
            }).on('mouseup', () => {
                $('.draggable').removeClass('draggable');
                this.dragging = false;
            });
        }
    }
    get height() {
        return this._height;
    }
    set height(value) {
        this._height = value;
    }
}
BasicBox.BOX_VISIBLE = false;
BasicBox.createSideMenuHeader = function (text, color = "white", padLeft = "10px") {
    let header1 = $(document.createElement("h1"));
    header1.css({
        color: color,
        "padding-left": padLeft,
        "padding-top": 10,
        "padding-bottom": 5
    });
    header1.text(text);
    return header1;
};
BasicBox.createButton = function (text, onClick, css, _class, singleton = false) {
    let section = $(document.createElement("section"));
    section.addClass("press");
    if (_class)
        section.addClass(_class);
    let button = $(document.createElement("button"));
    button.text(text);
    if (onClick)
        button.on('click', onClick);
    if (css)
        section.css(css);
    section.append(button);
    section.button = button;
    return section;
};
exports.BasicBox = BasicBox;
class Sprite {
    constructor(options) {
        this.context = null;
        this.width = 0;
        this.height = 0;
        this.image = null;
        this.frameIndex = 0;
        this.tickCount = 0;
        this.numberOfFrames = 1;
        this.loop = true;
        this.x = 0;
        this.y = 0;
        this.context = options.context;
        this.width = options.width;
        this.height = options.height;
        this.image = options.image;
        this.ticksPerFrame = options.ticksPerFrame || 0;
        this.numberOfFrames = options.numberOfFrames || 1;
        this.loop = options.loop;
    }
    render() {
        if (this.context && this.image) {
            this.context.clearRect(0, 0, this.width, this.height);
            this.context.drawImage(this.image, this.frameIndex * this.width / this.numberOfFrames, 0, this.width / this.numberOfFrames, this.height, this.x, this.y, this.width / this.numberOfFrames, this.height);
        }
    }
    update() {
        this.tickCount++;
        if (this.tickCount > this.ticksPerFrame) {
            this.tickCount = 0;
            if (this.frameIndex < this.numberOfFrames - 1)
                this.frameIndex++;
            else if (this.loop)
                this.frameIndex = 0;
        }
    }
}
exports.Sprite = Sprite;
class ParticleSystem {
    constructor(canvas, x, y, width, height) {
        this.alreadyRendering = false;
        this.gravity = 0.08;
        this.floor = 0;
        this.currentlySparking = false;
        this.maxSize = 10;
        this.startSize = 1;
        this.ag = 9.81;
        this.colors = ["red", "blue", "green"];
        this.width = 0;
        this.height = 0;
        this.particles = [];
        this.startX = 0;
        this.startY = 0;
        this.burstAmount = 3;
        this.style = "square";
        this.sprites = [];
        this.modifier = 1;
        this.glow = false;
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");
        this.width = width;
        this.height = height;
        this.floor = height;
        this.startX = x;
        this.startY = y;
    }
    setGlow(bool = true) {
        this.glow = bool;
        PianoRhythm.SETTINGS["particleGlow"] = bool;
    }
    setBurstAmount(num = 3) {
        this.burstAmount = num;
        PianoRhythm.SETTINGS["particlesBurstAmount"] = num;
    }
    createParticle(_x, _y, _color, sprite) {
        let x = _x || this.startX;
        let y = _y || this.startY;
        let z = Math.random() * 2;
        let maxex = Math.random() * 20;
        let vx = (Math.random() * maxex) - (maxex / 2);
        let vy = (Math.random() * -20);
        let vsize = 0;
        let size = this.startSize + Math.random();
        let color = _color || this.colors[Math.floor(Math.random() * this.colors.length)];
        let opacity = 0.5 + Math.random() * 0.5;
        let startTime = Date.now();
        let p = new Particle(this, this.canvas, sprite, x, y, z, vx, vy, size, vsize, color, opacity, startTime, startTime);
        p.finished = false;
        this.particles.push(p);
    }
    initParticles(_x, _y, color, sprite, amount) {
        this.currentlySparking = true;
        for (let i = 0; i < (amount || this.burstAmount); i++) {
            ((i) => {
                setTimeout(() => {
                    this.createParticle(_x, _y, color, sprite);
                });
            })(i);
        }
    }
    render() {
        this.alreadyRendering = true;
        if (this.ctx) {
            for (let i = 0; i < this.particles.length; i++) {
                if (this.particles[i]) {
                    if (this.particles[i].finished) {
                        this.particles.splice(i, 1);
                    }
                    else {
                        this.particles[i].update();
                        this.particles[i].draw();
                    }
                }
            }
        }
    }
    loadImages() {
        let sources = [
            "./images/particles/dc8od7Bce.png",
            "./images/particles/music-note-3.png",
            "./images/particles/music-34177__180.png",
            "./images/particles/music-note-1-256x256.png",
            "./images/particles/musical-note-2016.png",
        ];
        for (let i = 0; i < sources.length; i++) {
            let image = $(document.createElement("img"));
            image.attr("src", sources[i]);
            image.one("load", () => {
                this.sprites.push(image);
            });
        }
    }
}
exports.ParticleSystem = ParticleSystem;
class Particle {
    constructor(parent, canvas, sprite, x, y, z, vx, vy, size, vsize, color, opacity, startTime, startTime2) {
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.vx = 0;
        this.vy = 0;
        this.size = 0;
        this.vsize = 0;
        this.color = "red";
        this.opacity = 1;
        this.opacityReduceAmount = 0.005;
        this.startTime = 0;
        this.lastTime = 0;
        this.finished = false;
        if (!canvas)
            return;
        if (!parent)
            return;
        this.parent = parent;
        this.x = x;
        this.y = y;
        this.z = z;
        this.vx = vx;
        this.vy = vy;
        this.size = size;
        this.vsize = vsize;
        this.color = color;
        this.opacity = opacity;
        this.startTime = startTime;
        this.lastTime = startTime2;
        this.canvas = canvas;
        this.sprite = sprite;
        this.ctx = this.canvas.getContext("2d");
    }
    reset() {
        this.opacity = 0;
        this.finished = true;
    }
    draw() {
        if (this.canvas && this.ctx) {
            if (this.sprite) {
                this.sprite.x = this.x;
                this.sprite.y = this.y;
                this.sprite.render();
                return;
            }
            this.ctx.globalAlpha = this.opacity;
            this.ctx.fillStyle = this.color;
            if (this.parent.glow) {
                this.ctx.shadowBlur = 10;
                this.ctx.shadowColor = (Math.random() < 0.5) ? this.color : "white";
            }
            switch (this.parent.style) {
                default:
                case "circle":
                    this.ctx.beginPath();
                    this.ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
                    this.ctx.fill();
                    this.ctx.closePath();
                    break;
                case "square":
                    this.ctx.fillRect(this.x, this.y, this.size * 3, this.size * 3);
                    break;
                case "randomSprite":
                    if (this.parent.sprites) {
                        let random = this.parent.sprites[Math.floor(Math.random() * this.parent.sprites.length - 1)];
                        if (random) {
                            this.ctx.drawImage(random[0], this.x, this.y, this.size * 5 * this.parent.modifier, this.size * 10 * this.parent.modifier);
                        }
                    }
                    break;
            }
            if (this.parent.glow)
                this.ctx.shadowBlur = 0;
            this.ctx.globalAlpha = 1;
        }
    }
    update() {
        if (this.opacity - 0.0005 > 0)
            this.opacity -= this.opacityReduceAmount;
        else
            this.reset();
        let timeNow = Date.now();
        if (timeNow > this.lastTime)
            this.vy += (this.parent.ag * ((timeNow - this.lastTime) / 1000) * 4.7);
        this.lastTime = timeNow;
        this.x += this.vx;
        this.y += this.vy;
        if (this.y > (this.parent.floor + 10))
            this.finished = true;
        if (this.size < this.parent.maxSize)
            this.size += this.vsize * this.z;
        if ((this.opacity < 0.5) && (this.y < this.parent.floor)) {
            this.vsize = 0.55 - this.opacity;
        }
        else {
            this.vsize = 0;
        }
        if (this.y > this.parent.floor - 5) {
            this.vy = this.vy * -0.4;
            this.vx = this.vx * 0.96;
        }
    }
    ;
}
exports.Particle = Particle;
class midiParser {
    constructor() {
        this.initialize = () => {
            this.MIDIPARSER = new MidiParser();
            this.MIDIPARSER.on('note-on', function (channel, note, velocity) {
                if (channel === 9 && !PianoRhythm.OFFLINE_MODE)
                    return;
                if (PianoRhythm.SETTINGS["ENABLE_VELOCITY"]) {
                    if (PianoRhythm.SETTINGS["VEL_METER"] !== undefined && PianoRhythm.SETTINGS["VEL_METER_ENABLED"])
                        if (velocity <= (PianoRhythm.SETTINGS["VEL_METER"]))
                            return;
                    if (PianoRhythm.SETTINGS["VEL_BOOST_ENABLED"]) {
                    }
                }
                else {
                    velocity = Piano_1.Piano.DEFAULT_VELOCITY;
                }
                PianoRhythm.messageListen({
                    type: 'pM',
                    data: [1, channel, (note - 12), velocity]
                });
            });
            this.MIDIPARSER.on('note-off', function (channel, note) {
                if (channel === 9 && !PianoRhythm.OFFLINE_MODE)
                    return;
                PianoRhythm.messageListen({
                    type: 'pM',
                    data: [0, channel, (note - 12)]
                });
            });
            this.MIDIPARSER.on('damper-on', function (channel) {
                if (channel === 9 && !PianoRhythm.OFFLINE_MODE)
                    return;
                PianoRhythm.messageListen({
                    type: 'sustainOn',
                    data: true
                });
            });
            this.MIDIPARSER.on('damper-off', function (channel) {
                if (channel === 9 && !PianoRhythm.OFFLINE_MODE)
                    return;
                PianoRhythm.messageListen({
                    type: 'sustainOff',
                    data: true
                });
            });
            this.MIDIPARSER.on('program-change', function (channel, number) {
            });
            this.MIDIPARSER.on('all-notes-off', function (channel, number) {
                if (channel === 9)
                    return;
                PianoRhythm.messageListen({
                    type: 'allNotesOff',
                    data: true
                });
            });
            this.MIDIPARSER.on('all-sound-off', function (channel, number) {
                if (channel === 9)
                    return;
                PianoRhythm.messageListen({
                    type: 'allSoundOff',
                    data: true
                });
            });
        };
        this.initialize();
    }
    parse(data) {
        if (PianoRhythm.ROOM_SETTINGS.ALLOWED_TOOL != Piano_1.NOTE_SOURCE.ANY && PianoRhythm.ROOM_SETTINGS.ALLOWED_TOOL != Piano_1.NOTE_SOURCE.MIDI)
            return false;
        if (PianoRhythm.onlyHostCanPlay())
            return false;
        this.MIDIPARSER.parse(data);
    }
}
class Interpolater {
    constructor(data) {
        var self = this;
        this.fraction = (typeof data.fraction !== "undefined") ? data.fraction : 0.5;
        this.trackSpeed = (typeof data.fraction !== "undefined") ? data.trackSpeed : 200;
        this.parent = data.elements.parent;
        this.object = data.mouse || data.elements.mouse;
        this.step = data.step;
        this.x = 0;
        this.y = 0;
        this.cords = [{ x: this.x, y: this.y }, { x: this.x, y: this.y }];
        this.track();
    }
    update(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    track() {
        clearInterval(this.interval);
        this.interval = setInterval(() => {
            this.cords.push({ x: this.x, y: this.y });
            this.cords.shift();
            this.calculate((position) => {
                if (this.step)
                    this.step({ object: this.object, position: { x: position.x, y: position.y } });
            });
        }, this.trackSpeed);
    }
    calculate(callback) {
        var nx = this.cords[0].x + (this.cords[1].x - this.cords[0].x) * this.fraction;
        var ny = this.cords[0].y + (this.cords[1].y - this.cords[0].y) * this.fraction;
        if (callback)
            callback({ x: nx, y: ny });
    }
    clear() {
        clearInterval(this.interval);
    }
}
exports.Interpolater = Interpolater;
class playerMouse {
    constructor(id, name = "", _color, userLI) {
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
        this.lastX = 0;
        this.lastY = 0;
        this.onPiano = false;
        this.onPlayer = null;
        this.profileTimer = null;
        this.profileTime = 1000;
        this.forcePic = false;
        this.displayX = 150;
        this.displayY = 50;
        if (id === PianoRhythm.SOCKET.id)
            return;
        this.id = id;
        this.name = name;
        this.element = $("<div>");
        this.element.attr("id", "mouse_" + id);
        this.element.attr("class", "mouse_cursor");
        this.element.css({
            position: "fixed",
            "z-index": 1000,
            "margin-top": -3,
            "margin-left": -5,
            top: 0,
            left: 0,
            "pointer-events": "none",
            background: "url(images/icons/cursors/x1/default.png)",
            "background-position": "-3px 0px",
            "background-repeat": "no-repeat"
        });
        this.nameElement = $("<div>");
        this.nameElement.addClass("noselect");
        var color = (_color || PianoRhythm.stringToColour(name));
        this.color = color;
        this.nameElement.css({
            "margin-top": 24,
            "margin-left": 15,
            "border-radius": 10,
            background: color,
            color: "white",
            padding: 3
        });
        this.nameElement.text(name);
        if (PianoRhythm.PLAYER_SOCKET_LIST) {
            let user = PianoRhythm.PLAYER_SOCKET_LIST.get(this.id);
            if (user) {
                PianoRhythm.PLAYER_SOCKET_LIST_SET(this.id, "mouse", this);
            }
        }
        this.element.append(this.nameElement);
        $('body').append(this.element);
        this.width = this.element.width();
        this.height = this.element.height();
        if (userLI) {
            this.userLI = userLI;
            this.createProfile();
            this.setInstrument(Piano_1.Piano.DEFAULT_INSTRUMENT);
        }
        playerMouse.MOUSES.push(this);
    }
    static displayMouses(show = true) {
        for (let i = 0; i < this.MOUSES.length; i++) {
            let mouse = this.MOUSES[i];
            if (mouse) {
                if (show)
                    mouse.show();
                else
                    mouse.hide();
            }
        }
    }
    update(x = 0, y = 0) {
        if (this.Interpolater)
            this.Interpolater.update(x, y);
    }
    setPosition(x = 0, y = 0) {
        this.x = x;
        this.y = y;
        if (this.element) {
            this.element[0].style.left = x + "%";
            this.element[0].style.top = y + "%";
        }
        this.lastX = x;
        this.lastY = y;
    }
    setPositionPercent(x = "0%", y = "0%") {
        if (this.element)
            this.element.css({ left: x, top: y });
    }
    remove() {
        if (this.Interpolater)
            this.Interpolater.clear();
        if (this.user) {
            this.user["mouse"] = null;
            delete this.user["mouse"];
        }
        this.element.remove();
        let index = playerMouse.MOUSES.indexOf(this);
        playerMouse.MOUSES.splice(index, 1);
    }
    hide() {
        this.element.hide();
        if (this.Interpolater)
            this.Interpolater.clear();
    }
    show() {
        this.element.show();
        if (this.Interpolater)
            this.Interpolater.track();
    }
    changeTag(view = "name") {
        switch (view.toLowerCase()) {
            case "name":
                this.forcePic = false;
                this.nameElement.css({
                    visibility: "visible"
                });
                this.profile.img.css({
                    top: this.profile.img.y
                });
                this.profile.role.css({
                    top: this.profile.role.y
                });
                break;
            case "picture":
                if (this.profile) {
                    this.nameElement.css({
                        visibility: "hidden"
                    });
                    var yOffset = 55;
                    this.profile.show();
                    this.profile.img.css({
                        top: this.profile.img.y + yOffset
                    });
                    this.profile.role.css({
                        top: this.profile.role.y + yOffset
                    });
                    this.forcePic = true;
                }
                break;
        }
    }
    createProfile() {
        let cover = $("<div>");
        let img = this.userLI.img.clone();
        let imgX = 15;
        let imgY = -39;
        img.css({
            "width": "55px",
            "height": "55px",
            top: -39,
            left: 15,
        });
        img.x = imgX;
        img.y = imgY;
        cover.img = img;
        let role = this.userLI.divRole.clone();
        let roleY = 9;
        let roleX = 13;
        let roleWidth = 45;
        role.css({
            top: 9,
            left: 13,
            width: 45
        });
        role.x = roleX;
        role.y = roleY;
        role.w = roleWidth;
        cover.role = role;
        let inst_name = $("<div>");
        inst_name.css({
            color: "white",
            "font-size": 14,
            position: "absolute",
            left: 78,
            top: 29,
            background: this.color,
            "border-radius": "12px",
            "padding-left": "5px",
            "padding-right": "5px"
        });
        cover.inst_name = inst_name;
        cover.append(img);
        cover.append(role);
        cover.append(inst_name);
        this.element.append(cover);
        this.profile = cover;
        this.profile.hide();
    }
    showProfile() {
        if (!this.profile)
            return;
        var yOffset = 98;
        if (!this.forcePic) {
            if (this.y - (this.profile.img.height()) < 0) {
                this.profile.img.css({
                    top: this.profile.img.y + yOffset
                });
                this.profile.role.css({
                    top: this.profile.role.y + yOffset
                });
            }
            else {
                this.profile.img.css({
                    top: this.profile.img.y
                });
                this.profile.role.css({
                    top: this.profile.role.y
                });
            }
            this.profile.fadeIn();
        }
        if (this.profile) {
            if (this.profile.inst_name)
                this.profile.inst_name[0].style.left = (this.element.width() + 5) + "px";
        }
    }
    hideProfile() {
        if (!this.forcePic)
            this.profile.fadeOut();
    }
    setInstrument(inst) {
        if (!inst)
            return;
        if (this.profile && this.profile.inst_name)
            this.profile.inst_name.text(inst);
        if (!this.instrumentElement) {
            this.instrumentElement = $("<img>");
            this.instrumentElement.css({
                "width": "15px",
                "margin-left": 5,
                "transform": "translateY(2px)"
            });
            this.instrumentElement.attr("src", "../images/icons/instruments/" + PianoRhythmInstrument_1.PianoRhythmInstrument.getInstrumentImage(inst) + ".png");
            this.nameElement.append(this.instrumentElement);
            return;
        }
        this.instrumentElement.attr("src", "../images/icons/instruments/" + PianoRhythmInstrument_1.PianoRhythmInstrument.getInstrumentImage(inst) + ".png");
    }
    checkForPlayerCollision() {
        this.rect = this.element[0].getBoundingClientRect();
        let x = this.rect.left;
        let y = this.rect.top;
        if ((PianoRhythm.mouseY) <= (y + this.height) && (PianoRhythm.mouseY) >= y
            && (PianoRhythm.mouseX) <= (x + this.width) && (PianoRhythm.mouseX) >= x) {
            if (this.onPlayer)
                return;
            this.onPlayer = true;
            if (this.profile)
                if (!this.profileTimer) {
                    this.profileTimer = setTimeout(() => {
                        this.showProfile();
                    }, this.profileTime);
                }
        }
        else {
            if (!this.onPlayer)
                return;
            if (this.profile && this.profileTimer) {
                clearTimeout(this.profileTimer);
                this.profileTimer = null;
                this.hideProfile();
            }
            this.onPlayer = false;
        }
        return this.onPlayer;
    }
    checkForPianoCollision() {
        if (!PianoRhythm.MODE_3D) {
            let rect = PianoRhythm.CANVAS_PARENT.getBoundingClientRect();
            let y = rect.top;
            if ((this.y) <= (y + PianoRhythm.CANVAS_PARENT.style.height) && (this.y + this.height) >= y) {
                this.onPiano = true;
                console.log("IM ON THE PIANO");
            }
            else {
                this.onPiano = false;
            }
        }
        return this.onPiano;
    }
}
playerMouse.MOUSES = [];
exports.playerMouse = playerMouse;
$.fn.resizeText = function (options) {
    let settings = $.extend({ maxfont: 20, minfont: 12, offset: 20 }, options);
    let style = $('<style>').html('.nodelays ' +
        '{ ' +
        '-moz-transition: none !important; ' +
        '-webkit-transition: none !important;' +
        '-o-transition: none !important; ' +
        'transition: none !important;' +
        '}');
    function shrink(el, fontsize, minfontsize) {
        if (fontsize < minfontsize)
            return;
        el.style.fontSize = fontsize + 'px';
        let paddingTop = parseInt($(el).css("padding-top"));
        let height = parseInt($(el).css("height"));
        $(el).css("line-height", paddingTop + height + "px");
        if (el.scrollWidth - settings.offset > el.offsetWidth - settings.offset) {
            shrink(el, fontsize - 1, minfontsize);
        }
    }
    $('head').append(style);
    $(this).each(function (index, el) {
        let element = $(el);
        element.addClass('nodelays');
        shrink(el, settings.maxfont, settings.minfont);
        element.removeClass('nodelays');
    });
    style.remove();
};
$.fn.exchangePositionWith = function (selector) {
    let other = $(selector);
    this.after(other.clone());
    other.after(this).remove();
};
$.fn.insertAt = function (index, element, callback) {
    let lastIndex = this.children().length;
    if (index < 0) {
        index = Math.max(0, lastIndex + 1 + index);
    }
    this.append(element);
    if (index < lastIndex) {
        this.children().eq(index).before(this.children().last());
    }
    if (callback)
        callback();
    return this;
};
$.fn.center = function () {
    this.css("position", "absolute");
    this.css("top", Math.max(0, (($(window).height() - $(this).outerHeight()) / 2) +
        $(window).scrollTop() - 100) + "px");
    this.css("left", Math.max(0, (($(window).width() - $(this).outerWidth()) / 2) +
        $(window).scrollLeft()) + "px");
    return this;
};
$.fn.center2 = function (offset_width, offset_height) {
    this.css("position", "fixed");
    this.css("top", (($(window).height() / 2) - (this.outerHeight() / 2)) - 100 - (offset_height || 0));
    this.css("left", ($(window).width() / 2) - (this.outerWidth() / 2) - (offset_width || 0));
    return this;
};
$.fn.center3 = function () {
    this.css({ top: '50%', left: '50%', margin: '-' + (this.height() / 2) + 'px 0 0 -' + (this.width() / 2) + 'px' });
    return this;
};
Set.prototype.isSuperset = function (subset) {
    for (var elem of subset) {
        if (!this.has(elem)) {
            return false;
        }
    }
    return true;
};
Set.prototype.union = function (setB) {
    var union = new Set(this);
    for (var elem of setB) {
        union.add(elem);
    }
    return union;
};
Set.prototype.intersection = function (setB) {
    var intersection = new Set();
    for (var elem of setB) {
        if (this.has(elem)) {
            intersection.add(elem);
        }
    }
    return intersection;
};
Set.prototype.difference = function (setB) {
    var difference = new Set(this);
    for (var elem of setB) {
        difference.delete(elem);
    }
    return difference;
};
