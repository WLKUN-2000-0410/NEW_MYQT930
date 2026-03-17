deviceControl = new class{
    //刷新仪器
    refresh(){
       websocket.send(funcCode.rI)
       main.setCallbacks(funcCode.rI,(rev)=>{
           device.devSN = rev.getStrdevsnList()
           this.updateInfo()
       })
    }
    //配置仪器
    configDevice(){
        if(fConfig.deviceChoose.chooseLaser === device.laser.isChecked&&fConfig.deviceChoose.chooseMotor === device.rTOT.isChecked&&fConfig.deviceChoose.chooseTango === device.dT.isChecked&&fConfig.deviceChoose.chooseCamera === device.camera.isChecked)
            return
        let data = {devInexBuf: [device.laser.isChecked,device.rTOT.isChecked,device.dT.isChecked,device.camera.isChecked]}
        websocket.send(funcCode.EnableDevices,data,false)
        main.setCallbacks(funcCode.EnableDevices,(rev)=>{
            fConfig.deviceChoose.chooseLaser  = device.laser.isChecked;
            fConfig.deviceChoose.chooseMotor = device.rTOT.isChecked;
            fConfig.deviceChoose.chooseTango = device.dT.isChecked;
            fConfig.deviceChoose.chooseCamera = device.camera.isChecked;
            main.showLight()
        })
    }
    //设备连接
    connect(t){
        let [code,data] = ["",{}]
        switch (t) {
            case deviceType.spec:{
                code = funcCode.specC;
                data.sn = fConfig.deviceAutoConn.specType = $("#specInfo").val()
                data.wavelen = fConfig.centerwave
                data.um = fConfig.slit
                deviceControl.specCallback()
            }break;
            case deviceType.dc:{
                code = funcCode.dcC;
                data.sn = fConfig.deviceAutoConn.ccdType = $("#dcInfo").val()
            }break;
            case deviceType.rTot:{
                code = funcCode.RTotC;
                data.sn = fConfig.deviceAutoConn.motorType = $("#rTotInfo").val()
            }break;
            case deviceType.dt:{
                code = funcCode.dtC;
                data.sn = fConfig.deviceAutoConn.tangoCom = $("#dTInfo").val()
            }break;
            case deviceType.laser:{
                code = funcCode.laserC;
                data.sn = fConfig.deviceAutoConn.laserCom = $("#laserInfo").val()
            }break;
            case deviceType.camera:{
                code = funcCode.cameraC;
                data.sn = fConfig.deviceAutoConn.cameraType = $("#cameraInfo").val()
            }break;
        }
        if ([null,''].includes(data.sn)) {
            jeBox.msg($.i18n.prop('tips-choseDevice'),{icon: 1})
            return;
        }
        if (t === deviceType.dt) {
            this.initTango(code,data)
            return;
        }
       websocket.send(code, data)
       main.setCallbacks(code,(rev)=>{deviceControl.updateConnectVal(code,rev)})

    }
    //设备断开
    disConnect(t){
        let code = ""
        switch (t) {
            case deviceType.spec:{
                code = funcCode.specDisC;
            }break;
            case deviceType.dc:{
                code = funcCode.dcDisC;
            }break;
            case deviceType.rTot:{
                code = funcCode.RTOtDisC;
            }break;
            case deviceType.dt:{
                code = funcCode.dtDisC;
            }break;
            case deviceType.laser:{
                code = funcCode.laserDisC;
            }break;
            case deviceType.camera:{
                code = funcCode.cameraDisC;
            }break;
        }
        websocket.send(code, {})
        main.setCallbacks(code,(rev)=>{deviceControl.updateConnectVal(code,rev)})
    }
    //全部连接
    allConnect(){
        let arr = [funcCode.specC,funcCode.dcC,funcCode.RTotC,funcCode.dtC,funcCode.laserC,funcCode.cameraC]
        arr.forEach(cur=>{main.setCallbacks(cur,(rev)=>{deviceControl.updateConnectVal(cur,rev)})})

        let data = {
            specDevSN:'',
            ccdDevSN:'',
            laserDevSN:'',
            motorDevSN:'',
            tangoDevSN:'',
            tangoFlag:false,
            cameraDevSN:''
        }
        data.specDevSN  = device.spec.isConnected?'':fConfig.deviceAutoConn.specType = $("#specInfo").val()
        data.ccdDevSN =  device.ccd.isConnected?'':fConfig.deviceAutoConn.ccdType = $("#dcInfo").val()
        if (data.specDevSN !== '') {
            deviceControl.specCallback()
        }
        if(fConfig.deviceChoose.chooseLaser) {
            data.laserDevSN =device.laser.isConnected?'':fConfig.deviceAutoConn.laserCom = $("#laserInfo").val()
        }
        if(fConfig.deviceChoose.chooseMotor) {
            data.motorDevSN= device.rTOT.isConnected?'':fConfig.deviceAutoConn.motorType =$("#rTotInfo").val()
        }

        if(fConfig.deviceChoose.chooseCamera) {
            data.cameraDevSN =  device.camera.isConnected?'':fConfig.deviceAutoConn.cameraType =$("#cameraInfo").val()
        }
        if(fConfig.deviceChoose.chooseTango) {
            data.tangoDevSN = device.dT.isConnected?'':fConfig.deviceAutoConn.tangoCom=$("#dTInfo").val()
            if(!device.dT.isConnected){
                jeBox.open({
                    title:$.i18n.prop('tips-dt-title'),
                    boxSize:["280px","125px"],
                    content:$.i18n.prop('tips-dt-msg'),
                    maskLock : true ,
                    maskClose: false,
                    btnAlign:"center",
                    button:[
                        {
                            name: $.i18n.prop('tips-dt-yes'),
                            callback: function(index){
                                data.tangoFlag = true
                                websocket.send(funcCode.DevConnectAll,data)
                                jeBox.close(index);
                            }
                        },
                        {
                            name: $.i18n.prop('tips-dt-not'),
                            callback:function(index){
                                data.tangoFlag = false
                                websocket.send(funcCode.DevConnectAll,data)
                                jeBox.close(index);
                            }
                        }
                    ]
                })
                return
            }
        }
        websocket.send(funcCode.DevConnectAll,data)
    }
    //全部断开
    allDisConnect(){
        let data = {discFlags:[device.spec.isConnected,device.ccd.isConnected,device.laser.isConnected,device.rTOT.isConnected,device.camera.isConnected,device.dT.isConnected]}
        let arr = [funcCode.specDisC,funcCode.dcDisC,funcCode.RTOtDisC,funcCode.dtDisC,funcCode.laserDisC,funcCode.cameraDisC]
        arr.forEach(cur=>{main.setCallbacks(cur,(rev)=>{deviceControl.updateConnectVal(cur,rev)})})
        websocket.send(funcCode.DevDisconnectAll,data)
    }
    //开机自动连接
    autoConnect(){
        if(fConfig.deviceAutoConn.iSpecAutoC === device.spec.auto&&fConfig.deviceAutoConn.isCcdAutoC === device.ccd.auto&&fConfig.deviceAutoConn.isLaserAutoC === device.laser.auto&&fConfig.deviceAutoConn.isMotorAutoC === device.rTOT.auto&&fConfig.deviceAutoConn.isMovedAutoC === device.dT.auto&&fConfig.deviceAutoConn.isCameraAutoC === device.camera.auto)
        return
        let data = {flags:[device.spec.auto,device.ccd.auto,device.laser.auto,device.rTOT.auto,device.camera.auto,device.dT.auto]}
        websocket.send(funcCode.DevAutoConnect,data)
        main.setCallbacks(funcCode.DevAutoConnect,rev=>{
            main.log(funcCode.DevAutoConnect,rev.getBstatus())
            fConfig.deviceAutoConn.iSpecAutoC = device.spec.auto
            fConfig.deviceAutoConn.isCcdAutoC = device.ccd.auto
            fConfig.deviceAutoConn.isLaserAutoC = device.laser.auto
            fConfig.deviceAutoConn.isMotorAutoC = device.rTOT.auto
            fConfig.deviceAutoConn.isMovedAutoC = device.dT.auto
            fConfig.deviceAutoConn.isCameraAutoC = device.camera.auto
        })
    }
    //激发波长切换
    setEW(t){
        let old = fConfig.excwave
        let EW = t===0?$("#steadyEW").val():t===1?$("#waveEW").val():$("#polarEW").val()
        let pwId = t===0?$("#steadyPower"):t===1?$("#wavePower"):$("#polarPower")
        if (EW === 'null') EW = '空'
        fConfig.excwave = EW

        websocket.send(funcCode.eWS,{"oldValue":old,"newValue":EW})

        main.setCallbacks(funcCode.laserPowerGears,rev=>{
            fConfig.excwaveselect.forEach(val=>{
                if(val.name === EW) {
                    pwId.empty()
                    pwId.append("<option>"+$.i18n.prop('main-test-zero'))
                    Object.values(val.power).forEach((cur)=>{pwId.append("<option>"+cur)})
                }
            })
            this.setPower(t)
            let gratingNum = t===0?$("#steadyGrating").get(0).selectedIndex+1
	        	:t===1?$("#waveGrating").get(0).selectedIndex+1
	        	:$("polarGrating").get(0).selectedIndex+1;
	        let dLaserWave = 0.0;
	        fConfig.excwave=EW
	        if (fConfig.excwave==="空"||gratingNum===0) {
	            dLaserWave=fConfig.excwaveselect[0].E;
	        } else{
	            fConfig.excwaveselect.forEach((cur)=>{
	                if(cur.name === fConfig.excwave){
	                    dLaserWave=cur["grating"+gratingNum];
	                }
	            })
	        }
	        let sendParam = {};
	        sendParam.laserWave = dLaserWave;
            let unit = $($("span.showUnit").get(0)).html()
            if(unit=="cm-1")
        	{
	            
		       	if(t===0){
		       		sendParam.array = [parseFloat($("input#steadyCW").val())];
		       	}
		       	else if(t===2){
		       		sendParam.array = [parseFloat($("input#polarCW").val())];
		       	}
		       	else{
		       		sendParam.array = [parseFloat($("input#waveFrom").val())
		       		,parseFloat($("input#waveTo").val())];
		       	}

	        	websocket.send(funcCode.CmToNmParams,sendParam);
	            main.setCallbacks(funcCode.CmToNmParams,rev =>{
	                let selectW = rev.getPdList();
		            if(t===0){
		            	$("input#steadyCW").attr("nm",selectW[0]);
		            	fConfig.centerwave = selectW[0]
		            }else if(t===2){
		            	$("input#polarCW").attr("nm",selectW[0]);
		            	fConfig.centerwave = selectW[0]
		            }
		            else{
		            	$("input#waveFrom").attr("nm",selectW[0]);
		            	$("input#waveTo").attr("nm",selectW[1]);
		            	fConfig.spectrumfrom = selectW[0]
		            	fConfig.spectrumto = selectW[1]
		            }
		        });
		    }
        	setTimeout(function(){
        		let minNM = 0;
        		let maxNM = 0;
        		let doms = [];
        		if($("input#steadyCW").length>0){
        			doms.push($("input#steadyCW"))
        			maxNM = parseFloat($("input#steadyCW").attr("max"))
        		}else if($("input#polarCW").length>0){
        			doms.push($("input#polarCW"))
        			maxNM = parseFloat($("input#polarCW").attr("max"))
        		}else{
        			doms.push($("input#waveFrom"))
        			doms.push($("input#waveTo"))
        			maxNM = parseFloat($("input#waveFrom").attr("max"))
        		}
        		deviceControl.updateScanRange(doms,dLaserWave,minNM,maxNM)
        	},1000)
        })
    }
    //功率切换
    setPower(t){
        let EW = t===0?$("#steadyEW").val():t===1?$("#waveEW").val():$("#polarEW").val()
        if (EW === 'null') EW = '空'
        let power =t===0?$("#steadyPower").val():t===1?$("#wavePower").val():$("#polarPower").val()
        if (power === 'zero') power ='归零'
        fConfig.excwave = EW
        fConfig.powervalue = power
        websocket.send(funcCode.pS,{"excWave":EW,"powerValue":power})
    }
    //针孔尺寸设置
    setPZ(t){
        let pz =t===0?$("#steadyPZ").val():t===1?$("#wavePZ").val():$("#polarPZ").val()
        fConfig.pinhole = pz
        websocket.send(funcCode.pSS,{"pinhole":pz})
    }
    //光栅设置
    setGrating(t){
        let temp= t===0?$("#steadyGrating"):t===1?$("#waveGrating"):$("#polarGrating")
        let grating = temp.val()
        let gratingIdx = temp.get(0).selectedIndex+1
        let unit = t===0?$("#steadyUnit").text():t===1?$("#waveFUnit").text():$("#polarUnit").text()
        fConfig.grating = grating
        device.spec.grating = gratingIdx
		let gratingNum = t===0?$("#steadyGrating").get(0).selectedIndex+1
        	:t===1?$("#waveGrating").get(0).selectedIndex+1
        	:$("#polarGrating").get(0).selectedIndex+1;
        let dLaserWave = 0.0;
        if (fConfig.excwave==="空"||gratingNum===0) {
            dLaserWave=fConfig.excwaveselect[0].E;
        } else{
            fConfig.excwaveselect.forEach((cur)=>{
                if(cur.name === fConfig.excwave){
                    dLaserWave=cur["grating"+gratingNum];
                }
            })
        }
        let sendParam = {};
        sendParam.laserWave = dLaserWave;
        if(unit=="cm-1")
    	{
            
	       	if(t===0){
	       		sendParam.array = [parseFloat($("input#steadyCW").val())];
	       	}
	       	else if(t===2){
	       		sendParam.array = [parseFloat($("input#polarCW").val())];
	       	}
	       	else{
	       		sendParam.array = [parseFloat($("input#waveFrom").val())
	       		,parseFloat($("input#waveTo").val())];
	       	}

        	websocket.send(funcCode.CmToNmParams,sendParam,false);
            main.setCallbacks(funcCode.CmToNmParams,rev =>{
                let selectW = rev.getPdList();
	            if(t===0){
	            	$("input#steadyCW").attr("nm",selectW[0]);
	            	fConfig.centerwave = selectW[0]
	            }else if(t===2){
	            	$("input#polarCW").attr("nm",selectW[0]);
	            	fConfig.centerwave = selectW[0]
	            }
	            else{
	            	$("input#waveFrom").attr("nm",selectW[0]);
	            	$("input#waveTo").attr("nm",selectW[1]);
	            	fConfig.spectrumfrom = selectW[0]
	            	fConfig.spectrumto = selectW[1]
	            }
	            setTimeout(function(){
	            	websocket.send(funcCode.gS,{"grating":grating,'unit':unit})
					main.setCallbacks(funcCode.gs,rev=>{})
					main.setCallbacks(funcCode.GetMaxWavelen,rev=>{
			            device.spec.maxRangeNM = rev.getNmval()
			            device.spec.maxRangeCM = rev.getCmval()
			            $('#steadyCW').attr('max',rev.getNmval())
			            $('#polarCW').attr('max',rev.getNmval());
			            $('#waveFrom').attr('max',rev.getNmval())
			            $('#waveTo').attr('max',rev.getNmval())
			            setTimeout(function(){
				    		let minNM = 0;
				    		let maxNM = 0;
				    		let doms = [];
				    		if($("input#steadyCW").length>0){
				    			doms.push($("input#steadyCW"))
				    			maxNM = parseFloat($("input#steadyCW").attr("max"))
				    		}else if($("input#polarCW").length>0){
				    			doms.push($("input#polarCW"))
				    			maxNM = parseFloat($("input#polarCW").attr("max"))
				    		}
				    		else{
				    			doms.push($("input#waveFrom"))
				    			doms.push($("input#waveTo"))
				    			maxNM = parseFloat($("input#waveFrom").attr("max"))
				    		}
				    		deviceControl.updateScanRange(doms,dLaserWave,minNM,maxNM)
				    	},1000)
			        })
	            },500);
	       });
	    }else{
	    	websocket.send(funcCode.gS,{"grating":grating,'unit':unit})
			main.setCallbacks(funcCode.gs,rev=>{
//				deviceControl.GetMaxWavelen()
				})
			main.setCallbacks(funcCode.GetMaxWavelen,rev=>{
	            device.spec.maxRangeNM = rev.getNmval()
	            $('#steadyCW').attr('max',rev.getNmval())
	            $('#polarCW').attr('max',rev.getNmval())
	            $('#waveFrom').attr('max',rev.getNmval())
	            $('#waveTo').attr('max',rev.getNmval())
	            setTimeout(function(){
		    		let minNM = 0;
		    		let maxNM = 0;
		    		let doms = [];
		    		if($("input#steadyCW").length>0){
		    			doms.push($("input#steadyCW"))
		    			maxNM = parseFloat($("input#steadyCW").attr("max"))
		    		}else if($("input#polarCW").length>0){
		    			doms.push($("input#polarCW"))
		    			maxNM = parseFloat($("input#polarCW").attr("max"))
		    		}else{
		    			doms.push($("input#waveFrom"))
		    			doms.push($("input#waveTo"))
		    			maxNM = parseFloat($("input#waveFrom").attr("max"))
		    		}
		    		deviceControl.updateScanRange(doms,dLaserWave,minNM,maxNM)
		    	},1000)
	        })
	    }
        
    	
    }
    //狭缝设置
    setSlit(t){
        let dom = t===0?$("#steadySlit"):t===1?$("#waveSlit"):$("#polarSlit")
        if(isNaN(parseInt(dom.val()))) return jeBox.msg($.i18n.prop('tips-scan-paramNAN'),{icon:1})
        let slit = inputRange.isOutRange(dom,function (dom,old,cur,min,max) {
            if ((cur < min)||(cur > max)) {
                jeBox.msg($.i18n.prop('tips-range-slitMsg1')+min+"~"+max,{icon:1})
                dom.val(old)
                return false
            }
            if(cur%10!==0){
                jeBox.msg($.i18n.prop('tips-range-slitMsg2'),{icon:1})
                dom.val(old)
                return false
            }
            return true
        },false)
        websocket.send(funcCode.slitSet,{"slit":slit})
        fConfig.slit = slit
    }
    //积分时间设置
    setExpTime(t){
        let expTime = t===0?$("#steadyExp").val():t===1?$("#waveExp").val():$("#polarExp").val();
        if (expTime === '') return jeBox.msg($.i18n.prop('tips-scan-paramNAN'),{icon:1})
        if(parseFloat(expTime)===0) return jeBox.msg($.i18n.prop('tips-scan-expZero'),{icon:1})
        fConfig.expTime = expTime
        websocket.send(funcCode.iTS,{"exp":expTime})
    }
    //中心波长设置
    setCW(){
        let grating = ($("#steadyGrating").get(0).selectedIndex+1).toString()
        let stCW = $("#steadyCW")
        let unit = $("#steadyUnit").text()
        if(isNaN(parseFloat(stCW.val()))) return jeBox.msg($.i18n.prop('tips-scan-paramNAN'),{icon:1})
        let cw = inputRange.isOutRange(stCW,function (dom,old,cur,min,max) {
            if ((cur < min)||(cur > max)) {
                jeBox.msg($.i18n.prop('tips-range-centerWaveMsg')+min+"~"+max,{icon:1})
                dom.val(old)
                return false

            }
            return true
        },(unit==="cm-1"))
        if(unit==="cm-1"){
        	let [radio,sEw,wEw,wG,sG] = [$("input.custom-radio"),$("select#steadyEW"),$("select#waveEW"),$("select#waveGrating"),$("select#steadyGrating")]
        	let laserWaveVal = sEw.length===0?wEw.val():sEw.val();
	        let gratingNum = sEw.length===0?(wG.get(0).selectedIndex<0?1:wG.get(0).selectedIndex+1):(sG.get(0).selectedIndex<0?1:sG.get(0).selectedIndex+1);
			let dLaserWave = 0.0;
			console.log(laserWaveVal+gratingNum);
	        if (laserWaveVal===$.i18n.prop('main-test-null')) {
	            dLaserWave=fConfig.excwaveselect[0].E;
	        } else{
	            fConfig.excwaveselect.forEach((cur)=>{
	                if(cur.name === laserWaveVal){
	                    dLaserWave=cur["grating"+gratingNum];
	                }
	            })
	        }
        	let sendParam = {};
            sendParam.laserWave = dLaserWave;
            sendParam.array = [cw];
        	websocket.send(funcCode.CmToNmParams,sendParam);
            main.setCallbacks(funcCode.CmToNmParams,rev =>{
                let selectW = rev.getPdList();
                $("#steadyCW").attr("nm",selectW[0]);
                fConfig.centerwave = selectW[0]
                setTimeout(function(){
                	websocket.send(funcCode.cWS,{"grating":grating,"unit":unit,"cw": selectW[0].toFixed(4)})
	            },100);
            })
        }else{
            stCW.attr("nm",cw);
        	fConfig.centerwave = cw
        	websocket.send(funcCode.cWS,{"grating":grating,"unit":unit,"cw": cw})
        }
       	 
    }
    
    //中心波长设置
    setPolarCW(){
        let grating = ($("#polarGrating").get(0).selectedIndex+1).toString()
        let stCW = $("#polarCW")
        let unit = $("#polarUnit").text()
        if(isNaN(parseFloat(stCW.val()))) return jeBox.msg($.i18n.prop('tips-scan-paramNAN'),{icon:1})
        let cw = inputRange.isOutRange(stCW,function (dom,old,cur,min,max) {
            if ((cur < min)||(cur > max)) {
                jeBox.msg($.i18n.prop('tips-range-centerWaveMsg')+min+"~"+max,{icon:1})
                dom.val(old)
                return false

            }
            return true
        },(unit==="cm-1"))
        if(unit==="cm-1"){
        	let [radio,sEw,wEw,wG,sG] = [$("input.custom-radio"),$("select#polarEW"),$("select#waveEW"),$("select#waveGrating"),$("select#polarGrating")]
        	let laserWaveVal = $("select#polarEW").val();
	        let gratingNum = $("select#polarGrating").get(0).selectedIndex+1;
			let dLaserWave = 0.0;
			console.log(laserWaveVal+gratingNum);
	        if (laserWaveVal===$.i18n.prop('main-test-null')) {
	            dLaserWave=fConfig.excwaveselect[0].E;
	        } else{
	            fConfig.excwaveselect.forEach((cur)=>{
	                if(cur.name === laserWaveVal){
	                    dLaserWave=cur["grating"+gratingNum];
	                }
	            })
	        }
        	let sendParam = {};
            sendParam.laserWave = dLaserWave;
            sendParam.array = [cw];
        	websocket.send(funcCode.CmToNmParams,sendParam);
            main.setCallbacks(funcCode.CmToNmParams,rev =>{
                let selectW = rev.getPdList();
                $("#polarCW").attr("nm",selectW[0]);
                fConfig.centerwave = selectW[0]
                setTimeout(function(){
                	websocket.send(funcCode.cWS,{"grating":grating,"unit":unit,"cw": selectW[0].toFixed(4)})
	            },100);
            })
        }else{
            stCW.attr("nm",cw);
        	fConfig.centerwave = cw
        	websocket.send(funcCode.cWS,{"grating":grating,"unit":unit,"cw": cw})
        }
       	 
    }
    //设置对应偏振的角度
    updatePolarAngle(){
    	var nPolarType = $("#polarType").get(0).selectedIndex;
    	$("#polarDegress").val();
    	
    }
    //读取滤光片轮是否安装
    isSetupFilter(){
        websocket.send(funcCode.IsSetupFilter,{})
        main.setCallbacks(funcCode.IsSetupFilter,rev=>{
            let setup=rev.getBstatus()?$.i18n.prop("state-install"):$.i18n.prop("state-uninstall")
            let info = $.i18n.prop(funcCode.IsSetupFilter)+setup
            main.addMsg(info,true)
            device.spec.filter.setup=rev.getBstatus()
        })
    }
    //更新光栅的扫描范围
    updateScanRange(doms,dLaserWave,minNM,maxNM){
    	let sendParam = {};
        sendParam.laserWave = dLaserWave;
        sendParam.array = [minNM,maxNM];
        websocket.send(funcCode.NmToCmParams,sendParam);
        main.setCallbacks(funcCode.NmToCmParams,rev =>{
            let selectW = rev.getPdList();
            device.spec.minRangeCM = selectW[0]
            device.spec.maxRangeCM = selectW[1]
            for(var i=0;i<doms.length;i++){
            	doms[i].attr("mincm",selectW[0])
            	doms[i].attr("maxcm",selectW[1])
            }
            let min = $($("span.showUnit").get(0)).html()=="nm"?0:device.spec.minRangeCM;
            let max = $($("span.showUnit").get(0)).html()=="nm"?device.spec.maxRangeNM:device.spec.maxRangeCM;
            if($('#steadyCW').length>0){
            	if(min>parseFloat($('#steadyCW').val())||
            		max<parseFloat($('#steadyCW').val())){
        			setTimeout(function(){
            			jeBox.msg($.i18n.prop('tips-range-centerWaveMsg')+min+"~"+max.toFixed(2),{icon:1})
            		},1000)
            		
            	}
            }else{
            	if(min>parseFloat($('#waveFrom').val())||
            		max<parseFloat($('#waveFrom').val())){
            		setTimeout(function(){
            			jeBox.msg($.i18n.prop('tips-range-centerWaveMsg')+min+"~"+max.toFixed(2),{icon:1})
            		},1000)
            	}else if(min>parseFloat($('#waveTo').val())||
            		max<parseFloat($('#waveTo').val())){
            		setTimeout(function(){
            			jeBox.msg($.i18n.prop('tips-range-centerWaveMsg')+min+"~"+max.toFixed(2),{icon:1})
            		},1000)
            	}
            }
        })
    }
    //读取ccd尺寸
    readCCDSize(){
        websocket.send(funcCode.readCCDSize,{})
    }
    //读取ccd积分时间
    readCCDExpTime(){
        websocket.send(funcCode.readCCDExpTime,{})
    }
    //设置增益
    setCamGain(){
        websocket.send(funcCode.setGain,{"idx":1})
    }
    //读取ccd谱线数据
    DataAcqOneShot(){
        websocket.send(funcCode.DataAcqOneShot,{"idx":1})
    }
    //停止读取ccd影像 强行中断采集(针对长积分时间)
    TerminateData(){
        websocket.send(funcCode.TerminateData,{})
    }
    //设置ccd显示方向 设置采集图像翻转
    SetCCDImageMirror(idx){
        fConfig.ccdConf.ccdMirror = idx
        websocket.send(funcCode.SetCCDImageMirror,{"bHMirror":idx})
        main.setCallbacks(funcCode.SetCCDImageMirror,rev => {
            let info = $.i18n.prop('funCode-'+funcCode.SetCCDImageMirror+'-'+idx) + $.i18n.prop('state-'+rev.getBstatus());
            main.addMsg(info,rev.getBstatus())
        })
    }
    //位移台初始化
    initTango(code,data){
        jeBox.open({
            title:$.i18n.prop('tips-dt-title'),
            boxSize:["280px","125px"],
            content:$.i18n.prop('tips-dt-msg'),
            maskLock : true ,
            btnAlign:"center",
            button:[
                {
                    name: $.i18n.prop('tips-dt-yes'),
                    callback: function(index){
                        websocket.send(funcCode.MCEMotorInit,{devSn:data.sn,flag:true})
                        jeBox.close(index);
                    }
                },
                {
                    name: $.i18n.prop('tips-dt-not'),
                    callback:function(index){
                        websocket.send(funcCode.MCEMotorInit,{devSn:data.sn,flag:false})
                        jeBox.close(index);
                    }
                }
            ]
        })
        main.setCallbacks(code,(rev)=>{deviceControl.updateConnectVal(code,rev)})
    }
    //打开白光图像
    MCEOpenWhiteLightImage(){
        websocket.send(funcCode.MCEOpenWhiteLightImage,{"mode":fConfig.excwave})
    }
    //关闭白光图像
    MCECloseWhiteLightImage(){
        websocket.send(funcCode.MCECloseWhiteLightImage,{"mode":fConfig.excwave,"power":fConfig.powervalue})
    }

    //保存测试方案
    saveTestScheme(data){
        let flag = false
        if (data.funnm === 0) {
          flag =  steady.addTestPlan(Math.floor(Math.random() * 100),data.name)
        }else {
          flag =  wavelength.addTestPlan(Math.floor(Math.random() * 100),data.name)
        }
        if (!flag) return
        websocket.send(funcCode.SaveTestScheme,data)
    }

    //应用测试方案
    applyTestPlan(data){
        websocket.send(funcCode.UseTestScheme,data)
        main.setCallbacks(funcCode.UseTestScheme,rev=>{
            if (fConfig.funnm === data.funNm) {
                (data.funNm ===0?steady:wavelength).updateParam()
            }else {
                $("#"+(data.funNm ===0?'steadyScan':'waveScan')).click()
            }
        })
    }
    //读取测试方案内容
    getTestScheme(data){
        console.log(data)
        websocket.send(funcCode.GetTestScheme,data)
    }
    //读取光栅的最大扫描范围
    GetMaxWavelen(){
        websocket.send(funcCode.GetMaxWavelen,{})
        main.setCallbacks(funcCode.GetMaxWavelen,rev=>{
            device.spec.maxRangeNM = rev.getNmval()
            device.spec.maxRangeCM = rev.getCmval()
            console.log(funcCode.GetMaxWavelen)
            console.log(rev)
            $('#steadyCW').attr('min',device.spec.minRangeNM)
            $('#steadyCW').attr('max',rev.getNmval())
            $('#steadyCW').attr('maxCM',rev.getCmval())
            $('#steadyCW').attr('minCM',device.spec.minRangeCM)
            $('#polarCW').attr('min',device.spec.minRangeNM)
            $('#polarCW').attr('max',rev.getNmval())
            $('#polarCW').attr('maxCM',rev.getCmval())
            $('#polarCW').attr('minCM',device.spec.minRangeCM)
            $('#waveFrom').attr('min',device.spec.minRangeNM)
            $('#waveFrom').attr('max',rev.getNmval())
            $('#waveFrom').attr('maxCM',rev.getCmval())
            $('#waveFrom').attr('minCM',device.spec.minRangeCM)
            $('#waveTo').attr('min',device.spec.minRangeNM)
            $('#waveTo').attr('max',rev.getNmval())
            $('#waveTo').attr('maxCM',rev.getCmval())
            $('#waveTo').attr('minCM',device.spec.minRangeCM)
            
            
        })
    }
    //更新设备信息
    updateInfo(){
       //let  DevSn = {"1":"A2-SDF","2":"A4-SDF","3":"SDFGSE"}
        $("#specInfo").empty()
        $("#rTotInfo").empty()
       Object.values(device.devSN).forEach(function (cur) {
           $("#specInfo").append("<option>"+cur)
           $("#rTotInfo").append("<option>"+cur)
       })
        $("#specAuto").prop('checked',  fConfig.deviceAutoConn.iSpecAutoC)
        $("#dcAuto").prop('checked',    fConfig.deviceAutoConn.isCcdAutoC)
        $("#dTAuto").prop('checked',    fConfig.deviceAutoConn.isMovedAutoC)
        $("#laserAuto").prop('checked', fConfig.deviceAutoConn.isLaserAutoC)
        $("#rTotAuto").prop('checked',  fConfig.deviceAutoConn.isMotorAutoC)
        $("#cameraAuto").prop('checked',fConfig.deviceAutoConn.isCameraAutoC)
    }

    //开机自动连接
    openAuto(){
        if(!fConfig.deviceAutoConn.iSpecAutoC&&!fConfig.deviceAutoConn.isCcdAutoC&&!fConfig.deviceChoose.isMovedAutoC&&!fConfig.deviceChoose.isLaserAutoC&&!fConfig.deviceChoose.isMotorAutoC&&!fConfig.deviceChoose.isCameraAutoC)return
        let arr = [funcCode.specC,funcCode.dcC,funcCode.RTotC,funcCode.dtC,funcCode.laserC,funcCode.cameraC]
        arr.forEach(cur=>{main.setCallbacks(cur,(rev)=>{deviceControl.updateConnectVal(cur,rev)})})
        let data = {
            specDevSN:'',
            ccdDevSN:'',
            laserDevSN:'',
            motorDevSN:'',
            tangoDevSN:'',
            tangoFlag:false,
            cameraDevSN:''
        }
        if (fConfig.deviceAutoConn.iSpecAutoC) {
           data.specDevSN = fConfig.deviceAutoConn.specType
        }
        if (data.specDevSN !== '') {
            deviceControl.specCallback()
        }
        if (fConfig.deviceAutoConn.isCcdAutoC) {
            data.ccdDevSN = fConfig.deviceAutoConn.ccdType
        }
        if (fConfig.deviceChoose.chooseLaser) {
            if (fConfig.deviceAutoConn.isLaserAutoC) {
                data.laserDevSN = fConfig.deviceAutoConn.laserCom
            }
        }
        if (fConfig.deviceChoose.chooseMotor) {
            if (fConfig.deviceAutoConn.isMotorAutoC) {
                data.motorDevSN = fConfig.deviceAutoConn.motorType
            }
        }
        if (fConfig.deviceChoose.chooseCamera) {
            if (fConfig.deviceAutoConn.isCameraAutoC) {
               data.cameraDevSN = fConfig.deviceAutoConn.cameraType
            }
        }
        if (fConfig.deviceChoose.chooseTango) {
            if (fConfig.deviceAutoConn.isMovedAutoC) {
                data.tangoDevSN = fConfig.deviceAutoConn.tangoCom
                jeBox.open({
                    title:$.i18n.prop('tips-dt-title'),
                    boxSize:["280px","125px"],
                    content:$.i18n.prop('tips-dt-msg'),
                    maskLock : true ,
                    maskClose: false,
                    btnAlign:"center",
                    button:[
                        {
                            name: $.i18n.prop('tips-dt-yes'),
                            callback: function(index){
                                data.tangoFlag = true
                                websocket.send(funcCode.DevConnectAll,data)
                                jeBox.close(index);
                            }
                        },
                        {
                            name: $.i18n.prop('tips-dt-not'),
                            callback:function(index){
                                data.tangoFlag = false
                                websocket.send(funcCode.DevConnectAll,data)
                                jeBox.close(index);
                            }
                        }
                    ]
                })
                return
            }
        }
        websocket.send(funcCode.DevConnectAll,data)
    }
    //更新连接状态值
    updateConnectVal(code,rev){
        let  arr = [funcCode.specC,funcCode.dcC,funcCode.RTotC,funcCode.dtC,funcCode.laserC,funcCode.cameraC]
        let status = false
        let type = "spec"
        switch (code) {
            case funcCode.specC:
            case funcCode.specDisC:{type = "spec";this.isSetupFilter()}break//查询滤光片轮是否安装

            case funcCode.dcC:
            case funcCode.dcDisC:{type = "ccd"}break
            case funcCode.RTotC:
            case funcCode.RTOtDisC:  {type = "rTOT"}break
            case funcCode.dtC:
            case funcCode.dtDisC:{type = "dT"}break
            case funcCode.laserC:
            case funcCode.laserDisC:{type = "laser"}break
            case funcCode.cameraC:
            case funcCode.cameraDisC:{type = "camera"}break
        }
        if (arr.includes(code)) {
            status = rev.getBstatus()
        }
        device[type].isConnected = status
        deviceControl.updateStatus()
        deviceControl.updateBtnState()
        main.updateLight()
    }

    //更新连接状态
    updateStatus(){
        //全部连接&断开
        let content = (device.spec.isConnected&&device.ccd.isConnected&&device.laser.isConnected&&device.dT.isConnected&&device.rTOT.isConnected&&device.camera.isConnected)
        let disContent = (!device.spec.isConnected&&!device.ccd.isConnected&&!device.laser.isConnected&&!device.dT.isConnected&&!device.rTOT.isConnected&&!device.camera.isConnected)
        $("#allConnect").prop('disabled',content)
        $("#allDisConnect").prop('disabled',disContent)
        //刷新
        $("#specRef").prop("disabled",(device.spec.isConnected||device.ccd.isConnected||device.rTOT.isConnected))
        //更新数采
        $("#dcInfo").val(fConfig.deviceAutoConn.ccdType)
        $("#dcInfo").prop("disabled",device.ccd.isConnected)
        $("#dcCon").prop("disabled",device.ccd.isConnected)
        $("#dcDisCon").prop("disabled",!device.ccd.isConnected)
        //$("#dcAuto").prop("disabled",!device.ccd.isConnected)
        //更新谱仪
        $("#specInfo option").length===0?$("#specInfo").append('<option>'+fConfig.deviceAutoConn.specType): $("#specInfo").val(fConfig.deviceAutoConn.specType)

        $("#specInfo").prop("disabled",device.spec.isConnected)
        $("#specCon").prop("disabled",device.spec.isConnected)
        $("#specDisCon").prop("disabled",!device.spec.isConnected)
        //$("#specAuto").prop("disabled",!device.spec.isConnected)
        //更新位移台
        $("#dTInfo").val(fConfig.deviceAutoConn.tangoCom)
        $("#dTInfo").prop("disabled",device.dT.isConnected)
        $("#dTCon").prop("disabled",device.dT.isConnected)
        $("#dTDisCon").prop("disabled",!device.dT.isConnected)
        //$("#dTAuto").prop("disabled",!device.dT.isConnected)
        //更新激光器
        $("#laserInfo").val(fConfig.deviceAutoConn.laserCom)
        $("#laserInfo").prop("disabled",device.laser.isConnected)
        $("#laserCon").prop("disabled",device.laser.isConnected)
        $("#laserDisCon").prop("disabled",!device.laser.isConnected)
        //$("#laserAuto").prop("disabled",!device.laser.isConnected)
        //更新光路电机
        $("#rTotInfo option").length === 0?$("#rTotInfo").append('<option>'+fConfig.deviceAutoConn.motorType):$("#rTotInfo").val(fConfig.deviceAutoConn.motorType)
        $("#rTotInfo").prop("disabled",device.rTOT.isConnected)
        $("#rTotCon").prop("disabled",device.rTOT.isConnected)
        $("#rTotDisCon").prop("disabled",!device.rTOT.isConnected)
       // $("#rTotAuto").prop("disabled",!device.rTOT.isConnected)
        //更新相机
        $("#cameraInfo").val(fConfig.deviceAutoConn.cameraType)
        $("#cameraInfo").prop("disabled",device.camera.isConnected)
        $("#cameraCon").prop("disabled",device.camera.isConnected)
        $("#cameraDisCon").prop("disabled",!device.camera.isConnected)
        //$("#cameraAuto").prop("disabled",!device.camera.isConnected)
        steady.updateState()
        wavelength.updateState()
        polar.updateState()
       // main.updateLight()
    }
    //谱仪回调
    specCallback(){
        let [slits,mirrors] = [[0,1,2,3],[0,1,2,3]]
        main.setCallbacks(funcCode.gratings,rev=>{device.spec.gratings = rev.getStrdevsnList()})//光栅参数
        main.setCallbacks(funcCode.currentGrating,rev=>{device.spec.grating = rev.getIval()
            steady.updateGrating()
            wavelength.updateGrating()
        });//读取当前光栅
        main.setCallbacks(funcCode.autoSlitType,rev=>{device.spec.slitType = rev.getCameraparam()})//狭缝类型
        main.setCallbacks(funcCode.getShutter,rev=>{
            let status = rev.getBhave()
            device.spec.shutter[0].setup = true;
            device.spec.shutter[0].status = status
        })//读取快门
        main.setCallbacks(funcCode.GetMaxWavelen,rev=>{
            device.spec.maxRangeNM = rev.getNmval()
            device.spec.maxRangeCM = rev.getCmval()
            $('#steadyCW').attr('min',device.spec.minRangeNM)
            $('#steadyCW').attr('max',rev.getNmval())
            $('#steadyCW').attr('maxCM',rev.getCmval())
            $('#steadyCW').attr('minCM',device.spec.minRangeCM)
            $('#polarCW').attr('min',device.spec.minRangeNM)
            $('#polarCW').attr('max',rev.getNmval())
            $('#polarCW').attr('maxCM',rev.getCmval())
            $('#polarCW').attr('minCM',device.spec.minRangeCM)
            $('#waveFrom').attr('min',device.spec.minRangeNM)
            $('#waveFrom').attr('max',rev.getNmval())
            $('#waveFrom').attr('maxCM',rev.getCmval())
            $('#waveFrom').attr('minCM',device.spec.minRangeCM)
            $('#waveTo').attr('min',device.spec.minRangeNM)
            $('#waveTo').attr('max',rev.getNmval())
            $('#waveTo').attr('maxCM',rev.getCmval())
            $('#waveTo').attr('minCM',device.spec.minRangeCM)
        })
        mirrors.forEach(cur=>{
            main.setCallbacks(funcCode.isMirror+cur,rev=>{
                let [idx]= [rev.getIndex()];
                let setup=mirrors.includes(idx)?$.i18n.prop("state-install"):$.i18n.prop("state-uninstall")
                let port = [0,1].includes(idx)?1:0
                let info =$.i18n.prop("funCode-"+funcCode.isMirror+"-"+port)+setup
                device.spec.mirror[port].setup = setup
                if(port===0){
                    device.spec.mirror[0].port = idx ===3
                }else {
                    device.spec.mirror[1].port = idx ===1
                }

                main.addMsg(info,rev.getBstatus())
            })
        })//读取摆镜安装状态
        slits.forEach(cur=>{
            main.setCallbacks(funcCode.isSlit+cur,rev=>{
                let [idx,setup]= [rev.getIndex(),rev.getBhave()];
                let info = $.i18n.prop("funCode-"+funcCode.isSlit+"-"+idx)+(setup?$.i18n.prop("state-install"):$.i18n.prop("state-uninstall"))
                device.spec.slit[idx].setup = setup
                main.addMsg(info,rev.getBstatus())
            })//是否有狭缝
        })//读取狭缝安装状态
    }
    //更新工具栏状态
    updateBtnState(){
        //谱仪相关
        $("#tools button[btnType='25']").prop("disabled",!device.spec.isConnected)
        $(".dropdown-menu button[btntype='25']").prop("disabled",!device.spec.isConnected)
        //数采相关
        $("#tools button[btnType='26']").prop("disabled",!device.ccd.isConnected)
        $(".dropdown-menu button[btntype='26']").prop("disabled",!device.ccd.isConnected)
        //位移台相关
        $("#tools button[btnType='27']").prop("disabled",!device.dT.isConnected)
        $(".dropdown-menu button[btntype='27']").prop("disabled",!device.dT.isConnected)
        //相机相关
        $("#tools button[btnType='2']").prop("disabled",!(device.camera.isConnected&&device.laser.isConnected&&device.rTOT.isConnected))
        //扫描相关
        $("#tools button[btnType='0']").prop("disabled",!(device.spec.isConnected&&device.ccd.isConnected))
        $("#tools button[btnType='1']").prop("disabled",!(device.spec.isConnected&&device.ccd.isConnected))
        //mapping相关
        $("#tools button[btnType='9']").prop("disabled",!(device.spec.isConnected&&device.ccd.isConnected&&device.camera.isConnected))
        $(".dropdown-menu button[btnType='9']").prop("disabled",!(device.spec.isConnected&&device.ccd.isConnected&&device.camera.isConnected))
    }

}()