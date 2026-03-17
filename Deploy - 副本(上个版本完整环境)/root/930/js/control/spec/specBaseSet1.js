specBaseSet=new class{
	selectedUnit=0;
	checkedIndex=0;
    initSpecBase(){
        this.updateSetupState()
        this.updateImgState()
        this.updateShutterState()
        this.updateUnits()
    }
    updateUnits(){
    	specBaseSet.selectedUnit = $("span.showUnit").html()==="nm"?0:1;
        specBaseSet.checkedIndex = 0;
        let [radio,sEw,wEw,wG,sG] = [$("input[name='specUnit']"),$("select#steadyEW"),$("select#waveEW"),$("select#waveGrating"),$("select#steadyGrating")]
        $(radio.get(specBaseSet.selectedUnit)).click();
        let laserWaveVal = sEw.length===0?wEw.val():sEw.val();
        let gratingNum = sEw.length===0?(wG.get(0).selectedIndex<0?1:wG.get(0).selectedIndex+1):(sG.get(0).selectedIndex<0?1:sG.get(0).selectedIndex+1);

        if (laserWaveVal==="空") {
            $("#specLWL").val(fConfig.excwaveselect[0].E);
        } else{
            fConfig.excwaveselect.forEach((cur)=>{
                if(cur.name === laserWaveVal){
                    $("#specLWL").val(cur["grating"+gratingNum])
                }
            })
        }
    }
    switchUnits(){
    	let dLaserWave = parseFloat($("#specLWL").val());
        let [cw,wFrom,wTo] = [$("input#steadyCW"),$("input#waveFrom"),$("input#waveTo")]
		let sendParam = {};
        sendParam.laserWave = dLaserWave;
        sendParam.array = [];
//  		nm->cm-1:通过算法转化
        console.log(specBaseSet.selectedUnit+"/"+specBaseSet.checkedIndex);
        if(specBaseSet.checkedIndex===1){
        	if (specBaseSet.selectedUnit===0) {
                $("span.showUnit").html("cm-1");
                //转化参数
                
                if (cw.length>0) {
                    sendParam.array.push(parseFloat(cw.val()));
                }
                if (wFrom.length>0) {
                    sendParam.array.push(parseFloat(wFrom.val()));
                }
                if (wTo.length>0) {
                    sendParam.array.push(parseFloat(wTo.val()));
                }
                console.log(sendParam);

                websocket.send(funcCode.NmToCmParams,sendParam);
                main.setCallbacks(funcCode.NmToCmParams,rev =>{
                    let selectW = rev.getPdList();
                    if (selectW.length>1) {
                        wFrom.val(selectW[0]);
                        wTo.val(selectW[1]);
                    } else{
                        cw.val(selectW[0]);
                    }
                    specBaseSet.selectedUnit = 1;
                })
                //转化曲线
//				1.获取全部谱线
            }
        	
            setTimeout(function(){
            	lineProcess.GetLineDataCMParams(Array.from(main.chart.all_series().keys()),0);
               
            },100);
        	
        }
//			cm-1->nm：直接换成记录的参数
        if (specBaseSet.checkedIndex===0) {
        	if(specBaseSet.selectedUnit===1){
        		$("span.showUnit").html("nm");
        		fConfig.waveunit="nm";
                //转化参数
                if (cw.length>0) {
                	cw.val(Number(cw.attr("nm")));
                }
                if (wFrom.length>0) {
                    wFrom.val(Number(wFrom.attr("nm")));
                }
                if (wTo.length>0) {
                    wTo.val(Number(wTo.attr("nm")));
                }
        	}
        	specBaseSet.selectedUnit = 0;
        	lineProcess.SaveCm2NmStatus();
            //转化曲线,当前记录的nm数据的x轴直接替换，更新谱图
            setTimeout(function(){
            	lineProcess.GetLineDataNmParams(Array.from(main.chart.all_series().keys()),0)
                
            },100);
        }
    }
    //设置快门
    setShutter(idx){
        let flag = $("#specOption input[type=checkbox]").prop("checked")
        websocket.send(funcCode.setShutter,{"num":idx,'flag':flag})
        main.setCallbacks(funcCode.setShutter,rev=>{device.spec.shutter[idx].status = flag})
    }
    // //读取快门
    // getShutter(idx){
    //     if (device.spec.shutter[idx].setup) {
    //         websocket.send(funcCode.getShutter,{"num":idx})
    //     }
    // }
    // //询问摆镜位置
    // getMirror(idx){
    //     if (device.spec.mirror[idx].setup) {
    //         websocket.send(funcCode.isMirror,{"idx":idx})
    //         main.setCallbacks(funcCode.isMirror,rev=>{
    //             main.log(funcCode.isMirror,rev.getBstatus())
    //             device.spec.mirror[idx].port = rev.getBhave()
    //             specBaseSet.updateImgState();
    //         })
    //     }
    // }
    //设置摆镜
    setMirror(idx){
        let port= device.spec.mirror[idx].port
        websocket.send(funcCode.setMirror,{"idx":idx,"flag":!port})
        main.setCallbacks(funcCode.setMirror,rev =>{
            device.spec.mirror[idx].port = !port;
            specBaseSet.updateImgState()
        })
    }
    // //询问是否有狭缝
    // isSlit(idx){
    //     websocket.send(funcCode.isSlit,{"idx":idx})
    // }
    //读取狭缝宽度
    getSlitWidth(idx){
        if (device.spec.slit[idx].setup) {
            websocket.send(funcCode.getSlitWidth,{"idx":idx})
            main.setCallbacks(funcCode.getSlitWidth,rev=>{
                device.spec.slit[idx].width = rev.getIval();
                $("#slit"+idx+"Width").val(device.spec.slit[idx].width)
            })
        }
    }
    //设置狭缝宽度
    setSlitWidth(){

    }
    //CCD波长系数校正
    waveCorrect(){
        let suc = function () {
            $("div .fileName select option[value='.txt']").hide()
            $("div .fileName select option[value='.hdr']").hide()
            $("div .fileName select option[value='.sysp']").prop('hidden',true)
            $("div .fileName select option[value='*.*']").hide()
            main.getSavefilePathPram()
            $("div .fileName select").val('.bck')
        }
        let end = function () {
            if (main.isOpenChecked) {
                main.isOpenChecked=false;
                let lasetIndex = main.openFilePath.lastIndexOf("\\")+1;
                let filePath = main.openFilePath.substring(0,lasetIndex);
                let fileNames = main.openFilePath.substr(lasetIndex);
                let fileList = fileNames.split(",");
                console.log(filePath,fileNames,fileList)
                let files = [],arr = [1,2,3]
                for (let i = 0; i < fileList.length; i++) {
                    let  idx = fileList[i].indexOf('#')
                    if(idx<0){return jeBox.msg($.i18n.prop('tips-spec-file'),{icon:1})}
                    let gr  = Number(fileList[i].slice(idx-1,idx))
                    if (!arr.includes(gr)) {return  jeBox.msg($.i18n.prop('tips-spec-grating'),{icon:1})}
                    files[gr-1] = filePath + fileList[i]
                }

                websocket.send(funcCode.CcdCorrection,{files:files})
            }
        }
        main.openFileByPath(suc,end)
        // $("#waveCorrect").click();
        // $('input#waveCorrect').change(function () {
        //     let files = this.files;
        //     if (this.files.length > 0) {
        //         for (let i = 0; i < files.length; i++) {
        //             let [data,name,arr] = [{},files[i].name,[1,2,3]]
        //             let  idx = name.indexOf('#')
        //             if(idx<0){return jeBox.msg('导入的文件名有误!')}
        //             let gr  = Number(name.slice(0,idx))
        //             data.grating = gr
        //             if (!arr.includes(gr)) {return  jeBox.msg('导入的文件光栅号不明确!')}
        //             let reader = new FileReader(); //new一个FileReader实例
        //             reader.onload = function () {
        //                 let strFileC = this.result;
        //                 let strArrays = strFileC.split("\r\n");
        //                 for (let i = 0; i < strArrays.length; i++) {
        //                     let index= strArrays[i].indexOf("=");
        //                     if (index>=0) {
        //                         let strKey= strArrays[i].substring(0,index);
        //                         let strValue = Number(strArrays[i].substr(index+1));
        //                         switch (strKey) {
        //                             case "FOCLEN":{data.FOCLEN = strValue}break
        //                             case "ANGDEV":{data.ANGDEV = strValue}break
        //                             case "FOCTLT":{data.FOCTLT = strValue}break
        //                             case "POLY1":{data.POLY1 = strValue.toString()}break
        //                             case "POLY2":{data.POLY2 = strValue.toString()}break
        //                             case "POLY3":{data.POLY3 = strValue.toString()}break
        //                             case "POLY4":{data.POLY4 = strValue.toString()}break
        //                             case "POLY5":{data.POLY5 = strValue.toString()}break
        //                             case "SINAMPLITUDE":{data.SINAMPLITUDE = strValue}break
        //                             case "SINPHASE":{data.SINPHASE = strValue}break
        //                             case "SINFREQUENCY":{data.SINFREQUENCY = strValue}break
        //                             case "DETECTOROFFSET1":{data.DETECTOROFFSET1 = strValue}break
        //                             case "DETECTOROFFSET2":{data.DETECTOROFFSET2 = strValue}break
        //                             case "GRATSTART"+gr:{data.GRATSTART=strValue}break
        //                             case "GRATOFFSET"+gr:{data.GRATOFFSET=strValue}break
        //                             case "GRATLINES"+gr:{data.GRATLINES=strValue}break
        //                             case "GRATBLAZE"+gr:{data.GRATBLAZE=strValue}break
        //                         }
        //                     }
        //
        //                 }
        //                 websocket.send(funcCode.SpecSetParams,data)
        //             };
        //             reader.readAsText(files[i]);
        //
        //         }
        //
        //     }
        //     $("input#waveCorrect").val('');
        //
        // })
    }
    //CCD扫描参数
    openCCDParam(){
        $.get("html/device/spec/specParam.html?"+new Date().getTime(), function (str) {
            jeBox.open({
                title: [$.i18n.prop('popup-device-spec-param'), {
                    'text-align': 'center',
                    'font-size': '1.5em'
                }],
                type: 'dialog',
                maskLock: true, //是否遮罩
                maskClose: false,
                isDrag: true,
                shadow: true,
                closeBtn: true,
                boxSize: [600, 610],
                zIndex: 1,
                content: str,
                success: function () {
                    main.translate(undefined)
                }
            })
        })
    }
    //谱仪高级设置窗口
    showSpecAdv(){
        $.get("html/device/spec/specAdv.html?"+new Date().getTime(), function (str) {
            jeBox.open({
                title: ["高级设置", {
                    'text-align': 'center',
                    'font-size': '1.5em'
                }],
                type: 'dialog',
                maskLock: true, //是否遮罩
                maskClose: false,
                isDrag: true,
                shadow: true,
                closeBtn: true,
                boxSize: [620, 610],
                zIndex: 1,
                content: str,
                success: function () {
                    main.translate(undefined)
                }
            })
        })
    }
    //更新摆镜安装状态&狭缝安装状态
    updateSetupState(){
        let [slit,mirror,shutter] = [device.spec.slit,device.spec.mirror,device.spec.shutter]
        //更新摆镜显示状态
        //$("#specDET1").prop("hidden",!mirror[0].setup)
        $("#specDET2").prop("hidden",true)
        $("#specEN1").prop("hidden",false)
        //$("#specEN2").prop("hidden",!mirror[1].setup)
        /*更新狭缝状态*/
        // $("#en1Slit").prop("hidden",!slit[3].setup)
        // $("#en2Slit").prop("hidden",!slit[0].setup)
        // $("#det1Slit").prop("hidden",!slit[2].setup)
        // $("#det2Slit").prop("hidden",!slit[1].setup)
        $("#specOption input[type=checkbox]").prop("disabled",!shutter[0].setup)
    }
    //更新快门状态
    updateShutterState(){
        if(device.spec.shutter[0].setup){
            // let state = device.spec.shutter[0].status?"Open":"Close"
            // $("#shutter"+state).prop("checked",true)
            $("#specOption input[type=checkbox]").prop("checked",device.spec.shutter[0].status)

        }
    }
    //更新光路图
    updateImgState(){
        let [mirror,imgSrc] = [device.spec.mirror,""]
        //更新摆镜位置&光路图
        if (mirror[0].port) {
            imgSrc = mirror[1].port?"source/image/spec/Spec4.jpg":"source/image/spec/Spec1.jpg"
        }else {
            imgSrc = mirror[1].port?"source/image/spec/Spec3.jpg":"source/image/spec/Spec2.jpg"
        }
        $("#specImg img").attr("src",imgSrc)
    }

}()