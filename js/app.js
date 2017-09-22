$(document).ready(function() {
  $('.materialboxed').materialbox();
  $('.datepicker').pickadate({
    selectMonths: true, // Creates a dropdown to control month
    selectYears: 2, // Creates a dropdown of 15 years to control year,
    today: 'Today',
    clear: 'Clear',
    close: 'Ok',
    closeOnSelect: false // Close upon selecting a date,
  });
  // Adding email fields dynamically
  var counter = 1;
  var limit = 15;
  var userid = localStorage.getItem('user_id')

  $(function () {
    var API = 'https://kuvafundb.herokuapp.com/api/patrons/' + userid
    $.get(API)
    .then(function(data) {
      $('.ProfilePic').attr("src", data.profile_pic)
      $('.UserName').text(data.username)
    })
  })

  function addInput(divName) {
    if (counter == limit) {
      alert("You have reached the limit of adding " + counter + " inputs");
    } else {
      var newdiv = document.createElement('div');
      newdiv.innerHTML = "Enter email " + (counter + 1) + " <br><input type='text' name='myInputs[]'>";
      document.getElementById(divName).appendChild(newdiv);
      counter++;
    }
  }
  $(function() {
    var API = 'https://kuvafundb.herokuapp.com/api/sidenav/events/' + userid
    $.get(API)
    .then(function(data) {
      for (var i = 0; i < data.length; i++) {
        var album = data[i].name
        var tripid = data[i].trip_id
        $("#albumnames").append(`
          <li class="viewalbum" id="${tripid}"> ${album}</li>
          `)
        }
      });
    })

    //gets trip name/date
    var startdate;
    var enddate;
    $("#albumnames").on('click', '.viewalbum', function() {
      $('#picDiv').empty()
      $('#profilepictures').empty()
      event.preventDefault()
      var tripid = this.id
      var API = "https://kuvafundb.herokuapp.com/api/event/eventdata/" + tripid;
      $.get(API)
      .then(function(data) {
        var response = data[0]
        var eventName = response.name;
        startdate = response.start_date;
        enddate = response.end_date;
        var eventstartdate = moment(JSON.parse(response.start_date)).format('l');
        var eventenddate = moment(JSON.parse(response.end_date)).format('l');
        $("#eventname").text(`
          ${eventName}
          `)
          $("#daterange").text(`
            ${eventstartdate} - ${eventenddate}
            `)
          })
          getUserPhotos(tripid)
        })
        //loop through the user keys retrieved from database
        function appendPhotos(userid) {
          var API = 'https://api.instagram.com/v1/users/self/media/recent/?access_token='
          $.getJSON(API + userid + '&callback=?', function(insta) {
            $.each(insta.data, function(photos, src) {
              var postTime = insta.data[photos].created_time + "000";
              if (postTime >= startdate && postTime <= enddate) {
                // if (photos === 20) {
                //   return false;
                // }
                var imgUrl = src.images.standard_resolution.url
                $("#picDiv").append(`
                  <div class="col s12 m6 l4 ">
                  <div class="card">
                  <div class="card-image">
                  <img class="materialboxed" src=${imgUrl}>
                  </div>
                  </div>
                  </div>
                  `)
                }
              });
              $('.materialboxed').materialbox()
            });
          }

          //Add photos to album
          function getUserPhotos(tripid) {
            var API = 'https://kuvafundb.herokuapp.com/api/event/profilepics/' + tripid;
            $.get(API)
            .then(function(data) {
              for (var i = 0; i < data.length; i++) {
                $('#profilepictures').append(`
                  <img id="ProPic" class="ProfilePic circle" src="${data[i].profile_pic}">
                  `)
                appendPhotos(data[i].instagram_key)
              }
            })
          }

          //POST request from create album page
          var createdTripID;
          var AlbumUsers = [];
          $(".submitNewEvent").on('click', function(event) {
            event.preventDefault()

            var newEventData = {}
            var tripName = "name"
            var tripStartDate = "start_date"
            var tripEndDate = "end_date"
            newEventData[tripName] = $('#newEventName').val();
            newEventData[tripStartDate] = Date.parse($('#newEventStartDate').val());
            newEventData[tripEndDate] = Date.parse($('#newEventEndDate').val());

            var settings = {
              "async": true,
              "crossDomain": true,
              "url": "https://kuvafundb.herokuapp.com/api/trips",
              "method": "POST",
              "headers": {
                "content-type": "application/json",
                "cache-control": "no-cache",
              },
              "processData": false,
              "data": JSON.stringify(newEventData)
            }

            $.ajax(settings).done(function(response) {
              createdTripID = response.trip_id
              var $rows = $TABLE.find('tr:not(:hidden)');
              var headers = [];
              var data = [];

              // Get the headers (add special header logic here)
              $($rows.shift()).find('th:not(:empty)').each(function () {
                headers.push($(this).text().toLowerCase());
              });

              // Turn all existing rows into a loopable array
              $rows.each(function () {
                var $td = $(this).find('td');
                var h = {};

                // Use the headers from earlier to name our hash keys
                headers.forEach(function (header, i) {
                  h[header] = $td.eq(i).text();
                });

                data.push(h);
              });

              // Output the result
              AlbumUsers = data;
              var TripPatronPair = {}
              var UserID = "user_id"
              var TripID = "trip_id"

              var patronAPI = 'https://kuvafundb.herokuapp.com/api/patrons';
              $.get(patronAPI)
              .then(function(data) {
                var patrons = data
                for (var i = 0; i < AlbumUsers.length; i++) {
                  for (var j = 0; j < patrons.length; j++) {
                    if (AlbumUsers[i].username === patrons[j].username) {
                      TripPatronPair[UserID] = patrons[j].user_id
                      TripPatronPair[TripID] = createdTripID
                      var settings = {
                        "async": true,
                        "crossDomain": true,
                        "url": "https://kuvafundb.herokuapp.com/api/patronstrips",
                        "method": "POST",
                        "headers": {
                          "content-type": "application/json",
                          "cache-control": "no-cache",
                        },
                        "processData": false,
                        "data": JSON.stringify(TripPatronPair)
                      }
                      $.ajax(settings).done(function (response) {
                        console.log(response);
                      });
                    }
                  }
                }
              })
            })
          })


          var $TABLE = $('#table');
          var $BTN = $('#export-btn');
          var $EXPORT = $('#export');

          $('#table-add').click(function (event) {
            var $clone = $TABLE.find('tr.hide').clone(true).removeClass('hide table-line');
            $TABLE.find('table').append($clone);
          });

          $('#RemoveGroup').click(function () {
            $(this).parents('tr').detach();
          });

          // A few jQuery helpers for exporting only
          jQuery.fn.pop = [].pop;
          jQuery.fn.shift = [].shift;

          // end of doc ready
        });
