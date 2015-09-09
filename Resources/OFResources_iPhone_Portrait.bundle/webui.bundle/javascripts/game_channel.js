// Open the dashboard (or prompt login) when the leaf bar button is tapped.
OF.barButtonTouch = function() {
  OF.trackEvent('game_channel', 'dashboard_button');
  if (OF.user && OF.user.id) {
    OF.sendAction('dashboard');
  } else {
    OF.sendAction('showEnableView', { message: "Join the OpenFeint Community!", button: "Sign me up!" });
  }
};

(function($){
  $.fn.swipeIt = function() {
    var el = this;
    var s = {
      currentSlideIndex : 0,
      currentSlideOffset : 0,
      direction : null,
      dx : null,
      eventTypeStart : null,
      eventTypeMove : null,
      eventTypeEnd : null,
      i : null,
      lastSlideIndex : null,
      moveX : null,
      positionX : null,
      slideWidth : null,
      touchStartX : null,
      transition : null,
      startSwipeTime : null,
      endSwipeEndTime : null,
      swipeDuration : null,
      swipeSpeed : null,
      indicator : false,
    };
   
    s.eventTypeStart = (OF.isDevice) ? 'touchstart' : 'mousedown';
    s.eventTypeMove = (OF.isDevice) ? 'touchmove' : 'mousemove';
    s.eventTypeEnd  = (OF.isDevice) ? 'touchend' : 'mouseup';
  
    //STARTING EVENT
    $(el).live(s.eventTypeStart, function(){
      var sd = new Date();
      s.startSwipeTime = sd.getTime();
      swipeEvent(this);
    });
  
    // var buildIndicator = function() {
      if (s.indicator == true) {
        $(el).children().each(function(index) {        
          var elClass = (s.currentSlideIndex == index) ? elClass = 'current' : elClass = '';        
          $('.slide_indicator').append('<li class=' + elClass + '></li>');
        });
      }
    // };
    // 
    // buildIndicator();
  
    var indicateCurrentIndicator = function() {
      if (s.indicator == true) {
        $(".slide_indicator").children().removeClass('current');
        $(".slide_indicator li:eq(" + s.currentSlideIndex + ")").addClass('current');
      }
    };
    
    var swipeEvent = function(el) {
      s.currentSlideOffset = s.currentSlideIndex * -(s.slideWidth);
      s.slideWidth = $(el).children().outerWidth(true);
      s.lastSlideIndex = $(el).children().size() - 1;
      s.touchStartX = (OF.isDevice) ? event.touches[0].pageX : event.pageX; 
    
      var cancelTouch = function() {
        if (OF.isDevice) {
          $(el).unbind('touchmove');
          $(el).unbind('touchend');
        } else {
          $(el).unbind('mousemove');
          $(el).unbind('mouseup');
        }
      };
    
      //MOVING EVENT
      $(el).bind(s.eventTypeMove, function() { //mousemove or touchmove
        event.preventDefault();
        s.moveX = (OF.isDevice) ? event.touches[0].pageX : event.pageX; 
        s.dx = s.moveX - s.touchStartX;
        s.transition = '-webkit-transform 0s linear';
        s.positionX = (s.currentSlideOffset + s.dx);
        $(el).css({'-webkit-transition': s.transition ,'-webkit-transform' : 'translate3d(' + s.positionX + 'px, 0 ,0)'});
      });
      
      //ENDING EVENT
      $(el).bind(s.eventTypeEnd, function() {
        var ed = new Date();
        s.endSwipeTime = ed.getTime();
        s.swipeDuration = s.endSwipeTime - s.startSwipeTime;
        s.swipeSpeed = (s.swipeDuration * 0.002).toFixed(2); 
        s.swipeSpeed = (s.swipeSpeed > 0.25) ? 0.25 : (s.swipeDuration * 0.002).toFixed(2); 
      
        if (s.direction == null) {
          s.direction = s.dx;
          event.preventDefault();
        }
        if (Math.abs(s.dx) > 2) {
          s.direction = s.dx > 0 ? 'right' : 'left';
        }
        if (s.direction == 'left') {
          if (s.currentSlideIndex == s.lastSlideIndex) {
            s.transition = '-webkit-transform 0s linear';
            s.positionX = s.lastSlideIndex * s.slideWidth;
            s.dx = null;
          } else {
            s.i = 1; 
          }
        }
        if (s.direction == 'right') {
          if (s.currentSlideIndex == 0) {
            s.transition = '-webkit-transform 0s linear';
            s.positionX = 0;
            s.dx = null;
          } else {
            s.i = -1;
          }
        }
        if (Math.abs(s.dx) > Math.abs(s.slideWidth * .5)) {
          s.transition = '-webkit-transform ' + s.swipeSpeed + 's ' + 'ease-in-out';
          s.positionX = (s.currentSlideIndex + s.i) * s.slideWidth;
          s.currentSlideIndex = s.currentSlideIndex + s.i;
        } else {
          s.transition = '-webkit-transform ' + s.swipeSpeed + 's ' + 'ease-in-out';
          s.positionX = s.currentSlideIndex * s.slideWidth;
        }
        $(el).css({'-webkit-transition': s.transition ,'-webkit-transform' : 'translate3d(' + -(s.positionX) + 'px, 0 ,0)'});
        indicateCurrentIndicator();
        cancelTouch();
      });
    }
  };
})(jQuery);

