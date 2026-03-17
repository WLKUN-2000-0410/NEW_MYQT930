lineProcess = new class{

    //添加数据到缓存1410
    AddLineDataParams(info,xData,yData,haveTitle,dataFrom){
        let data = {
        	lineName:info.name,
			strScanMode:info.strScanMode==undefined?"稳定性":info.strScanMode,
			//采集样式  "稳定性"   "接谱"  两个值
			strWave:info.strWave==undefined?"":info.strWave,
			//激发波长  诸如 "532nm"
			powervalue:info.powervalue==undefined?"":info.powervalue,
			//功率切换
			pinhole:info.pinhole==undefined?"0":info.pinhole+"",
			//针孔尺寸
			grating:info.grating==undefined?"":info.grating+"",
			//光栅
			slit:info.slit==undefined?0:info.slit,
			//狭缝
			ExpTime:info.ExpTime==undefined?"":info.ExpTime+"",
			//积分时间
			unit:info.unit==undefined?"":info.unit,
			//单位  cm-1  nm
			strCenterWave:info.strCenterWave==undefined?"":info.strCenterWave+"",
			//中心波长   稳定性测试
			strStartWave:info.strStartWave==undefined?"":info.strStartWave+"",
			//起始波长   接谱
			strEndWave:info.strEndWave==undefined?"":info.strEndWave+"",
			//终止波长   接谱
			totalnum:info.totalnum==undefined?1:info.totalnum,
			//累计次数
			strInterFlg:info.strInterFlg==undefined?"":info.strInterFlg+"",
			//是否间隔    "是" "否"(稳定性)  ""(空 接谱)  三个值
			strIntervaltime:info.strIntervaltime==undefined?"":info.strIntervaltime+"",
			//间隔时间
			intervalnum:info.intervalnum==undefined?0:info.intervalnum,
			//间隔次数
			pdX:xData, 	   
			//Y轴曲线数据数组
			pdY:yData,       
			//x轴曲线数据数组
			haveTitle:haveTitle,
			//是否有头文件信息
			dataFrom:dataFrom,
			//数据来源
			laserWaveLength:info.laserWaveLength==undefined?"532.0":info.laserWaveLength+"",
			//测试方法
			nFuncNum:fConfig.funnm,
			//偏振测试类型
			polarChoose:info.polarChoose===undefined?0:info.polarChoose,
			//偏振角度
			polarDege:info.polarDege===undefined?0:info.polarDege,
			//偏振起始
			polarStart:info.polarStart===undefined?0:info.polarStart,
			//偏振终止
			polarEnd:info.polarEnd===undefined?0:info.polarEnd,
			//偏振布局
			polarStep:info.polarStep===undefined?0:info.polarStep
        }
//		if(fConfig.funnm===2){
//			//测试方法
			
//		}

//      
//      if(data.haveTitle){ data = info }
        websocket.send(funcCode.AddLineDataParams,data,false)
    }
    //修改曲线名称1411
    UpdateLineNameParams(oldName,newName){
        websocket.send(funcCode.UpdateLineNameParams,{oldLineName:oldName,newLienName:newName},false)
    }
    //删除曲线数据1412
    DeleteLineDataParams(name){
        websocket.send(funcCode.DeleteLineDataParams,{lineName:name},false)
    }
    //恢复曲线数据1413
    RestoreLineDataParams(name,unit){
        websocket.send(funcCode.RestoreLineDataParams,{lineName:name,unit:unit},false)
    }
    updateRestoreLine(rev){
    	let xList = rev.getXpdList();
		let yList = rev.getYpdList();
		let lineName = rev.getFilename();
        //let name = file.name.substring(0, file.name.indexOf('.')) + '_' + i;
        let line = main.chart.add_series(lineName, 0);
        line.add_array(xList, yList);
        main.legend.addLegend(line)
    }
    
    //获取cm-1单位曲线数据1414
    GetLineDataCMParams(lines){
        	if(lines.length==0)return;
        	let info = {};
        	info.lineName       =lines;
        	
        	info.laserWave      =$("input#waveFrom").length>0
        				?$("select#waveEW").val():$("select#steadyEW").val();
        	info.strGrating     =$("input#waveFrom").length>0
        				?$("select#waveGrating").val():$("select#steadyGrating").val();
        	info.strGrating = info.strGrating==undefined?"":info.strGrating
        	info.laserWaveLength=parseFloat($("input#sUVal").val());
        	websocket.send(funcCode.GetLineDataCMParams,info)
        	
        }
    //获取nm单位曲线数据1415
    GetLineDataNmParams(lines){
        if(lines.length==0)return;
    	let info = {};
    	info.lineName=lines;
    	websocket.send(funcCode.GetLineDataNmParams,info)
    }
    updateUnitByX(rev){
    	let x = rev.getPdList()
        let fileName = rev.getFilename();
        //更新谱图
        let y = [];
        if (fConfig.funnm === 2) {
        	y=main.polarLineChart.series(fileName).get_data().y;
        	main.polarLineChart.series(fileName).add_array(x,y);
        }else{
        	y=main.chart.series(fileName).get_data().y;
        	main.chart.series(fileName).add_array(x,y);
        }
        
    }
    
    //获取删除曲线数据1416
    GetDeleteLineDatasParams(){
        websocket.send(funcCode.GetDeleteLineDatasParams,{},false)
    }
    //获取不是删除曲线数据1417
    GetChooseLineDatasParams(){
        websocket.send(funcCode.GetChooseLineDatasParams,{},false)

    }
    //获取不是删除曲线数据1418
    ClearDeleteLineDatasParams(){
        websocket.send(funcCode.ClearDeleteLineDatasParams,{},false)
    }

    //更新Y轴的数据1419
    updateYAxisParams(name,yData){
        websocket.send(funcCode.updateYAxisParams,{lineName:name,yAxisData:yData},false)
    }
    //更新X、Y轴的数据1430
    updateXYAxisParams(name,xData,yData,unit){
        websocket.send(funcCode.updateXYAxisParams,{lineName:name,xAxisData:xData,yAxisData:yData,unit:unit},false)
    }
    //更新激发波长430
    updatelaserWaveLengthParams(excWave,gratingNum,laserWave){
        websocket.send(funcCode.updatelaserWaveLengthParams,{excWave:excWave,gratingNum:gratingNum,laserWave:laserWave},false)
    }
    
    SaveCm2NmStatus(){
    	websocket.send(funcCode.SaveCm2NmStatus,{flag:true},false);
    }
}()