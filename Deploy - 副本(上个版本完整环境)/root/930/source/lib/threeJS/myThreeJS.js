import * as THREE from './three.module.js'
import {OrbitControls} from './OrbitControls.js';
import {GUI} from './dat.gui.module.js';
import {Lut} from './Lut.js';
import {TextGeometry} from './TextGeometry.js';
import {FontLoader} from './FontLoader.js';

import Stats from './stats.module.js'
class myThreeJS{
      constructor(dom) {
            this.perCamera = undefined;
            this.renderer = undefined;
            this.controls = undefined;
            this.sprite = undefined;
            this.orthoCamera = undefined;
            this.container = undefined;
            this.stats = undefined;
            this.camera2 = undefined;
            this.font = undefined
            this.width=1
            this.height=1
            this.lut = undefined;
            this.uiScene = undefined;
            this.scene = undefined;
            this.loader = undefined;
            this.color = new THREE.Color();
            this.lutGroup = undefined;
            this.boxGroup = new THREE.Group();
            this.AxesHelper = new THREE.AxesHelper(25)
            this.gui=undefined
            this.data = []
            this.clipParam={
                dir:"",
                startX:0,
                endX:0,
                startY:0,
                endY:0,
                startZ:0,
                endZ:0,
                s:0,
                e:0
            }
            this.params = {
					    dir:'',
					    minX:0,
					    minY:0,
					    minZ:0,
					    maxX: 0,
					    maxY: 0,
					    maxZ: 0
					  }
            this.z=1
            this.initFont()
            this.dom = undefined
            this.geometry = undefined
            this.material = undefined
            this.xScale = 0;
  					this.yScale = 0;
  					this.zScale = 0;
  					this.updateGeometryBySize = undefined;
      }
      initFont(){
            let loader = new FontLoader();
            loader.load( 'source/lib/threeJS/gentilis_regular.typeface.json', font=>this.font = font)
      }
      init3D(dom){
            this.dom = dom
            this.width = $('#'+dom).width()
            this.height=$("#"+dom).height()
            this.container = document.getElementById(dom);


            this.perCamera = new THREE.PerspectiveCamera( 7, this.width/ this.height, 1, 2000);
            this.perCamera.position.set( this.width*0.5, this.width*0.4, this.height*0.5);

            this.scene = new THREE.Scene();
            this.scene.add(this.perCamera)

            this.orthoCamera = new THREE.PerspectiveCamera(5,this.width / this.height, 1, 2000)
            this.orthoCamera.position.set( this.width*0.5, this.width*0.4, this.height*0.5);

            this.uiScene = new THREE.Scene();
            this.uiScene.add(this.orthoCamera)



            this.renderer = new THREE.WebGLRenderer( { antialias: true , logarithmicDepthBuffer: true,preserveDrawingBuffer: true,} );
            this.renderer.autoClear = false;
            this.renderer.setPixelRatio( window.devicePixelRatio );
            this.renderer.setSize( this.width, this.height );

            this.container.appendChild( this.renderer.domElement );

            //this.scene.add( this.AxesHelper );
            //帧率
            this.stats = new Stats({ horizontal: false } )
            let statusDom = this.stats.domElement
            statusDom.style.top=null
            statusDom.style.width='80px'
            statusDom.style.position='relative'
            statusDom.style.left = '0'
            statusDom.style.bottom='100%'
            statusDom.style.float = 'left'
            this.container.appendChild(statusDom)



            this.controls = new OrbitControls(this.perCamera, this.renderer.domElement );
            //this.controls.update()
            this.controls.addEventListener('change',this.show)

            window.addEventListener( 'resize', this.onWindowResize);
            //onWindowResize();



            this.geometry = new THREE.BoxGeometry(1, 1, 1);
            this.material = new THREE.MeshBasicMaterial({color:'#fff'});




            this.show()
      }

      getClipP(){
          return this.params
      }
      getZ(){
          return this.z
      }
      getData(){
          return this.data
      }
      //添加坐标轴
      calculateTicks(min, max, splitNumber = 5) {
			  const range = max - min;
			  const roughStep = range / splitNumber;
			  const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
			  
			  // 常见刻度系数
			  const magic = [1, 2, 5, 10];
			  let step = magnitude * magic.find(v => v * magnitude >= roughStep);
			  
			  // 调整边界
			  const lower = Math.floor(min / step) * step;
			  const upper = Math.ceil(max / step) * step;
			  
			  return { min: lower, max: upper, interval: step };
			}
		
