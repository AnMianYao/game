var requestAnimationFrame=window.requestAnimationFrame||window.webkitRequestAnimationFrame||
    window.mozRequestAnimationFrame||window.msRequestAnimationFrame;
var cancelAnimationFrame=window.cancelAnimationFrame||window.webkitCancelAnimationFrame;
var JumpGame=function () {
    this.score = 0;
    this.scoreDoms=document.querySelectorAll(".score");
    this.fallDire=-1;//默认为目前站立的cube
    this.isMobile=false;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.plane=null;
    this.user=null;
    this.cubes=[];
    this.box={
        width:20,
        height:20,
        depth:10
    };
    this.userSize={
        topRadius:3,
        heightCylinder:12,
        bottomRadius:4,
        height:0
    };
    this.g=-0.05;
    this.cubeStat = {
        nextDir: -1, // 下一个方块相对于当前方块的方向: -1:z轴（负方向）,1:x轴（正方向）
        cubeBoundary:0//user掉下的最近的边
    };
    this.size = {
        width: window.innerWidth,
        height: window.innerHeight
    };
    this.cameraPos = {
        current: new THREE.Vector3(0, 0, 0), // 摄像机当前的坐标
        next: new THREE.Vector3() // 摄像机即将要移到的位置
    };
    this.jumpStat = {
        ready: true, // 鼠标按完没有
        horizontalSpeed: 0, // xSpeed根据鼠标按的时间进行赋值
        ySpeed: 0, // ySpeed根据鼠标按的时间进行赋值
        scale:1 //圆柱压缩

    }
};
var stats=new Stats();
var controls = new function() {
    this.x=0.004;
    this.z=0.008;
};

var gui = new dat.GUI();
gui.add(controls, 'z',0,30);
gui.add(controls, 'x',0,0.1);


