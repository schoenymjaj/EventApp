var request;
if (window.XMLHttpRequest) {
    request = new XMLHttpRequest();
} else {
    request = new ActiveXObject("Microsoft.XMLHTTP");
}

/* WORKING EVENT THANT HANDLES XMLHTTP REQUEST, AND RENDERS TO UPDATEXML TAG*/
//The XML AJAX download handler for leaderboards.xml
request.onreadystatechange = function () {
    if ((request.readyState === 4) && (request.status === 200)) {
        var debugElements = request.responseXML.getElementsByTagName('Player');
        console.log(debugElements[0].attributes["FirstName"].nodeValue);

        var leaderboard = request.responseXML.getElementsByTagName('Player');
        var output = '<ul id="leaderboardXML" data-role="listview" data-filter="true" data-input="#leaderboardXML" data-split-theme="a" data-split-icon="gear">'; //spilt listview - two links
        for (var i = 0; i < leaderboard.length; i++) {

            var round = leaderboard[i].getElementsByTagName('Round');
            var totalScore = 0;
            for (var j = 0; j < round.length; j++) {
                totalScore += parseInt(round[j].attributes["Score"].nodeValue);
            }

            output += '<li>' +
            '<a href="' + '#artwork_' + leaderboard[i].attributes["FirstName"].nodeValue + '_' +
            leaderboard[i].attributes["LastName"].nodeValue + '" data-transition="slide" ' + 
            ' alt="testing the alt"' +
            '<h1>' + leaderboard[i].attributes["FirstName"].nodeValue + ' ' + leaderboard[i].attributes["LastName"].nodeValue + '</h1>' +
            '<p>Score - ' + totalScore + '</p>' + '</a>' +
            '<a href="http://productivityedge.com/"' + '</a>' +
            '<h1>' + leaderboard[i].attributes["FirstName"].nodeValue + ' ' + leaderboard[i].attributes["LastName"].nodeValue + '</h1>' +
            '</a>'
            '</li>';

        }
        output += '</ul>';
        document.getElementById('updateXML').innerHTML = output;
    }
}



//$(document).on("pageinit", "#players", function (event) {  //paginit event did not get jquery mobile styles, pageload did not even display list
$(document).on("ready", function (event) {  //jquery document ready event gets you jquery mobile styles, and data rendered

    //alert("This page was just enhanced by jQuery Mobile!");
    request.open('GET', './data/leaderboards.xml');
    request.send();


});


$(document).on('pageinit', '#settings', function () {
    $(function () {
        $('#saveSettings').tap (function () { event.preventDefault(); }); //for some reason doesn't like vclick here.
        $('#cancelSettings').tap(function () { event.preventDefault(); });

        $('#saveSettings').on('vclick', function () {
            console.log('saveSettings TAP');
            alert('saveSettings TAP');

            var radioButtonSelectedVal = $('input[name="radio-choice-v-2"]:checked').val(); //on OR off
            var radioButtonSelectedID = $('input[name="radio-choice-v-2"]:checked').attr('id'); //id of the radio box
            var themeLetter = $('label[for="' + radioButtonSelectedID + '"').text();
            var myLegend = $('form fieldset legend').html('Theme Selected: ' + themeLetter);

            $("#settings").attr("data-theme", "e"); /* NOT WORKING */
            $("#settings").trigger('create');
            //$("#settings").trigger('pageshow');

            /* changing theme is working a little - something strange though */
            /*
            $("#saveSettings").button({ theme: "h" }); 
            $("#saveSettings").button("refresh");
            $("#cancelSettings").button({ theme: "h" }); 
            $("#cancelSettings").button("refresh");
            */

            //
           
            /*
            var $radios = $('input:radio[name=radio-choice-v-2]');
            if ($radios.is(':checked') === false) {
                $radios.filter('[id=radio-choice-v-2f]').prop('checked', true);
            }
            */

            $("#radio-choice-v-2f").attr("checked", true); //still no refresh

            /* ADD A BUTTON DYNAMICALLY AFTER A SELECTED TAG */
            var button = $('<button id="resetSettings" class="ui-btn ui-btn-inline">Reset</button>');
            $("#cancelSettings").after(button);


            //$.mobile.changePage('#players', { transition: "flip" });

        });

        $('#cancelSettings').on('vclick', function () {
            console.log('cancelSettings TAP');
            $.mobile.changePage('#home', { transition: "flip" });
        });
    });

});

