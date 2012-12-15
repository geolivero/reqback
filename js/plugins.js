/* Copyright (c) 2012 Gerald Olivero
 * MultiUpload
 * Version 1.1
 */
(function ($) {
    var multiClass = {};

    multiClass.files = [];
    multiClass.fileElement = null;
    multiClass.hiddenId = null;
    multiClass.formElement = '';
    multiClass.progressURL = '';
    multiClass.onComplete = function () {};

    multiClass.initWidthEvent = function (fileEl) {
        multiClass.fileElement = fileEl;
        multiClass.formElement = fileEl.closest('form');
        fileEl.change(function () {
            multiClass.files = this.files;
            multiClass.buildCue();
        });
        multiClass.formElement.submit(function () {
            setTimeout(multiClass.updateProgress, 1000);
        });
    };
    multiClass.buildCue = function () {
        var htmlCue = '', pad;
        if (this.files.length) {
            if (typeof this.files === 'object') {
                htmlCue = ''.add(''.tagWrap('span.legend').tagWrap('div.progressBar').tagWrap('div.progressBarWrap')).tagWrap('div');

                multiClass.formElement.append(htmlCue.tagWrap('div.multiUploadcueImages'));
            }
        }
    };
    multiClass.testProgress = function (data) {
        var obj = $.parseJSON(data);
        if (obj.finished) {
            multiClass.uploadComplete();
        } else {
            multiClass.updateUI(obj);
            setTimeout(multiClass.updateProgress, 300);
        }
    };

    multiClass.updateProgress = function () {
        $.get("/test/status/", {format: "json", progress_key: multiClass.hiddenId}, function(data){
            multiClass.testProgress(data);
        });
        $('div.multiUploadcueImages > div').eq(0).find('div.progressBar').css({width: '90%'});
    };

    multiClass.updateUI = function (data) {
        multiClass.formElement.find('div.multiUploadcueImages')
        .find('div').eq(0).find('div.progressBar').css({width: data.percent.add('%')});
    };

    multiClass.uploadComplete = function () {
        multiClass.formElement.find('div.multiUploadcueImages')
        .find('div').eq(0).find('div.progressBar').css({width: '100%'});
        multiClass.onComplete();
    }

    multiClass.tools = {
        loop: function (length, callback) {
            var i = 0;
            while (i < length) {
                callback(i);
                i += 1;
            }
        }
    };

    $.fn.multiUpload = function ( options ) {
        var defaults, options;

        defaults = $.extend({
            uniqueId: '',
            progressURL: '',
            onComplete: function () {}
        }, options);

        this.each(function () {
            var _this = $(this);
            _this.attr('multiple', 'multiple');
            _this.attr('id', 'uploader');
            multiClass.progressURL = defaults.progressURL;
            multiClass.hiddenId = defaults.uniqueId;
            multiClass.onComplete = defaults.onComplete;
            // Init app
            multiClass.initWidthEvent(_this);
        });
    };
}(jQuery));



/* Copyright (c) 2012 Gerald Olivero
 * Etalage Slider
 * Version 1.2
 */

(function ($) {
    $.fn.etalageSlider = function (options) {
        var settings = $.extend({
            showNavigationArrows: true,
            showNavigationList: true,
            showNavigationArrowsLabelLeft: '&lt;',
            showNavigationArrowsLabelRight: '&gt;',
            showIndicator: true,
            interval: 5,
            seconds: 1,
            animationType: 'horizontal',
            perSlideAnimationStart: function () {},
            perSlideAnimationCompleted: function () {},
            width: false
        }, options);

        return this.each(function () {
            var _this = $(this), list = _this.find('ul'), items = list.find('li'), navList = '',
            counter = 0, oldCounter = 0, indicatorWidth, repeatSlider,  slideToRight,  slideNow, widthSlide = _this.width(), heightSlide = _this.height(), direction = 'right';

            items.hide();
            items.eq(0).show();
            try {
                ''.tagWrap('');
                ''.add();
            } catch (e) {
                throw('Please copy the string prototype methods from the Geo library > error:' + e + "\njQuery plugin 'etalageSlider' stopped.");
                return false;
            }

            list.wrap(''.tagWrap('div.etalageSliderMasker'));
            _this.append(''.tagWrap('div.etalageSlideNavBar'));


            repeatSlider = function () {
                _this.find('div.etalageSliderIndicator')
                    .stop().css({width: 0})
                    .animate({width: indicatorWidth}, settings.interval * 1000,
                    function () {
                        slideToRight();
                        slideNow(undefined, direction);
                        repeatSlider();
                    });
            };
            slideToRight = function () {
                counter = counter > _this.find('.etalageSlideNavBar ol li').length - 2 ?  0: counter + 1;
            };

            if (settings.showNavigationArrows && items.length > 1) {
                if (_this.attr('eta-arrows') !== 'false') {
                    settings.showNavigationArrowsLabelRight = _this.attr('right-label') ? _this.attr('right-label') : settings.showNavigationArrowsLabelRight;
                    settings.showNavigationArrowsLabelLeft = _this.attr('left-label') ? _this.attr('left-label') : settings.showNavigationArrowsLabelLeft;
                    _this.find('.etalageSlideNavBar').append(settings.showNavigationArrowsLabelRight.add(''.tagWrap('i')).tagWrap('span.right'))
                    .append(settings.showNavigationArrowsLabelLeft.add(''.tagWrap('i')).tagWrap('span.left'));
                }
            }
            if (settings.showNavigationList && items.length > 1)  {
                if (_this.attr('eta-list') !== 'false') {
                    items.each(function (i) {
                        var cl = i === 0 ? '.current' : '';
                        navList += ''.add((i + 1).toString().tagWrap('li'.add(cl)));
                    });
                    _this.find('.etalageSlideNavBar').append(navList.tagWrap('ol.etalageSliderNavList'));
                }
            }
            if (settings.showIndicator && items.length > 1)  {
                if (_this.attr('eta-indicator') !== 'false') {
                    _this.append(''.tagWrap('div.etalageSliderIndicator'));
                }
                indicatorWidth = _this.find('div.etalageSliderIndicator').width();
                repeatSlider();
            }

            slideNow = function (index, directionArrows) {
                var curCounter = index !== undefined ? index : counter,
                currentSlide = _this.find('.etalageSliderMasker ul li').eq(curCounter),
                oldSlide = _this.find('.etalageSliderMasker ul li').eq(oldCounter),
                direction = directionArrows ?  directionArrows : oldCounter > curCounter ? 'right' : 'left';

                if (_this.find('.etalageSlideNavBar ol li').length) {
                    _this.find('.etalageSlideNavBar').css({ zIndex: _this.find('.etalageSlideNavBar ol li').length + 10});
                    _this.find('.etalageSlideNavBar ol li').removeClass('current');
                    _this.find('.etalageSlideNavBar ol li').eq(curCounter).addClass('current');
                }
                settings.perSlideAnimationStart(curCounter, currentSlide);

                switch (settings.animationType) {
                    case "fade":
                        currentSlide.hide().stop().fadeIn(settings.seconds * 1000, function () { settings.perSlideAnimationCompleted(curCounter, currentSlide); } );
                        items.css({zIndex: 0});
                        currentSlide.css({zIndex: items.length});
                        oldSlide.css({zIndex: 1});
                    break;
                    case "vertical":
                        if (direction === 'left') {
                            currentSlide.show().css({ top: heightSlide}).stop().animate({ top: 0}, settings.seconds * 1000, function () { settings.perSlideAnimationCompleted(curCounter, currentSlide); } );
                            oldSlide.css({top: 0}).show().stop().animate({ top: -heightSlide}, settings.seconds * 1000);
                        } else {
                            currentSlide.show().css({ top: -heightSlide}).stop().animate({ top: 0}, settings.seconds * 1000, function () { settings.perSlideAnimationCompleted(curCounter, currentSlide); } );
                            oldSlide.css({top: 0}).show().css({ top: 0}).stop().animate({ top: heightSlide}, settings.seconds * 1000);
                        }
                    break;
                    default:
                        if (direction === 'left') {
                            currentSlide.show().css({ left: widthSlide}).stop().animate({ left: 0}, settings.seconds * 1000, function () { settings.perSlideAnimationCompleted(curCounter, currentSlide); } );
                            oldSlide.css({left: 0}).show().stop().animate({ left: -widthSlide}, settings.seconds * 1000);
                        } else {
                            currentSlide.show().css({ left: -widthSlide}).stop().animate({ left: 0}, settings.seconds * 1000, function () { settings.perSlideAnimationCompleted(curCounter, currentSlide); } );
                            oldSlide.css({left: 0}).show().css({ left: 0}).stop().animate({ left: widthSlide}, settings.seconds * 1000);
                        }
                    break;
                }
                oldCounter = curCounter;
            };

            _this.find('.etalageSlideNavBar li').click(function () {
                if (!$(this).hasClass('current')) {
                    slideNow($(this).index());
                }
                _this.find('div.etalageSliderIndicator').stop().hide();
            });
            _this.find('.etalageSlideNavBar span').click(function () {
                if ($(this).hasClass('left')) {
                    direction = 'left';
                    counter = counter < 1 ?  _this.find('.etalageSlideNavBar ol li').length - 1: counter - 1;
                } else {
                    direction = 'right';
                    slideToRight();
                }
                slideNow(undefined, direction);
                _this.find('div.etalageSliderIndicator').stop().hide();
            });


        });
    };
} (jQuery));


(function (){
    String.prototype.trimSpaces = function (filler) {
        filler = filler || ' ';
        return this.replace(/\s+/g, filler);
    };
    String.prototype.add = function (vars) {
        vars = vars || '';
        return [this, vars].join('');
    };
    String.prototype.tagWrap = function (tag) {
        var tagCode = tag.split('.')[0].split('#')[0].split(' ')[0],
            classes, attributes, ids;
        classes = tag.split(' ')[0].split('.').splice(1, tag.split(' ')[0].split('.').length);
        classes = classes.length ? ' class="'.add(classes.join(' ')).split('#')[0].add('"') : '';
        ids = tag.split(' ')[0].split('#').splice(1, tag.split(' ')[0].split('#').length);
        ids = ids.length ? ' id="'.add(ids.join(' ')).split('.')[0].add('"') : '';
        attributes = tag.split(' ').splice(1, tag.split(' ').length);
        attributes = attributes.length ? attributes.join(' ').split('=').join('="').add('"') : '';
        attributes = attributes.length ? ' '.add(attributes.split(' ').join('" ')) : '';
        return '<'.add(tagCode).add(ids).add(classes).add(attributes).add('>').add(this).add('</').add(tagCode).add('>');
    };
}());


/* Copyright (c) 2012 Gerald Olivero
 * replaceLabelByCustomTag
 * Version 1.1
 */
(function ($) {
    $.fn.replaceLabelByCustomTag = function ( options ) {
        var defaults, options;

        defaults = $.extend({
            tag: ''
        }, options);

        this.each(function () {
            var _this = $(this);
            if ($(this).html().indexOf('[') > -1) {
                if (options.tag.length) {
                    $(this).html(
                        $(this).html()
                        .split(['[', options.tag ,']'].join(''))[1]
                        .split(['[/', options.tag ,']'].join(''))[0]
                    );
                } else {
                    throw('jQ pluginn "replaceLabelByCustomTag", a tag is required');
                    return;
                }
            } else {
                throw('jQ pluginn "replaceLabelByCustomTag", please provide a string with the following tag: [tag]content[/tag]');
                return;
            }
        });
    };
}(jQuery));