      //添加坐标系
      addAxis(xA,yA,zA,xStep=1,yStep=1,zStep=1) {
            // let temp = Math.max(...[xA,yA,zA])
            this.data = Array.from({
                  length: xA
            }, () => Array.from({length:yA},()=>new Array(zA).fill(0)));

            this.lutConfig()
						let maxStep = Math.max(xStep,yStep,zStep)
      			
      			let xScale = Math.round(xStep/maxStep*100)/50;
      			let yScale = Math.round(yStep/maxStep*100)/50;
      			let zScale = Math.round(zStep/maxStep*100)/50;
            let origin = new THREE.Vector3(0, 0, 0);
            let hex = 0xffff00;
            let headLength = 0.5;
            let headWidth = 0.2;
            
            let xRange = this.calculateTicks(0,xA*xScale);
            let yRange = this.calculateTicks(0,yA*yScale);
            let zRange = this.calculateTicks(0,zA*zScale);
//          xA++
//          yA++
//          zA++

					
            let dir = new THREE.Vector3((yA+1)*yScale, 0, 0);
            dir.normalize();
            let arrowHelper = new THREE.ArrowHelper(dir, origin,(yA+1)*yScale, hex, headLength, headWidth);
            this.scene.add(arrowHelper);
            dir = new THREE.Vector3(0, (zA+1)*zScale, 0);
            dir.normalize();
            arrowHelper = new THREE.ArrowHelper(dir, origin, (zA+1)*zScale, hex,headLength,headWidth);
            this.scene.add(arrowHelper);
            dir = new THREE.Vector3(0, 0, (xA+1)*xScale);
            dir.normalize();
            arrowHelper = new THREE.ArrowHelper(dir, origin, (xA+1)*xScale, hex, headLength, headWidth);
            this.scene.add(arrowHelper);
            for (let i = 0; i <=xA ; i++) {
                  this.scene.add(this.addLabel(i.toString(), new THREE.Vector3( -1,0,i*xScale)))//z
            }
            for (let i = 0; i <=yA ; i++) {
                  this.scene.add(this.addLabel(i.toString(), new THREE.Vector3( i*yScale,0,-1)))//x
            }
            for (let i = 0; i <=zA ; i++) {
                  this.scene.add(this.addLabel(i.toString(), new THREE.Vector3( -1,i*zScale,0)))//y
            }
            this.scene.add(this.addLabel('X', new THREE.Vector3( -1,0,(xA+1)*xScale)))
            this.scene.add(this.addLabel('Z', new THREE.Vector3( -1,(zA+1)*zScale,0)))
            this.scene.add(this.addLabel('Y', new THREE.Vector3( (yA+1)*yScale,0,-1)))
            
            
      }
      lutConfig(){
            this.lut = new Lut();
            this.sprite = new THREE.Sprite( new THREE.SpriteMaterial( {map: new THREE.CanvasTexture( this.lut.createCanvas())} ));
            this.sprite.material.map.colorSpace = THREE.SRGBColorSpace;
            this.sprite.material.map = new THREE.CanvasTexture( this.lut.createCanvas());
            this.sprite.scale.x = 1;
            this.sprite.scale.y = 14
            this.sprite.position.y = -6
            this.lutGroup = new THREE.Group()
            this.lutGroup.position.set(0,-1,0)
            this.lutGroup.add(this.sprite)
            this.uiScene.add( this.lutGroup );
            const map = this.sprite.material.map;
            map.needsUpdate = true;
            this.lut.setColorMap( 'custom1');
            this.lut.updateCanvas( map.image );
      }
      updateLut(data){
            const intensityData = [];
            let temp = intensityData.flat().flat()
            temp = temp.filter(num=>num>0)
            let min = Math.min(...temp)
            let max = Math.max(...temp)
            console.log(this.lut)
            this.lut.setMax(max);
            this.lut.setMin(min);
            this.lutGroup.add(this.addLabel('Max-'+max, new THREE.Vector3( -1.2,1.2,0) ))
            this.lutGroup.add(this.addLabel('Min-'+min, new THREE.Vector3( -1.2,-13.6,0) ))
            //this.show()
      }
      updateLutRow(xArr,yArr,curZ,Z,data){
      			let min = Number.MAX_VALUE;
    				let max = Number.MIN_VALUE;
            for ( let x = 0; x < xArr.length; x ++ ) {
            	
                this.data[x][yArr[0]][curZ]=data[x]
                min = min>data[x]?data[x]:min;
                max = max<data[x]?data[x]:max;
            }
            
            this.lut.setMax(max);
            this.lut.setMin(min);
            if(curZ===(Z-1)){
                  this.lutGroup.add(this.addLabel('Max-'+max, new THREE.Vector3( -1.2,1.2,0)))
                  this.lutGroup.add(this.addLabel('Min-'+min, new THREE.Vector3( -1.2,-13.6,0)))
            }
      }
      updateLutPanel(xL,yL,z,depth,data){
      		let min = Number.MAX_VALUE;
    			let max = Number.MIN_VALUE;
          for (let x = 0; x < xL; x++) {
              for (let y = 0; y < yL; y++) {
              	
                  this.data[x][y][z] = data[y][x]
                  min = min>data[y][x]?data[y][x]:min;
                  max = max<data[y][x]?data[y][x]:max;
              }
          }

        	this.lut.setMax(max);
        	this.lut.setMin(min);
        	if(z===parseInt(depth-1)){
            	this.lutGroup.add(this.addLabel('Max-'+max, new THREE.Vector3( -1.2,1.2,0) ))
            	this.lutGroup.add(this.addLabel('Min-'+min, new THREE.Vector3( -1.2,-13.6,0) ))
        	}
            //this.show()
      }
      updateHeatMap3D(arr,x,y){
            if(arr===undefined) return
            mapping.mappingMap.clearHeatmap()
            mapping.mappingMap.addHeatmap(x,y,new Date().Format('HHMMss'))
            for (var i = 0; i < y; i++) {
            	console.log(arr)
            	mapping.mappingMap.addRow(i, arr.slice(i*x,i*x+x));
            }
//          let temp = arr.flat().flat()//arr.flat()
//          mapping.mappingMap.addLut(Math.min(...arr),Math.max(...arr),true)
      }
      addMesh(curX,curY,curZ,datas,xStep,yStep,zStep){
            this.clearGroup(this.boxGroup)
            let maxStep = Math.max(xStep,yStep,zStep)
      			
      			let xScale = Math.round(xStep/maxStep*100)/100;
      			let yScale = Math.round(yStep/maxStep*100)/100;
      			let zScale = Math.round(zStep/maxStep*100)/100;
            //this.updateLut(data)
//            this.addGUI(this,xArr,yArr,zArr,intensityData)
						for ( let z = 0; z <= curZ; z ++ ) {
	            for ( let x = 0; x < curX; x ++ ) {
	                  for ( let y = 0; y < curY; y ++ ) {
                        

                              let colorValue = this.data[x][y][z]
                              let hex = this.color.copy(this.lut.getColor(colorValue)).convertSRGBToLinear().getHex()
                              const box = new THREE.Mesh(this.geometry, this.material);
                              box.material = new THREE.MeshBasicMaterial({color: hex})
                              box.position.set((y + 0.5)*yScale, (z + 0.5)*zScale, (x + 0.5)*xScale);
                              this.boxGroup.add(box);
                        }
                  }
            }
            this.scene.add( this.boxGroup );
            this.show()
      }
      addMeshImg(x,y,z,xStep=1,yStep=1,zStep=1,isShow=false){
      	this.clearGroup(this.boxGroup)
      	let maxStep = Math.max(xStep,yStep,zStep)	
  			this.xScale = Math.round(xStep/maxStep*100)/50;
  			this.yScale = Math.round(yStep/maxStep*100)/50;
  			this.zScale = Math.round(zStep/maxStep*100)/50;
  			
//			this.updateLutPanel(x, y, 0, z, temp)
					const textureLoader = new THREE.TextureLoader();
						const textureFront = textureLoader.load('source/image/Z/xmin.png?_t=' + Date.now());
						const textureBack = textureLoader.load('source/image/Z/xmax.png?_t=' + Date.now());
						const textureLeft = textureLoader.load('source/image/Z/zMin.png?_t=' + Date.now());
						const textureRight = textureLoader.load('source/image/Z/zMax.png?_t=' + Date.now());
						const textureUp = textureLoader.load('source/image/Z/rotateMinY.png?_t=' + Date.now());
						const textureDown = textureLoader.load('source/image/Z/rotateMaxY.png?_t=' + Date.now());
  			// 加载纹理
				const materials = [
							new THREE.MeshBasicMaterial({ map: textureBack }), // 后面
						    new THREE.MeshBasicMaterial({ map: textureFront }), // 前面  
						    new THREE.MeshBasicMaterial({ map: textureRight }), // 上面
						    new THREE.MeshBasicMaterial({ map: textureLeft }), // 下面
						    new THREE.MeshBasicMaterial({ map: textureDown }),// 右面
						    new THREE.MeshBasicMaterial({ map: textureUp })// 左面
						    
						    
						    
						];
				if (isShow) {
						this.geometry = new THREE.BoxGeometry( y*this.yScale, z*this.zScale,x*this.xScale)
						// 创建带有不同材质的立方体
						const cube = new THREE.Mesh(this.geometry, materials);
						cube.position.set((y*this.yScale)/2,(z*this.zScale)/2,(x*this.xScale)/2)
						this.boxGroup.add(cube);
				} else{
						const cubeTextureLoader = new THREE.CubeTextureLoader();
						cubeTextureLoader.setCrossOrigin('Anonymous')
						// 创建材质，使用六个图片作为立方体的每一面
					
		  			
		  			
						const materials1 = [
						    new THREE.MeshBasicMaterial({ map: textureBack }), // 后面
						    new THREE.MeshBasicMaterial({ map: textureFront }), // 前面
						    new THREE.MeshBasicMaterial({ map: textureRight }), // 上面
						    new THREE.MeshBasicMaterial({ map: textureLeft }), // 下面
						    new THREE.MeshBasicMaterial({ map: textureDown }),// 右面
						    new THREE.MeshBasicMaterial({ map: textureUp })// 左面
						];
					
					
						this.geometry = new THREE.BoxGeometry( y*this.yScale, z*this.zScale,x*this.xScale)
						const box = new THREE.Mesh(this.geometry, this.material);
			      box.material = new THREE.MeshBasicMaterial({color: 0x000080})
			      box.position.set((y*this.yScale)/2,(z*this.zScale)/2,(x*this.xScale)/2);
			      this.boxGroup.add(box);
				}

				this.scene.add(this.boxGroup);
//    	this.show()
      	setInterval(() => {
	      	window.requestAnimationFrame(this.show)
	      },50);
	      this.addGuiImg(this,x,y,z)
      }
      addPanel(xl,yl,curZ,depth,data,xStep=1,yStep=1,zStep=1){
      			let maxStep = Math.max(xStep,yStep,zStep)
      			
      			let xScale = Math.round(xStep/maxStep*100)/100;
      			let yScale = Math.round(yStep/maxStep*100)/100;
      			let zScale = Math.round(zStep/maxStep*100)/100;
      			
            let temp = [], num = Math.ceil(data.length / yl)
            for (let i = 0; i < num; i++) {
                  temp.push(data.slice(i * yl, (i + 1) * yl))
            }
//          console.log(temp)
            console.log(curZ);
            console.log(this.data)
            this.updateLutPanel(xl, yl, curZ, depth, temp)
            this.addMesh(xl,yl,curZ,data,xStep,yStep,zStep);
      }
      addRow(xArr,yArr,curZ,Z,data,xStep=1,yStep=1,zStep=1){
            //if (z === 0) this.clearGroup(this.boxGroup)
            this.updateLutRow(xArr, yArr, curZ, Z, data)
            let maxStep = Math.max(xStep,yStep,zStep)
      			
      			let xScale = Math.round(xStep/maxStep*100)/100;
      			let yScale = Math.round(yStep/maxStep*100)/100;
      			let zScale = Math.round(zStep/maxStep*100)/100;
      			
      			
      			
            for (let x = 0; x < xArr.length; x++) {
                  let colorValue = data[x]
                  let hex = this.color.copy(this.lut.getColor(colorValue)).convertSRGBToLinear().getHex()
                  const box = new THREE.Mesh(this.geometry, this.material);
                  box.frustumCulled = false
                  box.scale.set(yScale,zScale,xScale);
                  box.material = new THREE.MeshBasicMaterial({color: hex})
                  box.position.set((yArr[0] + 0.5)*yScale, (curZ + 0.5)*zScale, (xArr[x] + 0.5)*xScale);
                  this.boxGroup.add(box);
            }
            this.scene.add(this.boxGroup);
            this.show()

      }
      addGUI(par,x,y,z,data){
            this.gui = new GUI({width:150});
            this.z = z
            //gui调整
            let guiDom = this.gui.domElement
            guiDom.style.position='relative'
            guiDom.style.right='0'
            guiDom.style.bottom='100%'
            guiDom.style.marginRight='0'
            guiDom.style.zIndex = '50'
            guiDom.style.float = 'right'
            this.container.appendChild(guiDom)

            $("div.dg>ul").empty()
            // 裁剪范围参数
            const clipParams = {
                  dir:"",
                  clipX:{
                        minX: 0,
                        maxX: x,
                        updateVisibility: function(){
                              par.boxGroup.children.forEach(child => {
                                    child.visible = (child.position.z >= clipParams.clipX.minX && child.position.z <= clipParams.clipX.maxX);
                              });
                              let arr = par.dataClipping(data,clipParams.dir,clipParams.clipX.minX,clipParams.clipX.maxX,y,z)
                              par.updateHeatMap3D(arr,y,z)
                              par.show()
                        }
                  },
                  clipY:{
                        minY: 0,
                        maxY: y,
                        updateVisibility: function(){
                              par.boxGroup.children.forEach(child => {
                                    child.visible = (child.position.x >= clipParams.clipY.minY && child.position.x <= clipParams.clipY.maxY);
                              });
                              let arr = par.dataClipping(data,clipParams.dir,clipParams.clipY.minY,clipParams.clipY.maxY,x,z)
                              par.updateHeatMap3D(arr,x,z)
                              par.show()
                        }
                  },
                  clipZ:{
                        minZ: 0,
                        maxZ: z,
                        updateVisibility: function(){
                              par.boxGroup.children.forEach(child => {
                                    child.visible = child.position.y >= clipParams.clipZ.minZ && child.position.y <= clipParams.clipZ.maxZ;
                              });
                              let arr = par.dataClipping(data,clipParams.dir,clipParams.clipZ.minZ,clipParams.clipZ.maxZ,x,y)
                              par.updateHeatMap3D(arr,x,y)
                              par.show()

                        }
                  },
            };
            let clipMin,clipMax
            this.gui.add(new function () {
                this.saveScene = function () {
                    let link = document.createElement('a');
                    let canvas = par.renderer.domElement
                    link.href = canvas.toDataURL('image/png')
                    link.download = "mapping3D.png"
                    link.click()
                }
            },"saveScene").name('download')
          this.gui.add(clipParams,"dir",["X","Y","Z"]).onChange((dir)=>{
              this.clipParam.startX = 0
              this.clipParam.startY = 0
              this.clipParam.startZ = 0
              this.clipParam.endX = x-1
              this.clipParam.endY = y-1
              this.clipParam.endZ = z-1


              if(clipMin!==undefined){par.gui.remove(clipMin);par.gui.remove(clipMax)}
              switch (dir) {
                  case "X":{
                      clipMin=this.gui.add(clipParams.clipX, 'minX', 0,x-1).step(1).onChange(clipParams.clipX.updateVisibility);
                      clipMax=this.gui.add(clipParams.clipX, 'maxX', 1, x).step(1).onChange(clipParams.clipX.updateVisibility);
                  }break
                  case "Y":{
                      clipMin=this.gui.add(clipParams.clipY, 'minY', 0,y-1).step(1).onChange(clipParams.clipY.updateVisibility);
                      clipMax=this.gui.add(clipParams.clipY, 'maxY', 1, y).step(1).onChange(clipParams.clipY.updateVisibility);
                  }break
                  case "Z":{
                      clipMin=this.gui.add(clipParams.clipZ, 'minZ', 0,z-1).step(1).onChange(clipParams.clipZ.updateVisibility);
                      clipMax=this.gui.add(clipParams.clipZ, 'maxZ', 1, z).step(1).onChange(clipParams.clipZ.updateVisibility);
                  }break
              }
          })
      }
      addGuiImg(par,x,y,z){
      		// 创建GUI
					par.gui = new GUI({width:150});
										// 将控制器添加到GUI
					let clipMin,clipMax
					let guiDom = par.gui.domElement
	        guiDom.style.position='relative'
	        guiDom.style.right='0'
	        guiDom.style.bottom='100%'
	        guiDom.style.marginRight='0'
	        guiDom.style.zIndex = '50'
	        guiDom.style.float = 'right'
	        par.container.appendChild(guiDom)
					
					// 创建控制器对象
					par.params.maxX=x
					par.params.maxY=y
					par.params.maxZ=z
					let ischangeMin = false;
					let ischangeMax = false;
					par.params.change=function(dom,axisName,type,val){
							par.params.axisName=axisName
							par.params.type=type
							if (axisName==="X") {
									if (type===0) {
											clipMax.setValue(x)
									} else{
											clipMin.setValue(0);
									}
							} else if(axisName==="Y"){
									if (type===0) {
											clipMax.setValue(y)
									} else{
											clipMin.setValue(0);
									}
							}else{
									if (type===0) {
											clipMax.setValue(z)
									} else{
											clipMin.setValue(0);
									}
							}
					}
					// 定义一个更新几何体的函数，并使用防抖机制
//					const updateGeometryDebounced = this.debounce(this.updateGeometry(this), 200); // 200毫秒的延
//					const updateGeometryDebounced1 = this.debounce(1, 200); // 200毫秒的延

					par.gui.add(par.params,'dir',['X','Y','Z']).onChange(function (dir) {
					    if(clipMin!==undefined){par.gui.remove(clipMin);par.gui.remove(clipMax)}
					    par.params.minX=0
							par.params.minY=0
							par.params.minZ=0
					    par.params.maxX=x
							par.params.maxY=y
							par.params.maxZ=z
//							par.updateGeometry();
							mapping.updateMapping3DByteSize(par.params)
					    switch (dir) {
					        case "X":{
					            clipMin = par.gui.add(this.object, 'minX', 0, x-2).step(1).onChange(function(val){
					            	
					            	if(ischangeMin) par.params.change(this,"X",0,val);
					            });
					           
					            clipMax = par.gui.add(this.object, 'maxX', 2, x  ).step(1).onChange(function(val){
					            	if(ischangeMax) par.params.change(this,"X",1,val);
					            });
					            $(clipMin.domElement).parents("li.cr").mousedown(function(){ischangeMin=true});
					            $(clipMin.domElement).parents("li.cr").mouseup(function(){
						            	ischangeMin=false
//						            	par.updateGeometry()
													mapping.updateMapping3DByteSize(par.params)
					            });
					            $(clipMax.domElement).parents("li.cr").mousedown(function(){ischangeMax=true});
					            $(clipMax.domElement).parents("li.cr").mouseup(function(){
						            	ischangeMax=false
						            	mapping.updateMapping3DByteSize(par.params)
					            });
					        }break
					        case "Y":{
					            clipMin = par.gui.add(this.object, 'minY', 0, y-2).step(1).onChange(function(val){
					            	if(ischangeMin) par.params.change(this,"Y",0,val);
					            });
					            clipMax = par.gui.add(this.object, 'maxY', 2, y  ).step(1).onChange(function(val){
					            	if(ischangeMax) par.params.change(this,"Y",1,val);
					            });
					            $(clipMin.domElement).parents("li.cr").mousedown(function(){ischangeMin=true});
					            $(clipMin.domElement).parents("li.cr").mouseup(function(){
					            		ischangeMin=false
					            		mapping.updateMapping3DByteSize(par.params)
					            });
					            $(clipMax.domElement).parents("li.cr").mousedown(function(){ischangeMax=true});
					            $(clipMax.domElement).parents("li.cr").mouseup(function(){
					            		ischangeMax=false
					            		mapping.updateMapping3DByteSize(par.params)
					            });		
					        }break
					        case "Z":{
					            clipMin = par.gui.add(this.object, 'minZ', 0, z-2).step(1).onChange(function(val){
					            	if(ischangeMin) par.params.change(this,"Z",0,val);
					            });
					            clipMax = par.gui.add(this.object, 'maxZ', 2, z  ).step(1).onChange(function(val){
					            	if(ischangeMax) par.params.change(this,"Z",1,val);
					            });
					            $(clipMin.domElement).parents("li.cr").mousedown(function(){ischangeMin=true});
					            $(clipMin.domElement).parents("li.cr").mouseup(function(){
					            		ischangeMin=false
					            		mapping.updateMapping3DByteSize(par.params)
					            });
					            $(clipMax.domElement).parents("li.cr").mousedown(function(){ischangeMax=true});
					            $(clipMax.domElement).parents("li.cr").mouseup(function(){
					            		ischangeMax=false
					            		mapping.updateMapping3DByteSize(par.params)
					            });
					        }break
					    }
					    
					})
      }
      
