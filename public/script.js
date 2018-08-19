var STORAGE_ID = "WeatherBox";  
var getFromLocalStorage = function () {
    let tempvar =  JSON.parse(localStorage.getItem(STORAGE_ID) || '[]'); //return empty array in case of null
    return tempvar;
}
var saveToLocalStorage = function () {
    localStorage.setItem(STORAGE_ID, JSON.stringify(appWeather.weatherBoxes));
}


let appWeather={ 
    weatherBoxes : getFromLocalStorage()
    //weatherBoxes : []
};
let dataWeather;
let idUnique = 0; //there is a special random generator


//use it latter
const S4 = function () {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1); 
}
const createGuid = ()=>{
    // then to call it, plus stitch in '4' in the third group
    return (S4() + S4() + "-" + S4() + "-4" + S4().substr(0,3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
}


class WeatherBox {
    constructor(id, cityName,tempC,tempF,timeStamp) {
        this.id = id;
        this.cityName = cityName;
        this.tempCelsius = tempC; // temp in Celsius
        this.tempFahrenheit = tempF; // temp in Fahrenheit
        this.comments=[];
        this.timeStamp = timeStamp; 
    }
}

class Comment {
    constructor(id, cText) {
        this.id = id;
        this.cText = cText;
    }
}

var source = $("#entry-template").html();
var template = Handlebars.compile(source);

var renderWeatherBox = function () {
    $('.weather-boxes').empty();
    var newHTML = template(appWeather);
    $('.weather-boxes').append(newHTML);    
}

//convert to the desire date format
var convertToDateFormat = function (today){
    var hours = today.getHours();
    var minutes = today.getMinutes();
    var day = today.getDate();
    var month = today.getMonth()+1; 
    var year = today.getFullYear();
    hours = (hours<10) ?  hours='0'+ hours :hours ; 
    minutes = (minutes<10) ?  minutes='0'+ minutes :minutes ; 
    day = (day<10) ?  day='0'+ day :day ; 
    month = (month<10) ?  month='0'+ month :month ; 
    var dateStr = `at ${hours}:${minutes} on ${day}/${month}/${year}`;
    return dateStr
}

//temp in [°C]
var convertFromKelvinToCelcius = function(temp){
    return Math.round((temp)-273.15);
}

//temp in [°F]
var convertFromKelvinToFahrenheit = function(temp){
    return Math.round(((temp)*9/5)-459.67);
}

var createNewWeatherBox = function (dataWeather){
    var tempC  = convertFromKelvinToCelcius(dataWeather.main.temp);
    var tempF = convertFromKelvinToFahrenheit(dataWeather.main.temp);
    var timeStamp = convertToDateFormat(new Date());
    var newWB = new WeatherBox(++idUnique, dataWeather.name,tempC,tempF,timeStamp);
    appWeather.weatherBoxes.push(newWB); 
    saveToLocalStorage();
}


var addCommentToBox= function (id,text,boxID) {
    var newComment = new Comment(id,text);
    var box = _findBoxByID(boxID);
    box.comments.push(newComment);
    saveToLocalStorage();
};

var _findBoxByID= function(id){
    for (box of appWeather.weatherBoxes){
        if (id==box.id){
            return box
        }
    }
}

var _findCommentByID= function(boxID, commentID){
    var box = _findBoxByID(boxID) 
    for (comment of box.comments){
        if (commentID==comment.id){
            return comment;
        }
    }
}

var removeWeatherBoxById = function (boxID) {
    var box = _findBoxByID(boxID);
    appWeather.weatherBoxes.splice(appWeather.weatherBoxes.indexOf(box), 1); 
    saveToLocalStorage(); 
}

var removeCommentById= function (boxID, commentID) {
    var comment = _findCommentByID(boxID, commentID);
    var box = _findBoxByID(boxID);
    box.comments.splice(box.comments.indexOf(comment), 1);  
    saveToLocalStorage();    
}


var fetch = function(city){
    let apiKey = '1e9ddeb964fa9b9eaabb6f3a02c21cda';
    let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&APPID=${apiKey}`;
    $.ajax({
        method: "GET",
        url: url,
        success: function(data) {
            dataWeather = data;
            createNewWeatherBox(dataWeather);
            renderWeatherBox();
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(textStatus);
        }
    });
};

renderWeatherBox();

//Events
$('.form-get').on('click', '.get-btn', function(e) {  
    e.preventDefault();
    let city = $('.form-get').find('#city-name').val();
    fetch(city);
});

$('.weather-boxes').on('click', '.trash-btn', function() {  
    let id = $(this).closest('.box').attr('box-id');
    removeWeatherBoxById(id);
    renderWeatherBox();
});

$('.weather-boxes').on('click', '.add-comment-btn', function(e) {  
    e.preventDefault();
    let commentID = $(this).closest('.form-comment').attr('data-id'); 
    let commentText = $(this).closest('.form-comment').find('.comment-text').val();
    let boxID = $(this).closest('.box').attr('box-id');
    addCommentToBox(commentID,commentText,boxID);
    renderWeatherBox();
});

$('.weather-boxes').on('click', '.remove-comment', function() {  
    let commentID = $(this).closest('.comment').attr('comment-id');
    let boxID = $(this).closest('.box').attr('box-id');
    removeCommentById(boxID,commentID);
    renderWeatherBox();
});


