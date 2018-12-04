"use strict";

var json;
var count = 0;
var pass = 0;
var running = true;
var i=0;
var heightArray = [];
var sdArray = [];
var timeout = 1000;
var width = 650
var height = width * 0.75;
var raycaster;
var scene, camera, light, renderer, pointCloud;
var sceneV, cameraV, lightV, rendererV,velocityCloud;
var sceneT, cameraT, lightT, rendererT;
var sprite = new THREE.TextureLoader().load( 'data/disc.png' );
var vectors = []
var cuboid, cubeWidth=1, cubeHeight=120, cubeLength=40, planeBackMovable = true, planeFrontMovable = true, xTranslateValue = 0;
var verticalCuboid, vCubeWidth=25, vCubeHeight=3, vCubeLength=25, planeUpMovable = true, planeDownMovable = true, yTranslateValue = 0;
var zCuboid, zCubeWidth=40, zCubeHeight=120, zCubeLength=3, planeOutMovable = true, planeBehindMovable = true, zTranslateValue = 0;
var planePoints=[], vPlanePoints=[], zPlanePoints=[];
var arrow;
var groupSolidA = new THREE.Group();
var groupSolidB = new THREE.Group();
var groupLiquid = new THREE.Group();
var hoveredObject = null, clickedObject = null;
var mouseVector = new THREE.Vector3();
readJSON();
readHeightData();
createInitialScene();
createTrajectoryScene();
createSolidCloud();
createLiquidCloud();
// createRectangle();
// createVelocityProfileScene();
createPlots();
createPlotl();

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
    console.log(json[1]['xPos'][0])
}


function createInitialScene() {
    var min=Number.MAX_SAFE_INTEGER;
    var max=-Number.MAX_SAFE_INTEGER
    for(var i=0;i<json.length;i++){
        if(json[i].label[0]==3){
            if(json[i].yPos[0] > max)
                max = json[i].yPos[0]
            if(json[i].yPos[0] < min)
                min = json[i].yPos[0]
        }
    }
    console.log("Minimum recorded", min)
    console.log("Maximum recorded", max)

    raycaster = new THREE.Raycaster();
    raycaster.params.Points.threshold = 10;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 90, width / height, 0.1, 3000 );
    camera.position.set(100,475,750);
    camera.lookAt(30,150,20);
	camera.fov *= 1;
	camera.zoom = 14;
	camera.updateProjectionMatrix();
	
    light = new THREE.DirectionalLight( 0xffffff, 1.5);
    light.position.set(0,2,20);
    light.lookAt(0,0,0);
    camera.add(light);
    scene.add(camera);

	renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( width, height );
    //renderer.setSize( window.innerWidth, window.innerHeight );
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

function createVelocityProfileScene() {
    sceneV = new THREE.Scene();
    cameraV = new THREE.PerspectiveCamera( 75, width / height, 0.1, 1000 );
    cameraV.position.set(30,175,150);
    cameraV.lookAt(-10,-20,0);
    camera.fov *= 1;
    camera.zoom = 14;
    camera.updateProjectionMatrix();

    lightV = new THREE.DirectionalLight( 0xffffff, 1.5);
    lightV.position.set(0,2,20);
    lightV.lookAt(0,0,0);
    cameraV.add(lightV);
    sceneV.add(cameraV);

    rendererV = new THREE.WebGLRenderer();

    rendererV.setSize( width, height );
    document.getElementById("velocity_profile").appendChild( rendererV.domElement );

    var myOptionsV = new THREE.OrbitControls(cameraV, rendererV.domElement);
    myOptionsV.enablePan = false;
    myOptionsV.update();
}


