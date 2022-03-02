// jQuery('document').ready(function(){
    // Shared variables
    var areaStage = { O1: { stage: 0, desc: "Outside the planned Fiber area" },
                      N1: { stage: 1, desc: "Fiber Area North 1" },
                      E1: { stage: 3, desc: "Fiber Area East 1" },
                      S1: { stage: 2, desc: "Fiber Area South 1" },
                      W1: { stage: 1, desc: "Fiber Area West 1" },
                      C1: { stage: 6, desc: "Fiber Area Central 1" }
                    };
    var stages = [
            { color: "#000000", 
                title: "Currently Outside Service Area",
                description: "But we may grow" },
            { color: "#FFD800", 
                title: "Interest",
                description: "Tell us where to build" },
            { color: "#F48000", 
                title: "Pre Signup",
                description: "Choose your package" },
            { color: "#E3366F", 
                title: "Pre Construction",
                description: "Project Started" },
            { color: "#70C460", 
                title: "Construction",
                description: "Construction Started" },
            { color: "#BF64AC", 
                title: "Schedule Install",
                description: "Get ready for fiber" },
            { color: "#14AADD", 
                title: "Fiberhood",
                description: "Project Complete" }
            ];
    var fiberAreas;
    var mapPolys = [];
    var geocoder;
    var map;
    var mapBounds = { north: 41.104052326615744, south: 40.97690805422386,
                      west: -81.8183823409927, east: -81.66526039275051 };
    var infoWindow;
    var update_timeout = null;
    var addrSearchString = "";
    var addrSearchResult = "";
    // Initialize the map
    function initMap() {
        map = new google.maps.Map(document.getElementById("map"), {
            center: { lat: 41.0256, lng: -81.7299 },
        });
        map.setOptions({
            'fullscreenControl': false,
            'minZoom': map.getZoom(),
            'streetViewControl': false,
            'restriction': {
                latLngBounds: mapBounds,
                strictBounds: false
            }
        });
        var bounds = new google.maps.LatLngBounds();
        bounds.extend({ lat: mapBounds.south, lng: mapBounds.west });
        bounds.extend({ lat: mapBounds.north, lng: mapBounds.east });
        window.map.fitBounds(bounds, 0);
        map.addListener("click", function(event, objref){
            update_timeout = setTimeout(function(event, objref){
                showCoords(event, objref);
            }, 500, event, this);        
        });

        google.maps.event.addListener(map, 'dblclick', function(event) {       
            clearTimeout(update_timeout);
        });
        
        var addrSearchButton = document.getElementById("addrSearchButton");
        addrSearchButton.addEventListener("click", event => {
            codeAddress();
        });

        jQuery('document').ready(function(){
            prepStageLists()
            loadKML();
        });

        geocoder = new google.maps.Geocoder();
    }
    // Address search
    function codeAddress() {
        if (infoWindow) {
            infoWindow.close();
        }
        var address = document.getElementById('address').value;
        geocoder.geocode({
            'address': address,
            bounds: {
                north: 41.0739906462556, south: 40.98320264727234, west: -81.82692649122862, east: -81.68006755419823
            }
        }, function (results, status) {
            if (status == 'OK') {
                addrSearchString = address;
                addrSearchResult = results[0].formatted_address;
                map.setCenter(results[0].geometry.location);
                // See if the address is in a polygon, not a great way to do this but 
                // this is needed for address search dialogs to work correctly
                var p = null;
                for (var i = 0; i < mapPolys.length; i++) {
                    if (google.maps.geometry.poly.containsLocation(results[0].geometry.location, mapPolys[i])) {
                        p = mapPolys[i];
                        break;
                    }
                }
                // Fake mouse event to load dialog
                var mev = {
                    stop: null,
                    latLng: { lat: results[0].geometry.location.lat(), lng: results[0].geometry.location.lng() }
                }
                if (p) {
                    google.maps.event.trigger(p, 'click', mev);
                } else {
                    google.maps.event.trigger(this.map, 'click', mev);
                }
            } else {
                alert('Geocode was not successful for the following reason: ' + status);
            }
        });
        this.event.preventDefault();
    }
    // Show the ballon dialog for the construction areas if they are clicked on
    function showFiberAreaInfoWin(e, objref) {
        var lat = (typeof(e.latLng.lat) == 'function') ? e.latLng.lat() : e.latLng.lat;
        var lng = (typeof(e.latLng.lng) == 'function') ? e.latLng.lng() : e.latLng.lng;        
        if (addrSearchString == "") {
            geocoder
                .geocode({ location: { lat: lat, lng: lng } })
                .then((response) => {
                    if (response.results[0]) {
                        addrSearchResult = response.results[0].formatted_address;
                    }
                    var content = "<b>Area: </b>" + objref.name + "<br>" + 
                    objref.description + "<br><br>" +
                        ((areaStage[objref.name].stage > 0) ?
                            "<b>Stage " + areaStage[objref.name].stage + ": </b>" + stages[areaStage[objref.name].stage].title + "<br>" + stages[areaStage[objref.name].stage].description + "<br><br>" : "<br>") +
                        ((areaStage[objref.name].stage <= 4) ?
                            "<button onclick=\"expressInterest('" + objref.name + "','" + encodeURIComponent(addrSearchString) + "','" + encodeURIComponent(addrSearchResult) + "'," + lat + "," + lng + ")\">Express Interest</button><p>" :
                            "<button onclick=\"scheduleInstall('" + objref.name + "','" + encodeURIComponent(addrSearchString) + "','" + encodeURIComponent(addrSearchResult) + "'," + lat + "," + lng + ")\">Schedule Installation</button><p>");
                    ShowInfoWin(content, e.latLng, objref);   
                    // showCoords(e, objref); 
                });
        } else {
            var content = "<b>Area: </b>" + objref.name + "<br>" + 
                objref.description + "<br><br>" +
                    ((areaStage[objref.name].stage > 0) ?
                        "<b>Stage " + areaStage[objref.name].stage + ": </b>" + stages[areaStage[objref.name].stage].title + "<br>" + stages[areaStage[objref.name].stage].description + "<br><br>" : "<br>") +
                    ((areaStage[objref.name].stage <= 4) ?
                        "<button onclick=\"expressInterest('" + objref.name + "','" + encodeURIComponent(addrSearchString) + "','" + encodeURIComponent(addrSearchResult) + "'," + lat + "," + lng + ")\">Express Interest</button><p>" :
                        "<button onclick=\"scheduleInstall('" + objref.name + "','" + encodeURIComponent(addrSearchString) + "','" + encodeURIComponent(addrSearchResult) + "'," + lat + "," + lng + ")\">Schedule Installation</button><p>");
            ShowInfoWin(content, e.latLng, objref); 
            // showCoords(e, objref); 
        }
    }
    // Show the ballon dialog for the areas outside the construction areas if they are clicked
    function showOutsideInfoWin(e, objref) {
        var lat = (typeof(e.latLng.lat) == 'function') ? e.latLng.lat() : e.latLng.lat;
        var lng = (typeof(e.latLng.lng) == 'function') ? e.latLng.lng() : e.latLng.lng;
        if (addrSearchString == "") {
            geocoder
                .geocode({ location: { lat: lat, lng: lng } })
                .then((response) => {
                    if (response.results[0]) {
                        addrSearchResult = response.results[0].formatted_address;
                    }
                    var content = "<b>Area: </b>Outside<br>" + 
                        "Outside the planned Fiber area<br>" +
                        "<br>" +
                        "<button onclick=\"expressInterest('Outside','" + encodeURIComponent(addrSearchString) + "','" + encodeURIComponent(addrSearchResult) + "'," + lat + "," + lng + ")\">Express Interest</button><p>";
                    ShowInfoWin(content, e.latLng, objref);
                });
        } else {
            var content = "<b>Area: </b>Outside<br>" + 
                    "Outside the planned Fiber area<br>" +
                    "<br>" +
                    "<button onclick=\"expressInterest('Outside','" + encodeURIComponent(addrSearchString) + "','" + encodeURIComponent(addrSearchResult) + "'," + lat + "," + lng + ")\">Express Interest</button><p>";
            ShowInfoWin(content, e.latLng, objref);
        }
    }
    function ShowInfoWin(content, position, ref) {
        if (!infoWindow) {
            infoWindow = new google.maps.InfoWindow({ map: map });
        } else {
            infoWindow.close();
        }
        // if (position.lat > mapBounds.north || position.lat < mapBounds.south || position.lng < mapBounds.west || position.lng > mapBounds.east) {
        //     content = 'This is beyond the bounds of any future growth for Wadsworth CityLink Fiber.';
        // }
        infoWindow.setContent(content);
        infoWindow.setPosition(position);
        infoWindow.open(ref);
        addrSearchString = "";
        addrSearchResult = "";
        adjustInforWin();
    }
    function expressInterest(area, searchaddress, geocodeaddress, lat, lng) {
        var elem = document.querySelector('#area');
        elem.value = area;
        elem.setAttribute('readonly','readonly');
        elem = document.querySelector('#search-address');
        elem.value = decodeURIComponent(searchaddress);
        elem.setAttribute('readonly','readonly');
        elem = document.querySelector('#geocode-address');
        elem.value = decodeURIComponent(geocodeaddress);
        elem.setAttribute('readonly','readonly');
        elem = document.querySelector('#latitude');
        elem.value = lat;
        elem.setAttribute('readonly','readonly');
        elem = document.querySelector('#longitude');
        elem.value = lng;
        elem.setAttribute('readonly','readonly');
        document.querySelector('#geocode-address').setAttribute('readonly','readonly');
        document.querySelector('#btn-express-interest').addEventListener('click', expressInterestSubmit);
        //document.querySelector('.modal-window-express-interest .smu-form-4col-content-hidden').display = 'none';
        var modal = document.querySelector('.modal-window-express-interest');
        console.log("expressInterest: area=" + area + ", searchaddress=" + decodeURIComponent(searchaddress) + ", geocodeaddress=" + decodeURIComponent(geocodeaddress) + ", lat=" + lat.toString() + ", lng=" + lng.toString());
        modal.style.display = 'block';
        modal.style.opacity = 1;
    }
    function scheduleInstall(area, searchaddress, geocodeaddress, lat, lng) {
        var elem = document.querySelector('#area-2');
        elem.value = area;
        elem.setAttribute('readonly','readonly');
        elem = document.querySelector('#search-address-2');
        elem.value = decodeURIComponent(searchaddress);
        elem.setAttribute('readonly','readonly');
        elem = document.querySelector('#geocode-address-2');
        elem.value = decodeURIComponent(geocodeaddress);
        elem.setAttribute('readonly','readonly');
        elem = document.querySelector('#latitude-2');
        elem.value = lat;
        elem.setAttribute('readonly','readonly');
        elem = document.querySelector('#longitude-2');
        elem.value = lng;
        elem.setAttribute('readonly','readonly');
        document.querySelector('#geocode-address-2').setAttribute('readonly','readonly');
        document.querySelector('#btn-express-interest').addEventListener('click', scheduleInstallSubmit);
        // document.querySelector('.modal-window-schedule-installation .smu-form-4col-content-hidden').display = 'none';
        var modal = document.querySelector('.modal-window-schedule-installation');
        console.log("scheduleInstall: area=" + area + ", searchaddress=" + decodeURIComponent(searchaddress) + ", geocodeaddress=" + decodeURIComponent(geocodeaddress) + ", lat=" + lat.toString() + ", lng=" + lng.toString());
        modal.style.display = 'block';
        modal.style.opacity = 1;
    }
    function expressInterestSubmit() {
        console.log('Call web service');
        document.querySelector('.modal-window-express-interest .fiber-service-form-element').style.display = 'none';
        document.querySelector('.modal-window-express-interest .w-form-done').style.display = 'block';
        this.event.preventDefault();
    }
    function scheduleInstallSubmit() {
        console.log('Call web service');
        document.querySelector('.modal-window-schedule-installation .fiber-service-form-element').style.display = 'none';
        document.querySelector('.modal-window-schedule-installation .w-form-done').style.display = 'block';
        this.event.preventDefault();
    }
    function adjustInforWin() {
        // See if it's too close to the edge and move it if needed
        setTimeout(() => {
            var infoWin = document.querySelector('.gm-style-iw-c');
            var infoWinTag = document.querySelector('.gm-style-iw-t');
            var infoWinCloseBtn = document.querySelector('.gm-style-iw-c button.gm-ui-hover-effect');
            var visTopCenter = isVisible(infoWinCloseBtn);
            infoWinCloseBtn.classList.add("gm-style-iw-c-button-shiftleft");
            var visTopLeft = isVisible(infoWinCloseBtn);
            infoWinCloseBtn.classList.remove("gm-style-iw-c-button-shiftleft");
            infoWinCloseBtn.classList.add("gm-style-iw-c-button-shiftright");
            var visTopRight = isVisible(infoWinCloseBtn);
            infoWin.classList.add("gm-style-iw-c-shiftdown");
            var visBottomRight = isVisible(infoWinCloseBtn);
            infoWinCloseBtn.classList.remove("gm-style-iw-c-button-shiftright");
            var visBottomCenter = isVisible(infoWinCloseBtn);
            infoWinCloseBtn.classList.add("gm-style-iw-c-button-shiftleft");
            var visBottomLeft = isVisible(infoWinCloseBtn);
            infoWinCloseBtn.classList.remove("gm-style-iw-c-button-shiftleft");
            infoWin.classList.remove("gm-style-iw-c-shiftdown");
            setTimeout(() => {
                if (visTopLeft && !visTopCenter) {
                    infoWin.classList.add("gm-style-iw-c-trans");
                    infoWin.classList.add("gm-style-iw-c-shiftleft");
                } else if (!visTopLeft && visTopCenter) {
                    infoWin.classList.add("gm-style-iw-c-trans");
                    infoWin.classList.add("gm-style-iw-c-shiftright");
                } else if (!visTopLeft && !visTopRight && visBottomLeft && visBottomRight) {
                    infoWin.classList.add("gm-style-iw-c-trans");
                    infoWin.classList.add("gm-style-iw-c-shiftdown");
                    infoWinTag.classList.add("gm-style-iw-t-trans");
                    infoWinTag.classList.add("gm-style-iw-t-shiftdown");
                } else if (!visTopLeft && !visTopRight && visBottomLeft && !visBottomRight) {
                    infoWin.classList.add("gm-style-iw-c-trans");
                    infoWin.classList.add("gm-style-iw-c-shiftdownleft");
                    infoWinTag.classList.add("gm-style-iw-t-trans");
                    infoWinTag.classList.add("gm-style-iw-t-shiftdown");
                } else if (!visTopLeft && !visTopRight && !visBottomLeft && visBottomRight) {
                    infoWin.classList.add("gm-style-iw-c-trans");
                    infoWin.classList.add("gm-style-iw-c-shiftdownright");
                    infoWinTag.classList.add("gm-style-iw-t-trans");
                    infoWinTag.classList.add("gm-style-iw-t-shiftdown");
                }
                setTimeout(() => {
                    infoWin.classList.remove("gm-style-iw-c-trans");
                    infoWinTag.classList.remove("gm-style-iw-t-trans");
                }, 300);
            }, 200);
        }, 200);
    }
    function showCoords(e, objref) {
        if (!objref.name) {
            showOutsideInfoWin(e, objref);
        }
    }
    function loadKML() {
        var doc;
        var req = new XMLHttpRequest();
        // req.open("GET", "/MapKML.xml");
        req.open("GET", "https://jayh13.github.io/MapKML.kml");
        req.onreadystatechange = function () {
            if (req.readyState == 4 && req.status == 200) {
                doc = req.responseXML;
                fiberAreas = JSON.parse(xml2json(doc, ""));
                for (var i = 0; i < fiberAreas.kml.Document.Placemark.length; i++) {
                    var place = fiberAreas.kml.Document.Placemark[i];
                    if (place.Polygon) {
                        var coords = place.Polygon.outerBoundaryIs.LinearRing.coordinates.replaceAll("\n","").split(" ");
                        var polyCoords = [];
                        for (var j = 0; j < coords.length; j++) {
                            if (coords[j] !== '') {
                                var coord = coords[j].split(",");
                                polyCoords.push({ lat: parseFloat(coord[1]), lng: parseFloat(coord[0]) });
                            }
                        }
                        var mapPoly = new google.maps.Polygon({
                            paths: polyCoords,
                            strokeColor: stages[areaStage[place.name].stage].color,
                            strokeOpacity: place.name == 'O1' ? 0.0 : 0.8,
                            strokeWeight: 2,
                            fillColor: stages[areaStage[place.name].stage].color,
                            fillOpacity: place.name == 'O1' ? 0.0 : 0.1,
                            name: place.name,
                            description: areaStage[place.name].desc,
                        })
                        mapPoly.setMap(map);
                        mapPoly.addListener("click", function(event, objref){
                            update_timeout = setTimeout(function(event, objref){
                                showFiberAreaInfoWin(event, objref);
                            }, 200, event, this);        
                        });
                        mapPolys.push(mapPoly);

                        var elem = document.querySelector("#w-dropdown-list-" + areaStage[place.name].stage + " > div");
                        elem.innerHTML = elem.innerHTML + areaTemplate.replace('{title}', place.name).replace('{description}', areaStage[place.name].desc);
                    }
                }
                for (var k = 1; k <= 6; k++) {
                    var cnt = document.querySelectorAll("#w-dropdown-list-" + k + " a").length;
                    document.querySelector("#w-dropdown-toggle-" + k + " .filter-info-quantity-number").innerHTML = cnt;
                }
            }
        };
        req.send(null);
    }
    var areaTemplate = '<a href="#" class="status-check-filter-drop-link w-inline-block" tabindex="0"><div class="status-check-filter-drop-label"><b>Area: </b>{title}</div><div class="status-check-filter-drop-cta">{description}</div></a>';
    function prepStageLists() {
        const stageListNames = ["#w-dropdown-list-1","#w-dropdown-list-2","#w-dropdown-list-3","#w-dropdown-list-4","#w-dropdown-list-5","#w-dropdown-list-6"];
        stageListNames.forEach(id => {
            let elem = document.querySelector(id + " > div");
            elem.innerHTML = "";
        });
    }
    // Utility Stuff
    function isVisible(elem) {
        if (!(elem instanceof Element)) throw Error('DomUtil: elem is not an element.');
        const style = getComputedStyle(elem);
        if (style.display === 'none') return false;
        if (style.visibility !== 'visible') return false;
        if (style.opacity < 0.1) return false;
        if (elem.offsetWidth + elem.offsetHeight + elem.getBoundingClientRect().height +
            elem.getBoundingClientRect().width === 0) {
            return false;
        }
        const elemCenter   = {
            x: elem.getBoundingClientRect().left + elem.offsetWidth / 2,
            y: elem.getBoundingClientRect().top + elem.offsetHeight / 2
        };
        if (elemCenter.x < 0) return false;
        if (elemCenter.x > (document.documentElement.clientWidth || window.innerWidth)) return false;
        if (elemCenter.y < 0) return false;
        if (elemCenter.y > (document.documentElement.clientHeight || window.innerHeight)) return false;
        let pointContainer = document.elementFromPoint(elemCenter.x, elemCenter.y);
        do {
            if (pointContainer === elem) return true;
        } while (pointContainer = pointContainer.parentNode);
        return false;
    }
    /*	This work is licensed under Creative Commons GNU LGPL License.
        License: http://creativecommons.org/licenses/LGPL/2.1/Version: 0.9
        Author:  Stefan Goessner/2006
        Web:     http://goessner.net/ 
    */
    function xml2json(xml, tab) {
        var X = {
            toObj: function (xml) {
                var o = {};
                if (xml.nodeType == 1) {   // element node ..
                    if (xml.attributes.length)   // element with attributes  ..
                        for (var i = 0; i < xml.attributes.length; i++)
                            o["@" + xml.attributes[i].nodeName] = (xml.attributes[i].nodeValue || "").toString();
                    if (xml.firstChild) { // element has child nodes ..
                        var textChild = 0, cdataChild = 0, hasElementChild = false;
                        for (var n = xml.firstChild; n; n = n.nextSibling) {
                            if (n.nodeType == 1) hasElementChild = true;
                            else if (n.nodeType == 3 && n.nodeValue.match(/[^ \f\n\r\t\v]/)) textChild++; // non-whitespace text
                            else if (n.nodeType == 4) cdataChild++; // cdata section node
                        }
                        if (hasElementChild) {
                            if (textChild < 2 && cdataChild < 2) { // structured element with evtl. a single text or/and cdata node ..
                                X.removeWhite(xml);
                                for (var n = xml.firstChild; n; n = n.nextSibling) {
                                    if (n.nodeType == 3)  // text node
                                        o["#text"] = X.escape(n.nodeValue);
                                    else if (n.nodeType == 4)  // cdata node
                                        o["#cdata"] = X.escape(n.nodeValue);
                                    else if (o[n.nodeName]) {  // multiple occurence of element ..
                                        if (o[n.nodeName] instanceof Array)
                                            o[n.nodeName][o[n.nodeName].length] = X.toObj(n);
                                        else
                                            o[n.nodeName] = [o[n.nodeName], X.toObj(n)];
                                    }
                                    else  // first occurence of element..
                                        o[n.nodeName] = X.toObj(n);
                                }
                            }
                            else { // mixed content
                                if (!xml.attributes.length)
                                    o = X.escape(X.innerXml(xml));
                                else
                                    o["#text"] = X.escape(X.innerXml(xml));
                            }
                        }
                        else if (textChild) { // pure text
                            if (!xml.attributes.length)
                                o = X.escape(X.innerXml(xml));
                            else
                                o["#text"] = X.escape(X.innerXml(xml));
                        }
                        else if (cdataChild) { // cdata
                            if (cdataChild > 1)
                                o = X.escape(X.innerXml(xml));
                            else
                                for (var n = xml.firstChild; n; n = n.nextSibling)
                                    o["#cdata"] = X.escape(n.nodeValue);
                        }
                    }
                    if (!xml.attributes.length && !xml.firstChild) o = null;
                }
                else if (xml.nodeType == 9) { // document.node
                    o = X.toObj(xml.documentElement);
                }
                return o;
            },
            toJson: function (o, name, ind) {
                var json = name ? ("\"" + name + "\"") : "";
                if (o instanceof Array) {
                    for (var i = 0, n = o.length; i < n; i++)
                        o[i] = X.toJson(o[i], "", ind + "\t");
                    json += (name ? ":[" : "[") + (o.length > 1 ? ("\n" + ind + "\t" + o.join(",\n" + ind + "\t") + "\n" + ind) : o.join("")) + "]";
                }
                else if (o == null)
                    json += (name && ":") + "null";
                else if (typeof (o) == "object") {
                    var arr = [];
                    for (var m in o)
                        arr[arr.length] = X.toJson(o[m], m, ind + "\t");
                    json += (name ? ":{" : "{") + (arr.length > 1 ? ("\n" + ind + "\t" + arr.join(",\n" + ind + "\t") + "\n" + ind) : arr.join("")) + "}";
                }
                else if (typeof (o) == "string")
                    json += (name && ":") + "\"" + o.toString() + "\"";
                else
                    json += (name && ":") + o.toString();
                return json;
            },
            innerXml: function (node) {
                var s = ""
                if ("innerHTML" in node)
                    s = node.innerHTML;
                else {
                    var asXml = function (n) {
                        var s = "";
                        if (n.nodeType == 1) {
                            s += "<" + n.nodeName;
                            for (var i = 0; i < n.attributes.length; i++)
                                s += " " + n.attributes[i].nodeName + "=\"" + (n.attributes[i].nodeValue || "").toString() + "\"";
                            if (n.firstChild) {
                                s += ">";
                                for (var c = n.firstChild; c; c = c.nextSibling)
                                    s += asXml(c);
                                s += "</" + n.nodeName + ">";
                            }
                            else
                                s += "/>";
                        }
                        else if (n.nodeType == 3)
                            s += n.nodeValue;
                        else if (n.nodeType == 4)
                            s += "<![CDATA[" + n.nodeValue + "]]>";
                        return s;
                    };
                    for (var c = node.firstChild; c; c = c.nextSibling)
                        s += asXml(c);
                }
                return s;
            },
            escape: function (txt) {
                return txt.replace(/[\\]/g, "\\\\")
                    .replace(/[\"]/g, '\\"')
                    .replace(/[\n]/g, '\\n')
                    .replace(/[\r]/g, '\\r');
            },
            removeWhite: function (e) {
                e.normalize();
                for (var n = e.firstChild; n;) {
                    if (n.nodeType == 3) {  // text node
                        if (!n.nodeValue.match(/[^ \f\n\r\t\v]/)) { // pure whitespace text node
                            var nxt = n.nextSibling;
                            e.removeChild(n);
                            n = nxt;
                        }
                        else
                            n = n.nextSibling;
                    }
                    else if (n.nodeType == 1) {  // element node
                        X.removeWhite(n);
                        n = n.nextSibling;
                    }
                    else                      // any other node
                        n = n.nextSibling;
                }
                return e;
            }
        };
        if (xml.nodeType == 9) // document node
            xml = xml.documentElement;
        var json = X.toJson(X.toObj(X.removeWhite(xml)), xml.nodeName, "\t");
        return "{\n" + tab + (tab ? json.replace(/\t/g, tab) : json.replace(/\t|\n/g, "")) + "\n}";
    }
// });