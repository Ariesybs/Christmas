import * as THREE from 'three'; // 确保正确路径
import { GLTFLoader } from './GLTFLoader.js';
import { EffectComposer } from '../node_modules/three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from '../node_modules/three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from '../node_modules/three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls.js';
import { FontLoader } from '../node_modules/three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from '../node_modules/three/examples/jsm/geometries/TextGeometry.js';
import { BokehPass } from '../node_modules/three/examples/jsm/postprocessing/BokehPass.js';


// 添加一个虚化效果全屏的div
const addBlurDiv = () => {
    const blurDiv = document.createElement('div');
    blurDiv.style.position = 'absolute';
    blurDiv.style.top = '0';
    blurDiv.style.left = '0';
    blurDiv.style.width = '100%';
    blurDiv.style.height = '100%';
    blurDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'; // 白色背景并且有透明度
    blurDiv.style.backdropFilter = 'blur(10px)'; // 添加虚化效果
    blurDiv.style.transition = 'opacity 1s'; // 设置渐变时间
    blurDiv.style.opacity = '1'; // 初始为完全可见
    document.body.appendChild(blurDiv);
    return blurDiv;
};

// 创建播放音乐的按钮
const addPlayButton = () => {
    const playButton = document.createElement('button');
    playButton.innerText = 'Merry Christmas!';
    playButton.style.position = 'absolute';
    playButton.style.top = '50%';
    playButton.style.left = '50%';
    playButton.style.transform = 'translate(-50%, -50%)'; // 使按钮居中
    playButton.style.zIndex = '100'; // 确保按钮在最上层
    playButton.style.width = '200px'; // 设置宽度
    playButton.style.height = '60px'; // 设置高度
    playButton.style.fontFamily = 'Arial, sans-serif'; // 字体类型
    playButton.style.fontSize = '18px'; // 字体大小
    playButton.style.fontWeight = 'bold'; // 字体加粗
    playButton.style.color = '#ffffff'; // 字体颜色
    playButton.style.backgroundColor = '#007BFF'; // 背景颜色
    playButton.style.border = 'none'; // 去掉边框
    playButton.style.borderRadius = '5px'; // 设置圆角
    playButton.style.padding = '10px'; // 内边距
    playButton.style.cursor = 'pointer'; // 鼠标悬停时显示为手型

    // 添加鼠标悬停效果
    playButton.onmouseover = function() {
        playButton.style.backgroundColor = '#0056b3'; // 悬停时改变背景颜色
    };
    playButton.onmouseout = function() {
        playButton.style.backgroundColor = '#007BFF'; // 离开时恢复背景颜色
    };

    playButton.style.display = 'none'; // 隐藏按钮，直到模型加载完成
    document.body.appendChild(playButton);

    
    return playButton;
};

// 创建加载文本显示
const addLoadingText = () => {
    const loadingText = document.createElement('div');
    loadingText.style.position = 'absolute';
    loadingText.style.top = '50%';
    loadingText.style.left = '50%';
    loadingText.style.transform = 'translateX(-50%)'; // 使文本居中
    loadingText.style.color = '#ffffff'; // 文本颜色
    loadingText.style.fontSize = '20px'; // 字体大小
    document.body.appendChild(loadingText);
    return loadingText;
};

const addLoadingManager = (loadingManager,loadingText,playButton) => {
    // 监听加载事件
    loadingManager.onStart = function (url, itemsLoaded, itemsTotal) {
        console.log('开始加载：' + url);
    };

    loadingManager.onLoad = function () {
        console.log('所有资源加载完成！');
        playButton.style.display = 'block'; // 显示按钮
    };

    loadingManager.onProgress = function (url, itemsLoaded, itemsTotal) {
        const percentLoaded = (itemsLoaded / itemsTotal) * 100;
        loadingText.innerText = `圣诞老人正在路上... ${Math.round(percentLoaded)}%`; // 更新加载文本
        if(percentLoaded === 100){
            // 当模型加载完成，显示按钮
            playButton.style.display = 'block'; // 显示按钮
            document.body.removeChild(loadingText); // 删除加载文本
        }
    };

    loadingManager.onError = function (url) {
        console.log('资源错误：' + url);
    };
    return loadingManager;
}

const addLights = (scene) => {
    // 创建环境光
    const ambientLight = new THREE.AmbientLight(0xcddced, 0.1);
    scene.add(ambientLight);

    // 创建直射光
    const directionalLight = new THREE.DirectionalLight(0xcddced, 0);
    directionalLight.position.set(0, 1, -2).normalize(); // 设置光源位置
    scene.add(directionalLight);

    // 创建点光源
    const pointLight1 = new THREE.PointLight(0xdd9e31, 1, 100);
    const pointLight2 = new THREE.PointLight(0xdd9e31, 2, 10);
    // 设置点光源位置
    pointLight1.position.set(0, -2, -7);
    pointLight2.position.set(0, 5, 3);

    // 添加光源到场景中
    scene.add(pointLight1);
    scene.add(pointLight2);

    // 可选：创建一个点光源的辅助对象，以可视化光源位置
    // const pointLightHelper1 = new THREE.PointLightHelper(pointLight1, 0.5); // 0.5 为辅助对象的大小
    // const pointLightHelper2 = new THREE.PointLightHelper(pointLight2, 0.5); // 0.5 为辅助对象的大小
    // scene.add(pointLightHelper1);
    // scene.add(pointLightHelper2);

}

