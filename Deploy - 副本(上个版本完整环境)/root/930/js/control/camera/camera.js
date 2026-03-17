camera = new class{
    lenName = 0;
    bAWBState=false;
    camBase = '';
    //初始化相机
    initCamera(flag){
        $("#regionAreaDiv").prop("hidden",flag)
        $("#edtCk").prop("disabled",!device.dT.isConnected)
        this.updateLens()
    }
    //显示相机配置
    showCamera() {
        let tag = $("#cameraDiv")

        let cpsCK = $("#cpsCK").prop("checked")
        let seCK = $("#sECK").prop("checked")
        let edtCk = $("#edtCk").prop("checked")
        let scCK  = $("#scCK").prop("checked")
        let index = tag.parents('.jeBox-wrap').attr("id")
        let w  = (cpsCK||seCK||edtCk||scCK)?'1090':"740"
        $("#"+index).css("width",w)
        $("#"+index+" .jeBox-content").css("width",w)
        tag.css("width",w-10)
        $("#cameraDiv3").prop("hidden",!(cpsCK||seCK||edtCk||scCK))
        $("#cps").prop("hidden",!cpsCK)
        $("#shotEdit").prop("hidden",!seCK)
        $("#edt").prop("hidden",!edtCk)
        $("#shortBD").prop('hidden',!scCK)
        if (seCK) this.editLens()
        if(cpsCK)this.MCECameraGetParam()
        if (edtCk) {
            setTimeout(function(){
                dt.readDtPos(0);
            },100);
            setTimeout(function(){
                dt.readDtPos(1);
            },200);
            setTimeout(function(){
                dt.readDtPos(2);
            },300);
        }
        this.showLine()
        this.showCrossCursor()
    }
    //显示十字光标
    showCrossCursor() {
        let ck = $("#showCC").prop("checked")
        let [crossH,crossV] = [$("#crossH"),$("#crossV")]
        crossH.prop("hidden",!ck)
        crossV.prop("hidden",!ck)
    }
    //显示画线
    showLine() {
        let [area,line,box] = [$("#cameraDiv1"),$("#drawLine"),$("#drawBox")]
        //let ck = $("#startCalibration").prop("checked")
        let ck = $("#scCK").prop("checked")
        $("#regionArea").prop('disabled',ck)
        $("#calibrateLength").prop("disabled",!ck)
        line.prop("hidden",!ck)
        $("#boxColor").prop("hidden",!ck)
        area.css("cursor",ck?"crosshair":"auto");
        if(ck){
            draws.drawType = true
        	draws.drawsPic(area,line,box)
        }
        
    }
    //显示画框
    showBox(){
        let [area,line,box] = [$("#cameraDiv1"),$("#drawLine"),$("#drawBox")]
        let ck = $("#regionArea").prop("checked")
        $("#startCalibration").prop('disabled',ck)
        box.prop("hidden",!ck)
        $("#boxColor").prop("hidden",!ck)
        area.css("cursor",ck?"crosshair":"auto");
        if(ck){
            draws.drawType = false
        	draws.drawsPic(area,line,box)
        }
        
    }
    //图像控制
    cameraCroller(dom){
    	var isChecked = $(dom).get(0).checked;
    	let [clickArea,line,box] = [$("#cameraDiv1"),$("#drawLine"),$("#drawBox")]
    	if(isChecked){
    		draws.moveCamera(clickArea)
    	}
    }
    //标定
    calibration(){
        fConfig.lensConf.forEach(cur=>{
            let temp =$("#lensName1").val();
            if (cur.name === temp){
                let length = Number($("#calibrateLength").val())
                let width = Number($("#drawLine").width())
                let scale = width/length
                $("#showScale").width(cur.size*scale)
                cur.scale = scale
                draws.scSize = cur.size*scale
		        websocket.send(funcCode.SetLensParams,cur)
            }
        })
    }
    /**
     * 画图
     * @param {document} canvas        canvasDom树
     * @param {Object}   imgData        图片数据 
     * @param {Object}   width        标尺宽度
     * @param {Object}   val        标尺显示数值
     * @param {Boolean}  boxChecked 是否画上框
     * @param {inter}           left        框左
     * @param {inter}           top        框上
     * @param {inter}    w                框宽度
     * @param {inter}    H                框高度
     * @param {Boolean}  crossChecked 是否画上十字光标
     */
    drawCanvas(canvas,imgdom,width,val,boxChecked,left,top,w,h,crossChecked){
        var imgWidth = $(imgdom).width();
        var imgHeight = $(imgdom).height();
        var ctx=canvas.getContext("2d");
        ctx.clearRect(0,0,imgWidth,imgHeight);
        ctx.drawImage(imgdom,0,0,imgWidth,imgHeight);
        ctx.strokeStyle = "#FFFFFF";
        ctx.moveTo(imgWidth-5,imgHeight-12-5);
        ctx.lineTo(imgWidth-5,imgHeight-5);
        ctx.lineTo(imgWidth-5-width,imgHeight-5);
        ctx.lineTo(imgWidth-5-width,imgHeight-12-5);
		if (boxChecked) {
			ctx.moveTo(left,top);
	        ctx.lineTo(left,top+h);
	        ctx.lineTo(left+w,top+h);
	        ctx.lineTo(left+w,top);
	        ctx.lineTo(left,top);
		}
        if (crossChecked) {
			ctx.moveTo(imgWidth/2-5,imgHeight/2);
	        ctx.lineTo(imgWidth/2+5,imgHeight/2);
	        ctx.moveTo(imgWidth/2,imgHeight/2-5);
	        ctx.lineTo(imgWidth/2,imgHeight/2+5);
		}

        ctx.stroke();
        ctx.fillStyle = "#FFFFFF";
        ctx.font="14px Verdana";
        var sText = val;
        ctx.fillText(sText,imgWidth-13-10*sText.length,imgHeight-10);
    }
    
    //保存图片
    saveImage(imgData){
		if($("div#regionAreaDiv").prop("hidden")){
			$("div#cameraDiv1").append("<canvas id='showImgAndLine' class='je-hide' width='"+$("img#cameraImg").width()+"' "
                +"height='"+$("img#cameraImg").height()+"'></canvas>");
		}else{
			$("div#mappingImg").append("<canvas id='showImgAndLine' class='je-hide' width='"+$("img#cameraImg").width()+"' "
                +"height='"+$("img#cameraImg").height()+"'></canvas>");
		}
		
        
        var canvas = $("canvas#showImgAndLine").get(0);
        this.drawCanvas(
            canvas,
            $("img#cameraImg").get(0),
            $("div#showScale").width(),
            $("span#lensSize").text(),
            $("#regionArea").prop("checked"),
            $("div#drawBox").position().left,
            $("div#drawBox").position().top,
            $("div#drawBox").width(),
            $("div#drawBox").height(),
        	$("#showCC").prop("checked"));
        var imgsDataB = canvas.toDataURL("image/png ");
        $("a#saveImge").attr("href",imgsDataB);
        $(canvas).detach();
        setTimeout(function(){
            $("a#saveImge").click();
        },1000);
    }
    //更新镜头
    updateLens(){
        let lens1 = $("#lensName1")
        lens1.empty();
        if (fConfig.lensConf === undefined) return
        fConfig.lensConf.forEach(cur=>{
            lens1.append("<option>"+cur.name)
            let temp =lens1.val();
            if (cur.name === temp) {
                $("#lensSize").text(cur.size+"μm")
                $("#showScale").width(cur.size*cur.scale)
                draws.scSize = cur.size*cur.scale
                draws.scTxt = cur.size+"μm"
            }
        })
        this.lenName = lens1.val()
    }
    //添加镜头
    addLens(){
        let newLens = $("#newLens").val()
        if(newLens==='') return jeBox.msg($.i18n.prop('tips-camera-lenAdd'),{icon:1})
        let lensSize = parseInt($("#newLensSize").val())
        if(isNaN(lensSize)) return jeBox.msg($.i18n.prop('tips-camera-lenSize'),{icon:1})
        let scale = 0.1
        let data = {"name":newLens,"scale":scale,"size":lensSize}
        websocket.send(funcCode.SetLensParams,data)
        main.setCallbacks(funcCode.SetLensParams,rev=>{
            let flag=false,index=0
            fConfig.lensConf.forEach((cur,idx)=>{
                if(cur.name === newLens) {
                    flag=true
                    index=idx
                }
            })
            if(flag){ //修改
                fConfig.lensConf[index].name = newLens
                fConfig.lensConf[index].size = lensSize
                this.switchLens()
            }else { //添加
                $("#lensName1").append("<option>"+newLens)
                $("#lensName2").append("<option>"+newLens)
                fConfig.lensConf.push(data)
            }
        })
    }
    //切换镜头
    switchLens(){
        let name = $("#lensName1").val()
        camera.lenName = name
        fConfig.lensConf.forEach(cur=>{
            if(cur.name === name){
                $("#lensSize").text(cur.size+"μm")
                console.log(cur.size*cur.scale)
                $("#showScale").width(cur.size*cur.scale)
                main.selectCamera=cur;
                draws.scSize = cur.size*cur.scale
                draws.scTxt = cur.size+"μm"
            }
        })
    }
    //镜头编辑
    editLens(){
        let lens2 = $("#lensName2")
        lens2.empty();
        fConfig.lensConf.forEach(cur=>{lens2.append("<option>"+cur.name)})
    }
    //删除镜头
    deleteLens(){
        let lensName = $("#lensName2").val()
        websocket.send(funcCode.DeleteLensParams, {name:lensName})
        main.setCallbacks(funcCode.DeleteLensParams,rev=>{
            $("#lensName2 option").each(function () {
                if ($(this).text() === lensName) {
                    $(this).remove()
                }
            })
            $("#lensName1 option").each(function () {
                if ($(this).text() === lensName) {
                    $(this).remove()
                }
            })
            let index = 0
            fConfig.lensConf.forEach((cur,idx)=>{
                if(cur.name === lensName) index = idx
            })
            fConfig.lensConf.splice(index,1)
        })
    }
    //更新白光图像
    updateWhiteImg(rev){
        let img = document.getElementById('cameraImg');
        if ([null, undefined].includes(img)) return
//      img.style.pointerEvents = "none"
        this.camBase = rev.getImgdata()
//      img.src = 'data:image/jpg;base64,' + this.camBase;
        $("img#cameraImg").attr("src",'data:image/jpg;base64,' + this.camBase);
        window.sessionStorage.clear();
    }
    //设置相机伽马
    MCECameraSetGamama(gama){
        websocket.send(funcCode.MCECameraSetGamama,{"gama":gama})
    }
    //设置相机对比度
    MCECameraSetRatio(contrast){
        websocket.send(funcCode.MCECameraSetRatio,{"contrast":contrast})
    }
    //设置相机色彩增强
    MCECameraSetEnhanceColor(bEnhancement){
        websocket.send(funcCode.MCECameraSetEnhanceColor,{"bEnhancement":bEnhancement})
    }
    //设置相机水平镜像
    MCECameraSetHoriaotalMirror(pos,bMirror){
        websocket.send(funcCode.MCECameraSetHoriaotalMirror,{"pos":pos,"bMirror":bMirror})
        device.camera.mirrorPos = bMirror?-1.0:1.0
    }
    //设置相机色彩饱和度
    MCECameraSetSaturation(nSaturation){
        websocket.send(funcCode.MCECameraSetSaturation,{"nSaturation":nSaturation})
    }
    //设置相机自动曝光
    MCECameraSetAeState(bAeState){
        websocket.send(funcCode.MCECameraSetAeState,{"bAeState":bAeState})
    }
    //设置相机增益
    MCECameraSetAnalogGain(nAnalogGain){
        websocket.send(funcCode.MCECameraSetAnalogGain,{"nAnalogGain":nAnalogGain})
    }
    //设置相机手动白平衡（红绿蓝）
    MCECameraSetGain(){
        let [nr,ng,nb] = [Number($("#nR").val()),Number($("#nG").val()),Number($("#nB").val())]
        websocket.send(funcCode.MCECameraSetGain,{"nR":nr,"nG":ng,"nB":nb})
    }
    //设置相机自动白平衡
    MCECameraSetAWBState(){
        this.bAWBState = !this.bAWBState
        $("#nR").prop('disabled',this.bAWBState)
        $("#nG").prop('disabled',this.bAWBState)
        $("#nB").prop('disabled',this.bAWBState)
        $("#autoBalance")[this.bAWBState?'addClass':'removeClass']('btn-info')
        websocket.send(funcCode.MCECameraSetAWBState,{"bAWBState":this.bAWBState})
    }
    //设置相机曝光时间
    MCECameraSetTime(nTime){
        websocket.send(funcCode.MCECameraSetTime,{"nTime":nTime})
    }
    //获取相机参数
    MCECameraGetParam(){
        websocket.send(funcCode.MCECameraGetParam,{})
        main.setCallbacks(funcCode.MCECameraGetParam,rev=>{
            let camareJson = JSON.parse(rev.getCameraparam());
			this.bAWBState = camareJson["isAWBState"];
            device.camera.mirrorPos = camareJson["isHorizontal"]?-1.0:1.0;
			$("div#cps input.gamma").val(camareJson["gamma"]);
			$("div#cps input.contrastRatio").val(camareJson["contrastRatio"]);
			$("div#cps input.saturation").val(camareJson["saturation"]);
			$("div#cps input.enhanceColor").prop("checked",camareJson["isEnhanceColor"]);
			$("div#cps input.horizontal").prop("checked",camareJson["isHorizontal"]);
			$("div#cps input.aeState").prop("checked",camareJson["isAeState"]);
			$("div#cps input.analogGain").val(camareJson["analogGain"]);
			$("div#cps input.time").val(camareJson["time"]);
			$("div#cps input.rVal").val(camareJson["rVal"]);
			$("div#cps input.gVal").val(camareJson["gVal"]);
			$("div#cps input.bVal").val(camareJson["bVal"]);

			/*更新白平衡状态*/
            $("#nR").prop('disabled',this.bAWBState)
            $("#nG").prop('disabled',this.bAWBState)
            $("#nB").prop('disabled',this.bAWBState)
            $("#autoBalance")[this.bAWBState?'addClass':'removeClass']('btn-info')
        })
    }
    //设置相机参数
    MCECameraSetParam(){
        websocket.send(funcCode.MCECameraSetParam,{"sParam":3})
    }

}()