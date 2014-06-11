/*
JavaScript object to support load data configuration
*/
DataConfigObj = function (LBXMLInd, LBJSONInd, TRNXMLInd, SCRDXMLInd, PRNGXMLInd) {
    this.LeaderXMLInd = LBXMLInd;
    this.LeaderJSONInd = LBJSONInd;
    this.TournXMLInd = TRNXMLInd;
    this.SCRDXMLInd = SCRDXMLInd;
    this.PRNGXMLInd = PRNGXMLInd;
}
/*
Converts XML text and returns an XML document
*/
StringtoXML = function (text) {
    console.log('func StringtoXML');
    if (window.ActiveXObject) {
        var doc = new ActiveXObject('Microsoft.XMLDOM');
        doc.async = 'false';
        doc.loadXML(text);
    } else {
        var parser = new DOMParser();
        var doc = parser.parseFromString(text, 'text/xml');
    }
    return doc;
}
/*
Get Query String Parms
*/
QryStr = function (key) {
    console.log('func QryStr');
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars[key];
}
/*
JavaScript object to support creation of JQM Grid from XML
*/
GridConfObj = function () {
    this.GridName = "Generic";       //General Name for Grid (no spaces)
    this.GridType = 0;               //Grid type ("Grid" by default)
    this.XMLDoc = undefined;         //XML document loaded (response XML)
    this.DocInd = true;              //indicator if XML document is available (true or false)
    this.XMLListTag = undefined;     //XML tagname for NodeList
    this.ColTagPkey = "ID";     //Column Name that is the Primary Key (default is "ID")
    this.HeaderList = undefined;     //List of Header Names
    this.ColTagList = undefined;     //List of XML tagname of column values
    this.ColImgList = undefined;     //List of references to images for a column
    this.ColTagListWidgt = undefined; //List of Widgets
    this.ColTagListFlter = undefined //configure the filter for ColTagList item
    this.JQAnchorSel = undefined;    //jquery selector to anchor the created grid
    this.ErrMsg = undefined;         //Error message
    this.userarg1 = undefined;       //user argument 1
    this.userarg2 = undefined;
    this.userarg3 = undefined;
}
/*
JQM Grid Event Args Object
*/
GridEventArgs = function () {
    this.app = undefined;
    this.gridConfObj = undefined;
    this.pkId = undefined;
    this.content = undefined;
    this.colNbr = undefined;
    this.rowNbr = undefined;
}
/*
Var to determine mobile device
*/
var isMobile = {
    Android: function () {
        return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function () {
        return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function () {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function () {
        return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function () {
        return navigator.userAgent.match(/IEMobile/i);
    },
    any: function () {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
    }
};

/*
display error page
*/
function handleAppError(msg, url, line) {
    console.log('func handleAppError');
    console.log('msg:' + msg);
    console.log('url:' + url);
    console.log('line:' + line);
    page = '<section id="errorpage" data-role="page" data-title="Error Page" data-theme="h">\
              <div data-role="header">\
                  <h1>Error Page</h1>\
              </div>\
              <article data-role="content">\
                <h3>Error Message</h3>\
                MSG\
                <h3>URL of Script</h3>\
                URLL\
                <h3>Line</h3>\
                LINE\
              </article>\
           </section>';

    var newPage = $(page);
    newPage.html(function (index, old) {
        return old
                .replace(/MSG/g, msg)
                .replace(/URLL/g, url)
                .replace(/LINE/g, line)
    }).appendTo($.mobile.pageContainer);
    $.mobile.changePage(newPage);

} //function handleAppError(msg, url, line) {
/*
Windows handler of all errors
*/
window.onerror = function (msg, url, line) {
    console.log('func oneerror');

    if (typeof msg == 'object') {
        //alert('onerror handled an error with message an Object')
        console.log('onerror handled an error with message an Object')
    } else {
        handleAppError(msg, url, line);
    }


}

/*
This function executes after the following events
pagebeforechange, pagebeforecreate, pagecreate, 
pageinit, pagebeforeshow, pageshow, pagechange
note: document ready occurs after all these.
*/
$(function () {

    

    // define the application
    var eventApp = {};

    // start the external panel
    $("[data-role=panel]").panel();
    $("[data-role=panel]").listview();
    $("[data-role=panel]").trigger("create");

    (function (app) {
        console.log('func app');
        /* Localstorage
        localStorage["LBXMLDoc"] - Leaderboard XML Doc
        localStorage["LBJSONDoc"] - Leaderboard JSON Doc
        localStorage["TRNXMLDoc"] - Tournament XML Doc
        localStorage["SCRDXMLDoc"] - Scorecards XML Doc
        localStorage["PRNGXMLDoc"] - Pairing XML Doc
        localStorage["CRSEXMLDoc"] - Course XML Doc
        localStorage["Config-LB-XML-Ind"]
        localStorage["Config-LB-JSON-Ind"]
        localStorage["Config-TRN-XML-Ind"]  
        localStorage["Config-SCRD-XML-Ind"] 
        localStorage["Config-PRNG-XML-Ind"] 
        localStorage["Config-CRSE-XML-Ind"] 
        localStorage["Config-ThemeLetter"]
        localStorage["Config-MaxList-Nbr"]
        localStorage["Config-JQMGridStyle"]
        localStorage["Config-JQMGridHeaderStyle"]
        localStorage["Config-TextFont-Size"]
        */

        /*
        Globals
        */

        //set tournament ID from query string parm
        var tournID = undefined;
        (QryStr("tournID") != undefined) ? tournID = QryStr("tournID") : tournID = 27828; //by default for testing

        var HierFilterType = { "None": 0, "First": 1, "Index": 2, "Seek": 3 };
        var GridWidgetType = { "Text": 0, "Button": 1, "Anchor": 2, "Hide": 3 };
        var GridType = { "Grid": 0, "List": 1 };
        //this values are generic for custom functions of the generic JQM grid (not happy as global, but it works)
        var valRow0, valRow1, valRow2, valRow3, valRow4 = undefined;
        var userarg1, userarg2, userarg3 = null;

        app.init = function () {
            //this occurs after document is ready (runs once)
            console.log('func app.init');
            app.bindings();
            app.setNavAndToolBars($("[data-role='page']")); //MNS
            app.setTheme();
            //app.checkForStorage();
        };

        app.bindings = function () {

            /*
            document ready event
            Start the XMLHttpRequest (download xml and jason files) 
            when document ready event is triggered. Store documents in localStorage
            */
            $(document).on("ready", function (event) {  //jquery document ready event gets you jquery mobile styles, and data rendered
                console.log('event doc ready');

                //override the console.log if production (disable console)
                $(function () {
                    if ($('body').data('env') == 'production') {
                        console.log = function () { };
                    }
                });


                //start the XMLHTTP request to load leaderboards.xml, the event
                //request.onreadystatechange will handle the parsing when its complete
                if (app.appPropDoc("LBXMLDoc") == undefined) {
                    app.loadXML('./data/leaderboards.xml');
                }

                if (app.appPropDoc("TRNXMLDoc") == undefined) {
                    app.loadXML('./data/tournament.xml');
                }

                if (app.appPropDoc("SCRDXMLDoc") == undefined) {
                    app.loadXML('./data/scorecards.xml');
                }

                if (app.appPropDoc("PRNGXMLDoc") == undefined) {
                    app.loadXML('./data/pairings.xml');
                }

                if (app.appPropDoc("CRSEXMLDoc") == undefined) {
                    app.loadXML('./data/course.xml');
                }

                //Get and parse leaderboards.json, renders the updateJSON tag
                if (app.appPropDoc("LBJSONDoc") == undefined) {
                    app.loadLeaderboardJSON();
                }

            });

            /*
            pageinit on settings page - renders settings page with jqm widgets
            */
            $(document).on('pageinit', '#settings', function () {
                console.log('event doc pageinit #settings render');

                //set settings theme radiobox, data load checkboxes, max players in leadboard slider from localStorage
                app.renderRBTheme(app.appProp("Config-ThemeLetter"), true);

                dataConfigObj = new DataConfigObj(app.appProp("Config-LB-XML-Ind"), app.appProp("Config-LB-JSON-Ind"),
                                                  app.appProp("Config-TRN-XML-Ind"), app.appProp("Config-SCRD-XML-Ind"),
                                                  app.appProp("Config-PRNG-XML-Ind"), app.appProp("Config-CRSE-XML-Ind"));
                app.renderCBData(dataConfigObj)

                app.renderSDRMaxListNbr(app.appProp("Config-MaxList-Nbr"));

                app.renderMisc(app.appProp("Config-JQMGridStyle"), app.appProp("Config-JQMGridHeaderStyle"))

                app.renderTextFontSize(app.appProp("Config-TextFont-Size"));

                //update the theme on all pages
                //app.updateThemeAllPages(app.appProp("Config-ThemeLetter")); MNS

                //open up the settings theme section by default
                $('#sectionTheme').collapsible({ collapsed: false });


            });

            /*
            pageinit on settings page - bind the settings page events (radiobox onchange, checkbox onchange)
            */
            $(document).on('pageinit', '#settings', function () {
                console.log('event doc pageinit #settings handlers');

                //settings theme radiobox change event
                $("input[name ='RBTheme']").on('change', function () {

                    localStorage["Config-ThemeLetter"] = app.getRBTheme();
                    app.renderRBTheme(app.appProp("Config-ThemeLetter"), true);

                    //settings page
                    $('#settings div[data-role=collapsibleset]').collapsibleset("option", "theme", app.appProp("Config-ThemeLetter"));
                    $('#settings div[data-role=collapsibleset]').collapsibleset("refresh");

                    //$('#popupMsg').popup("open", { x: 100, y: 200, transition: "slide" }); if we want to use fixed coord
                    $('#popupMsg').popup("open", { transition: "slide" });


                }); //$("input[name ='RBTheme']").on('change', function () {

                //settings leadboard checkbox change event
                $("[id^=CBLeaderboard]").on('change', function () {

                    //toggle the data checkbox (actually in the DOM)
                    if ($(this).attr("checked")) {
                        $(this).attr("checked", false).checkboxradio("refresh");
                    } else {
                        $(this).attr("checked", true).checkboxradio("refresh");
                    }

                    dataConfigObj = app.getCBData(this);
                    localStorage["Config-LB-XML-Ind"] = dataConfigObj.LeaderXMLInd;
                    localStorage["Config-LB-JSON-Ind"] = dataConfigObj.LeaderJSONInd;
                    localStorage["Config-LB-TRN-Ind"] = dataConfigObj.TournXMLInd;

                    app.renderCBData(dataConfigObj);

                    //settings page
                    $('#settings div[data-role=collapsibleset]').collapsibleset("option", "theme", app.appProp("Config-ThemeLetter"));
                    $('#settings div[data-role=collapsibleset]').collapsibleset("refresh");


                }); //$("[id^=CBLeaderboard]").on('change', function () {

                $("input[name ='SDRMaxListNbr']").on('change', function () {
                    //$("input[name ='SDRMaxListNbr']").on('slidestop', function () {

                    localStorage["Config-MaxList-Nbr"] = app.getSDRMaxListNbr();

                    //settings page
                    $('#settings div[data-role=collapsibleset]').collapsibleset("option", "theme", app.appProp("Config-ThemeLetter"));
                    $('#settings div[data-role=collapsibleset]').collapsibleset("refresh");


                }); //$("input[name ='SDRMaxListNbr']").on('change', function () {

                $('#JQMGridStyle').on('focusout', function () {

                    localStorage["Config-JQMGridStyle"] = $('#JQMGridStyle').val();

                    event.preventDefault();

                }); //$('#JQMGridStyle').on('focusout', function () {

                $("[name='JQMGridHeaderStyle']").on('change', function () {
                    localStorage["Config-JQMGridHeaderStyle"] = $("[name='JQMGridHeaderStyle'] option:selected").text();
                }); // $("[name='JQMGridHeaderStyle']").on('change', function () {

                $("input[name ='TextFontSize']").on('change', function () {

                    localStorage["Config-TextFont-Size"] = app.getTextFontSize();

                }); //$("input[name ='TextFontSize']").on('change', function () {

            });

            /*
            pageinit on players page - renders leaderboard
            */
            $(document).on('pageinit', '#players', function () {
                console.log('event doc pageinit #players');

                //render leaderboard XML and JSON
                app.renderLeaderboardXML(app.appPropDoc("LBXMLDoc"));
                app.renderLeaderboardJSON(app.appPropDoc("LBJSONDoc"));

                $(document).on("pagebeforeshow", "#players", function () {
                    app.renderLeaderboardXML(app.appPropDoc("LBXMLDoc"));
                    app.renderLeaderboardJSON(app.appPropDoc("LBJSONDoc"));
                });

            });

            /*
            pageinit on tournament page - bind on players page pagebeforeshow event - set the round list for XML and JSON
            */
            $(document).on('pageinit', '#tournament', function () {
                console.log('event doc pageinit #tournament');

                app.renderTournamentXML();

                $(document).on("pagebeforeshow", "#tournament", function () {
                    app.renderTournamentXML();
                });
            });

            /*
             pageinit on scorecard page - renders scorecard
             */
            $(document).on('pageinit', '#pairings', function () {
                console.log('event doc pageinit #pairings');

                app.renderPairingsXML();

                $(document).on("pagebeforeshow", "#pairings", function () {
                    app.renderPairingsXML();
                });

            });

            /*
             pageinit on scorecard page - renders scorecard
             */
            $(document).on('pageinit', '#scorecard', function () {
                console.log('event doc pageinit #scorecard');
                app.renderPlayerScorecard();

                $(document).on("pagebeforeshow", "#scorecard", function () {
                    app.renderPlayerScorecard();
                });
            });

            /*
            pageinit on scorecarddetail page - renders scorecarddetail
            */
            $(document).on('pageinit', '#scorecarddetail', function () {
                console.log('event doc pageinit #scorecarddetail');

                app.renderPlayerScorecardDetail();

                $(document).on("pagebeforeshow", "#scorecarddetail", function () {
                    app.renderPlayerScorecardDetail();
                });
            });

            /*
            pageinit on course page - renders course
            */
            $(document).on('pageinit', '#course', function () {
                console.log('event doc pageinit #course');

                app.renderCourse();

                $(document).on("pagebeforeshow", "#course", function () {
                    app.renderCourse();
                });
            });

            /*
            pageinit on all pages - bind on pagebeforeshow event (all pages/w data-role page) - Set the Nav and Toolbars based on the page showing
            */
            $(document).on('pageinit', function () {
                console.log('event doc pageinit');

                $(document).on("pagebeforeshow", "[data-role='page']", function () {
                    app.setNavAndToolBars($(this)); //MNS
                    app.setTheme();
                });

                $(document).on("pagebeforeshow", function () {
                    //any style update that is generic for all pages should go here.
                    $('.dynamicFontSize').css("font-size", app.appProp("Config-TextFont-Size") + "%");
                });

            });

        }; //app.bindings = function () {

        /*
        set the theme of the active jquery mobile page
        */
        app.setTheme = function () {
            console.log('func app.setTheme');

            console.log('setTheme > ID: ' + $.mobile.pageContainer.pagecontainer("getActivePage").attr('id'));
            $.mobile.pageContainer.pagecontainer("getActivePage").page().page("option", "theme", app.appProp("Config-ThemeLetter"));

            $('article div.ui-corner-all.custom-corners.spacing .ui-bar').addClass('ui-bar-'
                + app.appProp("Config-ThemeLetter"));
        };

        /*
        set the navigation and tool bars heading, and active buttons
        */
        app.setNavAndToolBars = function ($Nav) {
            console.log('func app.setNavAndToolBars');

            //set up fixed navbar, toolbar
            $("[data-role='navbar']").navbar();
            $("[data-role='header']").toolbar();

            // Each of the four pages in this demo has a data-title attribute
            // which value is equal to the text of the nav button
            // For example, on first page: <div data-role="page" data-title="Info">
            var current = $Nav.jqmData("title");
            // Change the heading
            $("[data-role='header'] h1").text(current);
            // Remove active class from nav buttons
            $("[data-role='navbar'] a.ui-btn-active").removeClass("ui-btn-active");
            // Add active class to current nav button
            $("[data-role='navbar'] a").each(function () {
                if ($(this).text() === current) {
                    $(this).addClass("ui-btn-active");
                }
            });

        };

        /*
        return theme letter from #settings theme radiobox
        */
        app.getRBTheme = function () {
            console.log('func app.getRBTheme');

            radioButtonSelectedVal = $('input[name="RBTheme"]:checked').val(); //on OR off
            radioButtonSelectedID = $('input[name="RBTheme"]:checked').attr('id'); //id of the radio box
            return radioButtonSelectedID.substr(8, radioButtonSelectedID.length - 8);

            //this isn't supported by safari mobile - I think it's the custom attr
            //return $('label[for="' + radioButtonSelectedID + '"').attr("data-themeLetter"); 
        };

        /*
        set the theme section (collapsible widget) and the theme radio box
        */
        app.renderRBTheme = function (themeLetter, saveEnabled) {
            console.log('func app.renderRBTheme');

            //Don't need to set the Legend of the radiobox for the moment
            //myLegend = $('form fieldset legend').html('Current Theme :  ' + themeLetter.toUpperCase());

            //Set the current theme text on the collapsible (note as of 1.4.1 - collapsible{{headings : "xyz"}) doesn't work
            $('#sectionTheme h3 a').text('Selected Theme : ' + themeLetter.toUpperCase());

            $("#RBTheme-" + app.appProp("Config-ThemeLetter")).attr("checked", true);

            if (saveEnabled) {
                $('input[value="Save"]').button().button({ "disabled": false });
                $('input[value="Reset"]').button().button({ "disabled": false });
            } else {
                $('input[value="Save"]').button().button({ "disabled": true });
                $('input[value="Reset"]').button().button({ "disabled": true });
            }

            //Programmatically setting the theme for each item in radio box (the label text works, but not the style.. html is generated fine)
            //$("[name='#RBTheme-']").each(function () {
            //    theThemeLetter = $("label[for='" + $(this).attr('id') + "']").attr("data-themeLetter");
            //    $(this).attr("data-theme", theThemeLetter);
            //    $("label[for='" + $(this).attr('id') + "']").text($("label[for='" + $(this).attr('id') + "']").text() + " SCHOENY");
            //    $("label[for='" + $(this).attr('id') + "']").removeClass("ui-btn-inherit");
            //    $("label[for='" + $(this).attr('id') + "']").addClass("ui-btn-up-b");
            //});

            $("input[name ='RBTheme']").checkboxradio("refresh");
        };

        /*
        get config data checkbox - returns DataConfigObj
        */
        app.getCBData = function (CBObj) {
            console.log('func app.getCBData');

            dataConfigObj = new DataConfigObj(app.appProp("Config-LB-XML-Ind"), app.appProp("Config-LB-JSON-Ind"),
                                              app.appProp("Config-TRN-XML-Ind"), app.appProp("Config-SCRD-XML-Ind"),
                                              app.appProp("Config-PRNG-XML-Ind"), app.appProp("Config-CRSE-XML-Ind"));

            if ($(CBObj).attr('name') == "CBLeaderboardXML") {
                if ($(CBObj).attr("checked") == "checked") {
                    dataConfigObj.LeaderXMLInd = true;
                } else {
                    dataConfigObj.LeaderXMLInd = false;
                }
            }
            if ($(CBObj).attr('name') == "CBLeaderboardJSON") {
                if ($(CBObj).attr("checked") == "checked") {
                    dataConfigObj.LeaderJSONInd = true;
                } else {
                    dataConfigObj.LeaderJSONInd = false;
                }
            }

            dataConfigObj.TournXMLInd = true; //set it to true, until we add config in settings
            dataConfigObj.SCRDXMLInd = true;
            dataConfigObj.PRNGXMLInd = true;

            return dataConfigObj;
        };

        /*
        set config data checkbox - pass DataConfigObj
        */
        app.renderCBData = function (dataConfigObj) {
            console.log('func app.renderCBData');


            sectionHeader = "Data : Leadboard ";

            if (dataConfigObj.LeaderXMLInd) {
                $("input[name ='CBLeaderboardXML']").attr("checked", true).checkboxradio("refresh");
                sectionHeader += "XML ON"
            } else {
                $("input[name ='CBLeaderboardXML']").attr("checked", false).checkboxradio("refresh");
                sectionHeader += "XML OFF"
            }
            if (dataConfigObj.LeaderJSONInd) {
                $("input[name ='CBLeaderboardJSON']").attr("checked", true).checkboxradio("refresh");
                sectionHeader += " JSON ON"
            } else {
                $("input[name ='CBLeaderboardJSON']").attr("checked", false).checkboxradio("refresh");
                sectionHeader += " JSON OFF"
            }

            $('#sectionData h3 a').text(sectionHeader);


        };

        /*
        set config slider value for max list number
        */
        app.renderSDRMaxListNbr = function (value) {
            console.log('func app.renderSDRMaxListNbr');


            $("#SDRMaxListNbr").slider().val(value).slider("refresh");

            $('#sectionMaxListNbr h3 a').text('Max List Items: ' + value);
        }

        /*
        set config slider value for max list number
        */
        app.renderTextFontSize = function (value) {
            console.log('func app.renderTextFontSize');

            $("#TextFontSize").slider().val(value).slider("refresh");
        }

        /*
        set config miscellaneous
        */
        app.renderMisc = function (JQMGridStyle, JQMGridHeaderStyle) {
            console.log('func app.renderMisc');

            $("#JQMGridStyle").val(JQMGridStyle);

            $aSelectMenu = $("[name='JQMGridHeaderStyle'] [value='" + JQMGridHeaderStyle + "']");
            $aSelectMenu.attr("selected", true);
            $("[name='JQMGridHeaderStyle']").selectmenu().selectmenu("refresh");
        }

        /*
        return config slider value for max list nbr
        */
        app.getSDRMaxListNbr = function () {
            console.log('func app.getSDRMaxListNbr');

            return $("#SDRMaxListNbr").slider().val();
        }

        /*
        return config slider value for text font size
        */
        app.getTextFontSize = function () {
            console.log('func app.getTextFontSize');

            return $("#TextFontSize").slider().val();
        }

        /*
        doesn't load leaderboard XML onto itself. It initiaties the loading
        Note: the request.onreadystatechange event loads into LocalStorage
        */
        app.loadXML = function (filepath) {
            console.log('func app.loadXML');

            $.get(filepath, {}, function (xml) {


                if (typeof xml == "object") {
                    console.log('its an object');
                    console.log('$.type:' + $.type(xml))
                    console.log('object name:' + xml.constructor.name);

                    xmlText = (new XMLSerializer()).serializeToString(xml);
                } else {
                    console.log('its a string');
                    xmlText = xml;
                }

                console.log('loaded filepath:' + xmlText.substr(0, 50));

                switch (filepath) {
                    case "./data/leaderboards.xml":
                        localStorage["LBXMLDoc"] = xmlText;
                        break;
                    case "./data/tournament.xml":
                        localStorage["TRNXMLDoc"] = xmlText;

                        /*debug statements */
                        xmlAgain = app.appPropDoc("TRNXMLDoc");
                        console.log('$.type:' + $.type(xmlAgain))
                        console.log('object name:' + xmlAgain.constructor.name);
                        console.log('RAW XML FROM $.GET INNERHTML:' + xmlAgain.documentElement.innerHTML);
                        console.log('RAW XML FROM $.GET HTML:' + xmlAgain.html);
                        console.log('Object JQuery StartDate' + $("Tournament[ID='" + 27828 + "'] Round[ID='" + 3 + "']", xmlAgain).attr("StartDate"));
                        console.log('LocalStorage getElementsByTagName(EndDate)=' + xmlAgain.getElementsByTagName("Round")[2].getAttribute('EndDate'));
                        /*debug statements */

                        break;
                    case "./data/scorecards.xml":
                        localStorage["SCRDXMLDoc"] = xmlText;
                        break;
                    case "./data/pairings.xml":
                        localStorage["PRNGXMLDoc"] = xmlText;
                        break;
                    case "./data/course.xml":
                        localStorage["CRSEXMLDoc"] = xmlText;
                        break;
                    default:
                        alert('Unexpected XML doc to load - Type: ' + filepath);
                        break;

                } //switch(filepath)
                console.log('loadXML:' + filepath);

            }, 'xml');

        }; //app.loadXML = function (filepath) {

        /*
        loads leaderboard jason into LocalStorage
        */
        app.loadLeaderboardJSON = function () {
            console.log('func app.loadleaderboardJSON');

            if (app.appPropDoc("LBJSONDoc") == undefined) {
                $.getJSON('./data/leaderboards.json', function (data) {
                    localStorage["LBJSONDoc"] = JSON.stringify(data);
                });
            }
        };

        /*
        create html for scorecard of a player page
        */
        app.renderPlayerScorecard = function () {
            console.log('func app.renderPlayerScorecard');

            playerID = $('#scorecard').attr("data-playerid"); //real code

            xmlDoc = app.appPropDoc("SCRDXMLDoc");
            FirstName = $("Tournament[ID='" + tournID + "'] Player[ID='" + playerID + "']", xmlDoc).attr("FirstName");
            LastName = $("Tournament[ID='" + tournID + "'] Player[ID='" + playerID + "']", xmlDoc).attr("LastName");

            if (FirstName == null) FirstName = "Player Not in Database";
            if (LastName == null) LastName = "";

            totalScore = app.jqmAttrSum("Tournament[ID='" + tournID + "'] Player[ID='" + playerID + "'] Scorecard",
                                        xmlDoc,
                                        "RoundScore")

            if (totalScore == 0) totalScore = "Score Not in Database";

            //update name in header and total score
            $('#scorecard .posterText h3:first').html(FirstName + ' ' + LastName);
            $('#scorecard .posterText h3:nth-child(2)').html('Tournament Score: ' + totalScore);


            app.renderScorecardXML();
        };

        /*
        create html for scorecarddetail of a player page
        */
        app.renderPlayerScorecardDetail = function () {
            console.log('func app.renderPlayerScorecardDetail');

            playerID = $('#scorecarddetail').attr("data-playerid"); //real code
            scorecardID = $("#scorecarddetail").attr("data-scorecardid");
            roundID = $("#scorecarddetail").attr("data-roundid");


            xmlDoc = app.appPropDoc("SCRDXMLDoc");
            FirstName = $("Tournament[ID='" + tournID + "'] Player[ID='" + playerID + "']", xmlDoc).attr("FirstName");
            LastName = $("Tournament[ID='" + tournID + "'] Player[ID='" + playerID + "']", xmlDoc).attr("LastName");

            if (FirstName == null) FirstName = "Player Not in Database";
            if (LastName == null) LastName = "";

            totalScore = app.jqmAttrSum("Tournament[ID='" + tournID + "'] Player[ID='" + playerID + "'] Scorecard[ID='" + scorecardID + "'] Score",
                            xmlDoc,
                            "Score")

            if (totalScore == 0) totalScore = "Score Not in Database";

            //update name in header and total score for the round
            $('#scorecarddetail .posterText h3:first').html(FirstName + ' ' + LastName);
            $('#scorecarddetail .posterText h3:nth-child(2)').html('Round ' + roundID + ' Score: ' + totalScore);

            app.renderScorecardDetailXML(tournID, playerID, scorecardID);
        };

        /*
        create html for course page
        */
        app.renderCourse = function () {
            console.log('func app.renderCourse');

            app.renderCourseXML();
        };

        /*
        create html for leaderboard list and attach to players page (leaderboardXML - XML from XMLHttpResponse)
        */
        app.renderLeaderboardXML = function (leaderboardXMLDoc) {
            console.log('func app.renderLeaderboardXML');

            //render tournament XML
            gridConfObj = new GridConfObj();
            gridConfObj.GridName = "Leaderboard";
            gridConfObj.GridType = GridType.List;
            gridConfObj.XMLDoc = app.appPropDoc("LBXMLDoc");
            gridConfObj.DocInd = app.appProp("Config-LB-XML-Ind");
            gridConfObj.XMLListTag = "Player";
            //gridConfObj.HeaderList (NA)

            if (isMobile.Windows()) {
                gridConfObj.ColTagList = new Array("'<h1>'+FirstName+' '+LastName+' ('+app.fnGridLBTotalScore(pKey)+')</h1>'");
            } else {
                gridConfObj.ColTagList = new Array("'<h1>'+FirstName+' '+LastName+' ('+app.fnGridLBTotalScoreForaNode(aNode)+')</h1>'");
            }

            //gridConfObj.ColImgList = new Array("'./images/players/'+FirstName+LastName+'.jpg'"); //THIS WORKS

            //Doing a little hack to give settings ability to toggle leaderboard listview styles
            eval('var jqmStyle=' + app.appProp("Config-JQMGridStyle"));
            imagePath = './images/players/' + jqmStyle["Leaderboard"] + '.jpg';
            gridConfObj.ColImgList = new Array("'" + imagePath + "'");  //TEMPORARY UNTIL WE GET REAL IMAGES
            gridConfObj.ColTagListWidgt = new Array(GridWidgetType.Anchor);
            gridConfObj.ColTagListFlter = new Array(null);
            gridConfObj.JQAnchorSel = "#updLeadersXML";
            gridConfObj.ErrMsg = "Leaderboard XML Data";
            app.renderJQMGrid(gridConfObj);
        };

        /*
        create html for leaderboard list and attach to players page (leaderboardJSON - JSON data object from $get.JSON)
        */
        app.renderLeaderboardJSON = function (JSONObj) {
            console.log('func app.renderLeaderboardJSON');

            //get javascript array for all grid styles
            eval('var jqmStyle=' + app.appProp("Config-JQMGridStyle"));

            output = '<div class="infoMsg">Leadboard JSON Data Not Acquired</div>';


            if (app.appProp("Config-LB-JSON-Ind")) {
                if (JSONObj != undefined) {

                    nbrPlayers = 1;

                    // var myString = jsonPath(JSONObj, "$.Tournament").toJSONString();
                    var firstNames = jsonPath(JSONObj, "$..Tournament.Leaderboard.Player[*].-FirstName"); //get all first names of players on the leaderboard
                    var lastNames = jsonPath(JSONObj, "$..Tournament.Leaderboard.Player[*].-LastName"); //get all first names of players on the leaderboard
                    var allNames = jsonPath(JSONObj, "$..Tournament.Leaderboard.Player[*]"); //get all players object on the leaderboard

                    //output = '<ul id="leadersListJSON" data-role="listview" data-filter="true" data-input="#fltLeadersJSON" data-theme="h" data-split-theme="h" data-split-icon="gear">'; //spilt listview - two links
                    output = '<form class="ui-filterable"><input id="fltLeadersJSON" data-type="search"></form>';
                    output += '<ul id="leadersListJSON" data-role="listview" data-filter="true" data-input="#fltLeadersJSON" data-inset="true" class="' + jqmStyle["Leaderboard"] + '">'; //spilt listview - two links

                    for (obj in allNames) {
                        //console.log(allNames[obj]['-FirstName'] + ' ' + allNames[obj]['-LastName']);
                        firstName = allNames[obj]['-FirstName'];
                        lastName = allNames[obj]['-LastName'];

                        output += '<li>' +
                        '<a href="' + '#artwork_' + firstName + '_' +
                        lastName + '" data-transition="slide"> ' +
                        '<img src="./images/players/' + jqmStyle["Leaderboard"] + '.jpg"' +
                        '<h1>' + firstName + ' ' + lastName + '</h1>' +
                        '</li>';

                        if (++nbrPlayers > app.appProp("Config-MaxList-Nbr")) {
                            break; //break out of this loop; when nbr of players have been listed
                        }

                    }

                    output += '</ul>';

                }
            } else  //If (app.appProp("Config-LB-XML-Ind"))
            {
                output = '<div class="infoMsg">Leaderboard JSON Data Not Configured</div>';
            }

            $leadersJSON = $('#updLeadersJSON');
            $leadersJSON.html(output);
            $leadersJSON.listview().listview("option", "theme", app.appProp("Config-ThemeLetter")).listview("refresh").trigger("create");


        }; //app.renderLeaderboardJSON

        /*
        create html for tournament list (rounds)
        */
        app.renderTournamentXML = function () {
            console.log('func app.renderTournamentXML');

            //render tournament XML
            gridConfObj = new GridConfObj();
            gridConfObj.GridName = "Tournament";
            gridConfObj.XMLDoc = app.appPropDoc("TRNXMLDoc");
            gridConfObj.DocInd = app.appProp("Config-TRN-XML-Ind");
            gridConfObj.XMLListTag = "Round";
            gridConfObj.HeaderList = new Array("Round", "Date", "Leader");
            gridConfObj.ColTagList = new Array("ID", "StartDate", "app.fnGridTNLeader()");
            gridConfObj.ColImgList = new Array(null, null, null);
            gridConfObj.ColTagListWidgt = new Array(GridWidgetType.Button, GridWidgetType.Text, GridWidgetType.Text);
            gridConfObj.ColTagListFlter = new Array(null, null, null);
            gridConfObj.JQAnchorSel = "#updTournamentXML";
            gridConfObj.ErrMsg = "Tournament XML Data";
            app.renderJQMGrid(gridConfObj);

        }; //app.renderTournamentXML

        /*
        render scorecards XML
        */
        app.renderScorecardXML = function () {
            console.log('func app.renderScorecardXML');

            playerID = $("#scorecard").attr("data-playerid");

            //render tournament XML
            gridConfObj = new GridConfObj();
            gridConfObj.GridName = "Scorecard";

            //We will be rendering the scorecard for a specific players (ALWAYS)
            gridConfObj.XMLDoc = app.getXMLNode(app.appPropDoc("SCRDXMLDoc"), "Player", "ID", playerID);
            gridConfObj.DocInd = app.appProp("Config-SCRD-XML-Ind");
            gridConfObj.XMLListTag = "Scorecard";
            gridConfObj.HeaderList = new Array("Round", "Date", "Score", "Par", "Thru");
            gridConfObj.ColTagList = new Array("RoundID", "app.fnGetDatebyRoundID(userarg2,valRow0)", "RoundScore", "RoundToPar", "Thru");
            gridConfObj.ColImgList = new Array(null, null, null, null, null);
            gridConfObj.ColTagListWidgt = new Array(GridWidgetType.Button, GridWidgetType.Text, GridWidgetType.Text, GridWidgetType.Text, GridWidgetType.Text);
            gridConfObj.ColTagListFlter = new Array(null, null, null, null, null);
            //gridConfObj.ColTagList = new Array("RoundID", "app.fnGetDatebyRoundID()", "RoundScore", "RoundToPar", "Thru");
            gridConfObj.JQAnchorSel = "#updScorecardsXML";
            gridConfObj.ErrMsg = "Scorecard XML Data";
            gridConfObj.userarg1 = playerID;
            gridConfObj.userarg2 = tournID; //tournID needed to cross reference start date of round (app.fnGetDatebyRoundID(userarg1,valRow0))
            gridConfObj.userarg3 = app; //need to send a reference to the app for event handler

            app.renderJQMGrid(gridConfObj);

        } //app.renderScorecardXML

        /*
        render scorecardDetail XML
        */
        app.renderScorecardDetailXML = function (tournID, playerID, scorecardID) {
            console.log('func app.renderScorecardDetailXML');

            //render tournament XML
            gridConfObj = new GridConfObj();
            gridConfObj.GridName = "ScorecardDetail";

            //We will be rendering the scorecard for a specific player specific scorecard (round) (ALWAYS)
            playerNode = app.getXMLNode(app.appPropDoc("SCRDXMLDoc"), "Player", "ID", playerID);
            scorecardNode = app.getXMLNode(playerNode, "Scorecard", "ID", scorecardID)
            gridConfObj.XMLDoc = scorecardNode;
            gridConfObj.DocInd = app.appProp("Config-SCRD-XML-Ind");
            gridConfObj.XMLListTag = "Score";
            /* WORKS
            gridConfObj.HeaderList = new Array("Hole", "Score", "Par", "Putts");
            gridConfObj.ColTagList = new Array("HoleID", "Score", "PlusMinus", "Putts");
            */
            gridConfObj.HeaderList = new Array("Hole", "Score", "Par", "Par");
            gridConfObj.ColTagList = new Array("HoleID", "Score", "PlusMinus", "app.fnHoleScoreSlang(valRow2)");

            gridConfObj.ColImgList = new Array(null, null, null, null);
            gridConfObj.ColTagListWidgt = new Array(GridWidgetType.Text, GridWidgetType.Text, GridWidgetType.Hide, GridWidgetType.Text);
            gridConfObj.ColTagListFlter = new Array(null, null, null, null);
            gridConfObj.JQAnchorSel = "#updScorecardsDetailXML";
            gridConfObj.ErrMsg = "Scorecard XML Data";
            gridConfObj.userarg1 = playerID;
            gridConfObj.userarg2 = tournID; //tournID needed to cross reference start date of round (app.fnGetDatebyRoundID(userarg1,valRow0))

            app.renderJQMGrid(gridConfObj);

        } //app.renderScorecardXML

        /*
        render pairings XML
        */
        app.renderPairingsXML = function () {
            console.log('func app.renderPairingsXML');

            //render tournament XML
            gridConfObj = new GridConfObj();
            gridConfObj.GridName = "Pairings";
            gridConfObj.XMLDoc = app.appPropDoc("PRNGXMLDoc");
            gridConfObj.DocInd = app.appProp("Config-PRNG-XML-Ind");
            gridConfObj.XMLListTag = "Group/";
            /* this works, but we want to combine first and last name
            gridConfObj.HeaderList = new Array("Start", "First Name", "Last Name", "First Name", "Last Name");
            gridConfObj.ColTagList = new Array("Start", "FirstName", "LastName", "FirstName", "LastName");
            gridConfObj.ColTagListFlter = new Array(null, "1", "1", "Order=2", "Order=2");
            */
            gridConfObj.HeaderList = new Array("Start", "Golfer #1", "Golfer #2");
            gridConfObj.ColTagList = new Array("Start+'<BR/>------'", "FirstName+'<BR/>'+LastName", "FirstName+'<BR/>'+LastName");
            gridConfObj.ColImgList = new Array(null, null, null);
            gridConfObj.ColTagListWidgt = new Array(GridWidgetType.Text, GridWidgetType.Button, GridWidgetType.Button);
            gridConfObj.ColTagListFlter = new Array(null, "Order=1", "Order=2");
            gridConfObj.JQAnchorSel = "#updPairingsXML";
            gridConfObj.ErrMsg = "Pairings XML Data";
            app.renderJQMGrid(gridConfObj);

        }

        /*
        render scorecards XML
        */
        app.renderCourseXML = function () {
            console.log('func app.renderCourseXML');


            //render tournament XML
            gridConfObj = new GridConfObj();
            gridConfObj.GridName = "Course";

            //We will be rendering the course
            gridConfObj.XMLDoc = app.appPropDoc("CRSEXMLDoc");
            gridConfObj.DocInd = app.appProp("Config-SCRD-XML-Ind");
            gridConfObj.XMLListTag = "Hole";
            gridConfObj.HeaderList = new Array("Hole", "Par", "Yardage");
            gridConfObj.ColTagList = new Array("ID", "Par", "Yardage");
            gridConfObj.ColImgList = new Array(null, null, null, null, null);
            gridConfObj.ColTagListWidgt = new Array(GridWidgetType.Text, GridWidgetType.Text, GridWidgetType.Text);
            gridConfObj.ColTagListFlter = new Array(null, null, null, null, null);
            gridConfObj.JQAnchorSel = "#updCourseXML";
            gridConfObj.ErrMsg = "Course XML Data";
            //gridConfObj.userarg1 = courseID; //eventually course id

            app.renderJQMGrid(gridConfObj);

        } //app.renderScorecardXML


        /*
        create html for tournament list (rounds)
        */
        app.renderJQMGrid = function (gridConfObj) {
            console.log('func app.renderJQMGrid');

            /*
            this.GridName                     //General Name for Grid (no spaces)
            this.GridType                     //valid values (GridType.Grid, GridType.List) 
            this.XMLDoc = undefined;          //XML document loaded (response XML)
            this.DocInd = true;               //indicator if XML document is available (true or false)
            this.XMLListTag = undefined;      //XML tagname for NodeList (note: a forward slash at the end of the tag represents hierarchical - i.e "Round/")
                                              //if hierarchical will get parent and childNode attributes 
            this.ColTagPkey = undefined;      //Column Name that is the Primary Key (default is "ID")
            this.HeaderList = undefined;      //List of Header Names (NOTE: IF GridType.List THEN THIS PARM IS NOT APPLICABLE)
            this.ColTagList = undefined;      //List of XML tagname of column values (can also use string expressions.. i.e.  FirstName+' '+LastName  (ATTN: no spaces between plus signs)
                                              //(NOTE: IF GridType.List THEN ONLY THE FIRST INDEX IS APPLICABLE FOR THIS PARM)
            this.ColImgList = undefined;      //List of references to images for a column
                                              //i.e. ('./images/players/'+FirstName+LastName+'.jpg')
            this.ColTagListFlter = undefined  //if setup for hierarchical - then column tag can be setup with a filter
                                              //valid values '<n>' = nth - 1 index; '<Attr Name>=<Attr Value>; null
                                              //i.e. '0' = first index; 'Order=1' (ATTN: no spaces if using SEEK expression)
                                              //(NOTE: IF GridType.List THEN ONLY THE FIRST INDEX IS APPLICABLE FOR THIS PARM)
            this.ColTagListWidgt = undefined; //List of Widgets (valid values for Grid ('Text'; 'Button' ; 'Hide')
                                              //valid values for List ('Anchor'; 'Hide')
            this.JQAnchorSel = undefined;     //jquery selector to anchor the created grid
            this.ErrMsg = undefined;          //Error message
            this.userarg1 = undefined;        //user args 1
            this.userarg2 = undefined;        //user args 2
            this.userarg3 = undefined;        //user args 3
            */

            //exception handling
            if (gridConfObj.GridType == GridType.Grid && gridConfObj.ColTagList.length > 5) {
                alert('Grid Config Error: Configuration of Grid is greater than 5 columns');
            } else if (gridConfObj.GridType == GridType.List && gridConfObj.ColTagList.length != 1) {
                alert('Grid Config Error: Configuration of List must be one column');
            }

            //initialize the type of grid rendered
            rootTag = gridConfObj.XMLListTag;
            hierarchical = false;
            hiearFilterType = HierFilterType.None;
            colTagPkeyName = gridConfObj.ColTagPkey;
            eval('var jqmStyle=' + app.appProp("Config-JQMGridStyle"));
            headerStyleCSS = (app.appProp("Config-JQMGridHeaderStyle") == "default") ?
                'ui-bar-' + app.appProp("Config-ThemeLetter") : app.appProp("Config-JQMGridHeaderStyle");

            //process root tag, and determine if hierarchical capability is needed
            if (gridConfObj.XMLListTag.substring(gridConfObj.XMLListTag.length - 1, gridConfObj.XMLListTag.length) == "/") {
                var rootTag = gridConfObj.XMLListTag.substring(0, gridConfObj.XMLListTag.length - 1);
                hierarchical = true;
            }

            console.log('Root Tag(' + rootTag + '):' + gridConfObj.XMLDoc.getElementsByTagName(rootTag));

            output = '<div class="infoMsg">' + gridConfObj.ErrMsg + ' Not Acquired</div>';
            aNodeList = gridConfObj.XMLDoc.getElementsByTagName(rootTag);

            if (gridConfObj.DocInd) {
                if (aNodeList != undefined) {

                    switch (gridConfObj.GridType) {
                        case GridType.Grid:  //create the root div and header row for the GRID

                            visibleColNbr = 0; //count visible columns for grid
                            for (var i = 0; i < gridConfObj.HeaderList.length; i++) {
                                if (gridConfObj.ColTagListWidgt[i] != GridWidgetType.Hide) visibleColNbr++;
                            }

                            gridLetter = String.fromCharCode(95 + visibleColNbr);  //ui-grid-a for 2 blocks to ui-grid-d for 5 blocks
                            output = '<div class="ui-grid-' + gridLetter + ' ' + jqmStyle[gridConfObj.GridName] + '">';
                            asciiLetter = 97
                            //create the header row. each column
                            for (var i = 0; i < gridConfObj.HeaderList.length; i++) {

                                //check to see that this columns isn't configued to be hid
                                if (gridConfObj.ColTagListWidgt[i] != GridWidgetType.Hide) {

                                    output += '<div class="ui-block-' + String.fromCharCode(asciiLetter) + '">' +
                                              '<div class="ui-bar ' + headerStyleCSS +
                                              '">' +
                                               gridConfObj.HeaderList[i] +
                                              '</div></div>';

                                    asciiLetter++;

                                } //if (gridConfObj.ColTagListWidgt[i] != GridWidgetType.Hide) {
                            } //for (var i = 0; i < gridConfObj.HeaderList.length; i++) {

                            break;
                        case GridType.List: //create the root div for the LISTVIEW

                            output = '<form class="ui-filterable"><input id="fltLeadersXML" data-type="search"></form>';
                            output += '<ul id="leadersListXML" data-role="listview" data-filter="true" data-input="#fltLeadersXML" data-inset="true" ' +
                                      'class="' + jqmStyle[gridConfObj.GridName] + '">'; //spilt listview - two links


                            break;

                    } //switch (gridConfObj.GridType) {

                    //take the smaller of the list item threshold and the number of actual items
                    nbrRows = Math.min(aNodeList.length, app.appProp("Config-MaxList-Nbr"));

                    console.log('app.renderJQMGrid - start rows - nbr rows =' + nbrRows );
                    //iterate through all the nodes (ROWS)
                    for (var i = 0; i < nbrRows; i++) {

                        //create content rows each column
                        asciiLetter = 97

                        //setup smaller var names for customized function (valRow0 - value of first column for parent node, etc...)
                        //and the userargs (all global so the functions called from this function are in context)
                        valRow0, valRow1, valRow2, valRow3, valRow4 = undefined;
                        userarg1 = gridConfObj.userarg1;
                        userarg2 = gridConfObj.userarg2;
                        userarg3 = gridConfObj.userarg3;
                        for (var h = 0; h < gridConfObj.ColTagList.length; h++) {
                            if ((gridConfObj.ColTagList[h].substring(0, 6) != 'app.fn') &&
                                (gridConfObj.ColTagList[h].indexOf('+') == -1)) { //dont want to evaluate if tag is a function or a formatted tag
                                eval('valRow' + h + '= aNodeList[i].getAttribute(gridConfObj.ColTagList[h])');
                            }
                        }

                        console.log('app.renderJQMGrid - iterate row - columns');
                        //iterate through all the columns
                        for (var j = 0; j < gridConfObj.ColTagList.length; j++) {

                            //check to see that this columns isn't configued to be hid
                            if (gridConfObj.ColTagListWidgt[j] != GridWidgetType.Hide) {

                                //valRow0 will be set to column value 0 ... through to valRow4 will be set to column value 4 (for function support app.fn prexifx
                                colTag = gridConfObj.ColTagList[j];
                                colImg = gridConfObj.ColImgList[j];
                                colTagFlter = gridConfObj.ColTagListFlter[j];
                                aNode = aNodeList[i];

                                //Build Div for Enhancing Cell
                                colDivStart = "";
                                colDivEnd = "";
                                switch (gridConfObj.GridType) {
                                    case GridType.Grid: //Create DIV for GRID cell
                                        switch (gridConfObj.ColTagListWidgt[j]) {
                                            case GridWidgetType.Text:
                                                colDivStart = '<div class="ui-bar ui-bar-' + app.appProp("Config-ThemeLetter") + '"';
                                                colDivEnd = '</div>';
                                                break;
                                            case GridWidgetType.Button:
                                                colDivStart = '<button id=grd' + j + '-' + i + ' class="ui-shadow ui-btn ui-corner-all"';
                                                colDivEnd = '</button>';
                                                break;
                                        }
                                        break;
                                    case GridType.List: //create DIV for LISTVIEW cell
                                        colDivStart = '<li>' + '<a id=grd' + j + '-' + i + ' data-transition="slide" ' + ' alt="testing the alt"';
                                        colDivEnd = '</a></li>';
                                        break;
                                }//switch (gridConfObj.GridType)
                                
                                console.log('app.renderJQMGrid - build CellValue - colTag:' + colTag)
                                //Build Total CellValue And Return Primary Key (if there is one)
                                //the colTag can be a Tag Name or a string expression (we support the pluses and the single quotes)
                                var strArray = colTag.split("+");
                                var gridCellValue = "";
                                var pKey = "-1";
                                for (p = 0; p < strArray.length; p++) {
                                    if (strArray[p].indexOf("'") != -1) {
                                        gridCellValue += strArray[p].replace(/'/g, "");
                                    } else {
                                        rtnArray = app.getCellValueForGrid(aNode, j, hierarchical, strArray[p], colTagFlter, colTagPkeyName);
                                        pKeyRtn = rtnArray.split("::")[0];
                                        if (pKeyRtn != "-1") pKey = pKeyRtn; //we will keep the last pKey found
                                        gridCellValue += rtnArray.split("::")[1];
                                    }
                                } //for (p = 0; p < strArray.length; p++) {

                                //Build SRC for Image Reference (if there is an image configured for ColTag)
                                //the colTag can be a Tag Name or a string expression (we support the pluses and the single quotes)
                                if (colImg != null) {
                                    strArray = colImg.split("+");
                                    var gridCellImgRef = "";
                                    for (p = 0; p < strArray.length; p++) {
                                        if (strArray[p].indexOf("'") != -1) {
                                            gridCellImgRef += strArray[p].replace(/'/g, "");
                                        } else {
                                            rtnArray = app.getCellValueForGrid(aNode, j, hierarchical, strArray[p], colTagFlter, colTagPkeyName);
                                            gridCellImgRef += rtnArray.split("::")[1];
                                        }
                                    } //for (p = 0; p < strArray.length; p++) {
                                }

                                switch (gridConfObj.GridType) {
                                    case GridType.Grid: //Create DIV for GRID cell
                                        output += '<div class="ui-block-' + String.fromCharCode(asciiLetter) + '">' +
                                                  colDivStart + ' pkid="' + pKey + '">' +
                                                  ((colImg != null) ? '<img src="' + gridCellImgRef + '">' : "") +
                                                  gridCellValue +
                                                  colDivEnd +
                                                  '</div>';

                                        asciiLetter++;
                                        break;

                                    case GridType.List: //Create DIV for LISTVIEW cell

                                        output += colDivStart + ' pkid="' + pKey + '">' +
                                                  ((colImg != null) ? '<img src="' + gridCellImgRef + '">' : "") + //MNS - CONFIG THIS 
                                                  gridCellValue +
                                                  colDivEnd;
                                        break;
                                } //switch (gridConfObj.GridType) {

                            } //if (gridConfObj.ColTagListWidgt[j] != GridWidgetType.Hide) {

                        }  //for (var i = 0; i < gridConfObj.ColTagList.length; i++) { 

                    } //for (var i = 0; i < nbrRows; i++) {


                    switch (gridConfObj.GridType) {
                        case GridType.Grid: //Create /DIV for GRID cell
                            output += '</div>';  //finish the grid <div class="ui-grid-<gridLetter>">
                            break;
                        case GridType.List: //Create /UL for LISTVIEW cell
                            output += '</ul>';
                            break;
                    }


                }
            } else  //If (gridConfObj.DocInd)
            {
                output = '<div class="infoMsg">' + gridConfObj.ErrMsg + ' Not Configured</div>';
            }

            $aNodeList = $(gridConfObj.JQAnchorSel);
            $aNodeList.html(output);

            if (gridConfObj.GridType == GridType.List) {
                $aNodeList.listview().listview({ "theme": app.appProp("Config-ThemeLetter") }).listview("refresh").trigger("create");
            }

            //bind the events 
            $("[id^=grd],a", $aNodeList).on("vclick", function () {

                var gridEventArgs = new GridEventArgs();
                gridEventArgs.app = app;
                gridEventArgs.gridConfObj = gridConfObj;

                idStr = this.id;
                gridEventArgs.colNbr = idStr.substr(3, idStr.length - 1).split("-")[0];
                gridEventArgs.rowNbr = idStr.substr(3, idStr.length - 1).split("-")[1];
                gridEventArgs.content = this.innerText.replace(/\s+/g, '').trim(); //remove CR and spaces
                gridEventArgs.pkID = $(this).attr("pkid");

                //Name of Handler must be "fn<Grid Name><Column Tag Name><Column Nbr>
                //window['fn$' + gridConfObj.GridName + '$Column' + gridEventArgs.colNbr](gridEventArgs);
                window['fn$' + gridConfObj.GridName + '$Column' + gridEventArgs.colNbr](gridEventArgs);
            });

            console.log('render grid -' + gridConfObj.JQAnchorSel);

        }; //app.renderJQMGrid

        /*
        get cell value for JQMGrid
        aNode = row of the Grid
        hierarchical = true or false
        colTag = Tag Name of Column
        colTagFlter = Filter of Column (only applicable if hierarchical)
        */
        app.getCellValueForGrid = function (aNode, gridColNbr, hierarchical, colTag, colTagFlter, colTagPkeyName) {
            console.log('func app.getCellValueForGrid');

            var cellValue = "";
            var pKey = "-1";
            if (colTag.substring(0, 6) != 'app.fn') {

                hierFilterType = HierFilterType.None;
                operands = "";
                index = 0;
                //if hierarchical then specify the type of filter ( 
                if (hierarchical) {
                    if (colTagFlter == null) {
                        hierFilterType = HierFilterType.First;
                    }
                    else if (colTagFlter.toString().indexOf("=") != -1) {
                        hierFilterType = HierFilterType.Seek;
                        operands = colTagFlter.trim().split("=");  //operands[0] = <Attr Name>, operands[1] = <Value>
                    } else if ((parseFloat(colTagFlter) == parseInt(colTagFlter))
                               && !isNaN(colTagFlter)) {
                        hierFilterType = HierFilterType.Index;
                        index = colTagFlter;
                    }
                } else {
                    hierFilterType = HierFilterType.None;
                }


                //get the value of the node at the parent node level under certain conditions
                if (hierFilterType == HierFilterType.None || hierFilterType == HierFilterType.First) {
                    cellValue = aNode.getAttribute(colTag);
                    pKey = aNode.getAttribute(colTagPkeyName);
                }

                //if set to hierarchical and the cell value wasn't found on the parent, then lets try finding them
                //in the children nodes
                if (hierarchical) {
                    if ((hierFilterType == HierFilterType.None || hiearFilterType == HierFilterType.First) &&
                        cellValue == null) {
                        cellValue = null;
                        for (k = 0; k < aNode.childNodes.length; k++) {
                            if (aNode.childNodes[k].nodeType == 1) { //just looking for elements
                                cellValue = aNode.childNodes[k].getAttribute(colTag);
                            }
                            if (cellValue != null) break; //if we found a cell value from the children elements, then let's get out of here.

                        }
                    } else if (hierFilterType == HierFilterType.Index) {
                        nbrFound = 0;
                        for (k = 0; k < aNode.childNodes.length; k++) {
                            cellValue = null;
                            if (aNode.childNodes[k].nodeType == 1) { //just looking for elements
                                cellValue = aNode.childNodes[k].getAttribute(colTag);
                                pKey = aNode.childNodes[k].getAttribute(colTagPkeyName);
                            }
                            if (cellValue != null) nbrFound++; //if we found a cell value from the children elements, then let's get out of here.
                            if (nbrFound == index) break; //if index is meet than break out of this; we've found our cell value
                        }

                    } else if (hierFilterType == HierFilterType.Seek) {
                        for (k = 0; k < aNode.childNodes.length; k++) {
                            cellValue = null;
                            if (aNode.childNodes[k].nodeType == 1) { //just looking for elements
                                if (aNode.childNodes[k].getAttribute(operands[0]) == operands[1]) {
                                    cellValue = aNode.childNodes[k].getAttribute(colTag);
                                    pKey = aNode.childNodes[k].getAttribute(colTagPkeyName);
                                }
                            }
                            if (cellValue != null) break; //if we found a cell value from the children elements, then let's get out of here.
                        }
                    }

                } //if (hierarchical)

            } else {
                //currently this only works for non-hiearchical grids (valRow0,valRow1,valRow2,valRow3,valRow4,userarg1,userarg2,userarg3,pKey)
                pKey = aNode.getAttribute(colTagPkeyName);
                cellValue = eval(colTag);  //call a customized function that returns one value.
            } // if (colTag.substring(0, 6) != 'app.fn') {

            return pKey + '::' + cellValue;
            //return cellValue;

        } //app.getCellValueForGrid

        /*
        update all pages/widgets with theme
        */
        app.updateThemeAllPages = function (themeLetter) {
            console.log('func app.updateThemeAllPages');

            //players page
            $leadersXML = $('#updLeadersXML');
            //$leadersXML.listview("option", "theme", themeLetter);
            $leadersXML.listview().listview("option", "theme", app.appProp("Config-ThemeLetter")).listview("refresh").trigger("create");

            $leadersJSON = $('#updLeadersJSON');
            //$leadersJSON.listview("option", "theme", themeLetter);
            $leadersJSON.listview().listview("option", "theme", app.appProp("Config-ThemeLetter")).listview("refresh").trigger("create");

            //settings page
            $('#settings div[data-role=collapsibleset]').collapsibleset("option", "theme", themeLetter);
            $('#settings div[data-role=collapsibleset]').collapsibleset("refresh");

            $('.dynamicFontSize').css("font-size", app.appProp("Config-TextFont-Size") + "%");

        };

        /*
        returns app property
        */
        app.appProp = function (propName) {
            console.log('func app.appProp:' + propName);

            var propDefault = {
                "Config-LB-XML-Ind": true, "Config-LB-JSON-Ind": true, "Config-TRN-XML-Ind": true,
                "Config-SCRD-XML-Ind": true, "Config-PRNG-XML-Ind": true, "Config-CRSE-XML-Ind": true,
                "Config-ThemeLetter": "h", "Config-MaxList-Nbr": 100,
                "Config-JQMGridStyle": "{'Leaderboard' : 'jqmList-small', 'Pairings' : 'jqmGrid', 'Scorecard' : 'jqmGrid', 'ScorecardDetail' : 'jqmGrid', 'Tournament' : 'jqmGrid'}",
                "Config-JQMGridHeaderStyle": "default",
                "Config-TextFont-Size": 100
            };

            if (localStorage[propName] != undefined && localStorage[propName] != "undefined") {

                if (localStorage[propName] == "true") { //if boolean true
                    return true;
                } else if (localStorage[propName] == "false") { //if boolean false
                    return false;
                } else {
                    return localStorage[propName]; //if not boolean
                }

            } else { //if undefined
                return propDefault[propName];  //default value
            }
        }

        /*
        returns app document (xml or jason) property
        */
        app.appPropDoc = function (docName) {
            console.log('func app.appPropDoc:' + docName);

            var propDocDefault = {
                "LBXMLDoc": undefined, "LBJSONDoc": undefined, "TRNXMLDoc": undefined, "SCRDXMLDoc": undefined, "PRNGXMLDoc": undefined, "CRSEXMLDoc": undefined
            };

            if (localStorage[docName] != undefined) {
                if (docName.substring(docName.length - 7, docName.length) == "JSONDoc") {
                    //JSON DOC
                    return JSON.parse(localStorage[docName]);
                } else {
                    //XML Doc
                    return StringtoXML(localStorage[docName]);
                }
            } else {
                return propDocDefault[docName];
            }
        }

        /*
        function definitions below beginning with fnGrid define customizations
        of the standard grid rendering configuration defined in the GridConfObj.ColTagList cell value
        This will allow the programmer to dynamically calculate a cell value from just about anything.
        (i.e. GridConfObj.ColTagList = "app.fnGridXYZ(myGridConfObj, arg2, arg3)" will be evaluated at run time in the
        rendering function app.renderJQMGrid
        */

        /*
        Get round leader (currently a placeholder)
        */
        app.fnGridTNLeader = function () {
            console.log('func app.fnGridTNLeader');

            return 'L. Thompson';
        }

        /*
        (Deprecated) Get total score of all the rounds (child node) of a player node 
        */
        app.fnGridLBTotalScoreForaNode = function (aNode) {
            console.log('func app.fnGridLBTotalScoreForaNode');
 
            var round = aNode.getElementsByTagName('Round');
            console.log('aNode.length:' + round.length);
            var totalScore = 0;
            for (var i = 0; i < round.length; i++) {
                console.log('score ' + i + ':' + round[i].attributes["Score"].nodeValue);
                totalScore += parseInt(round[i].attributes["Score"].nodeValue);
            }
            return totalScore;
        }

        /*
        Get total score of all the rounds (child node) of a player node - using JQuery
        */
        app.fnGridLBTotalScore = function (playerID) {
            console.log('func app.fnGridLBTotalScore');

            xmlDoc = app.appPropDoc("LBXMLDoc");
            totalScore = app.jqmAttrSum("Tournament[ID='" + tournID + "'] Player[ID='" + playerID + "'] Round",
                            xmlDoc,
                            "Score")

            return totalScore;

        }

        /*
        Get HoleScoreSlang
        */
        app.fnHoleScoreSlang = function (score) {
            console.log('func app.fnHoleScoreSlang');

            slang = score;
            switch (score) {
                case "-3":
                    slang = "DblEagle";
                    break;
                case "-2":
                    slang = "Eagle";
                    break;
                case "-1":
                    slang = "Birdie";
                    break;
                case "0":
                    slang = "Par";
                    break;
                case "1":
                    slang = "Bogie";
                    break;
                case "-2":
                    slang = "DblBogie";
                    break;
                case "-3":
                    slang = "TriBogie";
                    break;
            } //switch (score) {
            return slang;
        };

        /*
        Get the date of the round by tournID, and roundID
        */
        app.fnGetDatebyRoundID = function (tournID, roundID) {
            console.log('func app.fnGetDatebyRoundID');

            xmlDoc = app.appPropDoc("TRNXMLDoc");
            return $("Tournament[ID='" + tournID + "'] Round[ID='" + roundID + "']", xmlDoc).attr("StartDate");
        }

        /*
        executeXPath - must only find one result or it will throw an error (alert)
        CURRENTLY NOT USED. IE DOES NOT SUPPORT THIS
        */
        app.executeXPath = function (xmlDoc, xpath) {
            console.log('func app.executePath');

            // code for IE
            if (window.ActiveXObject || request.responseType == "msxml-document") {
                //if (navigator.appName = "Microsoft Internet Explorer") {
                xmlDoc.setProperty("SelectionLanguage", "XPath");
                nodes = xmlDoc.selectSingleNode(xpath);

                if (nodes.childNodes.length == 1) {
                    return nodes.text;
                } else {
                    alert('Error: Xpath query returned ' + nodes.length + ' results');
                    return null;
                }
            }

                // code for Chrome, Firefox, Opera, etc.
            else if (document.implementation && document.implementation.createDocument) {
                var nodes = xmlDoc.evaluate(xpath, xmlDoc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

                if (nodes.snapshotLength == 1) {
                    return nodes.snapshotItem(0).textContent;
                } else {
                    alert('Error: Xpath query returned ' + nodes.snapshotLength + ' results');
                    return null;
                }
            }

            return htmlResult;

        } //app.executeXPath 

        /*
        Get the sum of the value of attributes as a result of jquery
        */
        app.jqmAttrSum = function (selector, xmlDoc, attrName) {
            console.log('func app.jqmAttrSum');

            var sumAttr = 0;
            $(selector, xmlDoc).each(function () {
                sumAttr += parseInt($(this).attr(attrName));
            });

            return sumAttr;
        }

        /*
        Get XML node for TagName, Attribute, Value
        */
        app.getXMLNode = function (XMLDoc, tagName, attrName, attrValue) {
            console.log('func app.getXMLNode');

            aNode = null;
            aNodeList = XMLDoc.getElementsByTagName(tagName);
            for (var i = 0; i < aNodeList.length; i++) {
                aValue = aNodeList[i].getAttribute(attrName);
                aNode = aNodeList[i];
                if (aValue == attrValue) break;
            }

            return aNode;
        };

        app.init();


    })(eventApp); //app

    /*
    Event Handlers for Generic Grid (JQMGrid)

        alert('fn$Tournament$Column0> Grid Name :' + gridEventArgs.gridConfObj.GridName + ' pkID:' + gridEventArgs.pkID +
              ' app.themeLetter:' + gridEventArgs.app.appProp("Config-ThemeLetter") +
              ' Content :' + gridEventArgs.content + ' Column number :' + gridEventArgs.colNbr + ' Row number :' + gridEventArgs.rowNbr);    
    */

    fn$Leaderboard$Column0 = function (gridEventArgs) {
        console.log('func fn$Leaderboard$Column0');

        $("#scorecard").attr("data-playerid", gridEventArgs.pkID);
        $.mobile.pageContainer.pagecontainer("change", "#scorecard");
    }

    fn$Tournament$Column0 = function (gridEventArgs) {
        console.log('fn$Tournament$Column0');

        $.mobile.pageContainer.pagecontainer("change", "#course");

    }

    fn$Pairings$Column1 = function (gridEventArgs) {
        console.log('fn$Pairings$Column1');

        $("#scorecard").attr("data-playerid", gridEventArgs.pkID);
        $.mobile.pageContainer.pagecontainer("change", "#scorecard");
    }

    fn$Pairings$Column2 = function (gridEventArgs) {
        console.log('fn$Pairings$Column2');

        $("#scorecard").attr("data-playerid", gridEventArgs.pkID);
        $.mobile.pageContainer.pagecontainer("change", "#scorecard");
    }

    fn$Scorecard$Column0 = function (gridEventArgs) {
        console.log('fn$Scorecard$Column0');

        playerID = gridEventArgs.gridConfObj.userarg1;
        tournID = gridEventArgs.gridConfObj.userarg2;
        app = gridEventArgs.gridConfObj.userarg3;
        pkID = gridEventArgs.pkID;

        $("#scorecarddetail").attr("data-playerid", playerID);
        $("#scorecarddetail").attr("data-scorecardid", gridEventArgs.pkID);

        //get roundID thru jQuery of scorecards.xml
        roundID = $("Tournament[ID='" + tournID + "'] Player[ID='" + playerID +
                    "'] Scorecard[ID='" + pkID + "']", app.appPropDoc("SCRDXMLDoc")).attr("RoundID");

        $("#scorecarddetail").attr("data-roundid", roundID);

        $.mobile.pageContainer.pagecontainer("change", "#scorecarddetail");

    }

});



