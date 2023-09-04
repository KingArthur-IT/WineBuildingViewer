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
        y: 0.06
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
        camera = new THREE.PerspectiveCamera( 45, sceneSize.width / sceneSize.height, .1, settings.camera.deep );
        camera.position.x = settings.camera.posX;
        camera.position.y = settings.camera.posY;
        camera.position.z = settings.camera.posZ;
        scene.add(camera)

        //lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 1);
        const mainLight = new THREE.PointLight(0xffffff, .2);
        mainLight.position.set(-.75, .35, 0)
        const sideLight = new THREE.PointLight(0x6cbfff, .25);
        sideLight.position.set(3.5, .5, -.4)

        scene.add(ambientLight);
        scene.add(mainLight);
        scene.add(sideLight);

        // const fog = new THREE.FogExp2(new THREE.Color("#FFFFFF"),.6)
        // scene.fog = fog

        renderer = new THREE.WebGLRenderer({ 
            canvas: canvas, 
            antialias: true, 
            alpha: true, 
            // powerPreference: 'high-performance', 
            // preserveDrawingBuffer: true, 
            // premultipliedAlpha: false,
            // logarithmicDepthBuffer: true,
            // precision: 'highp'

        });
        // renderer.setClearColor( 0x000000, 0 );
        renderer.setPixelRatio( Math.min(window.devicePixelRatio, 1.5) );
        renderer.setSize( sceneSize.width, sceneSize.height );
        // renderer.toneMapping = THREE.ACESFilmicToneMapping;
        // renderer.toneMappingExposure = 1;
        // renderer.gammaOutput = true;
        // renderer.gammaInput = true;
        // renderer.stencil = true;
        // renderer.depth = true;

        renderer.shadowMap.enabled = true
        // renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        // renderer.outputEncoding = THREE.sRGBEncoding;
        // renderer.physicallyCorrectLights = true;

        const transparentMaterial = new THREE.MeshPhongMaterial({
            // color: new THREE.Color('0xffffff'),
            color: 16777215,
            shininess: .5,
            transparent: !0,
            opacity: .5
        });

        // Создаем загрузчик текстур
        const textureLoader = new THREE.TextureLoader();
        // Загружаем карту окружающей засветки (aomap)
        const aoMapTexture = textureLoader.load("./assets/test/winery_09.jpeg");

        const mainMaterial = new THREE.MeshLambertMaterial({
            color: new THREE.Color('0xffffff'),
            // color: 16777215,
            aoMap: aoMapTexture, // карта окружающей засветки
            aoMapIntensity: .7 // интенсивность карты окружающей засветки
        });

        const redMaterial = new THREE.MeshPhongMaterial({
            // color: new THREE.Color('0xff0000'),
            color: 15017491,
            shininess: .25,
            transparent: !0,
            opacity: .3
        });

        sceneObj = new THREE.Object3D();
        let gltfLoader = new GLTFLoader();
        gltfLoader.setPath('./assets/test/');
        gltfLoader.load(
            'winery_09.gltf',
            (object) => {
                object.scene.traverse( function ( child ) {
                    if ( child instanceof THREE.Mesh ) {
                        console.log(child);
                        child.geometry.computeVertexNormals();
                        // child.material.side = THREE.DoubleSide;    
                        
                        if (child.name === 'winery_glass') {
                            child.material = transparentMaterial  
                        }
                        if (child.name === 'winery_white') {
                            child.material = mainMaterial  
                        }
                        if (child.name === 'winery_red') {
                            child.material = redMaterial  
                        }
                    }
                });
                object.name = 'winery';
                sceneObj.add(object.scene)
            }, (xhr) => {
                console.log(`loaded: ${Math.floor(100.0 * xhr.loaded / xhr.total)}%`);
            },
        )
        sceneObj.scale.set(1500, 1500, 1500);
        scene.add(sceneObj);
        

        document.addEventListener('mousemove', mouseMoveHandler)
        document.addEventListener('scroll', scrollEventHandler)  

        window.addEventListener('resize', onCanvasResize)

        animate()
    }
}

var deltaY = 0,
    currentDeltaY = 0

function mouseMoveHandler(e) {    
    const newDeltaY = Math.sign(e.y - mouseData.y) * settings.moveStep.y
    mouseData.y = e.y
    if (sceneObj.rotation.x + newDeltaY < settings.maxXRotate && sceneObj.rotation.x + newDeltaY > settings.minXRotate) {
        deltaY = sceneObj.rotation.x + newDeltaY
    }
}

var deltaX = 0,
    currentDeltaX = 0

function scrollEventHandler(e) {
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
    
    camera = new THREE.PerspectiveCamera( 45, sceneSize.width / sceneSize.height, 0.1, settings.camera.deep );
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
    const step = .007
    const damping = .0001
    //for scroll-x rotation
    if (Math.abs(deltaX - currentDeltaX) > step) {
        currentDeltaX = currentDeltaX + (deltaX - currentDeltaX) * step
    } else {
        currentDeltaX = currentDeltaX + (deltaX - currentDeltaX) * (deltaX - currentDeltaX) * (deltaX - currentDeltaX) * damping
    }
    sceneObj.rotation.y = - currentDeltaX * Math.PI
    
    //for up-dowm rotation for mouse
    currentDeltaY = currentDeltaY + (deltaY - currentDeltaY) * step * 3
    sceneObj.rotation.x = currentDeltaY
    
    camera.updateMatrixWorld();    
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

export default App;
