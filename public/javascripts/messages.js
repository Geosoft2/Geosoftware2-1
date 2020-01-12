// jshint browser: true
// jshint node: true
// jshint esversion: 6
"use strict";


/**
* @desc Geosoftware 2;
* apllication for error messages
*/
//TODO das läuft an dieser stelle nicht so wie es sollte
$(".err_mess").on("mouseenter", function(){
    $(".err_mess").stop(true, true);
    $(".err_mess").delay(0).fadeIn(0);
});

$(".err_mess").on("mouseleave", function(){
    $(".err_mess").delay(0).fadeOut(3000);
});

function giveError(err){
    $("#message").append("<div class='alert alert-danger col-12 err_mess' role='alert'>" + err.message + "</div>");
    $(".err_mess").delay(3000).fadeOut(5000);
}
function giveErrorMessage(message){
    $("#message").append("<div class='alert alert-danger col-12 err_mess' role='alert'>" + message + "</div>");
    $(".err_mess").delay(3000).fadeOut(5000);
}
function giveMessage(message){
    $("#message").append("<div class='alert alert-secondary col-12 err_mess' role='alert' style='margin-top:5px'>" + message + "</div>");
    $(".err_mess").delay(3000).fadeOut(5000);
}
function giveSuccessMessage(message){
    $("#message").append("<div class='alert alert-success col-12 err_mess' role='alert' style='margin-top:5px'>" + message + "</div>");
    $(".err_mess").delay(3000).fadeOut(5000);
}