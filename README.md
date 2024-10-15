<p align="center">
  <img src="https://i.imgur.com/ZjTpQ3S.png" alt="Castjs" width="100%">
</p>

<h4 align="center">Javascript library (<10kb) for the complex chromecast SDK</h4>

<p align="center">
  <b>Castjs</b> provides simple events and functions to communicate with chromecast devices from the browser.
  <br>
  This library works in chrome, opera, brave, firefox and vivaldi, see it in action and check out the <a href="https://castjs.io/">online demo</a>.
  <br><br>
  <a href="https://castjs.io/"><img src="https://i.imgur.com/1nBtUac.png" width="100%"></a>
  <br><br>
  Do you want to support my work, feel free to donate a <a href="https://www.buymeacoffee.com/fenny" target="_blank">☕ Hot Beverage</a>
</p>


# Getting Started

Include the `cast.min.js` from [cdnjs](https://cdnjs.com/libraries/castjs):
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/castjs/5.3.0/cast.min.js"></script>
```

# Casting Media

Casting a media source to your chromecast device. Make sure you enable [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) `Header set Access-Control-Allow-Origin "*"` on your media resources.

```html
<button id="cast">Cast</button>

<script src="https://cdnjs.cloudflare.com/ajax/libs/castjs/5.3.0/cast.min.js"></script>
<script>
// Create new Castjs instance
const cast = new Castjs();

// Wait for user interaction
document.getElementById('cast').addEventListener('click', function() {
    // Check if casting is available
    if (cast.available) {
        // Initiate new cast session with a simple video
        cast.session('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4');

        // A more complex example
        cast.session('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', {
            poster     : 'https://castjs.io/media/poster.jpg',
            title      : 'Sintel',
            description: 'Third Open Movie by Blender Foundation',
            subtitles: [{
                active: true,
                label : 'English',
                src   : 'https://castjs.io/media/english.vtt'
            }, {
                label : 'Spanish',
                src   : 'https://castjs.io/media/spanish.vtt'
            }],
        })
    }
});
</script>
```

# Supported Browsers
Almost any [Chromium]() based browser supports cast framework out of the box.
<a href="https://vivaldi.com/"><img src="https://vivaldi.com/favicon.ico" height="13"> Vivaldi</a>
<a href="https://brave.com/"><img src="https://brave.com/static-assets/images/brave-favicon.png" height="15"> Brave</a>

# API Documentation:

```javascript
// Default instance
const cast = new Castjs();

// Custom receiver or joinpolicy
const cast = new Castjs({
    receiver  : 'CC1AD845',              // default
    joinpolicy: 'tab_and_origin_scoped', // default
//  joinpolicy: 'custom_controller_scoped',
//  joinpolicy: 'origin_scoped',
//  joinpolicy: 'page_scoped',
});

// Castjs Events
cast.on('available',    ()      => {});  // Casting is available
cast.on('connect',      ()      => {});  // Connected with device
cast.on('disconnect',   ()      => {});  // Disconnected with device
cast.on('statechange',  ()      => {});  // Device state changed
cast.on('timeupdate',   ()      => {});  // Current time changed
cast.on('volumechange', ()      => {});  // Volume changed
cast.on('mute',         ()      => {});  // Muted state changed
cast.on('unmute',       ()      => {});  // Muted state changed
cast.on('play',         ()      => {});  // Media is playing
cast.on('pause',        ()      => {});  // Media is paused
cast.on('buffering',    ()      => {});  // Media is buffering / seeking / waiting
cast.on('ended',        ()      => {});  // Media ended aka idle
cast.on('event',        (event) => {});  // Catches all the events above except error
cast.on('error',        (err)   => {});  // Catch any errors

// Castjs functions
cast.session(source, [metadata]); // Create session with media
cast.volume(0.7);              // Change volume
cast.play();                   // Play media
cast.pause();                  // Pause media
cast.mute();                   // Mutes media
cast.unmute();                 // Unmutes media
cast.subtitle(2);              // Change active subtitle index
cast.seek(15);                 // Seek 15 seconds
cast.seek(15.9, true);         // Seek 15.9% percentage
cast.disconnect();             // Disconnect session

// Castjs properties
cast.receiver              // Receiver ID
cast.available             // Casting is available
cast.connected             // Connected with cast device
cast.device                // Cast device name

cast.media.src             // Media source
cast.media.title           // Media title
cast.media.description     // Media description
cast.media.poster          // Media poster image
cast.media.subtitles       // Media subtitles

cast.volumeLevel           // Volume level
cast.muted                 // If muted
cast.paused                // If paused
cast.time                  // Time in seconds
cast.timePretty            // Time formatted in time hh:mm:ss
cast.duration              // Duration in seconds
cast.durationPretty        // Duration formatted in hh:mm:ss
cast.progress              // Progress in percentage 0 - 100
cast.state                 // State of cast device
```

# FAQ

**Question:** Can I cast local resources?<br>
**Answer:** It was possible in the past from the browser by using service workers. But we had to remove it from our library because Google dropped support, see https://github.com/fenny/chromecast-service-worker-crash

**Question:** Do I need to enable CORS for all hosts?<br>
**Answer:** Yes and no. Chromecast is using an User-Agent that contains the word `CrKey` -> `Mozilla/5.0 (X11; Linux armv7l) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.225 Safari/537.36 CrKey/1.56.500000 DeviceType/Chromecast` so you could allow agents containing `CrKey` or `Chromecast` but this is not officialy documented.

# TODO

```
- Add local media and stream support after google fixes service worker crash
- Add name space messaging support for custom receivers
- Maybe add video element support: new Castjs($('#video'))

// Suggestions? Let me know!
```

<p align="center">
  Do you want to support my work, feel free to donate a <a href="https://www.buymeacoffee.com/fenny" target="_blank">☕ Hot Beverage</a>
</p>

# CastJS v2

A minimal, simple-to-use Chromecast sender API library.

## Event Handlers

The `cast.on()` method allows you to register event handlers for different casting events. The `cast.trigger()` method can be used to manually trigger events, and `cast.off()` is for removing event listeners.

### Methods:
- **`cast.on(event, callback)`**: Register an event handler.
- **`cast.off(event, callback)`**: Remove a specific event handler. If `callback` is not provided, all handlers for that event are removed.
- **`cast.trigger(event, [args])`**: Manually trigger an event, passing optional arguments.

### Events:
- **`available`**: Triggered when casting becomes available.
- **`connect`**: Triggered when a connection is established with the Chromecast device.
- **`disconnect`**: Triggered when the connection with the Chromecast device is lost.
- **`statechange`**: Triggered when the Chromecast device state changes (e.g., playing, paused, buffering).
- **`timeupdate`**: Triggered when the current playback time changes.
- **`volumechange`**: Triggered when the volume level changes.
- **`mute`**: Triggered when the player is muted.
- **`unmute`**: Triggered when the player is unmuted.
- **`play`**: Triggered when media playback starts.
- **`pause`**: Triggered when media playback is paused.
- **`buffering`**: Triggered when media is buffering or seeking.
- **`ended`**: Triggered when media playback ends or becomes idle.
- **`event`**: Catches all events except `error`.
- **`error`**: Triggered when an error occurs.

---

## Core Functions

### Session Management
- **`cast.session(source, [metadata])`**: Creates or connects a casting session with the specified media source and optional metadata (e.g., title, description, poster).

### Volume Control
- **`cast.volume([level])`**: 
  - **`cast.volume()`**: Get the current volume level (0.0 to 1.0).
  - **`cast.volume(level)`**: Set the volume level (between 0.0 and 1.0).

### Playback Control
- **`cast.play()`**: Start media playback.
- **`cast.pause()`**: Pause media playback.
- **`cast.muted([state])`**: 
  - **`cast.muted()`**: Get the current mute state (`true` if muted, `false` otherwise).
  - **`cast.muted(state)`**: Set the mute state (`true` to mute, `false` to unmute).
- **`cast.seek(seconds)`**: Seek to the specified time in seconds.
- **`cast.time()`**: Get the current playback time in seconds.
- **`cast.subtitle(index)`**: Change the active subtitle track by index.

### Session End
- **`cast.disconnect()`**: Disconnects the current Chromecast session.

---

## State Methods

### Device State
- **`cast.receiver()`**: Get the Chromecast receiver ID.
- **`cast.available()`**: Check if Chromecast casting is available (`true`/`false`).
- **`cast.connected()`**: Check if a Chromecast device is connected (`true`/`false`).
- **`cast.device()`**: Get the name of the connected Chromecast device.
- **`cast.state()`**: Get the current state of the cast device (e.g., `playing`, `paused`, `buffering`, `disconnected`).

### Media Information
- **`cast.src()`**: Get the current media source URL.
- **`cast.title()`**: Get the current media title.
- **`cast.description()`**: Get the current media description.
- **`cast.poster()`**: Get the poster image URL of the current media.
- **`cast.subtitles()`**: Get an array of subtitle tracks for the current media.

### Playback Information
- **`cast.volume()`**: Get the current volume level.
- **`cast.muted()`**: Check if the player is muted (`true`/`false`).
- **`cast.paused()`**: Check if the player is paused (`true`/`false`).
- **`cast.time()`**: Get the current playback time in seconds.
- **`cast.timePretty()`**: Get the current playback time formatted as `hh:mm:ss`.
- **`cast.duration()`**: Get the total duration of the media in seconds.
- **`cast.durationPretty()`**: Get the total duration formatted as `hh:mm:ss`.
- **`cast.progress()`**: Get the current playback progress as a percentage (0 to 100).

---

### Example Usage

```javascript
const cast = new CastjsV2();

// Listen to events
cast.on('available', () => console.log('Casting is available'));
cast.on('play', () => console.log('Media is playing'));
cast.on('volumechange', () => console.log('Volume changed'));

// Start a casting session with media
cast.session('https://example.com/media.mp4', {
    title: 'Sample Video',
    description: 'A sample video for testing',
    poster: 'https://example.com/poster.jpg'
});

// Set volume
cast.volume(0.5);

// Play and pause media
cast.play();
cast.pause();

// Seek to a specific time
cast.seek(120);  // Seek to 2 minutes

// Disconnect the session
cast.disconnect();