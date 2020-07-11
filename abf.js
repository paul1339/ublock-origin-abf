/// abf.js
/// alias abf.js
(function() {
    const sessionName = '@user__'
    const hashMini = str => {
        const json = `${JSON.stringify(str)}`
        let i, len, hash = 0x811c9dc5
        for (i = 0, len = json.length; i < len; i++) {
            hash = Math.imul(31, hash) + json.charCodeAt(i) | 0
        }
        return ('0000000' + (hash >>> 0).toString(16)).substr(-8)
    }
    const computeRandomValues = () => {
        const listRand = (list) => list[Math.floor(Math.random() * list.length)]
        const evenRand = (min, max) =>
            (Math.floor(Math.random() * ((max / 2) - min + 1)) + min) * 2
        const rand = (min, max) =>
            (Math.floor(Math.random() * (max - min + 1)) + min)
        // Device GPU
        // https://www.primegrid.com/gpu_list.php
        const webglRenderer = () => {
            const macRenderers = [{
                    gpu: 'AMD Radeon',
                    model: `20${listRand(['HD 7950',  'Pro 580', 'RX 570', 'RX Vega 56'])} Compute Engine`
                },
                {
                    gpu: 'NVIDIA GeForce GTX',
                    model: listRand(['675MX', '680'])
                }
            ]
            const renderers = [{
                    gpu: 'NVIDIA GeForce RTX',
                    model: `20${listRand([7, 8])}0${listRand(['', ' Super'])}`
                },
                {
                    gpu: 'NVIDIA GeForce GTX',
                    model: `10${listRand([5, 6, 7, 8])}0${listRand(['', ' Ti'])}`
                },
                {
                    gpu: 'Radeon',
                    model: `RX ${listRand([560, 570, 580])} Series`
                }
            ]
            const randomRenderer = (
                navigator.platform == 'MacIntel' ? listRand(macRenderers) : listRand(renderers)
            )
            const {
                gpu,
                model
            } = randomRenderer
            const randomizedRenderer = `${gpu} ${model}`
            const extension = {
                37446: `ANGLE (${randomizedRenderer} vs_${rand(1, 5)}_0 ps_${rand(1, 5)}_0)`
            }
            return extension
        }
        const webglExtensionComputed = webglRenderer()
        // canvasContext
        const canvas = () => {
            const randomRGBA = () => {
                const clr = () => Math.round(Math.random() * 255)
                return `rgba(${clr()},${clr()},${clr()},${Math.random().toFixed(1)})`
            }
            const randomFont = () => {
                const fontFamily = [
                    'Arial', 'Courier', 'Georgia', 'Helvetica', 'Impact', 'monospace', 'Tahoma', 'Times', 'Verdana'
                ]
                const fontSize = Math.floor((Math.random() * 100) + 12)
                const rand = Math.floor(Math.random() * fontFamily.length)
                return `${fontSize}px ${fontFamily[rand]}`
            }
            const fillStyle = randomRGBA()
            const shadowColor = randomRGBA()
            const strokeStyle = randomRGBA()
            const font = randomFont()
            const widthOffset = rand(-10, 10)
            const heightOffset = rand(-10, 10)
            return {
                fillStyle,
                shadowColor,
                strokeStyle,
                font,
                widthOffset,
                heightOffset
            }
        }
        const canvasContextComputed = canvas()
        // clientRects
        const clientRectsOffsetComputed = rand(10, 99)
        // audioData
        const channelNoise = Math.random() * 0.0000001
        const frequencyNoise = Math.random() * 0.001
        const audioDataComputed = {
            channelNoise,
            frequencyNoise
        }
        // create hashes
        const hash = hashMini({
            webglExtensionComputed,
            canvasContextComputed,
            clientRectsOffsetComputed,
            audioDataComputed
        })
        // log exection
        const timestamp = new Date().toLocaleTimeString()
        console.log(`${timestamp}: Setting up new randomization... ${hash}`)
        return {
            timestamp,
            hash,
            webglExtensionComputed,
            canvasContextComputed,
            clientRectsOffsetComputed,
            audioDataComputed
        }
    }
    // set session
    if (!sessionStorage.getItem(sessionName)) {
        sessionStorage.setItem(sessionName, JSON.stringify(computeRandomValues()))
    }
    // get session
    const {
        timestamp,
        hash,
        webglExtensionComputed,
        canvasContextComputed,
        clientRectsOffsetComputed,
        audioDataComputed
    } = JSON.parse(sessionStorage.getItem(sessionName))
    const sessionProtection = `uBlock Origin ABF Session: ${hash} @${timestamp}`
    console.log(sessionProtection)
    // webgl
    function computeGetParameter() {
        const nativeGetParameter = WebGLRenderingContext.prototype.getParameter
        return function getParameter(x) {
            return (
                webglExtensionComputed === false ? nativeGetParameter.apply(this, arguments) :
                webglExtensionComputed[x] ? webglExtensionComputed[x] :
                nativeGetParameter.apply(this, arguments)
            )
        }
    }
    // canvas
    const canvasProto = HTMLCanvasElement.prototype
    const nativeGetContext = HTMLCanvasElement.prototype.getContext
    const nativeToDataURL = HTMLCanvasElement.prototype.toDataURL
    const nativeToBlob = HTMLCanvasElement.prototype.toBlob
    const nativeGetImageData = CanvasRenderingContext2D.prototype.getImageData
    function getContext(contextType, contextAttributes) {
        canvasProto._contextType = contextType
        return nativeGetContext.apply(this, arguments)
    }
    function randomizeContext2D(context) {
        const {
            fillStyle,
            shadowColor,
            strokeStyle,
            font
        } = canvasContextComputed
        context.textBaseline = 'top'
        context.textBaseline = 'alphabetic'
        context.fillStyle = fillStyle
        context.shadowColor = shadowColor
        context.strokeStyle = strokeStyle
        context.fillText('.', 4, 17)
        context.font = font
        return context
    }
    function randomizeContextWebgl(context) {
        const {
            widthOffset,
            heightOffset
        } = canvasContextComputed
        context.width += widthOffset
        context.height += heightOffset
        return context
    }
    function toDataURL() {
        if (this._contextType == '2d') {
            const context = nativeGetContext.apply(this, ['2d'])
            randomizeContext2D(context)
            return nativeToDataURL.apply(this, arguments)
        } else if (this._contextType == 'webgl') {
            randomizeContextWebgl(this)
            return nativeToDataURL.apply(this, arguments)
        }
        return nativeToDataURL.apply(this, arguments)
    }
    function toBlob() {
        if (this._contextType == '2d') {
            const context = nativeGetContext.apply(this, ['2d'])
            randomizeContext2D(context)
            return nativeToBlob.apply(this, arguments)
        } else if (this._contextType == 'webgl') {
            randomizeContextWebgl(this)
            return nativeToBlob.apply(this, arguments)
        }
        return nativeToBlob.apply(this, arguments)
    }
    function getImageData() {
        const context = randomizeContext2D(this)
        return nativeGetImageData.apply(context, arguments)
    }
    // clientRects
    const nativeElementGetClientRects = Element.prototype.getClientRects
    const nativeElementGetBoundingClientRect = Element.prototype.getBoundingClientRect
    const nativeRangeGetClientRects = Range.prototype.getClientRects
    const nativeRangeGetBoundingClientRect = Range.prototype.getBoundingClientRect
    const randomClient = type => {
        const tryRandomNumber = (num, computedOffset) => {
            const shouldLieNumber = num => {
                const decimals = num && num.toString().split('.')[1]
                return decimals && decimals.length > 10 ? true : false
            }
            if (shouldLieNumber(num)) {
                const str = '' + num
                const offset = '' + computedOffset
                const randomizedNumber = +(
                    str.slice(0, -3) + offset + str.slice(-1)
                )
                return randomizedNumber
            }
            return num
        }
        const method = (
            type == 'rangeRects' ? nativeRangeGetClientRects :
            type == 'rangeBounding' ? nativeRangeGetBoundingClientRect :
            type == 'elementRects' ? nativeElementGetClientRects :
            type == 'elementBounding' ? nativeElementGetBoundingClientRect : ''
        )
        const domRectify = (client) => {
            const props = ['bottom', 'height', 'left', 'right', 'top', 'width', 'x', 'y']
            if (client.length) {
                let i, len = client.length
                for (i = 0; i < len; i++) {
                    client[i][props[0]] = tryRandomNumber(client[i][props[0]], clientRectsOffsetComputed)
                    client[i][props[1]] = tryRandomNumber(client[i][props[1]], clientRectsOffsetComputed)
                    client[i][props[2]] = tryRandomNumber(client[i][props[2]], clientRectsOffsetComputed)
                    client[i][props[3]] = tryRandomNumber(client[i][props[3]], clientRectsOffsetComputed)
                    client[i][props[4]] = tryRandomNumber(client[i][props[4]], clientRectsOffsetComputed)
                    client[i][props[5]] = tryRandomNumber(client[i][props[5]], clientRectsOffsetComputed)
                    client[i][props[6]] = tryRandomNumber(client[i][props[6]], clientRectsOffsetComputed)
                    client[i][props[7]] = tryRandomNumber(client[i][props[7]], clientRectsOffsetComputed)
                }
                return client
            }
            props.forEach(prop => {
                client[prop] = tryRandomNumber(client[prop], clientRectsOffsetComputed)
            })
            return client
        }
        function getBoundingClientRect() {
            const client = method.apply(this, arguments)
            return domRectify(client)
        }
        function getClientRects() {
            const client = method.apply(this, arguments)
            return domRectify(client)
        }
        return (
            type == 'rangeRects' || type == 'elementRects' ? getClientRects :
            getBoundingClientRect
        )
    }
    // audioData
    const {
        channelNoise,
        frequencyNoise
    } = audioDataComputed
    const nativeGetChannelData = AudioBuffer.prototype.getChannelData
    const nativeCopyFromChannel = AudioBuffer.prototype.copyFromChannel
    const nativeGetByteFrequencyData = AnalyserNode.prototype.getByteFrequencyData
    const nativeGetFloatFrequencyData = AnalyserNode.prototype.getFloatFrequencyData
    function computePCMData(obj, args) {
        const data = nativeGetChannelData.apply(obj, args)
        let i, len = data ? data.length : 0
        for (i = 0; i < len; i++) {
            // ensure audio is within range of -1 and 1
            const audio = data[i]
            const noisified = audio + channelNoise
            data[i] = noisified > -1 && noisified < 1 ? noisified : audio
        }
        obj._pcmDataComputedChannel = args[0]
        obj._pcmDataComputed = data
        return data
    }
    function getChannelData(channel) {
        // if pcm data is already computed to this AudioBuffer Channel then return it
        if (this._pcmDataComputed && this._pcmDataComputedChannel == channel) {
            return this._pcmDataComputed
        }
        // else compute pcm data to this AudioBuffer Channel and return it
        const data = computePCMData(this, arguments)
        return data
    }
    function copyFromChannel(destination, channel) {
        // if pcm data is not yet computed to this AudioBuffer Channel then compute it
        if (!(this._pcmDataComputed && this._pcmDataComputedChannel == channel)) {
            computePCMData(this, [channel])
        }
        // else make no changes to this AudioBuffer Channel (seeing it is already computed)
        return nativeCopyFromChannel.apply(this, arguments)
    }
    function computeFrequencyData(data) {
        let i, len = data.length
        for (i = 0; i < len; i++) {
            data[i] += frequencyNoise
        }
        return
    }
    function getByteFrequencyData(uint8Arr) {
        nativeGetByteFrequencyData.apply(this, arguments)
        computeFrequencyData(uint8Arr)
        return
    }
    function getFloatFrequencyData(float32Arr) {
        nativeGetFloatFrequencyData.apply(this, arguments)
        computeFrequencyData(float32Arr)
        return
    }
    // Detect Fingerprinting
    // Property API and Fingerprint Rank
    const propAPI = {
        appVersion: ['Navigator.prototype.appVersion', 1],
        deviceMemory: ['Navigator.prototype.deviceMemory', 1],
        doNotTrack: ['Navigator.prototype.doNotTrack', 1],
        hardwareConcurrency: ['Navigator.prototype.hardwareConcurrency', 1],
        languages: ['Navigator.prototype.languages', 1],
        maxTouchPoints: ['Navigator.prototype.maxTouchPoints', 1],
        mimeTypes: ['Navigator.prototype.mimeTypes', 1],
        platform: ['Navigator.prototype.platform', 1],
        plugins: ['Navigator.prototype.plugins', 1],
        userAgent: ['Navigator.prototype.userAgent', 1],
        vendor: ['Navigator.prototype.vendor', 1],
        connection: ['Navigator.prototype.connection', 1],
        getBattery: ['Navigator.prototype.getBattery', 1],
        getGamepads: ['Navigator.prototype.getGamepads', 1],
        width: ['Screen.prototype.width', 1],
        height: ['Screen.prototype.height', 1],
        availWidth: ['Screen.prototype.availWidth', 1],
        availHeight: ['Screen.prototype.availHeight', 1],
        availTop: ['Screen.prototype.availTop', 1],
        availLeft: ['Screen.prototype.availLeft', 1],
        colorDepth: ['Screen.prototype.colorDepth', 1],
        pixelDepth: ['Screen.prototype.pixelDepth', 1],
        getTimezoneOffset: ['Date.prototype.getTimezoneOffset', 1],
        resolvedOptions: ['Intl.DateTimeFormat.prototype.resolvedOptions', 1],
        acos: ['acos: Math.acos', 1],
        acosh: ['Math.acosh', 1],
        asin: ['Math.asin', 1],
        asinh: ['Math.asinh', 1],
        cosh: ['Math.cosh', 1],
        expm1: ['Math.expm1', 1],
        sinh: ['Math.sinh', 1],
        enumerateDevices: ['navigator.mediaDevices.enumerateDevices', 1],
        canPlayType: ['prototype.canPlayType', 1],
        isTypeSupported: ['isTypeSupported', 1],
        getVoices: ['speechSynthesis.getVoices', 1],
        now: ['Performance.prototype.now', 1],
        getBoundingClientRect: ['prototype.getBoundingClientRect', 1],
        getClientRects: ['prototype.getClientRects', 3],
        offsetWidth: ['HTMLElement.prototype.offsetWidth', 1],
        offsetHeight: ['HTMLElement.prototype.offsetHeight', 1],
        shaderSource: ['WebGLRenderingContext.prototype.shaderSource', 4],
        getExtension: ['WebGLRenderingContext.prototype.getExtension', 4],
        getParameter: ['WebGLRenderingContext.prototype.getParameter', 8],
        getSupportedExtensions: ['WebGLRenderingContext.prototype.getSupportedExtensions', 4],
        getContext: ['HTMLCanvasElement.prototype.getContext', 1],
        toDataURL: ['HTMLCanvasElement.prototype.toDataURL', 8],
        toBlob: ['HTMLCanvasElement.prototype.toBlob', 4],
        getImageData: ['CanvasRenderingContext2D.prototype.getImageData', 8],
        isPointInPath: ['CanvasRenderingContext2D.prototype.isPointInPath', 1],
        isPointInStroke: ['CanvasRenderingContext2D.prototype.isPointInStroke', 1],
        measureText: ['CanvasRenderingContext2D.prototype.measureText', 2],
        createAnalyser: ['AudioContext.prototype.createAnalyser', 4],
        createOscillator: ['AudioContext.prototype.createOscillator', 4],
        getChannelData: ['AudioBuffer.prototype.getChannelData', 8],
        copyFromChannel: ['AudioBuffer.prototype.copyFromChannel', 8],
        getByteFrequencyData: ['AnalyserNode.prototype.getByteFrequencyData', 8],
        getFloatFrequencyData: ['AnalyserNode.prototype.getFloatFrequencyData', 8],
        createDataChannel: ['RTCPeerConnection.prototype.createDataChannel', 3],
        createOffer: ['RTCPeerConnection.prototype.createOffer', 3],
        setRemoteDescription: ['RTCPeerConnection.prototype.setRemoteDescription', 3]
    }
    // https://stackoverflow.com/questions/2255689/how-to-get-the-file-path-of-the-currently-executing-javascript-code
    const getCurrentScript = () => {
        const jsURL = /(\/.+\.js)/gi
        const error = new Error()
        let path
        try {
            path = error.stack.match(jsURL)[0]
            return 'https:' + path
        } catch (err) {
            return '[unknown source]'
        }
    }
    const itemInList = (list, item) => list.indexOf(item) > -1
    let listenForExcessivePropReads = true
    let rankCounter = 0
    const warningRank = 14 // total rank that triggers fingerprinting detected warning
    const propsRead = [] // collect each property read
    const propsReadAll = {} // collects how many times each property is read
    const fingerprintScripts = []
    const scripts = []
    const watch = prop => {
        const url = getCurrentScript()
        const propDescription = propAPI[prop][0]
        const fpRank = propAPI[prop][1]
        const tracedScript = scripts.filter(s => s.url == url)[0] // previously traced script?
        const newPropRead = !itemInList(propsRead, propDescription)
        // count how many times each prop is read
        if (propsReadAll[propDescription]) {
            propsReadAll[propDescription]++
        } else {
            propsReadAll[propDescription] = 1
        }
        // if new property is read, increase the rank counter and add it to collection of props read 
        if (newPropRead) {
            rankCounter += fpRank
            propsRead.push(propDescription)
        }
        // if the script is not yet in the traced scripts collection, add it
        if (!tracedScript) {
            scripts.push({
                creep: false,
                url,
                fpRank,
                reads: [propDescription],
                all: {
                    [propDescription]: 1
                }
            })
        }
        // else if this is not the first time the prop was read (in this previously traced script)
        else if (!itemInList(tracedScript.reads, propDescription)) {
            tracedScript.fpRank += fpRank // increase the rank (update only on first prop read)
            tracedScript.reads.push(propDescription)
            tracedScript.all[propDescription] = 1
            // detect
            const fingerprintingDetected = tracedScript.fpRank >= warningRank
            const alreadyCaught = tracedScript.creep
            if (!alreadyCaught && fingerprintingDetected) {
                const randomString = () => (Math.random() + 1).toString(36).substring(2, 8)
                const randomMessage = `${randomString()} ${randomString()} ${randomString()}`
                const warning = 'Fingerprinting detected!'
                tracedScript.creep = true // caught!
                fingerprintScripts.push(url)
                const message = (
                	warning + '\n\n'
                	+ url + '\n\n'
                	+ Object.keys(tracedScript.all).map(prop => prop.replace(/\.prototype/, '')).join(', ')+'...'+ '\n\n'
                	+ sessionProtection
            	)
                const sessionPermission = sessionStorage.getItem(sessionName + 'permission')
            	if (sessionPermission == 'deny') {
            		throw new ReferenceError(randomMessage)
            	}
                if (!sessionPermission) {
                    const permission = confirm(message)
                    if (permission) {
                    	sessionStorage.setItem(sessionName + 'permission', 'allow')
                    }
                    else {
                    	sessionStorage.setItem(sessionName + 'permission', 'deny')
                        throw new ReferenceError(randomMessage)
                    }
                }
            }
        } else {
            tracedScript.all[propDescription]++
        }
        return
    }
    // difinify
    const intlProps = {
        resolvedOptions: Intl.DateTimeFormat.prototype.resolvedOptions
    }
    const mediaDeviceProps = {
        enumerateDevices: navigator.mediaDevices.enumerateDevices
    }
    const apiStructs = [{
            name: 'Navigator',
            proto: true,
            struct: {
                platform: navigator.platform,
                appVersion: navigator.appVersion,
                userAgent: navigator.userAgent,
                maxTouchPoints: navigator.maxTouchPoints,
                hardwareConcurrency: navigator.hardwareConcurrency,
                deviceMemory: navigator.deviceMemory,
                doNotTrack: navigator.doNotTrack,
                languages: navigator.languages,
                mimeTypes: navigator.mimeTypes,
                plugins: navigator.plugins,
                connection: navigator.connection,
                getBattery: navigator.getBattery,
                getGamepads: navigator.getGamepads
            }
        },
        {
            name: 'Screen',
            proto: true,
            struct: {
                width: screen.width,
                height: screen.height,
                availWidth: screen.availWidth,
                availHeight: screen.availHeight,
                colorDepth: screen.colorDepth,
                pixelDepth: screen.pixelDepth
            }
        },
        {
            name: 'Date',
            proto: true,
            struct: {
                getTimezoneOffset: Date.prototype.getTimezoneOffset
            }
        },
        {
            name: 'Math',
            proto: false,
            struct: {
                acos: Math.acos,
                acosh: Math.acosh,
                asin: Math.asin,
                asinh: Math.asinh,
                cosh: Math.cosh,
                expm1: Math.expm1,
                sinh: Math.sinh
            }
        },
        {
            name: 'HTMLVideoElement',
            proto: true,
            struct: {
                canPlayType: HTMLVideoElement.prototype.canPlayType
            }
        },
        {
            name: 'HTMLMediaElement',
            proto: true,
            struct: {
                canPlayType: HTMLMediaElement.prototype.canPlayType
            }
        },
        {
            name: 'MediaSource',
            proto: false,
            struct: {
                isTypeSupported: MediaSource.isTypeSupported
            }
        },
        {
            name: 'MediaRecorder',
            proto: false,
            struct: {
                isTypeSupported: MediaRecorder.isTypeSupported
            }
        },
        {
            name: 'speechSynthesis',
            proto: false,
            struct: {
                getVoices: speechSynthesis.getVoices
            }
        },
        {
            name: 'Performance',
            proto: true,
            struct: {
                now: performance.now
            }
        },
        {
            name: 'Element',
            proto: true,
            struct: {
                getBoundingClientRect: randomClient('elementBounding'),
                getClientRects: randomClient('elementRects')
            }
        },
        {
            name: 'Range',
            proto: true,
            struct: {
                getBoundingClientRect: randomClient('rangeBounding'),
                getClientRects: randomClient('rangeRects')
            }
        },
        {
            name: 'WebGLRenderingContext',
            proto: true,
            struct: {
                shaderSource: WebGLRenderingContext.prototype.shaderSource,
                getExtension: WebGLRenderingContext.prototype.getExtension,
                getParameter: computeGetParameter(),
                getSupportedExtensions: WebGLRenderingContext.prototype.getSupportedExtensions
            }
        },
        {
            name: 'HTMLCanvasElement',
            proto: true,
            struct: {
                getContext: getContext,
                toDataURL: toDataURL,
                toBlob: toBlob,
            }
        },
        {
            name: 'CanvasRenderingContext2D',
            proto: true,
            struct: {
                getImageData: getImageData,
                isPointInPath: CanvasRenderingContext2D.prototype.isPointInPath,
                isPointInStroke: CanvasRenderingContext2D.prototype.isPointInStroke,
                measureText: CanvasRenderingContext2D.prototype.measureText
            }
        },
        {
            name: 'AudioContext',
            proto: true,
            struct: {
                createAnalyser: AudioContext.prototype.createAnalyser,
                createOscillator: AudioContext.prototype.createOscillator
            }
        },
        {
            name: 'AudioBuffer',
            proto: true,
            struct: {
                getChannelData: getChannelData,
                copyFromChannel: copyFromChannel
            }
        },
        {
            name: 'AnalyserNode',
            proto: true,
            struct: {
                getByteFrequencyData: getByteFrequencyData,
                getFloatFrequencyData: getFloatFrequencyData
            }
        },
        {
            name: 'RTCPeerConnection',
            proto: true,
            struct: {
                createDataChannel: RTCPeerConnection.prototype.createDataChannel,
                createOffer: RTCPeerConnection.prototype.createOffer,
                setRemoteDescription: RTCPeerConnection.prototype.setRemoteDescription
            }
        }
    ]
    function definify(struct) {
        const redefinedProps = {}
        Object.keys(struct).forEach(prop => {
            const fn = () => {
                watch(prop);
                return struct[prop]
            }
            Object.defineProperties(fn, {
                name: {
                    value: 'get ' + prop,
                    configurable: true
                }
            })
            redefinedProps[prop] = {
                get: fn,
                configurable: false
            }
        })
        return redefinedProps
    }
    function redefine(root) {
        // Randomized
        apiStructs.forEach(api => {
            const {
                name,
                proto,
                struct
            } = api
            try {
                return Object.defineProperties(
                    (proto ? root[name].prototype : root[name]), definify(struct)
                )
            } catch (error) {
                console.error(error)
            }
        })
        // Deep calls
        Object.defineProperties(root.Intl.DateTimeFormat.prototype, definify(intlProps))
        Object.defineProperties(root.navigator.mediaDevices, definify(mediaDeviceProps))
        // Resist lie detection               
        const library = {
            appVersion: 'appVersion',
            deviceMemory: 'deviceMemory',
            doNotTrack: 'doNotTrack',
            hardwareConcurrency: 'hardwareConcurrency',
            languages: 'languages',
            maxTouchPoints: 'maxTouchPoints',
            mimeTypes: 'mimeTypes',
            platform: 'platform',
            plugins: 'plugins',
            userAgent: 'userAgent',
            vendor: 'vendor',
            connection: 'connection',
            getBattery: 'getBattery',
            getGamepads: 'getGamepads',
            width: 'width',
            height: 'height',
            availWidth: 'availWidth',
            availHeight: 'availHeight',
            availTop: 'availTop',
            availLeft: 'availLeft',
            colorDepth: 'colorDepth',
            pixelDepth: 'pixelDepth',
            getTimezoneOffset: 'getTimezoneOffset',
            resolvedOptions: 'resolvedOptions',
            acos: 'acos',
            acosh: 'acosh',
            asin: 'asin',
            asinh: 'asinh',
            cosh: 'cosh',
            expm1: 'expm1',
            sinh: 'sinh',
            enumerateDevices: 'enumerateDevices',
            canPlayType: 'canPlayType',
            isTypeSupported: 'isTypeSupported',
            getVoices: 'getVoices',
            now: 'now',
            getBoundingClientRect: 'getBoundingClientRect',
            getClientRects: 'getClientRects',
            offsetWidth: 'offsetWidth',
            offsetHeight: 'offsetHeight',
            shaderSource: 'shaderSource',
            getExtension: 'getExtension',
            getParameter: 'getParameter',
            getSupportedExtensions: 'getSupportedExtensions',
            getContext: 'getContext',
            toDataURL: 'toDataURL',
            toBlob: 'toBlob',
            getImageData: 'getImageData',
            isPointInPath: 'isPointInPath',
            isPointInStroke: 'isPointInStroke',
            measureText: 'measureText',
            createAnalyser: 'createAnalyser',
            createOscillator: 'createOscillator',
            getChannelData: 'getChannelData',
            copyFromChannel: 'copyFromChannel',
            getByteFrequencyData: 'getByteFrequencyData',
            getFloatFrequencyData: 'getFloatFrequencyData',
            createDataChannel: 'createDataChannel',
            createOffer: 'createOffer',
            setRemoteDescription: 'setRemoteDescription',
        }
        // create Chrome Proxy
        const {
            toString
        } = Function.prototype
        const toStringProxy = new Proxy(toString, {
            apply: (target, thisArg, args) => {
                const name = thisArg.name
                const propName = name.replace('get ', '')
                if (thisArg === toString.toString) {
                    return 'function toString() { [native code] }'
                }
                if (propName === library[propName]) {
                    return 'function ' + name + '() { [native code] }'
                }
                return target.call(thisArg, ...args)
            }
        })
        root.Function.prototype.toString = toStringProxy
    }
    redefine(window)
    // catch iframes on dom loaded
    const domLoaded = (fn) => document.readyState != 'loading' ?
        fn() : document.addEventListener('DOMContentLoaded', fn)
    domLoaded(() => {
        ;[...document.getElementsByTagName('iframe')].forEach(frame => redefine(frame.contentWindow))
    })
})()