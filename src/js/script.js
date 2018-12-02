"use strict";

var json;
var count = 0;
var pass = 0;
var passT = 0;
var running = true;
var runningT = false;

var width = 650
var height = width * 0.75;
var mouse, raycaster;
var scene, camera, light, renderer, pointCloud;
var sceneT, cameraT, lightT, rendererT, pointTrajectory, pointSolid;
var cuboid;
var cubeWidth=3;
var cubeHeight=200;
var cubeLength=80;
var planeBackMovable = true;
var planeFrontMovable = true;
var xTranslateValue = 0;
readJSON();
createInitialScene();
createTrajectoryScene();
createPointCloud();
createRectangle();

document.addEventListener("keydown", onArrowKeyDown, false);
window.addEventListener( 'mousedown', onMouseDown, false );

function readJSON() {
    console.log("Reading JSON")
    jQuery.ajax({
        dataType: "json",
        url: "data/data.json",
        async: false,
        success: function (data) {
            json = data
        }
    });
    console.log("Done!!")
    console.log(json[0])
}


function createInitialScene() {
    raycaster = new THREE.Raycaster();
    raycaster.params.Points.threshold = 10;
    mouse = new THREE.Vector2();

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 75, width / height, 0.1, 1000 );
    camera.position.set(30,300,150);
    camera.lookAt(-10,-20,0);
	
    light = new THREE.DirectionalLight( 0xffffff, 1.5);
    light.position.set(0,2,20);
    light.lookAt(0,0,0);
    camera.add(light);
    scene.add(camera);
	
	renderer = new THREE.WebGLRenderer();
    renderer.setSize( width, height );
    document.getElementById("scene").appendChild( renderer.domElement );
    var myOptions = new THREE.OrbitControls(camera, renderer.domElement);
    myOptions.enablePan = false;
    myOptions.update();
}
function createTrajectoryScene() {
    sceneT = new THREE.Scene();
    cameraT = new THREE.PerspectiveCamera( 75, width / height, 0.1, 1000 );
    cameraT.position.set(30,175,150);
    cameraT.lookAt(-10,-20,0);

    lightT = new THREE.DirectionalLight( 0xffffff, 1.5);
    lightT.position.set(0,2,20);
    lightT.lookAt(0,0,0);
    cameraT.add(lightT);
    sceneT.add(cameraT);

    rendererT = new THREE.WebGLRenderer();

    rendererT.setSize( width, height );
    document.getElementById("trajectory_scene").appendChild( rendererT.domElement );

    var myOptionsT = new THREE.OrbitControls(cameraT, rendererT.domElement);
    myOptionsT.update();
}

function createPointCloud() {
    var vectors = []
    var m = new THREE.PointsMaterial({
        vertexColors: THREE.VertexColors,
        size: 0.2
    });

    var g = new THREE.Geometry();
    pointCloud = THREE.Points();

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
}


function onMouseDown(e) {
    mouse.x =  ( e.clientX / renderer.domElement.width  ) * 2 - 1;
    mouse.y = -( e.clientY / renderer.domElement.height ) * 2 + 1;
    raycaster.setFromCamera( mouse, camera );
    var intersects = raycaster.intersectObject(pointCloud);
    if (intersects.length > 0) {
        //console.log( 'intersects', intersects );
        // Points.js::raycast() doesn't seem to sort this correctly atm,
        // but how many points are found depends on the threshold set
        // on the raycaster as well
        // intersects = intersects.sort(function (a, b) {
        //     return a.distanceToRay - b.distanceToRay;
        // });
        var particle = intersects[0];
        console.log('Particle Clicked ', particle);

        createTrajectory()
    }
    else{
        console.log('NO Particle Clicked');
    }
}