const addSnowParticles = (scene) => {
    // 创建雪花粒子系统
    const snowParticlesCount = 2000;
    const snowParticlesGeometry = new THREE.BufferGeometry();
    const snowParticlesPositionArray = new Float32Array(snowParticlesCount * 3);

    for (let i = 0; i < snowParticlesCount * 3; i++) {
        snowParticlesPositionArray[i] = (Math.random() - 0.5) * 100;
    }

    snowParticlesGeometry.setAttribute('position', new THREE.BufferAttribute(snowParticlesPositionArray, 3));

    const snowParticlesMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.8,
        transparent: true,
        opacity: 0.9,
        map: new THREE.TextureLoader().load('../image/snowflake.png'), // 确保你有一个雪花纹理图片
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const snowParticles = new THREE.Points(snowParticlesGeometry, snowParticlesMaterial);
    scene.add(snowParticles);
    return snowParticles;
}

const addModel = (scene,gltfLoader) => {
    let loadedModel; // 用于存储加载的模型

    // 加载 glTF 模型
    gltfLoader.load(
        '../model/Sphere/scene.gltf', // 替换为你的模型路径
        (gltf) => {
            loadedModel = gltf.scene;
            const sacle = 0.02;
            loadedModel.scale.set(sacle, sacle, sacle); // 可选: 设置模型的缩放
            scene.add(gltf.scene); // 将模型添加到场景中
            gltf.scene.position.set(0, 0, 0); // 可选: 设置模型的位置
            loadedModel.traverse((child) => {
                if (child.isMesh && child.material.name === "glass") {
                    console.log(child.material.name); // 打印模型的名称
                    child.material = new THREE.MeshPhysicalMaterial({
                        color: 0xcddced,            // 基本颜色
                        transparent: true,           // 允许透明
                        opacity: 0.5,               // 透明度（0-1之间）
                        depthWrite: false,          // 禁用深度写入以允许透视现象
                        reflectivity: 1,          // 反射率（0-1之间）
                        transmission: 0.9,          // 透过率（用于 Glass Effect）
                        roughness: 0.05              // 光滑度
                    });
                }
            });

            
        },
        (xhr) => {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded'); // 加载进度
        },
        (error) => {
            console.error('An error occurred:', error); // 错误处理
        }
    );
}

const addAudio = (audioLoader,audio)=>{
    
    audioLoader.load('../audio/MerryChristmas.mp3', function(buffer) {
        audio.setBuffer(buffer);
        audio.setLoop(true); // 设置循环播放
        audio.setVolume(0.5); // 设置音量（范围0.0到1.0）
        
    });
}

const addText = (scene,fontLoader,name) => {
    const materials = [
        new THREE.MeshToonMaterial({
          color:0xffffff,
        //   flatShading:true
        }),//front
        new THREE.MeshToonMaterial({color:0x225522})//back
    ]

    const scale = 0.1

    fontLoader.load('../font/STXingkai_Regular.json', function (font) {
        var merrychristmas = new TextGeometry('Merry Christmas', {
            font: font,
            size: 1.1,
            height: 0.1,
            curveSegments: 8,
            bevelEnabled: true,
            bevelThickness: 0.1,
            bevelSize: 0.1,
            bevelSegments: 8
        });

        if (name) {
            const nameLength = name.length;
            console.log(name.length)
            var nameTextGeometry = new TextGeometry(name, {
                font: font,
                size: 1,
                height: 0.06,
                curveSegments: 8,
                bevelEnabled: true,
                bevelThickness: 0.1,
                bevelSize: 0.1,
                bevelSegments: 8
            });
            nameTextGeometry.computeBoundingBox(); // 计算边界盒
            const nameBox = nameTextGeometry.boundingBox;
            const nameOffsetX = -(nameBox.max.x - nameBox.min.x) / 2; // 计算 x 方向的偏移
            var nameText = new THREE.Mesh(nameTextGeometry, materials);
            const nameScale = 0.12;
            nameText.scale.set(nameScale, nameScale, nameScale);
            // 应用偏移，使文本居中对齐
            nameText.position.x = nameOffsetX * nameScale;
            nameText.position.y = 0.15; // 位置可以根据需要调整
            nameText.position.z = 1.75;
            nameText.rotation.x = -Math.PI / 6; // 绕 x 轴旋转 90 度

            scene.add(nameText);
        }
        
        // 计算边界盒以便居中对齐
        
        merrychristmas.computeBoundingBox(); // 计算边界盒
        
        const merrychristmasBox = merrychristmas.boundingBox;
        // 计算偏移量，使文本居中
        
        const merrychristmasOffsetX = -(merrychristmasBox.max.x - merrychristmasBox.min.x) / 2; // 计算 x 方向的偏移


        var merrychristmasText = new THREE.Mesh(merrychristmas, materials);
        merrychristmasText.scale.set(scale, scale, scale);
        merrychristmasText.position.x = merrychristmasOffsetX * scale;
        merrychristmasText.position.y = 0.3; // 位置可以根据需要调整
        merrychristmasText.position.z = 1.65;
        merrychristmasText.rotation.x = -Math.PI / 6; // 绕 x 轴旋转 90 度
        scene.add(merrychristmasText);

        
    });
}

