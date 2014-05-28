/*
Dump events triggered to console
*/
$(document).on("pagebeforeload pageload pageloadfailed pagebeforechange pagechange pagechangefailed pagebeforeshow pagebeforehide pageshow pagehide pagebeforecreate pagecreate pageinit pageremove updatelayout ready", function (e) {
    console.log(e.type + '  ID: ' + $.mobile.pageContainer.pagecontainer("getActivePage").attr('id'));
});