/* CHANGEPAGE IS WORKING, BUT THEN IT NAVIGATES TO HOME
$("#saveSettings").bind("tap", SaveHandler);
$("#cancelSettings").bind("tap", CancelHandler);

function SaveHandler(event) {
    alert('tap was accomplished on the Save Button')
    $.mobile.changePage('#players');

}
function CancelHandler(event) {
    alert('tap was accomplished on the Cancel Button')
    $.mobile.changePage('#players');
    alert('what is going on?');
    $.mobile.changePage('#settings');
}
*/

/*
$("#home").bind( 'pageinit',function(event) {
    $(function () {
        $('#saveSettings').bind('tap', function (event) {
            //go the #players page
            alert('binding did work');
            $.mobile.changePage('#players', { transition: "slideup" });
        });
    });

});
*/


$.getJSON('./data/leaderboards.json', function(data) {
   //alert('MyJSONHandler has been called NEW');

  // var myString = jsonPath(data, "$.Tournament").toJSONString();
    var firstNames = jsonPath(data, "$..Tournament.Leaderboard.Player[*].-FirstName"); //get all first names of players on the leaderboard
    var lastNames = jsonPath(data, "$..Tournament.Leaderboard.Player[*].-LastName"); //get all first names of players on the leaderboard
    var allNames = jsonPath(data, "$..Tournament.Leaderboard.Player[*]"); //get all players object on the leaderboard

    var output = '<ul data-role="listview" data-filter="true" data-input="#leaderboardJSON">';
    for (obj in allNames) {
        //console.log(allNames[obj]['-FirstName'] + ' ' + allNames[obj]['-LastName']);
        firstName = allNames[obj]['-FirstName'];
        lastName = allNames[obj]['-LastName'];

            output += '<li>' +
            '<a href="' + '#artwork_' + firstName + '_' +
            lastName + '" data-transition="slide" ' +
            ' alt="testing the alt"' +
            '<h1>' + firstName + ' ' + lastName + ' (JSON)' + '</h1>' +
            '<p>testing the paragraph</p>' + '</a>' +
            '</li>';
    }
    output += '</ul>';
    $('#updateJSON').html(output);

//$.each(allNames, function (key, val) { } //can be used, but not for this so much

});


/* DONT KNOW WHAT TO DO WITH THIS YET
function showPost(id) {
    $.getJSON('http://iviewsource.com/?json=get_post&post_id=' + id + '&callback=?', function (data) {
        var output = '';
        output += '<h3>' + data.post.title + '</h3>';
        output += data.post.content;
        $('#mypost').html(output);
    }); //get JSON Data for Stories
} //showPost

function listPosts(data) {
    var output = '<ul data-role="listview" data-filter="true">';
    $.each(data.posts, function (key, val) {

        var tempDiv = document.createElement("tempDiv");
        tempDiv.innerHTML = val.excerpt;
        $("a", tempDiv).remove();
        var excerpt = tempDiv.innerHTML;

        output += '<li>';
        output += '<a href="#blogpost" onclick="showPost(' + val.id + ')">';
        output += '<h3>' + val.title + '</h3>';

        output += (val.thumbnail) ?
			'<img src="' + val.thumbnail + '" alt="' + val.title + '" />' :
			'<img src="images/viewsourcelogo.png" alt="View Source Logo" />';
        output += '<p>' + excerpt + '</p>';
        output += '</a>';
        output += '</li>';
    }); // go through each post
    output += '</ul>';
    $('#postlist').html(output);
} // lists all the posts
*/

/*
function showPhoto(link, title) {
  var output='<h2>' + title + '</h2>';
  output += '<a href="#" data-rel="back" data-transition="fade">';
  output += '<img class="fullscreen" src="' + link + '" alt="' + title +'" />';
  output += '</a>';
  $('#myphoto').html(output);
}

$(document).ready(function() {
  $("[class^='ui-grid'] img").on('click', function() {
    var mytitle = $( this ).attr('alt');
    var mysrc = $( this ).attr('src').substr(0,$( this ).attr('src').length-7)+'.jpg';
    showPhoto(mysrc, mytitle);
    $.mobile.changePage("#showphoto");
  });
});
*/