/* Copyright (c) 2012 Gerald Olivero
 *
 * Version 1.1
 */
(function ($) {
    $.fn.facebookFaces = function ( options ) {
        var defaults, options;

        defaults = $.extend({

        }, options);

        this.each(function () {
            var _this = $(this);
        });
    };
}(jQuery));

/* Copyright (c) 2012 Gerald Olivero
 *
 * Version 1.1
 */

(function ($) {
    $.fn.autoSubmitField = function ( options ) {
        var defaults, options;

        defaults = $.extend({
            onReady: function () {},
            onStart: function () {}
        }, options);

        defaults = $.extend({
            data: [],
            position: 'bottom',
            onChange: function () {}
        }, options);

        this.each(function () {
            var _this = $(this), typeTimer, shootSubmit;

            if (typeTimer !== undefined) {
                clearTimeout(typeTimer);
            }
            _this.keyup(function () {
                options.onStart();
                if (typeTimer !== undefined) {
                    clearTimeout(typeTimer);
                }
                typeTimer = setTimeout(shootSubmit, 1000, $(this).val());
            });

            shootSubmit = function (val) {
                options.onReady(val);
            }
        });
    }
}(jQuery));

/* Copyright (c) 2012 Gerald Olivero
 *
 * Version 1.1
 */
(function ($) {
    $.fn.customSelectBox = function ( options ) {
        var defaults, options;

        defaults = $.extend({
            data: [],
            position: 'bottom',
            onChange: function () {}
        }, options);

        this.each(function () {
            var _this = $(this), list, i, events;

            events = function () {
                var widgetWrapper = _this.parent().find('.customSelectBoxListWrapper');

                widgetWrapper.find('strong').click(function(e) {
                    $(this).addClass('selected');
                    $(this).find('i').removeClass('icon-chevron-down').addClass('icon-chevron-up');
                    widgetWrapper.find('ul').show();

                    return false;
                });
                widgetWrapper.find('ul').mouseleave(function(event) {
                    widgetWrapper.find('strong i').removeClass('icon-chevron-up').addClass('icon-chevron-down');
                    $(this).hide();
                });
                widgetWrapper.find('ul li').click(function(e) {
                    widgetWrapper.find('ul').hide();
                    widgetWrapper.find('strong i').removeClass('icon-chevron-up').addClass('icon-chevron-down');
                    widgetWrapper.find('strong span').html($(this).html());
                    options.onChange({ index: $(this).index(), value: $(this).attr('data-value')});
                });
            };

            list = '<ul class="customSelectBoxList">';
            _this.hide();

            if (_this.find('option').length) {
                _this.parent().find('.customSelectBoxListWrapper').remove();
                if (options.position === 'top') {
                    _this.parent().prepend(['<div class="customSelectBoxListWrapper"><strong><i class="arrow icon-chevron-down"></i><span>' , _this.find('option').eq(0).html() , '</span></strong>'].join(''));
                } else {
                    _this.parent().append(['<div class="customSelectBoxListWrapper"><strong><i class="arrow icon-chevron-down"></i><span>' , _this.find('option').eq(0).html() , '</span></strong>'].join(''));
                }
                _this.find('option').each(function(event) {
                    list += ['<li data-value="' , $(this).attr('value') , '" class=', $(this).attr('value').replace(/\s+/g, '-') , '><i class="', options.data[i].value.replace(/\s+/g, '-') , '"></i></i><span>', $(this).html() , '</span></li>'].join('');
                });
            }
            if (options.data.length) {
                _this.parent().find('.customSelectBoxListWrapper').remove();

                if (options.position === 'top') {
                    _this.parent().prepend(['<div class="customSelectBoxListWrapper"><strong><i class="arrow icon-chevron-down"></i><span>' , options.data[0].label , '</span></strong></div>'].join(''));
                } else {
                    _this.parent().append(['<div class="customSelectBoxListWrapper"><strong><i class="arrow icon-chevron-down"></i><span>' , options.data[0].label , '</span></strong></div>'].join(''));
                }
                for (i = 0; i < options.data.length; i += 1) {
                    list += ['<li data-value="' , options.data[i].value , '" class=', options.data[i].value.replace(/\s+/g, '-') , '><i class="', options.data[i].value.replace(/\s+/g, '-') , '"></i><span>', options.data[i].label , '</span></li>'].join('');
                }
            }

            list += '</ul>';

            _this.parent().find('.customSelectBoxListWrapper').append([list, '</div>'].join(''));

            if (_this.find('option').length) {
                $('.customSelectBoxListWrapper').addClass(_this.attr('class'));
                $('.customSelectBoxListWrapper ul li').click(function () {
                    _this.find('option').eq($(this).index()).attr('selected', 'selected');
                });
            }
            events();
        });
    }
}(jQuery));

//============ After Ajax

(function ($) {
    $.fn.handleSubmit = (function () {
        var afterAjaxCall;
        return {
            afterAjax: function (funcCallBack) {
                afterAjaxCall = funcCallBack;
            },
            submitted: function (data) {
            	if (afterAjaxCall !== undefined) {
            		afterAjaxCall(data);
            	}
            }
        };
    }());
}(jQuery));


/*
 * YOUTUBE PLUGIN SEARCH VIDEOS AND ADD THEM, WARNING! Twitter api needed
 *
 **/


(function ($) {
    $.fn.youtubeSelector = function ( options ) {
        var defaults, options, output, app_utils;
        app_utils = {
		    formString: function (str) {
		        return str.replace(/^\s*|\s*$/g,'');
		    },
		    mapArray: function (length, callback) {
		        var i = 0;
		        while (i < length) {
		            callback(i);
		            i += 1;
		        }
		    }
		}
        defaults = {
            results: 5,
            allowed: 1,
            label: 'Find a YouTube video',
            noResults: "Geen video's gevonden",
            dropBoxLabel: "Drag and drop video's here!"
        }
        options = $.extend(defaults, options)

        this.each(function () {
            var selector, events, loadBar, typeTimer, doneTyping, afterLoading, _this = $(this);
            var selector, events, loadBar, typeTimer, doneTyping, afterLoading, _this = $(this);

            $('<div class="youtubeVideoSelector wrapper"><div class="youtubeVideoSearcher"><input type="text" value="' + options.label + '" name="youtubeSelector" /></div><div class="yourVideoSelectorResults"></div><div class="youtubeVideoDropBox"><div class="dropBox"><h3>' + options.dropBoxLabel + '</h3></div></div></div>').insertBefore(this);
            selector = $(this).parent().find('.youtubeVideoSelector');
            loadBar = '<a class="youtubeCancelBtn search" href="#"><i class="icon-remove"></i></a><div class="progress progress-succes progress-striped active"> <div class="loader""></div></div>';
            $(this).hide();

            selector.prepend(loadBar);


            events = (function () {
                selector.find('input').focus(function () {
                    if (options.label === $(this).val()) {
                        $(this).val('');
                    }
                });
                selector.find('input').blur(function () {
                    if (!$(this).val().length) {
                        $(this).val(options.label);
                    }
                });

                selector.find('input').keyup(function () {
                    selector.find('.progress').show();
                    selector.find('.youtubeCancelBtn').show();
 					if (typeTimer !== undefined) {
						clearTimeout(typeTimer);
					}
                    typeTimer = setTimeout(doneTyping($(this).val()), 1000);
                });
                selector.find('.youtubeCancelBtn').click(function () {
                    selector.find('input').val('');
                    selector.find('input').focus();
                    $(this).hide();
                    if (selector.find('.yourVideoSelectorResults ul').length) {
                        selector.find('.yourVideoSelectorResults ul').html('');
                        selector.find('.yourVideoSelectorResults').hide();
                    }
                    return false;
                });

            }());

            afterLoading = function () {
                var htmlDragged = {}, recycleIcon;
                selector.find('.yourVideoSelectorResults ul li').draggable({
                    revert: "invalid",
                    cursor: "move",
                    helper: "clone",
                    stop: function( event, ui ) {
                       htmlDragged.image = $(this);
                       htmlDragged.src = $(this).find('img').attr('alt');
                    }
                });
                selector.find('.dropBox').droppable({
                    accept: selector.find('.yourVideoSelectorResults ul li'),
                    activeClass: "ui-state-hover",
                    drop: function( event, ui ) {
                        var draggable, vidURL = $(ui.draggable).find('img').attr('alt').split('?')[0];
                        vidURL = vidURL.split('/')[vidURL.split('/').length - 1];
                        $(this).addClass( "ui-state-highlight" );
                        draggable = $(ui.draggable);
                        $(ui.draggable).hide();
                        $(ui.draggable).appendTo(selector.find('.dropBox'));
                        if (selector.find('.dropBox h3').length) {
                            selector.find('.dropBox h3').remove();
                        }
                        if (options.allowed) {
                        	if (selector.find('.dropBox div.videos').length < options.allowed) {
                        		selector.find('.dropBox').prepend('<div class="videos"><iframe width="180" height="110" src="http://www.youtube.com/embed/' + vidURL + '" frameborder="0" allowfullscreen></iframe><div class="toolbar"><a class="youtubeCancelBtn frame" href="#"><i class="icon-remove"></i></a></div></div>');
                       	 	} else {
                       	 		recycleIcon( $(ui.draggable) );
                       	 	}
                        } else {
                        	selector.find('.dropBox').prepend('<div class="videos"><iframe width="180" height="110" src="http://www.youtube.com/embed/' + vidURL + '" frameborder="0" allowfullscreen></iframe><div class="toolbar"><a class="youtubeCancelBtn frame"  href="#"><i class="icon-remove"></i></a></div></div>');
                        }
                        _this.val(vidURL);


                        selector.find('.dropBox a').click(function () {
                            recycleIcon( $(ui.draggable) );
                            $(this).closest('.videos').remove();
                            if (!selector.find('.dropBox').html().length) {
                                selector.find('.dropBox').html('<h3>' + options.dropBoxLabel + '</h3>');
                            }
                            return false;
                        });
                    }
                });

                recycleIcon = function ( $item ) {
                    $item.fadeOut(function() {
                        $item.show()
                        .appendTo( selector.find('.yourVideoSelectorResults ul'))
                        .fadeIn();
                    });
                };

            };

            doneTyping = function (query) {

                $.getJSON("http://gdata.youtube.com/feeds/api/videos/?q=" + query + "&max-results=" + options.results + "&v=2&alt=json-in-script&callback=?", function (data) {
                    var feeds = data.feed.entry, list = "";
                    selector.find('.progress').hide();
                    if (app_utils.formString(query).length) {
                        selector.find('.close').show();
                        selector.find('.yourVideoSelectorResults').html('<ul></ul>');
                        app_utils.mapArray(feeds.length, function (i) {
                            list += '<li><img src="' + feeds[i].content.src.split('?')[0].replace('www', 'img').replace('/v/', '/vi/') +  '/1.jpg" alt="' + feeds[i].content.src + '"/></li>';
                        });
                        selector.find('.yourVideoSelectorResults').show();
                    } else {
                        selector.find('.yourVideoSelectorResults').hide();
                        selector.find('.close').hide();
                        list = '<li>' + options.noResults + '</li>';
                    }
                    selector.find('.yourVideoSelectorResults ul').html('').append(list);
                    afterLoading();

                });

            };



        });
    }
}(jQuery));

//============ Custom scrollBar