(function($){
  $.fn.countDownOld = function(options) {
    var endHour = (options && options.endHour) || 24; //24:00 UTC is 5:00pm PST
    var el = this;
    
    var intervalID = setInterval(function() {
      
      var now = new Date(); // Get Current Time

      var end = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()); // get target hour today
      end.setUTCHours(endHour,00,0); //Make sure we are seting 24:00 UTC (5:00pm PST)
      
      if (now > end) end.setDate(end.getDate() + 1);  // ensure target end time is in the future
      
      var nowInMilliseconds = now.getTime(); // Convert Now to millseconds
      var endInMilliseconds = end.getTime(); // Convert end target time to millseconds
      var millsecondsTillEnd = (endInMilliseconds - nowInMilliseconds); // end minus now equals remaining time. Easy math in milli 
      var hoursTillEnd = Math.floor(millsecondsTillEnd / 3600000); // Multiplying buy millseconds in an hour and rounding the number down gives us the hours remaining 
      
       
      var minTillEnd = Math.floor(59 - now.getMinutes());
      var secondsTillEnd = (59 - now.getSeconds());
      secondsTillEnd = (secondsTillEnd < 10 ? '0' : '') + secondsTillEnd;
      
      $(el).html(hoursTillEnd + 'h ' +  minTillEnd + 'm ' +  secondsTillEnd + 's');

    }, 1000);

  }
})(jQuery);


(function($){
  $.fn.countDown = function(timeTill) {
    var el = this;
    var totalSecsTillEnd = timeTill;
    var intervalID = setInterval(function() {
      
      var now = new Date(); // Get Current Time
      
      var hoursTillEnd = Math.floor(totalSecsTillEnd / 3600); //Hours Remaining
      
      var hoursTillEndInSecs = (hoursTillEnd * 3600);
      
      var secsTillEndLeft = (totalSecsTillEnd - hoursTillEndInSecs);
      
      var minTillEnd = Math.floor(secsTillEndLeft / 60);
      
      var minTillEndLeftInSecs = (minTillEnd * 60);
      
      var secsTillEnd = Math.floor(secsTillEndLeft - minTillEndLeftInSecs);
      
      hoursTillEnd = (hoursTillEnd < 10 ? '0' : '') + hoursTillEnd;
      minTillEnd = (minTillEnd < 10 ? '0' : '') + minTillEnd;
      secsTillEnd = (secsTillEnd < 10 ? '0' : '') + secsTillEnd;
      if (totalSecsTillEnd <= -1) {
        $(el).html("Expired");
        clearInterval(intervalID);
      } else {
        $(el).html(hoursTillEnd + 'h ' +  minTillEnd + 'm ' +  secsTillEnd + 's');
      }
      totalSecsTillEnd--;
    }, 1000);
  }
})(jQuery);

