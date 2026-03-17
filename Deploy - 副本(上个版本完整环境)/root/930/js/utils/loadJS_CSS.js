loadJSAndCSS = new class{
    #strSite = window.location.protocol + "//" + window.location.host + "/"; //// 网站主机头
    #project =''
    //#project = 'Finder930-3D'
    #version = new Date().getTime()
    #SourceHash = {
        /*CSS*/
        mainCSS:{url: this.#strSite + this.#project+"/source/css/main.css",type:"css", version: this.#version},
        myBoots:{url: this.#strSite + this.#project+"/source/css/custom/myBoots.css",type:"css", version: this.#version},
        custom:{url: this.#strSite + this.#project+"/source/css/custom/custom.css",type:"css", version: this.#version},
        wait:{url: this.#strSite + this.#project+"/source/css/custom/wait.css",type:"css", version: this.#version},
        /*LIB*/
        myLC:{url: this.#strSite + this.#project+"/source/lib/lc/my_lc_4.1.js",type:"javascript", version:this.#version},
        proto:{url: this.#strSite + this.#project+"/source/lib/proto/finderProto.js",type:"javascript", version:this.#version},

       /*JS*/
        dataType: { url: this.#strSite + this.#project+"/js/config/dataType.js",type:"javascript", version: this.#version },
        config: { url: this.#strSite + this.#project+"/js/config/config.js",type:"javascript", version: this.#version },
        deviceControl: { url: this.#strSite + this.#project+"/js/control/deviceControl.js",type:"javascript", version: this.#version },
        steady: { url: this.#strSite + this.#project+"/js/scan/steady.js",type:"javascript", version: this.#version },
        wavelength: { url: this.#strSite + this.#project+"/js/scan/wavelength.js",type:"javascript", version: this.#version },
        polar: { url: this.#strSite + this.#project+"/js/scan/polar.js",type:"javascript", version: this.#version },
        sendDispatch: { url: this.#strSite + this.#project+"/js/wsDispatch/sendDispatch.js",type:"javascript", version: this.#version },
        receiveDispatch: { url: this.#strSite + this.#project+"/js/wsDispatch/receiveDispatch.js",type:"javascript", version: this.#version },
        revJsonDispatch: { url: this.#strSite + this.#project+"/js/wsDispatch/revJsonDispatch.js",type:"javascript", version: this.#version },
        webSocket: { url: this.#strSite + this.#project+"/js/wsDispatch/webSocket.js",type:"javascript", version: this.#version },

        lineProcess: { url: this.#strSite + this.#project+"/js/algorithm/lineProcess.js",type:"javascript", version: this.#version },
        legend: { url: this.#strSite + this.#project+"/js/utils/legend.js",type:"javascript", version: this.#version },
        load: { url: this.#strSite + this.#project+"/js/utils/load.js",type:"javascript", version: this.#version },
        dialog: { url: this.#strSite + this.#project+"/js/utils/dialog.js",type:"javascript", version: this.#version },
        inputRange: { url: this.#strSite + this.#project+"/js/utils/inputRange.js",type:"javascript", version: this.#version },
        index: { url: this.#strSite + this.#project+"/js/index.js",type:"javascript", version: this.#version },
    }

    loadJS_CSS(keys) {
        if (keys) {

            for (let i = 0; i < keys.length; i++) {

                let Node = this.#SourceHash[keys[i]];

                if (Node.type === 'javascript') {

                    document.writeln('<script  src="' + Node.url + '?' + Node.version + '"></script>');

                } else {

                    document.writeln('<link rel="stylesheet" type="text/css" href="' + Node.url + '?' + Node.version + '" />');

                }

            }

        }
    }
}()