(function ($) {
	$.fn.customScrollbar= function (options) {
		var defaults;
		defaults = {
			onScrollStop: function () {},
			onScrollStart: function () {},
			ownStyles: false,
			widthBtn: 30,
			heightBtn: 60,
			incrementScroll: 30,
			animated: false
		};
		options = $.extend(defaults,options);
		this.each(function () {
			var _this = $(this), changeHeightScrollBar, scrollPane, trackHeight, scrollBarBtn, offsetY, scrollBar, wheelTracker = 0, moveScrollBar, removePX, timerBody, afterEvent;
			_this.css({overflow: 'hidden', position: 'relative'});
			_this.html(['<div class="scrollContentWrapper">', _this.html() ,'</div>'].join(''));
			_this.append('<div class="customscrollBar"><button class="customScrollBarButton"></button></div>');

			/*
				style your own
			*/
			if (!options.ownStyles) {
				_this.find('.customScrollBarButton')
				.css({background: '#CCC', position: 'absolute', cursor: 'pointer', right:  0, top: 0, width: options.widthBtn, height: options.heightBtn  });
				_this.find('.customScrollBarButton')
				.css({background: '#CCC'});
				_this.find('.customscrollBar').height(_this.height()).css({background: '#999', width: options.widthBtn, position: 'absolute', right:  0, top: 0, zIndex: 2000});
			}
			/*
				Only absolute positioning
			*/
			_this.find('.customscrollBar').height(_this.height()).css({ position: 'absolute', width: options.widthBtn, right:  0, top: 0, zIndex: 2000});
			_this.find('.customScrollBarButton').css({position: 'absolute', width: options.widthBtn, height: options.heightBtn, cursor: 'pointer', right:  0, top: 0 });
			_this.find('.scrollContentWrapper').css({ position: 'absolute', left: 0, top: 0 });

			scrollBarBtn = _this.find('.customScrollBarButton');
			scrollBar = _this.find('.customscrollBar');
			scrollPane = _this.find('.scrollContentWrapper');

			removePX = function (stringData) {
				return Number(stringData.replace('px', ''));
			};
			changeHeightScrollBar = function () {
				_this.find('.customscrollBar').height(_this.height());
				trackHeight = scrollBar.height() - scrollBarBtn.height();
			};
			moveScrollBar = function (e) {
				var offsetWrapY = e.pageY - _this.offset().top, scrollY, scrollPaneY,
				scrollBtnY = removePX(scrollBarBtn.css('top'));
				scrollY = offsetWrapY - offsetY;
				scrollBarBtn.css({top: scrollY});
				if (removePX(scrollBarBtn.css('top')) <= 0) {
					scrollBarBtn.css({top: 0});
				}
				if (removePX(scrollBarBtn.css('top')) >= trackHeight) {
					scrollBarBtn.css({top: trackHeight});
				}
				scrollPaneY = scrollBtnY / trackHeight;

				if (options.animated) {
					scrollPane.stop().animate({ top: (-scrollPaneY * ( scrollPane.height() - _this.height() )) }, 500);
				} else {
					scrollPane.css({ top: (-scrollPaneY * ( scrollPane.height() - _this.height() ))});
				}
			};

			afterEvent = function (e) {
				_this.unbind('mousemove', moveScrollBar);
				//$('body').css({ overflow: 'auto'});

				wheelTracker = removePX(scrollBarBtn.css('top'));
				e.preventDefault;
			};

			_this.bind('mousewheel', function(e, delta) {
				var offsetWrapY = removePX(scrollBarBtn.css('top'));
				offsetY = removePX(scrollBarBtn.css('top'));

				if (delta > 0) {
					wheelTracker = wheelTracker > 0 ? wheelTracker - options.incrementScroll : 0;
				} else {
					wheelTracker = wheelTracker < (trackHeight * 2) ? wheelTracker + options.incrementScroll : (trackHeight * 2);
				}
				//$('body').css({ overflow: 'hidden'});
				clearTimeout(timerBody);
				timerBody = setTimeout(afterEvent, 500, e);
			    moveScrollBar({ pageY: wheelTracker + _this.offset().top });
			});

			scrollBarBtn.mousedown(function (e) {
				var offsetWrapY = e.pageY - _this.offset().top;
				offsetY = offsetWrapY - removePX($(this).css('top'));
				$('body').mousemove(moveScrollBar);
				//$('body').css({ overflow: 'hidden'});
			});

			scrollBarBtn.live('mouseup', function (e) {
				afterEvent(e);
			});
			$('body').live('mouseleave mouseup', function (e) {
				afterEvent(e);
			});

			$(window).resize(changeHeightScrollBar);
			changeHeightScrollBar();
		});
	}
}(jQuery));



/*! Copyright (c) 2010 Brandon Aaron (http://brandonaaron.net)
 * Licensed under the MIT License (LICENSE.txt).
 *
 * Version 1.1
 */

(function($) {
$.fn.overlaps = function(selector, options) {
    var defaults;

    if (arguments.length === 0) {
        return this.pushStack(filterOverlaps(this));
    }
    // otherwise compare selected elements against passed eleemnts
    else {
        return isOverlapping(this, $(selector));
    }

    function filterOverlaps(collection) {
        var dims   = getDims(collection),
            stack  = [],
            index1 = 0,
            index2 = 0,
            length = dims.length;

        for (; index1 < length; index1++) {
            for (index2 = 0; index2 < length; index2++) {
                if (index1 === index2) {
                    continue;
                }
                if (checkOverlap(dims[index1], dims[index2])) {
                    stack.push(collection[index2]);
                }
            }
        }

        return $.unique(stack);
    }

    function isOverlapping(collection1, collection2) {
        var dims1   = getDims(collection1),
            dims2   = getDims(collection2),
            index1  = 0,
            index2  = 0,
            length1 = dims1.length,
            length2 = dims2.length;

        for (; index1 < length1; index1++) {
            for (index2 = 0; index2 < length2; index2++) {
                if (collection1[index1] === collection2[index2]) {
                    continue;
                }
                if (checkOverlap(dims1[index1], dims2[index2])) {
                    return true;
                }
            }
        }

        return false;
    }

    function getDims(elems) {
        var dims = [], i = 0, offset, elem;

        while ((elem = elems[i++])) {
            offset = $(elem).offset();
            dims.push([
                offset.top,
                offset.left,
                elem.offsetWidth,
                elem.offsetHeight
            ]);
        }

        return dims;
    }

    function checkOverlap(dims1, dims2) {
        var x1 = dims1[1] + options.contract, y1 = dims1[0] + options.contract,
            w1 = dims1[2] + options.contract, h1 = dims1[3] + options.contract,
            x2 = dims2[1] + options.contract, y2 = dims2[0] + options.contract,
            w2 = dims2[2] + options.contract, h2 = dims2[3] + options.contract;
        return !(y2 + h2 < y1 || y1 + h1 < y2 || x2 + w2 < x1 || x1 + w1 < x2);
    }


    $.expr[':'].overlaps = function(elem, i, m, array) {
        return isOverlapping([elem], array);
    };
    $.expr[':'].overlapping = $.expr[':'].overlaps;

};



})(jQuery);



/*
 In-Field Label jQuery Plugin
 http://fuelyourcoding.com/scripts/infield.html

 Copyright (c) 2009 Doug Neiner
 Dual licensed under the MIT and GPL licenses.
 Uses the same license as jQuery, see:
 http://docs.jquery.com/License

*/
(function(d){d.InFieldLabels=function(e,b,f){var a=this;a.$label=d(e);a.label=e;a.$field=d(b);a.field=b;a.$label.data("InFieldLabels",a);a.showing=true;a.init=function(){a.options=d.extend({},d.InFieldLabels.defaultOptions,f);if(a.$field.val()!==""){a.$label.hide();a.showing=false}a.$field.focus(function(){a.fadeOnFocus()}).blur(function(){a.checkForEmpty(true)}).bind("keydown.infieldlabel",function(c){a.hideOnChange(c)}).bind("paste",function(){a.setOpacity(0)}).change(function(){a.checkForEmpty()}).bind("onPropertyChange",
function(){a.checkForEmpty()})};a.fadeOnFocus=function(){a.showing&&a.setOpacity(a.options.fadeOpacity)};a.setOpacity=function(c){a.$label.stop().animate({opacity:c},a.options.fadeDuration);a.showing=c>0};a.checkForEmpty=function(c){if(a.$field.val()===""){a.prepForShow();a.setOpacity(c?1:a.options.fadeOpacity)}else a.setOpacity(0)};a.prepForShow=function(){if(!a.showing){a.$label.css({opacity:0}).show();a.$field.bind("keydown.infieldlabel",function(c){a.hideOnChange(c)})}};a.hideOnChange=function(c){if(!(c.keyCode===
16||c.keyCode===9)){if(a.showing){a.$label.hide();a.showing=false}a.$field.unbind("keydown.infieldlabel")}};a.init()};d.InFieldLabels.defaultOptions={fadeOpacity:0.5,fadeDuration:300};d.fn.inFieldLabels=function(e){return this.each(function(){var b=d(this).attr("for");if(b){b=d("input#"+b+"[type='text'],input#"+b+"[type='search'],input#"+b+"[type='tel'],input#"+b+"[type='url'],input#"+b+"[type='email'],input#"+b+"[type='password'],textarea#"+b);b.length!==0&&new d.InFieldLabels(this,b[0],e)}})}})(jQuery);




/*
 * jScrollPane - v2.0.0beta12 - 2012-06-21
 * http://jscrollpane.kelvinluck.com/
 *
 * Copyright (c) 2010 Kelvin Luck
 * Dual licensed under the MIT and GPL licenses.
 */
