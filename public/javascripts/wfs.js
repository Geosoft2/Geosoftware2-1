function zoom () {
    var wfs_output=get_output();
    //console.log(wfs_output.features);
    var b_box= new Array ();
    for (i=0; i<wfs_output.features.length; i++) {
        //console.log(wfs_output.features[i]);
        var box=wfs_output.features[i].bbox;
        var center =[(box[2]+box[0])/2, (box[3]+box[1])/2];
        //console.log(box);
        //console.log(center);
        b_box[i]=center;
    }
    console.log(b_box);
    var min_long;
    var min_lat;
    var max_long;
    var max_lat;
    for (i=0; i< b_box.length; i++) {
        if (i==0) {
            min_long=b_box[i] [0];
            min_lat=b_box [i] [1];
            max_long=b_box[i] [0];
            max_lat=b_box [i] [1];
        }
        if (b_box[i] [0]< min_long) {
            min_long=b_box[i] [0];
        }
        if (b_box[i] [0]> max_long) {
            max_long=b_box[i] [0];
        }
        if (b_box [i] [1]<min_lat) {
            min_lat= b_box [i] [1];
        }
        if (b_box [i] [1]>max_lat) {
            max_lat= b_box [i] [1];
        }
    };
    var center_gesamt =[(min_long+max_long)/2, (min_lat+max_lat)/2];
    //console.log(min_long);
    //console.log(max_long);
    //console.log(min_lat);
    //console.log(max_lat);
    console.log(center_gesamt);
    return center_gesamt;
}


function show_wfs_changes() {
  WFSLayer.clearLayers();
  getWFSLayer();
  //filter_wfs_output();

}
