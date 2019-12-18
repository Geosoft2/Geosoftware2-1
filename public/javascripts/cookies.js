// jshint browser: true
// jshint node: true
// jshint esversion: 6
"use strict";

//TODO: https://www.w3schools.com/js/js_cookies.asp
/**
* @desc Geosoftware 2;
* apllication for cookie handeling
*/


// in den Cookies wird folgendes gespeichert
//die Startansicht des Users --> damit kann dann über den Homebutten die ursprüngliche Ansicht wiederhergestellt werden
//und Ausdehnung
//die letzte Ansicht des Users --> wenn keine Eingaben über die req res erfolgt dann wird diese Position verwendet
//eventuell die BBox des Users
//

/** function to get the current expansion of the map and save it as a cookie
**/
function saveCookie(){
    var currentZoom = map.getZoom();
    var currentCenter = map.getCenter();
    //TODO diese Parameter können noch in der URL gespeichert werden
    var currentSearch;
    //is twitter activated or not? Default is true, but the User can set it false so it is deactivated
    //TODO der default ist hier ja relativ egal weil die Werte aus der aktuellen Anzeige genommen werden
    //TODO oim Endeffekt können auch alle Werte aus der URL genommen werden da diese sich ja bei jeder Änderung ändern soll
    var twitter = true;

    //TODO console.log noch entfernen
    console.log(currentCenter);
    console.log(currentCenter.lat);
    console.log(currentZoom);

    document.cookie = "startX=" + currentCenter.lat;
    document.cookie = "startY=" + currentCenter.lng;
    document.cookie = "zoomlevel=" + currentZoom ;
    document.cookie = "twitter=" + "test";
    //TODO hier müssen dann auch noch die anderen Parameter gespeichert werden können und in die URL kommen
    var newRequest = ["centerpoint=[" + currentCenter.lat + "," + currentCenter.lng + "]", "zoomlevel=" + currentZoom];

    var newURL = buildUrl(newRequest);
    console.log(newURL);

    //window.location.href = newURL;
    var justReq = newURL.split("?")[1];
    var stateObj = {foo: justReq};
    history.pushState(stateObj, "Cookie-Update", "?" + justReq);
    $("#message").append("<div class='alert alert-secondary col-12' role='alert' style='margin-top:5px'>" + "Your current view has saved  as your personal view" + "</div>");

}

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i <ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function cookieOk() {
  var now = new Date(); // Variable für aktuelles Datum
  var lifetime = now.getTime(); // Variable für Millisekunden seit 1970 bis aktuelles Datum
  var deleteCookie = lifetime + 2592000000; // Macht den Cookie 30 Tage gültig.

  now.setTime(deleteCookie);
  var enddate = now.toUTCString();

  document.cookie = "setCookieHinweis = set; path=/; secure; expires=" + enddate;
  document.getElementById("cookie-popup").classList.add("hidden");
}