function createSolidCloud() {
    var gA = new THREE.BoxGeometry( 0.1, 0.1, 0.1 );
    var gB = new THREE.BoxGeometry( 0.1, 0.1, 0.1 );
    scene.add( groupSolidA );
    sceneT.add( groupSolidB );
    for(var i=0;i<json.length;i++) {
        if (json[i].label[0] == 3) {
            var mA = new THREE.MeshBasicMaterial();
            var mB = new THREE.MeshBasicMaterial();
            mA.color.setHex(0xFFFFFF)
            mB.color.setHex(0xFFFFFF)
            var meshA = new THREE.Mesh( gA, mA );
            meshA.position.set( json[i].xPos[0], json[i].yPos[0], json[i].zPos[0]);
            var meshB = new THREE.Mesh( gB, mB );
            meshB.position.set( json[i].xPos[0], json[i].yPos[0], json[i].zPos[0]);

            groupSolidA.add(meshA);
            groupSolidB.add(meshB);

            // var g = new THREE.Geometry();
            // g.vertices.push(new THREE.Vector3(json[i].xPos[0], json[i].yPos[0], json[i].zPos[0]));
            // g.colors.push(new THREE.Color())
            // // var m = new THREE.PointsMaterial( { size:100, sizeAttenuation: false, map: sprite,
            // //     alphaTest: 0.5, transparent: true, vertexColors: THREE.VertexColors } );
            // var m = new THREE.PointsMaterial({
            //     vertexColors: THREE.VertexColors,
            //     size: 10
            // });
            // groupSolidA.add(new THREE.Points( g, m ));
            // groupSolidB.add(new THREE.Points( g, m ));
        }
    }
    // var group3 = new THREE.Object3D();
    // group3.scale.set( 1, 2, 1 );
    // group3.position.set( - 5, 0, 0 );
    // group3.rotation.set( Math.PI / 2, 0, 0 );
    // groupSolidA.add( group3 );
    // var ss = new THREE.Sprite( new THREE.SpriteMaterial( { color: '#69f' } ) );
    // ss.position.set( 0, 2, 5 );
    // ss.scale.set( 10, 2, 3 );
    // // ss.center.set( - 0.1, 0 );
    // ss.material.rotation = Math.PI / 3;
    // groupSolidA.add( ss );


    // var g = new THREE.Geometry();
    // for(var i=0;i<json.length;i++) {
    //     if(json[i].label[0] == 3) {
    //         g.vertices.push(new THREE.Vector3(json[i].xPos[0], json[i].yPos[0], json[i].zPos[0]));
    //         g.colors.push(new THREE.Color())
    //     }
    // }
    // var m = new THREE.PointsMaterial( { size:7, sizeAttenuation: false, map: sprite,
    //     alphaTest: 0.5, transparent: true, vertexColors: THREE.VertexColors } );
    // // var solidCloud = new THREE.Points( g, m );
    // // solidCloud.name = 'solidCloud';
    // scene.add(new THREE.Points( g, m ));
    // sceneT.add(new THREE.Points( g, m ));
}
document.getElementById("scene").addEventListener( "mousemove", onDocumentMouseMove, false );

function onDocumentMouseMove( event ) {
    event.preventDefault();
    if ( hoveredObject ) {
        hoveredObject.material.color.set( '#69f' );
        // hoveredObject.geometry.colors[0].set( '#69f' );
        hoveredObject = null;
    }
    var intersects = getIntersects( event.layerX, event.layerY );
    if ( intersects.length > 0 ) {
        var res = intersects.filter( function ( res ) {
            return res && res.object;
        } )[ 0 ];
        if ( res && res.object ) {
            hoveredObject = res.object;
            // hoveredObject.geometry.colors[0].set( '#f00' );
            hoveredObject.material.color.set( '#f00' );
            console.log("Hovered on position ", hoveredObject.position.x, hoveredObject.position.y, hoveredObject.position.z)
        }
    }
}

function getIntersects( x, y ) {
    x = ( x / width ) * 2 - 1;
    y = - ( y / height ) * 2 + 1;
    mouseVector.set( x, y, 0.5 );
    raycaster.setFromCamera( mouseVector, camera );
    return raycaster.intersectObject( groupSolidA, true );
}

// window.addEventListener( "mousemove", onDocumentMouseMove, false );
// var intersected;
// function onDocumentMouseMove( event ) {
//     event.preventDefault();
//     mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
//     mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
//     raycaster.setFromCamera( mouse, camera );
//     var intersections = raycaster.intersectObjects( scene.children, true );
//     if ( intersections.length > 0 ) {
//         if ( intersected != intersections[ 0 ].object ) {
//             if ( intersected ) intersected.material.color.setHex( "#fff5f0" );
//             intersected = intersections[ 0 ].object;
//             intersected.material.color.setHex( "#3182bd" );
//         }
//         document.body.style.cursor = 'pointer';
//     } else if ( intersected ) {
//         intersected.material.color.setHex( "#ffea16" );
//         intersected = null;
//         document.body.style.cursor = 'auto';
//     }
// }