(function(b,a,c){b.fn.jScrollPane=function(e){ function d(D,O){var ay,Q=this,Y,aj,v,al,T,Z,y,q,az,aE,au,i,I,h,j,aa,U,ap,X,t,A,aq,af,am,G,l,at,ax,x,av,aH,f,L,ai=true,P=true,aG=false,k=false,ao=D.clone(false,false).empty(),ac=b.fn.mwheelIntent?"mwheelIntent.jsp":"mousewheel.jsp";aH=D.css("paddingTop")+" "+D.css("paddingRight")+" "+D.css("paddingBottom")+" "+D.css("paddingLeft");f=(parseInt(D.css("paddingLeft"),10)||0)+(parseInt(D.css("paddingRight"),10)||0);function ar(aQ){var aL,aN,aM,aJ,aI,aP,aO=false,aK=false;ay=aQ;if(Y===c){aI=D.scrollTop();aP=D.scrollLeft();D.css({overflow:"hidden",padding:0});aj=D.innerWidth()+f;v=D.innerHeight();D.width(aj);Y=b('<div class="jspPane" />').css("padding",aH).append(D.children());al=b('<div class="jspContainer" />').css({width:aj+"px",height:v+"px"}).append(Y).appendTo(D)}else{D.css("width","");aO=ay.stickToBottom&&K();aK=ay.stickToRight&&B();aJ=D.innerWidth()+f!=aj||D.outerHeight()!=v;if(aJ){aj=D.innerWidth()+f;v=D.innerHeight();al.css({width:aj+"px",height:v+"px"})}if(!aJ&&L==T&&Y.outerHeight()==Z){D.width(aj);return}L=T;Y.css("width","");D.width(aj);al.find(">.jspVerticalBar,>.jspHorizontalBar").remove().end()}Y.css("overflow","auto");if(aQ.contentWidth){T=aQ.contentWidth}else{T=Y[0].scrollWidth}Z=Y[0].scrollHeight;Y.css("overflow","");y=T/aj;q=Z/v;az=q>1;aE=y>1;if(!(aE||az)){D.removeClass("jspScrollable");Y.css({top:0,width:al.width()-f});n();E();R();w()}else{D.addClass("jspScrollable");aL=ay.maintainPosition&&(I||aa);if(aL){aN=aC();aM=aA()}aF();z();F();if(aL){N(aK?(T-aj):aN,false);M(aO?(Z-v):aM,false)}J();ag();an();if(ay.enableKeyboardNavigation){S()}if(ay.clickOnTrack){p()}C();if(ay.hijackInternalLinks){m()}}if(ay.autoReinitialise&&!av){av=setInterval(function(){ar(ay)},ay.autoReinitialiseDelay)}else{if(!ay.autoReinitialise&&av){clearInterval(av)}}aI&&D.scrollTop(0)&&M(aI,false);aP&&D.scrollLeft(0)&&N(aP,false);D.trigger("jsp-initialised",[aE||az])}function aF(){if(az){al.append(b('<div class="jspVerticalBar" />').append(b('<div class="jspCap jspCapTop" />'),b('<div class="jspTrack" />').append(b('<div class="jspDrag" />').append(b('<div class="jspDragTop" />'),b('<div class="jspDragBottom" />'))),b('<div class="jspCap jspCapBottom" />')));U=al.find(">.jspVerticalBar");ap=U.find(">.jspTrack");au=ap.find(">.jspDrag");if(ay.showArrows){aq=b('<a class="jspArrow jspArrowUp" />').bind("mousedown.jsp",aD(0,-1)).bind("click.jsp",aB);af=b('<a class="jspArrow jspArrowDown" />').bind("mousedown.jsp",aD(0,1)).bind("click.jsp",aB);if(ay.arrowScrollOnHover){aq.bind("mouseover.jsp",aD(0,-1,aq));af.bind("mouseover.jsp",aD(0,1,af))}ak(ap,ay.verticalArrowPositions,aq,af)}t=v;al.find(">.jspVerticalBar>.jspCap:visible,>.jspVerticalBar>.jspArrow").each(function(){t-=b(this).outerHeight()});au.hover(function(){au.addClass("jspHover")},function(){au.removeClass("jspHover")}).bind("mousedown.jsp",function(aI){b("html").bind("dragstart.jsp selectstart.jsp",aB);au.addClass("jspActive");var s=aI.pageY-au.position().top;b("html").bind("mousemove.jsp",function(aJ){V(aJ.pageY-s,false)}).bind("mouseup.jsp mouseleave.jsp",aw);return false});o()}}function o(){ap.height(t+"px");I=0;X=ay.verticalGutter+ap.outerWidth();Y.width(aj-X-f);try{if(U.position().left===0){Y.css("margin-left",X+"px")}}catch(s){}}function z(){if(aE){al.append(b('<div class="jspHorizontalBar" />').append(b('<div class="jspCap jspCapLeft" />'),b('<div class="jspTrack" />').append(b('<div class="jspDrag" />').append(b('<div class="jspDragLeft" />'),b('<div class="jspDragRight" />'))),b('<div class="jspCap jspCapRight" />')));am=al.find(">.jspHorizontalBar");G=am.find(">.jspTrack");h=G.find(">.jspDrag");if(ay.showArrows){ax=b('<a class="jspArrow jspArrowLeft" />').bind("mousedown.jsp",aD(-1,0)).bind("click.jsp",aB);x=b('<a class="jspArrow jspArrowRight" />').bind("mousedown.jsp",aD(1,0)).bind("click.jsp",aB);
if(ay.arrowScrollOnHover){ax.bind("mouseover.jsp",aD(-1,0,ax));x.bind("mouseover.jsp",aD(1,0,x))}ak(G,ay.horizontalArrowPositions,ax,x)}h.hover(function(){h.addClass("jspHover")},function(){h.removeClass("jspHover")}).bind("mousedown.jsp",function(aI){b("html").bind("dragstart.jsp selectstart.jsp",aB);h.addClass("jspActive");var s=aI.pageX-h.position().left;b("html").bind("mousemove.jsp",function(aJ){W(aJ.pageX-s,false)}).bind("mouseup.jsp mouseleave.jsp",aw);return false});l=al.innerWidth();ah()}}function ah(){al.find(">.jspHorizontalBar>.jspCap:visible,>.jspHorizontalBar>.jspArrow").each(function(){l-=b(this).outerWidth()});G.width(l+"px");aa=0}function F(){if(aE&&az){var aI=G.outerHeight(),s=ap.outerWidth();t-=aI;b(am).find(">.jspCap:visible,>.jspArrow").each(function(){l+=b(this).outerWidth()});l-=s;v-=s;aj-=aI;G.parent().append(b('<div class="jspCorner" />').css("width",aI+"px"));o();ah()}if(aE){Y.width((al.outerWidth()-f)+"px")}Z=Y.outerHeight();q=Z/v;if(aE){at=Math.ceil(1/y*l);if(at>ay.horizontalDragMaxWidth){at=ay.horizontalDragMaxWidth}else{if(at<ay.horizontalDragMinWidth){at=ay.horizontalDragMinWidth}}h.width(at+"px");j=l-at;ae(aa)}if(az){A=Math.ceil(1/q*t);if(A>ay.verticalDragMaxHeight){A=ay.verticalDragMaxHeight}else{if(A<ay.verticalDragMinHeight){A=ay.verticalDragMinHeight}}au.height(A+"px");i=t-A;ad(I)}}function ak(aJ,aL,aI,s){var aN="before",aK="after",aM;if(aL=="os"){aL=/Mac/.test(navigator.platform)?"after":"split"}if(aL==aN){aK=aL}else{if(aL==aK){aN=aL;aM=aI;aI=s;s=aM}}aJ[aN](aI)[aK](s)}function aD(aI,s,aJ){return function(){H(aI,s,this,aJ);this.blur();return false}}function H(aL,aK,aO,aN){aO=b(aO).addClass("jspActive");var aM,aJ,aI=true,s=function(){if(aL!==0){Q.scrollByX(aL*ay.arrowButtonSpeed)}if(aK!==0){Q.scrollByY(aK*ay.arrowButtonSpeed)}aJ=setTimeout(s,aI?ay.initialDelay:ay.arrowRepeatFreq);aI=false};s();aM=aN?"mouseout.jsp":"mouseup.jsp";aN=aN||b("html");aN.bind(aM,function(){aO.removeClass("jspActive");aJ&&clearTimeout(aJ);aJ=null;aN.unbind(aM)})}function p(){w();if(az){ap.bind("mousedown.jsp",function(aN){if(aN.originalTarget===c||aN.originalTarget==aN.currentTarget){var aL=b(this),aO=aL.offset(),aM=aN.pageY-aO.top-I,aJ,aI=true,s=function(){var aR=aL.offset(),aS=aN.pageY-aR.top-A/2,aP=v*ay.scrollPagePercent,aQ=i*aP/(Z-v);if(aM<0){if(I-aQ>aS){Q.scrollByY(-aP)}else{V(aS)}}else{if(aM>0){if(I+aQ<aS){Q.scrollByY(aP)}else{V(aS)}}else{aK();return}}aJ=setTimeout(s,aI?ay.initialDelay:ay.trackClickRepeatFreq);aI=false},aK=function(){aJ&&clearTimeout(aJ);aJ=null;b(document).unbind("mouseup.jsp",aK)};s();b(document).bind("mouseup.jsp",aK);return false}})}if(aE){G.bind("mousedown.jsp",function(aN){if(aN.originalTarget===c||aN.originalTarget==aN.currentTarget){var aL=b(this),aO=aL.offset(),aM=aN.pageX-aO.left-aa,aJ,aI=true,s=function(){var aR=aL.offset(),aS=aN.pageX-aR.left-at/2,aP=aj*ay.scrollPagePercent,aQ=j*aP/(T-aj);if(aM<0){if(aa-aQ>aS){Q.scrollByX(-aP)}else{W(aS)}}else{if(aM>0){if(aa+aQ<aS){Q.scrollByX(aP)}else{W(aS)}}else{aK();return}}aJ=setTimeout(s,aI?ay.initialDelay:ay.trackClickRepeatFreq);aI=false},aK=function(){aJ&&clearTimeout(aJ);aJ=null;b(document).unbind("mouseup.jsp",aK)};s();b(document).bind("mouseup.jsp",aK);return false}})}}function w(){if(G){G.unbind("mousedown.jsp")}if(ap){ap.unbind("mousedown.jsp")}}function aw(){b("html").unbind("dragstart.jsp selectstart.jsp mousemove.jsp mouseup.jsp mouseleave.jsp");if(au){au.removeClass("jspActive")}if(h){h.removeClass("jspActive")}}function V(s,aI){if(!az){return}if(s<0){s=0}else{if(s>i){s=i}}if(aI===c){aI=ay.animateScroll}if(aI){Q.animate(au,"top",s,ad)}else{au.css("top",s);ad(s)}}function ad(aI){if(aI===c){aI=au.position().top}al.scrollTop(0);I=aI;var aL=I===0,aJ=I==i,aK=aI/i,s=-aK*(Z-v);if(ai!=aL||aG!=aJ){ai=aL;aG=aJ;D.trigger("jsp-arrow-change",[ai,aG,P,k])}u(aL,aJ);Y.css("top",s);D.trigger("jsp-scroll-y",[-s,aL,aJ]).trigger("scroll")}function W(aI,s){if(!aE){return}if(aI<0){aI=0}else{if(aI>j){aI=j}}if(s===c){s=ay.animateScroll}if(s){Q.animate(h,"left",aI,ae)
}else{h.css("left",aI);ae(aI)}}function ae(aI){if(aI===c){aI=h.position().left}al.scrollTop(0);aa=aI;var aL=aa===0,aK=aa==j,aJ=aI/j,s=-aJ*(T-aj);if(P!=aL||k!=aK){P=aL;k=aK;D.trigger("jsp-arrow-change",[ai,aG,P,k])}r(aL,aK);Y.css("left",s);D.trigger("jsp-scroll-x",[-s,aL,aK]).trigger("scroll")}function u(aI,s){if(ay.showArrows){aq[aI?"addClass":"removeClass"]("jspDisabled");af[s?"addClass":"removeClass"]("jspDisabled")}}function r(aI,s){if(ay.showArrows){ax[aI?"addClass":"removeClass"]("jspDisabled");x[s?"addClass":"removeClass"]("jspDisabled")}}function M(s,aI){var aJ=s/(Z-v);V(aJ*i,aI)}function N(aI,s){var aJ=aI/(T-aj);W(aJ*j,s)}function ab(aV,aQ,aJ){var aN,aK,aL,s=0,aU=0,aI,aP,aO,aS,aR,aT;try{aN=b(aV)}catch(aM){return}aK=aN.outerHeight();aL=aN.outerWidth();al.scrollTop(0);al.scrollLeft(0);while(!aN.is(".jspPane")){s+=aN.position().top;aU+=aN.position().left;aN=aN.offsetParent();if(/^body|html$/i.test(aN[0].nodeName)){return}}aI=aA();aO=aI+v;if(s<aI||aQ){aR=s-ay.verticalGutter}else{if(s+aK>aO){aR=s-v+aK+ay.verticalGutter}}if(aR){M(aR,aJ)}aP=aC();aS=aP+aj;if(aU<aP||aQ){aT=aU-ay.horizontalGutter}else{if(aU+aL>aS){aT=aU-aj+aL+ay.horizontalGutter}}if(aT){N(aT,aJ)}}function aC(){return -Y.position().left}function aA(){return -Y.position().top}function K(){var s=Z-v;return(s>20)&&(s-aA()<10)}function B(){var s=T-aj;return(s>20)&&(s-aC()<10)}function ag(){al.unbind(ac).bind(ac,function(aL,aM,aK,aI){var aJ=aa,s=I;Q.scrollBy(aK*ay.mouseWheelSpeed,-aI*ay.mouseWheelSpeed,false);return aJ==aa&&s==I})}function n(){al.unbind(ac)}function aB(){return false}function J(){Y.find(":input,a").unbind("focus.jsp").bind("focus.jsp",function(s){ab(s.target,false)})}function E(){Y.find(":input,a").unbind("focus.jsp")}function S(){var s,aI,aK=[];aE&&aK.push(am[0]);az&&aK.push(U[0]);Y.focus(function(){D.focus()});D.attr("tabindex",0).unbind("keydown.jsp keypress.jsp").bind("keydown.jsp",function(aN){if(aN.target!==this&&!(aK.length&&b(aN.target).closest(aK).length)){return}var aM=aa,aL=I;switch(aN.keyCode){case 40:case 38:case 34:case 32:case 33:case 39:case 37:s=aN.keyCode;aJ();break;case 35:M(Z-v);s=null;break;case 36:M(0);s=null;break}aI=aN.keyCode==s&&aM!=aa||aL!=I;return !aI}).bind("keypress.jsp",function(aL){if(aL.keyCode==s){aJ()}return !aI});if(ay.hideFocus){D.css("outline","none");if("hideFocus" in al[0]){D.attr("hideFocus",true)}}else{D.css("outline","");if("hideFocus" in al[0]){D.attr("hideFocus",false)}}function aJ(){var aM=aa,aL=I;switch(s){case 40:Q.scrollByY(ay.keyboardSpeed,false);break;case 38:Q.scrollByY(-ay.keyboardSpeed,false);break;case 34:case 32:Q.scrollByY(v*ay.scrollPagePercent,false);break;case 33:Q.scrollByY(-v*ay.scrollPagePercent,false);break;case 39:Q.scrollByX(ay.keyboardSpeed,false);break;case 37:Q.scrollByX(-ay.keyboardSpeed,false);break}aI=aM!=aa||aL!=I;return aI}}function R(){D.attr("tabindex","-1").removeAttr("tabindex").unbind("keydown.jsp keypress.jsp")}function C(){if(location.hash&&location.hash.length>1){var aK,aI,aJ=escape(location.hash.substr(1));try{aK=b("#"+aJ+', a[name="'+aJ+'"]')}catch(s){return}if(aK.length&&Y.find(aJ)){if(al.scrollTop()===0){aI=setInterval(function(){if(al.scrollTop()>0){ab(aK,true);b(document).scrollTop(al.position().top);clearInterval(aI)}},50)}else{ab(aK,true);b(document).scrollTop(al.position().top)}}}}function m(){if(b(document.body).data("jspHijack")){return}b(document.body).data("jspHijack",true);b(document.body).delegate("a[href*=#]","click",function(s){var aI=this.href.substr(0,this.href.indexOf("#")),aK=location.href,aO,aP,aJ,aM,aL,aN;if(location.href.indexOf("#")!==-1){aK=location.href.substr(0,location.href.indexOf("#"))}if(aI!==aK){return}aO=escape(this.href.substr(this.href.indexOf("#")+1));aP;try{aP=b("#"+aO+', a[name="'+aO+'"]')}catch(aQ){return}if(!aP.length){return}aJ=aP.closest(".jspScrollable");aM=aJ.data("jsp");aM.scrollToElement(aP,true);if(aJ[0].scrollIntoView){aL=b(a).scrollTop();aN=aP.offset().top;if(aN<aL||aN>aL+b(a).height()){aJ[0].scrollIntoView()}}s.preventDefault()
})}function an(){var aJ,aI,aL,aK,aM,s=false;al.unbind("touchstart.jsp touchmove.jsp touchend.jsp click.jsp-touchclick").bind("touchstart.jsp",function(aN){var aO=aN.originalEvent.touches[0];aJ=aC();aI=aA();aL=aO.pageX;aK=aO.pageY;aM=false;s=true}).bind("touchmove.jsp",function(aQ){if(!s){return}var aP=aQ.originalEvent.touches[0],aO=aa,aN=I;Q.scrollTo(aJ+aL-aP.pageX,aI+aK-aP.pageY);aM=aM||Math.abs(aL-aP.pageX)>5||Math.abs(aK-aP.pageY)>5;return aO==aa&&aN==I}).bind("touchend.jsp",function(aN){s=false}).bind("click.jsp-touchclick",function(aN){if(aM){aM=false;return false}})}function g(){var s=aA(),aI=aC();D.removeClass("jspScrollable").unbind(".jsp");D.replaceWith(ao.append(Y.children()));ao.scrollTop(s);ao.scrollLeft(aI);if(av){clearInterval(av)}}b.extend(Q,{reinitialise:function(aI){aI=b.extend({},ay,aI);ar(aI)},scrollToElement:function(aJ,aI,s){ab(aJ,aI,s)},scrollTo:function(aJ,s,aI){N(aJ,aI);M(s,aI)},scrollToX:function(aI,s){N(aI,s)},scrollToY:function(s,aI){M(s,aI)},scrollToPercentX:function(aI,s){N(aI*(T-aj),s)},scrollToPercentY:function(aI,s){M(aI*(Z-v),s)},scrollBy:function(aI,s,aJ){Q.scrollByX(aI,aJ);Q.scrollByY(s,aJ)},scrollByX:function(s,aJ){var aI=aC()+Math[s<0?"floor":"ceil"](s),aK=aI/(T-aj);W(aK*j,aJ)},scrollByY:function(s,aJ){var aI=aA()+Math[s<0?"floor":"ceil"](s),aK=aI/(Z-v);V(aK*i,aJ)},positionDragX:function(s,aI){W(s,aI)},positionDragY:function(aI,s){V(aI,s)},animate:function(aI,aL,s,aK){var aJ={};aJ[aL]=s;aI.animate(aJ,{duration:ay.animateDuration,easing:ay.animateEase,queue:false,step:aK})},getContentPositionX:function(){return aC()},getContentPositionY:function(){return aA()},getContentWidth:function(){return T},getContentHeight:function(){return Z},getPercentScrolledX:function(){return aC()/(T-aj)},getPercentScrolledY:function(){return aA()/(Z-v)},getIsScrollableH:function(){return aE},getIsScrollableV:function(){return az},getContentPane:function(){return Y},scrollToBottom:function(s){V(i,s)},hijackInternalLinks:b.noop,destroy:function(){g()}});ar(O)}e=b.extend({},b.fn.jScrollPane.defaults,e);b.each(["mouseWheelSpeed","arrowButtonSpeed","trackClickSpeed","keyboardSpeed"],function(){e[this]=e[this]||e.speed});return this.each(function(){var f=b(this),g=f.data("jsp");if(g){g.reinitialise(e)}else{b("script",f).filter("[type=text/javascript],not([type])").remove();g=new d(f,e);f.data("jsp",g)}})};b.fn.jScrollPane.defaults={showArrows:false,maintainPosition:true,stickToBottom:false,stickToRight:false,clickOnTrack:true,autoReinitialise:false,autoReinitialiseDelay:500,verticalDragMinHeight:0,verticalDragMaxHeight:99999,horizontalDragMinWidth:0,horizontalDragMaxWidth:99999,contentWidth:c,animateScroll:false,animateDuration:300,animateEase:"linear",hijackInternalLinks:false,verticalGutter:4,horizontalGutter:4,mouseWheelSpeed:0,arrowButtonSpeed:0,arrowRepeatFreq:50,arrowScrollOnHover:false,trackClickSpeed:0,trackClickRepeatFreq:70,verticalArrowPositions:"split",horizontalArrowPositions:"split",enableKeyboardNavigation:true,hideFocus:false,keyboardSpeed:0,initialDelay:300,speed:30,scrollPagePercent:0.8}})(jQuery,this);

