// Scene variables
var scene, camera, fieldOfView, aspectRatio, nearPlane, farPlane, HEIGHT, WIDTH, renderer, container, controls;

// Light variables
var directionalLight, pointLight, hemisphereLight, ambientLight;

//dat-gui
var gui = new dat.GUI();

window.addEventListener('load', init, false);

function init(event) {
    createScene();
    createHelpers();
    createBlob();
    createLights();

    createDatGui();
    // document.addEventListener('mousemove', onMouseMove, false);
    loop();
}

function createScene() {
    HEIGHT = window.innerHeight;
    WIDTH = window.innerWidth;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xeeeeee);

    aspectRatio = WIDTH/HEIGHT;
    fieldOfView = 45;
    nearPlane = 1;
    farPlane = 10000;

    camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane);
    camera.position.set(12,10,25);

    renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
    renderer.setSize(WIDTH,HEIGHT);
    renderer.shadowMap.enabled = true;

    container = document.querySelector('#container');
    container.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera);

    document.addEventListener('keydown', keyDownHandler, false);
    document.addEventListener('keyup', keyUpHandler, false);

    window.addEventListener('resize', onWindowResize, false);
}

var wPressed, aPressed, sPressed, dPressed, spacePressed;

var walking, jumping;

function keyDownHandler(e) {
    // console.log(e.keyCode);
    if(e.keyCode == 87) {
        wPressed = true;
    }
    if(e.keyCode == 65) {
        aPressed = true;
    }
    if(e.keyCode == 83) {
        sPressed = true;
    }
    if(e.keyCode == 68) {
        dPressed = true;
    }
    if(e.keyCode == 32) {
        spacePressed = true;
        if(!jumping){
            jumpAnimation();
        }        
    }
}

function keyUpHandler(e) {
    // console.log(e.keyCode);
    if(e.keyCode == 87) {
        wPressed = false;
        walking = false;
    }
    if(e.keyCode == 65) {
        aPressed = false;
        walking = false;
    }
    if(e.keyCode == 83) {
        sPressed = false;
        walking = false;
    }
    if(e.keyCode == 68) {
        dPressed = false;
        walking = false;
    }
    if(e.keyCode == 32) {
        spacePressed = false;
        walking = false;
        // jumping = false;
    }
}

function createHelpers() {
    var size = 100;
    var divisions = 100;

    var gridHelper = new THREE.GridHelper( size, divisions );
    scene.add( gridHelper );

    var axisHelper = new THREE.AxisHelper( size/2 );
    scene.add( axisHelper );
}

function createDatGui() {
    var f1 = gui.addFolder('Position');
	f1.add(camera.position, 'x',-50,50).listen();
	f1.add(camera.position, 'y',-50,50).listen();
	f1.add(camera.position, 'z',-50,50).listen();
}

var charObject, leftLeg, rightLeg, Legs;

var ui = {walkFactor:100,
        walkSpeed:1};

function createBlob() {
    charObject = new THREE.Object3D();

    var legGeometry = new THREE.CylinderGeometry(0.5,0.4,3,32);
    legGeometry.translate(0,-1.5,0);
    var material = new THREE.MeshLambertMaterial({color:0xffdd00});

    var leftLegMesh = new THREE.Mesh(legGeometry, material);
    leftLeg = new THREE.Object3D();
    leftLeg.position.y = 3;
    leftLeg.position.z = 0;


    rightLeg = leftLeg.clone();

    leftLeg.rotation.y = 0.1;

    rightLeg.position.y = 3;
    rightLeg.position.z = 0;
    rightLeg.rotation.y = -0.1;

    var foot = new THREE.Mesh(new THREE.BoxGeometry(1,0.7,1.5), material);
    foot.position.y = -2.7;
    foot.position.z = 0.3;

    rightLeg.position.x = -0.8;
    rightLeg.add(foot.clone());
    rightLeg.add(leftLegMesh.clone());

    leftLeg.position.x = 0.8;
    leftLeg.add(foot);
    leftLeg.add(leftLegMesh);

    Legs = new THREE.Object3D();

    Legs.add(leftLeg);
    Legs.add(rightLeg);

    charObject.add(Legs);



    var f1 = gui.addFolder('Right Leg Rotation');
	f1.add(rightLeg.rotation, 'x',-180*Math.PI/180,180*Math.PI/180).listen();
	f1.add(rightLeg.rotation, 'y',-180*Math.PI/180,180*Math.PI/180);
	f1.add(rightLeg.rotation, 'z',-180*Math.PI/180,180*Math.PI/180);

	var f2 = gui.addFolder('Left Leg Rotation');
	f2.add(leftLeg.rotation, 'x',-180*Math.PI/180,180*Math.PI/180).listen();
	f2.add(leftLeg.rotation, 'y',-180*Math.PI/180,180*Math.PI/180);
	f2.add(leftLeg.rotation, 'z',-180*Math.PI/180,180*Math.PI/180);

    gui.add(ui,'walkFactor',50,1000);
    gui.add(ui,'walkSpeed',1,5);


    var torsoGeometry = new THREE.BoxGeometry(3,3,3);
    var torsoMesh = new THREE.Mesh(torsoGeometry, material);
    torsoMesh.position.set(0,4,0);

    charObject.add(torsoMesh);

    scene.add(charObject);
}

function createLights() {
    directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
    directionalLight.position.set(150,350,350);
    directionalLight.castShadow = true;

    ambientLight = new THREE.AmbientLight(0xdc8874, .5);

    scene.add(directionalLight);
    scene.add(ambientLight);
}

function onWindowResize() {
	HEIGHT = window.innerHeight;
    WIDTH = window.innerWidth;
	camera.aspect = window.innerWidth/window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
}

function startWalking() {
    rightLeg.rotation.x = Math.cos((Date.now()/ui.walkFactor) + 90*Math.PI/180);
    leftLeg.rotation.x = Math.sin(Date.now()/ui.walkFactor);
}

function stopWalking() {
    rightLeg.rotation.x = 0;
    leftLeg.rotation.x = 0;
}

function jumpAnimation() {
    if(!jumping) {
        jumping = true;
    }
    if(jumping) {
        var tl = new TimelineMax();
        tl.to(charObject.position,0.4,{y:4, ease: Power1.easeOut})
          .to(charObject.position,0.4,{y:0, ease: Power1.easeIn})
          .call(stopJump)
          .play();
    }
}

function stopJump() {
    jumping = false;
}

function loop(){
    if(wPressed) {
        charObject.translateZ(ui.walkSpeed*0.1);
    }
    if(sPressed) {
        charObject.translateZ(ui.walkSpeed*-0.1);
    }
    if(aPressed) {
        charObject.rotateY(3*Math.PI/180);
    }
    if(dPressed) {
        charObject.rotateY(-3*Math.PI/180);
    }

    if(wPressed || sPressed || aPressed || dPressed) {
        walking = true;
    }

    if(walking) {
        startWalking();
    } else {
        stopWalking();
    }

    controls.update();
    renderer.render(scene, camera);

    requestAnimationFrame(loop);
}
