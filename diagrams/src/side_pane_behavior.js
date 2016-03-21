(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.side_pane_behavior = factory();
    }
}(this, function() {

    //
// Debounce calls to "callback" routine so that multiple calls
// made to the event handler before the expiration of "delay" are
// coalesced into a single call to "callback". Also causes the
// wait period to be reset upon receipt of a call to the
// debounced routine. Accumulates all data passed to the callback
// routine during calls that are not passed on to "callback" and
// then hands it off to "callback" via a property called "data"
// on the context object for that call.  "data" is a (possibly
// jagged) 2 dimensional array containing the data accumulated
// during all the calls to the debounced function since the
// previous expiration of "delay" milliseconds.
//
    function debounce(delay, callback, accumulateData) {
        var timeout = null;
        var theData = [];
        return function() {
            //
            // accumulate arguments in case caller is interested
            // in that data
            //
            if (accumulateData) {
                var arr = [];
                for (var i = 0; i < arguments.length; ++i)
                    arr.push(arguments[i]);
                theData.push(arr);
            }

            //
            // if a timeout has been registered before then
            // cancel it so that we can setup a fresh timeout
            //
            if (timeout) {
                clearTimeout(timeout);
            }
            var args = arguments;
            timeout = setTimeout(function() {
                callback.apply((accumulateData) ? {data: theData} : null, args);
                theData = []; // clear the data array
                timeout = null;
            }, delay);
        };
    }

    function toArr(htmlCollection) {
        return Array.prototype.slice.call(htmlCollection)
    }

    function removeClasses(domNodes, classNames) {
        domNodes.forEach(function(currDomNode) {
            classNames.forEach(function(currClassName) {
                currDomNode.classList.remove(currClassName)
            })
        })
    }


    function toggleClass(domNode, className) {
        if (domNode.classList.contains(className)) {
            domNode.classList.remove(className)
        } else {
            domNode.classList.add(className)
        }
    }

    function toggleClassForNodes(domNodes, className) {
        domNodes.forEach(function(currDomNode) {
            toggleClass(currDomNode, className)
        })
    }

    function isElementInViewport(el) {
        var rect = el.getBoundingClientRect();

        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /*or $(window).height() */
            rect.right <= (window.innerWidth || document.documentElement.clientWidth) /*or $(window).width() */
        );
    }

    // ---------------------------------------------------


    function initNavigation() {

        addEventListener('DOMContentLoaded', scrollSpyDraw, false);
        addEventListener('load', scrollSpyDraw, false);
        addEventListener('scroll', scrollSpyDraw, false);
        addEventListener('resize', scrollSpyDraw, false);
    }


    var scrollSpyDraw = debounce(100, function() {
        var result = partitionSideHeaders()
        var visible = result.visible
        var nonVisible = result.nonVisible

        console.log("visible ---")
        visible.forEach(function(currHeader) {
            console.log("\t" + currHeader.innerHTML)
        })

        console.log("NOT visible  ---")
        nonVisible.forEach(function(currHeader) {
            console.log("\t" + currHeader.innerHTML)
        })

        // reset
        removeClasses(visible.concat(nonVisible), ["scrollSpyVisible", "scrollSpyNonVisible"])

        // draw
        toggleClassForNodes(visible, "scrollSpyVisible")
        toggleClassForNodes(nonVisible, "scrollSpyNonVisible")

    })

    function partitionSideHeaders() {

        var allCenterHeaders = toArr(document.getElementsByClassName("diagramHeader"))

        var visibleCenter = []
        var nonVisibleCenter = []

        allCenterHeaders.forEach(function(currCenterHeader) {
            if (isElementInViewport(currCenterHeader)) {
                visibleCenter.push(currCenterHeader)
            }
            else {
                nonVisibleCenter.push(currCenterHeader)
            }
        })


        function getMatchingSideHeader(centerHeader) {
            return allSideHeaders.find(function(currSideHeader) {
                return centerHeader.innerHTML === currSideHeader.innerHTML
            })
        }

        var allSideHeaders = toArr(document.getElementsByClassName("sideHeader"))
        var visibleSide = visibleCenter.map(getMatchingSideHeader)
        var nonVisibleSide = nonVisibleCenter.map(getMatchingSideHeader)


        return {
            visible:    visibleSide,
            nonVisible: nonVisibleSide
        }
    }


    return {
        initNavigation: initNavigation
    }
}));