//============ Fix heights
(function($){
	$.fn.fixHeight=function(options){
		var heightWin,defaults;
		defaults={margin:0, toCompare: 'body',onresize:function(){}};
		heightWin=function(){return $(window).height();};
		options=$.extend(defaults,options);this.each(function(){
			var _this=$(this),resizeElement;
			resizeElement=function(){
				if (_this.height() > $(options.toCompare).height()) {
					$(options.toCompare).height(_this.height());
				} else {
					_this.css({ marginHeight: $(options.toCompare).height() + options.margin });
				}
			};
			$(window).resize(function(){
				resizeElement();
				options.onresize()
			});
			resizeElement();
		});
	};
}(jQuery));

/*! Copyright (c) 2011 Brandon Aaron (http://brandonaaron.net)
 * Licensed under the MIT License (LICENSE.txt).
 *
 * Thanks to: http://adomas.org/javascript-mouse-wheel/ for some pointers.
 * Thanks to: Mathias Bank(http://www.mathias-bank.de) for a scope bug fix.
 * Thanks to: Seamus Leahy for adding deltaX and deltaY
 *
 * Version: 3.0.6
 *
 * Requires: 1.2.2+
 */
(function(a){function d(b){var c=b||window.event,d=[].slice.call(arguments,1),e=0,f=!0,g=0,h=0;return b=a.event.fix(c),b.type="mousewheel",c.wheelDelta&&(e=c.wheelDelta/120),c.detail&&(e=-c.detail/3),h=e,c.axis!==undefined&&c.axis===c.HORIZONTAL_AXIS&&(h=0,g=-1*e),c.wheelDeltaY!==undefined&&(h=c.wheelDeltaY/120),c.wheelDeltaX!==undefined&&(g=-1*c.wheelDeltaX/120),d.unshift(b,e,g,h),(a.event.dispatch||a.event.handle).apply(this,d)}var b=["DOMMouseScroll","mousewheel"];if(a.event.fixHooks)for(var c=b.length;c;)a.event.fixHooks[b[--c]]=a.event.mouseHooks;a.event.special.mousewheel={setup:function(){if(this.addEventListener)for(var a=b.length;a;)this.addEventListener(b[--a],d,!1);else this.onmousewheel=d},teardown:function(){if(this.removeEventListener)for(var a=b.length;a;)this.removeEventListener(b[--a],d,!1);else this.onmousewheel=null}},a.fn.extend({mousewheel:function(a){return a?this.bind("mousewheel",a):this.trigger("mousewheel")},unmousewheel:function(a){return this.unbind("mousewheel",a)}})})(jQuery);


