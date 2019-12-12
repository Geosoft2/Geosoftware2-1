function getOneUrlParam(param){
    var allParameter = getAllUrlParams();

}

/**
function to get all parameters into a JSON, that are given in the URL
*/
function getAllUrlParams() {

  // get query string from url (optional) or window
  var queryString = window.location.search.substring(1);

  var obj = {};

  // if query string exists
  if (queryString) {
/**
    // stuff after # is not part of query string, so get rid of it
    queryString = queryString.split('#')[0];
*/
    // split our query string into its component parts
    var arr = queryString.split('&');

    for (var i = 0; i < arr.length; i++) {
      // separate the keys and the values
      var a = arr[i].split('=');

      // set parameter name and value (use "" if empty)
      var paramName = a[0];
      var paramValue = typeof (a[1]) === 'undefined' ? "" : a[1];

      // (optional) keep case consistent
      paramName = paramName.toLowerCase();
      if (typeof paramValue === 'string') paramValue = paramValue.toLowerCase();


        // we're dealing with a string
        if (!obj[paramName]) {
          // if it doesn't exist, create property
          obj[paramName] = paramValue;
        } else if (obj[paramName] && typeof obj[paramName] === 'string'){
          // if property does exist and it's a string, convert it to an array
          obj[paramName] = [obj[paramName]];
          obj[paramName].push(paramValue);
        } else {
          // otherwise add the property
          obj[paramName].push(paramValue);
        }

    }
  }
  console.log(obj);
  return obj;
}

/**
function to update the current url with the new given parameters
*/
function buildUrl (arr){
    var url = window.location.href.split("?")[0];
    var request = getAllUrlParams();
    var urlString= url + "?"
    for (var i = 0; i<arr.length;i++){
        var name = arr[i].split("=")[0];
        console.log(name);
        var value = arr[i].split("=")[1];
        console.log(value);
        request[name] = value;
        console.log(request);

    }
    if (request.centerpoint){
        urlString = urlString + "centerpoint=" + request.centerpoint + "&";
    }
    if (request.zoomlevel){
        urlString = urlString + "zoomlevel=" + request.zoomlevel + "&";
    }
    return urlString;
}

/**
* function to change one value of the URL and send it to the browsers window
* @param name is the name of the parameter (e.g. zoomlevel)
* @param value is the value of the parameter which shold be changed
*/
function updateOneParameter (name, value){

}