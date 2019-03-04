var localhostUrl = "http://127.0.0.1:5000" ;
var productionUrl = "https://api.bilonz.com";

var apiUrl = productionUrl;
//var apiUrl = productionUrl;

//Get Token from Session Storage
var token = sessionStorage.getItem("token");