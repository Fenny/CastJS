// Import cast framework
if (window.chrome && !window.chrome.cast) {
    var script = document.createElement('script');
    script.src = 'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1';
    document.head.appendChild(script);
}

// Castjs
class Castjs {
    // constructor takes optional options
    constructor(opt = {}) {
        // valid join policies
        var joinpolicies = [
            'tab_and_origin_scoped',
            'origin_scoped',
            'page_scoped'
        ];

        // only allow valid join policy
        if (!opt.joinpolicy || joinpolicies.indexOf(opt.joinpolicy) === -1) {
            opt.joinpolicy = 'tab_and_origin_scoped';
        }

        // set default receiver ID if none provided
        if (!opt.receiver || opt.receiver === '') {
            opt.receiver = 'CC1AD845';
        }

        // Internal stuff, modified in v6x
        this._internal = {
            events: {},
            player: null,
            controller: null,
        }

        // public variables
        // this.version        = 'v6.0.0'
        this.receiver       = opt.receiver;
        this.joinpolicy     = opt.joinpolicy;
        this.available      = false;
        this.connected      = false;
        this.device         = 'Chromecast';
        // New in v6x
        this.media       = {
            src:            '',
            title:          '',
            description:    '',
            poster:         '',
            subtitles:      []
        }

        this.volumeLevel    = 1;
        this.muted          = false;
        this.paused         = false;
        this.time           = 0;
        this.timePretty     = '00:00';
        this.duration       = 0;
        this.durationPretty = '00:00';
        this.progress       = 0;
        this.state          = 'disconnected';

        Object.defineProperty(this, 'version', {
            get() {
                console.warn('Castjs: The property "version" is deprecated and removed in version v6.0.0.\nSee documentation: https://github.com/castjs/castjs.');
                return 'v6.0.0'
            }
        });
        Object.defineProperty(this, 'src', {
            get() {
                console.warn('Castjs: The property "src" is deprecated, please use "media.src" instead.\nSee documentation: https://github.com/castjs/castjs.');
                return this.media.src;
            },
            set(value) {
                this.media.src = value;
            }
        });
        Object.defineProperty(this, 'title', {
            get() {
                console.warn('Castjs: The property "title" is deprecated, please use "media.title" instead.\nSee documentation: https://github.com/castjs/castjs.');
                return this.media.title;
            },
            set(value) {
                this.media.title = value;
            }
        });

        Object.defineProperty(this, 'description', {
            get() {
                console.warn('Castjs: The property "description" is deprecated, please use "media.description" instead.\nSee documentation: https://github.com/castjs/castjs.');
                return this.media.description;
            },
            set(value) {
                this.media.description = value;
            }
        });

        Object.defineProperty(this, 'poster', {
            get() {
                console.warn('Castjs: The property "poster" is deprecated, please use "media.poster" instead.\nSee documentation: https://github.com/castjs/castjs.');
                return this.media.poster;
            },
            set(value) {
                this.media.poster = value;
            }
        });

        Object.defineProperty(this, 'subtitles', {
            get() {
                console.warn('Castjs: The property "subtitles" is deprecated, please use "media.subtitles" instead.\nSee documentation: https://github.com/castjs/castjs.');
                return this.media.subtitles;
            },
            set(value) {
                this.media.subtitles = value;
            }
        });

        // initialize chromecast framework
        this._init()
    }
    _getBrowser() {
        if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1){
            return "Firefox: Please enable casting, click here: https://googlechromecast.com/how-to-cast-firefox-to-tv/"
        }
        if (navigator.userAgent.toLowerCase().indexOf('opr/') > -1) {
            return "Opera: Please enable casting, click here: https://googlechromecast.com/how-to-cast-opera-browser-to-tv-using-google-chromecast/"
        }
        if (navigator.userAgent.toLowerCase().indexOf('iron safari') > -1) {
            return "Iron Safari: Please enable casting, click here: https://googlechromecast.com/how-to-cast-opera-browser-to-tv-using-google-chromecast/"
        }
        if (navigator.brave) {
            return "Brave: Please enable casting, click here: https://googlechromecast.com/how-to-cast-brave-browser-to-chromecast/"
        }
        return "This Browser"
    }
    _init(tries = 0) {
        // casting only works on chrome, opera, brave and vivaldi
        if (!window.chrome || !window.chrome.cast || !window.chrome.cast.isAvailable) {
            if (tries++ > 20) {
                return this.trigger('error', 'Casting is not enabled in ' + this._getBrowser());
            }
            return setTimeout(this._init.bind(this), 250, tries);
        }

        // terminate loop
        clearInterval(this.intervalIsAvailable);

        // initialize cast API
        cast.framework.CastContext.getInstance().setOptions({
            receiverApplicationId:      this.receiver,
            autoJoinPolicy:             this.joinpolicy,
            language:                   'en-US',
            resumeSavedSession:         true,
        });
        // create remote player controller
        this._internal.player = new cast.framework.RemotePlayer();
        this._internal.controller = new cast.framework.RemotePlayerController(this._internal.player);

        // register callback events
        this._internal.controller.addEventListener('playerStateChanged',  this._playerStateChanged.bind(this));
        this._internal.controller.addEventListener('isConnectedChanged',  this._isConnectedChanged.bind(this));
        this._internal.controller.addEventListener('isMediaLoadedChanged',this._isMediaLoadedChanged.bind(this));
        this._internal.controller.addEventListener('isMutedChanged',      this._isMutedChanged.bind(this));
        this._internal.controller.addEventListener('isPausedChanged',     this._isPausedChanged.bind(this));
        this._internal.controller.addEventListener('currentTimeChanged',  this._currentTimeChanged.bind(this));
        this._internal.controller.addEventListener('durationChanged',     this._durationChanged.bind(this));
        this._internal.controller.addEventListener('volumeLevelChanged',  this._volumeLevelChanged.bind(this));
        this._internal.controller.addEventListener('ANY_CHANGE',  this._anyChange.bind(this));
        this.available = true;
        this.trigger('available');
    }
    _anyChange() {
        console.log('lol')
        console.log(this._internal.player)
    }
    _isMediaLoadedChanged() {
        // don't update media info if not available
        if (!this._internal.player.isMediaLoaded) {
            return
        }
        // there is a bug where mediaInfo is not directly available
        // so we are skipping one tick in the event loop, zzzzzzzzz
        setTimeout(() => {
            if (!this._internal.player.mediaInfo) {
                return
            }
            // Update device name
            this.device = cast.framework.CastContext.getInstance().getCurrentSession().getCastDevice().friendlyName || this.device

            // Update media variables
            this.media.src                = this._internal.player.mediaInfo.contentId;
            // New in v6x
            this.media.title         = this._internal.player.title || null;
            this.media.description   = this._internal.player.mediaInfo.metadata.subtitle || null;
            this.media.poster        = this._internal.player.imageUrl || null;
            this.media.subtitles     = [];

            this.volumeLevel            = Number((this._internal.player.volumeLevel).toFixed(1));
            this.muted                  = this._internal.player.isMuted;
            this.paused                 = this._internal.player.isPaused;
            this.time                   = Math.round(this._internal.player.currentTime, 1);
            this.timePretty             = this._internal.controller.getFormattedTime(this.time).replace(/^00:/, '');
            this.duration               = this._internal.player.duration;
            this.durationPretty         = this._internal.controller.getFormattedTime(this._internal.player.duration).replace(/^00:/, '');
            this.progress               = this._internal.controller.getSeekPosition(this.time, this._internal.player.duration);
            // IDLE, PLAYING, PAUSED, BUFFERING https://developers.google.com/cast/docs/reference/web_receiver/cast.framework.messages#.PlayerState
            this.state                  = this._internal.player.playerState.toLowerCase();

            // Loop over the subtitle tracks
            for (var i in this._internal.player.mediaInfo.tracks) {
                // Check for subtitle
                if (this._internal.player.mediaInfo.tracks[i].type === 'TEXT') {
                    // New v6x
                    this.media.subtitles.push({
                        label: this._internal.player.mediaInfo.tracks[i].name,
                        src:   this._internal.player.mediaInfo.tracks[i].trackContentId
                    });
                }
            }
            // Get the active subtitle
            var active = cast.framework.CastContext.getInstance().getCurrentSession().getSessionObj().media[0].activeTrackIds;
            // New v6x
            if (active && active.length && this.media.subtitles[active[0]]) {
                this.media.subtitles[active[0]].active = true;
            }
        })

    }
    _playerStateChanged() {
        this.connected = this._internal.player.isConnected
        if (!this.connected) {
            return
        }
        this.device = cast.framework.CastContext.getInstance().getCurrentSession().getCastDevice().friendlyName || this.device
        this.state = this._internal.player.playerState.toLowerCase();
        console.log('STATECHANGED', this.state)
        switch(this.state) {
            case 'idle':
                this.state = 'ended';
                this.trigger('statechange');
                this.trigger('ended');
                return this
            case 'buffering':
                this.time           = Math.round(this._internal.player.currentTime, 1);
                this.duration       = this._internal.player.duration;
                this.progress       = this._internal.controller.getSeekPosition(this.time, this.duration);
                this.timePretty     = this._internal.controller.getFormattedTime(this.time).replace(/^00:/, '');
                this.durationPretty = this._internal.controller.getFormattedTime(this.duration).replace(/^00:/, '');
                this.trigger('statechange');
                this.trigger('buffering');
                return this
            case 'playing':
                // we have to skip a tick to give mediaInfo some time to update
                setTimeout(() => {
                    this.state = 'playing'
                    this.trigger('statechange');
                    this.trigger('play');
                })
                return this
            case 'paused':
                this.state = 'paused'
                this.trigger('statechange');
                // this.trigger('pause'); // pause event will also fire
                return this
        }
    }
    // Player controller events
    _isConnectedChanged() {
        this.connected = this._internal.player.isConnected;
        if (this.connected) {
            this.device = cast.framework.CastContext.getInstance().getCurrentSession().getCastDevice().friendlyName || this.device
        }
        this.state = !this.connected ? 'disconnected' : 'connected'
        this.trigger('statechange')
        this.trigger(!this.connected ? 'disconnect' : 'connect')
    }
    _currentTimeChanged() {
        var past            = this.time
        this.time           = Math.round(this._internal.player.currentTime, 1);
        this.duration       = this._internal.player.duration;
        this.progress       = this._internal.controller.getSeekPosition(this.time, this.duration);
        this.timePretty     = this._internal.controller.getFormattedTime(this.time).replace(/^00:/, '');
        this.durationPretty = this._internal.controller.getFormattedTime(this.duration).replace(/^00:/, '');
        // Only trigger timeupdate if there is a difference
        if (past != this.time || this._internal.player.isPaused) {
            this.trigger('timeupdate');
        }
    }
    _durationChanged() {
        this.duration = this._internal.player.duration;
    }
    _volumeLevelChanged() {
        this.volumeLevel = Number((this._internal.player.volumeLevel).toFixed(1));
        if (this._internal.player.isMediaLoaded) {
            this.trigger('volumechange');
        }
    }
    _isMutedChanged() {
        var old = this.muted
        this.muted = this._internal.player.isMuted;
        if (old != this.muted) {
            this.trigger(this.muted ? 'mute' : 'unmute');
        }
    }
    _isPausedChanged() {
        this.paused = this._internal.player.isPaused;
        if (this.paused) {
            this.trigger('pause');
        }
    }
    // Class functions
    on(event, cb) {
        event = event.toLowerCase().trim()

        // Deprecated checks v6+
        if (event === 'end') {
            event = 'ended'
            console.warn('Castjs: The "end" event has been deprecated and replaced with "ended".\nSee documentation: https://github.com/castjs/castjs.')
        } else if (event === 'playing') {
            event = 'play'
            console.warn('Castjs: The "playing" event has been deprecated and replaced with "play".\nSee documentation: https://github.com/castjs/castjs.')
        }

        // If event is not registered, create array to store callbacks
        if (!this._internal.events[event]) {
            this._internal.events[event] = [];
        }
        // Push callback into event array
        this._internal.events[event].push(cb);

        // Immediately call the callback if the event is 'available' and this.available is true
        // https://github.com/castjs/castjs/issues/38
        if (event === 'available' && this.available === true) {
            setTimeout(() => cb(), 0); // Use setTimeout to ensure it's asynchronously executed
        }

        return this
    }
    off(event) {
        if (!event) {
            // if no event name was given, reset all events
            this._internal.events = {};
        } else if (this._internal.events[event]) {
            // remove all callbacks from event
            this._internal.events[event] = [];
        }
        return this
    }
    trigger(event) {
        // Slice arguments into array
        var tail = Array.prototype.slice.call(arguments, 1);
        // If event exist, call callback with callback data
        for (var i in this._internal.events[event]) {
            setTimeout(() => {
                this._internal.events[event][i].apply(this, tail);
            }, 1)
        }
        // dont call global event if error
        if (event === 'error') {
            return this
        }
        // call global event handler if exist
        // this will be removed in v7+
        for (var i in this._internal.events['event']) {
            setTimeout(() => {
                this._internal.events['event'][i].apply(this, [event]);
            }, 1)
        }
        return this
    }
    cast(src, metadata = {}) {
        console.warn('Castjs: The "cast" method has been deprecated, please use "session" instead.\nSee documentation: https://github.com/castjs/castjs.')
        return this.session(src, metadata)
    }
    session(src, metadata = {}) {
        // We need a source! Don't forget to enable CORS
        if (!src) {
            return this.trigger('error', 'No media source specified.');
        }
        metadata.src = src;
        // Update media variables with user input
        for (var key in metadata) {
            if (metadata.hasOwnProperty(key)) {
                this[key] = metadata[key];
            }
        }
        // Use current session if available
        if (cast.framework.CastContext.getInstance().getCurrentSession()) {
            // Create media cast object
            var mediaInfo = new chrome.cast.media.MediaInfo(this.media.src);
            mediaInfo.metadata = new chrome.cast.media.GenericMediaMetadata();

            // This part is the reason why people love this library <3
            if (this.media.subtitles.length) {
                // I'm using the Netflix subtitle styling
                // chrome.cast.media.TextTrackFontGenericFamily.CASUAL
                // chrome.cast.media.TextTrackEdgeType.DROP_SHADOW
                mediaInfo.textTrackStyle = new chrome.cast.media.TextTrackStyle();
                mediaInfo.textTrackStyle.backgroundColor = '#00000000';
                mediaInfo.textTrackStyle.edgeColor       = '#00000016';
                mediaInfo.textTrackStyle.edgeType        = 'DROP_SHADOW';
                mediaInfo.textTrackStyle.fontFamily      = 'CASUAL';
                mediaInfo.textTrackStyle.fontScale       = 1.0;
                mediaInfo.textTrackStyle.foregroundColor = '#FFFFFF';

                // Overwrite default subtitle track style with user defined values
                // See https://developers.google.com/cast/docs/reference/chrome/chrome.cast.media.TextTrackStyle for a list of all configurable properties
                mediaInfo.textTrackStyle = {
                    ...mediaInfo.textTrackStyle, 
                    ...this.subtitleStyle
                };

                var tracks = [];
                for (var i in this.subtitles) {
                    // chrome.cast.media.TrackType.TEXT
                    // chrome.cast.media.TextTrackType.CAPTIONS
                    var track =  new chrome.cast.media.Track(i, 'TEXT');
                    track.name =             this.media.subtitles[i].label;
                    track.subtype =          'CAPTIONS';
                    track.trackContentId =   this.media.subtitles[i].src;
                    track.trackContentType = 'text/vtt';
                    // This bug made me question life for a while
                    track.trackId = parseInt(i);
                    tracks.push(track);
                }
                mediaInfo.tracks = tracks;
            }
            // Let's prepare the metadata
            mediaInfo.metadata.images =   [new chrome.cast.Image(this.media.poster)];
            mediaInfo.metadata.title =    this.media.title;
            mediaInfo.metadata.subtitle = this.media.description;
            // Prepare the actual request
            var request = new chrome.cast.media.LoadRequest(mediaInfo);
            // Didn't really test this currenttime thingy, dont forget
            request.currentTime = this.time;
            request.autoplay = !this.paused;
            // If multiple subtitles, use the active: true one
            if (this.media.subtitles.length) {
                for (var i in this.media.subtitles) {
                    if (this.media.subtitles[i].active) {
                        request.activeTrackIds = [parseInt(i)];
                        break;
                    }
                }
            }
            // Here we go!
            cast.framework.CastContext.getInstance().getCurrentSession().loadMedia(request).then(() => {
                // Update device name
                this.device = cast.framework.CastContext.getInstance().getCurrentSession().getCastDevice().friendlyName || this.device
                // Sometimes it stays paused if previous media ended, force play
                if (this.paused) {
                    this._internal.controller.playOrPause();
                }
                return this;
            }, (err) => {
                return this.trigger('error', err);
            });
        } else {
            // Time to request a session!
            cast.framework.CastContext.getInstance().requestSession().then(() => {
                if (!cast.framework.CastContext.getInstance().getCurrentSession()) {
                    return this.trigger('error', 'Could not connect with the cast device');
                }
                // Create media cast object
                var mediaInfo = new chrome.cast.media.MediaInfo(this.media.src);
                mediaInfo.metadata = new chrome.cast.media.GenericMediaMetadata();

                // This part is the reason why people love this library <3
                if (this.media.subtitles.length) {
                    // I'm using the Netflix subtitle styling
                    // chrome.cast.media.TextTrackFontGenericFamily.CASUAL
                    // chrome.cast.media.TextTrackEdgeType.DROP_SHADOW
                    mediaInfo.textTrackStyle = new chrome.cast.media.TextTrackStyle();
                    mediaInfo.textTrackStyle.backgroundColor = '#00000000';
                    mediaInfo.textTrackStyle.edgeColor       = '#00000016';
                    mediaInfo.textTrackStyle.edgeType        = 'DROP_SHADOW';
                    mediaInfo.textTrackStyle.fontFamily      = 'CASUAL';
                    mediaInfo.textTrackStyle.fontScale       = 1.0;
                    mediaInfo.textTrackStyle.foregroundColor = '#FFFFFF';

                    // Overwrite default subtitle track style with user defined values
                    // See https://developers.google.com/cast/docs/reference/chrome/chrome.cast.media.TextTrackStyle for a list of all configurable properties
                    mediaInfo.textTrackStyle = {
                        ...mediaInfo.textTrackStyle, 
                        ...this.subtitleStyle
                    };

                    var tracks = [];
                    for (var i in this.media.subtitles) {
                        // chrome.cast.media.TrackType.TEXT
                        // chrome.cast.media.TextTrackType.CAPTIONS
                        var track =  new chrome.cast.media.Track(i, 'TEXT');
                        track.name =             this.media.subtitles[i].label;
                        track.subtype =          'CAPTIONS';
                        track.trackContentId =   this.media.subtitles[i].src;
                        track.trackContentType = 'text/vtt';
                        // This bug made me question life for a while
                        track.trackId = parseInt(i);
                        tracks.push(track);
                    }
                    mediaInfo.tracks = tracks;
                }
                // Let's prepare the metadata
                mediaInfo.metadata.images =   [new chrome.cast.Image(this.media.poster)];
                mediaInfo.metadata.title =    this.media.title;
                mediaInfo.metadata.subtitle = this.media.description;
                // Prepare the actual request
                var request = new chrome.cast.media.LoadRequest(mediaInfo);
                // Didn't really test this currenttime thingy, dont forget
                request.currentTime = this.time;
                request.autoplay = !this.paused;
                // If multiple subtitles, use the active: true one
                if (this.media.subtitles.length) {
                    for (var i in this.media.subtitles) {
                        if (this.media.subtitles[i].active) {
                            request.activeTrackIds = [parseInt(i)];
                            break;
                        }
                    }
                }
                // Here we go!
                // this.state = 'connecting'
                // this.trigger('statechange')
                cast.framework.CastContext.getInstance().getCurrentSession().loadMedia(request).then(() => {
                    // Update device name
                    this.device = cast.framework.CastContext.getInstance().getCurrentSession().getCastDevice().friendlyName || this.device
                    // Sometimes it stays paused if previous media ended, force play
                    if (this.paused) {
                        this._internal.controller.playOrPause();
                    }
                    return this;
                }, (err) => {
                    // this.state = 'disconnected'
                    // this.trigger('statechange')
                    return this.trigger('error', err);
                });
            }, (err) => {
                if (err !== 'cancel') {
                    this.trigger('error', err);
                }
                return this;
            });
        }
    }
    seek(seconds, isPercentage) {
        // if seek(15, true) we assume 15 is percentage instead of seconds
        if (isPercentage) {
            seconds = this._internal.controller.getSeekTime(seconds, this._internal.player.duration);
        }
        this._internal.player.currentTime = seconds;
        this._internal.controller.seek();
        return this;
    }
    volume(float) {
        this._internal.player.volumeLevel = float;
        this._internal.controller.setVolumeLevel();
        return this;
    }
    play() {
        if (this.paused) {
            this._internal.controller.playOrPause();
        }
        return this;
    }
    pause() {
        if (!this.paused) {
            this._internal.controller.playOrPause();
        }
        return this;
    }
    mute() {
        if (!this.muted) {
            this._internal.controller.muteOrUnmute();
        }
        return this;
    }
    unmute() {
        if (this.muted) {
            this._internal.controller.muteOrUnmute();
        }
        return this;
    }
    // subtitle allows you to change active subtitles while casting
    subtitle(index) {
        // this is my favorite part of castjs
        // prepare request to edit the tracks on current session
        var request = new chrome.cast.media.EditTracksInfoRequest([parseInt(index)]);
        cast.framework.CastContext.getInstance().getCurrentSession().getSessionObj().media[0].editTracksInfo(request, () => {
            // after updating the device we should update locally
            // loop trough subtitles
            for (var i in this.media.subtitles) {
                // remove active key from all subtitles
                delete this.media.subtitles[i].active;
                // if subtitle matches given index, we set to true
                if (i == index) {
                    this.media.subtitles[i].active = true;
                }
            }
            return this.trigger('subtitlechange')
        }, (err) => {
            // catch any error
            return this.trigger('error', err);
        });
    }
    // disconnect will end the current session
    disconnect() {
        cast.framework.CastContext.getInstance().endCurrentSession(true);
        this._internal.controller.stop();

        // application variables
        this.connected  = false;
        this.device     = 'Chromecast';

        // media variables
        this.media.src         = ''
        this.media.title       = ''
        this.media.description = ''
        this.media.poster      = ''
        this.media.subtitles   = []

        // player variable
        this.volumeLevel    = 1;
        this.muted          = false;
        this.paused         = false;
        this.time           = 0;
        this.timePretty     = '00:00:00';
        this.duration       = 0;
        this.durationPretty = '00:00:00';
        this.progress       = 0;
        this.state          = 'disconnected';

        this.trigger('statechange');
        this.trigger('disconnect');
        return this;
    }
}

if (typeof module !== 'undefined'){
    module.exports = Castjs;
}
