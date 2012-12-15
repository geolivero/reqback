/*var appHelpers = require('./appui/helpers/'),
    appService = require('./appui/appService/').appService,
    appUI = require('./appui/appUI/').appUI,
    appAddMarkup = require('./appui/appUI/addHtmlMarkup').addHtmlMarkup;
    $ = jQuery;
$(function () {
    appAddMarkup();
    appUI.handlePannels.init();
    appUI.handlePannels.colorPanels();
    appUI.spots.init();
    appUI.events.afterAjaxFunctions();
    appUI.events.ajaxActions();
    appUI.events.toggleHeader();
    appHelpers.tools.prototypes();
    appHelpers.ui.message.create();
    appService.loaderIcon.create();
    appUI.spotInformation.init();
    appUI.manageCompany();

    // Pluginn
    $.stellar();
    $('input[type=file]').multiUpload({uniqueId: $('#progress_key').val()});
});
*/
define(['jquery', 'appui/appUI/addHtmlMarkup', 'tools', 'appui/appUI/managePanels', 'appui/appUI/manageSpots'],
    function ($, AddMarkup, Tools, ManagePanels, ManageSpots){
    return {
        initialize: function () {

            Tools.prototypes();

            $(function () {
                AddMarkup.initialize();
                ManagePanels.initialize();
                ManagePanels.colorPanels();
                ManageSpots.initialize();
            });
        }
    };
});