var OF = {
  log: function(data) {
    if (!OF.isDevice) {
      console.log('WEBLOG:', data);
    }
    
    // Send a log action to the client to show in the XCode console
    var message;
    if (OF.isDevice) {
      if (typeof data == 'object') {
        // break down the object.
        message = $.urlEncode(data);
      } else {
        // force into to a string
        message = ''+ data;
      }
      
      OF.sendAction('log', { message:message });
    }
    
  },
  
  // True if web view is on an client device
  // False if in a web browser on a dekstop computer
  isDevice:   navigator.userAgent.match(/iPhone|iPad|Android/),
  deviceType: {
    iOS:      navigator.userAgent.match(/iPhone|iPad/),
    Android:  navigator.userAgent.match(/Android/)
  },
  
  // True if there is an object defined by "NativeInterface" that allows
  // javascript to directly interface with a nnative code object on the client
  hasNativeInterface: false,
  
  // The current page object
  page: {
    url: null,            // url of this content
    title: null,          // Title of this screen
    scrolling: true,      // if false the view will not be scrollable
    titleImage: null,     // url of an image to use as the page title
    barButton: null,      // creates a right nav bar button on the client
    barButtonImage: null, // optional image for right bar button
    init: null,           // function to run on page display
    stylesheets: [],      // special stylesheets this page needs
    html: null,           // string (or actual nodes) of html page content
    
    // Automatically set 
    scrollPosition: 0,    // scroll position of window to restore on return
    query: {}             // object representing the query string
  },
  
  // All pages in the flow are in this array.  The last page is currently shown
  navigationStack: [],
  
  // Info about the last touch
  touch: {
    // Global pointer to the element that was last tapped.
    // Cleared on touchend or touchmove.
    element: null,
    
    // Location of the down touch.  Used to test how far we have moved since
    // touch down.
    x: null,
    y: null,
    
    // true if the page is scrolling about, dont allow touches until it
    // settles
    isScrolling: false
  },
  
  // Any data set here is preserved across all pages in the flow
  global: {},
  
  orientation: null,
  setOrientation: function(newOrientation) {
    if (newOrientation) {
      OF.orientation = newOrientation;
      $('body')
        .removeClass('orientation_portrait')
        .removeClass('orientation_landscape')
        .addClass('orientation_'+ OF.orientation);
      
      if (OF.topNavigationItem() && OF.topNavigationItem().orientationChanged) {
        OF.topNavigationItem().orientationChanged(OF.orientation);
      }
    }
  },
  
  // These functions handle page load tasks
  init: {
    
    // true if we are not loading any content
    isLoaded: false,
    flowIsLoaded: false,
    
    // Fetch the first content
    firstPage: function() {
      var queryString = location.href.split('?')[1];
      var hasUrl = false;
      if (queryString) {
        var options = $.urlDecode(queryString);
        
        if (options.url) {
          hasUrl = true;
          $.ajax({
            url:'/webui/browser_config.json',
            dataType: 'json',
            complete: function(xhr) {
              var data = $.parseJSON(xhr.responseText);
              OF.init.clientBoot(data);
              OF.navigateToUrl(options.url);
            }
          })
        }        
      }
      
      if (!OF.isDevice && !hasUrl) {
        OF.alert('ERROR', "No Content to Load! This page must be called with a url like /webui/?url=some/content_path");
      }
      
      // Create generic touch handlers
      OF.init.clickableElements();
      
      // Don't allow touches while scrolling is happening
      var win = $(window);
      win.scroll(function() {
        OF.touch.isScrolling = true;
        clearTimeout(win.data('stopScrollingCallback'));
        
        if (OF.page.eventHandle) OF.page.eventHandle().trigger("scroll");
        
        var timer = setTimeout(function() {
          OF.touch.isScrolling = false;
        }, 250);

        win.data('stopScrollingCallback', timer);
      });
    },
    
    clientBoot: function(options) {
      OF.hasNativeInterface = options.hasNativeInterface;
      
      OF.user     = options.user;
      if (!OF.user.name)  OF.user.name = null;
      if (!OF.user.id || OF.user.id == '0') OF.user.id = null;
      
      OF.game       = options.game;
      OF.serverUrl  = options.serverUrl;
      
      OF.actions  = options.actions;
      OF.platform = options.platform;
      OF.device   = options.device;
      
      OF.clientVersion = options.clientVersion;
      
      OF.dpi      = options.dpi;
      OF.setOrientation(options.orientation);
      
      OF.supports = {};      
      OF.supports.fixedPosition = (OF.platform == 'android' && OF.device.os.match(/v2\.2/) || OF.device.hardware == 'browser'); // TODO: this regex is very brittle.
      
      // Supplied by browser_config.json, for in browser testing of non embed poducts
      OF.manifestUrl = options.manifestUrl;
      
      OF.log("Client Booted - userID:"+ OF.user.id +" gameID:"+ OF.game.id +" platform:"+ OF.platform +" dpi:"+ OF.dpi);
      
      // Add classes to body element to allow various hardware and platform CSS customizations
      var body = $('body');
      body.addClass(OF.dpi).addClass(OF.platform);
      if (OF.supports.fixedPosition) body.addClass('fixed_position');
      
      return true;
    },
    
    // Get the page ready for the client
    start: function() {
      OF.init.isLoaded = false;
      OF.init.scripts();
      OF.init.browser();
      OF.init.scrolling();
      OF.init.query();
      
      setTimeout(OF.init.pageViewTracking, 2000);
      
      // Load up the flow, if needed
      if (!OF.init.flowIsLoaded && OF.page.loadflow) {
        OF.page.loadflow();
        OF.init.flowIsLoaded = true;
      }
      
      if (!OF.page.init) OF.page.init = function() {};
      if (OF.page.init.complete) {
        
        // Aleady ran init() so run resume() instead
        if (OF.page.resume) {
          try {
            OF.page.resume();
          } catch(e) {
            OF.alert('ERROR', "A script on this screen caused an error.\n appear: "+ e.toString());
          }
        }
        
      } else {
        
        // Haven't yet run init()
        try {
          OF.page.init();
        } catch(e) {
          OF.alert('ERROR', "A script on this screen caused an error.\n appear: "+ e.toString());
        }
        OF.page.init.complete = true;
        
      }
      
      $.defer(function() {
        if (OF.page.appear) {
          try {
            OF.page.appear();
          } catch(e) {
            OF.alert('ERROR', "A script on this screen caused an error.\n init: "+ e.toString());
          }
        }
        
        // $.defer(OF.init.imageLoading);
        $.defer(function() {
          OF.init.isLoaded = true;

          var buttonTitle = OF.page.barButton || OF.page.globalBarButton;
          var options = {};
          if (buttonTitle) options.barButton = buttonTitle;
          OF.contentLoaded(options);
        });
      });
    },
        
    // Compile string style javascript from JSON into functions
    scripts: function() {
      if (OF.page.init && typeof(OF.page.init) !== 'function') {
        OF.page.init = $.functionize(OF.page.init);
        OF.page.init.complete = false;
      }
      
      if (OF.page.appear && typeof(OF.page.appear) !== 'function') {
        OF.page.appear = $.functionize(OF.page.appear);
      }
      
      if (OF.page.resume && typeof(OF.page.resume) !== 'function') {
        OF.page.resume = $.functionize(OF.page.resume);
      }
      
      if (!OF.init.flowIsLoaded && OF.page.loadflow && typeof(OF.page.loadflow) !== 'function') {
        OF.page.loadflow = $.functionize(OF.page.loadflow);
      }
    },
    
    // Find all clickable elements and add the styles and click handlers
    clickableElements: function(elems, onTouch) {
      if (elems) {
        elems = $(elems);
        elems = $.map(elems.selector.split(','), function(subsel) {
          return "#page[data-page_id='"+ OF.topNavigationItem().id +"'] "+ $.trim(subsel);
        });
        elems = $(elems.join(', '));
      } else {
        elems = $('*[data-href], *[data-event], *[data-action], *[data-controller]');
      }
      
      if (onTouch) {
        elems.die('touch');
        elems.live('touch', onTouch);
      }
      
      // On a device, so use moultitouch events
      if (OF.isDevice) {
        elems
          .die('touchstart')
          .die('touchend');
          
         elems
          .live('touchstart', OF.touchHandlers.start)
          .live('touchend',   OF.touchHandlers.end);
      
      // In a browser, so use clicks and mouse events
      } else {
        elems
          .die('mousedown')
          .die('mouseup')
          .die('click');
        
        elems
          .live('mousedown',  function() { $(this).addClass('touched'); })
          .live('mouseup',    function() { $(this).removeClass('touched'); })
          .live('click',      function() { OF.clickElement(this); });
      }      
    },
    
    // Show the browser toolbar, usable only when NOT on a device
    browser: function() {
      if (!OF.isDevice && $('#browser_toolbar').length == 0) {
        $.loadCss('browser_toolbar', false);
        $.get('browser_toolbar.html', function(data) {
          $(document.body).append(data);
        });
      }
    },
    
    // Disable scrolling
    scrolling: function() {
      document.ontouchmove = function(event) {
        // Cancel touches if we scroll too far
        var limit = OF.page.scrolling ? 5 : 25;
        var x = Math.abs(event.targetTouches[0].screenX - OF.touch.x);
        var y = Math.abs(event.targetTouches[0].screenY - OF.touch.y);

        if (x > limit || y > limit) {
          OF.cancelTouch();
        }
        
        // Prevent scrolling if we are not scrollable
        if (!OF.page.scrolling) {
          event.preventDefault();
        }        
      }
    },
    
    // Creates nav bar button
    barButton: function() {
      var options = {};
      var buttonName = OF.page.barButton || OF.page.globalBarButton;
      
      if (OF.page.barButton)       options.barButton      = buttonName;
      if (OF.page.barButtonImage)  options.barButtonImage = OF.page.barButtonImage;
      OF.sendAction('addBarButton', options);
    },
    
    // Google analytics page track for the just loaded page
    pageViewTracking: function() {
      OF.pushGACall("_trackPageview", "/webui/" + OF.topNavigationItem().url);
    },
    

    
    // Callback on images so we know when they are all ready
    imageLoading: function() {
      var imgs = $('img.preload');
      if (imgs.length > 0) {
        imgs.load(OF.init.imageLoaded);
        imgs.error(OF.init.imageLoadError);
      }
      
      OF.init.imageLoaded();
    },
    
    // Checks all images on the page to see if they are loaded. 
    // If they are, let the client know the page is ready
    imageLoaded: function() {
      var allLoaded = true;
      $('img.preload').each(function() {
        if (!this.complete) {
          if (!this.errorOnLoad) {
            allLoaded = false;
          }
        }
      });
      
      if (allLoaded && !OF.init.isLoaded) {
        OF.init.isLoaded = true;
        
        var buttonTitle = OF.page.barButton || OF.page.globalBarButton;
        var options = {};
        if (buttonTitle) options.barButton = buttonTitle;
        OF.contentLoaded(options);
      }
    },
    
    // The image couldn't load for some reason, so mark it as loaded so it
    // doesn't block the page being ready
    imageLoadError: function() {
      this.errorOnLoad = true;
      $(this).load();
    },
    
    // Populate page.query with query string object
    query: function() {
      var page = OF.topNavigationItem();
      if (!page.params) page.params = {};
      if (page.url.match(/\?/)) {
        $.extend(page.params, $.urlDecode(page.url.split('?')[1]));
      }
    }
  },
  
  trackEvent: function(category, action, label, value) {
    OF.log('EVENT '+ category +', '+ action +', '+ label +', '+ value);
    OF.pushGACall('_trackEvent', category, action, label, value);
  },
  
  // These functions are used for touch handling in order to get respond more
  // quickly via the multitouch event api then the "click" api.
  touchHandlers: {
    
    // Set up the element to be tapped
    // * set the element in the global tapped element slot for later comparison
    // * give it the 'touched' class for visual feedback
    start: function(event) {
      OF.log('start ' + this.tagName + '#'+ this.id + '.'+ this.className);
      
      event = event.originalEvent;
      
      if (OF.touch.element || OF.touch.isScrolling) {
        return OF.cancelTouch(this);
      }
      
      OF.touch.element = this;
      OF.touch.x = event.targetTouches[0].screenX;
      OF.touch.y = event.targetTouches[0].screenY;
      
      // delay the touch highlight if it's a scrollable view
      if (OF.page.scrolling) {
        var _this = $(this);
        this.onTouchTimer = setTimeout(function() {
          _this.addClass('touched');
        }, 50);
      } else {
        $(this).addClass('touched');
      }
    },
    
    // If we didn't scroll, perform the action of the touched element
    end: function(event) {
      OF.log('end '+ this.tagName + '#'+ this.id + '.'+ this.className);
      event = event.originalEvent;
      
      if (OF.touch.element == this) {
        // Perform the action the element represents
        OF.clickElement(this);
        
        // Take off the touched status after a delay to allow the new
        // view to animate in.
        var _this = $(this);
        setTimeout(function() {
          _this.removeClass('touched');
        }, 300);
      }
      
      OF.cancelTouch();
    }
  },

  // Force-sets the title of the webui view
  forceSetTitle: function(title){
    if( $('#header .title') ) $('#header .title').html(title);
  },
  
  // Put a page in object form on the navigation stack
  pushNavigationItem: function(navItem) {
    OF.navigationStack.push(navItem);
  },
  
  // Shorthand for getting the top page object5
  topNavigationItem: function() {
    return OF.navigationStack[OF.navigationStack.length-1];
  },
  
  // Loads the top page object on the navigation stack
  loadTopNavigationItem: function(completionCallback) {
    // Get the top navItem
    var navItem = OF.topNavigationItem();
    
    // Set the title
    document.title = navItem.title;
    
    // Set screen state
    OF.page = navItem;
    
    // Clear things out to start clean
    $('#page').html('&nbsp;');
    
    // We are loaded
    OF.init.isLoaded = true;
    
    // Defer initialization to allow webview to redraw itself
    setTimeout(function() {
      // Continue initialization in another method that allows it to loop
      // until the client is actually ready with the content loaded in its DOM
      OF.loadTopNavigationItemOnHTMLReady(navItem, completionCallback);
    }, 50);
  },
  
  loadTopNavigationItemOnHTMLReady: function(navItem, completionCallback) {
    // Load HTML content
    $('#page')
      .html(navItem.html)
      .append("<div class='eventHandle' />")
      .attr('data-page_id', navItem.id);
    
    setTimeout(function() {
      // Ensure the client has loaded the HTML
      if ($.trim($('#page').html() || '').length == 0) {
        OF.log("Retrying... HTML not yet ready.");
        OF.loadTopNavigationItemOnHTMLReady(navItem);
        
      // HTML is loaded, continue initialization
      } else {
        // Perform initial page load javascript
        OF.init.start();
        if (completionCallback) $.defer(completionCallback, navItem);
        
        // Scroll to the previous position
        $.defer(function() {
          window.scroll(0, navItem.scrollPosition);
        });
      }      
    }, 10);
  },
  
  // Reset global touch state
  cancelTouch: function() {
    if (!OF.touch.element) return;
    
    var el = OF.touch.element;
    clearTimeout(el.onTouchTimer);
    $(el).removeClass('touched');
    
    OF.touch.element = null;
    OF.touch.x = null;
    OF.touch.y = null;
  },
  
  // Perform the action encoded into an element
  // * data-href:   navigate to a new page
  // * data-action: send a message to the client to be handled in native code
  clickElement: function(element) {
    if (!OF.init.isLoaded) return;    
    element = $(element);
    
    // trigger GA event tracking
    if (element.attr('data-event')) {
      var args = element.attr('data-event').split(',');
      OF.trackEvent.apply(OF, args);
    }
    
    // trigger any custom touch() function
    element.trigger('touch');
    
    // navigate to path in data-href 
    if (element.attr('data-href')) {
      var url = element.attr('data-href');
      if (url.match(/\.json/)) {
        // everything is already fine, continue
      } else if (url.match(/\?/)) {
        url = url.replace(/\?/, '.json?');
      } else {
        url = url + '.json';
      }

      var options = {};
      if (element.attr('title')) options.title = element.attr('title');
      if (element.attr('data-modal')) options.modal = !!element.attr('data-modal');
      
      OF.navigateToUrl(url, options);
    
    // call native action in data-action
    } else if (element.attr('data-action')) {
      OF.sendAction(element.attr('data-action'));
    
    // TODO: This might be deprecated at this point, especially due to xp
    // Push a native controller of name in dta-controller
    } else if (element.attr('data-controller')) {
      OF.pushController(element.attr('data-controller'));
    }
  },
  
  // Open a URL as a new page pushed onto the navigation stack
  
  navigateToUrl: function(url, options) {
    OF.init.isLoaded = false;
    if (!options) options = {};
    
    var onComplete = options.complete;
    options.complete = null;
    
    // Ensure url is requesting .json
    url = $.jsonifyUrl(url);
    options.path = url;
    OF.log("Loading content: "+ url);
    
    // Save important page state before adding another page
    var params = options.params || {};
    options.params = null;
    
    if (OF.navigationStack.length > 0) {
      OF.topNavigationItem().scrollPosition = window.scrollY;
    }
    
    OF.navigateToUrlCallback = function() {
      // Request new content
      $.ajax({
        url: url,
        dataType: 'json',
        success: function(data) {
          if (!OF.init.isLoaded) {
            OF.page.html = $('#page').contents().detach();

            var pageData = $.clone(data);
            $.extend(pageData, OF.pageFunctions);
            
            pageData.url = url;
            pageData.id = ['page', url.replace(/\W/g, '-'), (new Date().getTime())].join('_');
            pageData.scrollPosition = 0;
            pageData.modal = options.modal;
            OF.pushNavigationItem(pageData);
            OF.loadTopNavigationItem(onComplete);
            OF.topNavigationItem().params = $.extend(OF.topNavigationItem().params, params);
          }
        },
        error: function(xhr) {
          OF.init.isLoaded = true;
          OF.alert("Error", "Screen loading failed:\n"+ xhr.status +' '+ xhr.statusText);
          OF.loader.hide();
        }
      });
    };
    
    OF.sendAction('startLoading', options);
    OF.loader.show();
    if (!OF.isDevice) OF.navigateToUrlCallback();
  },
  
  actionIsSupported: function(actionName) {
    return OF.actions.indexOf(actionName) != -1;
  },
  
  // reload the current page
  refresh: function() {
    if (OF.page) {
      OF.page.init.complete = false;
      $.defer(OF.loadTopNavigationItem);
    }
  },
  
  // Google Analytics
  GA: {
    
    // True once the iframe is loaded
    loaded: false,
    
    // Holds a queue of analytics commands for before the iframe is loaded
    pending: [],
    
    // Push a call through the iframe cross domain communicatinator
    push: function() {
      // convert the arguments object into a normal array
      var args = Array.prototype.slice.call(arguments);

      var fragment = "#" + args.join(",");
      var url = "/webui/analytics.html" + fragment;    
      if (OF.serverUrl) url = (OF.serverUrl + url).replace('//webui', '/webui');
      
      if ($('#google_analytics_frame').length > 0) {
        
        if (OF.GA.loaded && OF.GA.pending.length == 0) {
          $("#google_analytics_frame").attr("src", url);

          // the following code uses the resize hack to communicate to the iframe that it should re-inspect
          // its fragment.  It rotates from 1-100px in width;
          var width = parseInt($("#google_analytics_frame").attr("width")) + 1;
          if (width > 100) { width = 1; }
          $("#google_analytics_frame").attr("width", width);
        } else {
          OF.GA.pending.push(args);
        }

      } else {        
        $('<iframe>')
          .load(OF.GA.iframeLoaded)
          .attr('id', 'google_analytics_frame')
          .attr('width', 99)
          .attr('height', 1)
          .attr('src', url)
          .appendTo('body');
      }
    },
    
    iframeLoaded: function() {
      OF.GA.loaded = true;
      
      var pending = OF.GA.pending.shift();
      if (pending) {
        OF.GA.push.apply(null, pending);
        setTimeout(function() {
          OF.GA.iframeLoaded();
        }, 100);
      }
    }
  },
  
  // legacy alias
  pushGACall: function(a,b,c,d,e) {
    OF.GA.push(a,b,c,d,e);
  },
  
  // Send an action to the OFClient that is to be handled in native code
  sendAction: function(actionName, options, afterAction) {
    for (var key in options) {
      if ($.isFunction(options[key])) {
        options[key] = OF.page.saveFunction(options[key], actionName +'-'+ key);
      }
    }
    
    var query = $.urlEncode(options);
    if (query.length > 0) actionName += '?'+ $.urlEncode(options);
    
    OF.actionQueue.push({
      uri:         actionName,
      afterAction: afterAction
    });
    
    if (OF.actionQueue.length == 1) {
      $.defer(OF.sendQueuedAction);
    }
  },
  
  actionQueue: [],
  sendQueuedAction: function() {
    if (OF.actionQueue.length == 0) return;
    var actionObj = OF.actionQueue.shift();
    var actionPath = actionObj.uri;
    
    if (OF.isDevice) {
      $.defer(function() {
        var uri = 'openfeint://action/' + actionPath;
        if (OF.hasNativeInterface) {
          NativeInterface.action(uri);
        } else {
          // Change the url on an iframe to pass actions to the client.
          if ($('#action_frame').length > 0) {
            $('#action_frame').attr('src', uri);
          } else {
            $('<iframe>')
              .attr('id', 'action_frame')
              .attr('src', uri)
              .appendTo('body');
          }
          
          // Does an iframe location change work on all platforms without a native interface?
          // If not, we have to do it this way:
          //
          //   location.href = uri;
        }
        
        if (actionObj.afterAction) $.defer(actionObj.afterAction);
      });
    } else {
      if (actionObj.afterAction) $.defer(actionObj.afterAction);
    }
    
    if (!actionPath.match(/^log\W/)) {
      if (!OF.isDevice) console.log('ACTION: '+ actionPath);
    }
    
    $.defer(OF.sendQueuedAction);
  },
  
  // Push a native controller onto the stack
  pushController: function(controllerName, options) {
    controllerName = controllerName +'?'+ $.urlEncode(options);
    if (OF.isDevice) {
      location.href = 'openfeint://controller/'+ controllerName;
    }
    OF.log('CONTROLLER:'+ controllerName);
  },
  
  // Client action that tells it a page is ready for viewing. When this fires
  // all html, scripts, and images are loaded and ready
  contentLoaded: function(options) {
    if (!options) options = {};

    options.title = document.title;
    if (OF.page.titleImage)      options.titleImage      = OF.page.titleImage;
    if (OF.page.barButton)       options.barButton       = OF.page.barButton;
    if (OF.page.barButtonImage)  options.barButtonImage  = OF.page.barButtonImage;
    if (OF.api.activeRequests.length > 0) options.keepLoader = 'true';
    OF.loader.hide();
    OF.sendAction('contentLoaded', options);
  },
  
  // Set a bar button on iOS and a handler for it.  Title can be a string or
  // a WebUI relative image path
  barButton: function(title, onTouch) {
    var options = {};
    if (title.match(/png$/)) {
      options.image = title.replace('xdpi.png', OF.dpi +'.png');
    } else {
      options.title = title;
    }
    
    $.defer(function() {
      OF.page.barButtonTouch = onTouch;
      OF.sendAction('addBarButton', options);
    });
  },

  // Pop the top navigation item, and load the one behind it
  goBack: function(options) {
    OF.cancelTouch();
    
    if (!options) options = {};
    if (OF.init.isLoaded && OF.navigationStack.length > 1) {
      if (options && options.root) {
        OF.navigationStack = [OF.navigationStack[0]];
      } else {
        OF.navigationStack.pop();
      }
      var onComplete = options.complete;
      delete options.complete;
      
      OF.sendAction('back', options, function() {
        OF.loadTopNavigationItem(onComplete);
      });
    } else {
      OF.contentLoaded();
    }
    OF.init.isLoaded = true;
    OF.loader.hide();
  },
  
  alert: function(title, message, options) {
    options = options || {};
    options.title = title;
    options.message = message;
    OF.sendAction('alert', options);
    
    // browser alert if in the browser
    if (!OF.isDevice) alert(options.title +"\n\n"+ options.message);
  },
  
  api: {
    // Ask the client to make an API request
    request: function(path, options) {
      options    = options        || {};
      var params = options.params || {};
      
      var request = new OF.api.RequestObject(path, params, options);
      OF.api.activeRequests[request.id] = request;
      request.start();
      return request;
    },
    
    // Holds requests that are open and awaiting a callback
    activeRequests: {},
    
    // Make a new apiRequestObject with
    //   new apiRequestObject(path, params, options);
    RequestObject: function(path, params, options) {
      this.id = [
        path.replace(/\W/g, '-'),
        new Date().valueOf(),
        Math.floor(Math.random()*1000000)
      ].join("_");
      
      this.page = OF.page;
      this.background = options.background;
      this.path = path;
      this.params = params;
      this.httpParams = options.httpParams;
      this.loader = $(options.loader);
      this.method = options.method || 'GET';

      // Custom Callbacks
      this.successCallback  = options.success;
      this.failureCallback  = options.failure;
      this.completeCallback = options.complete;
      
      //status based callbacks
      var statusCallbacks  = {};
      
      $.each([200, 201, 400, 401, 404, 406, 409, 500, 503], function() {
        statusCallbacks["on" + this] = options["on" + this];        
      });
      
      this.statusCallbacks = statusCallbacks;
      
      // Fake session in browser, only works in development server mode
      if (!OF.isDevice) {
        params.session_device_id = OF.device.identifier;
        params.session_user_id   = OF.user.id;
        params.session_game_id   = OF.game.id;
      }
      
      // Begins the request
      this.start = function() {
        OF.log('API Request Started: '+ this.method +' '+ path +'?'+ $.urlEncode(params));
        
        if (!this.background) OF.loader.show();
        if (this.loader) {
          if (this.loader.hasClass('button')) {
            this.loader
              .data('buttonHtml', this.loader.html())
              .html('Loading&hellip;');
          } else {
            this.loader.fadeIn();
          }
        }
        
        OF.sendAction('apiRequest', {
          path:       this.path,
          method:     this.method,
          params:     $.urlEncode(this.params),
          httpParams: $.urlEncode(this.httpParams),
          request_id: this.id
        });
        
        // Ajax for browser
        if (!OF.isDevice) {
          var thisReq = this;
          $.ajax({
            url:      this.path,
            data:     this.params,
            type:     this.method,
            dataType: 'json',
            
            complete: function(xhr, textStatus) {
              OF.api.completeRequest(thisReq.id, xhr.status.toString(), xhr.responseText);
            }
          })
        }
      };
      
      // Completion handler
      this.complete = function(status, response) {
        var data = (typeof response === 'object') ? response :
                    ($.trim(response).length ? $.parseJSON(response) : {});
        if (!data) data = {};
        
        this.isComplete = true;
        if (!this.background) OF.loader.hide();
        if (this.isCancelled || this.page != OF.page) return;
        
        if (this.loader) {
          if (this.loader.hasClass('button')) {
            this.loader.html(this.loader.data('buttonHtml'));
          } else {
            this.loader.hide();
          }
        }
        
        //status code based callbacks
        if(callback = this.statusCallbacks["on" + status]) {
          callback(data, status);
        }
        // Success
        if (status.match(/^2/)) {
          OF.log('API Request Complete: '+ this.path);
          if (!OF.isDevice) console.log('    ', data);

          if (this.successCallback) {
            this.successCallback(data, status);
          }

        // Failure
        } else {
          OF.log('API Request Failed: '+ this.path +'    '+ response);
          if (!OF.isDevice) console.log('    ', data);

          if (this.failureCallback) {
            var handledFailure = true;
            handledFailure = this.failureCallback(data, status);
            if (handledFailure === false) {
              OF.api.handleError(data, status);
            }
          } else {
            OF.api.handleError(data, status);
          }
        }
                
        // Complete
        if (this.completeCallback) {
          this.completeCallback(data, status);
        }
      };
      
      this.cancel = function() {
        if (!this.isComplete) {
          this.isCancelled = true;
          if (this.completeCallback) {
            this.completeCallback({ exception: { "class": 'CanceledRequest', message: 'This request was canceled' } }, '408');
          }
        }
      }
    },
    
    handleError: function(data, status) {
      if (data.exception) {
        if (status == '0') {
          OF.alert('Unable to Connect', 'Please check that you have cellular or WiFi service and try again.');
        } else {
          alert(data.exception.message);
        }
      } else {
        OF.alert('ERROR: '+ status, 'Oops! There was an error communicating with the server.');
      }
    },
    
    // Execute the requests response handling and then destroy it.
    completeRequest: function(requestID, status, response) {
      var req = OF.api.activeRequests[requestID];
      if (req) {
        req.complete(status, response);
        delete OF.api.activeRequests[requestID];
      } else {
        OF.log("WARNING: Request ID not found. Maybe it already completed. ID: "+ requestID);
      }
    },
  },
  
  loader: {
    count: 0,
    show: function() {
      if (OF.loader.count == 0) {
        OF.sendAction('showLoader');
      }
      $('#header .loading').show();
      OF.loader.count++;
    },
    hide: function() {
      OF.loader.count--;
      if (OF.loader.count < 0) OF.loader.count = 0;
      if (OF.loader.count == 0) {
        $('#header .loading').hide();
        OF.sendAction('hideLoader');
      }
    }
  },
  
  // Store (or clear) the logged in user.
  userDidLogin: function(user) {
    if (user && user.id && user.id.length && user.id != '0') {
      OF.user = user;
    } else {
      OF.user = { name: null, id: null};
    }
    
    if (OF.page && OF.page.userDidLogin) {
      OF.page.userDidLogin(user);
    }
  },
  
  pageFunctions: {
    eventHandle: function() {
      return $("#page > .eventHandle");
    },
    saveFunction: function(fn, someId) {
      if ($.isFunction(fn)) {
        if (!OF.page.savedFunctions) OF.page.savedFunctions = {};
        var string = [someId, new Date().valueOf(), Math.floor(Math.random()*1000000)].join('-');
        OF.page.savedFunctions[string] = fn;
        return 'OF.page.savedFunctions["'+ string +'"]';
      }
    }
  }
};

