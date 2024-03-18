/*jslint browser: true */
/*global document window setTimeout localStorage*/

( function ( document, localStorage ) {
    "use strict";

    var file_input = document.getElementById( 'file-input' );
    var form = document.querySelector( 'form' );

    file_input.addEventListener( 'change', function ( e ) {
        var file = file_input.files[ 0 ];
        var text_type = /.json$/;

        if ( file.type.match( text_type ) ) {
            var reader = new FileReader();

            reader.onload = function ( e ) {
                values = JSON.parse( reader.result );
                // console.log( values );
                for ( var i in values ) {
                    setFormValue( form, i, values[ i ] );
                }
            }

            reader.readAsText( file );
        } else {
            console.log( 'File not supported!' );
        }
    } );

    function setFormValue( form, name, value ) {
        var elements = form.querySelectorAll( '[name="' + name + '"]' );
        for ( var i = 0; i < elements.length; i++ ) {
            var element = elements[ i ];
            var type = element.type;
            switch ( type ) {
            case 'radio':
                element.checked = element.value === value;
                break;
            case 'checkbox':
                element.checked = value;
                break;
            default:
                element.value = value;
            }
        }
    }

    function form2array( frm ) {
        var result = {};
        Array.prototype.slice.call( frm.elements ).forEach( function ( element ) {
            var name = element.name;
            if ( element.type === 'radio' ) {
                if ( element.checked ) {
                    result[ name ] = element.value;
                }
            } else {
                result[ name ] = element.checked || element.type !== 'checkbox' ? element.value : '';
            }
        } );
        return result;
    }

    function saveTextFile( e ) {
        var d = new Date();
        var filename = 'lodger-contract_' + d.toISOString().substr( 0, 10 ) + '.json';
        var txt = JSON.stringify( form2array( form ) );
        var file = new File( [ txt ], filename, {
            type: "application/json"
        } );
        var url = URL.createObjectURL( file );
        var link = document.createElement( "a" );

        link.type = 'file';
        link.href = url;
        link.download = filename;
        // link.setAttribute( "download", "lodger-contract.json" );
        document.body.appendChild( link );
        link.click();
        document.body.removeChild( link );
    }

    function printDoc() {
        window.print();
    }

    document.getElementById( 'save' ).onclick = saveTextFile;
    document.getElementById( 'print' ).onclick = printDoc;

    //autosave to localStorage
    document.addEventListener( 'change', function ( e ) {
        localStorage.lodger = JSON.stringify( form2array( form ) );
    } );

    // auto-resize textarea
    document.addEventListener( 'keypress', function ( e ) {
        var object = e.target;
        if ( object.nodeName === 'TEXTAREA' ) {
            setTimeout( function () {
                object.style.height = 'auto'; // auto must be set first
                object.style.height = object.scrollHeight + 'px';
            }, 10 );
        }
    } );

    var values = {};
    var json_str = localStorage.lodger;
    if ( json_str ) {
        values = JSON.parse( json_str );
        // console.log( values );
        for ( var i in values ) {
            setFormValue( form, i, values[ i ] );
        }
    }

    window.onload = function () {};
} )( document, localStorage );