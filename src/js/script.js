"use strict";

d3.json("data/data.json", function(json) {
    console.log("Reading JSON")
    // console.log(json[0])
    // console.log(json[0].xPos)
    var count = 0;
    var pass = 0;
	var pass1 = 0;
    var running = true;
	var running1 = false;
    //console.log(count + "Records processed");

    var width = 650
    var height = width * 0.75;
    var scene = new THREE.Scene();
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
	
	var scene1 = new THREE.Scene();
    var camera1 = new THREE.PerspectiveCamera( 75, width / height, 0.1, 1000 );	
	camera1.position.set(30,175,150);
    camera1.lookAt(-10,-20,0);
	
	var light1 = new THREE.DirectionalLight( 0xffffff, 1.5);
    light1.position.set(0,2,20);
    light1.lookAt(0,0,0);
    camera1.add(light1);
    scene1.add(camera1);
	
	var renderer1 = new THREE.WebGLRenderer();
    
	renderer1.setSize( width, height );
    document.getElementById("trajectory_scene").appendChild( renderer1.domElement );
	
	var myOptions1 = new THREE.OrbitControls(camera1, renderer1.domElement);
    myOptions1.update();
	
	//<--------------Plotting the 3D molecules in space----------------------------------------------------------------------------------------------------------------------->
    var vectors = []
    var m = new THREE.PointsMaterial({
        vertexColors: THREE.VertexColors,
        size: 0.2
    });
	
    var g = new THREE.Geometry();
    var pointCloud = THREE.Points();
    
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

    //var abc = pointCloud.geometry;

    var myOptions = new THREE.OrbitControls(camera, renderer.domElement);
    myOptions.enablePan = false;
    myOptions.update();
    
	//const domEvents = new THREEx.DomEvents(camera, render.domElement);
	/*domEvents.addEventListener(pointCloud, 'click', event=>{
		console.log("true");
	});*/
	
    document.addEventListener("keydown", onArrowKeyDown, false);
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
            running1 = true;
        }
        else  if (keyCode == 13) {
            running1 = false;
        }
    };
    render();
    function render() {
        console.log("in1");
		scene1.remove(pointTrajectory);
		g1 = new THREE.Geometry();
		vectors1 = [];
        m1 = new THREE.PointsMaterial({
        vertexColors: THREE.VertexColors,
        size: 3
		});
		if(running == true) {
            setTimeout(function() {
                requestAnimationFrame(render);
            }, 1000);
            pass++;
            pass1++;
			for (var i = 0; i < json.length; i++) {
                pointCloud.geometry.vertices[i].x = json[i].xPos[pass];
                pointCloud.geometry.vertices[i].y = json[i].yPos[pass];
                pointCloud.geometry.vertices[i].z = json[i].zPos[pass];
            }
			for (var i = 0; i < pass1; i++) {
				g1.vertices.push(new THREE.Vector3(json[10000].xPos[0], json[10000].yPos[0], json[10000].zPos[0]));
				vectors1.push(new THREE.Vector3(json[10000].xPos[0], json[10000].yPos[0], json[10000].zPos[0]));
				g1.vertices[i].x = json[10000].xPos[pass1];
                g1.vertices[i].y = json[10000].yPos[pass1];
                g1.vertices[i].z = json[10000].zPos[pass1];
				g1.colors.push(new THREE.Color("rgb(227,74,51)"));
            }
			pointTrajectory = new THREE.Points(g1, m1);
			pointTrajectory.name = 'pointTrajectory';
			scene1.add(pointTrajectory);
			
			renderer.render( scene, camera );
			renderer1.render( scene1, camera1 );
            if (pass >= json[0].xPos.length)
                pass = 0;
			if (pass1 >= 90)
                pass1 = 0;
            pointCloud.geometry.verticesNeedUpdate = true;
			pointTrajectory.geometry.verticesNeedUpdate = true;
        }
        else {
			
            //requestAnimationFrame(render);
            //renderer.render( scene, camera );
			//renderer1.render( scene1, camera1 );
        }
	}
		
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

	
	//<--------------Plotting the single molecular trajectory----------------------------------------------------------------------------------------------------------------------->
    var vectors1 = []
    var m1 = new THREE.PointsMaterial({
        vertexColors: THREE.VertexColors,
        size: 0.3
    });
	
    var g1 = new THREE.Geometry();
    var pointTrajectory;
    var solidParticlesScene2;
	
	for(var i=0;i<json.length;i++) {
        if(json[i].label[0] == 3)
		{
			g1.vertices.push(new THREE.Vector3(json[i].xPos[0], json[i].yPos[0], json[i].zPos[0]));
			vectors1.push(new THREE.Vector3(json[i].xPos[0], json[i].yPos[0], json[i].zPos[0]));
            g1.colors.push(new THREE.Color("rgb(189,189,189)"));
		}
	}
    solidParticlesScene2 = new THREE.Points(g1, m1);
    solidParticlesScene2.name = 'solidParticlesForScene2';
    scene1.add(solidParticlesScene2);
	
	renderer1.render( scene1, camera1 );
})