      updateGeometry(fileNames) {
//			    this.geometry.dispose(); // 释放旧的几何体
			    this.clearGroup(this.boxGroup)
			     // 创建新的几何体
			    const textureLoader = new THREE.TextureLoader();
					const textureFront = textureLoader.load('source/image/Z/'+fileNames[2]+'?_t=' + Date.now());
					const textureBack = textureLoader.load('source/image/Z/'+fileNames[3]+'?_t=' + Date.now());
					const textureLeft = textureLoader.load('source/image/Z/'+fileNames[0]+'?_t=' + Date.now());
					const textureRight = textureLoader.load('source/image/Z/'+fileNames[1]+'?_t=' + Date.now());
					const textureUp = textureLoader.load('source/image/Z/'+fileNames[4]+'?_t=' + Date.now());
					const textureDown = textureLoader.load('source/image/Z/'+fileNames[5]+'?_t=' + Date.now());
	  			
	  			const materials = [
							new THREE.MeshBasicMaterial({ map: textureBack }), // 后面
					    new THREE.MeshBasicMaterial({ map: textureFront }), // 前面  
					    new THREE.MeshBasicMaterial({ map: textureRight }), // 上面
					    new THREE.MeshBasicMaterial({ map: textureLeft }), // 下面
					    new THREE.MeshBasicMaterial({ map: textureDown }),// 右面
					    new THREE.MeshBasicMaterial({ map: textureUp })// 左面
					];
			    this.geometry = new THREE.BoxGeometry((this.params.maxY-this.params.minY)*this.yScale 
			    	,(this.params.maxZ-this.params.minZ)*this.zScale
			    	,(this.params.maxX-this.params.minX)*this.xScale)
//			    this.material = materials
			    const cube = new THREE.Mesh(this.geometry, materials);
			    cube.position.set(((this.params.maxY+this.params.minY)*this.yScale)/2
			    	,((this.params.maxZ+this.params.minZ)*this.zScale)/2
			    	,((this.params.maxX+this.params.minX)*this.xScale)/2)
			    this.boxGroup.add(cube);
			    this.scene.add(this.boxGroup);
			}
			updateGeometry1() {
			    cube.geometry.dispose(); // 释放旧的几何体
			    let w,h,d,m,pw,ph,pd
			    switch (params.dir) {
			        case "X":{
			            m = params.minX
			            w = depth-params.minX
			            h = params.maxY
			            d = params.maxZ
			            pw= w/2+m
			            ph=params.maxY/2
			            pd=params.maxZ/2
			        }break
			        case "Y":{
			            m = params.minY
			            w = params.maxX
			            h = width-params.minY
			            d = params.maxZ
			            ph= h/2+m
			            pw=params.maxX/2
			            pd=params.maxZ/2
			        }break
			        case "Z":{
			            m = params.minZ
			            w = params.maxX
			            h = params.maxY
			            d = height-params.minZ
			            pd= d/2+m
			            pw=params.maxX/2
			            ph=params.maxY/2
			        }break
			    }
			    // 创建新的几何体
			    console.log(w,h,d,m,pw,ph,pd)
			    cube.geometry = new THREE.BoxGeometry(h, d, w)
			    if(m===0)return  cube.position.set(params.maxY/2,params.maxZ/2,params.maxX/2)
			    cube.position.set(ph,pd,pw)
			}

