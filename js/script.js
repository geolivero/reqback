//============ appHelpers
(function ($) {
    appHelpers = {
        ui: (function () {
            return {
                panels: function () {
                    var scollPane;
                    $('div#panelElements').fixHeight({
                        margin: 130,
                        toCompate: '#contentArea'
                    });
                    if ($('form label').length) {
                        $('form label').each(function () {
                            $(this).inFieldLabels();
                        });
                    }
                },
                getHTMLTemplate: function (templateCode) {
                    if ($('body').html().indexOf('<!--['.add(templateCode).add(']')) < 0) {
                        throw('getHTMLTemplate: template not found, searching for template name: '.add(templateCode));
                    }
                    return $('body').html().split('<!--['.add(templateCode).add(']'))[1].split('[/'.add(templateCode).add(']-->'))[0].trimSpaces();
                },
                message: (function () {
                    var messageHolder = '#app_confirmActions',
                        timeout, hideAnim, mOptions;
                    return {
                        events: function () {
                            hideAnim = function () {
                                clearTimeout(timeout);
                                $(messageHolder).animate({
                                    top: -($(messageHolder).height())
                                }, 500, function () {
                                    $(messageHolder).hide();
                                    $(messageHolder).find('.collapse').stop().css({
                                        opacity: 1
                                    });
                                });
                                mOptions.onCancel();
                            };
                            $(messageHolder).find('.cancel, .collapse').click(function () {
                                hideAnim();
                                return false;
                            });
                        },
                        create: function () {
                            $('body').append(appHelpers.ui.getHTMLTemplate('miniMessages'));
                            this.events();
                            this.staticMessage();
                            if ($('div.alert').length) {
                                appHelpers.ui.message.showMessage({message: $('div.alert').html() });
                            }
                        },
                        showMessage: function (options) {
                            var blinker;

                            options.url = options.url || '#';
                            options.message = options.message || '';
                            options.type = options.type || 'normal';
                            options.confirm = options.confirm || false;
                            options.ajax = options.ajax || false;
                            options.afterAjax = options.afterAjax || function() {};
                            options.jsonData = options.jsonData || false;
                            options.onCancel = options.onCancel || function() {};
                            mOptions = options;
                            blinker = function () {
                                $(messageHolder).find('.collapse').animate({
                                    opacity: 0.4
                                }, function () {
                                    $(messageHolder).find('.collapse').animate({
                                        opacity: 1
                                    }, function () {
                                        blinker();
                                    });
                                });
                            };
                            if (!options.confirm) {
                                $(messageHolder).find('.btn').hide();
                                clearTimeout(timeout);
                                timeout = setTimeout(hideAnim, 6000);
                            } else {
                                $(messageHolder).find('.btn').show();
                                if (options.ajax) {
                                    $(messageHolder).find('.btn-danger.yes').unbind('click');
                                    $(messageHolder).find('.btn-danger.yes').click(function () {
                                        hideAnim();
                                        appService.load(options.url, false, false, function (data) {
                                            options.afterAjax(data);
                                        }, options.jsonData);
                                        mOptions.onCancel();
                                        return false;
                                    });
                                }
                            }
                            $(messageHolder).find('.message').removeClass('error').removeClass('success');
                            $(messageHolder).show().css({
                                top: -($(messageHolder).height())
                            }).stop().animate({
                                top: 0
                            }, 500).find('.message').addClass(options.type).html(options.message).parent().find('.yes').attr('href', options.url);
                            blinker();

                        },
                        staticMessage: function () {
                            var options = {};
                            if ($('#messages').length) {
                                $('#messages').hide();
                                options.type = $('#messages').attr('data-type');
                                options.message = $('#messages').html();
                                options.confirm = $('#messages').attr('data-confirm');
                                options.url = $('#messages').attr('data-url');
                                appHelpers.ui.message.showMessage(options);
                            }
                        }
                    };
                }())
            };
        }())
    };

    appHelpers.tools = {
        increment: {
            value: 0,
            number: function (num) {
                return this.value += num;
            },
            reset: function () {
                this.value = 0;
            }
        },
        loops: {
            mapArray: function (array, callback) {
                var i = 0, array = array || [];
                if (!array.length) {
                    return;
                }
                while (i < array.length) {
                    callback(i);
                    i += 1;
                }
            },
            mapObject: function (obj, callback) {
                var n;
                if (typeof obj !== 'object' || obj === undefined) {
                    console.log('ERROR #mapObject: "Object is not valid!"');
                    return false;
                }
                for (n in obj) {
                    callback(n, obj[n]);
                }
            }
        },
        prototypes: function () {
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
        },
        init: (function () {
            if (typeof Array.isArray === 'undefined') {
                Array.isArray = function (arg) {
                    return Object.prototype.toString.call(arg) === "[object Array]";
                };
            }
        }())
    };

    //============ appService
    appService = (function () {
        return {
            afterAjax: (function () {
                var functions = [];
                return {
                    addEvent: function (funcObj) {
                        functions.push(funcObj);
                    },
                    callEvents: function () {
                        appHelpers.tools.loops.mapArray(functions, function (i) {
                            if (typeof functions[i] === 'function') {
                                functions[i]();
                            }
                        });
                    }
                };
            }()),
            loaderIcon: (function () {
                return {
                    create: function () {
                        $('body').append(''.tagWrap('span').tagWrap('div#loaderIcon style=display:none;'));
                    },
                    show: function (callback) {
                        var loopAnimation;
                        callback = callback || function () {};
                        if ($('#loaderIcon').length) {
                            $('#loaderIcon').show().css({
                                left: -50
                            }).animate({
                                left: 0
                            }, 500, callback);
                        }
                    },
                    hide: function (callback) {
                        var time, hideLoader;
                        callback = callback || function () {};
                        if ($('#loaderIcon').length) {
                            $('#loaderIcon').delay(500).animate({
                                left: -50
                            }, 1000, callback);
                        }
                        hideLoader = function () {
                            callback();
                            $('#loaderIcon').animate({
                                left: -50
                            }, 1000);
                        };
                        time = setTimeout(hideLoader, 500);
                    }
                };
            }()),
            load: function (url, target, targetId, callback, json) {
                json = json || false ,callback = callback || function () {}, target = target || false,
                targetId = targetId || false, url  = json ? url.add('/format/json') : url.add('/format/html');
                appService.loaderIcon.show();
                $(target).html('');
                $.get(url, function (data) {
                    appService.loaderIcon.hide();
                    if (target && targetId) {
                        $(target).html($(data).find(targetId).html());
                    }
                    appService.afterAjax.callEvents();
                    callback(data);
                });
            },
            post: function (form, target, targetId, callback, extraPostObjects, json) {
                callback = callback || function () {}, target = target || false, targetId = targetId || false,
                extraPostObjects = extraPostObjects || {}, url = json ? form.attr('action').add('format/json') : form.attr('action').add('format/html');
                appService.loaderIcon.show();
                $(target).html('');
                console.log(url);
                $.post(url, form.serialize(), function (data) {
                    appService.loaderIcon.hide(function () {
                        if (target && targetId) {
                            $(target).hide().fadeIn().html($(data).find(targetId).html());
                        }
                    });
                    appService.afterAjax.callEvents();
                    callback(data);
                });
            },
            json: function (url, callback) {
                appService.loaderIcon.show();
                $.getJSON(url, function (data) {
                    appService.afterAjax.callEvents();
                    callback(data);
                    appService.loaderIcon.hide();
                });
            }
        };
    }());


    //============ appUI

    appUI = (function () {
        /*APPUI VARS*/
        var toggleHeader;
        toggleHeader = function () {
            var collapse = function () {
                $('header').animate({
                    marginTop: -100
                }, 500);
                $('#logo').fadeOut('fast');
                $('footer nav').fadeOut('fast');
                $('header div.toggler').find('.toggleBtn').addClass('collapsed');
            };
            if ($('header div.toggler').length) {
                $('header div.toggler').click(function () {
                    if ($('header').css('margin-top').replace('px', '') > -1) {
                        collapse();
                    } else {
                        $('header').animate({
                            marginTop: 0
                        }, function () {
                            $('#logo').fadeIn();
                            $('footer nav').fadeIn();
                            $('header div.toggler .toggleBtn').removeClass('collapsed');
                        });
                    }
                });
            }
            if ($('header').hasClass('collapsed')) {
               // collapse();
            }
        };

        return {
            handlePannels: (function () {
                var initPanels, events, colorPanels, addElem;
                events = function () {
                    var panelContrBehavior, openPanel, addEtageToPanelAfterFormSubmit, closeSecondTab;
                    panelContrBehavior = function () {
                        if ($('#pannelEtages').length) {
                            if ($('#pannelEtages').css('left').replace('px', '').replace('%', '') === '0') {
                                $('#pannelEtages a.openTab').addClass('opend');
                            }
                        }
                    };
                    closeSecondTab = function () {
                        $('div#extraPanel .openSecondTab').hide();
                        $('div#extraPanel').animate({
                            left: '-100%'
                        }, 1000);
                    };
                    addEtageToPanelAfterFormSubmit = function (floorObj) {
                        var attachEtageButton = '';
                        if (floorObj !== undefined) {
                            attachEtageButton = appHelpers.ui.getHTMLTemplate('etaTempl')
                            .replace(/\{itemId\}/g, floorObj.floorId)
                            .replace(/\{etageName\}/g, floorObj.title)
                            .replace(/\{etageId\}/g, floorObj.typeId);

                            $(attachEtageButton).insertAfter('#panelElements ul.grid li:first-child');
                            closeSecondTab();

                            appHelpers.ui.message.showMessage({
                                confirm: false,
                                type: 'success',
                                url: null,
                                message: appHelpers.ui.getHTMLTemplate('messageNewEtage')
                            });
                        }
                    };
                    openPanel = function (_this) {
                        $(_this).hide().fadeIn().addClass('opend');
                        $('#pannelEtages').animate({
                            left: 0
                        }, 500);
                        $('div#extraPanel').hide();
                    };

                    $(window).scroll(function (e) {
                        var scrollTop = $(window).scrollTop(),
                            heightToggler = $('header .toggler').length && $('#toolsNav').length ? $('header .toggler').height() + $('#toolsNav').height() : 10;
                    });
                    /**
                    ================================================================
                        Adding etage events
                    ================================================================
                    */
                    $('#panelElements li div.chooseEtage div.etageRow, #extraPanel li div.chooseEtage div.etageRow').live('click', function () {
                        var id = $(this).find('.imgProd').attr('class').split('_')[1];
                        $(this).closest('.chooseEtage').hide();
                        $(this).closest('li').find('form fieldset#field_floorForm_etage').find('#floorForm-floorTypeId').val(id);
                        $(this).closest('li').find('.etageForm').show().find('.imgProd').attr('class', 'imgProd etage_'.add(id)).attr('id', 'etage_'.add(id));
                        $(this).closest('li').find('.etage_verven .etageLarge').attr('class', 'etageLarge etage etage_'.add(id));
                        $('html, body').animate();
                    });

                    /**
                    ================================================================
                        Block all lines if tag attribute data-nojs = true
                    ================================================================
                    */
                    if ($('#pannelEtages').attr('data-nojs') === 'true') {
                        return false;
                    }
                    $('#pannelEtages a.openTab').click(function () {
                        var _this = $(this);
                        if ($(this).hasClass('opend')) {
                            window.location.href = '/inrichten/';
                            return false;

                            /*appService.load('/inrichten', '#panelElements', '#panelElements', function (data) {
                                console.log(data);
                                return false;
                                $(this).hide().delay(500).fadeIn().removeClass('opend').find('span.label').remove();
                                $('#pannelEtages').css({
                                    left: 0
                                }).animate({
                                    left: '-80%'
                                }, 500);
                            });*/
                        } else {
                            $('body, html').animate({
                                scrollTop: 0
                            }, 10);
                            if (!$('#panelElements ul.grid li.etages').length) {
                                appService.load($(this).attr('href'), '#extraPanelContent', '#panelElements', function (data) {
                                    $('#panelElements ul.grid').append(data);
                                    openPanel(_this);
                                });
                            } else {
                                openPanel(_this);
                            }
                        }
                         $('.openSecondTab').stop().hide();
                        return false;
                    });
                    $('div#extraPanel .openSecondTab').click(function () {
                        closeSecondTab();
                        return false;
                    });

                    /*
                        ======================================================================
                        ========== FORM SUBMIT ACTIONS AFTER AJAX
                        ======================================================================
                    */

                    $('form#floorForm_etage').handleSubmit.afterAjax(function (data) {
                        var newObj = {};
                        if (data.success !== undefined && data.success) {
                            newObj.floorId = data.floorId;
                            newObj.title = $('form#floorForm_etage input#floorForm-name').val();
                            newObj.typeId = $('form#floorForm_etage input#floorForm-floorTypeId').val();
                            addEtageToPanelAfterFormSubmit(newObj);
                        } else {
                            //alert("Oops er iets verkeerd gegaan, probeer het nog een keer");
                        }
                    }, true);

                    panelContrBehavior();
                };
                addElem = function () {
                    $('#pannelEtages').append(''.tagWrap('div#extraPanelContent').add('x'.tagWrap('a.openSecondTab.opend')).tagWrap('div#extraPanel'));
                };
                colorPanels = function () {
                    var height = $('#extraPanel .colorController').height(),
                        width = $('#extraPanel .colorController').width();
                    $('.colorController').resizable({
                        maxHeight: 400,
                        maxWidth: 600,
                        minHeight: 400,
                        minWidth: 300
                    });
                    $('.colorController .col em').each(function () {
                        var colored = $(this).closest('.col').find('i'),
                            matchClasses = $(this).closest('.col').attr('class').split(' ')[0].toLowerCase().replace('color', ''),
                            attribEtage, hiddenFields = $(this).closest('li').find('#floorForm-'.add(matchClasses).add('Color'));
                        attribEtage = $(this).closest('.etage_verven').find('.'.add(matchClasses));

                        $.farbtastic($(this).closest('.col em'), function (colorHex) {
                            colored.css({
                                backgroundColor: colorHex
                            });
                            attribEtage.css({
                                backgroundColor: colorHex
                            });
                            hiddenFields.val(colorHex.replace('#', ''));
                        });
                    });
                    $('div.etage_verven .tools a').live('click', function () {
                        $(this).closest('.etage_verven').slideUp('slow');
                        return false;
                    });
                    $('li .paint a').live('click', function () {
                        $(this).closest('li').find('.etage_verven').slideDown('slow');
                        return false;
                    });
                    $('.colorController .col').live('click', function () {
                        $('.colorController .col em').hide();
                        $(this).find('em').show();
                    });
                };

                initPanels = function () {
                    addElem();
                    events();
                };
                return {
                    init: function () {
                        initPanels();
                    },
                    openSecondPanel: function () {
                        $('div#extraPanel .openSecondTab').delay(1000).fadeIn();
                        $('#extraPanel').show().delay(500).animate({
                            left: '0%'
                        }, 500);
                    },
                    initEvents: function () {
                        events();
                    },
                    colorPanels: function () {
                        colorPanels();
                    }
                };
            }()),
/*
    ================================================================================================
    =============SPOTS UI
    ================================================================================================

*/
            spots: (function () {
                var init, spotHtml = '',
                    mediaType = "",
                    spotCoord = {}, newSpotTracker, previewSpot, createWYZ, miniPanelActions, currentEtage, widgetReady = false,
                    events, getHTMLTemplate, eventMethods, showEvents, trackMoveMent, closePanelAndResetWidget, registerPosition, currentMouseover, insertSpotWidget, followScrollOffset, afterFormSubmition, testForOtherSpots;


                createWYZ = function (id) {
                    Editor = new nicEditor({
                        buttonList: ['bold', 'italic', 'underline', 'link', 'unlink', 'ul', 'ol'],
                        iconsPath: ('/images/nicEditIcons-latest.gif')
                    }).panelInstance(id);

                    delete Editor;
                };
                insertSpotWidget = function (replaceElement) {
                    var parentDivtextarea = $('#hotspot').find('textarea').parent(), htmlField, linkedInFunctions;
                    $('#mediaImg').hide();
                    switch (replaceElement) {
                    case 'icon-heart':
                        $('#hotspot').find('textarea').hide();
                        htmlField = '<input type="text" name="socialSearch" id="socialSearch" />'.tagWrap('div#socialSearchWidg').tagWrap('div#socialSearchWidgWrap');

                        parentDivtextarea.prepend(''.tagWrap('div#spotSocialElement'));


                        $('div#spotSocialElement').customSelectBox({
                            data: [{
                                value: 'null',
                                label: '- maak een keuze -'
                            }, {
                                value: 'twitter',
                                label: 'Twitter'
                            }, {
                                value: 'facebook',
                                label: 'Facebook'
                            }, {
                                value: 'linkedin',
                                label: 'LinkedIn'
                            }],
                            postion: 'top',
                            onChange: function (e) {
                                $('#socialSearchWidg').remove();
                                parentDivtextarea.append(appHelpers.ui.getHTMLTemplate('searchFieldSocialWidgets'));
                                $('div#socialSearchWidg').show();
                                parentDivtextarea.find('i.loader').hide();
                                $('#socialSearchWidg .centered').html('');
                                $('#linkedInCurrentlyWorkingAt').remove();
                                switch(e.value) {
                                    case 'twitter':
                                        $('#socialSearch').autoSubmitField({
                                            onReady: function (val) {
                                                $('#socialSearchWidg .centered').html('');
                                                JQTWEET.user = val;
                                                JQTWEET.appendTo = '#socialSearchWidg .centered';
                                                JQTWEET.loadTweets();
                                                parentDivtextarea.find('i.loader').hide();
                                                $('#media-mediaEmbedCode').val('twitter|'.add(val));
                                                JQTWEET.onError =  function (data) {
                                                    alert('Verbinding met Twitter is afgebroken');
                                                };
                                            },
                                            onStart: function () {
                                                parentDivtextarea.find('i.loader').show();
                                            }
                                        });
                                        $('#socialSearchWidgWrap label').replaceLabelByCustomTag({tag: 'tw'});
                                    break;
                                    case 'linkedin':

                                        linkedInFunctions = (function () {
                                            return  {
                                                userLoggedIn: function () {
                                                    appService.loaderIcon.show();
                                                    $('.submits').show();
                                                    IN.API.Profile("me")
                                                    .fields(["firstName","headline","positions:(company)"])
                                                    .result(function(result) {
                                                        appHelpers.tools.loops.mapArray(result.values, function (i) {
                                                            IN.API.Raw("/companies/"
                                                            .add(result.values[i].positions.values[0].company.id)
                                                            .add(":(id,name,industry,logo-url,website-url)"))
                                                            .result(function (results) {
                                                                linkedInFunctions.updateNetworkWidget(results.id);
                                                                appService.loaderIcon.hide();
                                                                if (results.id !== undefined) {
                                                                    $('#socialSearchWidg')
                                                                    .before(appHelpers.ui.getHTMLTemplate('linkedInCurrentlyWorking')
                                                                        .replace('{name}', results.name)
                                                                        .replace('{website}', results.websiteUrl)
                                                                        .replace('{imgSrc}', results.logoUrl)
                                                                        .replace('{id}', results.id)
                                                                    );
                                                                }
                                                            });
                                                        });
                                                    });
                                                    $('#spotSocialElement, #socialSearchWidg').show();
                                                    parentDivtextarea.find('#linkedInLogginBtn').remove();
                                                    parentDivtextarea.find('.contentWidgetsPlaceHolder').append(appHelpers.ui.getHTMLTemplate('linkedSocialWidgetsLogout'));
                                                    $('#linkedInLogginBtn a').click(function () {
                                                        linkedInFunctions.userLoggedOut();
                                                        return false;
                                                    });
                                                },
                                                userLoggedOut: function () {
                                                    IN.User.logout();
                                                    $('#linkedInLogginBtn a').hide();
                                                    $('#spotSocialElement, #socialSearchWidg').hide();
                                                    $('.submits').hide();
                                                    linkedInFunctions.addLoginButton();
                                                },
                                                addLoginButton: function () {
                                                    parentDivtextarea.find('#linkedInLogginBtn').remove();
                                                    parentDivtextarea.find('.contentWidgetsPlaceHolder').append(appHelpers.ui.getHTMLTemplate('linkedSocialWidgets'));
                                                    IN.parse();
                                                },
                                                updateNetworkWidget: function (id) {
                                                    $('#socialSearchWidg .placeHolder')
                                                    .html(appHelpers.ui.getHTMLTemplate('linkedInConn').replace('{id}', id));
                                                    $('#media-mediaEmbedCode').val('linkedin|'.add(id));
                                                    IN.parse();
                                                },
                                                events: function () {
                                                    $('.linkedResults ul li, .linkedInResult').live('click', function () {
                                                        $('.linkedResults ul li').removeClass('current');
                                                        $(this).addClass('current');
                                                        linkedInFunctions.updateNetworkWidget($(this).attr('data-id'));
                                                    });
                                                }
                                            }
                                        }());

                                        IN.Event.on(IN, "auth", function() {
                                            linkedInFunctions.userLoggedIn();
                                        });

                                        if (IN.User.isAuthorized()) {
                                            linkedInFunctions.userLoggedIn();
                                        } else {
                                            linkedInFunctions.userLoggedOut();
                                        }

                                        $('#socialSearch').autoSubmitField({
                                            onReady: function (val) {
                                                 IN.API.Raw("/company-search:(companies:(id,name,website-url,logo-url))?keywords="
                                                    .add(val)
                                                    .add("&count=3&facet=location,nl:0")
                                                ).result(function (result) {
                                                    parentDivtextarea.find('i.loader').hide();
                                                    $('.linkedResults').remove();
                                                    $('#linkedInLogginBtn').before(appHelpers.ui.getHTMLTemplate('linkedInRowWrap'));

                                                    appHelpers.tools.loops.mapArray(result.companies.values, function (i) {
                                                        $('.linkedResults ul').append(
                                                            appHelpers.ui.getHTMLTemplate('linkedInRows')
                                                            .replace('{urlimg}', result.companies.values[i].logoUrl)
                                                            .replace('{id}', result.companies.values[i].id)
                                                            .replace('{firstname}', result.companies.values[i].name)
                                                            .replace('{website-url}', result.companies.values[i].websiteUrl)
                                                        );
                                                    });
                                                });
                                            },
                                            onStart: function () {
                                                parentDivtextarea.find('i.loader').show();
                                            }
                                        });
                                        linkedInFunctions.events();
                                        $('#socialSearchWidgWrap label').replaceLabelByCustomTag({tag: 'ln'});
                                    break;
                                    case 'facebook':
                                        $('#socialSearch').autoSubmitField({
                                            onReady: function (val) {
                                                $('#socialSearchWidg .centered').html('');
                                                $('#socialSearchWidg .centered').html(appHelpers.ui.getHTMLTemplate('facebookLikeBox').replace('{url}', val));
                                                FB.XFBML.parse();
                                                parentDivtextarea.find('i.loader').hide();
                                                $('#media-mediaEmbedCode').val('facebook|'.add(val));
                                            },
                                            onStart: function () {
                                                parentDivtextarea.find('i.loader').show();
                                            }
                                        });
                                        $('#socialSearchWidgWrap label').replaceLabelByCustomTag({tag: 'fb'});
                                    break;
                                }
                            }
                        });
                        break;
                    case 'icon-picture':
                        var uploader, updateImageSlider;
                        $('#media-mediaEmbedCode').closest('div').hide();
                        $('#mediaImg').parent().append(appHelpers.ui.getHTMLTemplate('fileUploader'));
                        $('#hotspot .tipElement').remove();
                        $('#hotspot').append(appHelpers.ui.getHTMLTemplate('placeHolderTip'));

                        updateImageSlider = {
                            slides: 0,
                            images: [],
                            setTotalSlides: function (id, image) {
                                var id = id || 0, image = image || false;
                                this.slides = id;
                                this.images.push(image);
                            },
                            updateSlider: function () {
                                var list = '', _this = this, title = '';
                                $('#hotspot .tipElement .placeHolder .centered').html("")
                                .append(appHelpers.ui.getHTMLTemplate('slideShowImages'));

                                $('.qq-upload-list li').each(function (i) {
                                    if (_this.images[i] !== undefined) {
                                        title = _this.images[i].toString().replace(/.jpeg|.jpg|.gif|.png/g, ' ')
                                            .replace(/_|\-|\.|\(|\)|%|@/g,'');
                                        list += '<li title="'.add(title).add('"><span class="title">').add(title).add('</span><img src="')
                                            .add($('.slideShowImagesWrap')
                                            .attr('data-loc')).add(_this.images[i]).add('"/></li>');
                                    }
                                });
                                $('#hotspot .tipElement .centered').html(
                                    $('#hotspot .tipElement .placeHolder .centered').html()
                                    .replace('{slides}', list)
                                );
                                $('div.slideShowImagesWrap .slides').etalageSlider();
                            }
                        };

                        $('input[type=file]').multiUpload({uniqueId: $('#progress_key').val()});

                        break;
                    case 'icon-facetime-video':
                        $('#hotspot').find('textarea').youtubeSelector({
                            results: 5,
                            allowed: 1,
                            label: 'Search for video\'s'
                        });
                        break;
                    default:
                        createWYZ($('#hotspot').find('textarea').attr('id'));
                        break;
                    };

                };
                closePanelAndResetWidget = function () {
                    $('#spotUI .closeBtn').hide();
                    if (newSpotTracker.hasClass('temp')) {
                        newSpotTracker.remove();
                    }
                    $('.tipElement').remove();
                    $('#spotUI').show().animate({
                        right: '-30%'
                    }, function () {
                        $('#spotUI').hide();
                    });
                    if (currentMouseover !== undefined) {
                        currentEtage.mouseover(spotHoldermouseover);
                    }
                };
                followScrollOffset = function () {
                    var scrollTop = $(window).scrollTop();
                    if (scrollTop > 30) {
                        $('#spotUI div.spotWrapper').css({
                            marginTop: scrollTop - 40
                        });
                    }
                };

                testForOtherSpots = function (pos) {
                    currentEtage.find('.spot').each(function () {
                        if (!$(this).hasClass('temp')) {
                            if (
                            pos.x > $(this).offset().left + $(this).width() && pos.x < $(this).offset().left) {
                                return true;
                            } else {
                                return false;
                            }
                        } else {
                            return true;
                        }
                    });
                };

                trackMoveMent = function (objElem) {
                    currentMouseover = currentEtage.mouseover;
                    currentEtage.unbind('mouseover');

                    objElem.mousemove(function (e) {
                        var widthXY = {
                            width: $(this).find('.temp').width() / 2,
                            height: $(this).find('.temp').height() / 2
                        };
                        if (
                        e.pageX > $(this).offset().left + 50 && e.pageX < ($(this).offset().left + $(this).width() - 40) && e.pageY < ($(this).offset().top + $(this).height() - 40) && e.pageY > $(this).offset().top + 40) {
                            newSpotTracker = $(this).find('.temp');
                            $(this).find('.temp').offset({
                                left: e.pageX - widthXY.width,
                                top: e.pageY - widthXY.height
                            });
                        }
                        if ($(this).find('.spot').length > 1) {
                            if ($(this).find('.temp').overlaps('.spot', { contract: -20 })) {
                                $(this).find('.temp').addClass('forbiddenSpot');
                            } else {
                                $(this).find('.temp').removeClass('forbiddenSpot');
                            }
                        }
                    });
                };
                miniPanelActions = function () {
                    $('#spotUI .closeBtn').hide();
                    $('#spotUI').show().animate({
                        right: '0%'
                    }, function () {
                        $('#spotUI .closeBtn').show();
                    });
                };

                registerPosition = function ($parent) {
                    if (newSpotTracker !== undefined && newSpotTracker.length && !newSpotTracker.hasClass('forbiddenSpot')) {
                        spotCoord = {
                            x: newSpotTracker.css('left').replace('px', ''),
                            y: newSpotTracker.css('top').replace('px', '')
                        }
                        if (currentEtage !== undefined) {
                            currentEtage.unbind('mousemove');
                        }
                        miniPanelActions();

                        if (!$('#spotUI div.spotWrapper div.newSpot').length) {
                            $('#spotUI div.spotWrapper').html(appHelpers.ui.getHTMLTemplate('newSpot'));
                            $('#spotUI div.newSpot li a').tooltip({
                                placement: 'left'
                            });
                        }
                    }
                };

                afterFormSubmition = function (data) {
                    if (newSpotTracker.hasClass('temp')) {
                        newSpotTracker.removeClass('temp');
                    }
                    closePanelAndResetWidget();
                };

                previewSpot = function () {

                };
                /*
                    =======================================================
                    ================EVENTS
                    =======================================================
                */

                showEvents = function () {
                    $('div.spotHolder a.spotLink').click(function(e) {
                        $(this).tooltip('hide');
                        $('#spotUI').addClass('preview');
                        appService.load($(this).attr('href'), null, null, function (data) {
                            if ($.browser.msie !== undefined && Number($.browser.msie.split('.')[1]) < 10) {
                                $('#spotUI').animate({ right: 0}, 1000);
                                $('#spotUI .closeBtn').hide().delay(1000).fadeIn();
                            } else {
                                $('#spotUI').css({ right: '0'});
                                $('#spotUI .closeBtn').show().css({right: '40.5%'});
                                $(this).show();
                            }
                            followScrollOffset();
                            $('div.spotWrapper').html($(data).find('#spotInfo').html());
                            $('.content.video').fitVids();
                        });
                        return false;
                    });
                    $('#spotUI .closeBtn').click(function () {
                        $(this).css({right: '-2%'});
                        if ($.browser.msie !== undefined && Number($.browser.msie.split('.')[1]) < 10) {
                            $('#spotUI').animate({ right: '-42%'}, 1000);
                        } else {
                            $('#spotUI').css({ right: '-42%'});
                        }
                        $('div.spotWrapper').delay().html('');
                        return false;
                    });
                };

                events = function () {
                    var spotIsset = false,
                        mouseOver, createSpotWidgetForm;

                    spotHoldermouseover = function (e) {
                        currentEtage = $(this);
                        if ($(this).find('.temp').length) {
                            $(this).find('.temp').remove();
                        }
                        if (!$(this).find('.temp').length) {
                          $(this).append(spotHtml.replace('{type}', 'temp spot'));
                        }
                        trackMoveMent($(this));
                    };
                    createSpotWidgetForm = function (data, _this) {
                        $('div.spotWrapper div.formWidgetWrapper').html(data);

                        $('form input#hotspot-positionX').val(Math.round(spotCoord.y));
                        $('form input#hotspot-positionY').val(Math.round(spotCoord.x));
                        $('form input#hotspot-floorId').val(newSpotTracker.closest('.etage').attr('data-id'));
                        $('form input#hotspot-hotspotTypeId').val(_this.attr('data-id'));
                        insertSpotWidget(_this.find('i').attr('class').split(' ')[0]);
                        $('div.formWidgetWrapper form').handleSubmit.afterAjax(afterFormSubmition);
                    };


                    $('#spotUI div.newSpot li a').live('click', function () {
                        var Edito, _this = $(this);
                        mediaType = $(this).attr('data-id');
                        $(this).tooltip('hide');
                        if (newSpotTracker !== undefined) {
                            newSpotTracker.find('span').html(
                            $(this).html().split('</i>').splice(0, $(this).html().split('</i>').length - 1).join('</i>').add('</i>')).find('i').removeClass('icon-white');
                            $(this).closest('div.spotWrapper').html(appHelpers.ui.getHTMLTemplate('tekstWidget'));
                            appService.load($(this).attr('href'), '.formWrapper', 'div.spotWrapper', function (data) {
                                createSpotWidgetForm(data, _this);
                            });
                        }
                        return false;
                    });
                    $('#hotspot div.submits.delete').live('click', function () {
                        var curSpot = $('div.spotHolder  .spot[data-id="'.add($('#hotspot-id').val()).add('"]'));
                        curSpot.addClass('aboutToDelete');
                        appHelpers.ui.message.showMessage({
                            confirm: true,
                            type: 'normal',
                            ajax: true,
                            jsonData: true,
                            url: '/hotspot/delete/id/'.add($('#hotspot-id').val()),
                            message: 'Weet je het zeker?',
                            onCancel: function () {
                                curSpot.removeClass('aboutToDelete');
                            },
                            afterAjax: function (data) {
                                if (data.success !== undefined && data.success) {
                                    curSpot.fadeOut();
                                    closePanelAndResetWidget();
                                }
                            }
                        });
                        return false;
                    });
                    $('#buildingCenter .front').mouseover(function (e) {

                    });

                    $('#spotUI .closeBtn, form input.annuleren').live('click', function (e) {
                        closePanelAndResetWidget();
                        return false;
                    });
                    $('.spot.registered').live('click', function () {
                        _this = $(this);
                        $('.spot.registered').removeClass('active');
                        _this.addClass('active');
                        followScrollOffset();
                        miniPanelActions();
                        $(this).tooltip('hide');
                        appService.load($(this).attr('data-href'), null, null, function (data) {
                            $('div.spotWrapper').html(data);
                            insertSpotWidget(_this.find('i').attr('class').split(' ')[0]);
                        });
                        return false;
                    });
                    $('#buildingCenter .spotHolder').mouseover(spotHoldermouseover);

                    $('#buildingCenter .spotHolder').live('click', function (e) {
                        followScrollOffset();
                        registerPosition();
                    });
                };

                /*
                    =======================================================
                    ================INIT
                    =======================================================
                */

                init = function () {
                    $('.spot').tooltip();
                    $('.spot').each(function () {
                        if ($(this).attr('data-tumb') !== undefined && $(this).attr('data-tumb').length > 1) {
                            $(this).hover(function () {
                                var html = '<img src="'.add($('.spot').attr('data-tumb'))
                                    .add('" />').add('<span class="play"></span>').tagWrap('div.tipContVid');
                                $('.tooltip .tooltip-inner').html(html);
                                console.log(html);
                                $('.tooltip .tooltip-inner').text('helo');
                                console.log($('.tooltip .tooltip-inner'));
                            });
                        }
                    });
                    if (!$('#buildingWrap').hasClass('preview')) {
                        spotHtml = appHelpers.ui.getHTMLTemplate('tempSpot');
                        events();
                    } else {
                        showEvents();
                    }
                };


                return {
                    init: function () {
                        init();
                    }
                };
            }()),
            add: function () {
                $('header').append(''.tagWrap('span.toggleBtn').tagWrap('div.toggler'));
                $('#appContent').append(''.tagWrap('div#cloud1.clouds data-stellar-ratio=0.4').add(''.tagWrap('div#cloud2.clouds data-stellar-ratio=0.5')).add(''.tagWrap('div#cloud3.clouds data-stellar-ratio=0.3'))).prepend(''.tagWrap('div.sun id=sunItem data-stellar-ratio=0.6'));

            },
            events: {
                toggleHeader: function () {
                    toggleHeader();
                },
                afterAjaxFunctions: function () {
                    appService.afterAjax.addEvent(appHelpers.ui.panels);
                    appService.afterAjax.addEvent(appHelpers.ui.message.staticMessage);
                    appService.afterAjax.addEvent(appUI.handlePannels.colorPanels);
                },
                ajaxActions: function () {
                    var formSuccesTarget;
                    /**
                    ================================================================
                        Block all lines if tag attribute data-nojs = true
                    ================================================================
                    */
                    if ($('#pannelEtages').attr('data-nojs') === 'true') {
                        return false;
                    }

                    $('.imgProd.add a, a[data-ajax="call"]').live('click', function () {
                        appUI.handlePannels.openSecondPanel();
                        appService.load($(this).attr('href'), '#extraPanelContent', '#panelElements', function () {
                            appUI.handlePannels.openSecondPanel();
                        });
                        return false;
                    });

                    $('form').live('submit', function () {
                        var _this = $(this), json = _this.attr('no-json') === 'true' ? false : true;
                        if (_this.attr('data-nojs') !== 'true') {
                           appService.post($(this), null, null, function(data) {
                                _this.handleSubmit.submitted(data);
                            }, {}, json);
                            return false;
                        }
                    });

                    $('#pannelEtages div.tools a.edit').live('click', function () {
                        appService.load($(this).attr('href'), '#extraPanelContent', '#panelElements', function (data) {
                                appUI.handlePannels.openSecondPanel();
                        });
                        return false;
                    });
                    $('#pannelEtages div.tools a.duplicate').live('click', function () {
                        appService.load($(this).attr('href'), '#panelElements', '#panelElements');
                        return false;
                    });
                    $('#pannelEtages div.tools a.delete').live('click', function () {
                        var url = $(this).attr('href'), _this = $(this);
                        _this.closest('li').addClass('aboutToDelete');

                        appHelpers.ui.message.showMessage({
                            confirm: true,
                            type: 'normal',
                            ajax: true,
                            jsonData: true,
                            url: url,
                            message: 'Weet je het zeker?',
                            onCancel: function () {
                                _this.closest('li').removeClass('aboutToDelete');
                            },
                            afterAjax: function (data) {
                                if (data.success) {
                                   _this.closest('li').delay(500).hide('slow');
                                    return false;
                                } else {
                                    appHelpers.ui.message.showMessage({
                                        type: 'error',
                                        confirm: false,
                                        message: data.message
                                    });
                                }
                            }
                        });
                        return false;
                    });
                }
            }
        };
    }());
}(jQuery));
//============ jQuery init
$(function () {
    appHelpers.tools.prototypes();
    $('#pannelEtages').removeAttr('data-nojs');
    appUI.add();
    appUI.events.afterAjaxFunctions();
    appUI.events.ajaxActions();
    appUI.handlePannels.init();
    appUI.handlePannels.colorPanels();
    appUI.events.toggleHeader();
    appUI.spots.init();
    appHelpers.ui.panels();
    appHelpers.ui.message.create();
    appService.loaderIcon.create();
    $.stellar();
    $('input[type=file]').multiUpload({uniqueId: $('#progress_key').val()});

});