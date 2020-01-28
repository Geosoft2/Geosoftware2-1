// jshint browser: true
// jshint node: true
// jshint esversion: 6
"use strict";


/**
* @desc Geosoftware 2;
* apllication for error messages
*/
$(document).ready(() => {
    $(".err_mess").on("mouseenter", function(){
        $(".err_mess").stop(true, true);
        $(".err_mess").delay(0).fadeIn(0);
    });
    
    $(".err_mess").on("mouseleave", function(){
        $(".err_mess").delay(0).fadeOut(3000);
    });
});


function giveError(err){
    $("#message").append("<div class='alert alert-danger col-12 err_mess' role='alert'>" + err.message + "</div>");
    $(".err_mess").delay(3000).fadeOut(5000);
    $(".err_mess").on("mouseenter", function(){
        $(".err_mess").stop(true, true);
        $(".err_mess").delay(0).fadeIn(0);
    });
    
    $(".err_mess").on("mouseleave", function(){
        $(".err_mess").delay(0).fadeOut(3000);
    });
}
function giveErrorMessage(message){
    $("#message").append("<div class='alert alert-danger col-12 err_mess' role='alert'>" + message + "</div>");
    $(".alert-danger").delay(3000).fadeOut(5000);
    $(".alert-danger").on("mouseenter", function(){
        $(".alert-danger").stop(true, true);
        $(".alert-danger").delay(0).fadeIn(0);
    });
    
    $(".err_mess").on("mouseleave", function(){
        $(".err_mess").delay(0).fadeOut(3000);
    });
}
function giveMessage(message){
    $("#message").append("<div class='alert alert-secondary col-12 err_mess' role='alert' style='margin-top:5px'>" + message + "</div>");
    $(".alert-secondary").delay(3000).fadeOut(5000);
    $(".alert-secondary").on("mouseenter", function(){
        $(".alert-secondary").stop(true, true);
        $(".alert-secondary").delay(0).fadeIn(0);
    });
    
    $(".err_mess").on("mouseleave", function(){
        $(".err_mess").delay(0).fadeOut(3000);
    });
}
function giveSuccessMessage(message){
    $("#message").append("<div class='alert alert-success col-12 err_mess' role='alert' style='margin-top:5px'>" + message + "</div>");
    $(".alert-success").delay(3000).fadeOut(5000);
    $(".alert-success").on("mouseenter", function(){
        $(".alert-success").stop(true, true);
        $(".alert-success").delay(0).fadeIn(0);
    });
    
    $(".alert-success").on("mouseleave", function(){
        $(".alert-success").delay(0).fadeOut(3000);
    });
}
function giveLoadMessage(message, classy){
    $("#message").append("<div class='alert alert-secondary col-12 err_mess " + classy + "' role='alert' style='margin-top:5px'><div class='spinner-border spinner-border-sm text-dark' role='status'><span class='sr-only'>Loading...</span></div>" + message + "</div>");
}