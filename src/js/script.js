"use strict";

d3.json("data/data.json", function(json) {
    console.log("Reading JSON")
    // console.log(json[0])
    // console.log(json[0].xPos)
    var count = 0;
    var pass = 0;
    var running = true;
    //console.log(count + "Records processed");

    var width = 650
    var height = width * 0.75;
    var scene = new THREE.Scene()
    var camera = new THREE.PerspectiveCamera( 75, width / height, 0.1, 1000 );
    camera.position.set(30,175,150);
    camera.lookAt(-10,-20,0);

    var light = new THREE.DirectionalLight( 0xffffff, 1.5);
    light.position.set(0,2,20);
    light.lookAt(0,0,0);
    camera.add(light);
    scene.add(camera);

    var renderer = new THREE.WebGLRenderer();

    renderer.setSize( width, height );
    document.getElementById("scene").appendChild( renderer.domElement );

    var vectors = []
    var m = new THREE.PointsMaterial({
        vertexColors: THREE.VertexColors,
        size: 0.2
    });
	
    var g = new THREE.Geometry();
    var pointCloud =THREE.Points();
    
	for(var i=0;i<json.length;i++) {
        g.vertices.push(new THREE.Vector3(json[i].xPos[0], json[i].yPos[0], json[i].zPos[0]));
        vectors.push(new THREE.Vector3(json[i].xPos[0], json[i].yPos[0], json[i].zPos[0]));
        if(json[i].label[0] == 1)
            g.colors.push(new THREE.Color("rgb(49,130,189)"))
        if(json[i].label[0] == 3)
            g.colors.push(new THREE.Color("rgb(189,189,189)"))
        else
            g.colors.push(new THREE.Color("rgb(227,74,51)"))

    }
    pointCloud = new THREE.Points(g, m);
    pointCloud.name = 'shanksCloud';
    scene.add(pointCloud);

    var abc = pointCloud.geometry

    var myOptions = new THREE.OrbitControls(camera, renderer.domElement);
    myOptions.enablePan = false;
    myOptions.update();
    
    document.addEventListener("keydown", onArrowKeyDown, false);
    function onArrowKeyDown(event) {
        var keyCode = event.which;
        if (keyCode == 49) {
            running = true;
        }
        else  if (keyCode == 50) {
            running = false;
        }
    };
    render();
    function render() {
        if(running == true) {
			//console.log("time instant:"++"sec.");
            setTimeout(function() {
                requestAnimationFrame(render);
                // animating/drawing code goes here
            }, 1000);
            renderer.render( scene, camera );
            pass++;
            for (var i = 0; i < json.length; i++) {
                pointCloud.geometry.vertices[i].x = json[i].xPos[pass];
                pointCloud.geometry.vertices[i].y = json[i].yPos[pass];
                pointCloud.geometry.vertices[i].z = json[i].zPos[pass];

            }
            if (pass >= json[0].xPos.length)
                pass = 0;
            pointCloud.geometry.verticesNeedUpdate = true;
        }
        else {
            requestAnimationFrame(render);
            renderer.render( scene, camera );
        }
    }

})