//JSON API for dynamic data
var launchesBaseUrl = "https://api.spacexdata.com/v3/launches/";
var upcomingLaunchesUrl = launchesBaseUrl + "upcoming";
var rocketBaseUrl = "https://api.spacexdata.com/v3/rockets/";
var launchSiteBaseUrl = "https://api.spacexdata.com/v3/launchpads/";
var upcomingLaunches = [];
var filteredLaunches = [];
var rockets = [];

function getUpcomingLaunches() {
  fetch(upcomingLaunchesUrl)
    .then(res => res.json()).then((out) => {
      console.log("Launches:", out);
      upcomingLaunches = out;
      filteredLaunches = upcomingLaunches;
      fetch(rocketBaseUrl)
        .then(res => res.json()).then((out) => {
          rockets = out;
          displayLaunches();
        })
        .catch(err => {
          throw err
        });
    })
    .catch(err => {
      throw err
    });
}

function displayLaunches() {
  var contentElement = document.getElementById("content");
  contentElement.innerHTML = '';
  for (var l in filteredLaunches) {
    displayLaunch(filteredLaunches[l]);
  }
}

function displayLaunch(launch) {
  var contentElement = document.getElementById("content");
  var launchDate = new Date(launch.launch_date_utc);
  var launchHtml = '<div class="launch-container"><h5>';
  launchHtml += formatDate(launchDate) + " at " + formatTime(launchDate);
  launchHtml += '</h5><h3>';
  launchHtml += launch.mission_name;
  launchHtml += '</h3><h5>'
  launchHtml += launch.rocket.rocket_name + " Rocket";
  launchHtml += '</h5><img class="rocket" src="';
  launchHtml += this.getRocketImage(launch.rocket.rocket_id);
  launchHtml += '"><a href="launch-details.html?id=';
  launchHtml += launch.flight_number;
  launchHtml += '" class="button">View More</a></div>';
  contentElement.innerHTML +=  launchHtml;
}

function getRocketImage(rocketId) {
  var url = "";
  for (var r in rockets) {
    var rocket = rockets[r];
    if (rocket.rocket_id == rocketId) {
      if (rocket.flickr_images && rocket.flickr_images.length > 0) {
        url = rocket.flickr_images[0];
      }
    }
  }
  return url;
}

var globalLaunchDate;

function getLaunchDetails() {
  var launchId = getQueryStringValue("id");
  fetch(launchesBaseUrl + launchId)
    .then(res => res.json()).then((out) => {
      console.log("Launch:", out);
      var launch = out;
      fetch(rocketBaseUrl + launch.rocket.rocket_id)
        .then(res => res.json()).then((out) => {
          console.log("Rocket:", out);
          var rocket = out;
          fetch(launchSiteBaseUrl + launch.launch_site.site_id)
            .then(res => res.json()).then((out) => {
              console.log("Launch site:", out);
              var launchSite = out;
              displayLaunchDetails(launch, rocket, launchSite);
              globalLaunchDate = new Date(launch.launch_date_utc);
              calculateCountdown();
            })
            .catch(err => {
              throw err
            });
        })
        .catch(err => {
          throw err
        });
    })
    .catch(err => {
      throw err
    });
}

function displayLaunchDetails(launch, rocket, launchSite) {
  var launchDate = new Date(launch.launch_date_utc);
  var missionNameElement = document.getElementById("mission-name");
  missionNameElement.innerHTML = "Mission: " + launch.mission_name;
  var launchDateElement = document.getElementById("launch-date");
  launchDateElement.innerHTML = formatDate(launchDate) + " at " + formatTime(launchDate);
  var missionDescriptionElement = document.getElementById("mission-description");
  missionDescriptionElement.innerHTML = launch.details;
  var rocketNameElement = document.getElementById("rocket-name");
  rocketNameElement.innerHTML = rocket.rocket_name;
  var rocketDescriptionElement = document.getElementById("rocket-description");
  rocketDescriptionElement.innerHTML = rocket.description;
  var rocketDescriptionElement = document.getElementById("rocket-picture");
  rocketDescriptionElement.src = rocket.flickr_images[0];
  var siteNameElement = document.getElementById("site-name");
  siteNameElement.innerHTML = launchSite.location.name;
  var regionElement = document.getElementById("region");
  regionElement.innerHTML = launchSite.location.region;
  this.initMap(launchSite.location);
}

function initMap(location) {
  var mapElement = document.getElementById("launch-site-map");
  var site = {lat: location.latitude, lng: location.longitude};
  var map = new google.maps.Map(mapElement, {zoom: 9, center: site, disableDefaultUI: true});
  var marker = new google.maps.Marker({position: site, map: map});
}

function calculateCountdown() {
  var now = new Date();
  var diff = globalLaunchDate.getTime() - now.getTime();
  if (diff < 0) {
    diff = 0;
  }
  var seconds = Math.floor(diff / 1000);
  var minutes = Math.floor(seconds / 60);
  seconds = seconds % 60;
  var hours = Math.floor(minutes / 60);
  minutes = minutes % 60;
  var days = Math.floor(hours / 24);
  hours = hours % 24;
  var seconds10 = Math.floor(seconds / 10);
  var seconds1 = seconds % 10;
  var minutes10 = Math.floor(minutes / 10);
  var minutes1 = minutes % 10;
  var hours10 = Math.floor(hours / 10);
  var hours1 = hours % 10;
  var days100 = Math.floor(days / 100);
  var days10 = Math.floor(days / 10) % 10;
  var days1 = days % 10;
  document.getElementById("dayshundred").innerHTML = days100;
  document.getElementById("daysten").innerHTML = days10;
  document.getElementById("days").innerHTML = days1;
  document.getElementById("hoursten").innerHTML = hours10;
  document.getElementById("hours").innerHTML = hours1;
  document.getElementById("minutesten").innerHTML = minutes10;
  document.getElementById("minutes").innerHTML = minutes1;
  document.getElementById("secondsten").innerHTML = seconds10;
  document.getElementById("seconds").innerHTML = seconds1;
  setTimeout(calculateCountdown, 1000);
}

//Generic functions
function getQueryStringValue(key) {
  return new URLSearchParams(window.location.search).get(key);
}

var monthNames = [
  "January", "February", "March", "April", "May", "June", "July",
  "August", "September", "October", "November", "December"
];

function formatDate(date) {
  var day = date.getDate();
  var monthIndex = date.getMonth();
  var year = date.getFullYear();
  return day + ' ' + monthNames[monthIndex] + ' ' + year;
}

function formatTime(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var timeString = '';
  if (hours < 10) {
    timeString += '0';
  }
  timeString += hours;
  timeString += ':';
  if (minutes < 10) {
    timeString += '0';
  }
  timeString += minutes;
  return timeString;
}