function createLiquidCloud() {


    scene.add(groupLiquid)
    var liquidGeometry = new THREE.SphereGeometry( 0.1, 32, 32 );
    for(var i=0;i<json.length;i++) {
        if(json[i].label[0] != 3){
            // vectors.push(new THREE.Vector3(json[i].xPos[0], json[i].yPos[0], json[i].zPos[0]));
            vectors.push(i);
            var liquidMaterial = new THREE.MeshBasicMaterial();
            liquidMaterial.color.setHex(0x3862AE)
            var liquidMesh = new THREE.Mesh( liquidGeometry, liquidMaterial );
            liquidMesh.shanks = i;
            liquidMesh.position.set( json[i].xPos[0], json[i].yPos[0], json[i].zPos[0]);
            // mesh.rotation.set( Math.random() * 2 * Math.PI, Math.random() * 2 * Math.PI, Math.random() * 2 * Math.PI );
            // mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * radius * 0.1 + radius * 0.05;
            groupLiquid.add(liquidMesh);
        }
    }


    // var g = new THREE.Geometry();
    // for(var i=0;i<json.length;i++) {
    //     if(json[i].label[0] != 3){
    //         // vectors.push(new THREE.Vector3(json[i].xPos[0], json[i].yPos[0], json[i].zPos[0]));
    //         vectors.push(i);
    //         g.vertices.push(new THREE.Vector3(json[i].xPos[0], json[i].yPos[0], json[i].zPos[0]));
    //         g.colors.push(new THREE.Color("rgb(49,130,189)"))
    //     }
    // }
    // // pointCloud = new THREE.Points(g, m);
    // var m = new THREE.PointsMaterial( { size: 3, sizeAttenuation: false, map: sprite,
    //     alphaTest: 0.5, transparent: true, vertexColors: THREE.VertexColors } );
    // // m.color.setHSL( 1.0, 0.3, 0.7 );
    // pointCloud = new THREE.Points( g, m );
    // pointCloud.name = 'liquidCloud';
    // scene.add(pointCloud);
}


function createTrajectory(){

}

render();
function render() {
    if(running == true) {
        setTimeout(function() {
            requestAnimationFrame(render);
        }, timeout);

        for (var i = 0; i < vectors.length; i++) {
            // console.log(groupLiquid[0])
            groupLiquid.children[i].position.x = json[vectors[i]].xPos[pass];
            groupLiquid.children[i].position.y = json[vectors[i]].yPos[pass];
            groupLiquid.children[i].position.z = json[vectors[i]].zPos[pass];
        }
        if(pointTrajectory) {
            pointTrajectory.geometry.vertices[0].x = json[10000].xPos[pass];
            pointTrajectory.geometry.vertices[0].y = json[10000].yPos[pass];
            pointTrajectory.geometry.vertices[0].z = json[10000].zPos[pass];
            pointTrajectory.geometry.verticesNeedUpdate = true;
        }
        pass++;
        renderer.render( scene, camera );
        rendererT.render( sceneT, cameraT );
        if (pass >= json[0].xPos.length)
            pass = 0;
        // pointCloud.geometry.verticesNeedUpdate = true;

    }
    else {
        requestAnimationFrame(render);
        renderer.render( scene, camera );
        rendererT.render( sceneT, cameraT );
    }
}


function onMouseDown(e) {
    e.preventDefault();
    if ( clickedObject )
        clickedObject = null;
    var intersects = getIntersects( event.layerX, event.layerY );
    if ( intersects.length > 0 ) {
        var res = intersects.filter( function ( res ) {
            return res && res.object;
        } )[ 0 ];
        if ( res && res.object ) {
            clickedObject = res.object;
            console.log("Particle Clicked ", clickedObject.position.x, clickedObject.position.y, clickedObject.position.z)
            if(sceneT.getObjectByName('pointTrajectory')) {
                var selectedObject = sceneT.getObjectByName('pointTrajectory');
                sceneT.remove(selectedObject);
            }

            var gT = new THREE.SphereGeometry( 0.1, 32, 32 );
            var mT = new THREE.MeshBasicMaterial();
            mT.color.setHex(0x3862AE)
            var meshT = new THREE.Mesh( gT, mT );
            meshT.shanks = clickedObject.shanks;
            meshT.position.set( json[clickedObject.shanks].xPos[0], json[clickedObject.shanks].yPos[0], json[clickedObject.shanks].zPos[0]);
            sceneT.add(pointTrajectory);
            createTrajectory(pointTrajectory);
        }
    }
    else
        console.log('NO Particle Clicked');
}


