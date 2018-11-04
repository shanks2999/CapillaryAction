"use strict";


d3.json("data/data.json", function(json) {

    console.log("Reading JSON")
    console.log(json[0].label)
    console.log(json[0].xPos)
    var count = 0;

    for(var i=0;i<json.length;i++) {

        count++
    }
    console.log(count + "Records processed");

})