function createTrajectory(){
    sceneT.remove(pointTrajectory);
    sceneT.remove(pointSolid);
    var vectorsT = []
    var mT = new THREE.PointsMaterial({
        vertexColors: THREE.VertexColors,
        size: 0.3
    });

    var gT = new THREE.Geometry();

    for(var i=0;i<json.length;i++) {
        if(json[i].label[0] == 3)
    	{
    		gT.vertices.push(new THREE.Vector3(json[i].xPos[0], json[i].yPos[0], json[i].zPos[0]));
    		vectorsT.push(new THREE.Vector3(json[i].xPos[0], json[i].yPos[0], json[i].zPos[0]));
            gT.colors.push(new THREE.Color("rgb(189,189,189)"));
    	}
    }
    pointSolid = new THREE.Points(gT, mT);
    pointSolid.name = 'solidParticlesForScene2';
    sceneT.add(pointSolid);

    rendererT.render( sceneT, cameraT );


    renderT();
    function renderT() {
        sceneT.remove(pointTrajectory);
        gT = new THREE.Geometry();
        vectorsT = [];
        mT = new THREE.PointsMaterial({
        vertexColors: THREE.VertexColors,
        size: 3
        });
        if(running == true) {
            setTimeout(function() {
                requestAnimationFrame(renderT);
            }, 1000);
            passT++;
            for (var i = 0; i < passT; i++) {
            	gT.vertices.push(new THREE.Vector3(json[10000].xPos[0], json[10000].yPos[0], json[10000].zPos[0]));
            	vectorsT.push(new THREE.Vector3(json[10000].xPos[0], json[10000].yPos[0], json[10000].zPos[0]));
            	gT.vertices[i].x = json[10000].xPos[passT];
                gT.vertices[i].y = json[10000].yPos[passT];
                gT.vertices[i].z = json[10000].zPos[passT];
            	gT.colors.push(new THREE.Color("rgb(227,74,51)"));
            }
            pointTrajectory = new THREE.Points(gT, mT);
            pointTrajectory.name = 'pointTrajectory';
            sceneT.add(pointTrajectory);

            rendererT.render( sceneT, cameraT );
            if (passT >= 90)
                passT = 0;
            pointCloud.geometry.verticesNeedUpdate = true;
            // pointTrajectory.geometry.verticesNeedUpdate = true;
        }
        else {

            requestAnimationFrame(renderT);
            rendererT.render( sceneT, cameraT );
        }
    }

}


    function onArrowKeyDown(event) {
        var keyCode = event.which;
        if (keyCode == 49) {
            running = true;
			render();
        }
        else  if (keyCode == 50) {
            running = false;
			render();
        }
		if (keyCode == 13) {
            runningT = true;
        }
        else  if (keyCode == 13) {
            runningT = false;
        }

        if (keyCode==87 && planeBackMovable){
            planeFrontMovable = true;
            cuboid.translateX(-0.1);
            xTranslateValue -= 0.1;
            if(-xTranslateValue > 10)
                planeBackMovable = false;

        }
        else if (keyCode==83 && planeFrontMovable){
            planeBackMovable = true;
            cuboid.translateX(0.1);
            xTranslateValue += 0.1;
            if(xTranslateValue > 18)
                planeFrontMovable = false;

        }
    };
    render();
    function render() {
		if(running == true) {
            setTimeout(function() {
                requestAnimationFrame(render);
            }, 1000);
            pass++;
			for (var i = 0; i < json.length; i++) {
                pointCloud.geometry.vertices[i].x = json[i].xPos[pass];
                pointCloud.geometry.vertices[i].y = json[i].yPos[pass];
                pointCloud.geometry.vertices[i].z = json[i].zPos[pass];
            }
			
			renderer.render( scene, camera );
            if (pass >= json[0].xPos.length)
                pass = 0;
            pointCloud.geometry.verticesNeedUpdate = true;
        }
        else {
			
            requestAnimationFrame(render);
            renderer.render( scene, camera );
        }
	}

function createRectangle() {

    var geometry = new THREE.BoxGeometry(cubeWidth,cubeHeight,cubeLength);
    var material = new THREE.MeshBasicMaterial( {color: "#ffcccc"} );
    cuboid = new THREE.Mesh( geometry, material );
    cuboid.position.y = 100;
    scene.add( cuboid );

};

		
	/*var raycaster = new THREE.Raycaster(); 
	var mouse = new THREE.Vector2();
	renderer.domElement.addEventListener('click', function(e){
		mouse.x = ( e.clientX / renderer.domElement.clientWidth ) * 2 - 1;
		mouse.y = - ( e.clientY / renderer.domElement.clientHeight ) * 2 + 1;
        
		console.log(mouse);
        raycaster.setFromCamera( mouse, camera );
		raycaster.params.Points.threshold = 20;
        var intersects = raycaster.intersectObjects(scene.children, true);
 
        if(intersects.length==0)
		{
			console.log("No object.");
		}
		if(intersects.length > 0){
            console.log(intersects[0]);
            //var color = Math.random() * 0xffffff;
            //intersects[ 0 ].object.material.color.setHex( color );
        }
        renderer.render( scene, camera );
    }, false);*/

// })