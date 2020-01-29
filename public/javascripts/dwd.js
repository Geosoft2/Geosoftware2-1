
/**
* function to fill all district layers with the right color depending on the severity of the
* atmosphere disturbance
* @param feature this function needs each single warnlayer
*/
function setStyles(feature) {

  //console.log(feature.properties.SEVERITY);

  if (feature.properties.SEVERITY == "Minor") {
        return {
            stroke: true,
            weight: 1,
            color: '#A4A4A4',
            fillColor: '#F4D03F',
            fillOpacity: 0.2,
        };
      }
  if (feature.properties.SEVERITY == "Moderate") {
        return {
            stroke: true,
            weight: 0.5,
            color: '#A4A4A4',
            fillColor: '#D35400',
            fillOpacity: 0.2
        };
  }

  if (feature.properties.SEVERITY == "Severe") {
      return {
          stroke: true,
          weight: 0.5,
          color: '#A4A4A4',
          fillColor: '#C0392B',
          fillOpacity: 0.2
      };
  }

  if (feature.properties.SEVERITY == "Extreme") {
      return {
          stroke: true,
          weight: 0.5,
          color: '#A4A4A4',
          fillColor: '#7D3C98',
          fillOpacity: 0.2
      };
    }
}


/**
*@desc function to get the fittung symbol and event for each warnlayer popup
*@param each single warnlayers
*@return the image and the event name
*/
function getSymbol (feature) {
    var array=new Array();
    //storm/wind
    if (feature.properties.EC_II==11 ||feature.properties.EC_II==13 || feature.properties.EC_II==51 || feature.properties.EC_II==52 || feature.properties.EC_II==53 || feature.properties.EC_II==54 || feature.properties.EC_II==55 || feature.properties.EC_II==56 || feature.properties.EC_II==57 || feature.properties.EC_II==58){
      array[0]='<img src="images/tornado.png" height="20px" weight="20px"/>';
      array[1]="strom/wind";
      return array;
    }
    //Gewitter
    if (feature.properties.EC_II==31 || feature.properties.EC_II==33 || feature.properties.EC_II==34 || feature.properties.EC_II==36 || feature.properties.EC_II==38 || feature.properties.EC_II==40 || feature.properties.EC_II==41 || feature.properties.EC_II==42 || feature.properties.EC_II==44 || feature.properties.EC_II==45
        || feature.properties.EC_II==46 || feature.properties.EC_II==48 || feature.properties.EC_II==49 || feature.properties.EC_II==95 || feature.properties.EC_II==96 ) {
      array[0]='<img src="images/Gewitter.png" height="20px" weight="20px"/>';
      array[1]="thunderstorm";
      return array;
    }
    //Nebel
    if (feature.properties.EC_II==59) {
      array[0]='<img src="images/Nebel.jpeg" height="20px" weight="20px"/>';
      array[1]="fog";
      return array;
    }
    //Regen
    if (feature.properties.EC_II==61 || feature.properties.EC_II==62 || feature.properties.EC_II==63 || feature.properties.EC_II==64 || feature.properties.EC_II==65 || feature.properties.EC_II==66 ) {
      array[0]='<img src="images/Regen.jpeg" height="20px" weight="20px"/>';
      array[1]="rain";
      return array;
    }
    //Schnee
    if (feature.properties.EC_II==70 || feature.properties.EC_II==71 || feature.properties.EC_II==72 || feature.properties.EC_II==73 || feature.properties.EC_II==74 || feature.properties.EC_II==75 || feature.properties.EC_II==76 || feature.properties.EC_II==77 || feature.properties.EC_II==78) {
      array[0]='<img src="images/Schnee.jpg" height="20px" weight="20px"/>';
      array[1]="snowfall";
      return array;
    }
    //Frost
    if (feature.properties.EC_II==81 || feature.properties.EC_II==82 || feature.properties.EC_II==22 ) {
      array[0]='<img src="images/Frost.jpg" height="20px" weight="20px"/>';
      array[1]="frost";
      return array;
    }
    //Glätte
    if (feature.properties.EC_II==24 || feature.properties.EC_II==83 || feature.properties.EC_II==84 || feature.properties.EC_II==85 || feature.properties.EC_II==86 || feature.properties.EC_II==87) {
      array[0]='<img src="images/Glätte.png" height="20px" weight="20px"/>';
      array[1]="glazed frost";
      return array;
    }

}