//============ Change the look of a checkbox or radio, WARNING! Twitter api needed
(function ($) {
    $.fn.customCheckboxes = function ( options ) {
        var defaults, options, output, checkedId = 0;

        defaults = {
            tip: true,
            onSelected: function () {},
            onDeselected: function () {},
            closest: false,
            iconType: 'icon-white',
            title: this.val(),
            animated: true,
            classPreffix: "pl"
        }
        options = $.extend(defaults, options)

        this.each(function () {
            var checked = $(this).attr('checked') === 'checked' ? 'checked' : '', makeElementChecked, changeElement,
            _this = $(this), height = 0, title = { title: options.title };
            checkBoxElem = $(this).attr('type') === 'checkbox' ? '<i class="icon-ok ' + options.iconType + '"></i>' : '';
            $(this).hide();
            $(this).parent().append('<span title="' + title.title + '" class="' + checked + ' ' + options.classPreffix + '_' + $(this).attr('type') + '_widget checkRadioBtnWrapper"><span class="btnCheckRadio">' + checkBoxElem + '</span></span>');
            height = _this.parent().find('.checkRadioBtnWrapper span').height();
            _this.parent().find('.checkRadioBtnWrapper span').hide();
            if (_this.is(':checked')) {
                _this.parent().find('.checkRadioBtnWrapper span').show();
            }
            if (options.tip) {
                _this.parent().find('.checkRadioBtnWrapper').tooltip(title);
            }


            makeElementChecked = function (thisElem) {
                thisElem.parent().find('input').attr('checked', 'checked');
                if (options.animated) {
                    $(thisElem).find('span').width(0).height(0).show()
                    .css({marginLeft: height / 2, marginTop: height / 2})
                    .animate({width: '100%', height: '100%', marginLeft: 0, marginTop: 0}, 200, function () {
                        thisElem.addClass('checked');
                    });
                } else {
                    $(thisElem).find('span').show();
                    thisElem.addClass('checked');
                }

            };

            removeElementChecked = function (thisElem) {
                $(thisElem).parent().find('input').attr('checked', '');
                if (options.animated) {
                    $(thisElem).find('span').stop()
                    .animate({width: 0, height: 0, marginLeft: height / 2, marginTop: height / 2}, 200, function () {
                         $(thisElem).removeClass('checked');
                    });
                } else {
                    $(thisElem).find('span').hide();
                    thisElem.removeClass('checked');
                }
            };

			changeElement = function () {
				btn = _this.parent().find('.checkRadioBtnWrapper');
				if (_this.attr('type') === 'radio') {
					if (options.closest) {
						removeElementChecked(_this.closest(options.closest).find('.checkRadioBtnWrapper'));
					} else {
						removeElementChecked(_this.parent().parent().find('.checkRadioBtnWrapper'));
					}
					options.onSelected();
				} else {
					if (btn.hasClass('checked')) {
						removeElementChecked(btn);
						options.onDeselected();
						return false;
					} else {
						options.onSelected();
					}
				}
				makeElementChecked(btn);
			};

            // Click event on the buttons
			if ($.browser.msie) {
				$(this).closest('label').click(function () {
					changeElement();
				});
			} else {
				$(this).click(function () {
					changeElement();
					makeElementChecked(_this);
				});
			}


        });
    }
}(jQuery));
/*! Stellar.js v0.3 | Copyright 2012, Mark Dalgleish | http://markdalgleish.com/projects/stellar.js | http://markdalgleish.mit-license.org */
(function(a,b,c,d){function l(b,c){this.element=b,this.options=a.extend({},f,c),this._defaults=f,this._name=e,this.init()}var e="stellar",f={scrollProperty:"scroll",positionProperty:"position",horizontalScrolling:!0,verticalScrolling:!0,horizontalOffset:0,verticalOffset:0,parallaxBackgrounds:!0,parallaxElements:!0,hideDistantElements:!0,viewportDetectionInterval:1e4,hideElement:function(a){a.hide()},showElement:function(a){a.show()}},g={scroll:{getTop:function(a){return a.scrollTop()},setTop:function(a,b){a.scrollTop(b)},getLeft:function(a){return a.scrollLeft()},setLeft:function(a,b){a.scrollLeft(b)}},position:{getTop:function(a){return parseInt(a.css("top"),10)*-1},setTop:function(a,b){a.css("top",b)},getLeft:function(a){return parseInt(a.css("left"),10)*-1},setLeft:function(a,b){a.css("left",b)}},margin:{getTop:function(a){return parseInt(a.css("margin-top"),10)*-1},setTop:function(a,b){a.css("margin-top",b)},getLeft:function(a){return parseInt(a.css("margin-left"),10)*-1},setLeft:function(a,b){a.css("margin-left",b)}},transform:{getTop:function(a){return a.css(i+"transform")!=="none"?parseInt(a.css(i+"transform").match(/(-?[0-9]+)/g)[5],10)*-1:0},setTop:function(a,b){j(a,b,"Y")},getLeft:function(a){return a.css(i+"transform")!=="none"?parseInt(a.css(i+"transform").match(/(-?[0-9]+)/g)[4],10)*-1:0},setLeft:function(a,b){j(a,b,"X")}}},h={position:{setTop:function(a,b){a.css("top",b)},setLeft:function(a,b){a.css("left",b)}},transform:{setTop:function(a,b,c){j(a,b-c,"Y")},setLeft:function(a,b,c){j(a,b-c,"X")}}},i=function(){var b="";return a.browser.webkit?b="-webkit-":a.browser.mozilla?b="-moz-":a.browser.opera?b="-o-":a.browser.msie&&(b="-ms-"),b}(),j=function(a,b,c){var d=a.css(i+"transform");d==="none"?a.css(i+"transform","translate"+c+"("+b+"px)"):a.css(i+"transform",k(d,/(-?[0-9]+[.]?[0-9]*)/g,c==="X"?5:6,b))},k=function(a,b,c,e){var f,g,h;return a.search(b)===-1?a:(f=a.split(b),h=c*2-1,f[h]===d?a:(f[h]=e,f.join("")))};l.prototype={init:function(){this.options.name=e+"_"+Math.floor(Math.random()*1e4),this._defineElements(),this._defineGetters(),this._defineSetters(),this.refresh(),this._startViewportDetectionLoop(),this._startAnimationLoop()},_defineElements:function(){this.element===c.body&&(this.element=b),this.$scrollElement=a(this.element),this.$element=this.element===b?a("body"):this.$scrollElement,this.$viewportElement=this.options.viewportElement!==d?a(this.options.viewportElement):this.$scrollElement[0]===b||this.options.scrollProperty.indexOf("scroll")===0?this.$scrollElement:this.$scrollElement.parent()},_defineGetters:function(){var a=this;this._getScrollLeft=function(){return g[a.options.scrollProperty].getLeft(a.$scrollElement)},this._getScrollTop=function(){return g[a.options.scrollProperty].getTop(a.$scrollElement)}},_defineSetters:function(){var a=this;this._setScrollLeft=function(b){g[a.options.scrollProperty].setLeft(a.$scrollElement,b)},this._setScrollTop=function(b){g[a.options.scrollProperty].setTop(a.$scrollElement,b)},this._setLeft=function(b,c,d){h[a.options.positionProperty].setLeft(b,c,d)},this._setTop=function(b,c,d){h[a.options.positionProperty].setTop(b,c,d)}},refresh:function(){var c=this,d=c._getScrollLeft(),e=c._getScrollTop();this._setScrollLeft(0),this._setScrollTop(0),this._setOffsets(),this._findParticles(),this._findBackgrounds(),navigator.userAgent.indexOf("WebKit")>0&&a(b).load(function(){var a=c._getScrollLeft(),b=c._getScrollTop();c._setScrollLeft(a+1),c._setScrollTop(b+1),c._setScrollLeft(a),c._setScrollTop(b)}),c._setScrollLeft(d),c._setScrollTop(e)},_findParticles:function(){var b=this,c=this._getScrollLeft(),e=this._getScrollTop();if(this.particles!==d)for(var f=this.particles.length-1;f>=0;f--)this.particles[f].$element.data("stellar-elementIsActive",d);this.particles=[];if(!this.options.parallaxElements)return;this.$element.find("[data-stellar-ratio]").each(function(c){var e=a(this),f,g,h,i,j,k,l,m,n,o=0,p=0,q=0,r=0;if(!e.data("stellar-elementIsActive"))e.data("stellar-elementIsActive",this);else if(e.data("stellar-elementIsActive")!==this)return;b.options.showElement(e),e.data("stellar-startingLeft")?(e.css("left",e.data("stellar-startingLeft")),e.css("top",e.data("stellar-startingTop"))):(e.data("stellar-startingLeft",e.css("left")),e.data("stellar-startingTop",e.css("top"))),h=e.position().left,i=e.position().top,j=e.css("margin-left")==="auto"?0:parseInt(e.css("margin-left"),10),k=e.css("margin-top")==="auto"?0:parseInt(e.css("margin-top"),10),m=e.offset().left-j,n=e.offset().top-k,e.parents().each(function(){var b=a(this);if(b.data("stellar-offset-parent")===!0)return o=q,p=r,l=b,!1;q+=b.position().left,r+=b.position().top}),f=e.data("stellar-horizontal-offset")!==d?e.data("stellar-horizontal-offset"):l!==d&&l.data("stellar-horizontal-offset")!==d?l.data("stellar-horizontal-offset"):b.horizontalOffset,g=e.data("stellar-vertical-offset")!==d?e.data("stellar-vertical-offset"):l!==d&&l.data("stellar-vertical-offset")!==d?l.data("stellar-vertical-offset"):b.verticalOffset,b.particles.push({$element:e,$offsetParent:l,isFixed:e.css("position")==="fixed",horizontalOffset:f,verticalOffset:g,startingPositionLeft:h,startingPositionTop:i,startingOffsetLeft:m,startingOffsetTop:n,parentOffsetLeft:o,parentOffsetTop:p,stellarRatio:e.data("stellar-ratio")!==d?e.data("stellar-ratio"):1,width:e.outerWidth(!0),height:e.outerHeight(!0),isHidden:!1})})},_findBackgrounds:function(){var b=this,c=this._getScrollLeft(),e=this._getScrollTop(),f;this.backgrounds=[];if(!this.options.parallaxBackgrounds)return;f=this.$element.find("[data-stellar-background-ratio]"),this.$element.is("[data-stellar-background-ratio]")&&f.add(this.$element),f.each(function(){var f=a(this),g=f.css("background-position").split(" "),h,i,j,k,l,m,n,o,p,q=0,r=0,s=0,t=0;if(!f.data("stellar-backgroundIsActive"))f.data("stellar-backgroundIsActive",this);else if(f.data("stellar-backgroundIsActive")!==this)return;f.data("stellar-backgroundStartingLeft")?f.css("background-position",f.data("stellar-backgroundStartingLeft")+" "+f.data("stellar-backgroundStartingTop")):(f.data("stellar-backgroundStartingLeft",g[0]),f.data("stellar-backgroundStartingTop",g[1])),l=f.css("margin-left")==="auto"?0:parseInt(f.css("margin-left"),10),m=f.css("margin-top")==="auto"?0:parseInt(f.css("margin-top"),10),n=f.offset().left-l-c,o=f.offset().top-m-e,f.parents().each(function(){var b=a(this);if(b.data("stellar-offset-parent")===!0)return q=s,r=t,p=b,!1;s+=b.position().left,t+=b.position().top}),h=f.data("stellar-horizontal-offset")!==d?f.data("stellar-horizontal-offset"):p!==d&&p.data("stellar-horizontal-offset")!==d?p.data("stellar-horizontal-offset"):b.horizontalOffset,i=f.data("stellar-vertical-offset")!==d?f.data("stellar-vertical-offset"):p!==d&&p.data("stellar-vertical-offset")!==d?p.data("stellar-vertical-offset"):b.verticalOffset,b.backgrounds.push({$element:f,$offsetParent:p,isFixed:f.css("background-attachment")==="fixed",horizontalOffset:h,verticalOffset:i,startingValueLeft:g[0],startingValueTop:g[1],startingBackgroundPositionLeft:isNaN(parseInt(g[0],10))?0:parseInt(g[0],10),startingBackgroundPositionTop:isNaN(parseInt(g[1],10))?0:parseInt(g[1],10),startingPositionLeft:f.position().left,startingPositionTop:f.position().top,startingOffsetLeft:n,startingOffsetTop:o,parentOffsetLeft:q,parentOffsetTop:r,stellarRatio:f.data("stellar-background-ratio")===d?1:f.data("stellar-background-ratio")})})},destroy:function(){var b,c,d,e,f;for(f=this.particles.length-1;f>=0;f--)b=this.particles[f],c=b.$element.data("stellar-startingLeft"),d=b.$element.data("stellar-startingTop"),this._setLeft(b.$element,c,c),this._setTop(b.$element,d,d),this.options.showElement(b.$element),b.$element.data("stellar-startingLeft",null).data("stellar-elementIsActive",null).data("stellar-backgroundIsActive",null);for(f=this.backgrounds.length-1;f>=0;f--)e=this.backgrounds[f],e.$element.css("background-position",e.startingValueLeft+" "+e.startingValueTop);this._animationLoop=a.noop,clearInterval(this._viewportDetectionInterval)},_setOffsets:function(){var c=this;a(b).unbind("resize.horizontal-"+this.name).unbind("resize.vertical-"+this.name),typeof this.options.horizontalOffset=="function"?(this.horizontalOffset=this.options.horizontalOffset(),a(b).bind("resize.horizontal-"+this.name,function(){c.horizontalOffset=c.options.horizontalOffset()})):this.horizontalOffset=this.options.horizontalOffset,typeof this.options.verticalOffset=="function"?(this.verticalOffset=this.options.verticalOffset(),a(b).bind("resize.vertical-"+this.name,function(){c.verticalOffset=c.options.verticalOffset()})):this.verticalOffset=this.options.verticalOffset},_repositionElements:function(){var a=this._getScrollLeft(),b=this._getScrollTop(),c,d,e,f,g,h,i,j=!0,k=!0,l,m,n,o,p;if(this.currentScrollLeft===a&&this.currentScrollTop===b&&this.currentWidth===this.viewportWidth&&this.currentHeight===this.viewportHeight)return;this.currentScrollLeft=a,this.currentScrollTop=b,this.currentWidth=this.viewportWidth,this.currentHeight=this.viewportHeight;for(p=this.particles.length-1;p>=0;p--)e=this.particles[p],f=e.isFixed?1:0,this.options.horizontalScrolling&&(l=(a+e.horizontalOffset+this.viewportOffsetLeft+e.startingPositionLeft-e.startingOffsetLeft+e.parentOffsetLeft)*-(e.stellarRatio+f-1)+e.startingPositionLeft,n=l-e.startingPositionLeft+e.startingOffsetLeft),this.options.verticalScrolling&&(m=(b+e.verticalOffset+this.viewportOffsetTop+e.startingPositionTop-e.startingOffsetTop+e.parentOffsetTop)*-(e.stellarRatio+f-1)+e.startingPositionTop,o=m-e.startingPositionTop+e.startingOffsetTop),this.options.hideDistantElements&&(k=!this.options.horizontalScrolling||n+e.width>(e.isFixed?0:a)&&n<(e.isFixed?0:a)+this.viewportWidth+this.viewportOffsetLeft,j=!this.options.verticalScrolling||o+e.height>(e.isFixed?0:b)&&o<(e.isFixed?0:b)+this.viewportHeight+this.viewportOffsetTop),k&&j?(e.isHidden&&(this.options.showElement(e.$element),e.isHidden=!1),this.options.horizontalScrolling&&this._setLeft(e.$element,l,e.startingPositionLeft),this.options.verticalScrolling&&this._setTop(e.$element,m,e.startingPositionTop)):e.isHidden||(this.options.hideElement(e.$element),e.isHidden=!0);for(p=this.backgrounds.length-1;p>=0;p--)g=this.backgrounds[p],f=g.isFixed?0:1,h=this.options.horizontalScrolling?(a+g.horizontalOffset-this.viewportOffsetLeft-g.startingOffsetLeft+g.parentOffsetLeft-g.startingBackgroundPositionLeft)*(f-g.stellarRatio)+"px":g.startingValueLeft,i=this.options.verticalScrolling?(b+g.verticalOffset-this.viewportOffsetTop-g.startingOffsetTop+g.parentOffsetTop-g.startingBackgroundPositionTop)*(f-g.stellarRatio)+"px":g.startingValueTop,g.$element.css("background-position",h+" "+i)},_startViewportDetectionLoop:function(){var a=this,b=function(){var b=a.$viewportElement.offset();a.viewportWidth=a.$viewportElement.width(),a.viewportHeight=a.$viewportElement.height(),a.viewportOffsetTop=b!==null?b.top:0,a.viewportOffsetLeft=b!==null?b.left:0};b(),this._viewportDetectionInterval=setInterval(b,this.options.viewportDetectionInterval)},_startAnimationLoop:function(){var a=this,c=function(){return b.requestAnimationFrame||b.webkitRequestAnimationFrame||b.mozRequestAnimationFrame||b.oRequestAnimationFrame||b.msRequestAnimationFrame||function(a,c){b.setTimeout(a,1e3/60)}}();this._animationLoop=function(){c(a._animationLoop),a._repositionElements()},this._animationLoop()}},a.fn[e]=function(b){var c=arguments;if(b===d||typeof b=="object")return this.each(function(){a.data(this,"plugin_"+e)||a.data(this,"plugin_"+e,new l(this,b))});if(typeof b=="string"&&b[0]!=="_"&&b!=="init")return this.each(function(){var d=a.data(this,"plugin_"+e);d instanceof l&&typeof d[b]=="function"&&d[b].apply(d,Array.prototype.slice.call(c,1)),b==="destroy"&&a.data(this,"plugin_"+e,null)})},a[e]=function(c){var d=a(b);return d.stellar.apply(d,Array.prototype.slice.call(arguments,0))},a[e].scrollProperty=g,a[e].positionProperty=h,b.Stellar=l})(jQuery,window,document);