      // 防抖函数实现
			debounce(func, wait) {
					setTimeout(()=> func(),wait);
//			    let timeout;
//			    return function(...args) {
//			        clearTimeout(timeout);
//			        timeout = setTimeout(() => func.apply(this, args), wait);
//			    };
		  }
      clearScene() {
            if(this.scene!==undefined){
                  this.scene.traverse((child) => {
                        if (child.material) {
                              child.material.dispose();
                        }
                        if (child.geometry) {
                              child.geometry.dispose();
                        }
                        child = null;
                  });
                  this.scene.clear();
            }
            if(this.uiScene!==undefined){
                  this.uiScene.traverse((child) => {
                        if (child.material) {
                              child.material.dispose();
                        }
                        if (child.geometry) {
                              child.geometry.dispose();
                        }
                        child = null;
                  });
                  this.scene.clear();
            }
            if(this.renderer!==undefined){
                  this.renderer.forceContextLoss();
                  this.renderer.dispose();
                  this.renderer.domElement = null;
            }
            this.flows = [];
            this.scene = null;
            this.camera = null;
            this.controls = null;
            this.renderer = null;
            $("#"+this.dom).empty()
            console.log('clearScene');
      }
      clearGroup(group) {
            const clearCache = (item) => {
            			
                  item.geometry.dispose();
                  if (item.material.length>0) {
                  	for (var i=0;i<item.material.length;i++) {
                  		item.material[i].dispose();
                  	}
                  	item.material=[];
                  }else{
                  	item.material.dispose();
                  }
                  
            };
            const removeObj = (obj) => {
                  let arr = obj.children.filter((x) =>!! x);
                  arr.forEach((item) => {
                        if (item.children.length) {
                              removeObj(item);
                        } else {
                              clearCache(item);
                              item.clear();
                        }
                  });
                  obj.clear();
                  arr = null;
            };
            removeObj(group);
      }
      //数据截取
      dataClipping(arr,dir,start,end,c,r){
            let s = start,e=end
            this.clipParam.s = s;this.clipParam.e = e
            if(start===0) {
                  s = end-1;
                  e = end
            }else{
                  if((end-start)>1) s=start;e=start+1
            }
            let sliced = [];
            this.clipParam.dir = dir
            switch (dir) {
                  case "X":{
                        let xTemp = arr.slice(s, e)
                        let yTemp = xTemp.map(col=>col.slice(0,c)).flat()
                        sliced = yTemp.map(layer=>layer.slice(0,r))
                        this.clipParam.startX =parseInt(s)
                        this.clipParam.endX = parseInt(e)
                  }break
                  case "Y":{
                        let xTemp = arr.slice(0, c)
                        let yTemp = xTemp.map(col=>col.slice(s,e)).flat()
                        sliced = yTemp.map(layer=>layer.slice(0,r))
                        this.clipParam.startY = parseInt(s)
                        this.clipParam.endY = parseInt(e)
                  }break
                  case "Z":{
                        let xTemp = arr.slice(0,c)
                        let yTemp = xTemp.map(layer=>layer.slice(0,r))
                        sliced = yTemp.map(layer=>layer.map(layer=>layer.slice(s,e)).flat())
                        this.clipParam.startZ = parseInt(s)
                       this.clipParam.endZ = parseInt(e)
                       this.z = s
                  }break

            }
            return sliced;
      }
      addLabel( name, location,rotate) {
            const textGeo = new TextGeometry(name, {
                  font: this.font,
                  size: 0.5,
                  depth: 0,
                  curveSegments: 20,
            });

            const textMaterial = new THREE.MeshBasicMaterial();
            const textMesh = new THREE.Mesh(textGeo, textMaterial);
            textMesh.position.copy(location);
            if (rotate !== undefined) textMesh.rotateX(rotate)

            return textMesh
      }
      onWindowResize=()=>{
            this.perCamera.aspect = this.width / this.height;
            this.perCamera.updateProjectionMatrix();

            this.renderer.setSize(this.width, this.height);

            // insetWidth = window.innerHeight / 4; // square
            // insetHeight = window.innerHeight / 4;
            // console.log(insetWidth,insetHeight)
            //
            // camera2.aspect = insetWidth / insetHeight;
            // camera2.updateProjectionMatrix();

      }
      show=()=>{
            
            this.renderer.clear()
            this.renderer.render( this.scene, this.perCamera );
            this.renderer.render(this.uiScene,this.orthoCamera)
            this.stats.update()
//          animate();
      }
      
      
}
export {myThreeJS}