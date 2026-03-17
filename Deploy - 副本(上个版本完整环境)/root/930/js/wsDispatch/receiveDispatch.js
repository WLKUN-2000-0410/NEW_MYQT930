function receiveDispatch(code,pkg){
    if (code !== funcCode.currentTemp) {
        console.log(code,pkg)
    }
    let rev = ''
    switch (code) {
        case funcCode.gratings:
        case funcCode.rI:{
            rev =  proto.Inter930.Rev_freshDev.deserializeBinary(pkg)
        }break;
        case funcCode.isMirror:
        case funcCode.isSlit:
        case funcCode.getShutter:{
            rev = proto.Inter930.recv_Status.deserializeBinary(pkg)
            main.getCallback(code+rev.getIndex(),rev)
        }break
        case funcCode.GetMotorHomeDir:{
            rev = proto.Inter930.Rev_MotorHomeDir.deserializeBinary(pkg)
            main.getCallback(rev.getFuncode()+'-'+rev.getIndex(),rev)
        }break
        case funcCode.GetMotorTotalSteps:{
            rev = proto.Inter930.Rev_MotorTotalSteps.deserializeBinary(pkg)
            main.getCallback(rev.getFuncode()+'-'+rev.getIndex(),rev)

        }break
        case funcCode.GetMotorSpeed:{
            rev = proto.Inter930.Rev_MotorSpeed.deserializeBinary(pkg)
            main.getCallback(rev.getFuncode()+'-'+rev.getIndex(),rev)

        }break
        case funcCode.GetMotorSteps:{
            rev = proto.Inter930.Rev_MotorSteps.deserializeBinary(pkg)
            main.getCallback(rev.getFuncode()+'-'+rev.getIndex(),rev)

        }break
        case funcCode.GetGrating:
        case funcCode.GetFilter:
        case funcCode.GetSlitZeroPos:
        case funcCode.currentTemp:
        case funcCode.currentGrating:
        case funcCode.getSlitWidth:{
            rev = proto.Inter930.Rev_intBack.deserializeBinary(pkg);
            if (code === funcCode.currentTemp)  main.updateTemperature(rev)
        }break;
        // case funcCode.GetMotorTotalSteps:
        // case funcCode.GetMotorSteps:{
        //     rev = proto.Inter930.Rev_longBack.deserializeBinary(pkg)
        // }break
        case funcCode.readCCDSize: {
            rev = proto.Inter930.Rev_ReadccdSize.deserializeBinary(pkg);
        }break;
        case funcCode.stimulateReadPos:
        case funcCode.launchReadPos:
        case funcCode.Adjusting:
        case funcCode.GetCurWave:
        case funcCode.GetSlitBandpass:
        case funcCode.specPos:
        case funcCode.readCCDExpTime:
        case funcCode.gratingMaxArea:
        case funcCode.nmToSteps:
        case funcCode.eVToNm:
        case funcCode.nmToEv:{
            rev = proto.Inter930.Rev_floatBack.deserializeBinary(pkg);
        }break;
        case funcCode.DataAcqOneShot:{
            rev = proto.Inter930.Rev_DataAcqOneShot.deserializeBinary(pkg);
        }break;
        case funcCode.MCEGetPosition :{
            rev = proto.Inter930.Rev_MCEGetPosition.deserializeBinary(pkg);
            main.getCallback(funcCode.MCEGetPosition+rev.getIaxis(),rev)
        }break;
        case funcCode.StartAcqCcdImg:{
            rev = proto.Inter930.Rev_StartAcqCcdImg.deserializeBinary(pkg)
            dc.updateCCDImg(rev)
        }break
        // case funcCode.SaveAcqImgData:{
        //     rev = proto.Inter930.Rev_SaveAcqImgData.deserializeBinary(pkg)
        // }break
        case funcCode.GetCamGain:{
            rev = proto.Inter930.Rev_GetCamGain.deserializeBinary(pkg)
        }break
        case funcCode.SpecGetParams:{
            rev = proto.Inter930.Rev_SpecGetParams.deserializeBinary(pkg)
        }break
        case funcCode.GetMirrorBadpoints:{
            rev = proto.Inter930.Rev_GetMirrorBadpoints.deserializeBinary(pkg)
        }break
        case funcCode.GetShowModeData:{
            rev = proto.Inter930.Rev_GetShowModeData.deserializeBinary(pkg)
        }break
        case funcCode.CcdGetParam:{
            rev = proto.Inter930.Rev_CcdGetParam.deserializeBinary(pkg)
        }break
        case funcCode.SpecGetVersion:{
            rev = proto.Inter930.Rev_SpecGetVersion.deserializeBinary(pkg)
        }break
        case funcCode.GetMaxWavelen:{
            rev = proto.Inter930.Rev_GetMaxWavelen.deserializeBinary(pkg)
        }break
        case funcCode.autoSlitType:
        case funcCode.MCECameraGetParam:{
            rev = proto.Inter930.Rev_MCEParam.deserializeBinary(pkg)
        }break;
        case funcCode.updateWhiteImg:{
            rev = proto.Inter930.Rev_CameraGetImage.deserializeBinary(pkg)
            camera.updateWhiteImg(rev)
        }break
        case funcCode.GetTestScheme:{
            rev = proto.Inter930.Rev_GetTestScheme.deserializeBinary(pkg)
        }break
        case funcCode.GetDrivers:{
        	try{
        		rev = proto.Inter930.Rev_GetDrivers.deserializeBinary(pkg)
        	}catch(e){
        		//TODO handle the exception
        	}
            
            console.log(rev)
        }break
        case funcCode.GetDirsFiles:{
            rev = proto.Inter930.Rev_GetDirsFiles.deserializeBinary(pkg)
        }break
        case funcCode.getCurverSixPngData:{
        	rev = proto.Inter930.Rev_double_array.deserializeBinary(pkg)
        }break
        case funcCode.commandRunWD:{
            rev = proto.Inter930.Rev_double_array.deserializeBinary(pkg)
            steady.updateScanResult(rev)
        }break
        case funcCode.FitParams:{
            rev = proto.Inter930.Rev_DataBaseLine.deserializeBinary(pkg)
        }break
        case funcCode.SmoothParams:{
            rev = proto.Inter930.Rev_DataSmooth.deserializeBinary(pkg)
        }break
        case funcCode.NormalizationMinParams:{
            rev = proto.Inter930.Rev_DataNormal.deserializeBinary(pkg)
        }break
        case funcCode.NormalizationParams:{
            rev = proto.Inter930.Rev_DataZscore.deserializeBinary(pkg)
        }break
        case funcCode.PeakDetectionParams:{
            rev = proto.Inter930.Rev_DataPeaks.deserializeBinary(pkg)
        }break
        case funcCode.AreaParams:{
            rev = proto.Inter930.Rev_DataPeakarea.deserializeBinary(pkg)
            let area = parseFloat(rev.getPdList()[0].toFixed(2))
            if(!isNaN(area)){
                $("#mainPA span").text(area);
            }
        }break
        case funcCode.NmToCmParams:
        case funcCode.CmToNmParams:
        case funcCode.FWHMParams:{
            rev = proto.Inter930.Rev_DataFWHM.deserializeBinary(pkg)
            if (code === funcCode.FWHMParams) {
                let fwhm = Number(rev.getPdList()[0].toFixed(2))
                if(fwhm>0) $("#mainHW span").text(fwhm);
            }
        }break
        case funcCode.open3DMappingContent:{
        	rev = proto.Inter930.Rev_OpenLineFilesParams.deserializeBinary(pkg)
        }break;
        case funcCode.OpenLineDatasPram:{
            rev = proto.Inter930.Rev_OpenLineFilesParams.deserializeBinary(pkg)
            main.showLineData(rev.getFilepathname(),rev.getFilecontent());
        }break
        //case funcCode.GetDirsFiles:
        case funcCode.GetFilterModel:
        case funcCode.GetSlitModel:
        case funcCode.OpenLineDataPram:
        //case funcCode.OpenLineDatasPram:
        case funcCode.getLineTitleByNames:
        case funcCode.getSavefilePathPram:
        case funcCode.checkFile:{
            rev = proto.Inter930.Rev_tip_title.deserializeBinary(pkg)
            // if(code===funcCode.OpenLineDatasPram){
            //     main.showLineData(rev.getTiptitle());
            // }
        }break
        case funcCode.getLineTitleByName:{
            rev = proto.Inter930.Rev_tip_title.deserializeBinary(pkg);
            if (main.num==1) {
                main.printDataByTitle(rev);
            }

        }break
        case funcCode.AddLineDataParams:
        case funcCode.UpdateLineNameParams:
        case funcCode.DeleteLineDataParams: {
            rev = proto.Inter930.Rev_ShowLineData.deserializeBinary(pkg)
        }break
        case funcCode.RestoreLineDataParams:{
            rev = proto.Inter930.Rev_RestoreData.deserializeBinary(pkg)
            lineProcess.updateRestoreLine(rev)
        }break
        case funcCode.GetLineDataCMParams:
        case funcCode.GetLineDataNmParams:{
            rev = proto.Inter930.Rev_GetLineData.deserializeBinary(pkg)
            lineProcess.updateUnitByX(rev);
        }break
        case funcCode.getCurverSixPng:
        case funcCode.GetDeleteLineDatasParams:{
            rev = proto.Inter930.Rev_GetDeleteLineDatasParams.deserializeBinary(pkg)
        }break
        case funcCode.revXResult:{
            rev = proto.Inter930.Rev_float_array.deserializeBinary(pkg)
            steady.x = rev.getPdList();
            polar.x = rev.getPdList();
        }break
        case funcCode.commandRunSpectrum:{
            rev = proto.Inter930.Rev_spectrumtest_array.deserializeBinary(pkg)
            wavelength.updateScanResult(rev)
        }break
        case funcCode.commandRunMap:{
            rev = proto.Inter930.Rev_mapping_array.deserializeBinary(pkg)
            mapping.updateMapping(rev)
        }break
        case funcCode.dbMappigGetXY:{
            rev = proto.Inter930.Rev_dbMappigGetXY.deserializeBinary(pkg)
        }break
        case funcCode.mappingWH:
        case funcCode.openHdrRawMapping:
        case funcCode.openSyspMapping:{
            rev = proto.Inter930.Rev_mapping_matrix.deserializeBinary(pkg)
        }break
        case funcCode.Rev_DDBack:{
            rev = proto.Inter930.Rev_DDBack.deserializeBinary(pkg)
            device.dT.fval = rev.getFval()
            device.dT.fAccval = rev.getFaccval().toFixed(2)
        }break
        case funcCode.MappingPer:{
            rev = proto.Inter930.Rev_MappingPer.deserializeBinary(pkg)
            mapping.updateMappingPre(rev)
        }break
        case funcCode.commandRunAutoFocusTitle:{
            rev = proto.Inter930.Rev_tip_title.deserializeBinary(pkg)
            main.getCallback(code+'_'+rev.getTiptitle(),rev)
        }break
        case funcCode.autoFocusData:{
            rev = proto.Inter930.Rev_AutoFocusData.deserializeBinary(pkg)
            autoFocus.updateAutoFocus(rev)
        }break
        case funcCode.SelectToDB:
        case funcCode.SelectToDBVague:{
            rev = proto.Inter930.DB_ResList.deserializeBinary(pkg)
        }break
        case funcCode.getSampleTypess:{
            rev = proto.Inter930.DB_ResSampleType.deserializeBinary(pkg)
        }break
        case funcCode.Cal_DataToDB:{
            rev = proto.Inter930.Rev_Cal_DataToDB.deserializeBinary(pkg)
        }break
        case funcCode.DBView_Show:{
            rev = proto.Inter930.Rev_DBView_Show.deserializeBinary(pkg)
        }break
        case funcCode.pinholeMsg:{
            rev = proto.Inter930.Rev_pinhole.deserializeBinary(pkg)
            device.pinholeMsg = rev.getUnitnumList().sort((a,b)=>a-b)
        }break
        case funcCode.ErasingRay:{
            rev = proto.Inter930.Rev_ErasingRay.deserializeBinary(pkg)
        }break
        case funcCode.GetInitWave:
        case funcCode.GetAdjustment:
        case funcCode.GetGratingMaxWave:{
            rev = proto.Inter930.Rev_GratingFloat.deserializeBinary(pkg)
            main.getCallback(code+rev.getGrating(),rev)
        }break
        case funcCode.GetGratingInfo:{
            rev = proto.Inter930.Rev_grooveAndBlaze.deserializeBinary(pkg)
            main.getCallback(code+rev.getGrating(),rev)
        }break
        case funcCode.GetZeroPos:{
            rev = proto.Inter930.Rev_GratingZeroPos.deserializeBinary(pkg)
            main.getCallback(code+rev.getGrating(),rev)
        }break
        case funcCode.commandRunPolar:{
        	rev = proto.Inter930.Rev_PolarTestResult.deserializeBinary(pkg)
			polar.updateScanResult(rev);
        }break;
        case funcCode.commandRunMapD:{
            rev = proto.Inter930.Rev_mapping_array_d.deserializeBinary(pkg)
            mapping.updateMapping3D(rev)
        }break
        case funcCode.open3DMapping:
        case funcCode.showMode3DMapping:{
            rev = proto.Inter930.Rev_GetShowMode3DData.deserializeBinary(pkg)
            mapping.updateMapping3DFile(rev)
        }break
        case funcCode.mapping3DXYZData:{
            rev = proto.Inter930.Rev_dbMappigGetXY.deserializeBinary(pkg)
        }break
        case funcCode.exportAllCurves3D:
        case funcCode.exportAllCurvesPng:
        case funcCode.exportAllCurves:{
            rev=proto.Inter930.RevExportAllCurves.deserializeBinary(pkg)
            updateProcess(rev.getCurretindex(),rev.getTotal())
        }break
        default:{
            rev = proto.Inter930.Rev_Status.deserializeBinary(pkg)
        }
    }
    let arr = [funcCode.closeMask, funcCode.NmToCmParams, funcCode.commandRunAutoFocusTitle, funcCode.GetCamGain, funcCode.dbMappigGetXY, funcCode.GetMirrorBadpoints, funcCode.SpecGetParams, funcCode.SelectToDB,funcCode.getLineTitleByName,funcCode.SpecGetVersion,funcCode.GetMaxWavelen,funcCode.exportAllCurves3D,funcCode.exportAllCurves,funcCode.exportAllCurvesPng,funcCode.stopExportAllFile
        , funcCode.gratings, funcCode.currentGrating, funcCode.mappingWH, funcCode.mappingStop, funcCode.GetTestScheme, funcCode.FitParams, funcCode.SetCCDImageMirror, funcCode.SmoothParams,funcCode.Cal_DataToDB,funcCode.DBView_Show,funcCode.ErasingRay,funcCode.MappingPer,funcCode.Rev_DDBack
        , funcCode.NormalizationParams, funcCode.NormalizationMinParams, funcCode.PeakDetectionParams, funcCode.FWHMParams, funcCode.AreaParams, funcCode.DevAutoConnect, funcCode.GetDrivers,funcCode.saveImageFileByPath,funcCode.pinholeMsg,funcCode.SelectToDBVague,funcCode.getSampleTypess,funcCode.open3DMapping,funcCode.save3DMapping,funcCode.showMode3DMapping,
        funcCode.autoSlitType, funcCode.getSlitWidth, funcCode.checkFile, funcCode.MCEGetPosition, funcCode.isMirror, funcCode.isSlit, funcCode.currentTemp, funcCode.commandRunWD, funcCode.commandStopWD,funcCode.IsSetupFilter,funcCode.GetMotorHomeDir,funcCode.SetMotorHomeDir,funcCode.GetMotorTotalSteps,funcCode.SetMotorTotalSteps,funcCode.GetMotorSpeed,funcCode.SetMotorSpeed,funcCode.GetMotorSteps,funcCode.SetMotorSteps
        , funcCode.CmToNmParams, funcCode.DeleteLineDataParams, funcCode.RestoreLineDataParams, funcCode.GetDeleteLineDatasParams, funcCode.SaveAcqImgData, funcCode.commandRunSpectrum, funcCode.commandStopSpectrum, funcCode.updateWhiteImg, funcCode.commandRunMap, funcCode.TestModeChange, funcCode.StartAcqCcdImg,
        funcCode.getLineTitleByNames,funcCode.ClearDeleteLineDatasParams, funcCode.GetShowModeData, funcCode.GetDirsFiles, funcCode.MakeDir, funcCode.OpenLineDataPram, funcCode.SaveLineDataPram, funcCode.openSyspMapping, funcCode.saveSyspMapping, funcCode.openHdrRawMapping,
        funcCode.openFileOk,funcCode.commandRunMapD,funcCode.getCurverSixPng,funcCode.getCurverSixPngData,funcCode.AddLineDataParams,funcCode.saveHdrRawMapping,funcCode.open3DMappingContent, funcCode.getSavefilePathPram, funcCode.setSaveFilePathPram, funcCode.GetLineDataNmParams, funcCode.GetLineDataCMParams, funcCode.updateYAxisParams, funcCode.updateXYAxisParams, funcCode.updatelaserWaveLengthParams, funcCode.SaveCm2NmStatus, funcCode.MathPeakDetect, funcCode.OpenLineDatasPram]

    if(code===funcCode.dbAddRepetition) return main.getCallback(code,rev)
    if(code === funcCode.laserPowerGears && !rev.getBstatus()) return;

    if (!arr.includes(code)) {
        main.log(code,rev.getBstatus())
    }
    if(!rev.getBstatus())return;
    main.getCallback(code,rev)
}