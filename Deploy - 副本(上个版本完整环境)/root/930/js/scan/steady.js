steady = new class{
    name = '';
    num = 1;
    x = [];
    data={};
    nameSet = new Set()
    names=[]
    //添加测试方案
    initTestPlan(){
        let arr = fConfig.stabSchemes;
        if (arr.length === 0)return;
        for (let i = 0; i <arr.length; i++) {
            let str = '<div class="dropdown-item testPlan" >' +
                '<button type="button" class="btn btn-secondary btn-sm" onclick="dialog.showTestBox(true,this)" id=steadyTest'+i+'><img src="source/image/stabilize.png" alt="">'+arr[i]+'</button>'+
                '<button type="button" class="btn btn-secondary btn-sm" onclick="steady.removeTestPlan(this)"><img alt="" src="source/image/close_white.png"></button>'+
                '</div>'
            $("#steadyTest").next(".dropdown-menu").append(str)
        }
    }
    //添加测试方案
    addTestPlan(i,name){
        if (this.nameSet.has(name)) {
            jeBox.msg($.i18n.prop('tips-testPlan-exists'),{icon:1})
            return false
        }
        this.nameSet.add(name)
        let str = '<div class="dropdown-item testPlan" >' +
            '<button type="button"  class="btn btn-secondary btn-sm" onclick="dialog.showTestBox(true,this)" id=steadyTest'+i+'><img src="source/image/stabilize.png" alt="">'+name+'</button>'+
            '<button type="button"  class="btn btn-secondary btn-sm" onclick="steady.removeTestPlan(this)"><img alt="" src="source/image/close_white.png"></button>'+
            '</div>'
        $("#steadyTest").next(".dropdown-menu").append(str)
        return  true
    }
    //删除测试方案
    removeTestPlan(tag){
        let name = $(tag).prev('button').text()
        main.setCallbacks(funcCode.DeleteTestScheme,(rev)=>{
            $(tag).parent().remove()
            this.nameSet.delete(name)
        })
        websocket.send(funcCode.DeleteTestScheme,{"funnm":0,"schemeName":name})
    }
    //开始采集
    startScan(){
        let domCw = $("#steadyCW")
        let expTime = parseFloat($("#steadyExp").val())
        if(expTime===0) return jeBox.msg($.i18n.prop('tips-scan-expZero'),{icon:1})
        let acc = fConfig.totalnum =  parseInt($("#steadyTotalNum").val())
        let interval = $("#steadyInterval").prop("checked")
        let intervalTime = parseFloat($("#steadyIntervalTime").val())
        let intervalNum = parseInt($("#steadyIntervalNum").val())
        let excWave = $("#steadyEW").val()
        let power = $("#steadyPower").val()
        if (power === 'zero') power ='归零'
        let cenWave = parseFloat(domCw.attr("nm"))
        let unit = $("span.showUnit").text()
        let gratingNum = $("#steadyGrating").get(0).selectedIndex+1;
        let gratingVal = $("#steadyGrating").val()
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
        if(isNaN(curCenter)) return  jeBox.msg($.i18n.prop('tips-scan-paramNAN'),{icon:1})
        this.data = {exp:expTime,acc:acc,laserWaveLength:dLaserWave,interval:interval,intervalTime:intervalTime,num:intervalNum,excWave:excWave,power:power,cenWave:cenWave,unit:unit,grating:gratingVal}
        if (this.paramIsNaN(this.data)) return

        websocket.send(funcCode.commandRunWD,this.data)

        main.updateScanOption(true)
        this.name = 'L_s_'+new Date().getTime()
        this.names.length = 0 //清空名称记录
        main.setCallbacks(funcCode.commandRunWD,rev =>{ main.log(funcCode.commandRunWD,rev.getBstatus())})
        if (interval) {
            main.setCallbacks(funcCode.commandStopWD,rev=>{
                main.log(funcCode.commandStopWD,rev.getBstatus());
                main.updateScanOption(false)
                $("#legendItem .legendItemBtn>button").prop('disabled',false)
                this.UpdateFileNames()

                // let lineNames = Array.from(main.chart.all_series().keys());
                // lineNames = lineNames.slice(lineNames.length-intervalNum,lineNames.length);
                //
                // for(let ind = 0;ind<intervalNum;ind++){
                //     let info = steady.updateNewInfoByTest();
                //     info.name = lineNames[ind];
                //     let y = main.chart.series(lineNames[ind]).get_data().y;
                //     let x = main.chart.series(lineNames[ind]).get_data().x;
                //     setTimeout(function(){
                //         lineProcess.AddLineDataParams(info,x,y,true,1);
                //     },ind*300);
                // }
            })
        }
    }
    //停止采集
    stopScan(){
        websocket.send(funcCode.commandStopWD,{})
        main.setCallbacks(funcCode.commandStopWD,rev=>{
            main.log(funcCode.commandStopWD,rev.getBstatus())
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
        let [ewId,ew,pwId,cw,pz] = [$("#steadyEW"),'',$("#steadyPower"),$("#steadyCW"),$("#steadyPZ")]
        ewId.empty()
        fConfig.excwaveselect.forEach(val=>{
            if(val.chooseDevice){ ewId.append("<option>"+(val.name==='空'?$.i18n.prop('main-test-null'):val.name))}
            ewId.val(fConfig.excwave==='空'?$.i18n.prop('main-test-null'):fConfig.excwave)
            ew = ewId.val()
            if(ew==='null') ew = '空'
            if (val.name === ew) {
                pwId.empty()
                pwId.append("<option>"+$.i18n.prop('main-test-zero'))
                Object.values(val.power).forEach((cur)=>{$("#steadyPower").append("<option>"+cur)})
            }
            // if(val.name === "pinhole"){
            //     $("#steadyPZ").empty()
            //     Object.values(val.M3COL).forEach((cur)=>{$("#steadyPZ").append("<option>"+cur)})
            // }
        })
        pz.empty()
        device.pinholeMsg.forEach((cur)=>{pz.append("<option>"+cur)})
        pwId.val(fConfig.powervalue==='归零'?$.i18n.prop('main-test-zero'):fConfig.powervalue)
        $("#steadyGrating").val(fConfig.grating)
        pz.val(fConfig.pinhole)
        $("#steadySlit").val(fConfig.slit)
        $("#steadyExp").val(fConfig.expTime)
        $("#steadyInterval").prop("checked",fConfig.intervalflag)
        $("#steadyIntervalTime").val(fConfig.intervaltime)
        $("#steadyIntervalNum").val(fConfig.intervalnum===0?1:fConfig.intervalnum)
        $("#steadyTotalNum").val(fConfig.totalnum ===0?1:fConfig.totalnum)
        $('#steadyUnit').text(fConfig.waveunit)
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

    	if(fConfig.steadyUnit==="cm-1"){
    		//保存参数单位cm
    		
    		sendParam.array = [fConfig.steadyCenter];
        	websocket.send(funcCode.CmToNmParams,sendParam);
            main.setCallbacks(funcCode.CmToNmParams,rev =>{
                let selectW = rev.getPdList();
                if(fConfig.waveunit==="cm-1"){
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
        	cw.attr("nm",fConfig.steadyCenter)
    		if(fConfig.waveunit==="cm-1"){
	        	console.log(fConfig);
	            sendParam.array = [fConfig.steadyCenter];
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
        $("#steadyEW").prop("disabled",!device.laser.isConnected)
        $("#steadyPower").prop("disabled",!device.laser.isConnected)
        $("#steadyPZ").prop("disabled",!device.rTOT.isConnected)
        $("#steadyGrating").prop("disabled",((!device.spec.isConnected) ||(!device.ccd.isConnected)))
        $("#steadySlit").prop("disabled",!device.spec.isConnected)
        $("#steadyCW").prop("disabled",!device.spec.isConnected)
        $("#steadyExp").prop("disabled",!device.ccd.isConnected)
        this.updateGrating()
        this.updateSlitRange()
    }
    //更新光栅
    updateGrating(){
        let [t,arr] = [$("#steadyGrating"),device.spec.gratings]
        t.empty()
        arr.forEach(cur=>{t.append("<option>"+cur)})
        if (t.get(0) === undefined) return
        t.get(0).selectedIndex = device.spec.grating-1//当前选择光栅
    }
    //狭缝可用范围
    updateSlitRange(){
        let [min,max,t]=[10,3000,$("#steadySlit")]
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
        let gratingNum = $("#steadyGrating").get(0).selectedIndex+1;
        let dLaserWave = 0.0;
        fConfig.excwave=$("#steadyEW").val()
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
        let [y,flag] = [rev.getPdList(),$("#steadyInterval").prop("checked")]
        let name =flag?steady.name+'_'+(this.num++):steady.name
        if(this.names.indexOf(name)===(-1))this.names.push(name)

        let line = main.chart.add_series(name, 0);
        line.add_array(this.x,y)
        main.legend.addLegend(line)
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
	    info.interCheck     =$("input#steadyInterval").prop("checked");
	    info.interTime      =Number($("input#steadyIntervalTime").val());
	    info.interNum       =Number($("input#steadyIntervalNum").val());
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
		info.strScanMode    =$.i18n.prop('main-SteadyTest-title');
	    info.strWave        =$("#"+type+"EW").val();
	    info.powervalue     =$("#"+type+"Power").val();
	    info.pinhole        =$("#"+type+"PZ").val();
	    info.grating        =$("#"+type+"Grating").val();
	    info.slit           =Number($("#"+type+"Slit").val());
	    info.ExpTime        =$("#"+type+"Exp").val();
	    info.strCenterWave  =$("#"+type+"CW").val();
	    info.totalnum       =Number($("#"+type+"TotalNum").val());
	    info.interCheck     =$("input#steadyInterval").prop("checked")?"是":"否";
	    info.strIntervaltime=$("input#steadyIntervalTime").val();
	    info.intervalnum    =Number($("input#steadyIntervalNum").val());
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