function onArrowKeyDown(event) {
    var keyCode = event.which;
    if (keyCode == 49) {
        running = true;
    }
    else  if (keyCode == 50) {
        running = false;
    }
    if (keyCode == 38) {
        timeout -= 50;
    }
    if (keyCode == 40) {
        timeout += 50;
    }

    if (keyCode==65 && planeBackMovable && !running){
        planeFrontMovable = true;
        cuboid.translateX(-0.1);
        xTranslateValue -= 0.1;
        if(-xTranslateValue > 10)
            planeBackMovable = false;
        for (i = 0; i < json.length; i++)
        {
            if(Math.abs(json[i]['xPos'][pass]-xTranslateValue)<0.09 && json[i]['label'][0]!=3)
            {
                if (json[i]['yPos'][pass]>-59 && json[i]['yPos'][pass]<45)
                {
                    planePoints.push(json[i]);
                }

            }

        }
        velocityPoints(planePoints);
        //console.log(cuboid.position.z);
        //console.log(planePoints.length);
        planePoints=[];

    }
    else if (keyCode==68 && planeFrontMovable && !running){
        planeBackMovable = true;
        cuboid.translateX(0.1);
        xTranslateValue += 0.1;
        if(xTranslateValue > 18)
            planeFrontMovable = false;
        for (i = 0; i < json.length; i++)
        {
            if(Math.abs(json[i]['xPos'][pass]-xTranslateValue)<0.09 && json[i]['label'][0]!=3)
            {
                if (json[i]['yPos'][pass]>-59 && json[i]['yPos'][pass]<45)
                {
                    planePoints.push(json[i]);
                }
            }

        }
        velocityPoints(planePoints);
        //console.log(cuboid.position.z);
        //console.log(planePoints.length);
        planePoints=[];

    }

   else if (keyCode==83 && planeUpMovable && !running){
        planeDownMovable = true;
        verticalCuboid.translateY(-0.1);
        yTranslateValue -= 0.1;
        if(-yTranslateValue > 70)
            planeUpMovable = false;
        for (i = 0; i < json.length; i++)
        {
            if(Math.abs(json[i]['yPos'][pass]-yTranslateValue)<0.09 && json[i]['label'][0]!=3)
            {
                vPlanePoints.push(json[i]);
            }

        }
        velocityPoints(vPlanePoints);
        //vSidePlot(vPlanePoints);
        //console.log(cuboid.position.z);
        console.log(vPlanePoints.length);
        vPlanePoints=[];

    }
    else if (keyCode==87 && planeDownMovable && !running){
        planeUpMovable = true;
        verticalCuboid.translateY(0.1);
        yTranslateValue += 0.1;
        if(yTranslateValue > 100)
            planeDownMovable = false;
        for (i = 0; i < json.length; i++)
        {
            if(Math.abs(json[i]['yPos'][pass]-yTranslateValue)<0.09 && json[i]['label'][0]!=3)
            {
                vPlanePoints.push(json[i]);
            }

        }
        //vSidePlot(vPlanePoints);
        velocityPoints(vPlanePoints);
        //console.log(cuboid.position.z);
        console.log(vPlanePoints.length);
        vPlanePoints=[];

    }

    else if (keyCode==69 && planeOutMovable && !running){
        planeOutMovable = true;
        zCuboid.translateZ(-0.1);
        zTranslateValue -= 0.1;
        if(-zTranslateValue > 10)
            planeBehindMovable = false;
        for (i = 0; i < json.length; i++)
        {
            if(Math.abs(json[i]['zPos'][pass]-zTranslateValue)<0.09 && json[i]['label'][0]!=3)
            {
                if (json[i]['yPos'][pass]>-59 && json[i]['yPos'][pass]<45)
                {
                    zPlanePoints.push(json[i]);
                }

            }

        }
        velocityPoints(zPlanePoints);
        //console.log(cuboid.position.z);
        //console.log(planePoints.length);
        zPlanePoints=[];

    }
    else if (keyCode==90 && planeBehindMovable && !running){
        planeBehindMovable = true;
        zCuboid.translateZ(0.1);
        zTranslateValue += 0.1;
        if(zTranslateValue > 18)
            planeOutMovable = false;
        for (i = 0; i < json.length; i++)
        {
            if(Math.abs(json[i]['zPos'][pass]-zTranslateValue)<0.09 && json[i]['label'][0]!=3)
            {
                if (json[i]['yPos'][pass]>-59 && json[i]['yPos'][pass]<45)
                {
                    zPlanePoints.push(json[i]);
                }
            }

        }
        velocityPoints(zPlanePoints);
        //console.log(cuboid.position.z);
        //console.log(planePoints.length);
        zPlanePoints=[];

    }
};