/**
*@desc function to filter by the event of the dwd warnlayers.
*@param response
*/
function filter_wfs_output (response) {
  var e=document.getElementById('wfs_selection_box');
  var selectedOption=e.options[e.selectedIndex].text;
  //console.log(selectedOption);



  if (selectedOption=="All") {
    return filter_dwdoutput_severity(response);
  }

  if (selectedOption=="storm/wind") {
    //if (response.properties.EVENT=="STURM" || response.properties.EVENT=="STURMBÖEN" || response.properties.EVENT=="WINDBÖEN" || response.properties.EVENT=="SCHWERE STURMBÖEN" || response.properties.EVENT=="ORKANARTIGE BÖEN" || response.properties.EVENT=="ORKANBÖEN" || response.properties.EVENT=="EXTREME ORKANBÖEN" ) {
    if (response.properties.EC_II==11 ||response.properties.EC_II==13 || response.properties.EC_II==51 || response.properties.EC_II==52 || response.properties.EC_II==53 || response.properties.EC_II==54 || response.properties.EC_II==55 || response.properties.EC_II==56 || response.properties.EC_II==57 || response.properties.EC_II==58){
      return filter_dwdoutput_severity(response);
    }
  }

  if (selectedOption=="thunderstorm") {
    if (response.properties.EC_II==31 || response.properties.EC_II==33 || response.properties.EC_II==34 || response.properties.EC_II==36 || response.properties.EC_II==38 || response.properties.EC_II==40 || response.properties.EC_II==41 || response.properties.EC_II==42 || response.properties.EC_II==44 || response.properties.EC_II==45
        || response.properties.EC_II==46 || response.properties.EC_II==48 || response.properties.EC_II==49 || response.properties.EC_II==95 || response.properties.EC_II==96 ) {
      return filter_dwdoutput_severity(response);
    }
  }

  if (selectedOption=="fog") {
    if (response.properties.EC_II==59) {
      return filter_dwdoutput_severity(response);
    }
  }

  if (selectedOption=="rain") {
    if (response.properties.EC_II==61 || response.properties.EC_II==62 || response.properties.EC_II==63 || response.properties.EC_II==64 || response.properties.EC_II==65 || response.properties.EC_II==66 ) {
      return filter_dwdoutput_severity(response);
    }
  }

  if (selectedOption=="snowfall") {
    if (response.properties.EC_II==70 || response.properties.EC_II==71 || response.properties.EC_II==72 || response.properties.EC_II==73 || response.properties.EC_II==74 || response.properties.EC_II==75 || response.properties.EC_II==76 || response.properties.EC_II==77 || response.properties.EC_II==78) {
      return filter_dwdoutput_severity(response);
    }
  }

  if (selectedOption=="frost") {
    if (response.properties.EC_II==81 || response.properties.EC_II==82 || response.properties.EC_II==22 ) {
      return filter_dwdoutput_severity(response);
    }
  }

  if (selectedOption=="glazed frost") {

    if (response.properties.EC_II==24 || response.properties.EC_II==83 || response.properties.EC_II==84 || response.properties.EC_II==85 || response.properties.EC_II==86 || response.properties.EC_II==87) {
      return filter_dwdoutput_severity(response);
    }
  }



}


function filter_dwdoutput_severity (response) {
  if (document.getElementById("Severity_Minor").checked == true) {
      if (response.properties.SEVERITY == "Minor") {
        return response;
      }
  }

  if (document.getElementById("Severity_Moderate").checked==true) {
      if (response.properties.SEVERITY == "Moderate") {
        return response;
      }
  }

  if (document.getElementById("Severity_Severe").checked==true) {
    if (response.properties.SEVERITY == "Severe") {
      return response;
    }
  }

  if (document.getElementById("Severity_Extreme").checked==true) {
    if (response.properties.SEVERITY == "Extreme") {
      return response;
    }
  }
  else {
      return null;
    }
}



function filter_severity_map(feature, array) {

  if (array== null) {
    array[0]=feature;
    return array;
  }
  for (var i =0; i<array.length; i++) {
    if (array[i].properties.GC_WARNCELLID==feature.properties.GC_WARNCELLID) {
       array[i]=get_higher_severity(array[i],feature);
       return array;
    }
  }
  array[array.length]=feature;
  return array;

}



function get_higher_severity(feature1, feature2) {
  if(feature1.properties.SEVERITY==feature2.properties.SEVERITY) {
    return feature1;
  }
  if(feature1.properties.SEVERITY=="Extreme") {
    return feature1;
  }
  if(feature2.properties.SEVERITY=="Extreme") {
    return feature2;
  }
  if(feature1.properties.SEVERITY=="Severe") {
    return feature1;
  }
  if(feature2.properties.SEVERITY=="Severe") {
    return feature2;
  }
  if(feature1.properties.SEVERITY=="Moderate") {
    return feature1;
  }
  if(feature2.properties.SEVERITY=="Moderate") {
    return feature2;
  }
  if(feature1.properties.SEVERITY=="Minor") {
    return feature1;
  }
  if(feature2.properties.SEVERITY=="Minor") {
    return feature2;
  }

}


function show_wfs_changes() {
  giveLoadMessage("Weather warnings loading", "warning-mess")
  if (WFSLayer != undefined){
  WFSLayer.clearLayers()
  }

  getWFSLayer()
  //TODO: it should wait for the draw to map and then change the messages but to present how it would look we did this:
  setTimeout(() => {
    $(".warning-mess").delay(0).fadeOut(0)
    giveSuccessMessage("Weather data has been loaded.")
  }, 5000)

}