JumpGame.prototype={
    getScore:function () {
      var self=this;
      this.scoreDoms.forEach(function (value) {
          value.innerHTML=self.score.toString()
      });

    },
    setSize:function () {
        this.size.width = window.innerWidth;
        this.size.height = window.innerHeight
    },
    setCamera:function () {
        this.camera.position.set(120, 60, 60);
        this.camera.lookAt(this.cameraPos.current);
    },
    handleWindowResize:function () {
        this.setSize();
        this.camera.left = this.size.width / -10;
        this.camera.right = this.size.width / 10;
        this.camera.top = this.size.height / 10;
        this.camera.bottom = this.size.height / -10;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.size.width, this.size.height);
        this.render()
    },
    creatScene:function () {
        this.scene=new THREE.Scene();
        var camera=new THREE.OrthographicCamera(-this.size.width/10,this.size.width/10,
            this.size.height/10,-this.size.height/10,0,1000);
        this.camera=camera;
        this.setCamera();
        this.scene.add(this.camera);

        this.renderer=new THREE.WebGLRenderer({
            alpha: true,
            antialias: true
        });
        this.renderer.setSize(this.size.width,this.size.height);
        this.renderer.setClearColor(new THREE.Color(0xffffff));
        // 在 HTML 创建的容器中添加渲染器的 DOM 元素
        this.renderer.domElement.setAttribute('id','canvas');
        document.body.appendChild(this.renderer.domElement);
        // 打开渲染器的阴影地图
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMapSoft = true;
        var helpAxis=new THREE.AxesHelper( 20 );
        this.scene.add(helpAxis);
    },
    addAmbientLight:function(){
        var ambiColor = "#def5f5";
        var ambientLight = new THREE.AmbientLight(ambiColor);
        this.scene.add(ambientLight);
    },
    addSpotLight:function () {
        var pointColor = "#ffffff";
        var spotLight = new THREE.SpotLight(pointColor);
        spotLight.position.set(-40, 60, -10);
        spotLight.castShadow = true;
        spotLight.shadow.camera.near = 2;
        spotLight.shadow.camera.far = 200;
        spotLight.shadow.camera.fov = 130;
        spotLight.target = this.plane;
        spotLight.distance = 0;
        this.scene.add(spotLight);
    },
    addDirectionalLight:function () {
        var pointColor = "#ffffff";
        var directionalLight = new THREE.DirectionalLight(pointColor);
        directionalLight.position.set(30, 50, -40);
        directionalLight.castShadow = true;
        directionalLight.shadow.camera.near = 2;
        directionalLight.shadow.camera.far = 200;
        directionalLight.shadow.camera.left = -50;
        directionalLight.shadow.camera.right = 50;
        directionalLight.shadow.camera.top = 50;
        directionalLight.shadow.camera.bottom = -50;

        directionalLight.distance = 0;
        directionalLight.intensity = 0.5;
        directionalLight.shadow.mapSize.height= 1024;
        directionalLight.shadow.mapSize.width = 1024;

        this.scene.add(directionalLight);
    },
    creatUser:function (x,y,z) {
        this.userSize.height=this.userSize.heightCylinder+this.userSize.topRadius*2+1;
        var sphereGeo = new THREE.SphereGeometry(this.userSize.topRadius, 32, 32);//创建球体
        var cylinderGeo=new THREE.CylinderGeometry(this.userSize.topRadius,this.userSize.bottomRadius,this.userSize.heightCylinder,32,32);
        var mat = new THREE.MeshLambertMaterial({color:0x443c55});//创建材料
        var sphereMesh = new THREE.Mesh(sphereGeo, mat);//创建球体网格模型
        sphereMesh.castShadow = true;
       // sphereMesh.position.set(x,y+this.userSize.height/2-this.userSize.topRadius,z);
        sphereMesh.position.y=y+this.userSize.height/2-this.userSize.topRadius;

        var cylinderMesh = new THREE.Mesh(cylinderGeo, mat);//创建圆柱体网格模型
        cylinderMesh.castShadow = true;
       // cylinderMesh.position.set(x,y-this.userSize.height/2+this.userSize.heightCylinder/2,z);
        cylinderMesh.position.y=y-this.userSize.height/2+this.userSize.heightCylinder/2;
        var user=new THREE.Object3D();
        user.add(sphereMesh);
        user.add(cylinderMesh);
        user.position.set(x,y,z);//设置球的坐标
        this.scene.add(user);//将球体添加到场景
        this.user=user;
    },
    render:function () {
        stats.update();
        this.renderer.render(this.scene, this.camera);
    },
    gameOver:function () {
        var coverDom=document.querySelector('.cover');
        coverDom.classList.remove('hide');

    },
    reStart:function () {
        var coverDom=document.querySelector('.cover');
        coverDom.classList.add('hide');
        this.score=0;
        this.getScore();
        this.cameraPos = {
            current: new THREE.Vector3(0, 0, 0),
            next: new THREE.Vector3()
        };
        for(var i=0,length=this.cubes.length; i < length; i++){
            this.scene.remove(this.cubes.pop())
        }
        this.scene.remove(this.user);
        this.createCube();
        this.creatUser(this.cubes[0].position.x,this.box.depth,this.cubes[0].position.z);
        this.createCube();
        this.setCamera();
        this.updateCameraPosition();
        this.updateCamera();
        this.render();

    },
    createPlane:function () {
        var planeGeometry = new THREE.PlaneGeometry(180,180,1,1);

        var planeMaterial =   new THREE.MeshLambertMaterial({color: 0xC8C8C8});
        var plane = new THREE.Mesh(planeGeometry,planeMaterial);
        plane.receiveShadow = true;

        // rotate and position the plane
        plane.rotation.x = -0.5 * Math.PI;
        plane.position.x = 15;
        plane.position.y = 0;
        plane.position.z = 0;
        this.scene.add(plane);
        this.plane=plane;
        this.render();
    },
    createCube:function () {

        var cubeW=this.box.width;
        var cubeH=this.box.height;
        var cubeD=this.box.depth;
        var cube = new THREE.Mesh(new THREE.CubeGeometry(cubeW,cubeD,cubeH),//创建立方体
            new THREE.MeshLambertMaterial({color:Math.random()*0xffffff}));//创建材料
        // 设置立方体的坐标

        var nowCubeX;
        var nowCubeZ;
        if(this.cubes.length<=0){
            nowCubeX=0;
            nowCubeZ=0;
        }else {
            var lastCube=this.cubes[this.cubes.length-1].position;
            nowCubeX=lastCube.x;
            nowCubeZ=lastCube.z;
        }
        var random=Math.random();
        this.cubeStat.nextDir=random>0.5?1:-1;
        if(this.cubeStat.nextDir<0){
            nowCubeZ-=30+Math.random()*20;
        }else {
            nowCubeX+=35+Math.random()*20;
        }
        cube.position.set(nowCubeX,cubeD/2,nowCubeZ);
        cube.castShadow = true;
        cube.name='cube-'+this.scene.children.length;
        this.scene.add(cube);//将立方体添加到场景中
        this.cubes.push(cube);
        this.render();
    },
    updateCubes:function () {
      if(this.cubes.length>5){
          this.cubes.splice(0,this.cubes.length-5);
      }
    },
    updateCameraPosition:function () {

        var lastCubeIndex=this.cubes.length-1;
        var lastCubePoint={
            x:this.cubes[lastCubeIndex].position.x,
            z:this.cubes[lastCubeIndex].position.z
        };
        var nowCubePoint={
            x:this.cubes[lastCubeIndex-1].position.x,
            z:this.cubes[lastCubeIndex-1].position.z
        };


        var vector=new THREE.Vector3();
        vector.x=(lastCubePoint.x+nowCubePoint.x)/2;
        vector.y=0;
        vector.z=(lastCubePoint.z+nowCubePoint.z)/2;

        this.cameraPos.next=vector;
    },
    updateCamera:function () {
        var self=this;
        var update=function () {
            var current={
                x: self.cameraPos.current.x,
                y: self.cameraPos.current.y,
                z: self.cameraPos.current.z
            };
            var next={
                x: self.cameraPos.next.x,
                y: self.cameraPos.next.y,
                z: self.cameraPos.next.z
            };

            if(current.x<next.x || current.z>next.z){
                self.cameraPos.current.x+=1;
                self.cameraPos.current.z-=1;
                if (self.cameraPos.next-self.cameraPos.current.x<0.5){
                    self.cameraPos.current.x=self.cameraPos.next.x;
                }
                if (self.cameraPos.current.z-self.cameraPos.next.z<0.5){
                    self.cameraPos.current.z=self.cameraPos.next.z;
                }
                self.camera.lookAt(current.x,0,current.z);
                self.render();
                requestAnimationFrame(update);
            }else {
                cancelAnimationFrame(update);
                update=null;
            }

        };
        update();


    },
    userJump:function() {
        var self=this;
        var flag=true;
        var userPositon={
            z:this.user.position.z,
            x:this.user.position.x
        };
        var jump=function () {
            var z=self.box.depth;
            if(self.user.position.y>z || flag){
                flag=false;
                switch (self.cubeStat.nextDir){
                    case -1:
                        self.user.position.z+=self.jumpStat.horizontalSpeed*self.cubeStat.nextDir;
                        break;
                    case 1:
                        self.user.position.x+=self.jumpStat.horizontalSpeed*self.cubeStat.nextDir;
                        break;
                    default:
                        break;
                }
                self.jumpStat.ySpeed+=self.g;
                self.user.position.y=Math.max(self.user.position.y+self.jumpStat.ySpeed,z);
                self.renderer.render(self.scene,self.camera);
                requestAnimationFrame(jump);
            }else {
                cancelAnimationFrame(jump);
                jump=null;
                self.jumpStat.ready=true;
                self.jumpStat.horizontalSpeed = 0;
                self.jumpStat.ySpeed = 0;
                self.jumpStat.scale=1;
                var falling=self.isFalling();

                if(!falling){
                    self.score+=1;
                    self.getScore();
                    self.createCube();
                    self.render();

                }else {
                    self.fallingAnimate();
                    return
                }


            }

        };
        this.updateCamera();
        jump();

    },
    getApproachCube:function (user,currentCube,nextCube) {
        var distanceCurrent=Math.pow((user.z-currentCube.z),2)+Math.pow((user.x-currentCube.x),2);
        var distanceNext=Math.pow((user.z-nextCube.z),2)+Math.pow((user.x-nextCube.x),2);
        var approachCube;
        var axis=this.cubeStat.nextDir<0?"z":"x";
        if(distanceNext>distanceCurrent){
            approachCube=currentCube;
            this.fallDire=-1;
            this.cubeStat.cubeBoundary=approachCube[axis]+(this.box.width*this.cubeStat.nextDir/2);
        }else {
            approachCube=nextCube;
            this.fallDire=this.getFallingDirection(approachCube,axis);
        }

        return approachCube;
    },
    getFallingDirection:function (cube,axis) {
        //将要跳过去cube，falling方向
        var boundaryOne=cube[axis]+(this.box.width*this.cubeStat.nextDir/2);
        var boundaryTwo=cube[axis]-(this.box.width*this.cubeStat.nextDir/2);

        var distanceOne=Math.abs(boundaryOne-this.user.position[axis]);
        var distanceTwo=Math.abs(boundaryTwo-this.user.position[axis]);

        if(distanceOne>distanceTwo){
            this.cubeStat.cubeBoundary=cube[axis]-(this.box.width*this.cubeStat.nextDir/2);
            return 1;
        }else {
            this.cubeStat.cubeBoundary=cube[axis]+(this.box.width*this.cubeStat.nextDir/2);
            return -1;
        }



    },
    isFalling:function () {
        if(this.cubes.length<1){
            return false;
        }
        var user={
            z:this.user.position.z,
            x:this.user.position.x
        };
        var cubesLength=this.cubes.length;
        var currentCube={
            z:this.cubes[cubesLength-2].position.z,
            x:this.cubes[cubesLength-2].position.x
        };
        var nextCube={
            z:this.cubes[cubesLength-1].position.z,
            x:this.cubes[cubesLength-1].position.x
        };
        var approachingCube=this.getApproachCube(user,currentCube,nextCube);
        var axis=this.cubeStat.nextDir<0?"z":"x";
        return !(user[axis]>approachingCube[axis]+this.box.width/2*this.cubeStat.nextDir
            && user[axis]<approachingCube[axis]-this.box.width/2*this.cubeStat.nextDir);

    },

    fallingAnimate:function () {
        var limitY=this.userSize.bottomRadius;
        var speed=0,rotationlSpeed=0.1*this.fallDire;
        /**
         * 旋转轴
         * @type {string}变化轴另一个
         */
        var axis=this.cubeStat.nextDir<0?"x":"z";
        var horizontalAxis=(axis==='x'?'z':'x');
        var self=this;
        this.user.position[horizontalAxis]=this.cubeStat.cubeBoundary;
        var falling=function () {

            speed+=self.g/2;

            if(self.user.position.y>limitY && Math.abs(self.user.rotation[axis])<Math.PI/2){
                self.user.position.y+=speed;
                self.user.rotation[axis]+=rotationlSpeed;
                self.render();
                requestAnimationFrame(falling);
            }else {
                cancelAnimationFrame(falling);
                falling=null;
                self.gameOver();
            }

        };

        falling();

    },
    checkUserAgent:function () {
        var userAgent=navigator.userAgent;
        if (userAgent.match(/Android/i) || userAgent.match(/webOS/i)
            || userAgent.match(/iPhone/i) || userAgent.match(/iPad/i)
            || userAgent.match(/iPod/i) || userAgent.match(/BlackBerry/i)){
            this.isMobile = true
        }
    },
    handleMousedown:function (e) {
        var self=this;
        /**
         * &&this.user.scale.y>0.02
         */
        var accelerate=function () {
            if(self.jumpStat.ready && self.user.scale.y>0.5){
                self.jumpStat.horizontalSpeed+=0.005;
                self.jumpStat.ySpeed+=0.01;
                self.jumpStat.scale-=0.002;
                self.user.scale.y=self.jumpStat.scale;
                self.render();
                requestAnimationFrame(accelerate);
            }else {
                cancelAnimationFrame(accelerate);
                accelerate=null;
            }
        };
        accelerate();
    },
    handleMouseup:function () {
        this.jumpStat.ready=false;
        this.user.scale.y=1;
        this.updateCameraPosition();
        this.userJump();
        this.updateCubes();
    },
    init:function () {
        this.checkUserAgent();
        this.creatScene();
        this.createPlane();
        this.addAmbientLight();
        //this.addSpotLight();
        this.addDirectionalLight();
        this.createCube();
        this.creatUser(this.cubes[0].position.x,this.box.depth,this.cubes[0].position.z);
        this.createCube();
        initStats();
        this.render();
        this.updateCameraPosition();
        this.updateCamera();
        var mouseEvents = (this.isMobile) ?
            {
                down: 'touchstart',
                up: 'touchend'
            }
            :
            {
                down: 'mousedown',
                up: 'mouseup'
            };
        var self=this;

        var canvas=document.querySelector("#canvas");

        canvas.addEventListener(mouseEvents.down, function (evt) {
            evt.preventDefault();
            self.handleMousedown()
        });
        // 监听鼠标松开的事件
        canvas.addEventListener(mouseEvents.up, function (evt) {
            evt.preventDefault();
            self.handleMouseup()
        },false);
        // 监听窗口变化的事件
        window.addEventListener('resize', function (evt) {
            evt.preventDefault();
            self.handleWindowResize()
        },false);
        var reStart=document.querySelector("#restart");
        reStart.addEventListener("click",function (evt) {
            evt.preventDefault();
            self.reStart();
        },false);

    }
};
function initStats() {
    stats.setMode(0); // 0: fps, 1: ms

    // Align top-left
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';

    document.querySelector("#stats").append( stats.domElement );

    return stats;
}


var game=new JumpGame();
game.init();








