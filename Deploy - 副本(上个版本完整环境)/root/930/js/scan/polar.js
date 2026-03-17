polar = new class{
    name = '';
    num = 1;
    x = [];
    data={};
    nameSet = new Set()
    names=[]
    
    //开始采集
    startScan(){
        let domCw = $("#polarCW")
        let expTime = parseFloat($("#polarExp").val())
        if(expTime===0) return jeBox.msg($.i18n.prop('tips-scan-expZero'),{icon:1})
        let acc = fConfig.totalnum =  parseInt($("#polarTotalNum").val())
        let interval = $("#polarInterval").prop("checked")
        let intervalTime = parseFloat($("#polarIntervalTime").val())
        let intervalNum = parseInt($("#polarIntervalNum").val())
        let excWave = $("#polarEW").val()
        let power = $("#polarPower").val()
        if (power === 'zero') power ='归零'
        let cenWave = parseFloat(domCw.attr("nm"))
        let unit = $("span#polarUnit").text()
        let gratingNum = $("#polarGrating").get(0).selectedIndex+1;
        let gratingVal = $("#polarGrating").val()
        let dLaserWave = 0.0;
        if (excWave===$.i18n.prop('main-test-null')||gratingNum===0) {
            dLaserWave=fConfig.excwaveselect[0].E;
        } else{
            fConfig.excwaveselect.forEach((cur)=>{
                if(cur.name === excWave){
                    dLaserWave=cur["grating"+gratingNum];
                }
            })
        }
        let curCenter =  parseFloat(domCw.val())
        let polarType = $("select#polarType").get(0).selectedIndex;
        let polarDeg = parseFloat($("input#polarDegrees").val())
        let polarStepDeg = parseFloat($("inout#polarDegreesStep").val());
        let polarStartDeg = parseFloat($("input#polarDegreesStart").val());
        let polarEndDeg = parseFloat($("input#polarDegreesEnd").val());
        
        if(isNaN(curCenter)) return  jeBox.msg($.i18n.prop('tips-scan-paramNAN'),{icon:1})
        this.data = {exp:expTime,acc:acc,laserWaveLength:dLaserWave,interval:interval,intervalTime:intervalTime,num:intervalNum,
        	excWave:excWave,power:power,cenWave:cenWave,unit:unit,grating:gratingVal,polarType:polarType,polarDeg:polarDeg,
        	polarStartDeg:polarStartDeg,polarEndDeg:polarEndDeg,polarStepDeg:polarStepDeg}
        if (this.paramIsNaN(this.data)) return

        websocket.send(funcCode.commandRunPolar,this.data)

        main.updateScanOption(true)
        this.name = 'L_s_'+new Date().getTime()
        this.names.length = 0 //清空名称记录
        main.setCallbacks(funcCode.commandRunPolar,rev =>{
//      	main.log(funcCode.commandRunPolar,rev.getBstatus())

        })
        
    }
    //停止采集
    stopScan(){
        websocket.send(funcCode.commandStopPolar,{})
        main.setCallbacks(funcCode.commandStopPolar,rev=>{
            main.log(funcCode.commandStopPolar,rev.getBstatus())
            let info = this.updateNewInfoByTest();
            let line= main.chart.series(steady.name)
            main.updateScanOption(false)
            $("#legendItem .legendItemBtn>button").prop('disabled',false)
            this.UpdateFileNames()
            // if (line === undefined) return
            // let y = line.get_data().y;
            // lineProcess.AddLineDataParams(info,steady.x,y,true,1);
        })
    }
    //发送曲线名称到缓存
    UpdateFileNames(){
        websocket.send(funcCode.UpdateFileNames,{lineNames:this.names,pdx:this.x})
    }

    //更新参数
    updateParam(){
        let [ewId,ew,pwId,cw,pz] = [$("#polarEW"),'',$("#polarPower"),$("#polarCW"),$("#polarPZ")]
        ewId.empty()
        fConfig.excwaveselect.forEach(val=>{
            if(val.chooseDevice){ ewId.append("<option>"+(val.name==='空'?$.i18n.prop('main-test-null'):val.name))}
            ewId.val(fConfig.excwave==='空'?$.i18n.prop('main-test-null'):fConfig.excwave)
            ew = ewId.val()
            if(ew==='null') ew = '空'
            if (val.name === ew) {
                pwId.empty()
                pwId.append("<option>"+$.i18n.prop('main-test-zero'))
                Object.values(val.power).forEach((cur)=>{$("#polarPower").append("<option>"+cur)})
            }
            // if(val.name === "pinhole"){
            //     $("#steadyPZ").empty()
            //     Object.values(val.M3COL).forEach((cur)=>{$("#steadyPZ").append("<option>"+cur)})
            // }
        })
        pz.empty()
        device.pinholeMsg.forEach((cur)=>{pz.append("<option>"+cur)})
        pwId.val(fConfig.powervalue==='归零'?$.i18n.prop('main-test-zero'):fConfig.powervalue)
        $("#polarGrating").val(fConfig.grating)
        pz.val(fConfig.pinhole)
        $("#polarSlit").val(fConfig.slit)
        $("#polarExp").val(fConfig.expTime)
        $("#polarInterval").prop("checked",fConfig.intervalflag)
        $("#polarIntervalTime").val(fConfig.intervaltime)
        $("#polarIntervalNum").val(fConfig.intervalnum===0?1:fConfig.intervalnum)
        $("#polarTotalNum").val(fConfig.totalnum ===0?1:fConfig.totalnum)
        $("span.showUnit").text(fConfig.waveunit)
        let gratingNum = device.spec.grating =  fConfig.grating.split("-")[0];
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

    	if(fConfig.polarUnit==="cm-1"){
    		//保存参数单位cm
    		
    		sendParam.array = [fConfig.polarCenter];
        	websocket.send(funcCode.CmToNmParams,sendParam);
            main.setCallbacks(funcCode.CmToNmParams,rev =>{
                let selectW = rev.getPdList();
                if(fConfig.polarUnit==="cm-1"){
	        		cw.val(fConfig.steadyCenter.toFixed(2))
	        		cw.attr("nm",selectW[0])
		        }else{
		        	cw.attr("nm",selectW[0])
		        	cw.val(selectW[0].toFixed(2))
		        }
                inputRange.addOldValue([$("#steadySlit"),cw])
            })
 
        }else{
        	//保存参数单位nm
        	cw.attr("nm",fConfig.polarCenter)
    		if(fConfig.polarUnit==="cm-1"){
	        	console.log(fConfig);
	            sendParam.array = [fConfig.polarCenter];
	        	websocket.send(funcCode.NmToCmParams,sendParam);
	            main.setCallbacks(funcCode.NmToCmParams,rev =>{
	                let selectW = rev.getPdList();
	                cw.val(selectW[0].toFixed(2))
	                inputRange.addOldValue([$("#steadySlit"),cw])
	            })
	        }else{
	            cw.val(fConfig.steadyCenter.toFixed(2))
	        }
        }
        cw.attr("nm",fConfig.centerwave);
        cw.attr('min',device.spec.minRangeNM)
        cw.attr('max',device.spec.maxRangeNM)
        cw.attr('maxCM',device.spec.maxRangeCM)
        cw.attr('minCM',device.spec.minRangeCM)

        inputRange.addOldValue([$("#steadySlit"),cw])
        this.updateState()
    }
    //更新状态
    updateState(){
        $("#polarEW").prop("disabled",!device.laser.isConnected)
        $("#polarPower").prop("disabled",!device.laser.isConnected)
        $("#polarPZ").prop("disabled",!device.rTOT.isConnected)
        $("#polarGrating").prop("disabled",((!device.spec.isConnected) ||(!device.ccd.isConnected)))
        $("#polarSlit").prop("disabled",!device.spec.isConnected)
        $("#polarCW").prop("disabled",!device.spec.isConnected)
        $("#polarExp").prop("disabled",!device.ccd.isConnected)
        $("#polarType").prop("disabled",!device.dT.isConnected)
        $("#polarDegrees").prop("disabled",!device.dT.isConnected)
        $("#polarDegreesStart").prop("disabled",!device.dT.isConnected)
        $("#polarDegreesEnd").prop("disabled",!device.dT.isConnected)
        this.updateGrating()
        this.updateSlitRange()
    }
    //更新光栅
    updateGrating(){
        let [t,arr] = [$("#polarGrating"),device.spec.gratings]
        t.empty()
        arr.forEach(cur=>{t.append("<option>"+cur)})
        if (t.get(0) === undefined) return
        t.get(0).selectedIndex = device.spec.grating-1//当前选择光栅
    }
    //狭缝可用范围
    updateSlitRange(){
        let [min,max,t]=[10,3000,$("#polarSlit")]
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
    //更新X轴数据
    switchXData(){
        let gratingNum = $("#polarGrating").get(0).selectedIndex+1;
        let dLaserWave = 0.0;
        fConfig.excwave=$("#polarEW").val()
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
        sendParam.array = this.x;
        websocket.send(funcCode.NmToCmParams,sendParam);
        main.setCallbacks(funcCode.NmToCmParams,rev =>{
            this.xCm = rev.getPdList();
        })
    }

    //更新扫描结果
    updateScanResult(rev){
        let [y,polarVal,polarDege] = [rev.getPdList(),rev.getPolarval(),rev.getDege()]
        let name = "Dege"+polarDege;
        if(this.names.indexOf(name)===(-1))this.names.push(name)

        let line = main.polarLineChart.add_series(name, 0);
        line.add_array(this.x,y)
        main.legend.addLegend(line)
        main.polarChart.addDataPoints(polarDege,polarVal);
        $("#legendItem .legendItemBtn>button").prop('disabled',true)
    }
    
    
    updateInfoByTest(){
    	let info={};
    	let temp = $("#mainBodyLeft div").first().attr("id");
		let type= temp.slice(0,temp.indexOf("D"))
		info.name           = this.name;
	    info.laserW         =$("#"+type+"EW").val();
	    info.power          =$("#"+type+"Power").val();
	    info.pinhole        =Number($("#"+type+"PZ").val());
	    info.strgrating     =$("#"+type+"Grating").val();
	    info.slitWidth      =Number($("#"+type+"Slit").val());
	    info.time           =$("#"+type+"Exp").val();
	    info.cwl            =Number($("#"+type+"CW").val());
	    info.accNum         =Number($("#"+type+"TotalNum").val());
	    info.interCheck     =$("input#polarInterval").prop("checked");
	    info.interTime      =Number($("input#polarIntervalTime").val());
	    info.interNum       =Number($("input#polarIntervalNum").val());
	    info.startWave      =0
	    info.endWave        =0
	    info.unit           =$("span.showUnit").text();
		let gratingNum      =$("#"+type+"Grating").get(0).selectedIndex+1;
		if (fConfig.excwave==="空") {
	        info.laserWaveLength=fConfig.excwaveselect[0].E;
	    } else{
	        fConfig.excwaveselect.forEach((cur)=>{
	            if(cur.name === fConfig.excwave){
	               info.laserWaveLength=cur["grating"+gratingNum]
	            }
	        })
	    }
	    return info;
    }
	
	updateNewInfoByTest(){
    	let info={};
    	let temp = $("#mainBodyLeft div").first().attr("id");
		let type= temp.slice(0,temp.indexOf("D"))
		info.name           = this.name;
		info.strScanMode    =$.i18n.prop('main-polarTest-title');
	    info.strWave        =$("#"+type+"EW").val();
	    info.powervalue     =$("#"+type+"Power").val();
	    info.pinhole        =$("#"+type+"PZ").val();
	    info.grating        =$("#"+type+"Grating").val();
	    info.slit           =Number($("#"+type+"Slit").val());
	    info.ExpTime        =$("#"+type+"Exp").val();
	    info.strCenterWave  =$("#"+type+"CW").val();
	    info.totalnum       =Number($("#"+type+"TotalNum").val());
	    info.interCheck     =$("input#polarInterval").prop("checked")?"是":"否";
	    info.strIntervaltime=$("input#polarIntervalTime").val();
	    info.intervalnum    =Number($("input#polarIntervalNum").val());
	    info.strStartWave   =0
	    info.strEndWave     =0
	    info.unit           =$($("span.showUnit").get(0)).text();
		let gratingNum      =$("#"+type+"Grating").get(0).selectedIndex+1;
		if (fConfig.excwave===$.i18n.prop('main-test-null')) {
	        info.laserWaveLength=fConfig.excwaveselect[0].E;
	    } else{
	        fConfig.excwaveselect.forEach((cur)=>{
	            if(cur.name === fConfig.excwave){
	               info.laserWaveLength=cur["grating"+gratingNum]
	            }
	        })
	    }
	    return info;
    }

    //参数非法值判断
    paramIsNaN(data){
        let flag = false
        for (let k of Object.keys(data)){
                let msg = 'tips-scan-paramErr'
                switch (k) {
                    case 'excWave':{
                        if (data[k] === $.i18n.prop('main-test-null')) flag=true
                    }break
                    case 'exp':
                    case 'acc':
                    case 'cenWave':{
                        if (isNaN(data[k])) flag = true
                    }break
                    case 'num':
                    case 'intervalTime':{
                        if (data['interval']&&isNaN(data[k])) flag = true
                    }break
                }
                if (flag) return jeBox.msg($.i18n.prop(msg),{icon:1});
       }
        return flag
    }
}()