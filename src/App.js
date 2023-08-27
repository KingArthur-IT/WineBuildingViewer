import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

var canvas, canvasWrapper, renderer, scene, camera, sceneObj,
sceneSize = {
    width: 0,
    height: 0
},
mouseData = {
    x: 0
},
settings = {
    moveStep: {
        x: 0.05,
        y: 0.01
    },
    maxXRotate: 14.0 * Math.PI / 180.0, //up-down
    minXRotate: -1.0 * Math.PI / 180.0,
    aspectRatio: 2,
    camera: {
        deep: 10000,
        posX: 0,
        posY: -160,
        posZ: 1450
    }
}

class App {
    init() {
        canvas = document.getElementById('main3DCanvas');
        canvasWrapper = document.getElementById('canvasWrapper')
        sceneSize.width = canvasWrapper.getBoundingClientRect().width
        sceneSize.height =  sceneSize.width / settings.aspectRatio

        canvas.width = sceneSize.width;
        canvas.height = sceneSize.height;

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera( 45, sceneSize.width / sceneSize.height, 0.1, settings.camera.deep );
        camera.position.x = settings.camera.posX;
        camera.position.y = settings.camera.posY;
        camera.position.z = settings.camera.posZ;
        scene.add(camera)

        //lights
        const light = new THREE.AmbientLight(0xffffff, 0.75);
        light.position.set(0, 0, 0);
        scene.add(light);

        const light2 = new THREE.PointLight(0xffffff, 1.0);
        light2.position.set(0, 10000, 0);
        light2.castShadow = true;
        scene.add(light2);

        renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: 'high-performance', preserveDrawingBuffer: true, premultipliedAlpha: true });
        renderer.setClearColor( 0x000000, 0 );
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( sceneSize.width, sceneSize.height );


        sceneObj = new THREE.Object3D();
        let gltfLoader = new GLTFLoader();
        gltfLoader.setPath('./assets/');
        gltfLoader.load(
            'winery.gltf',
            (object) => {
                object.name = 'winery';
                sceneObj.add(object.scene)
            }, (xhr) => {
                console.log(`loaded: ${Math.floor(100.0 * xhr.loaded / xhr.total)}%`);
            },
        )
        sceneObj.scale.set(1500, 1500, 1500);
        scene.add(sceneObj);

        canvas.addEventListener('mousemove', mouseMoveHandler)
        document.addEventListener('scroll', scrollEventHandler)  

        window.addEventListener('resize', onCanvasResize)

        animate()
    }
}

function mouseMoveHandler(e) {    
    const deltaY = Math.sign(e.y - mouseData.y) * settings.moveStep.y
    mouseData.y = e.y
    if (sceneObj.rotation.x + deltaY < settings.maxXRotate && sceneObj.rotation.x + deltaY > settings.minXRotate)
        sceneObj.rotation.x += deltaY
}

var deltaX = 0,
    currentDeltaX = 0

function scrollEventHandler(e) {
    // console.log(e);
    if (!canvasWrapper) return
    if (isElementInViewport(canvasWrapper)) {
        deltaX = calculateElementScrollVal(canvasWrapper)
      }
}

function onCanvasResize() {
    const canvasWrapper = document.getElementById('canvasWrapper')
    sceneSize.width = canvasWrapper.getBoundingClientRect().width
    sceneSize.height = sceneSize.width / settings.aspectRatio
    
    canvas.width = sceneSize.width;
    canvas.height = sceneSize.height;
    
    camera = new THREE.PerspectiveCamera( 50, sceneSize.width / sceneSize.height, 0.1, settings.camera.deep );
    camera.position.y = settings.camera.posY;
    camera.position.z = settings.camera.posZ;
    
    renderer.setSize( sceneSize.width, sceneSize.height );
}

function isElementInViewport(element) {
    const rect = element.getBoundingClientRect();
  
    return (
      rect.top <= window.innerHeight &&
      rect.top + element.clientHeight >= 0
    );
}

function calculateElementScrollVal(element) {
    const rect = element.getBoundingClientRect();

    return (window.innerHeight - rect.top - 200) / (2. * element.clientHeight)
}

function animate() {
    const step = .03
    const dampling = .00001
    if (Math.abs(deltaX - currentDeltaX) > step) {
        currentDeltaX = currentDeltaX + (deltaX - currentDeltaX) * step
    } else {
        currentDeltaX = currentDeltaX + (deltaX - currentDeltaX) * (deltaX - currentDeltaX) * (deltaX - currentDeltaX) * dampling
    }
    sceneObj.rotation.y = - currentDeltaX * Math.PI

    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

export default App;