/*Jquery easing*/
jQuery.easing['jswing']=jQuery.easing['swing'];jQuery.extend(jQuery.easing,{def:'easeOutQuad',swing:function(x,t,b,c,d){return jQuery.easing[jQuery.easing.def](x,t,b,c,d);},easeInQuad:function(x,t,b,c,d){return c*(t/=d)*t+b;},easeOutQuad:function(x,t,b,c,d){return-c*(t/=d)*(t-2)+b;},easeInOutQuad:function(x,t,b,c,d){if((t/=d/2)<1)return c/2*t*t+b;return-c/2*((--t)*(t-2)-1)+b;},easeInCubic:function(x,t,b,c,d){return c*(t/=d)*t*t+b;},easeOutCubic:function(x,t,b,c,d){return c*((t=t/d-1)*t*t+1)+b;},easeInOutCubic:function(x,t,b,c,d){if((t/=d/2)<1)return c/2*t*t*t+b;return c/2*((t-=2)*t*t+2)+b;},easeInQuart:function(x,t,b,c,d){return c*(t/=d)*t*t*t+b;},easeOutQuart:function(x,t,b,c,d){return-c*((t=t/d-1)*t*t*t-1)+b;},easeInOutQuart:function(x,t,b,c,d){if((t/=d/2)<1)return c/2*t*t*t*t+b;return-c/2*((t-=2)*t*t*t-2)+b;},easeInQuint:function(x,t,b,c,d){return c*(t/=d)*t*t*t*t+b;},easeOutQuint:function(x,t,b,c,d){return c*((t=t/d-1)*t*t*t*t+1)+b;},easeInOutQuint:function(x,t,b,c,d){if((t/=d/2)<1)return c/2*t*t*t*t*t+b;return c/2*((t-=2)*t*t*t*t+2)+b;},easeInSine:function(x,t,b,c,d){return-c*Math.cos(t/d*(Math.PI/2))+c+b;},easeOutSine:function(x,t,b,c,d){return c*Math.sin(t/d*(Math.PI/2))+b;},easeInOutSine:function(x,t,b,c,d){return-c/2*(Math.cos(Math.PI*t/d)-1)+b;},easeInExpo:function(x,t,b,c,d){return(t==0)?b:c*Math.pow(2,10*(t/d-1))+b;},easeOutExpo:function(x,t,b,c,d){return(t==d)?b+c:c*(-Math.pow(2,-10*t/d)+1)+b;},easeInOutExpo:function(x,t,b,c,d){if(t==0)return b;if(t==d)return b+c;if((t/=d/2)<1)return c/2*Math.pow(2,10*(t-1))+b;return c/2*(-Math.pow(2,-10*--t)+2)+b;},easeInCirc:function(x,t,b,c,d){return-c*(Math.sqrt(1-(t/=d)*t)-1)+b;},easeOutCirc:function(x,t,b,c,d){return c*Math.sqrt(1-(t=t/d-1)*t)+b;},easeInOutCirc:function(x,t,b,c,d){if((t/=d/2)<1)return-c/2*(Math.sqrt(1-t*t)-1)+b;return c/2*(Math.sqrt(1-(t-=2)*t)+1)+b;},easeInElastic:function(x,t,b,c,d){var s=1.70158;var p=0;var a=c;if(t==0)return b;if((t/=d)==1)return b+c;if(!p)p=d*.3;if(a<Math.abs(c)){a=c;var s=p/4;}else var s=p/(2*Math.PI)*Math.asin(c/a);return-(a*Math.pow(2,10*(t-=1))*Math.sin((t*d-s)*(2*Math.PI)/p))+b;},easeOutElastic:function(x,t,b,c,d){var s=1.70158;var p=0;var a=c;if(t==0)return b;if((t/=d)==1)return b+c;if(!p)p=d*.3;if(a<Math.abs(c)){a=c;var s=p/4;}else var s=p/(2*Math.PI)*Math.asin(c/a);return a*Math.pow(2,-10*t)*Math.sin((t*d-s)*(2*Math.PI)/p)+c+b;},easeInOutElastic:function(x,t,b,c,d){var s=1.70158;var p=0;var a=c;if(t==0)return b;if((t/=d/2)==2)return b+c;if(!p)p=d*(.3*1.5);if(a<Math.abs(c)){a=c;var s=p/4;}else var s=p/(2*Math.PI)*Math.asin(c/a);if(t<1)return-.5*(a*Math.pow(2,10*(t-=1))*Math.sin((t*d-s)*(2*Math.PI)/p))+b;return a*Math.pow(2,-10*(t-=1))*Math.sin((t*d-s)*(2*Math.PI)/p)*.5+c+b;},easeInBack:function(x,t,b,c,d,s){if(s==undefined)s=1.70158;return c*(t/=d)*t*((s+1)*t-s)+b;},easeOutBack:function(x,t,b,c,d,s){if(s==undefined)s=1.70158;return c*((t=t/d-1)*t*((s+1)*t+s)+1)+b;},easeInOutBack:function(x,t,b,c,d,s){if(s==undefined)s=1.70158;if((t/=d/2)<1)return c/2*(t*t*(((s*=(1.525))+1)*t-s))+b;return c/2*((t-=2)*t*(((s*=(1.525))+1)*t+s)+2)+b;},easeInBounce:function(x,t,b,c,d){return c-jQuery.easing.easeOutBounce(x,d-t,0,c,d)+b;},easeOutBounce:function(x,t,b,c,d){if((t/=d)<(1/2.75)){return c*(7.5625*t*t)+b;}else if(t<(2/2.75)){return c*(7.5625*(t-=(1.5/2.75))*t+.75)+b;}else if(t<(2.5/2.75)){return c*(7.5625*(t-=(2.25/2.75))*t+.9375)+b;}else{return c*(7.5625*(t-=(2.625/2.75))*t+.984375)+b;}},easeInOutBounce:function(x,t,b,c,d){if(t<d/2)return jQuery.easing.easeInBounce(x,t*2,0,c,d)*.5+b;return jQuery.easing.easeOutBounce(x,t*2-d,0,c,d)*.5+c*.5+b;}});
/*jQuery Color*/

