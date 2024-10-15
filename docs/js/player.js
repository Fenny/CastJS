function debug(key, value) {
  const fixedWidth = 15; // Define the width for key formatting
  const d = new Date();
  const n = d.toLocaleTimeString([], { minute: '2-digit', second: '2-digit' });

  // Format key with fixed width
  const formattedKey = typeof key === 'string' ? key.padEnd(fixedWidth) : JSON.stringify(key).padEnd(fixedWidth);
  const formattedValue = typeof value === 'string' ? value : JSON.stringify(value);

  // Append to debug element
  $('#debug').append(`[${n}] ${formattedKey} > ${formattedValue}\n`);

  // Scroll to the bottom of textarea
  const textarea = document.getElementById('debug');
  textarea.scrollTop = textarea.scrollHeight;
}
debug('debugging', 'enabled')

var cast = new Castjs({
  joinpolicy: 'origin_scoped'
});

cast.on('event', (e) => {
  if (e === 'statechange') {
    debug(e, cast.state)
  } else if (e === 'volumechange') {
    debug(e, cast.volumeLevel)
  } else if (e === 'timeupdate') {
    debug(e, cast.timePretty + ' - ' + cast.durationPretty)
  } else if (e === 'play') {
    debug(e, cast.media.title)
  } else if (e === 'connect') {
    debug(e, cast.device)
  } else if (e === 'available') {
    debug(e, 'casting supported')
  } else if (e === 'buffering') {
    debug(e, cast.timePretty)
  } else if (e === 'mute') {
    debug(e, cast.volumeLevel)
  } else if (e === 'unmute') {
    debug(e, cast.volumeLevel)
  } else if (e === 'pause') {
    debug(e, cast.timePretty)
  } else if (e === 'disconnect') {
    debug(e, cast.device)
  } else if (e === 'ended') {
    debug(e, 'Media ended')
  } else if (e === 'subtitlechange') {
    for (var i in cast.media.subtitles) {
        if (cast.media.subtitles[i].active) {
            debug('subtitle', cast.media.subtitles[i].label)
            break;
        }
    }
  } else {
    debug('unknown event', e)
  }
})

cast.on('statechange', () => {
  $('#state').text(cast.device + ': ' + cast.state)
})

cast.on('available', () => {
  $('#cast').removeClass('disabled')
})

cast.on('connect', () => {
  $('body').removeClass('disabled')
  $('body').addClass('connected')
  if (cast.paused) {
    $('#play').removeClass('fa-pause').addClass('fa-play')
  } else {
    $('#play').removeClass('fa-play').addClass('fa-pause')
  }
})

cast.on('mute', () => {
  $('#mute').removeClass('fa-volume-up').addClass('fa-volume-mute')
})

cast.on('unmute', () => {
  $('#mute').removeClass('fa-volume-mute').addClass('fa-volume-up')
})

cast.on('statechange', () => {
  $('#state').text(cast.device + ': ' + cast.state)
})

cast.on('buffering', () => {
  $('body').addClass('disabled');
})


cast.on('play', () => {
  $('body').removeClass('disabled');
  $('#play').removeClass('fa-play').addClass('fa-pause')
})

cast.on('pause', () => {
  $('body').removeClass('disabled');
  $('#play').removeClass('fa-pause').addClass('fa-play')
})

cast.on('timeupdate', () => {
  $('#time').text(cast.timePretty);
  $('#duration').text(cast.durationPretty);
  slider.attr('value', cast.progress);
  slider.rangeslider('update', true);
})
cast.on('disconnect', () => {
  $('body').addClass('disabled');
  $('body').removeClass('connected');
  
})
cast.on('error', (err) => {
  debug('error', err)
})

var metadata = {
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
}

$('#cast').on('click', () => {
  if (cast.connected) {
    cast.disconnect()
  } else if (cast.available) {
    cast.session('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', metadata)
  }
})

$('.jq-dropdown-menu').on('click', 'a', function(e) {
  e.preventDefault();
  var index = $(this).attr('href')
  cast.subtitle(index)
  $('.jq-dropdown-menu a').removeClass('active')
  $(this).addClass('active')
})

$('#mute').on('click', () => {
    if ($('#mute').hasClass('fa-volume-up')) {
      cast.mute()
      $('#mute').removeClass('fa-volume-up').addClass('fa-volume-mute')
    } else {
      cast.unmute()
      $('#mute').removeClass('fa-volume-mute').addClass('fa-volume-up')
    }
})

$('#play').on('click', () => {
    if ($('#play').hasClass('fa-play')) {
      cast.play();
      $('#play').removeClass('fa-play').addClass('fa-pause')
    } else {
      cast.pause();
      $('#play').removeClass('fa-pause').addClass('fa-play')
    }
})

$('#stop').on('click', () => {
    cast.disconnect();
})

$('#back').on('click', () => {
  var goback = cast.time - 30;
  if (goback < 1) {
    goback = 0;
  }
  cast.seek(goback)
})
$('#forward').on('click', () => {
  var goforward = cast.time + 30;
  if (goforward >= cast.duration) {
    goforward = cast.duration;
  }
  cast.seek(goforward)
})

var slider = $('input[type="range"]').rangeslider({
  polyfill: false,
  onSlideEnd: function(pos, val) {
    if (cast.connected) {
      cast.seek(val, true);
    }
  }
});