function createRectangle() {

    var geometry = new THREE.BoxGeometry(cubeWidth,cubeHeight,cubeLength);
    var material = new THREE.MeshBasicMaterial( {color: "#ffcccc", opacity: 0.75, transparent:true} );
    cuboid = new THREE.Mesh( geometry, material );
    cuboid.position.y = -8;
    scene.add( cuboid );

    var geometry = new THREE.BoxGeometry(vCubeWidth,vCubeHeight,vCubeLength);
    var material = new THREE.MeshBasicMaterial( {color: "#ffcccc", opacity: 0.75, transparent:true} );
    verticalCuboid = new THREE.Mesh( geometry, material );
    scene.add( verticalCuboid );

    var geometry = new THREE.BoxGeometry(zCubeWidth,zCubeHeight,zCubeLength);
    var material = new THREE.MeshBasicMaterial( {color: "#ffcccc", opacity: 0.75, transparent:true} );
    zCuboid = new THREE.Mesh( geometry, material );
    scene.add( zCuboid );

};


function velocityPoints(planePoints){
    sceneT.remove(velocityCloud);
    sceneT.remove(arrow);
    console.log("Inside func");
    //console.log(planePoints.length);
    var g = new THREE.Geometry();
    for(var i=0;i<planePoints.length;i++) {
        if(pass<90) {
            g.vertices.push(new THREE.Vector3(planePoints[i].xPos[pass], planePoints[i].yPos[pass], planePoints[i].zPos[pass]));
            g.colors.push(new THREE.Color("rgb(49,130,189)"));
            var origin = new THREE.Vector3(planePoints[i].xPos[pass], planePoints[i].yPos[pass], planePoints[i].zPos[pass]);
            var terminus = new THREE.Vector3((planePoints[i].xPos[pass + 1], planePoints[i].yPos[pass + 1], planePoints[i].zPos[pass + 1]));
            var direction = new THREE.Vector3().subVectors(terminus, origin).normalize();
            arrow = new THREE.ArrowHelper(direction, origin, 20, 0x884400);
            sceneT.add(arrow);
        }
    }
    var m = new THREE.PointsMaterial( { size:7, sizeAttenuation: false, map: sprite,
        alphaTest: 0.5, transparent: true, vertexColors: THREE.VertexColors } );
    // var solidCloud = new THREE.Points( g, m );
    // solidCloud.name = 'solidCloud';
    velocityCloud = new THREE.Points( g, m );
    velocityCloud.name = 'velocityCloud';
    sceneT.add(velocityCloud);

};



function readHeightData(){
	for(var j = 0; j< 90; j++)
	{
		var heightInstArray = [];
		for(var i = 0; i<json.length; i++)
		{
			if(json[i]['label'][0]!=3)
				heightInstArray.push(json[i]['yPos'][j]+160);	
		}
		heightInstArray.sort(function(a, b){return b - a});
		var intermediate = heightInstArray.slice(0,50);
		heightArray.push(intermediate);
	}
	for(var j = 0; j< 90; j++)
	{
		const arrAvg = arr => arr.reduce((a,b) => a + b, 0) / arr.length;
		var avg = arrAvg(heightArray[j]);
		var sum = 0;
		for(var i=0;i<50;i++)
		{
			sum += Math.pow((heightArray[j][i]-avg),2);
		}
		var sumAvg = sum/50;
		var sd = Math.sqrt(sumAvg);
		sdArray.push(sd);
	}
};