const addPostProcessing = (scene,camera,renderer) => {
    // 后处理设置
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    // 创建泛光效果
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.4, 0, 0);
    composer.addPass(bloomPass);

    // 创建景深效果
    const bokehPass = new BokehPass(scene, camera, {
        focus: 20, // 焦点
        aperture: 0.000005, // 光圈大小
        maxDepth: 100.0, // 最大深度
        maxblur: 1, // 最大模糊度
        width: window.innerWidth,
        height: window.innerHeight
    });
    composer.addPass(bokehPass);
    return composer;
}

const addOrbitControls = (camera,renderer) => {
    // 创建 OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // 启用阻尼（惯性）
    controls.dampingFactor = 0.1; // 设置阻尼因子
    controls.enableZoom = true; // 允许缩放
    controls.target.set(0, 1, 0); // 设置旋转的目标
    controls.update(); // 更新控制器位置
    return controls;
}

const addEventListeners = (camera,renderer,composer,audio,playButton,blurDiv)=>{
    // 处理窗口调整大小
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        // console.log(window.innerWidth);
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        composer.setSize(window.innerWidth, window.innerHeight);
    });

    // 监听点击事件，播放音乐并逐渐消失虚化效果
    playButton.addEventListener('click', function() {
        // 播放音乐
        if (audio.context.state === 'suspended') {
            audio.context.resume().then(() => {
            audio.play(); // 播放音频
            });
        } else {
            audio.play(); // 播放音频
        }
        document.body.removeChild(playButton); // 删除按钮
        
        // 渐变隐藏虚化效果
        blurDiv.style.opacity = '0'; // 通过改变不透明度使其消失
        // 设置延迟，等待渐变完成后删除 blurDiv
        setTimeout(() => {
            document.body.removeChild(blurDiv); // 删除虚化效果的 div
            
        }, 500); 

    });
}

// 动画循环
const animate = ()=> {
    requestAnimationFrame(animate);
    //雪花粒子的运动
    if(snowParticles){
        const positions = snowParticles.geometry.attributes.position.array;
        for (let i = 0; i < 2000 * 3; i += 3) {
            // z 轴位置更新，模拟下落
            positions[i + 1] -= 0.02;
            // positions[i] += (Math.random()) * 0.02;

            // 如果雪花下落到地面，重新设置位置到顶部
            if (positions[i + 1] < -50) {
                positions[i + 1] = 50;
                positions[i] = (Math.random() - 0.5) * 100;
                positions[i] = (Math.random() - 0.5) * 50;
            }
        }
        snowParticles.geometry.attributes.position.needsUpdate = true;
    }
    
    if(controls)controls.update(); // 更新控制器
    if(composer)composer.render();
};

var snowParticles;
var composer;
var controls;

const main = ()=>{
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 2, 8); // 设置相机位置
    const renderer = new THREE.WebGLRenderer();
    const listener = new THREE.AudioListener();
    const audio = new THREE.Audio(listener);
    //资源加载器
    const loadingManager = new THREE.LoadingManager();
    const gltfLoader = new GLTFLoader(loadingManager);
    const fontLoader = new FontLoader(loadingManager);
    const audioLoader = new THREE.AudioLoader(loadingManager);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('model-preview').appendChild(renderer.domElement);
    //解析URL
    const currentURL = window.location.href;
    const url = new URL(currentURL);
    const name = url.searchParams.get('name');

    const blurDiv = addBlurDiv();
    const playButton = addPlayButton();
    const loadingText = addLoadingText();
    addLoadingManager(loadingManager,loadingText,playButton);
    addLights(scene);
    snowParticles = addSnowParticles(scene);
    console.log(snowParticles.geometry.attributes.position.array);
    addModel(scene,gltfLoader);
    addAudio(audioLoader,audio);
    addText(scene,fontLoader,name);
    composer = addPostProcessing(scene,camera,renderer);
    // console.log(composer)
    controls = addOrbitControls(camera,renderer);
    addEventListeners(camera,renderer,composer,audio,playButton,blurDiv);
    animate(snowParticles,composer,controls);
}

main();