jQuery.fn.farbtastic=function(callback){$.farbtastic(this,callback);return this;};jQuery.farbtastic=function(container,callback){var container=$(container).get(0);return container.farbtastic||(container.farbtastic=new jQuery._farbtastic(container,callback));}
jQuery._farbtastic=function(container,callback){var fb=this;$(container).html('<div class="farbtastic"><div class="color"></div><div class="wheel"></div><div class="overlay"></div><div class="h-marker marker"></div><div class="sl-marker marker"></div></div>');var e=$('.farbtastic',container);fb.wheel=$('.wheel',container).get(0);fb.radius=84;fb.square=100;fb.width=194;if(navigator.appVersion.match(/MSIE [0-6]\./)){$('*',e).each(function(){if(this.currentStyle.backgroundImage!='none'){var image=this.currentStyle.backgroundImage;image=this.currentStyle.backgroundImage.substring(5,image.length-2);$(this).css({'backgroundImage':'none','filter':"progid:DXImageTransform.Microsoft.AlphaImageLoader(enabled=true, sizingMethod=crop, src='"+image+"')"});}});}
fb.linkTo=function(callback){if(typeof fb.callback=='object'){$(fb.callback).unbind('keyup',fb.updateValue);}
fb.color=null;if(typeof callback=='function'){fb.callback=callback;}
else if(typeof callback=='object'||typeof callback=='string'){fb.callback=$(callback);fb.callback.bind('keyup',fb.updateValue);if(fb.callback.get(0).value){fb.setColor(fb.callback.get(0).value);}}
return this;}
fb.updateValue=function(event){if(this.value&&this.value!=fb.color){fb.setColor(this.value);}}
fb.setColor=function(color){var unpack=fb.unpack(color);if(fb.color!=color&&unpack){fb.color=color;fb.rgb=unpack;fb.hsl=fb.RGBToHSL(fb.rgb);fb.updateDisplay();}
return this;}
fb.setHSL=function(hsl){fb.hsl=hsl;fb.rgb=fb.HSLToRGB(hsl);fb.color=fb.pack(fb.rgb);fb.updateDisplay();return this;}
fb.widgetCoords=function(event){var x,y;var el=event.target||event.srcElement;var reference=fb.wheel;if(typeof event.offsetX!='undefined'){var pos={x:event.offsetX,y:event.offsetY};var e=el;while(e){e.mouseX=pos.x;e.mouseY=pos.y;pos.x+=e.offsetLeft;pos.y+=e.offsetTop;e=e.offsetParent;}
var e=reference;var offset={x:0,y:0}
while(e){if(typeof e.mouseX!='undefined'){x=e.mouseX-offset.x;y=e.mouseY-offset.y;break;}
offset.x+=e.offsetLeft;offset.y+=e.offsetTop;e=e.offsetParent;}
e=el;while(e){e.mouseX=undefined;e.mouseY=undefined;e=e.offsetParent;}}
else{var pos=fb.absolutePosition(reference);x=(event.pageX||0*(event.clientX+$('html').get(0).scrollLeft))-pos.x;y=(event.pageY||0*(event.clientY+$('html').get(0).scrollTop))-pos.y;}
return{x:x-fb.width/2,y:y-fb.width/2};}
fb.mousedown=function(event){if(!document.dragging){$(document).bind('mousemove',fb.mousemove).bind('mouseup',fb.mouseup);document.dragging=true;}
var pos=fb.widgetCoords(event);fb.circleDrag=Math.max(Math.abs(pos.x),Math.abs(pos.y))*2>fb.square;fb.mousemove(event);return false;}
fb.mousemove=function(event){var pos=fb.widgetCoords(event);if(fb.circleDrag){var hue=Math.atan2(pos.x,-pos.y)/6.28;if(hue<0)hue+=1;fb.setHSL([hue,fb.hsl[1],fb.hsl[2]]);}
else{var sat=Math.max(0,Math.min(1,-(pos.x/fb.square)+.5));var lum=Math.max(0,Math.min(1,-(pos.y/fb.square)+.5));fb.setHSL([fb.hsl[0],sat,lum]);}
return false;}
fb.mouseup=function(){$(document).unbind('mousemove',fb.mousemove);$(document).unbind('mouseup',fb.mouseup);document.dragging=false;}
fb.updateDisplay=function(){var angle=fb.hsl[0]*6.28;$('.h-marker',e).css({left:Math.round(Math.sin(angle)*fb.radius+fb.width/2)+'px',top:Math.round(-Math.cos(angle)*fb.radius+fb.width/2)+'px'});$('.sl-marker',e).css({left:Math.round(fb.square*(.5-fb.hsl[1])+fb.width/2)+'px',top:Math.round(fb.square*(.5-fb.hsl[2])+fb.width/2)+'px'});$('.color',e).css('backgroundColor',fb.pack(fb.HSLToRGB([fb.hsl[0],1,0.5])));if(typeof fb.callback=='object'){$(fb.callback).css({backgroundColor:fb.color,color:fb.hsl[2]>0.5?'#000':'#fff'});$(fb.callback).each(function(){if(this.value&&this.value!=fb.color){this.value=fb.color;}});}
else if(typeof fb.callback=='function'){fb.callback.call(fb,fb.color);}}
fb.absolutePosition=function(el){var r={x:el.offsetLeft,y:el.offsetTop};if(el.offsetParent){var tmp=fb.absolutePosition(el.offsetParent);r.x+=tmp.x;r.y+=tmp.y;}
return r;};fb.pack=function(rgb){var r=Math.round(rgb[0]*255);var g=Math.round(rgb[1]*255);var b=Math.round(rgb[2]*255);return'#'+(r<16?'0':'')+r.toString(16)+
(g<16?'0':'')+g.toString(16)+
(b<16?'0':'')+b.toString(16);}
fb.unpack=function(color){if(color.length==7){return[parseInt('0x'+color.substring(1,3))/255,parseInt('0x'+color.substring(3,5))/255,parseInt('0x'+color.substring(5,7))/255];}
else if(color.length==4){return[parseInt('0x'+color.substring(1,2))/15,parseInt('0x'+color.substring(2,3))/15,parseInt('0x'+color.substring(3,4))/15];}}
fb.HSLToRGB=function(hsl){var m1,m2,r,g,b;var h=hsl[0],s=hsl[1],l=hsl[2];m2=(l<=0.5)?l*(s+1):l+s-l*s;m1=l*2-m2;return[this.hueToRGB(m1,m2,h+0.33333),this.hueToRGB(m1,m2,h),this.hueToRGB(m1,m2,h-0.33333)];}
fb.hueToRGB=function(m1,m2,h){h=(h<0)?h+1:((h>1)?h-1:h);if(h*6<1)return m1+(m2-m1)*h*6;if(h*2<1)return m2;if(h*3<2)return m1+(m2-m1)*(0.66666-h)*6;return m1;}
fb.RGBToHSL=function(rgb){var min,max,delta,h,s,l;var r=rgb[0],g=rgb[1],b=rgb[2];min=Math.min(r,Math.min(g,b));max=Math.max(r,Math.max(g,b));delta=max-min;l=(min+max)/2;s=0;if(l>0&&l<1){s=delta/(l<0.5?(2*l):(2-2*l));}
h=0;if(delta>0){if(max==r&&max!=g)h+=(g-b)/delta;if(max==g&&max!=b)h+=(2+(b-r)/delta);if(max==b&&max!=r)h+=(4+(r-g)/delta);h/=6;}
return[h,s,l];}
$('*',e).mousedown(fb.mousedown);fb.setColor('#000000');if(callback){fb.linkTo(callback);}}




// usage: log('inside coolFunc', this, arguments);
// paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
window.log = function f(){ log.history = log.history || []; log.history.push(arguments); if(this.console) { var args = arguments, newarr; args.callee = args.callee.caller; newarr = [].slice.call(args); if (typeof console.log === 'object') log.apply.call(console.log, console, newarr); else console.log.apply(console, newarr);}};

// make it safe to use console.log always
(function(a){function b(){}for(var c="assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,time,timeEnd,trace,warn".split(","),d;!!(d=c.pop());){a[d]=a[d]||b;}})
(function(){try{console.log();return window.console;}catch(a){return (window.console={});}}());


// usage: log('inside coolFunc', this, arguments);
// JQTWEET PLUGINN
(function($){JQTWEET={user:'quenesswebblog',numTweets:5,appendTo:'#jstwitter',onError:function(){},loadTweets:function(complete){var complete=complete||function(){};$.ajax({url:'http://api.twitter.com/1/statuses/user_timeline.json/',type:'GET',dataType:'jsonp',data:{screen_name:JQTWEET.user,include_rts:true,count:JQTWEET.numTweets,include_entities:true},error:function(jqXHR,textStatus,errorThrown){this.onError(jqXHR,textStatus,errorThrown);},fail:function(){this.onError();},statusCode:{404:function(){alert("Twitter niet beschikbaar");}},success:function(data,textStatus,xhr){var html='<div class="tweet">TWEET_TEXT<div class="time">AGO</div>';for(var i=0;i<data.length;i++){$(JQTWEET.appendTo).append(html.replace('TWEET_TEXT',JQTWEET.ify.clean(data[i].text)).replace(/USER/g,data[i].user.screen_name).replace('AGO',JQTWEET.timeAgo(data[i].created_at)).replace(/ID/g,data[i].id_str));}
complete(data,textStatus,xhr);}});},timeAgo:function(dateString){var rightNow=new Date();var then=new Date(dateString);if($.browser.msie){then=Date.parse(dateString.replace(/( \+)/,' UTC$1'));}
var diff=rightNow-then;var second=1000,minute=second*60,hour=minute*60,day=hour*24,week=day*7;if(isNaN(diff)||diff<0){return"";}
if(diff<second*2){return"right now";}
if(diff<minute){return Math.floor(diff/second)+" seconds ago";}
if(diff<minute*2){return"about 1 minute ago";}
if(diff<hour){return Math.floor(diff/minute)+" minutes ago";}
if(diff<hour*2){return"about 1 hour ago";}
if(diff<day){return Math.floor(diff/hour)+" hours ago";}
if(diff>day&&diff<day*2){return"yesterday";}
if(diff<day*365){return Math.floor(diff/day)+" days ago";}else{return"over a year ago";}},ify:{link:function(tweet){return tweet.replace(/\b(((https*\:\/\/)|www\.)[^\"\']+?)(([!?,.\)]+)?(\s|$))/g,function(link,m1,m2,m3,m4){var http=m2.match(/w/)?'http://':'';return'<a class="twtr-hyperlink" target="_blank" href="'+http+m1+'">'+((m1.length>25)?m1.substr(0,24)+'...':m1)+'</a>'+m4;});},at:function(tweet){return tweet.replace(/\B[@＠]([a-zA-Z0-9_]{1,20})/g,function(m,username){return'<a target="_blank" class="twtr-atreply" href="http://twitter.com/intent/user?screen_name='+username+'">@'+username+'</a>';});},list:function(tweet){return tweet.replace(/\B[@＠]([a-zA-Z0-9_]{1,20}\/\w+)/g,function(m,userlist){return'<a target="_blank" class="twtr-atreply" href="http://twitter.com/'+userlist+'">@'+userlist+'</a>';});},hash:function(tweet){return tweet.replace(/(^|\s+)#(\w+)/gi,function(m,before,hash){return before+'<a target="_blank" class="twtr-hashtag" href="http://twitter.com/search?q=%23'+hash+'">#'+hash+'</a>';});},clean:function(tweet){return this.hash(this.at(this.list(this.link(tweet))));}}};}(jQuery));