function createPlots() {

    var start = 0,
      end = 1.8,
      numSpirals = 3,
      margin = {top:50, bottom:50, left:50, right:50};

    var theta = function(r) {
      return numSpirals * Math.PI * r;
    };

    // used to assign nodes color by group
    var color = ['#0a2929', '#1f7a7a', '#47d1d1', '#c2f0f0'];

    var r = d3.min([width, height]) / 2 - 40;

    var radius = d3.scaleLinear()
      .domain([start, end])
      .range([40, r]);

    var svg = d3.select("body").select("#plots_scene").append("svg")
      .attr("width", width+70)
      .attr("height", height+25)
	  .style("background", "white")
	  .style("border-style", "solid")
	  .style("border-color", "white")
      .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var points = d3.range(start, end + 0.001, (end - start) / 1000);

    var spiral = d3.radialLine()
      .curve(d3.curveCardinal)
      .angle(theta)
      .radius(radius);

    var path = svg.append("path")
      .datum(points)
      .attr("id", "spiral")
      .attr("d", spiral)
      .style("fill", "none")
      .style("stroke", "steelblue");

    var spiralLength = path.node().getTotalLength(),
        N = 90,
        barWidth = (spiralLength / 225) - 1;
    var someData = [];
    for (var i = 0; i < N; i++) {
      var v = sdArray[i];
      someData.push({
        timeIndex: i+1,
		value: sdArray[i],
        group: (v<0.12)?1:((v<0.28)?2:((v<0.38)?3:4))
      });
    }
	  
	var timeScale = d3.scaleLinear()
      .domain(d3.extent(someData, function(d){
        return d.timeIndex;
      }))
      .range([0, spiralLength]);
    
    // yScale for the bar height
    var yScale = d3.scaleLinear()
      .domain([0, d3.max(someData, function(d){
        return d.value;
      })])
      .range([0, (r / numSpirals) - 30]);

    svg.selectAll("rect")
      .data(someData)
      .enter()
      .append("rect")
      .attr("x", function(d,i){
        
        var //linePer = timeScale(d.date),
            linePer = timeScale(d.timeIndex),
			posOnLine = path.node().getPointAtLength(linePer),
            angleOnLine = path.node().getPointAtLength(linePer - barWidth);
      
        d.linePer = linePer; // % distance are on the spiral
        d.x = posOnLine.x; // x postion on the spiral
        d.y = posOnLine.y; // y position on the spiral
        
        d.a = (Math.atan2(angleOnLine.y, angleOnLine.x) * 180 / Math.PI) - 90; //angle at the spiral position

        return d.x;
      })
      .attr("y", function(d){
        return d.y;
      })
      .attr("width", function(d){
        return barWidth;
      })
      .attr("height", function(d){
        return yScale(d.value);
      })
      .style("fill", function(d){return color[d.group-1];})
      .style("stroke", "none")
      .attr("transform", function(d){
        return "rotate(" + d.a + "," + d.x  + "," + d.y + ")"; // rotate the bar
      });
    
    // add date labels
    /*var tF = d3.timeFormat("%b %Y"),
        firstInMonth = {};

    svg.selectAll("text")
      .data(someData)
      .enter()
      .append("text")
      .attr("dy", 10)
      .style("text-anchor", "start")
      .style("font", "10px arial")
      .append("textPath")
      // only add for the first of each month
      .filter(function(d){
        var sd = tF(d.date);
        if (!firstInMonth[sd]){
          firstInMonth[sd] = 1;
          return true;
        }
        return false;
      })
      .text(function(d){
        return tF(d.date);
      })
      // place text along spiral
      .attr("xlink:href", "#spiral")
      .style("fill", "grey")
      .attr("startOffset", function(d){
        return ((d.linePer / spiralLength) * 100) + "%";
      })*/


    var tooltip = d3.select("#plots_scene")
    .append('div')
    .attr('class', 'tooltip');

    tooltip.append('div')
    .attr('class', 'timeIndex');
    tooltip.append('div')
    .attr('class', 'value');

    svg.selectAll("rect")
    .on('mouseover', function(d) {

        tooltip.select('.timeIndex').html("Time Instance: <b>" + d.timeIndex + " sec.</b>");
        tooltip.select('.value').html("Standard Deviation: <b>" + d.value + "<b>");

        d3.select(this)
        .style("fill","#FFFFFF")
        .style("stroke","#000000")
        .style("stroke-width","2px");

        tooltip.style('display', 'block');
        tooltip.style('opacity',2);

    })
    .on('mousemove', function(d) {
        tooltip.style('top', (d3.event.layerY + 10) + 'px')
        .style('left', (d3.event.layerX - 25) + 'px');
    })
    .on('mouseout', function(d) {
        d3.selectAll("rect")
        .style("fill", function(d){return color[d.group-1];})
        .style("stroke", "none")

        tooltip.style('display', 'none');
        tooltip.style('opacity',0);
    });
};

