const funcCode={
    askSys:0,//询问后端上次加载的系统模块
    scSys:1,//选择要加载的系统模块
    initSource:2,//初始化，加载资源
    unload:3,//卸载资源，状态保存
    eWS:11,//激发波长切换
    pS:12,//功率切换
    pSS:13,//针孔尺寸设置
    gS:14,//光栅设置
    slitSet:15,//狭缝设置
    iTS:16,//积分时间设置
    cWS:17,//中心波长 设置
    rI:18,//刷新仪器
    specC:19,//谱仪连接
    specDisC:20,//谱仪断开连接
    dcC:21,//数采连接
    dcDisC:22,//数采断开连接
    RTotC:23,//光路电机连接
    RTOtDisC:24,//光路电机断开连接
    dtC:25,//位移台连接
    dtDisC:26,//位移台断开连接
    laserC:27,//激光器连接
    laserDisC:28,//激光器断开连接
    cameraC:29,//相机连接
    cameraDisC:30,//相机断开连接
    setShutter:31,//设置快门开关
    getShutter:32,//读取快门开关
    isMirror :33,//读取摆镜位置
    isSlit:34,//询问是否有狭缝
    getSlitWidth :35,//询问狭缝宽度
    setMirror:36,//设置摆镜
    readCCDSize:37,//读取ccd尺寸
    readCCDExpTime:38,//读取ccd积分时间
    setCamGain:39,//设置增益
    DataAcqOneShot:40,//读取ccd谱线数据
    TerminateData:41,//停止读取ccd影像 强行中断采集(针对长积分时间)
    SetCCDImageMirror:42,//设置ccd显示方向 设置采集图像翻转
    MCEGetPosition :43, //读取位移台位置 结果
    MCEMotorBackZero:44,//位移台归零
    MCEMotorMove:45,//位移台相对位移
    MCEMotorMoveTo:46,//位移台绝对位移
    MCESetVelocity:47,//位移台设置速度
    MCESetAccVelocity:48,//位移台移动加速度
    MCEMotorStop:49,//位移台停止
    MCESetJoyStick:50,//位移台设置虚拟控制杆使用
    MCEMotorInit:51,//位移台初始化
    SetScanMode:53,//设置采集模式
    SetBinRange:54,//设置当前相机Bin模式范围
    StartAcqCcdImg :55,//CCD开始影像采集
    SaveAcqImgData:56,//CCD保存图谱数据
    GetCamGain:57,//获取当前CCD下增益
    ProCcdBadPoints:58,//CCD处理坏点
    StopAcqCcdImg:59,//CCD停止影像采集
    SpecGetParams:61,//获取谱仪界面所有参数值
    SpecSetParams:62,//设置谱仪界面所有参数值
    GetMirrorBadpoints:63,//CCD获取镜像和坏点信息
    DevConnectAll:64,////设备全部连接
    DevDisconnectAll:65,//设备全部断开
    GetShowModeData:66,//mapping获取显示模式数据	66
    CcdGetParam:67,//数采获取速率和像素转移速率	67
    CcdSetParam:68,//数采设置速率和像素	68
    MathPeakDetect:69, //启动实时谱峰检测	69
    CcdCorrection:70,//CCD波长系数校正
    SpecGetVersion:71,//获取谱仪版本信息
    GetMaxWavelen:72,//读取光栅的最大扫描范围
    MCEOpenWhiteLightImage:120,//打开白光图像
    MCECloseWhiteLightImage:121,//关闭白光图像
    MCECameraSetGamama:122,//设置相机伽马
    MCECameraSetRatio:123,//设置相机对比度
    MCECameraSetEnhanceColor:124,//设置相机色彩增强
    MCECameraSetHoriaotalMirror:125,//设置相机水平镜像
    MCECameraSetSaturation:126,//设置相机色彩饱和度
    MCECameraSetAeState:127,//设置相机自动曝光
    MCECameraSetAnalogGain:128,//设置相机增益
    MCECameraSetGain :129,//设置相机手动白平衡（红绿蓝）
    MCECameraSetAWBState:130,//设置相机自动白平衡
    MCECameraSetTime:131,//设置相机曝光时间
    MCECameraGetParam:132,//获取相机参数
    MCECameraSetParam:133,//设置相机参数
    updateWhiteImg:134,//更新白光图像
    closeMask:1000,//关闭遮罩层
    SaveTestScheme:1100,////前端动作：保存方案时触发的指令
    GetTestScheme:1101,//菜单栏中选择某一个方案触发的指令
    EnableDevices:1102,//配置选择界面
    DeleteTestScheme:1103,//删除测试方案
    SetLensParams:1104,//设置物镜参数时下发的命令
    DeleteLensParams:1105,//删除物镜参数时下发的命令
    GetDrivers:1107,//文件系统-获取系统所有驱动器	1107
    GetDirsFiles:1108,//文件系统-获取指定路径下所有文件和文件夹	1108
    MakeDir:1109,//文件系统-新建文件夹	1109
    DevAutoConnect:1110,//设备自动连接设置	1110
    UseTestScheme:1111,//前端动作：应用方案时触发的指令
    TestModeChange:1106,//切换测试模式
    gratingMode:1200,//光栅模式
    gratings:1201,//光栅信息参数
    currentGrating:1203,//当前光栅
    specMove:1204, //单色仪绝对移动
    autoSlitWidth:1205, //设置自动狭缝宽度
    autoSlitType:1206,//自动狭缝型号
    laserZero:1207,//激光器归零
    laserSwitch:1208,//激光器切换
    mirrorAngle:1209,//设置反射镜角度
    cameraCooling:1210,//设置相机制冷状态
    cameraTemp:1211,//设置相机温度
    setGain:1212,//设置增益
    specPos:1213,//读取单色仪当前位置
    pixelSize:1214,//获取一个像素点尺寸
    cameraXYSize:1215,//获取相机X轴Y轴大小
    pixelToWave:1216,//像素转波长
    gratingMaxArea:1217,//读取光栅的最大扫描范围
    dtInitXZero:1218,//位移台初始化时X轴归零 1218
    dtInitYZero:1219,//位移台初始化时Y轴归零 1219
    dtInitXCenter:1220,//位移台初始化时X轴回到中心位置 1220
    dtInitYCenter:1221,//位移台初始化时Y轴回到中心位置 1221
    laserPowerGears:1230,//设置激光功率档位
    currentTemp:1240,//ccd当前温度
    ControlAW:1245,//控制衰减片轮旋转
    FitParams:1400,//拟合
    SmoothParams:1401,//平滑
    NormalizationMinParams:1402,//最大最小归一化
    NormalizationParams:1403,//标准归一化
    PeakDetectionParams:1404,//自动寻峰参数
    AreaParams:1405,//计算峰面积
    FWHMParams:1406,//计算半高宽
    NmToCmParams:1407,//波长转波数
    CmToNmParams:1408,//波数转波长
    checkFile:1409,//检查文件
    AddLineDataParams:1410,//添加数据到缓存1410
    UpdateLineNameParams:1411,//修改曲线名称1411
    DeleteLineDataParams:1412,//删除曲线数据1412
    RestoreLineDataParams:1413,//恢复曲线数据1413
    GetLineDataCMParams:1414,//获取cm-1单位曲线数据1414
    GetLineDataNmParams:1415,//获取nm单位曲线数据1415
    GetDeleteLineDatasParams:1416,//获取删除曲线数据1416
    GetChooseLineDatasParams:1417,//获取不是删除曲线数据1417
    ClearDeleteLineDatasParams:1418,//获取不是删除曲线数据1418
    updateYAxisParams:1419,//更新Y轴的数据1419
    OpenLineDataPram:1420,//打开曲线文件数据1420
    SaveLineDataPram:1421,//保存曲线文件数据1421
    getSavefilePathPram:1422,//1422,//获取文件路径
    setSaveFilePathPram:1423,//1423,//保存文件路径
    SaveCm2NmStatus:1424,//保存波数转波长状态	1424
    OpenLineDatasPram:1425,//打开多个曲线文件数据1425
    getLineTitleByName:1426,//获取曲线信息1426
    openFileOk:1427,//打开多条曲线完毕
    getLineTitleByNames:1429,//获取多条曲线信息
    updateXYAxisParams:1430,//更新xy数据 1430
    updatelaserWaveLengthParams:1431,//更新激光波长参数
    saveImageFileByPath:1432,//保存图片
    UpdateFileNames:1435,
    openSyspMapping:1450,//打开   1450 sysp格式mapping文件
    saveSyspMapping:1451,//保存   1451 sysp格式mapping文件
    openHdrRawMapping:1460,//打开 1460 hdr raw格式mapping文件
    saveHdrRawMapping:1461,//保存 1461 hdr raw格式mapping文件
    commandRunWD:1500,//稳定性测试 采集
    commandStopWD:1503,//稳定性测试 采集 停止
    revXResult:1504,//x轴 结果 1504
    commandRunSpectrum:1510,//接谱性测试
    commandStopSpectrum:1515,//接谱性测试 停止
    commandRunAutoFocus:1600,//自动对焦
    commandStopAutoFocus:1605,//自动对焦 停止
    commandRunMap:1700,//mapping 开始
    commandStopMap:1703,//mapping 结束
    dbMappigGetXY:1710,//mapping 双击mapping 图 提取xy 1710
    mappingStop:1711,//mapping 采集结束
    mappingWH:1720,//mapping 矩阵长宽
    Rev_DDBack:1754,//比如位移台 连接后,传递 速度和加速度
    MappingPer:1766,//mapping 进度条
    addDataToDB:1800,//添加数据到数据库
    SelectToDB:1801,//数据库查询
    TurnPageToDB:1802,//翻页操作 1802
    SelectToDBVague:1803,//模糊查询
    getSampleTypess:1804,//获取数据类型
    Cal_DataToDB:1833,//数据库 1833  计算
    commandRunAutoFocusTitle:2000,//自动对焦提示信息
    autoFocusData:2001,//自动对焦数据
    dbAddRepetition:2100,//数据库是否存在对应的值
    DBView_Show:2900,//查看数据库中某一行的数据  2900
    pinholeMsg:3500, //针孔信息
    ErasingRay:3900, //擦除射线
    /*谱仪高级设置相关*/
    SetupSlit:3034,//设置是否安装狭缝
    SetupMirror:3035,//设置是否安装摆镜
    SetupShutter:3036,//设置是否安装快门
    IsSetupFilter:3037,//查询是否已安装滤光片轮
    SetupFilter:3038,//设置是否安装滤光片轮
    GetSlitModel:3039,//读取自动狭缝型号。
    SetSlitModel:3040,//设置自动狭缝型号。
    SetSlitHome:3041,//设置狭缝归零
    SetFilterModel:3042,//设置滤光片轮型号
    GetFilterModel:3043,//读取滤光片轮型号
    SetFilterLimit:3044,//设置滤光片有效波长起始位置
    GetFilterLimit:3045,//读取滤光片有效波长起始位置
    SetMotorHomeDir:3046,//设置步进电机定位方向
    GetMotorHomeDir:3047,//读取步进电机定位方向。
    SetMotorTotalSteps:3048,//设置步进电机总步数。
    GetMotorTotalSteps:3049,//读取步进电机总步数。
    GetMotorSpeed:3050,//读取步进电机移动速度
    SetMotorSpeed:3051,//设置步进电机移动速度
    SetMotorSteps:3052,//设置步进电机绝对移动步数
    GetMotorSteps:3053,//读取步进电机绝对移动步数
    GetZeroPos:3054,//读取光栅零级位置参数,第三个参数仅在Omni300S和HiperS系列谱仪上有效
    SetZeroPos:3055,//设置光栅零级位置参数,第三个参数仅在Omni300S和HiperS系列谱仪上有效
    SetInitGrating:3056,//设置开机初始化时光栅位置
    GetInitGrating:3057,//读取开机初始化时光栅位置
    SetInitWave:3058,//设置切换光栅时，光栅的定位位置
    GetInitWave:3059,//读取切换光栅时，光栅的定位位置
    SetMoveSpeed:3060,//设置单色仪移动速度
    GetMoveSpeed:3061,//读取单色仪移动速度
    SetSlitBandpass:3062,//设置指定的自动狭缝带宽
    GetSlitBandpass:3063,//获取指定的自动狭缝带宽
    GetTotalSteps:3064,//获取光栅台转一圈的总步数
    SetTotalStep:3065,//设置光栅台转一圈的总步数
    SetFilter:3066,//设置滤光片轮位置
    GetFilter:3067,//读取滤光片轮位置
    SetSlitZeroPos:3068,//设置指定的自动狭缝零点位置。
    GetSlitZeroPos:3069,//读取指定的自动狭缝零点位置。
    SetTurret:3070,//设置目前安装的塔台号
    GetTurret:3071,//读取目前安装的塔台号
    SetAdjustment:3072,//设置光栅校正系数
    GetAdjustment:3073,//读取光栅校正系数
    GetGratingInfo:3074,//读取光栅刻线和闪耀波长
    SetGratingInfo:3075,//设置光栅刻线和闪耀波长
    GetGratingMaxWave:3076,//获取光栅的最大波长
    Adjusting:3077,//计算光栅校正系数 3077
    nmToSteps:3078,//波长转步数
    eVToNm:3079,//电子伏特转波长
    nmToEv:3080,//波长转电子伏特
    SetGratingHome:3081,//光栅归零
    GetGrating:3032,//获取光栅号 3032
    GetCurWave:3033,//获取当前波长
    commandRunMapD:2700,//3DMapping开始
    open3DMapping:1470,//打开3DMapping 1470
    open3DMappingContent:14701,//读取3D文件内容
    save3DMapping:1471,//保存3DMapping 1471
    showMode3DMapping:1472,//更新显示模式3DMapping
    mapping3DXYZData:1711,//mapping获取x，y，z的坐标1711
    mapping3DCutPng:1712,//mapping保存3D截图数据文件 1712
    exportAllCurves:1473,//导出全部曲线 1473 二维
    exportAllCurves3D:1474,//导出全部曲线3D 1474
    exportAllCurvesPng:1475,//mapping保存3D截图数据文件 1475
    stopExportAllFile:1476,//导出文件停止1476
    getCurverSixPng:1477,//获取当前数据的六张图片
    getCurverSixPngData:147701,//获取截图的数据
    stimulateReadPos: 4201,//读取激发偏振位置
	stimulateZero: 4202,//归零激发偏振
	stimulateMoveTo:4203,//移动到指定位置
	stimulateSettingLevel:4204,//设置激发偏振水平位置
	stimulateExit:4205,//激发偏振退出
	launchReadPos:4206,//读取发射偏振位置
	launchZero:4207,//归零发射偏振
	launchMoveTo:4208,//移动到指定位置
	launchSettingLevel:4209,//设置发射偏振水平位置
	launchExit:4210,//发射偏振退出
	commandRunPolar:4211,//偏振测试
	commandStopPolar:4212,//停止偏振测试
}
const  deviceType = {
    spec:0,
    dc:1,
    rTot:2,
    dt:3,
    laser:4,
    camera:5
}