mapping = new class {
    heatmap = {}
    mappingChart = {}
    #data = []
    mLegend = ''
    col = 0
    row = 0
    xW = 0
    yH = 0
    xC = 0
    yC = 0
    fileUnits = "nm"
    dLaserWave = 532.0
    dtPosX = 0
    dtPosY = 0
    scanMinx = 0
    scanMaxX = 0
    scanMinY = 0
    scanMAxY = 0
    dimensions=false //false 2D true 3D
    mapping3D=undefined
    mappingMap={}
    savePath3D=''
    curZ =0
	
    switchDimensions(){
//      this.dimensions = !this.dimensions
        console.log(this.dimensions)
        if(this.dimensions)
        {
            $("#switchBtn span").text('3D')
            $("#switchBtn i").removeClass('fa-toggle-off').addClass('fa-toggle-on')
            $('#mappingDiv5').prop('hidden',true)
            $("#mappingDiv7").addClass('d-flex').removeClass('d-none')
//          $("#sAZAixs").prop('hidden',false)
            $("#mMSCZ").prop('hidden',false)
            $("#mapping3dBtn").prop('hidden',false)//3维显示按钮
            $("#mapping2dBtn").prop('hidden',true)//3维隐藏2维按钮
            $("#mappingCamera").prop('hidden',true)
            $("#mapping3D").empty()
            this.creat3D()
            this.creat3DHeatMap()
            $("div#sAStep").prop('hidden',true);
            $("div#sBStep").prop('hidden',false);

        }else{
            $("#switchBtn span").text('2D')
            $("#switchBtn i").addClass('fa-toggle-off').removeClass('fa-toggle-on')
            $("#mappingDiv7").removeClass('d-flex').addClass('d-none')
//          $("#sAZAixs").prop('hidden',true)
            $("#mMSCZ").prop('hidden',true)
            $("#mapping3dBtn").prop('hidden',true)//2维隐藏三维按钮
            $("#mapping2dBtn").prop('hidden',false)//2维显示2维按钮
            $("#mappingCamera").prop('hidden',false)
            $("#mapping3D").empty()
            $('#mappingDiv5').prop('hidden',false)
            $("div#sAStep").prop('hidden',false);
            $("div#sBStep").prop('hidden',true);
        }
        //模式切换清空所有3维2维数据
        this.removeAll()
        this.removeAllLine()
    }
    creat3D(){
         const modulePath='../threeJS/myThreeJS.js'
        import(modulePath)
            .then(module => {
               this.mapping3D= new module.myThreeJS('mapping3D');// 调用myModule中的函数
               this.mapping3D.init3D('mapping3D')
                /*myThreeJS.init3D('mapping3D',21);*/
            })
            .catch(err => {
                console.error('Module loading failed:', err);
            });
    }
    creat3DHeatMap(){
        this.mappingMap = new heatmapXY('mappingMap')
        this.mappingMap.initLut('mappingMapLut')
        this.mappingMap.base().onSeriesBackgroundMouseDoubleClick((event) => {
            let nearest = event.solveNearest();
            if (nearest) {
                let x  = Math.round(nearest.location['x']);
                let y  = Math.round(nearest.location['y']);
                this.showLine(x,y)
            }
        })
    }

    initMapping() {
        $(".jeBox-maxbtn").click()
        this.heatmap = new heatmapXY('mappingHot')
        this.heatmap.initLut('mappingLut')
        this.mappingChart = new chart_xy('mappingChart')
        this.mappingChart.set_axis_x_title($.i18n.prop('main-chart-xTitle'+(fConfig.waveunit==='nm'?1:2)))
        this.mappingChart.set_axis_y_title($.i18n.prop('main-chart-yTitle'))
        this.mLegend = new legend()
        this.mLegend.initLegend('mappingLegend',main,this.mappingChart)
        this.showDP(0)
        let gratingNum = 0;
        if($("#steadyGrating").length==1){
            gratingNum =$("#steadyGrating").get(0).selectedIndex+1;
        }else{
            gratingNum =$("#waveGrating").get(0).selectedIndex+1;
        }
        if (fConfig.excwave==="空"||gratingNum==0) {
            this.dLaserWave=fConfig.excwaveselect[0].E;
        } else{
            fConfig.excwaveselect.forEach((cur)=>{
                if(cur.name === fConfig.excwave){
                    this.dLaserWave=cur["grating"+gratingNum];
                }
            })
        }
        this.updateParam()
        this.heatmap.base().onSeriesBackgroundMouseDoubleClick((event) => {
            let nearest = event.solveNearest();
            if (nearest) {
                let x  = Math.round(nearest.location['x']);
                let y  = Math.round(nearest.location['y']);
                this.showLine(x,y)
            }
        })
        this.updateMappingTips()
        main.translate(undefined)
    }
    //开始mapping
    startMapping() {
        let btn = $("#startMapping")
        let btnSrc =  $("#startMapping img")
        let bar1 =  $("#mProgress1 .progress-bar")
        $("#mProgress2").css("background-color",'#007bff')
        bar1.css('width','0%')
        bar1.text("0%");
        let data = {}
        let name = 'L-' + new Date().Format('HH:mm:ss')
        let idx = $('#mStrMode').get(0).selectedIndex
        data.wavelen = parseFloat($('#mCenWave').attr("nm"))
        data.unit = 'nm'
        this.fileUnits = "nm"
        let gratingNum = 0;
        if($("#steadyGrating").length==1){
            gratingNum =$("#steadyGrating").get(0).selectedIndex+1;
        }else{
            gratingNum =$("#waveGrating").get(0).selectedIndex+1;
        }
        if (fConfig.excwave==="空"||gratingNum==0) {
            this.dLaserWave=fConfig.excwaveselect[0].E;
        } else{
            fConfig.excwaveselect.forEach((cur)=>{
                if(cur.name === fConfig.excwave){
                    this.dLaserWave=cur["grating"+gratingNum];
                }
            })
        }
        data.ExpTime = parseFloat($('#mExpTime').val())
        data.slit = parseInt($('#mSlit').val())
        data.times = parseInt($('#mAcc').val())
        data.strmode = $('#mStrMode option:selected').attr('dataType')
        data.dWave0 = 0
        data.dWave1 = 0
        switch (idx) {
            case 0: {
                data.dWave1 = parseFloat($('#dWave1').attr("nm"))
            }
                break
            case 1:
            case 3: {
                data.dWave0 = parseFloat($('#dWave0').attr("nm"))
                data.dWave1 = parseFloat($('#dWave2').attr("nm"))
            }
                break
        }
		
		data.XCenterPos = parseFloat($('#mXCp').val())
		data.XLength = $("#mXCheckbox").get(0).checked?parseFloat($('#mXL').val()):0
		data.xStep = parseFloat($("input#mXStep").val())

		data.YCenterPos = parseFloat($('#mYCp').val())
    	data.YLength = $("#mYCheckbox").get(0).checked?parseFloat($('#mYL').val()):0
    	data.yStep = parseFloat($("input#mYStep").val())

		data.zCenterPos = parseFloat($("#mZCp").val())
        data.zLength = $("#mZCheckbox").get(0).checked?parseFloat($("#mZL").val()):0
        data.zStep = parseFloat($("input#mZStep").val())

        data.PointNumX = 5
        data.PointNumY = 5
        data.stepMode = 0
        data.PointNumZ = 5
		
        let arr = Object.values(data)
        arr.splice(1,1)
        arr.splice(4,1)
        for (let i = 0; i < arr.length; i++) {
            if(isNaN(arr[i])) return jeBox.msg($.i18n.prop('tips-scan-paramNAN'),{icon:1})
        }
        if (btnSrc.attr('alt') === '1') return this.stopMapping()

        if(this.dimensions){
	
	        let suc = function () {
	            main.getSavefilePathPram()
	            $("div.fileType select").val(".hdr");
	            $("div .fileType select option[value='.txt']").hide()
	            $("div .fileType select option[value='.png']").hide()
	            $("div .fileType select option[value='.jpg']").hide()
	            $("div .fileType select option[value='.csv']").hide()
	        }
	        let end = function(){
	            if (main.isOpenChecked) {
	                main.isOpenChecked = false;
	                data.savePath3D= main.openFilePath
	
	                websocket.send(funcCode.commandRunMapD,data)
	
	                btnSrc.attr('src','source/image/stop.png')
	                btnSrc.attr('alt','1')
	                btn.attr('title',$.i18n.prop('popup-mapping-stopBtn'))
	
	                mapping.curZ = Math.floor(0.5 + data.zLength / data.step) + 1;
	                mapping.col = data.XLength;mapping.row = data.YLength
	                mapping.mapping3D.clearGroup(mapping.mapping3D.boxGroup)
	                mapping.mapping3D.clearScene()
	                mapping.mapping3D.init3D('mapping3D')
	                let xnum = Math.floor(data.XLength/data.xStep+0.5)+1;
	                let ynum = Math.floor(data.YLength/data.yStep+0.5)+1;
	                let znum = Math.floor(data.zLength/data.zStep+0.5)+1;
	                mapping.mapping3D.addAxis(xnum,ynum,znum,data.xStep,data.yStep,data.zStep)
	            }
	        }
	        main.exportFilePath(suc,end)
	        return

        }
        //if ($('#mappingImg').prop('hidden')) return
        if(typeof mapping.mapping3D !== 'undefined'){
        	mapping.mapping3D.clearGroup(mapping.mapping3D.boxGroup)
	        mapping.mapping3D.clearScene()
	        mapping.mapping3D.init3D('mapping3D')
        }
        /**let bCheckedList = [$("#mXCheckbox").get(0).checked,$("#mYCheckbox").get(0).checked,$("#mZCheckbox").get(0).checked];
        let nStartIndex = -1;
        let nEndIndex = -1;

        for (var i = 0; i < bCheckedList.length; i++) {
        	if (bCheckedList[i]) {
        		if (nStartIndex<0) {
        			nStartIndex = i;
        		} else{
        			nEndIndex = i;
        		}
        	}
        }
        
        if (nStartIndex>=0&&nEndIndex<0) {
        	data.YCenterPos = parseFloat($("#mZCp").val())
            data.YLength = 0
            data.yStep = parseFloat($("input#mZStep").val())
        	if (nStartIndex==0) {
        		data.XCenterPos = parseFloat($('#mXCp').val())
				data.XLength = parseFloat($('#mXL').val())
				data.xStep = parseFloat($("input#mXStep").val())
        	}
        	if (nStartIndex==1) {
        		data.XCenterPos = parseFloat($('#mYCp').val())
	        	data.XLength = parseFloat($('#mYL').val())
	        	data.xStep = parseFloat($("input#mYStep").val())
        	}
        	if (nStartIndex==2) {
        		data.XCenterPos = parseFloat($("#mZCp").val())
	            data.XLength = parseFloat($("#mZL").val())
	            data.xStep = parseFloat($("input#mZStep").val())
	            data.YCenterPos = parseFloat($('#mYCp').val())
	        	data.YLength = 0
	        	data.yStep = parseFloat($("input#mYStep").val())
        	}
        	
        } 
        if (nStartIndex>=0&&nEndIndex>=0) {
        	if (nStartIndex==0) {
        		data.XCenterPos = parseFloat($('#mXCp').val())
				data.XLength = parseFloat($('#mXL').val())
				data.xStep = parseFloat($("input#mXStep").val())
        	} else{
				data.XCenterPos = parseFloat($('#mYCp').val())
	        	data.XLength = parseFloat($('#mYL').val())
	        	data.xStep = parseFloat($("input#mYStep").val())
        	}
        	if (nEndIndex==1) {
        		data.YCenterPos = parseFloat($('#mYCp').val())
	        	data.YLength = parseFloat($('#mYL').val())
	        	data.yStep = parseFloat($("input#mYStep").val())
        	} else{
	        	data.YCenterPos = parseFloat($("#mZCp").val())
	            data.YLength = parseFloat($("#mZL").val())
	            data.yStep = parseFloat($("input#mZStep").val())
        	}
        	
        }
        if (nStartIndex<0&&nEndIndex<0) {
        	data.XCenterPos = parseFloat($('#mXCp').val())
			data.XLength = 0
			data.xStep = parseFloat($("input#mXStep").val())
        	data.YCenterPos = parseFloat($('#mYCp').val())
        	data.YLength = 0
        	data.yStep = parseFloat($("input#mYStep").val())
        }*/
       
       
        websocket.send(funcCode.commandRunMap, data)
        this.removeAllLine()
        this.heatmap.clearHeatmap()
        //if(data.stepMode === 0 ){
            main.setCallbacks(funcCode.mappingWH,rev=>{
                [this.col,this.row] = [rev.getX(),rev.getY()]
                btnSrc.attr('src','source/image/stop.png')
                btnSrc.attr('alt','1')
                btn.attr('title',$.i18n.prop('popup-mapping-stopBtn'))
                $("#mappingDiv1 button").each(function () {
                    let temp = $(this).attr('data-tips')
                    if (temp===undefined) return
                    $(this).prop('disabled',(temp !=='popup-mapping-startBtn'))
                })

                $("#mCoordsX").attr('max',this.col)
                $("#mCoordsY").attr('max',this.row)
                 this.updateArea(this.col,this.row)
                 this.heatmap.addHeatmap(this.col, this.row, name)
                 this.#data = Array.from({
                    length: this.col
                }, () => new Array(this.row).fill(0));
            })
        // }else {
        //     [this.col,this.row] = [data.PointNumX,data.PointNumY]
        //     this.heatmap.addHeatmap(this.col, this.row, name)
        //     this.#data = Array.from({
        //         length: this.col
        //     }, () => new Array(this.row).fill(0));
        // }
        main.setCallbacks(funcCode.mappingStop, rev => {
            btnSrc.attr('src','source/image/start.png')
            btnSrc.attr('alt','0')
            btn.attr('title',$.i18n.prop('popup-mapping-startBtn'))
            $("#mappingDiv1 button").each(function () {
                let temp = $(this).attr('data-tips')
                if (temp===undefined) return
                $(this).prop('disabled',false)
            })
            let arr = mapping.#data.flat()
            this.mappingMap.addLut(Math.min(...arr),Math.max(...arr),true)
            //mapping.heatmap.addData(mapping.#data)
        })
        
        
        
        
        
    }
    //停止mapping扫描
    stopMapping() {
        let btn = $("#startMapping")
        let btnSrc =  $("#startMapping img")
        websocket.send(funcCode.commandStopMap, {})
        main.setCallbacks(funcCode.commandStopMap, rev => {
            btnSrc.attr('src','source/image/start.png')
            btnSrc.attr('alt','0')
            btn.attr('title',$.i18n.prop('popup-mapping-startBtn'))
            $("#mappingDiv1 button").each(function () {
                let temp = $(this).attr('data-tips')
                if (temp===undefined) return
                $(this).prop('disabled',false)
            })
            if(mapping.dimensions) return
            let arr = mapping.#data.flat()
            this.mappingMap.addLut(Math.min(...arr),Math.max(...arr),true)
        })
    }
    //打开mapping文件
    openFileMapping() {
        let suc = function(){
            if(mapping.dimensions){
//          	$("div .fileName select").html("");
				$("div .fileName select option[value='.txt']").hide()
	            $("div .fileName select option[value='.bck']").hide()
	            $("div .fileName select option[value='*.*']").hide()
//	            $("div .fileName select").val('.hdr')
                $("div .fileName select").append("<option [value='.zolix']>"+'zolix')
            }else{
            	$("div .fileName select option[value='.txt']").hide()
	            $("div .fileName select option[value='.bck']").hide()
	            $("div .fileName select option[value='*.*']").hide()
	            $("div .fileName select").val('.hdr')
            }
            main.getSavefilePathPram()
            
        }
        let end = function(){
            if (main.isOpenChecked) {
                main.isOpenChecked=false;
                let lasetIndex = main.openFilePath.lastIndexOf("\\")+1;
                let filePath = main.openFilePath.substring(0,lasetIndex);
                let fileNames = main.openFilePath.substr(lasetIndex);
                let fileList = fileNames.split(",");
                

                if (fileList.length==2) {
                    if(fileList[0].lastIndexOf(".hdr")||fileList[0].lastIndexOf(".raw")){
                    	mapping.dimensions= false
                    	mapping.switchDimensions();
                        let strHdr = fileList[0].replace(".hdr","").replace(".raw","");
                        let strRaw = fileList[1].replace(".hdr","").replace(".raw","");
                        console.log("strHdr",strHdr);
                        console.log("strRaw",strRaw);
                        if (strHdr==strRaw) {
                            websocket.send(funcCode.OpenLineDataPram,{path:filePath+strHdr+".hdr"},false)
                            main.setCallbacks(funcCode.OpenLineDataPram,rev=>{
                                let showHdr = rev.getTiptitle();
                                mapping.fileUnits = showHdr.indexOf("nm")>=0?"nm":"cm-1";

                                var patt1=/LaserWave\s*=\s*\d+.?\d?/;
                                mapping.dLaserWave= patt1.exec(showHdr)[0];
                                mapping.dLaserWave = parseFloat(mapping.dLaserWave.replace("LaserWave=",""));
                                websocket.send(funcCode.openHdrRawMapping,{path:filePath+strHdr})
                                main.setCallbacks(funcCode.openHdrRawMapping,rev=>{
                                    if(rev.getBstatus()){
                                        [mapping.col,mapping.row] = [rev.getX(),rev.getY()]
                                        $('#mappingHot').removeAttr('hidden')
                                        $("#mappingLut").removeAttr('hidden')
                                        $("#mCoordsX").attr('max',mapping.col)
                                        $("#mCoordsY").attr('max',mapping.row)
                                        mapping.removeAll()
                                        mapping.updateArea(mapping.col,mapping.row)
                                        mapping.heatmap.clearHeatmap()
                                        mapping.heatmap.addHeatmap(mapping.col,mapping.row,strRaw)
                                        jeBox.msg($.i18n.prop('tips-mapping-openSuc'), {icon: 2});
                                        $("div#mDP button").click();
                                    }else{
                                        jeBox.msg($.i18n.prop('tips-mapping-openFill'), {icon: 3});
                                    }
                                })
                            })

                        } else{
                            jeBox.msg($.i18n.prop('tips-mapping-isName'), {icon: 3});
                        }
                    }
                }else if(fileList.length==1){
                    if(fileList[0].lastIndexOf(".sysp")>0){
                    	mapping.dimensions= false
                    	mapping.switchDimensions();
                        websocket.send(funcCode.openSyspMapping,{path:filePath+fileList[0].replace(".sysp","")})
                        main.setCallbacks(funcCode.openSyspMapping,rev=>{
                            if(rev.getBstatus()){  
                                [mapping.col,mapping.row] = [rev.getX(),rev.getY()]
                                $('#mappingHot').removeAttr('hidden')
                                $("#mappingLut").removeAttr('hidden')
                                mapping.removeAll()
                                mapping.updateArea(mapping.col,mapping.row)
//								mapping.heatmap.clearHeatmap()
                                mapping.heatmap.clearHeatmap()
                                mapping.heatmap.addHeatmap(mapping.col,mapping.row,fileList[0].lastIndexOf(".sysp"))
                                jeBox.msg($.i18n.prop('tips-mapping-openSuc'), {icon: 2});
                                $("div#mDP button").click();
                            }else{
                                jeBox.msg($.i18n.prop('tips-mapping-openFill'), {icon: 3});
                            }
                        })
                    }else if (fileList[0].lastIndexOf(".zolix")>0) {
                    	mapping.dimensions= true
                    	mapping.switchDimensions();
	                    let data = {}
	                    data.filepath = main.openFilePath
	                    data.mode = $('#mStrMode').get(0).selectedIndex
	                    data.dWave1 = 0.0
	                    data.dWave2 = 0.0
	                    switch (data.mode) {
	                        case 0: {
	                            data.dWave2 = parseFloat($('#dWave1').val())
	                        }
	                            break
	                        case 1:
	                        case 3: {
	                            data.dWave1 = parseFloat($('#dWave0').val())
	                            data.dWave2 = parseFloat($('#dWave2').val())
	                        }
	                            break
	                    }
	                    main.setCallbacks(funcCode.open3DMappingContent,rev=>{
	                    	let strFileC = rev.getFilecontent()
	                    	let zolix3DObj = JSON.parse(strFileC)
	                    	$("input#mXStep").val(zolix3DObj.stepX);
	                    	$("input#mYStep").val(zolix3DObj.stepY);
	                    	$("input#mZStep").val(zolix3DObj.stepZ);
	                    })
	                    websocket.send(funcCode.open3DMapping,data)
	                    return
	                }
                }else{
                    jeBox.msg($.i18n.prop('tips-mapping-fileNum'), {icon: 3});
                }
            }
            console.log(main.openFilePath.substring(0,main.openFilePath.lastIndexOf("\\")+1));
            main.setSaveFilePathPram(main.openFilePath.substring(0,main.openFilePath.lastIndexOf("\\")+1));
        }
        main.openFileByPath(suc,end)
    };
    /**
     * 画图
     * @param {document} canvas        canvasDom树
     * @param {Object}   imgdom        图片控件
     * @param {Object}   width        标尺宽度
     * @param {Object}   val        标尺显示数值
     * @param {Boolean}  isCursor 是否画上十字光标
     * @param {Boolean}  isd        是否画上标尺
     * @param {inter}           left        标尺左
     * @param {inter}           top        标尺上
     * @param {inter}    w                标尺宽度
     */
    drawCanvas(canvas,imgdom,width,val,left,top,w,h){
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

        ctx.moveTo(left+3,top+3);
        ctx.lineTo(left+3,top+h+3);
        ctx.lineTo(left+w+3,top+h+3);
        ctx.lineTo(left+w+3,top+3);
        ctx.lineTo(left+3,top+3);

        ctx.stroke();
        ctx.fillStyle = "#FFFFFF";
        ctx.font="14px Verdana";
        var sText = val;
        ctx.fillText(sText,imgWidth-13-10*sText.length,imgHeight-10);
    }
    /**
     * 保存图片
     * @param {Number} type   保存图片使用方法的类型：0：后台保存；1：前端保存；
     *
     */
    saveMappingImage(type){
        if (type===0) {
            let suc =  function () {
                main.getSavefilePathPram()
                $("div.fileType select option[value='.hdr']").hide()
                $("div.fileType select option[value='.jpg']").hide()
                $("div.fileType select option[value='.csv']").hide()
                $("div.fileType select option[value='.txt']").hide()
                $("div.fileType select").val(".png");
            }
            let end = function(){
                if (main.isOpenChecked) {
                    main.isOpenChecked=false;
                    $("div#mappingImg").append("<canvas id='showImgAndLine' class='je-hide' width='"+$("img#mappingImage").width()+"' "
                        +"height='"+$("img#mappingImage").height()+"'></canvas>");
                    var canvas = $("canvas#showImgAndLine").get(0);
                    mapping.drawCanvas(
                        canvas,
                        $("img#mappingImage").get(0),
                        $("div.mScale").width(),
                        $("span#mLensSize").text(),
                        $("div#mappingBox").position().left,
                        $("div#mappingBox").position().top,
                        $("div#mappingBox").width(),
                        $("div#mappingBox").height());
                    var imgsDataB = canvas.toDataURL("image/png");
                    $(canvas).detach();
                    websocket.send(funcCode.SaveLineDataPram, {path: main.saveFilePath, content: imgsDataB}, false)
                }
            }
            main.setSaveFilePathPram(main.saveFilePath.substring(0,main.saveFilePath.lastIndexOf("\\")+1));
            main.saveFileByPath(suc,end)
        }else{
            $("div#mappingImg").append("<canvas id='showImgAndLine' class='je-hide' width='"+$("img#mappingImage").width()+"' "
                +"height='"+$("img#mappingImage").height()+"'></canvas>");
            var canvas = $("canvas#showImgAndLine").get(0);
            mapping.drawCanvas(
                canvas,
                $("img#mappingImage").get(0),
                $("div.mScale").width(),
                $("span#mLensSize").text(),
                $("div#mappingBox").position().left,
                $("div#mappingBox").position().top,
                $("div#mappingBox").width(),
                $("div#mappingBox").height());
            var imgsDataB = canvas.toDataURL("image/png");
            $("a#saveImgd").attr("href",imgsDataB);
            $(canvas).detach();
            setTimeout(function(){
                $("a#saveImgd").click();
            },1000);
        }
    }
    //保存mapping文件
    saveMappingFile(){
        let suc = function () {
            main.getSavefilePathPram()
            $("div.fileType select").val(".hdr");
            $("div.fileType select option[value='.txt']").hide()
            $("div.fileType select option[value='.png']").hide()
            $("div.fileType select option[value='.jpg']").hide()
            $("div.fileType select option[value='.csv']").hide()
        }
        let end = function(){
            if (main.isOpenChecked) {
                main.isOpenChecked=false;
                console.log(main.saveFilePath);
                if (main.saveFilePath.indexOf(".hdr")>=0) {
                    let path = main.saveFilePath.replace(".hdr","")
                    // if(path.includes(' ')) return jeBox.msg($.i18n.prop('tips-mapping-savePath'),{icon:1})
                    websocket.send(funcCode.saveHdrRawMapping,{path:path})
                    main.setCallbacks(funcCode.saveHdrRawMapping,rev=>{
                        if(rev.getBstatus()){
                            jeBox.msg($.i18n.prop('tips-mapping-saveSuc'), {icon: 2});
                            setTimeout(function(){
                                websocket.send(funcCode.OpenLineDataPram,{path:main.saveFilePath},false);
                                main.setCallbacks(funcCode.OpenLineDataPram,rev=>{
                                    let temp =rev.getTiptitle();
                                    var strExg= /LaserWave=[\S]+/;
                                    var strWave = strExg.exec(temp)[0].replace("LaserWave=","");
                                    var dWave = parseFloat(strWave);
                                    mapping.updateRawNm2CM(temp,fConfig.waveunit,dWave);
                                })
                            },500);

                        }else{
                            jeBox.msg($.i18n.prop('tips-mapping-saveFill'), {icon: 3});
                        }
                    })
                }else{
                    websocket.send(funcCode.saveSyspMapping,{path:main.saveFilePath.replace(".sysp","")})
                    main.setCallbacks(funcCode.saveSyspMapping,rev=>{
                        if(rev.getBstatus()){
                            jeBox.msg($.i18n.prop('tips-mapping-saveSuc'), {icon: 2});
                        }else{
                            jeBox.msg($.i18n.prop('tips-mapping-saveFill'), {icon: 3});
                        }
                    })
                }
                main.setSaveFilePathPram(main.saveFilePath.substring(0,main.saveFilePath.lastIndexOf("\\")+1));
            }
        }
        main.saveFileByPath(suc,end)
    }
    saveHeatMapDataFile(){
    	let suc =  function () {
            main.getSavefilePathPram()
            $("div .fileType select option[value='.hdr']").hide()
            $("div .fileType select option[value='.png']").hide()
            $("div .fileType select option[value='.jpg']").hide()
            $("div .fileType select option[value='.csv']").hide()
            $("div.fileType select").val(".txt");
        }
        let end = function(){
            if (main.isOpenChecked) {
                main.isOpenChecked=false;
                console.log(main.saveFilePath);

                let modeFunc = $("select#mStrMode").get(0).selectedIndex;
                let info ="[INFO]\n";
                info+=("Index="+$("select#mStrMode").get(0).selectedIndex+"\n");
                switch (modeFunc){
                	case 0:
                	 	info+=("RangeF=0 nm\n");
                		info+=("RangeE="+$("input#dWave1").attr("nm")+" nm\n");
                		break;
                	case 1:
                	 	info+=("RangeF="+$("input#dWave0").attr("nm")+" nm\n");
                		info+=("RangeE="+$("input#dWave2").attr("nm")+" nm\n");
                		break;
                	case 2:
                	 	info+=("RangeF=0 nm\n");
                		info+=("RangeE=0 nm\n");
                		break;
                	case 3:
                	 	info+=("RangeF="+$("input#dWave0").attr("nm")+" nm\n");
                		info+=("RangeE="+$("input#dWave2").attr("nm")+" nm\n");
                		break;
                	default:
                		break;
                }
				info+=("cwl="+$("input#mCenWave").val()+" "+$($(".showUnits").get(0)).html()+"\n");
				info+=("time="+$("input#mExpTime").val()+" s\n");
				info+=("slit="+$("input#mSlit").val()+" μm\n");
				info+=("accNum="+$("input#mAcc").val()+"\n");
				info+=("centerPointX="+$("input#mXCp").val()+" μm\n");
				info+=("centerPointY="+$("input#mYCp").val()+" μm\n");
				info+=("LengthX="+$("input#mXL").val()+" μm\n");
				info+=("LengthY="+$("input#mYL").val()+" μm\n");
				info+=("step="+$("input#mStep").val()+" μm\n");
				info+=("laserWaveLength="+mapping.dLaserWave+" nm\n")
				if (localStorage.getItem("lg")=="zh") {
					info = info.replace("Index","显示方法");
					info = info.replace("RangeF","显示范围起始")
					info = info.replace("RangeE","显示范围终止")
					info = info.replace("cwl","中心波长")
					info = info.replace("time","积分时间")
					info = info.replace("slit","狭缝")
					info = info.replace("accNum","累计次数")
					info = info.replace("centerPointX","X轴中心点")
					info = info.replace("centerPointY","Y轴中心点")
					info = info.replace("LengthX","X轴长度")
					info = info.replace("LengthY","Y轴长度")
					info = info.replace("step","步距")
					info = info.replace("laserWaveLength","零点波长")
				}
				
                let saveData = "[DATA]\n\t";
                let heatMapData = mapping.mappingMap.getOrg();
                console.log(heatMapData);
                let line = heatMapData.length;
                let row  = heatMapData[0].length;
                
                for (var i = 0; i < line; i++) {
                	saveData+=(i+"\t")
                }
                saveData+="\n"
                for (var i = 0; i <row; i++) {
                	saveData+=(i+"\t")
                	for (var j = 0; j < line; j++) {
                		saveData+=(heatMapData[j][i]+"\t");
                	}
                	saveData+="\n";
                }
                
                websocket.send(funcCode.SaveLineDataPram, {path: main.saveFilePath, content: info+saveData}, false)
            }
		}
        main.saveFileByPath(suc,end)
    }
    //保存mapping曲线数据
    saveLineMapping(){
        let suc =  function () {
            main.getSavefilePathPram()
            $("div .fileType select option[value='.hdr']").hide()
            $("div .fileType select option[value='.png']").hide()
            $("div .fileType select option[value='.jpg']").hide()
            $("div .fileType select option[value='.csv']").hide()
            $("div.fileType select").val(".txt");
        }
        let end = function(){
            if (main.isOpenChecked) {
                main.isOpenChecked=false;
                console.log(main.saveFilePath);

                let [saveData,MaxLen] = ["",0];
                let lines = mapping.mappingChart.active_series();
                if (lines.length === 0) return;
                var lineNames = new Array();
                let infos = new Array();
                for (let i = 0; i <lines.length ; i++) {
                	lineNames.push(lines[i].name());
                	let lineData = [mapping.mappingChart.series(lines[i].name())]
                	console.log(lineData);
                    MaxLen = Math.max(MaxLen, lineData[0].get_length())
                    infos.push({
                    	"totalnum":parseInt($("input#mAcc").val()),
                    	"name":lines[i].name(),
                    	"unit":$($("span.showUnit").get(0)).html(),
                    	"strCenterWave":$("input#mCenWave").val(),
                    	"ExpTime":$("input#mExpTime").val(),
                    	"slit":Number($("input#mSlit").val()),
                    	"laserWaveLength":mapping.dLaserWave+""
                    });
                }

                for (var i = 0; i < MaxLen; i++) {
                	let strLine=""
                	for (var j = 0; j < lines.length; j++) {
                		let lineData = [mapping.mappingChart.series(lines[j].name())]
                		strLine+="\t"
                		strLine+=lineData[0].get_data().x[i]==undefined?"":lineData[0].get_data().x[i]
                		strLine+="\t"
                		strLine+=lineData[0].get_data().y[i]==undefined?"":lineData[0].get_data().y[i]
                	}
                	strLine=strLine.substr(1)
                	strLine+="\n"
                	saveData+=strLine;
                }
				let strInfos = JSON.stringify(infos);
				if (localStorage.getItem("lg")=="zh") {
					strInfos = getZHTitle(strInfos);
				}
				let filecd = "";
				filecd+="[Info]\n"
				filecd+=strInfos
				filecd+="\n"
				filecd+="[Data]\n"
				filecd+=saveData
                websocket.send(funcCode.SaveLineDataPram, {path: main.saveFilePath, content: filecd}, false)
            	main.setSaveFilePathPram(main.saveFilePath.substring(0, main.saveFilePath.lastIndexOf("\\") + 1));				
			
            }
        }
        main.setSaveFilePathPram(main.saveFilePath.substring(0,main.saveFilePath.lastIndexOf("\\")+1));
        main.saveFileByPath(suc,end)
    }
    //保存三维Mapping文件
    save3DMapping(){
        let suc = function () {
            main.getSavefilePathPram()
            $("div.fileType select").val(".hdr");
            $("div .fileType select option[value='.txt']").hide()
            $("div .fileType select option[value='.png']").hide()
            $("div .fileType select option[value='.jpg']").hide()
            $("div .fileType select option[value='.csv']").hide()
        }
        let end = function(){
            if (main.isOpenChecked) {
                main.isOpenChecked=false;
                websocket.send(funcCode.save3DMapping, {filePath:main.openFilePath})
            }
        }
        main.exportFilePath(suc,end)
    }
    //保存三维Mapping截取文件
    save3DCutPlane(){
        let suc = function () {
            main.getSavefilePathPram()
            $("div.fileType select").val(".hdr");
            $("div.fileType select option[value='.txt']").hide()
            $("div.fileType select option[value='.png']").hide()
            $("div.fileType select option[value='.jpg']").hide()
            $("div.fileType select option[value='.csv']").hide()
        }
        let end = function(){
            if (main.isOpenChecked) {
                main.isOpenChecked=false;
                let clip = mapping.mapping3D.getClipP()
                let filePath = main.saveFilePath.substring(0, main.saveFilePath.lastIndexOf("."))
                let data = {x:[clip.minX,clip.maxX-1],y:[clip.minY,clip.maxY-1],z:[clip.minZ,clip.maxZ-1],filePath: filePath}
                switch (clip.dir) {
                    case "X":{
                        data.x = [clip.type==0? clip.minX:clip.maxX-1]
                    }break
                    case "Y":{
                        data.y = [clip.type==0? clip.minY:clip.maxY-1]
                    }break
                    case "Z":{
                        data.z = [clip.type==0? clip.minZ:clip.maxZ-1]
                    }break
                }
                websocket.send(funcCode.mapping3DCutPng,data)
            }
        }
        main.saveFileByPath(suc,end)
    }
    //导出二维全部曲线
    export2DCurves(){
        let data = {x:this.col,y:this.row,filePath:''}
        dialog.showExportTxtBox(funcCode.exportAllCurves,data)
    }
    //导出三维全部曲线
    export3DCurves(){
        dialog.showExportTxtBox(funcCode.exportAllCurves3D,{filePath:''})
    }
    //导出三维截图数据曲线
    export3DCutCurves(){
        let clip = mapping.mapping3D.getClipP()
        let filePath = ''
        let data = {x:[clip.minX,clip.maxX-1],y:[clip.minY,clip.maxY-1],z:[clip.minZ,clip.maxZ-1],filePath: filePath}
        switch (clip.dir) {
            case "X":{
                data.x = [clip.type==0? clip.minX:clip.maxX-1]
            }break
            case "Y":{
                data.y = [clip.type==0? clip.minY:clip.maxY-1]
            }break
            case "Z":{
                data.z = [clip.type==0? clip.minZ:clip.maxZ-1]
            }break
        }
        dialog.showExportTxtBox(funcCode.exportAllCurvesPng,data)
    }
    //导出单点数据文件
    exportPointData(){
        let suc =  function () {
            main.getSavefilePathPram()
            $("div .fileType select option[value='.hdr']").hide()
            $("div .fileType select option[value='.png']").hide()
            $("div .fileType select option[value='.jpg']").hide()
            $("div .fileType select option[value='.csv']").hide()
            $("div.fileType select").val(".txt");
        }
        let end = function(){
            if (main.isOpenChecked) {
                main.isOpenChecked=false;
                console.log(main.saveFilePath);

                let modeFunc = $("select#mStrMode").get(0).selectedIndex;
                let info ="[INFO]\n";
                info+=("Index="+$("select#mStrMode").get(0).selectedIndex+"\n");
                switch (modeFunc){
                    case 0:
                        info+=("RangeF=0 nm\n");
                        info+=("RangeE="+$("input#dWave1").attr("nm")+" nm\n");
                        break;
                    case 1:
                        info+=("RangeF="+$("input#dWave0").attr("nm")+" nm\n");
                        info+=("RangeE="+$("input#dWave2").attr("nm")+" nm\n");
                        break;
                    case 2:
                        info+=("RangeF=0 nm\n");
                        info+=("RangeE=0 nm\n");
                        break;
                    case 3:
                        info+=("RangeF="+$("input#dWave0").attr("nm")+" nm\n");
                        info+=("RangeE="+$("input#dWave2").attr("nm")+" nm\n");
                        break;
                    default:
                        break;
                }
                info+=("cwl="+$("input#mCenWave").val()+" "+$($(".showUnits").get(0)).html()+"\n");
                info+=("time="+$("input#mExpTime").val()+" s\n");
                info+=("slit="+$("input#mSlit").val()+" μm\n");
                info+=("accNum="+$("input#mAcc").val()+"\n");
                info+=("centerPointX="+$("input#mXCp").val()+" μm\n");
                info+=("centerPointY="+$("input#mYCp").val()+" μm\n");
                info+=("centerPointY="+$("input#mZCp").val()+" μm\n");
                info+=("LengthX="+$("input#mXL").val()+" μm\n");
                info+=("LengthY="+$("input#mYL").val()+" μm\n");
                info+=("LengthZ="+$("input#mYZ").val()+" μm\n");
                info+=("step="+$("input#mStep").val()+" μm\n");
                info+=("laserWaveLength="+mapping.dLaserWave+" nm\n")
                if (localStorage.getItem("lg")==="zh") {
                    info = info.replace("Index","显示方法");
                    info = info.replace("RangeF","显示范围起始")
                    info = info.replace("RangeE","显示范围终止")
                    info = info.replace("cwl","中心波长")
                    info = info.replace("time","积分时间")
                    info = info.replace("slit","狭缝")
                    info = info.replace("accNum","累计次数")
                    info = info.replace("centerPointX","X轴中心点")
                    info = info.replace("centerPointY","Y轴中心点")
                    info = info.replace("centerPointZ","Z轴中心点")
                    info = info.replace("LengthX","X轴长度")
                    info = info.replace("LengthY","Y轴长度")
                    info = info.replace("LengthZ","Z轴长度")
                    info = info.replace("step","步距")
                    info = info.replace("laserWaveLength","零点波长")
                }

                let saveData = "[DATA]\n\t";
                let heatMapData = mapping.mappingMap.getOrg();
                console.log(heatMapData);
                let line = heatMapData.length;
                let row  = heatMapData[0].length;

                for (var i = 0; i < line; i++) {
                    saveData+=(i+"\t")
                }
                saveData+="\n"
                for (var i = 0; i <row; i++) {
                    saveData+=(i+"\t")
                    for (var j = 0; j < line; j++) {
                        saveData+=(heatMapData[j][i]+"\t");
                    }
                    saveData+="\n";
                }

                websocket.send(funcCode.SaveLineDataPram, {path: main.saveFilePath, content: info+saveData}, false)
            }
        }
        main.saveFileByPath(suc,end)
    }
    //删除全部
    removeAll(){
    	if (mapping.dimensions)  mapping.mapping3D.clearGroup(mapping.mapping3D.boxGroup)
//      mapping.mapping3D.clearScene()
        let heatmap = mapping.dimensions?mapping.mappingMap:mapping.heatmap
        heatmap.removeAllMarks()
        heatmap.clearHeatmap()
        /*清空图片*/
        if(!this.dimensions){
            $("#mappingImg").prop("hidden",true)
        }
    }
    //删除所有曲线
    removeAllLine(){
  		if (mapping.dimensions)mapping.mapping3D.clearGroup(mapping.mapping3D.boxGroup)
//      mapping.mapping3D.clearScene()
        this.mappingChart.remove_all()
        $(".mappingLegend").empty()
        this.mLegend.names.clear();
        this.mLegend.marks.clear()
        /*清空标记*/
        let heatmap = mapping.dimensions?mapping.mappingMap:mapping.heatmap
        heatmap.clearHeatmap()
        heatmap.removeAllMarks()
    }
    //mapping获取显示模式数据	66
    GetShowModeData(){
//      if(this.dimensions){
//          let data = {}
//          data.mode = $('#mStrMode').get(0).selectedIndex
//          data.dWave1 = 0.0
//          data.dWave2 = 0.0
//          switch (data.mode) {
//              case 0: {
//                  data.dWave2 = parseFloat($('#dWave1').val())
//              }
//                  break
//              case 1:
//              case 3: {
//                  data.dWave1 = parseFloat($('#dWave0').val())
//                  data.dWave2 = parseFloat($('#dWave2').val())
//              }
//                  break
//          }
//          websocket.send(funcCode.showMode3DMapping,data)
//          return
//      }
//      if (this.mappingMap.option() === null)return jeBox.msg($.i18n.prop('tips-mapping-imgData'),{icon:1})
        let data = {}
        let idx = data.nMode = $('#mStrMode').get(0).selectedIndex
        data.dWave0 = 0
        data.dWave1 = 0
        let showData = [0,0];
        data.fSize = this.col*this.row//mapping.#data.flat(Infinity).length
        switch (idx) {
            case 0: {
                data.dWave1 = parseFloat($('#dWave1').val())
                showData[1]= data.dWave1;
            }
                break
            case 1:
            case 3: {
                data.dWave0 = parseFloat($('#dWave0').val())
                data.dWave1 = parseFloat($('#dWave2').val())
                showData[0] = data.dWave0;
                showData[1] = data.dWave1;
            }
                break
        }
        if (mapping.fileUnits==$($("p.showUnits").get(0)).html()) {
            this.updateModeData(data)
        } else{
            if(mapping.fileUnits=="nm"){
                let sendParam = {};
                sendParam.laserWave = mapping.dLaserWave;
                sendParam.array = showData;
                websocket.send(funcCode.CmToNmParams,sendParam);
                main.setCallbacks(funcCode.CmToNmParams,rev =>{
                    let selectW = rev.getPdList();
                    data.dWave0 = selectW[0];
                    data.dWave1 = selectW[1];
                    this.updateModeData(data)
                });
            }else{
                let sendParam = {};
                sendParam.laserWave = mapping.dLaserWave;
                sendParam.array = showData;
                websocket.send(funcCode.NmToCmParams,sendParam);
                main.setCallbacks(funcCode.NmToCmParams,rev =>{
                    let selectW = rev.getPdList();
                    data.dWave0 = selectW[0];
                    data.dWave1 = selectW[1];
                    this.updateModeData(data)

                });
            }
        }


    }
    //获取特定范围mapping
    updateModeData(data){
        let arr = Object.values(data)
        for (let i = 0; i < arr.length; i++) {
            if(isNaN(arr[i])) return jeBox.msg($.i18n.prop('tips-scan-paramNAN'),{icon:1})
        }

        websocket.send(funcCode.GetShowModeData,data)
        main.setCallbacks(funcCode.GetShowModeData,rev=>{
            let arr = rev.getDataList()
            let result = []
            let data = Array.from({
                length: this.col
            }, () => new Array(this.row).fill(0));
            for (let k = 0; k < arr.length; k+=this.col) {
                let temp = arr.slice(k,k+this.col)
                result.push(temp)
            }
            for (let i = 0; i <result.length ; i++) {
                for (let j = 0; j < this.col; j++) {
                    data[j][i] = result[i][j]
                }
            }
            mapping.heatmap.updateMinMax()
            this.heatmap.addLut(Math.min(...arr),Math.max(...arr),true)
            mapping.heatmap.addData(data)
        })
    }
    showDP(t) {
        $('#dPSW').prop('hidden', t !== 0)
        $('#dPHW').prop('hidden', t !== 1 && t !== 3)
    }
    //显示曲线
    showLine(x,y){
        let code = this.dimensions?funcCode.mapping3DXYZData:funcCode.dbMappigGetXY
        let data1 = {},z=0
        if(this.dimensions) {
            let clip = mapping.mapping3D.getClipP()
            console.log(x,y,clip)
            let dir = clip.dir
            let s = clip.s,e = clip.e,r=0
            if(parseInt(s)===0){
                r=parseInt(e)
            }else {
               r= parseInt(s+1)
            }
            switch (dir) {
                case "X":{
                    data1.x = clip.type==0?clip.minX:clip.maxX
                    data1.y = x-1
                    data1.z = y-1
                }break
                case "Y":{
                    data1.x = x-1
                    data1.y = clip.type==0?clip.minY:clip.maxY
                    data1.z = y-1
                }break
                case "Z":{
                    data1.x = x-1
                    data1.y = y-1
                    data1.z = clip.type==0?clip.minZ:clip.maxZ
                }break
            }

            /*z = parseInt((this.mapping3D.getZ() - 1).toString())*/
        }
        z = data1.z
        let data = this.dimensions?data1:{x_pos: x, y_pos: y}
        let heatmap = this.dimensions?this.mappingMap:this.heatmap
        if(x>this.col||y>this.row){
            jeBox.msg($.i18n.prop('tips-mapping-outRange'),{icon:1})
            return
        }
        websocket.send(code, data)
        main.setCallbacks(code, rev => {
            let [xArr, yArr] = [rev.getRetxList(), rev.getRetyList()]
            let name = this.dimensions?'L_' +x+"_"+y+'_'+z:'L_' +x+"_"+y
            let line = this.mappingChart.add_series(name, 0)
            if (mapping.fileUnits==fConfig.waveunit) {
                line.add_array(xArr, yArr)
                this.mLegend.addLegend(line,x,y)
            } else{
                if(mapping.fileUnits=="cm-1"){
                    setTimeout(function(){
                        let gratingNum = 0;

                        let sendParam = {};
                        sendParam.laserWave = mapping.dLaserWave;
                        sendParam.array = xArr;
                        websocket.send(funcCode.CmToNmParams,sendParam);
                        main.setCallbacks(funcCode.CmToNmParams,rev =>{
                            let xArr = rev.getPdList();
                            line.add_array(xArr, yArr)
                            mapping.mLegend.addLegend(line,x,y)
                        })
                    },100);
                }else{
                    setTimeout(function(){

                        let sendParam = {};
                        sendParam.laserWave = mapping.dLaserWave;
                        sendParam.array = xArr;
                        websocket.send(funcCode.NmToCmParams,sendParam);
                        main.setCallbacks(funcCode.NmToCmParams,rev =>{
                            let xArr = rev.getPdList();
                            line.add_array(xArr, yArr)
                            mapping.mLegend.addLegend(line,x,y)
                        })
                    },100);
                }

            }
            if(!this.dimensions) heatmap.addMarks(x,y,line.get_color())

        })
    }
    //更新mapping
    updateMapping(rev) {
        let [xArr, yArr, zArr] = [rev.getRetxList(), rev.getRetyList(), rev.getRetzList()]
        console.log(xArr,yArr,zArr)
        //
        for (let i = 0; i < xArr.length; i++) {
            this.#data[xArr[i]][yArr[0]] = zArr[i]
        }
        this.heatmap.addRow(yArr[0],zArr)
        console.log(mapping.#data)
    }
    //更新3DMapping采集数据
    updateMapping3D(rev){
    	
        let curZ = rev.getLayers(),xArr = rev.getRetxList(),yArr = rev.getRetyList(),intensityData = rev.getRetzList(),stopFlag=rev.getStopflag()
        
        if (stopFlag) {
        	mapping.GetShowModeData()
        } else{
        	let xStep = parseFloat($("input#mXStep").val())
	        let yStep = parseFloat($("input#mYStep").val())
	        let zStep = parseFloat($("input#mZStep").val())
	        mapping.mapping3D.clearGroup(mapping.mapping3D.boxGroup)
	        mapping.mapping3D.clearScene()
	        mapping.mapping3D.init3D('mapping3D')
//	        mapping.mapping3D.addAxis(x,y,z,xStep,yStep,zStep)
	        mapping.mapping3D.addMeshImg(xArr[0],yArr[0],curZ,xStep,yStep,zStep,false);
        }
        
//      mapping.mapping3D.addRow(xArr,yArr,curZ,mapping.curZ,intensityData,parseFloat($("input#mXStep").val()),parseFloat($("input#mYStep").val()),parseFloat($("input#mZStep").val()))
//      if(stopFlag) return mapping.mapping3D.addGUI(mapping.mapping3D,xArr.length,yArr.length,mapping.curZ,mapping.mapping3D.getData())
    }
    //更新3DMapping打开文件数据
    updateMapping3DFile(rev){
        let x=rev.getX(),y=rev.getY(),z=rev.getZ(),data=rev.getDataList(),depth=rev.getFsize()
        this.col = x;this.row=y;
        let xStep = parseFloat($("input#mXStep").val())
        let yStep = parseFloat($("input#mYStep").val())
        let zStep = parseFloat($("input#mZStep").val())
        mapping.mapping3D.clearGroup(mapping.mapping3D.boxGroup)
        mapping.mapping3D.clearScene()
        mapping.mapping3D.init3D('mapping3D')
        mapping.mapping3D.addAxis(x,y,z,xStep,yStep,zStep)
        mapping.mapping3D.addMeshImg(x,y,z,xStep,yStep,zStep,true);
        
        return;
        this.col = x;this.row=y;
         xStep = parseFloat($("input#mXStep").val())
         yStep = parseFloat($("input#mYStep").val())
         zStep = parseFloat($("input#mZStep").val())
        if(z===0){
            mapping.mapping3D.clearGroup(mapping.mapping3D.boxGroup)
            mapping.mapping3D.clearScene()
            mapping.mapping3D.init3D('mapping3D')
            mapping.mapping3D.addAxis(x,y,depth,xStep,yStep,zStep)
        }
        
        mapping.mapping3D.addPanel(x,y,z,depth,data,xStep,yStep,zStep)
        if(z===(depth-1))  mapping.mapping3D.addGUI(mapping.mapping3D,x,y,depth,mapping.mapping3D.getData());
    }
    //更新3Dmapping通过尺寸
    updateMapping3DByteSize(params){
    	let sendParam={};
    	sendParam.xmin=params.minX
        sendParam.xmax=params.maxX
        sendParam.ymin=params.minY
        sendParam.ymax=params.maxY
        sendParam.zmin=params.minZ
        sendParam.zmax=params.maxZ
        sendParam.nmode=$('#mStrMode').get(0).selectedIndex
        sendParam.dwave1=0.0
        sendParam.dwave2=0.0
        sendParam.showmode=$('#mStrMode').get(0).selectedIndex
        switch (sendParam.nmode) {
            case 0: {
                sendParam.dwave2 = parseFloat($('#dWave1').val())
            }
                break
            case 1:
            case 3: {
                sendParam.dwave1 = parseFloat($('#dWave0').val())
                sendParam.dwave2 = parseFloat($('#dWave2').val())
            }
                break
        }
		console.log(params)
		switch (params.axisName){
			case "X":
				if (params.type==0) {
					sendParam.nmode=2
				} else{
					sendParam.nmode=3
				}
				break;
			case "Y":
				if (params.type==0) {
					sendParam.nmode=4
				} else{
					sendParam.nmode=5
				}
				break;
			case "Z":
				if (params.type==0) {
					sendParam.nmode=0
				} else{
					sendParam.nmode=1
				}
				break;
			default:
				break;
		}
		main.setCallbacks(funcCode.getCurverSixPngData,rev =>{
			let [pdList,result,line] = [rev.getPdList(),[],[]];

			switch (params.axisName){
				case "X":
					mapping.mapping3D.updateHeatMap3D(pdList,params.maxY,params.maxZ)
					break;
				case "Y":
					mapping.mapping3D.updateHeatMap3D(pdList,params.maxX,params.maxZ)
					break;
				case "Z":
					mapping.mapping3D.updateHeatMap3D(pdList,params.maxX,params.maxY)
					break;
			}
		})
		main.setCallbacks(funcCode.getCurverSixPng,rev =>{
//  		mapping.mapping3D.clearGroup(mapping.mapping3D.boxGroup)
//          mapping.mapping3D.clearScene()
//          mapping.mapping3D.init3D('mapping3D')
			let fileNames = rev.getFilenamsList();
			console.log(fileNames)
    		mapping.mapping3D.updateGeometry(fileNames);
    	})
    	websocket.send(funcCode.getCurverSixPng,sendParam);
    }
    //更新进度条
    updateMappingPre(rev){
        let num = Math.round(rev.getPer()*100)
        if(mapping.dimensions&&num===100){ //三维停止切换采集按钮状态
            let btnSrc =  $("#startMapping img")
            let btn = $("#startMapping")
            btnSrc.attr('src','source/image/start.png')
            btnSrc.attr('alt','0')
            btn.attr('title',$.i18n.prop('popup-mapping-startBtn'))
        }
        let bar1 =  $("#mProgress1 .progress-bar")
        bar1.css("width",num+"%");
        bar1.text(num+"%");
        let time = Math.round(rev.getSurplus()/1000)
        let bar2 = $("#mProgress2 .progress-bar")
        bar2.css("background-color",'#383838');
        bar2.css("width",num+"%");
        bar2.text($.i18n.prop('popup-mapping-progress-time')+time+'s');
    }
    updateParam() {
        let mcw = $('#mCenWave'),dw0 =$('#dWave0'),dw1 = $('#dWave1'),dw2 = $('#dWave2')
        $('#mExpTime').val(fConfig.expTime)
        $('#mSlit').val(fConfig.slit)
        $('#mAcc').val(fConfig.totalnum)
        $("p.showUnits").text(fConfig.waveunit)
        if(fConfig.waveunit=="cm-1"){
        	let sendParam = {};
            sendParam.laserWave = mapping.dLaserWave;
            sendParam.array = [fConfig.centerwave];
        	websocket.send(funcCode.NmToCmParams,sendParam);
            main.setCallbacks(funcCode.NmToCmParams,rev =>{
                let selectW = rev.getPdList();
                mcw.val(selectW[0].toFixed(2))
                dw0.val(selectW[0].toFixed(2))
                dw1.val(selectW[0].toFixed(2))
        		dw2.val(selectW[0].toFixed(2))
                inputRange.addOldValue([$("#mSlit"),mcw,$('#mCoordsX'),$("#mCoordsY"),dw0,dw1,dw2])
            })
        }else{
            mcw.val(Number(fConfig.centerwave).toFixed(2))
        	dw0.val(Number(fConfig.centerwave).toFixed(2))
        	dw1.val(Number(fConfig.centerwave).toFixed(2))
        	dw2.val(Number(fConfig.centerwave).toFixed(2))
        }
        mcw.attr("nm",Number(fConfig.centerwave).toFixed(2));
        mcw.attr('min',device.spec.minRangeNM)
        mcw.attr('max',device.spec.maxRangeNM)
        mcw.attr('maxCM',device.spec.maxRangeCM)
        mcw.attr('minCM',device.spec.minRangeCM)
        dw0.attr("nm",Number(fConfig.centerwave).toFixed(2))
        dw0.attr('min',device.spec.minRangeNM)
        dw0.attr('max',device.spec.maxRangeNM)
        dw0.attr('maxCM',device.spec.maxRangeCM)
        dw0.attr('minCM',device.spec.minRangeCM)
        dw1.attr("nm",Number(fConfig.centerwave).toFixed(2))
        dw1.attr('min',device.spec.minRangeNM)
        dw1.attr('max',device.spec.maxRangeNM)
        dw1.attr('maxCM',device.spec.maxRangeCM)
        dw1.attr('minCM',device.spec.minRangeCM)
    	dw2.attr("nm",Number(fConfig.centerwave).toFixed(2))
        dw2.attr('min',device.spec.minRangeNM)
        dw2.attr('max',device.spec.maxRangeNM)
        dw2.attr('maxCM',device.spec.maxRangeCM)
        dw2.attr('minCM',device.spec.minRangeCM)
        inputRange.addOldValue([$("#mSlit"),mcw,$('#mCoordsX'),$("#mCoordsY"),dw0,dw1,dw2])
        this.updateSlitRange()
    }
    updateScanRange() {
        $("#startMapping").prop('disabled',false)
        let [mh, mi, mb,ml,mxc,myc] = [ $('#mappingHot'), $('#mappingImage'), $('#mappingBox'),$("#mappingLut"),$('#mXCp'),$('#mYCp')]
        let [cenX, cenY] = [draws.boxL+draws.boxW/2, draws.boxT+draws.boxH/2]
        mi.parent().css({width: "550px",  height: "412.5px"})

        let img = document.getElementById("mappingImage")
        ml.removeAttr('hidden')
        mh.removeAttr('hidden')
        mi.parent().removeAttr('hidden')
        fConfig.lensConf.forEach(cur => {
            if (camera.lenName === cur.name) {
            	//$('#mXCp').val(0);$('#mYCp').val(0)
            	let showCenterX = parseFloat(mxc.val())+((mi.width()/2)-cenX)/cur.scale ;
            	let showCenterY = parseFloat(myc.val())+((mi.height()/2)-cenY)/cur.scale;
                this.xC = showCenterX.toFixed(3)
                this.yC = showCenterY.toFixed(3)
                this.xW = (draws.boxW / cur.scale).toFixed(3)
                this.yH = (draws.boxH / cur.scale).toFixed(3)
                $('#mXCp').val(this.xC)
                $('#mYCp').val(this.yC)
                $('#mXL').val(this.xW)
                $('#mYL').val(this.yH)
                this.updateMinMax(mi.width()/2,mi.height()/2,cur.scale)
            }
        })
        img.src = 'data:image/jpg;base64,' + camera.camBase;
        mb.css({width: draws.boxW, height: draws.boxH, top: draws.boxT, left: draws.boxL})
        $("#mShowScale").width(draws.scSize)
        $("#mLensSize").text(draws.scTxt)
    }
    //狭缝可用范围
    updateSlitRange(){
        let [min,max,t]=[10,3000,$("#mSlit")]
        switch (device.spec.slitType) {
            case 'SR-SLIT':{
                min = 10
                max = 3000
            }break
            case 'SLIT-I24':{
                min = 10
                max = 24000
            }break
        }
        t.attr("min",min)
        t.attr("max",max)
    }
    /**
     * 生成cm-1头文件
     * @param fileC		        头文件内容
     * @param units  		单位
     * @param dWave		        激光波长
     */
    updateRawNm2CM(fileC ,units ,dWave ) {
        if (dWave!=0.0) {
            fileC = fileC.replace("LaserWave=[\\S]+", "LaserWave="+dWave);
        }
        if(fileC.indexOf("zolixmap info")<0){
            let det = "map info = {Arbitrary,1,1,0,0,1,1,0,North}\n";
            let start = fileC.indexOf("map info =");
            let end = fileC.indexOf("wavelength =");
            let mapInfo = fileC.substring(start,end);
            fileC = fileC.replace(mapInfo,det);
            fileC+=("\nzolix"+mapInfo);
        }
        if (fileC.indexOf("nm")>=0) {
        	fileC = fileC.replace("nm", units).replace("cm-1",units);
            if (units=="cm-1") {
                
                var strRegx = /wavelength =[\s\S]+\[S/;
                var strJson = strRegx.exec(fileC)[0]
                    .replace("wavelength =","")
                    .replace("[S","")
                    .replace("{","[")
                    .replace("}","]");
                var arrayd = JSON.parse(strJson);
                console.log(arrayd);
                let sendParam = {};
                sendParam.laserWave = dWave;
                sendParam.array = arrayd;
                websocket.send(funcCode.NmToCmParams,sendParam);
                main.setCallbacks(funcCode.NmToCmParams,rev =>{
                    let selectW = rev.getPdList();
                    let newWaveLength = "wavelength = "+JSON.stringify(selectW)
                        .replace(/,/g, ",\n")
                        .replace("[", "{\n")
                        .replace("]", "\n}\n\n[S");

                    fileC = fileC.replace(strRegx,newWaveLength);
                    setTimeout(function(){
                        websocket.send(funcCode.SaveLineDataPram, {path:main.saveFilePath,content:fileC},false)
                        main.setSaveFilePathPram(main.saveFilePath.substring(0,main.saveFilePath.lastIndexOf("\\")+1));
                    },500);
                });

            }
            setTimeout(function(){
                websocket.send(funcCode.SaveLineDataPram, {path:main.saveFilePath,content:fileC},false)
                main.setSaveFilePathPram(main.saveFilePath.substring(0,main.saveFilePath.lastIndexOf("\\")+1));
            },500);
        } else if (fileC.indexOf("cm-1")>=0){
        	fileC = fileC.replace("nm", units).replace("cm-1",units);
            if (units== "nm") {
                var strRegx = /wavelength =[\s\S]+\[S/;
                var strJson = strRegx.exec(fileC)[0]
                    .replace("wavelength =","")
                    .replace("[S","")
                    .replace("{","[")
                    .replace("}","]");
                var arrayd = JSON.parse(strJson);
                let sendParam = {};
                sendParam.laserWave = dWave;
                sendParam.array = arrayd;
                websocket.send(funcCode.CmToNmParams,sendParam);
                main.setCallbacks(funcCode.CmToNmParams,rev =>{
                    let selectW = rev.getPdList();
                    let newWaveLength = "wavelength = "+JSON.stringify(selectW)
                        .replace(/,/g, ",\n")
                        .replace("[", "{\n")
                        .replace("]", "\n}\n\n[S");

                    fileC = fileC.replace(strRegx,newWaveLength);
                    setTimeout(function(){
                        websocket.send(funcCode.SaveLineDataPram, {path:main.saveFilePath,content:fileC},false)
                        main.setSaveFilePathPram(main.saveFilePath.substring(0,main.saveFilePath.lastIndexOf("\\")+1));
                    },500);
                });

            }
            setTimeout(function(){
                websocket.send(funcCode.SaveLineDataPram, {path:main.saveFilePath,content:fileC},false)
                main.setSaveFilePathPram(main.saveFilePath.substring(0,main.saveFilePath.lastIndexOf("\\")+1));
            },500);
        }
    }
    //更新mapping影像区域
    updateArea(c,r){
        let [p,mh,mapWw, mapHh,mLut] = [$('#mappingDiv5'), $('#mappingHot'),'','',$('#mappingLut')]
        let [mapW, mapH] = [p.width() / 2, p.height()]
        let [kSolce,showSolce] = [mapW/mapH,c/r];
        if(kSolce>showSolce){
            mapHh = mapH;
            mapWw = mapH*showSolce;
        }else{
            mapWw = mapW;
            mapHh = mapW/showSolce;
        }
        mh.css({width: mapWw, height: mapHh})
        mLut.css('height',mapHh)
    }
    //更新边界
    updateMinMax(pw,ph,scale){ //图片宽高、比例尺
        this.scanMinx = this.dtPosX - pw/scale
        this.scanMaxX = this.dtPosX + pw/scale
        this.scanMinY = this.dtPosY - ph/scale
        this.scanMAxY = this.dtPosY + ph/scale
        console.log(this.scanMinx,this.scanMaxX,this.scanMinY,this.scanMAxY)
    }
    //更新mapping提示
    updateMappingTips(){
        $("#mappingDiv1 button").each(function () {
            let temp = $(this).attr('data-tips')
            if (temp===undefined) return
            $(this).attr('title',$.i18n.prop(temp))
        })
    }
    //判断是否超出边界
    isOutRange(center,wh,min,max){
        console.log(center,wh,min,max)
        if (((center-wh/2)<min)||((center+wh/2)>max)) return true;
        else return false;
    }
    //读取中心点
    readCenterPos(){
        let arr = this.dimensions?["X","Y","Z"]:["X","Y"]
        arr.forEach((cur,idx)=>{
            websocket.send(funcCode.MCEGetPosition,{"isAxis":idx},false)
            main.setCallbacks(funcCode.MCEGetPosition+idx,rev=>{
                let [idx,pos]= [rev.getIaxis(),rev.getPdvalue()]
                $("#m"+arr[idx]+"Cp").val(pos);
            })
        })
        $("#startMapping").prop('disabled',false)
        if(!this.dimensions) {$('#mappingHot').removeAttr('hidden');$("#mappingLut").removeAttr('hidden')}
    }
    
    readDtYPos(axis){
        websocket.send(funcCode.MCEGetPosition,{"isAxis":axis})
        main.setCallbacks(funcCode.MCEGetPosition+axis,rev=>{
            console.log(rev);
            let [idx,pos,arr]= [rev.getIaxis(),rev.getPdvalue(),["X","Y","Z"]]
            $("#mYCp").val(pos);
            this.dtPosY = pos
            deviceControl.MCECloseWhiteLightImage();
            if(draws.boxW>1){
            	mapping.updateScanRange()
            }
        })
    }
    readDtXPos(axis){
        websocket.send(funcCode.MCEGetPosition,{"isAxis":axis})
        main.setCallbacks(funcCode.MCEGetPosition+axis,rev=>{
            console.log(rev);
            let [idx,pos,arr]= [rev.getIaxis(),rev.getPdvalue(),["X","Y","Z"]]
            this.dtPosX = pos
            $("#mXCp").val(pos);
            mapping.readDtYPos(1);
        })
    }
    openCamera() {
    	//$("#mappingImage").removeAttr("src");
        $.get('html/device/camera/camera.html?'+new Date().getTime(), function (str) {
            jeBox.open({
                title: [$.i18n.prop('main-tools-camera'), {
                    'text-align': 'center',
                    'font-size': '1.5em'
                }],
                type: 'dialog',
                maskLock: true, //是否遮罩
                maskClose: false,
                isDrag: true,
                shadow: true,
                closeBtn: true,
                boxSize: ['auto', '51%'],
                zIndex: 100,
                content: str,
                success: function () {
                    device.camera.type = false
                 	deviceControl.MCEOpenWhiteLightImage();
                    main.translate(undefined)
                },
                endfun: function () {
                	mapping.readDtXPos(0);
                    //mapping.updateScanRange()
                }
            })
        })
    }
}()
