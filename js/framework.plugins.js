
/*
	* Snap.js
	*
	* Copyright 2013, Jacob Kelley - http://jakiestfu.com/
	* Released under the MIT Licence
	* http://opensource.org/licenses/MIT
	*
	* Github:  http://github.com/jakiestfu/Snap.js/
	* Version: 1.9.2
*/
/*jslint browser: true*/
/*global define, module, ender*/

(function($){

(function(e, t) {
    "use strict";
    var n = n || function(n) {
        var r = {
            dragger: null,
            disable: 'right',
            addBodyClasses: true,
            hyperextensible: true,
            resistance: 0.5,
            flickThreshold: 50,
            transitionSpeed: 0.25,
            easing: 'ease-in-out',
            maxPosition: 260,
            minPosition: 0,
            tapToClose: true,
            touchToDrag: true,
            slideIntent: 40, // degrees
            minDragDistance: 5
            },
            i = {
                simpleStates: {
                    opening: null,
                    towards: null,
                    hyperExtending: null,
                    halfway: null,
                    flick: null,
                    translation: {
                        absolute: 0,
                        relative: 0,
                        sinceDirectionChange: 0,
                        percentage: 0
                    }
                }
            },
            s = {},
            o = {
                hasTouch: t.ontouchstart === null,
                eventType: function(e) {
                    var t = {
                        down: o.hasTouch ? "touchstart" : "mousedown",
                        move: o.hasTouch ? "touchmove" : "mousemove",
                        up: o.hasTouch ? "touchend" : "mouseup",
                        out: o.hasTouch ? "touchcancel" : "mouseout"
                    };
                    return t[e]
                },
                page: function(e, t) {
                    return o.hasTouch && t.touches.length && t.touches[0] ? t.touches[0]["page" + e] : t["page" + e]
                },
                klass: {
                    has: function(e, t) {
                        return e.className.indexOf(t) !== -1
                    },
                    add: function(e, t) {
                        if (!o.klass.has(e, t) && r.addBodyClasses) {
                            e.className += " " + t
                        }
                    },
                    remove: function(e, t) {
                        if (r.addBodyClasses) {
                            e.className = e.className.replace(t, "").replace(/^\s+|\s+$/g, "")
                        }
                    }
                },
                dispatchEvent: function(e) {
                    if (typeof s[e] === "function") {
                        return s[e].call()
                    }
                },
                vendor: function() {
                    var e = t.createElement("div"),
                        n = "webkit Moz O ms".split(" "),
                        r;
                    for (r in n) {
                        if (typeof e.style[n[r] + "Transition"] !== "undefined") {
                            return n[r]
                        }
                    }
                },
                transitionCallback: function() {
                    return i.vendor === "Moz" || i.vendor === "ms" ? "transitionend" : i.vendor + "TransitionEnd"
                },
                canTransform: function() {
                    return typeof r.element.style[i.vendor + "Transform"] !== "undefined"
                },
                deepExtend: function(e, t) {
                    var n;
                    for (n in t) {
                        if (t[n] && t[n].constructor && t[n].constructor === Object) {
                            e[n] = e[n] || {};
                            o.deepExtend(e[n], t[n])
                        } else {
                            e[n] = t[n]
                        }
                    }
                    return e
                },
                angleOfDrag: function(e, t) {
                    var n, r;
                    r = Math.atan2(-(i.startDragY - t), i.startDragX - e);
                    if (r < 0) {
                        r += 2 * Math.PI
                    }
                    n = Math.floor(r * (180 / Math.PI) - 180);
                    if (n < 0 && n > -180) {
                        n = 360 - Math.abs(n)
                    }
                    return Math.abs(n)
                },
                events: {
                    addEvent: function(t, n, r) {
                        if (t.addEventListener) {
                            return t.addEventListener(n, r, false)
                        } else if (t.attachEvent) {
                            return t.attachEvent("on" + n, r)
                        }
                    },
                    removeEvent: function(t, n, r) {
                        if (t.addEventListener) {
                            return t.removeEventListener(n, r, false)
                        } else if (t.attachEvent) {
                            return t.detachEvent("on" + n, r)
                        }
                    },
                    prevent: function(e) {
                        if (e.preventDefault) {
                            e.preventDefault()
                        } else {
                            e.returnValue = false
                        }
                    }
                },
                parentUntil: function(e, t) {
                    var n = typeof t === "string";
                    while (e.parentNode) {
                        if (n && e.getAttribute && e.getAttribute(t)) {
                            return e
                        } else if (!n && e === t) {
                            return e
                        }
                        e = e.parentNode
                    }
                    return null
                }
            },
            u = {
                translate: {
                    get: {
                        matrix: function(t) {
                            if (!o.canTransform()) {
                                return parseInt(r.element.style.left, 10)
                            } else {
                                var n = e.getComputedStyle(r.element)[i.vendor + "Transform"].match(/\((.*)\)/),
                                    s = 8;
                                if (n) {
                                    n = n[1].split(",");
                                    if (n.length === 16) {
                                        t += s
                                    }
                                    return parseInt(n[t], 10)
                                }
                                return 0
                            }
                        }
                    },
                    easeCallback: function() {
                        r.element.style[i.vendor + "Transition"] = "";
                        i.translation = u.translate.get.matrix(4);
                        i.easing = false;
                        clearInterval(i.animatingInterval);
                        if (i.easingTo === 0) {
                            o.klass.remove(t.body, "snapjs-right");
                            o.klass.remove(t.body, "snapjs-left")
                        }
                        o.dispatchEvent("animated");
                        o.events.removeEvent(r.element, o.transitionCallback(), u.translate.easeCallback)
                    },
                    easeTo: function(e) {
                        if (!o.canTransform()) {
                            i.translation = e;
                            u.translate.x(e)
                        } else {
                            i.easing = true;
                            i.easingTo = e;
                            r.element.style[i.vendor + "Transition"] = "all " + r.transitionSpeed + "s " + r.easing;
                            i.animatingInterval = setInterval(function() {
                                o.dispatchEvent("animating")
                            }, 1);
                            o.events.addEvent(r.element, o.transitionCallback(), u.translate.easeCallback);
                            u.translate.x(e)
                        }
                        if (e === 0) {
                            r.element.style[i.vendor + "Transform"] = ""
                        }
                    },
                    x: function(n) {
                        if (r.disable === "left" && n > 0 || r.disable === "right" && n < 0) {
                            return
                        }
                        if (!r.hyperextensible) {
                            if (n === r.maxPosition || n > r.maxPosition) {
                                n = r.maxPosition
                            } else if (n === r.minPosition || n < r.minPosition) {
                                n = r.minPosition
                            }
                        }
                        n = parseInt(n, 10);
                        if (isNaN(n)) {
                            n = 0
                        }
                        if (o.canTransform()) {
                            var s = "translate3d(" + n + "px, 0,0)";
                            r.element.style[i.vendor + "Transform"] = s
                        } else {
                            r.element.style.width = (e.innerWidth || t.documentElement.clientWidth) + "px";
                            r.element.style.left = n + "px";
                            r.element.style.right = ""
                        }
                    }
                },
                drag: {
                    listen: function() {
                        i.translation = 0;
                        i.easing = false;
                        o.events.addEvent(r.element, o.eventType("down"), u.drag.startDrag);
                        o.events.addEvent(r.element, o.eventType("move"), u.drag.dragging);
                        o.events.addEvent(r.element, o.eventType("up"), u.drag.endDrag)
                    },
                    stopListening: function() {
                        o.events.removeEvent(r.element, o.eventType("down"), u.drag.startDrag);
                        o.events.removeEvent(r.element, o.eventType("move"), u.drag.dragging);
                        o.events.removeEvent(r.element, o.eventType("up"), u.drag.endDrag)
                    },
                    startDrag: function(e) {
                        var t = e.target ? e.target : e.srcElement,
                            n = o.parentUntil(t, "data-snap-ignore");
                        if (n) {
                            o.dispatchEvent("ignore");
                            return
                        }
                        if (r.dragger) {
                            var s = o.parentUntil(t, r.dragger);
                            if (!s && i.translation !== r.minPosition && i.translation !== r.maxPosition) {
                                return
                            }
                        }
                        o.dispatchEvent("start");
                        r.element.style[i.vendor + "Transition"] = "";
                        i.isDragging = true;
                        i.hasIntent = null;
                        i.intentChecked = false;
                        i.startDragX = o.page("X", e);
                        i.startDragY = o.page("Y", e);
                        i.dragWatchers = {
                            current: 0,
                            last: 0,
                            hold: 0,
                            state: ""
                        };
                        i.simpleStates = {
                            opening: null,
                            towards: null,
                            hyperExtending: null,
                            halfway: null,
                            flick: null,
                            translation: {
                                absolute: 0,
                                relative: 0,
                                sinceDirectionChange: 0,
                                percentage: 0
                            }
                        }
                    },
                    dragging: function(e) {
                        if (i.isDragging && r.touchToDrag) {
                            var n = o.page("X", e),
                                s = o.page("Y", e),
                                a = i.translation,
                                f = u.translate.get.matrix(4),
                                l = n - i.startDragX,
                                c = f > 0,
                                h = l,
                                p;
                            if (i.intentChecked && !i.hasIntent) {
                                return
                            }
                            if (r.addBodyClasses) {
                                if (f > 0) {
                                    o.klass.add(t.body, "snapjs-left");
                                    o.klass.remove(t.body, "snapjs-right")
                                } else if (f < 0) {
                                    o.klass.add(t.body, "snapjs-right");
                                    o.klass.remove(t.body, "snapjs-left")
                                }
                            }
                            if (i.hasIntent === false || i.hasIntent === null) {
                                var d = o.angleOfDrag(n, s),
                                    v = d >= 0 && d <= r.slideIntent || d <= 360 && d > 360 - r.slideIntent,
                                    m = d >= 180 && d <= 180 + r.slideIntent || d <= 180 && d >= 180 - r.slideIntent;
                                if (!m && !v) {
                                    i.hasIntent = false
                                } else {
                                    i.hasIntent = true
                                }
                                i.intentChecked = true
                            }
                            if (r.minDragDistance >= Math.abs(n - i.startDragX) || i.hasIntent === false) {
                                return
                            }
                            o.events.prevent(e);
                            o.dispatchEvent("drag");
                            i.dragWatchers.current = n;
                            if (i.dragWatchers.last > n) {
                                if (i.dragWatchers.state !== "left") {
                                    i.dragWatchers.state = "left";
                                    i.dragWatchers.hold = n
                                }
                                i.dragWatchers.last = n
                            } else if (i.dragWatchers.last < n) {
                                if (i.dragWatchers.state !== "right") {
                                    i.dragWatchers.state = "right";
                                    i.dragWatchers.hold = n
                                }
                                i.dragWatchers.last = n
                            }
                            if (c) {
                                if (r.maxPosition < f) {
                                    p = (f - r.maxPosition) * r.resistance;
                                    h = l - p
                                }
                                i.simpleStates = {
                                    opening: "left",
                                    towards: i.dragWatchers.state,
                                    hyperExtending: r.maxPosition < f,
                                    halfway: f > r.maxPosition / 2,
                                    flick: Math.abs(i.dragWatchers.current - i.dragWatchers.hold) > r.flickThreshold,
                                    translation: {
                                        absolute: f,
                                        relative: l,
                                        sinceDirectionChange: i.dragWatchers.current - i.dragWatchers.hold,
                                        percentage: f / r.maxPosition * 100
                                    }
                                }
                            } else {
                                if (r.minPosition > f) {
                                    p = (f - r.minPosition) * r.resistance;
                                    h = l - p
                                }
                                i.simpleStates = {
                                    opening: "right",
                                    towards: i.dragWatchers.state,
                                    hyperExtending: r.minPosition > f,
                                    halfway: f < r.minPosition / 2,
                                    flick: Math.abs(i.dragWatchers.current - i.dragWatchers.hold) > r.flickThreshold,
                                    translation: {
                                        absolute: f,
                                        relative: l,
                                        sinceDirectionChange: i.dragWatchers.current - i.dragWatchers.hold,
                                        percentage: f / r.minPosition * 100
                                    }
                                }
                            }
                            u.translate.x(h + a)
                        }
                    },
                    endDrag: function(e) {
                        if (i.isDragging) {
                            o.dispatchEvent("end");
                            var t = u.translate.get.matrix(4);
                            if (i.dragWatchers.current === 0 && t !== 0 && r.tapToClose) {
                                o.dispatchEvent("close");
                                o.events.prevent(e);
                                u.translate.easeTo(0);
                                i.isDragging = false;
                                i.startDragX = 0;
                                return
                            }
                            if (i.simpleStates.opening === "left") {
                                if (i.simpleStates.halfway || i.simpleStates.hyperExtending || i.simpleStates.flick) {
                                    if (i.simpleStates.flick && i.simpleStates.towards === "left") {
                                        u.translate.easeTo(0)
                                    } else if (i.simpleStates.flick && i.simpleStates.towards === "right" || i.simpleStates.halfway || i.simpleStates.hyperExtending) {
                                        u.translate.easeTo(r.maxPosition)
                                    }
                                } else {
                                    u.translate.easeTo(0)
                                }
                            } else if (i.simpleStates.opening === "right") {
                                if (i.simpleStates.halfway || i.simpleStates.hyperExtending || i.simpleStates.flick) {
                                    if (i.simpleStates.flick && i.simpleStates.towards === "right") {
                                        u.translate.easeTo(0)
                                    } else if (i.simpleStates.flick && i.simpleStates.towards === "left" || i.simpleStates.halfway || i.simpleStates.hyperExtending) {
                                        u.translate.easeTo(r.minPosition)
                                    }
                                } else {
                                    u.translate.easeTo(0)
                                }
                            }
                            i.isDragging = false;
                            i.startDragX = o.page("X", e)
                        }
                    }
                }
            },
            a = function(e) {
                if (e.element) {
                    o.deepExtend(r, e);
                    i.vendor = o.vendor();
                    u.drag.listen()
                }
            };
        this.open = function(e) {
            o.dispatchEvent("open");
            o.klass.remove(t.body, "snapjs-expand-left");
            o.klass.remove(t.body, "snapjs-expand-right");
            if (e === "left") {
                i.simpleStates.opening = "left";
                i.simpleStates.towards = "right";
                o.klass.add(t.body, "snapjs-left");
                o.klass.remove(t.body, "snapjs-right");
                u.translate.easeTo(r.maxPosition)
            } else if (e === "right") {
                i.simpleStates.opening = "right";
                i.simpleStates.towards = "left";
                o.klass.remove(t.body, "snapjs-left");
                o.klass.add(t.body, "snapjs-right");
                u.translate.easeTo(r.minPosition)
            }
        };
        this.close = function() {
            o.dispatchEvent("close");
            u.translate.easeTo(0)
        };
        this.expand = function(n) {
            var r = e.innerWidth || t.documentElement.clientWidth;
            if (n === "left") {
                o.dispatchEvent("expandLeft");
                o.klass.add(t.body, "snapjs-expand-left");
                o.klass.remove(t.body, "snapjs-expand-right")
            } else {
                o.dispatchEvent("expandRight");
                o.klass.add(t.body, "snapjs-expand-right");
                o.klass.remove(t.body, "snapjs-expand-left");
                r *= -1
            }
            u.translate.easeTo(r)
        };
        this.on = function(e, t) {
            s[e] = t;
            return this
        };
        this.off = function(e) {
            if (s[e]) {
                s[e] = false
            }
        };
        this.enable = function() {
            o.dispatchEvent("enable");
            u.drag.listen()
        };
        this.disable = function() {
            o.dispatchEvent("disable");
            u.drag.stopListening()
        };
        this.settings = function(e) {
            o.deepExtend(r, e)
        };
        this.state = function() {
            var e, t = u.translate.get.matrix(4);
            if (t === r.maxPosition) {
                e = "left"
            } else if (t === r.minPosition) {
                e = "right"
            } else {
                e = "closed"
            }
            return {
                state: e,
                info: i.simpleStates
            }
        };
        a(n)
    };
    if (typeof module !== "undefined" && module.exports) {
        module.exports = n
    }
    if (typeof ender === "undefined") {
        this.Snap = n
    }
    if (typeof define === "function" && define.amd) {
        define("snap", [], function() {
            return n
        })
    }
}).call(this, window, document)

}(jQuery));