// --- jQuery extensions ---
(function() {
  // Use to make elements tappable and execute the provided function.
  // Works similarly to click() and friends.
  jQuery.fn.touch = function(func) {
    if (func) {
      OF.init.clickableElements(this, func);
    } else {
      OF.clickElement(this);
    }
  };
  
  // Fade in an element that was hidden on page load with the .hidden class
  jQuery.fn.unhide = function(fadeSpeed) {
    $(this).removeClass('hidden').hide().fadeIn(fadeSpeed);
    return $(this);
  };
  
  // Toggle the touch state of an element super quick to trigger preloading
  // of images refrenced in the .touched css.
  jQuery.fn.pretouch = function() {
    elems = $(this);
    elems.addClass('touched');
    $.defer(function() {
      elems.removeClass('touched')
    });
    return elems;
  };
  
  // Shortcut for data('isLoading')
  // Used to disbale forms and buttons while an API request is working.
  jQuery.fn.isLoading = function(value) {
    return $(this).data('isLoading', value);    
  };
  
  // returns true if all input elements in this form have a value
  jQuery.fn.isFormFilled = function(failureMessage) {
    var valid = true; 
    $(this).find(':input').each(function(index,field) {
      if (field.value.length == 0) {
        OF.alert('Missing Data', failureMessage ? failureMessage : 'Please fill out all form fields.');
        valid = false;
        return false;
      }
    });
    return valid;
  };
  
  // Provides a method to lazy load a server resource as the user scroll the window
  // use nextPageLoaded callback to respond to new data
  // use nextPageShouldLoad to trigger your remote api calls to load the next page
  jQuery.lazyLoad = function(options) {
    var self = OF.page.eventHandle();
    var startPage = options.startPage || 1;
    var threshold = options.threshold || 0.5; //percentage of the window height left to scroll that will trigger the next page
    var nextPageLoaded      = options.nextPageLoaded;
    var nextPageShouldLoad  = options.nextPageShouldLoad;
    var isEmpty  = options.isEmpty;
    var isFinished  = options.isFinished;
    
    var pageHandler = function(page, data, forceFinish) {
      var finished = forceFinish || data.length == 0
      
      if(finished) {
        if(page == 1 && isEmpty){ isEmpty(); }
        if(isFinished){ isFinished(); }
        $(self).unbind("scroll.lazyLoader");
      }
      
      if(data.length > 0){ nextPageLoaded(page, data); }
      
      $(self).data("lazyLoader-lastLoadedPage", page)
      $.defer(function(){ $(self).data("lazyLoader-isLoading", false) });
    }
    
    $(self).data("lazyLoader-isLoading", true);
    // first load the initial page, then hookup the scroller
    nextPageShouldLoad(startPage, pageHandler.curry(startPage))
    

    $(self).bind("scroll.lazyLoader", function() {
      var scrollBottom = $(document).scrollTop() + $(window).height();
      var triggerLine = $(document).height() - ($(window).height() * threshold)
      // if we're not past the triggerline, bail
      if(scrollBottom < triggerLine) { return; }

      // if we're already loading the next page, bail
      if($(self).data("lazyLoader-isLoading")){ return; }

      var nextPage = ($(self).data("lazyLoader-lastLoadedPage") || startPage) + 1;

      $(self).data("lazyLoader-isLoading", true)
      nextPageShouldLoad(nextPage, pageHandler.curry(nextPage));
    })
  };
  
  
  // Execute this code in the next runloop
  jQuery.defer = function(js) {
    var args = Array.prototype.slice.call(arguments);
    args.shift();      

    setTimeout(function() {        
      $.functionize(js).apply(null, args);
    }, 0);
  };
  
  jQuery.clone = function(obj) {
    return $.extend({}, obj);
  };
  
  // Time this javascript and print the time taken in ms to the console
  jQuery.profile = function(name, fn) {
    var start = new Date();
    fn();
    var end   = new Date();
    OF.log('JS PROFILE:'+ name +' - '+ (end - start) +'ms');
  };

  // Encode an object into a query string
  jQuery.urlEncode = function(options, prefix) {
    var result = '';

    if (options) {
      var values = [];
      for (var key in options) {
        if (options[key] != null) {
          var paramName = prefix ? prefix +"["+ key +"]" : key;
          var value = options[key];

          if ($.isPlainObject(value)) {
            values.push($.urlEncode(value, paramName));
          } else {
            values.push(paramName +'='+ escape(value));
          }
        }
      }
      result = values.join('&');
    }

    return result;
  };

  // Opposite of $.urlEncode().  Convert query string to object
  jQuery.urlDecode = function(queryString) {
    if (!queryString) return {};
    queryString = queryString.replace(/^\?/, ''); // ensure no leading ? character

    var result = {};
    var pairs = queryString.split('&');
    $.each(pairs, function() {
      var pair = this.split('=');
      result[pair[0]] = unescape(pair[1]);
    });

    return result;
  };
  
  jQuery.htmlEncode = function(value) { 
    return $('<div/>').text(value).html(); 
  };

  jQuery.htmlDecode = function(value) { 
    return $('<div/>').html(value).text();
  };
  
  // Convert a string into a function object
  jQuery.functionize = function(js) {
    // It's a function already, return it as is
    if ($.isFunction(js)) return js;

    // It's a string, so make a function
    else if (typeof js == 'string') {
      if (js.match(/^\s*function/)) {
        js = ['(', js, ')'].join('');
      } else {
        js = ['(function() {', js, '})'].join('');
      }

      return eval(js);
      
    // Not a functionizable object
    } else {
      console.log('ERROR: js must be a string or function but got:', js);
    }
  }

  // foo/bar?thing=baz -> foo/bar.json?thing=baz
  jQuery.jsonifyUrl = function(url) {
    if (!url.match(/\.json/)) {
      if (url.match(/\?/)) {
        url = url.replace(/\?/, '.json?');
      } else {
        url += '.json';
      }
    }

    return url;
  }
  
  // Renders an array of objects 
  jQuery.renderCollection = function(partialName, items, innerKey) {
    if (items.length == 0) return '';
    
    var theTmpl = tmpl(partialName);
    var html = [];
    
    if (!innerKey) {
      var keys = [];
      for(var k in items[0]) { keys.push(k); }
      if (keys.length > 1) {
        OF.log('ERROR: Ambiguous inner keys ['+ keys.join(', ') +']. Specify what key to use if there is more than one.');
        return;
      }
      if (keys.length == 0) {
        OF.log('ERROR: Cannot render empty object.')
      }
      
      innerKey = keys[0];
    }
    
    var index = 0;
    $.each(items, function() {
      var obj = this[innerKey];
      
      if (!obj.index)    obj.index = index;
      if (!obj.position) obj.position = obj.index + 1;
      index++;
      
      html.push(theTmpl(obj));
    });
    
    return $(html.join(''));
  };
  
  // Load a local script for a flow.  Asynchronously, blocking further execution
  jQuery.loadScript = function(path) {
    $.ajax({
      url: ['javascripts/', path, '.js?', new Date().getTime()].join(''),
      dataType: 'script',
      async: false
    });
  };
  
  jQuery.loadCss = function(path, async) {
    $.ajax({
      url: ['stylesheets/', path, '.css?', new Date().getTime()].join(''),
      async: typeof(async) === 'undefined' ? true : async,
      success: function(data) {
        $('<style></style>')
          .attr('type', 'text/css')
          .attr('id', path +'_css')
          .html(data)
          .appendTo('head');
      }
    });
  };
  
  jQuery.ensureUpdate = function(selector, fn) {
    fn();
    
    var html = $(selector).html();
    if (html == null || $.trim(html).length == 0) {
      // OF.log('Ensuring Update... '+ selector);
      setTimeout(function() {
        jQuery.ensureUpdate(selector, fn)
      }, 100);
    }
  };
  
  /*  Code below is derivitave from Prototype, which is licensed
   *  Prototype JavaScript framework, version 1.6.1
   *  (c) 2005-2009 Sam Stephenson
   *
   *  Prototype is freely distributable under the terms of an MIT-style license.
   *  For details, see the Prototype web site: http://www.prototypejs.org/
   *
   *--------------------------------------------------------------------------*/

   Function.prototype.curry = function() {
     if (!arguments.length) return this;
     var __method = this, args = Array.prototype.slice.call(arguments, 0);
     return function() {
       var a = $.merge(args, arguments);
       return __method.apply(this, a);
     }
   }
   
  // End prototype code
  
})();

if(typeof NativeInterface == "object" && NativeInterface.frameworkLoaded) {
  NativeInterface.frameworkLoaded();
}

// --- GO ---
$(document).ready(OF.init.firstPage);