function createPlotl(){
	
	//Use the margin convention practice 
	var margin = {top: 100, right: 100, bottom: 100, left: 100}, 
		width1 = width - margin.left - margin.right,  
		height1 = height - margin.top - margin.bottom; 

	// The number of datapoints
	var n = 90;

	var someData = [];
    for (var i = 0; i < n; i++) {
      var v = sdArray[i];
      someData.push({
        timeIndex: i+1,
		value: sdArray[i],
        group: (v<0.12)?1:((v<0.28)?2:((v<0.38)?3:4))
      });
    }
	
	// X scale will use the index of our data
	var xScale = d3.scaleLinear()
		.domain([0, n-1]) 
		.range([0, width1]); 

	// Y scale will use the height values 
	var yScale = d3.scaleLinear()
		.domain([0, d3.max(someData, function(d){
		return d.value;
		})])  
		.range([height1, 0]);  

	// d3's line generator
	var line = d3.line()
		.x(function(d, i) { return xScale(i); }) 
		.y(function(d) { return yScale(d.value); })  
		.curve(d3.curveMonotoneX) 

	// An array of objects of length N. Each object has key -> value pair, the key being "y" and the value is a random number
	//var dataset = d3.range(n).map(function(d) { return {"y": d3.randomUniform(1)() } })

	// 1. Add the SVG to the page and employ #2
	var svg = d3.select("#plotl_scene").append("svg")
		.attr("width", width1 + margin.left + margin.right)
		.attr("height", height1 + margin.top + margin.bottom)
		.style("background", "white")
		.style("border-style", "solid")
		.style("border-color", "white")
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	// 3. Call the x axis in a group tag
	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height1 + ")")
		.call(d3.axisBottom(xScale)); // Create an axis component with d3.axisBottom

	// 4. Call the y axis in a group tag
	svg.append("g")
		.attr("class", "y axis")
		.call(d3.axisLeft(yScale)); // Create an axis component with d3.axisLeft

	// 9. Append the path, bind the data, and call the line generator 
	svg.append("path")
		.datum(someData) // 10. Binds data to the line 
		.attr("class", "line") // Assign a class for styling 
		.attr("d", line); // 11. Calls the line generator 

	// 12. Appends a circle for each datapoint 
	svg.selectAll(".dot")
		.data(someData)
	  .enter().append("circle") // Uses the enter().append() method
		.attr("class", "dot") // Assign a class for styling
		.attr("cx", function(d, i) { return xScale(i) })
		.attr("cy", function(d) { return yScale(d.value) })
		.attr("r", 3);
		
	var tooltip = d3.select("#plotl_scene")
    .append('div')
    .attr('class', 'tooltip');

    tooltip.append('div')
    .attr('class', 'timeIndex');
    tooltip.append('div')
    .attr('class', 'value');
	
	svg.selectAll(".dot")
    .on('mouseover', function(d) {
        tooltip.select('.timeIndex').html("Time Instance: <b>" + d.timeIndex + " sec.</b>");
        tooltip.select('.value').html("Standard Deviation: <b>" + d.value + "<b>");
        tooltip.style('display', 'block');
        tooltip.style('opacity',2);
		
		d3.select(this)
        .style("fill","#000000")
        .style("stroke","#000000")
        .style("stroke-width","0.3px");
    })
    .on('mousemove', function(d) {
        tooltip.style('top', (d3.event.layerY + 10) + 'px')
        .style('left', (d3.event.layerX - 25) + 'px');
    })
    .on('mouseout', function(d) {
		d3.selectAll(".dot")
        .style("fill", '#fff')
        .style("stroke", "#000")
		.style("stroke-width","0.3px");
		
        tooltip.style('display', 'none');
        tooltip.style('opacity',0);
    });
};

function createPlotb(){

};