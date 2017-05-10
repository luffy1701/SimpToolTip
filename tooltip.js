(function( $, window ){
  var helpers = {
    generatedID : function() {
      S4 = function() {
        return ((( 1 + window.Math.random()) * 0x10000) | 0).toString(16).substring(1);
      }

      return ( S4() + S4() + "-" + S4()+ "-4" + S4().substr(0, 3), "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
    }
  };

  var methods = {
    init : function( options ) {
      var defaults = {
        'dataToolTip': 'tooltip',
        'dataPosition': 'tooltipPosition',
        'toolTipClass': 'toolTip',
        'position': 'above',  // Supports 'above' and 'below'
        'positionMargin': 10,
        'followMouse': true,
        'animationSpeed': 'fast',
        'animationEasing': 'swing',
        'animationOnComplete': $.noop
      };

      options = $.extend( defaults, options );

      return this.each( function() {
        var $this = $(this),
        data = $this.data( 'toolTip' );

        if ( !data ) {
          $this.data( 'toolTip', {
            target: $this
          });

          // Create the tooltip
          methods.create.call( this, options );

          if ( options.followMouse ) {
            $(this).on('mousemove.toolTip', function(e) {
              methods.chaseCursor.call( this, e, options )
            });
          }

          // Bind the show on mouse in/hover
          $(this).on( 'mouseenter.toolTip', function() {
            methods.show.call( this,  options );
          } );

          // Bind the hide on mouse out
          $(this).on( 'mouseleave.toolTip', function() {
            methods.hide.call( this, options );
          } )

        }
      })
    },

    destroy : function() {
    },

    create : function( options ) {
      var $this = $(this),
        data = $this.data( 'toolTip' ),
        chosenPosition = options.position,
        toolTipContent = '';

      // Get the tooltip content. if it doesn't exist, default to the title attribute
      if ( ! $this.data( options.dataToolTip ) ) {
        toolTipContent = $this.attr( 'title' )
      } else {
        toolTipContent = $this.data( options.dataToolTip );
      }

      // We now need to empty the title attribute to avoid the default browser behavior and showing it together with the tool-tip
      $this.attr( 'title', '' );

      var generatedID = helpers.generatedID.call( this ),
        toolTipID = 'toolTip-' + generatedID,
        toolTipHTML = '<div id="' + toolTipID + '" class="'+ options.toolTipClass +'">' + toolTipContent + '</div>';

      // Add the tooltip inside the element
      $(toolTipHTML).appendTo( 'body' );

      data.toolTipID = toolTipID;

      // Check if there is a position set in the element
      if ( $this.data( options.dataPosition ) ) {
        chosenPosition = $this.data( options.dataPosition );
      }

      if ( !options.followMouse ) {
        // Get the real element's width and height, by creating a dummy clone inline element have same content and using it as reference
        var dummyElement = $this.clone().css({
          'display': 'inline',
          'visibility': 'hidden'
        }).appendTo( 'body' )

        // put the tooltip in the bottom left of the calling/parent element
        $('#' + toolTipID).css({
          'top': $this.offset().top + dummyElement.outerHeight(),
          'left': $this.offset().left
        })

        // ToolTip CSS
        var marginLeft = ( dummyElement.outerWidth() - $('#' + toolTipID).outerWidth()) / 2;
        var marginTop = (( dummyElement.outerHeight() + $('#' + toolTipID).outerHeight() + options.positionMargin) * -1);

        // Position the tooltip above or below the element
        switch( chosenPosition ) {
          case 'below':
            marginTop = options.positionMargin;
            break;
          case 'above':
          default:
            break;
        }

        $('#' + toolTipID).css({
          'margin-top': marginTop,
          'margin-left': marginLeft
        });

        // Check if the tooltip is cropped on the top of the window view
        if ( $this.offset().top + marginTop < 0 ) {
          $('#' + toolTipID).css({ 'marginTop': 0 })
        }

        // Check if the tooltip is cropped on the bottom of the window view
        if ( $this.offset().top + marginTop + $('#' + toolTipID).outerHeight() > $(document).height() ) {
          var heightDifference = $('#' + toolTipID).offset().top + $('#' + toolTipID).outerHeight() - $(document).height();
          $('#' + toolTipID).css({
            'marginTop': ($('#' + toolTipID).css('margin-top') - heightDifference )
          })
        }

        // Check if the tooltip is cropped on the left of the window view
        if ( $this.offset().left + marginLeft < 0 ) {
          $('#' + toolTipID).css({ 'margin-left': 0 })
        }

        // Check if the tooltip is cropped on the right if the window view
        if ( $('#' + toolTipID).offset().left + marginLeft + $('#' + toolTipID).outerWidth() > $(document).width()) {
          var widthDifference = $this.offset().left + marginLeft + $('#' + toolTipID).outerWidth() - $(document).width();
          $('#' + toolTipID).css({
            'marginLeft': ($('#' + toolTipID).css('margin-left') - widthDifference )
          })
        }

        // Remove the dummy element
        dummyElement.remove();
      }
    },

    chaseCursor: function(event, options) {
      var $this = $(this),
        chosenPosition = options.position,
        data = $this.data( 'toolTip' ),
        topPosition = 0,
        leftPosition = 0;
      var toolTipElement = $('#' + data.toolTipID);

      // Check if there is a position set in the element
      if ( $this.data( options.dataPosition ) ) {
        chosenPosition = $this.data( options.dataPosition );
      }

      leftPosition = event.pageX + options.positionMargin;

      // Position the tooltip above or below the element
      switch( chosenPosition ) {
        case 'below':
          topPosition = event.pageY + options.positionMargin;
          break;
        case 'above':
        default:
          topPosition = event.pageY - options.positionMargin - toolTipElement.outerHeight();
          break;
      }

      toolTipElement.css({
        'top': topPosition,
        'left': leftPosition
      });
    },

    show: function( options ) {
      var $this = $(this),
        data = $this.data( 'toolTip' );

      // Animate tooltip showing
      $('#' + data.toolTipID).stop().fadeIn( options.animationSpeed, options.animationEasing, options.animationOnComplete );
    },

    hide: function( options ) {
      var $this = $(this),
        data = $this.data( 'toolTip' );

      $('#' + data.toolTipID).stop().hide();
    },

    hideAllToolTips: function( options ) {
      $('.' + options.toolTipClass).stop().hide();
    }
  }

  $.fn.toolTip = function( method ) {
    if ( methods[method] ) {
      return methods[method].apply( this, Array.prototype.slice.call(arguments, 1) );
    } else if ( typeof method === 'object' || ! method ) {
      return methods.init.apply( this, arguments );
    } else {
      $.error( 'Method ' + method + 'does not exist on jQuery.toolTip' );
    }
  }
})( jQuery, window );

// document ready
$(function() {
  $('h1').toolTip({ 'followMouse': false });
  $('p').toolTip();
})
