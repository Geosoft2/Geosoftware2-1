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
function saveCookie() {
  console.log("halloWelt");
  var currentZoom = map.getZoom();
  var currentCenter = map.getCenter();
  console.log(currentCenter);
  document.cookie = "startPoint=" + currentCenter;
  document.cookie = "expansion=" + currentZoom;
}

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for (var i = 0; i < ca.length; i++) {
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