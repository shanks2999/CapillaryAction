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
var sceneV, cameraV, lightV, rendererV;
var sceneT, cameraT, lightT, rendererT, pointTrajectory;
var sprite = new THREE.TextureLoader().load( 'data/disc.png' );
var vectors = []
var cuboid, cubeWidth=3, cubeHeight=200, cubeLength=80, planeBackMovable = true, planeFrontMovable = true, xTranslateValue = 0;

readJSON();
createInitialScene();
createTrajectoryScene();
createSolidCloud();
createLiquidCloud();
createRectangle();
createVelocityProfile();

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
    myOptionsT.enablePan = false;
    myOptionsT.update();
}

function createVelocityProfile() {
    sceneV = new THREE.Scene();
    cameraV = new THREE.PerspectiveCamera( 75, width / height, 0.1, 1000 );
    cameraV.position.set(30,175,150);
    cameraV.lookAt(-10,-20,0);

    lightV = new THREE.DirectionalLight( 0xffffff, 1.5);
    lightV.position.set(0,2,20);
    lightV.lookAt(0,0,0);
    cameraV.add(lightV);
    sceneV.add(cameraV);

    rendererV = new THREE.WebGLRenderer();

    rendererV.setSize( width, height );
    document.getElementById("velocity_profile").appendChild( rendererV.domElement );

    var myOptionsV = new THREE.OrbitControls(cameraV, rendererV.domElement);
    myOptionsV.update();
}


function createSolidCloud() {
    var g = new THREE.Geometry();
    for(var i=0;i<json.length;i++) {
        if(json[i].label[0] == 3) {
            g.vertices.push(new THREE.Vector3(json[i].xPos[0], json[i].yPos[0], json[i].zPos[0]));
            g.colors.push(new THREE.Color("rgb(255,255,255)"))
        }
    }
    var m = new THREE.PointsMaterial( { size: 7, sizeAttenuation: false, map: sprite,
        alphaTest: 0.5, transparent: true, vertexColors: THREE.VertexColors } );
    // var solidCloud = new THREE.Points( g, m );
    // solidCloud.name = 'solidCloud';
    scene.add(new THREE.Points( g, m ));
    sceneT.add(new THREE.Points( g, m ));
}


function createLiquidCloud() {
    var g = new THREE.Geometry();
    for(var i=0;i<json.length;i++) {
        if(json[i].label[0] != 3){
            // vectors.push(new THREE.Vector3(json[i].xPos[0], json[i].yPos[0], json[i].zPos[0]));
            vectors.push(i);
            g.vertices.push(new THREE.Vector3(json[i].xPos[0], json[i].yPos[0], json[i].zPos[0]));
            g.colors.push(new THREE.Color("rgb(49,130,189)"))
        }
    }
    // pointCloud = new THREE.Points(g, m);
    var m = new THREE.PointsMaterial( { size: 7, sizeAttenuation: false, map: sprite,
        alphaTest: 0.5, transparent: true, vertexColors: THREE.VertexColors } );
    // m.color.setHSL( 1.0, 0.3, 0.7 );
    pointCloud = new THREE.Points( g, m );
    pointCloud.name = 'liquidCloud';
    scene.add(pointCloud);
}


function createTrajectory(){
    renderT();
    function renderT() {
        if(sceneT.getObjectByName('pointTrajectory')) {
            var selectedObject = sceneT.getObjectByName('pointTrajectory');
            sceneT.remove(selectedObject);
        }
        // sceneT.remove(pointTrajectory);
        var gT = new THREE.Geometry();
        var vectorsT = [];
        var mT = new THREE.PointsMaterial( { size: 20, sizeAttenuation: false, map: sprite,
            alphaTest: 0.5, transparent: true, vertexColors: THREE.VertexColors } );
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


render();
function render() {
    if(running == true) {
        setTimeout(function() {
            requestAnimationFrame(render);
        }, 1000);
        pass++;
    	for (var i = 0; i < vectors.length; i++) {
            pointCloud.geometry.vertices[i].x = json[vectors[i]].xPos[pass];
            pointCloud.geometry.vertices[i].y = json[vectors[i]].yPos[pass];
            pointCloud.geometry.vertices[i].z = json[vectors[i]].zPos[pass];
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