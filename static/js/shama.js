$( document ).ready( function () {
  var shama = {};

  shama.init = function () {
    shama.createWebSocket();
    shama.initRecordButton();
  };

  shama.getRecorder = function ( s ) {
    context = new AudioContext();
    source = context.createMediaStreamSource( s );
    recorder = new Recorder( source, {
      numChannels: 1,
    } );
    recorder.record();
    shama.setInterval();
  };

  shama.createWebSocket = function () {
    socket = io.connect( '//' + document.domain + ':' + location.port );
    socket.on( 'connect', function () {
      console.log( 'Connected!' );
    } );

    socket.on( 'transcript', function ( data ) {
      console.log('data: ', data);
      $( '.recognized-text' ).html( data );
    } );
  };

  shama.setInterval = function () {
    if ( 'undefined' !== typeof recorder ) {
      exportInterval = setInterval( function () {
        recorder.exportWAV( function ( blob ) {
          recorder.clear();
          if ( 'undefined' !== typeof socket ) {
            console.log("blob: ", blob);
            socket.emit( 'stream', blob );
          }
        } );
      }, 5000 );
    }
  };

  shama.clearInterval = function () {
    clearInterval( exportInterval );
  };

  shama.initRecorder = function () {
    if ( 'undefined' === typeof recorder ) {
      navigator.mediaDevices.getUserMedia( {
        audio: true,
        video: false
      } ).then( shama.getRecorder );
    }
  };

  shama.initRecordButton = function () {
    $( '.recorder' ).click( function ( e ) {
      e.preventDefault();

      if ( $( this ).hasClass( 'is-recording' ) ) { // Stop Recording
        $( this ).removeClass( 'active is-recording btn-danger' ).text( 'Start Recording' );
        if ( 'undefined' !== typeof recorder ) {
          recorder.stop();
        }
        shama.clearInterval();
      }
      else { // Start Recording
        $( this ).addClass( 'active is-recording btn-danger' ).text( 'Stop Recording' );
        if ( 'undefined' !== typeof recorder ) {
          recorder.record();
          shama.setInterval();
        }
        else {
          shama.initRecorder();
        }
      }
    } );
  };

  $( shama.init() );
} );
