// Shared Library

function parseTime(timeString) {
    if (timeString == '') return null;

    var time = timeString.match(/(\d+)(:(\d\d))?\s*(p?)/i);
    if (time == null) return null;

    var hours = parseInt(time[1],10);
    if (hours == 12 && !time[4]) {
        hours = 0;
    }
    else {
        hours += (hours < 12 && time[4])? 12 : 0;
    }
    var d = new Date();
    d.setHours(hours);
    d.setMinutes(parseInt(time[3],10) || 0);
    d.setSeconds(0, 0);
    return d;
}


function parseTimeString(str) {
    var hr = Math.floor(str / 60);
    var mi = Math.floor(str % 60);
    if (str < 720) {
        if (mi < 10) return (hr + ":0" + mi + "am");
        else return (hr + ":" + mi + "am");
    } else {
        if (mi < 10) return (hr + ":0" + mi + "pm");
        else return (hr + ":" + mi + "pm");
    }
}


function getParameterByName(name, url) {
    console.log("getParameterByName");
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}


function escapeRegExp(str) {
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}


function replaceAll(str, find, replace) {
    return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}


// Supports search page and search.json

function hasInstructor(section, instructor){
    // Cannot break foreach loop, so early return from forEach loop is infeasible
    hasOne = false;
    section.instructor.forEach(function(each) {
        if (each.indexOf(instructor) != -1) {
            hasOne = true;
        }
    })
    return hasOne;
}


function hasCodeOrName(section, code) {
    if (section.code.toUpperCase().indexOf(code) != -1) return true;
    if (section.name.toUpperCase().indexOf(code) != -1) return true;
    return false;
}


function hasOCConflict(section, oac) {
    if (oac == "open" && section.status == "Closed") return true;
    if (oac == "closed" && section.status == "Open") return true;
    return false;

}


function hasMeetDayConflict(section, met) {
    if (section.meetDays.toUpperCase() == "BY ARRANGEMENT") return true;
    var arr = section.meetDays.split(" ");
    var day = ["M", "T", "W", "Th", "F"];

    if (met == "contains") {
        // As long as there is one day from checkbox match meetDays, there is no conflict
        // Stict??? check, if, else if...
        // if($("#inlineCheckbox1").prop("checked") == false && arr.indexOf("M") != -1)
        // continue;

        for (var j = 1; j < 6; j ++) {
            var name = "#inlineCheckbox" + j;
            if($(name).prop("checked") == true) {
                for (var i = 0; i < arr.length; i ++) {
                    if (arr[i] == day[j - 1]) return false;
                }
            }
        }
        return true;
    } else if (met == "except") {
        // if($("#inlineCheckbox1").prop("checked") == true && arr.indexOf("M") != -1)
        for (var j = 1; j < 6; j ++) {
            var name = "#inlineCheckbox" + j;
            if($(name).prop("checked") == true) {
                for (var i = 0; i < arr.length; i ++) {
                    if (arr[i] == day[j - 1]) return true;
                }
            }
        }
        return false;
    } else {
        return true;
    }

}


function hasMeetTimeConflict(section, startAfter, endsBefore) {
    var times = section.meetTime.split("-");
    // If we don't have start and end time, we mark it as time conflict
    if (times.length != 2) return true;
    if (startAfter != "0:00 am") {
        var start = parseTime(times[0]);
        //console.log(start.toTimeString().split(' ')[0]);
        if (start < parseTime(startAfter)) return true;
    }
    if (endsBefore != "24:00 pm") {
        var ends =parseTime(times[1]);
        //console.log(ends.toTimeString().split(' ')[0]);
        if (ends > parseTime(endsBefore)) return true;
    }
    return false;
}


function hasSearchFliterConflict(section, instructor, code, oac, met, startAfter, endsBefore) {
    if (ins != "") {
        var hasIns = hasInstructor(section, ins);
        if (!hasIns) return true;
    }

    if (cod != "") {
        var hasCod = hasCodeOrName(section, cod);
        if (!hasCod) return true;
    }

    if (hasOCConflict(section, oac)) return true;


    if (met != "all") {
        var hasDayConflict = hasMeetDayConflict(section, met);
        if (hasDayConflict) return true;
    }


    if (startAfter != "0:00 am" || endsBefore != "24:00 pm") {
        var hasTimeConflict = hasMeetTimeConflict(section, startAfter, endsBefore);
        if (hasTimeConflict) return true;
    }

    return false;
}


function appendToTable(section, contentTableBody) {
    var tr = contentTableBody.appendChild(document.createElement('tr'));
    var th = tr.appendChild(document.createElement('th'));

    var course = th.appendChild(document.createElement('div'));
    course.className = "course";


    var name = course.appendChild(document.createElement('a'));
    name.className = "name";
    name.innerHTML = section.name;
    name.href = "http://192.168.1.6:8080/c/2018F/"+ section.code;

    var code = course.appendChild(document.createElement('div'));
    code.className = "code";
    code.innerHTML = section.code;

    var status = course.appendChild(document.createElement('div'));
    status.className = "status";
    status.innerHTML = section.status;

    var instructors = course.appendChild(document.createElement('div'));
    instructors.className = "instructors";

    for (var k = 0; k < section.instructor.length; k ++) {
        var instructor = instructors.appendChild(document.createElement('div'));
        instructor.className = "instructor";
        instructor.innerHTML = section.instructor[k];

    }

    var meetDays = course.appendChild(document.createElement('div'));
    meetDays.className = "meetDays";
    meetDays.innerHTML = section.meetDays;

    var meetTime = course.appendChild(document.createElement('div'));
    meetTime.className = "meetTime";
    meetTime.innerHTML = section.meetTime;

    var location = course.appendChild(document.createElement('div'));
    location.className = "location";
    location.innerHTML = section.location;


    var br = course.appendChild(document.createElement('div'));
    br.innerHTML = "<br>";
}


function checkboxHandler() {
    // Check and uncheck checkboxes
    $(".form-check-input").click(function(){
        if($(this).prop("checked") == true){
            if ($('#subjectInput').val().length == 0) {
                $('#subjectInput').val($(this).val());
            } else {
                $('#subjectInput').val($('#subjectInput').val() + ", " + $(this).val());
            }
        }
        else if($(this).prop("checked") == false){
            var strLen =$('#subjectInput').val().length;
            var subLen =$(this).val().length;
            var subIdx = $('#subjectInput').val().indexOf($(this).val()) ;
            if (subIdx == 0) {
                var newStr = $('#subjectInput').val().substring(subLen + 2);
                $('#subjectInput').val(newStr);

            } else {
                var newStr = $('#subjectInput').val().substring(0, subIdx - 2) + $('#subjectInput').val().substring(subIdx + subLen);
                $('#subjectInput').val(newStr);
            }
        }
    });


    // Meetday's filter's "ALL" button
    $("#inlineRadio4").click(function(){
        //console.log("clicked");
        $('.form-check-input4').prop('checked', true);
    });

    // Switch from contain to all
    $(".form-check-input4").click(function(){
        if($("#inlineRadio4").prop("checked") == true) {
            $('#inlineRadio4').prop('checked', false);
            $('#inlineRadio5').prop('checked', true);
        }
    });
}
