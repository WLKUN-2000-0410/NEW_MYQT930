class _filter {
    constructor() {
        this.setup = false;
        this.idx = 1;//位置
    }
}

class _slit {
    constructor() {
        this.setup = false;
        this.width = 1;
    }
}
class _mirror {
    constructor(p) {
        this.setup = false;
        this.port = p;
    }
}
class _shutter {
    constructor() {
        this.setup = false;
        this.status = false;
    }
}
const device = new class {
    devSN = {}//设备信息
    pinholeMsg=[]//针孔信息
    camera = {
        isChecked: false,
        isConnected: false,
        info: '',
        type:true, //2d True 3d false
        auto:false,
        mirrorPos:-1.0
    }
    ccd = {
        isConnected: false,
        info: '',
        movieState:false,
        dir:0,
        auto:false
    }
    //位移台
    dT = {
        isChecked: false,
        isConnected: false,
        info: '',
        auto:false,
        fval:0,//速度
        fAccval:0//加速度
    }
    spec = {
        slitType:'',
        gratings:[],
        grating: 0,
        minRangeNM:0,
        maxRangeNM:65535,
        minRangeCM:-1,
        maxRangeCM:65535,
        isConnected: false,
        info: '',
        auto:false,
        filter:new _filter(),
        slit:[new _slit(),new _slit(),new _slit(),new _slit()], //0 侧入 1 侧出 2 直出 3 直入
        mirror:[new _mirror(true),new _mirror(true)], //0 出口 1入口
        shutter:[new _shutter(),new _shutter()]
    }
    //光路电机
    rTOT = {
        isChecked: false,
        isConnected: false,
        info: '',
        auto:false
    }
    //激光器
    laser = {
        isChecked: false,
        isConnected: false,
        info: 'COM1',
        auto:false
    }
}()
var fConfig = {
    'autoFocus': {'peakMax': 0, 'peakMin': 0, 'sensitivity': 0, 'stepSize': 0, 'tangoMax': 0, 'tangoMin': 0},
    'lensConf':[{"name":"100","scale":9.95,"size":5},{"name":"50","scale":4.9,"size":10},{"name":"10","scale":0.974,"size":50}],
    'ccdConf': {
        'binMax': '',
        'binMin': '',
        'expTime': 0.3,
        'gainNum': '',
        'mode': '',
        'readoutRate': '',
        'transferRate': '',
        'ccdMirror': 1

    },
    'centerwave': 0.0,
    'deviceAutoConn': {
        'cameraType': '',
        'ccdType': '',
        'iSpecAutoC': false,
        'isCameraAutoC': false,
        'isCcdAutoC': false,
        'isLaserAutoC': false,
        'isMotorAutoC': false,
        'isMovedAutoC': false,
        'laserCom': 'COM36',
        'motorType': '',
        'specType': '',
        'tangoCom': ''
    },
    'deviceChoose': {'chooseCamera': false, 'chooseLaser': false, 'chooseMotor': false, 'chooseTango': false},
    'excwave': '532nm',
    'excwaveselect': [
        {
            'E': 533.2,
            'chooseDevice': true,
            'deviceNum': 0,
            'name': '空',
            'power': {}
        },
        {
            'chooseDevice': true,
            'deviceNum': 3,
            'grating1': 532.2,
            'grating2': 532.3,
            'grating3': 532.4,
            'name': '532nm',
            'power': {'1': '0.1', '2': '0.2', '3': '0.5', '4': '1', '5': '2', '6': '5', '7': '10', '8': '20', '9': '50'}
        },
        {
            'chooseDevice': false,
            'deviceNum': 2,
            'grating1': 638.1,
            'grating2': 638.2,
            'grating3': 638.3,
            'name': '638nm',
            'power': {
                '1': '0.1',
                '2': '0.2',
                '3': '0.5',
                '4': '1',
                '5': '2',
                '6': '5',
                '7': '10',
                '8': '15',
                '9': 'max'
            }
        },
        {
            'chooseDevice': true,
            'deviceNum': 1,
            'grating1': 785.1,
            'grating2': 785.2,
            'grating3': 785.3,
            'name': '785nm',
            'power': {
                '1': '0.1',
                '2': '0.2',
                '3': '0.5',
                '4': '1',
                '5': '2',
                '6': '5',
                '7': '10',
                '8': '20',
                '9': 'max'
            }
        },
        {
            'chooseDevice': false,
            'deviceNum': 4,
            'grating1': 532.2,
            'grating2': 532.3,
            'grating3': 532.4,
            'name': '其他',
            'power': {'1': '10', '2': '20', '3': '30', '4': '40', '5': '50', '6': '60', '7': '70', '8': '80', '9': '90'}
        },
        {
            'M3COL': {'0': '0', '1': '50', '2': '100', '3': '200', '4': '300', '5': '400'},
            'chooseDevice': false,
            'deviceNum': 888,
            'name': 'pinhole'
        }
    ],
    'expTime': 0.0,
    'funnm': 0,
    'grating': 'grating1',
    'intervalflag': false,
    'intervalnum': 0,
    'intervaltime': 0,
    'pinhole': 0,
    'powervalue':1,
    'slit': 10,
    'spectrumfrom': 0,
    'spectrumto': 0,
    'tangoConf': {'maxRangeX': 75000, 'maxRangeY': 5000, 'minRangeX': -75000, 'minRangeY': -5000, 'points': 200,"zmotionIp":"10.0.0.100","zmotionType":0},
    'totalnum': 1,
    'waveunit': 'nm',
    'steadyUnit':'nm',
    'steadyCenter':0,
    'spectrumUnit':'nm',
    'waveFrom':0,
    'waveTo':0,
    'specSchemes': [],//接谱方案
    'stabSchemes': [],//稳定性方案
    'comlist':[],
    "peakFlag":false,
    "peakFrom":"400.00",
    "peakTo":"700.00"

}
