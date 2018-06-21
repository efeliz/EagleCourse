//Support index page

function renderIndexCards() {
    //console.log("renderIndexCards");
    var jqXHR = $.ajax({
        type: "GET",
        url: "index.json",
        dataType: "json",
        success: function(data) {
            //console.log(data);
            //console.log(jqXHR);

            var fragAccordion = document.createDocumentFragment();
            for (var i = 0; i < data.content.length; i++) {
                var card = fragAccordion.appendChild(document.createElement('div'));
                card.className = "card";

                // card-header
                var cardHeader = card.appendChild(document.createElement('div'));
                cardHeader.className = "card-header";
                cardHeader.id = "heading" + i;

                var h5 = cardHeader.appendChild(document.createElement('h5'));
                h5.className = "mb-0";

                var button = h5.appendChild(document.createElement('button'));
                button.className = "btn btn-link";
                button.setAttribute("data-toggle", "collapse");
                button.setAttribute("data-target", "#collapse" + i);

                if (i == 0) { // Expand MCAS's card
                    button.setAttribute("aria-expanded", "true");
                } else { // Close every card else
                    button.setAttribute("aria-expanded", "false");
                }
                button.setAttribute("aria-controls", "collapse" + i);
                button.innerHTML = data.content[i].schoolName;


                // card-content
                var collapse = card.appendChild(document.createElement('div'));
                collapse.id = "collapse" + i;
                if (i == 0) { // Expand MCAS's card
                    collapse.className = "collapse show";
                } else { // Close every card else
                    collapse.className = "collapse";
                }
                collapse.setAttribute("aria-labelledby", "heading" + i);
                collapse.setAttribute("data-parent", "#accordion");

                var cardBody = collapse.appendChild(document.createElement('div'));
                cardBody.className = "card-body";

                var row = cardBody.appendChild(document.createElement('div'));
                row.className = "row";


                var subjectIndex = 0;

                // Special alignment for LAW, SCWK, and CSON which have a few subjects
                if (data.content[i].schoolCode == "LAW" || data.content[i].schoolCode == "SCWK") {
                    var col = row.appendChild(document.createElement('div'));
                    col.className = "col-sm-12 col-md-12 col-lg-12 midCard";

                    var ul = col.appendChild(document.createElement('ul'));
                    ul.className = "list-group  list-group-flush";

                    var a = ul.appendChild(document.createElement('a'));
                    a.href = data.content[i].schoolSubjects[subjectIndex].subjectUrl;
                    a.className = "list-group-item list-group-item-action";
                    a.innerHTML = data.content[i].schoolSubjects[subjectIndex].subjectCode +
                        " - " + data.content[i].schoolSubjects[subjectIndex++].subjectName;


                } else if (data.content[i].schoolCode == "CSON") {
                    for (var k = 0; k < 3; k++) {
                        var col = row.appendChild(document.createElement('div'));
                        col.className = "col-sm-12 col-md-4 col-lg-4 midCard";

                        var ul = col.appendChild(document.createElement('ul'));
                        ul.className = "list-group  list-group-flush";

                        var a = ul.appendChild(document.createElement('a'));
                        a.href = data.content[i].schoolSubjects[subjectIndex].subjectUrl;
                        a.className = "list-group-item list-group-item-action";
                        a.innerHTML = data.content[i].schoolSubjects[subjectIndex].subjectCode +
                            " - " + data.content[i].schoolSubjects[subjectIndex++].subjectName;

                    }

                } else { // Every school else

                    var totalSubjects = data.content[i].schoolSubjects.length;
                    var ulLength = Math.floor(totalSubjects / 4); // Basic lenth, could add one because of the remain.
                    var remain = totalSubjects % 4;

                    // four list groups

                    for (var ulCount = 0; ulCount < 4; ulCount++) {
                        var col = row.appendChild(document.createElement('div'));
                        col.className = "col-sm-12 col-md-6 col-lg-3";

                        var ul = col.appendChild(document.createElement('ul'));
                        ul.className = "list-group  list-group-flush";
                        var ulVarLen = (remain-- > 0) ? ulLength + 1 : ulLength;

                        // In a ul ul list:

                        for (var ulVarLenCnt = 0; ulVarLenCnt < ulVarLen; ulVarLenCnt++) {
                            var a = ul.appendChild(document.createElement('a'));
                            a.href = data.content[i].schoolSubjects[subjectIndex].subjectUrl;
                            a.className = "list-group-item list-group-item-action";
                            a.innerHTML = data.content[i].schoolSubjects[subjectIndex].subjectCode +
                                " - " + data.content[i].schoolSubjects[subjectIndex++].subjectName;
                        }
                    }
                }
            }

            // Change page's DOM elements only once
            $("#accordion").append(fragAccordion);
            indexSearchHandler();


        },

        error: function() {
            alert("error");
        }
    });
}


function indexSearchHandler() {
    $("#indexSearch").click(function() {
        //console.log($("#indexSearchInput").val());
        localStorage.removeItem("eagleIndexSearchStorage");
        var indexSearchInputArray = $("#indexSearchInput").val().toUpperCase().split(" ");
        data = {};
        data["eagleIndexSearch"] = indexSearchInputArray;

        var load = JSON.parse("[]");
        load.push(data);
        localStorage.setItem("eagleIndexSearchStorage", JSON.stringify(load));
        window.open('http://192.168.1.6:8080/search');
    })
}


// Support Scheduler

function renderCalendar() {
    //console.log("renderCalendar");
    $('#calendar').fullCalendar({
        header: {
            left: '',
            center: '',
            right: 'agendaFiveDay,listWeek'
        },
        defaultView: "agendaFiveDay",
        defaultDate: '2018-08-27',
        editable: false,
        height: 650,
        events: JSON.parse(localStorage.getItem("storage") || "[]"),
        views: {
            agendaFiveDay: {
                type: 'agenda',
                duration: { days: 7 },
                buttonText: '5 day',
                minTime: "08:00:00",
                maxTime: "23:00:00",

                weekends: false,


            }
        }
    });
}


function clearEventsHandler() {
    //console.log("clearEvents");
    $("#clearEvents").click(function(){
        localStorage.removeItem("storage");
        $('#calendar').fullCalendar("destroy");
        renderCalendar();
    });
}


function refreshEventsHandler() {
    //console.log("refreshEvents");
    $("#refreshEvents").click(function(){
        $('#calendar').fullCalendar("destroy");
        renderCalendar();
    });
}


// Supports search page and search.json

function renderSearchPageFromIndexPage(data) {
    var load = JSON.parse(localStorage.getItem("eagleIndexSearchStorage") || "[]");
    localStorage.removeItem("eagleIndexSearchStorage");
    if (load.length == 0) return;
    var dataS = load[0].eagleIndexSearch;


    var fragAllContent = document.createDocumentFragment();

    var contentTable = fragAllContent.appendChild(document.createElement('table'));
    contentTable.className = "table table-striped table-hover";
    var contentTableBody = contentTable.appendChild(document.createElement('tbody'));


    for (var i = 0; i < dataS.length; i ++) {

        for (var schoolCnt = 0; schoolCnt < data.content.length; schoolCnt ++) {

            for (var subjectCnt = 0; subjectCnt < data.content[schoolCnt].schoolSubjects.length; subjectCnt ++) {
                for (var sectionCnt = 0; sectionCnt < data.content[schoolCnt].schoolSubjects[subjectCnt].subjectContent.length; sectionCnt ++) {
                    var section = data.content[schoolCnt].schoolSubjects[subjectCnt].subjectContent[sectionCnt];
                        if (!hasCodeOrName(section, dataS[i]) && !hasInstructor(section,  dataS[i])) continue;
                        //if (!hasCodeOrName(section, dataS[i])) continue;
                        appendToTable(section, contentTableBody);

                }
            }
        }
    }

    $(".allContent").append(fragAllContent);

}


function renderSearchPage() {
    //console.log("renderSearchPage");
    var jqXHR = $.ajax({
        type: "GET",
        url: "search.json",
        dataType: "json",
        success: function (data) {
            //console.log("renderSearchPage");
            getSubjectOptions(data);
            checkboxHandler();
            //var t0 = performance.now();
            $(".dataWarehouse").data("json", data);
            //var t1 = performance.now();
            //console.log("Call to doSomething took " + (t1 - t0) + " milliseconds.")
            //console.log($(".dataWarehouse").data("json"));
            renderSearchPageFromIndexPage(data);
        },
        error: function () {
            alert("error");
        }
    });
}


function highlightAndHide() {
    //console.log("highlightAndHide");
    var query = $("#queryInput")[0].value;
    query = replaceAll(query, " ", "");

    var $context = $("div.container-fluid > div.resultPage > div.allContent > table > tbody > tr");
    $context.show().unmark();
    if (query) {
        //console.log("the query is " + query);
        $context.mark(query, {
            done: function() {
                $context.not(":has(mark)").hide();
            }
        });
    }
}


function appendSearchContent(data, subjects, cod, ins, oac, met, startAfter, endsBefore) {
    var fragAllContent = document.createDocumentFragment();

    var contentTable = fragAllContent.appendChild(document.createElement('table'));
    contentTable.className = "table table-striped table-hover";
    var contentTableBody = contentTable.appendChild(document.createElement('tbody'));

    for (var schoolCnt = 0; schoolCnt < data.content.length; schoolCnt ++) {
        for (var subjectCnt = 0; subjectCnt < data.content[schoolCnt].schoolSubjects.length; subjectCnt ++) {
            // console.log(data.content[schoolCnt].schoolSubjects[subjectCnt].subjectCode);

            // Check if the current subject is in the array of subjects
            var code = data.content[schoolCnt].schoolSubjects[subjectCnt].subjectCode;
            if (subjects.indexOf(code) == -1) continue;

            for (var sectionCnt = 0; sectionCnt < data.content[schoolCnt].schoolSubjects[subjectCnt].subjectContent.length; sectionCnt ++) {
                var section = data.content[schoolCnt].schoolSubjects[subjectCnt].subjectContent[sectionCnt];

                var conflict = hasSearchFliterConflict(section, ins, cod, oac, met, startAfter, endsBefore);
                if (conflict) {
                    continue;
                }

                appendToTable(section, contentTableBody);

            }
        }
    }


    $(".allContent").append(fragAllContent);
}


function selectSchoolChangeHandler() {
    $("#selectSchool").change(function() {
        //console.log($('#selectSchool').val());
        $('#collapseExample').collapse('hide');
        $('div.row').css({"display" : "none"});

        var schoName = "div.row." + $('#selectSchool').val();
        $(schoName).css({"display" : ""});
    })
}


function subjectClearHandler() {
    // Subject clear button
    $("#subjectClear").click(function() {
        $('#subjectInput').val("");
        $(".form-check-input").prop('checked', false);
    })
}


function optionsClearHandler() {
    //All Clear button
    $("#allClear").click(function() {
        $("#nameCodeCheckbox").prop('checked', false);
        $('#nameCodeInput').val("");

        $("#instructorCheckbox").prop('checked', false);
        $('#instructorInput').val("");

        $("#inlineRadio1").prop('checked', true);
        $("#inlineRadio4").prop('checked', true);
        $('.form-check-input4').prop('checked', true);


        $("#customCheck1").prop('checked', false);
        $('#customRange1Output').val("12:00pm");
        $('#customRange1').val("720");
        $("#customCheck2").prop('checked', false);
        $('#customRange2Output').val("12:00pm");
        $('#customRange2').val("720");
    })
}


function searchSubmitHandler() {
    $('#searchSubmit').click(function() {


        data = $(".dataWarehouse").data("json");

        // Instructor filter check
        ins = "";
        if ($("#instructorCheckbox").prop("checked") == true) {
            //ins = document.getElementById("instructorInput").value.toUpperCase();
            ins = $("#instructorInput")[0].value.toUpperCase();
            //console.log("got");

        }

        // section code and name filter check
        cod = "";
        if ($("#nameCodeCheckbox").prop("checked") == true) {
            //cod = document.getElementById("nameCodeInput").value.toUpperCase();
            cod = $("#nameCodeInput")[0].value.toUpperCase();

        }

        // section open and close filter check
        oac = "";
        if ($("#inlineRadio1").prop("checked") == true) {
            oac = "both";
        } else if ($("#inlineRadio2").prop("checked") == true) {
            oac = "open";
        } else if ($("#inlineRadio3").prop("checked") == true) {
            oac = "closed";
        }

        met = "";
        if ($("#inlineRadio4").prop("checked") == true) {
            met = "all";
        } else if ($("#inlineRadio5").prop("checked") == true) {
            met = "contains";
        } else if ($("#inlineRadio6").prop("checked") == true) {
            met = "except";
        }



        //Remove previous search result
        //var tbl = document.getElementsByClassName("table");
        var tbl = $(".table")
        if (tbl.length != 0) {
            tbl[0].remove();
        }

        // See whether there is a query input about subject
        var subjects = $('#subjectInput').val();
        if (subjects == null || subjects.length == 0) {
            return;
        }
        subjects = subjects.toUpperCase().split(", ");
        //console.log(subjects);


        //meetTime

        if ($("#customCheck1").prop("checked") == true) {
            startAfter = $("#customRange1Output").val();
            //console.log(startAfter);
        } else {
            startAfter = "0:00 am"

        }
        //console.log(parseTime(startAfter));

        if ($("#customCheck2").prop("checked") == true) {
            endsBefore = $("#customRange2Output").val();
        } else {
            endsBefore = "24:00 pm";
        }
        //console.log(parseTime(endsBefore));

        appendSearchContent(data, subjects, cod, ins, oac, met, startAfter, endsBefore);
        highlightAndHide();

        return false;
    });
}


//Support subject page
function renderSubjectPage(subject) {
    var jqXHR = $.ajax({
        type: "GET",
        url:  subject + ".json",
        dataType: "json",
        success: function (data) {

            var fragbasicInfo = document.createDocumentFragment();
            var fragAllContent = document.createDocumentFragment();

            var row = fragbasicInfo.appendChild(document.createElement('div'));
            row.className = "row";

            var schoolCode = row.appendChild(document.createElement('div'));
            schoolCode.className = "schoolCode col-sm-12 col-md-6 col-lg-6";
            schoolCode.innerHTML = data.schoolCode;

            var schoolName = row.appendChild(document.createElement('div'));
            schoolName.className = "schoolName col-sm-12 col-md-6 col-lg-6";
            schoolName.innerHTML = data.schoolName;

            var subjectCode = row.appendChild(document.createElement('div'));
            subjectCode.className = "subjectCode col-sm-12 col-md-6 col-lg-6";
            subjectCode.innerHTML = data.subjectCode;

            var subjectName = row.appendChild(document.createElement('div'));
            subjectName.className = "subjectName col-sm-12 col-md-6 col-lg-6";
            subjectName.innerHTML = data.subjectName;

            var contentTable = fragAllContent.appendChild(document.createElement('table'));
            contentTable.className = "table table-striped table-hover";

            var contentTableBody = contentTable.appendChild(document.createElement('tbody'));

            for (var i = 0; i < data.Content.length; i ++) {
                var tr = contentTableBody.appendChild(document.createElement('tr'));
                var th = tr.appendChild(document.createElement('th'));


                var course = th.appendChild(document.createElement('div'));
                course.className = "course";

                var title = course.appendChild(document.createElement('div'));
                title.className = "title";
                title.innerHTML = data.Content[i].title;

                var description = course.appendChild(document.createElement('div'));
                description.className = "description";
                description.innerHTML = data.Content[i].description;

                var br = course.appendChild(document.createElement('div'));
                br.innerHTML = "<br>";

                var section = course.appendChild(document.createElement('div'));
                section.className = "section";

                /* Info of each section */
                for (var j = 0; j < data.Content[i].section.length; j ++) {
                    var code = section.appendChild(document.createElement('a'));
                    code.className = "code";
                    code.innerHTML = data.Content[i].section[j].code;
                    code.href = "http://192.168.1.6:8080/c/2018F/"+ data.Content[i].section[j].code;

                    var status = section.appendChild(document.createElement('div'));
                    status.className = "status";
                    status.innerHTML = data.Content[i].section[j].status;


                    var instructors = section.appendChild(document.createElement('div'));
                    instructors.className = "instructors";

                    for (var k = 0; k < data.Content[i].section[j].instructor.length; k ++) {
                        var instructor = instructors.appendChild(document.createElement('div'));
                        instructor.className = "instructor";
                        instructor.innerHTML = data.Content[i].section[j].instructor[k];

                    }


                    var meetDays = section.appendChild(document.createElement('div'));
                    meetDays.className = "meetDays";
                    meetDays.innerHTML = data.Content[i].section[j].meetDays;


                    var meetTime = section.appendChild(document.createElement('div'));
                    meetTime.className = "meetTime";
                    meetTime.innerHTML = data.Content[i].section[j].meetTime;


                    var location = section.appendChild(document.createElement('div'));
                    location.className = "location";
                    location.innerHTML = data.Content[i].section[j].location;

                    var br = section.appendChild(document.createElement('div'));
                    br.innerHTML = "<br>";

                }


                var br = course.appendChild(document.createElement('div'));
                br.innerHTML = "<br>";
                br = course.appendChild(document.createElement('div'));
                br.innerHTML = "<br>";


            };

            $(".basicInfo").append(fragbasicInfo);
            $(".allContent").append(fragAllContent);

        },
        error: function () {
            alert("error");
        }
    });
}


function subjectPagehighlight() {
    var $input = $("input[name='keyword']");
    $input.on("input", function() {
        // Only allow to search for key words for performance issue
        var term = $(this).val();
        if (term.length < 3) {
            term = "";
        }
        term = replaceAll(term, " ", "");
        /* Since the table is appended after loading, context can only be found when the function is called. */
        var $context = $("div.container-fluid > div.subjectPage > div.allContent > table > tbody > tr");
        $context.show().unmark();
        if (term) {
            $context.mark(term, {
                done: function() {
                    $context.not(":has(mark)").hide();
                }
            });
        }
    });
}


function getSubjectOptions(data) {
    var fragSchoolOptions = document.createDocumentFragment();
    for (var i = 0; i < data.content.length; i ++) {
        var op = fragSchoolOptions.appendChild(document.createElement('option'));

        var cd = data.content[i].schoolCode;
        op.value = cd;
        op.innerHTML = cd + "\t" + data.content[i].schoolName;
    }

    $("#selectSchool").append(fragSchoolOptions);


    var fragCardOptions = document.createDocumentFragment();
    for (var schoolCnt = 0; schoolCnt < data.content.length; schoolCnt ++) {

        var row = fragCardOptions.appendChild(document.createElement('div'));
        row.className = "row " + data.content[schoolCnt].schoolCode;

        var totalSubjects = data.content[schoolCnt].schoolSubjects.length;
        var ulLength = Math.floor(totalSubjects / 4); // Basic lenth, could add one because of the remain.
        var remain = totalSubjects % 4;

        // four list groups
        var subjectIndex = 0;
        for (var ulCount = 0; ulCount < 4; ulCount ++) {
            var col = row.appendChild(document.createElement('div'));
            col.className = "col-sm-12 col-md-6 col-lg-3";
            var ulVarLen = (remain-- > 0) ? ulLength + 1 : ulLength;
            // In a ul ul list:
            for (var ulVarLenCnt = 0; ulVarLenCnt < ulVarLen; ulVarLenCnt ++) {
                var form = col.appendChild(document.createElement('div'));
                form.className = "form-check";

                var input = form.appendChild(document.createElement('input'));
                input.className = "form-check-input";
                input.type = "checkbox"

                var scd = data.content[schoolCnt].schoolSubjects[subjectIndex].subjectCode;
                input.value = scd;
                input.id = scd;

                var label = form.appendChild(document.createElement('label'));
                label.className = "form-check-label";
                label.innerHTML =
                scd + "  " +
                data.content[schoolCnt].schoolSubjects[subjectIndex++].subjectName;
            }

        }
    }

    $(".card-body").append(fragCardOptions);


    // Mark every school's subject options as invisible except MCAS.
    $('div.row').css({"display" : "none"});
    $('div.row.MCAS').css({"display" : ""});
}


// Support course page and chart

function renderCoursePage(subject, course) {
    var jqXHR = $.ajax({
        type: "GET",
        url: "../../s/" + subject + ".json",
        dataType: "json",
        success: function (data) {

            var fragbasicInfo = document.createDocumentFragment();
            var fragAllContent = document.createDocumentFragment();

            var row = fragbasicInfo.appendChild(document.createElement('div'));
            row.className = "row";

            var schoolCode = row.appendChild(document.createElement('div'));
            schoolCode.className = "schoolCode col-sm-12 col-md-6 col-lg-6";
            schoolCode.innerHTML = data.schoolCode;

            var schoolName = row.appendChild(document.createElement('div'));
            schoolName.className = "schoolName col-sm-12 col-md-6 col-lg-6";
            schoolName.innerHTML = data.schoolName;

            var subjectCode = row.appendChild(document.createElement('div'));
            subjectCode.className = "subjectCode col-sm-12 col-md-6 col-lg-6";
            subjectCode.innerHTML = data.subjectCode;

            var subjectName = row.appendChild(document.createElement('div'));
            subjectName.className = "subjectName col-sm-12 col-md-6 col-lg-6";
            subjectName.innerHTML = data.subjectName;

            var content = fragAllContent.appendChild(document.createElement('div'));
            content.className = "content";


            for (var i = 0; i < data.Content.length; i ++) {
                for (var j = 0; j < data.Content[i].section.length; j ++) {
                    if (data.Content[i].section[j].code == course) {

                        var title = content.appendChild(document.createElement('div'));
                        title.className = "title";
                        title.innerHTML = data.Content[i].title;

                        var code = content.appendChild(document.createElement('div'));
                        code.className = "code";
                        code.innerHTML = data.Content[i].section[j].code;

                        var description = content.appendChild(document.createElement('div'));
                        description.className = "description";
                        description.innerHTML = data.Content[i].description;

                        var status = content.appendChild(document.createElement('div'));
                        status.className = "status";
                        status.innerHTML = data.Content[i].section[j].status;


                        var instructors = content.appendChild(document.createElement('div'));
                        instructors.className = "instructors";

                        for (var k = 0; k < data.Content[i].section[j].instructor.length; k ++) {
                            var instructor = instructors.appendChild(document.createElement('div'));
                            instructor.className = "instructor";
                            instructor.innerHTML = data.Content[i].section[j].instructor[k];
                        }

                        var meetDays = content.appendChild(document.createElement('div'));
                        meetDays.className = "meetDays";
                        meetDays.innerHTML = data.Content[i].section[j].meetDays;


                        var meetTime = content.appendChild(document.createElement('div'));
                        meetTime.className = "meetTime";
                        meetTime.innerHTML = data.Content[i].section[j].meetTime;


                        var location = content.appendChild(document.createElement('div'));
                        location.className = "location";
                        location.innerHTML = data.Content[i].section[j].location;

                        // add-on
                        var department = content.appendChild(document.createElement('div'));
                        department.className = "department";
                        department.innerHTML = "department: " + data.Content[i].section[j].department;

                        var size = content.appendChild(document.createElement('div'));
                        size.className = "size";
                        size.innerHTML = "size: " + data.Content[i].section[j].size;

                        var credit = content.appendChild(document.createElement('div'));
                        credit.className = "credit";
                        credit.innerHTML = "credit: " + data.Content[i].section[j].credit;

                        var level = content.appendChild(document.createElement('div'));
                        level.className = "level";
                        level.innerHTML = "level: " + data.Content[i].section[j].level;

                        var preReq = content.appendChild(document.createElement('div'));
                        preReq.className = "preReq";
                        preReq.innerHTML = "preReq: " + data.Content[i].section[j].preReq;

                        var coReq = content.appendChild(document.createElement('div'));
                        coReq.className = "coReq";
                        coReq.innerHTML = "coReq: " + data.Content[i].section[j].coReq;

                        var crossListing = content.appendChild(document.createElement('div'));
                        crossListing.className = "crossListing";
                        crossListing.innerHTML = "crossListing: " + data.Content[i].section[j].crossListing;

                        var courseIndex = content.appendChild(document.createElement('div'));
                        courseIndex.className = "courseIndex";
                        courseIndex.innerHTML = "courseIndex: " + data.Content[i].section[j].courseIndex;

                        var frequency = content.appendChild(document.createElement('div'));
                        frequency.className = "frequency";
                        frequency.innerHTML = "frequency: " + data.Content[i].section[j].frequency;

                        var repeatable = content.appendChild(document.createElement('div'));
                        repeatable.className = "repeatable";
                        repeatable.innerHTML = "repeatable: " + data.Content[i].section[j].repeatable;



                    }
                }
            }

            var br = content.appendChild(document.createElement('div'));
            br.innerHTML = "<br>";


            $(".basicInfo").append(fragbasicInfo);
            $(".allContent").append(fragAllContent);

        },
        error: function () {
            alert("error");
        }
    });


    $("#storageLoad").click(function(){
        var load = JSON.parse(localStorage.getItem("storage") || "[]");
        var data = {};
        data["title"] = $(".title")[0].innerHTML;
        data["url"] = "http://192.168.1.6:8080/" + $(".code")[0].innerHTML;

        if ($(".meetTime").length == 0) {
            //console.log("No time found.");
            return;
        }
        var times = $(".meetTime")[0].innerHTML.split("-");
        if (times.length != 2) {
            //console.log("No time found.");
            return;
        } else {
            var st = parseTime(times[0]);
            start = st.toTimeString().split(' ')[0];
            data["start"] = start;

            var ed = parseTime(times[1]);
            end = ed.toTimeString().split(' ')[0];
            data["end"] = end;
        }

        var days = $(".meetDays")[0].innerHTML.split(" ");
        var daysArray = [];
        if (days.indexOf("M") != -1) daysArray.push(1);
        if (days.indexOf("T") != -1) daysArray.push(2);
        if (days.indexOf("W") != -1) daysArray.push(3);
        if (days.indexOf("Th") != -1) daysArray.push(4);
        if (days.indexOf("F") != -1) daysArray.push(5);
        if (daysArray.length == 0) {
            //console.log("No day found.");
            return;
        }

        data["dow"] = daysArray;

        switch (load.length) {
            case 0:
                data["color"] = "#4286f4";
                break;
            case 1:
                data["color"] = "#ffd42b";
                break;
            case 2:
                data["color"] = "#75ff2a";
                break;
            case 3:
                data["color"] = "#29fff4";
                break;
            case 4:
                data["color"] = "#ff19ef";
                break;
            default:
                data["color"] = "#d5d81c";
                break;
        }
        //console.log(data);
        load.push(data);
        localStorage.setItem("storage", JSON.stringify(load));
        //var newLoad = JSON.parse(localStorage.getItem("storage"));
        //console.log(newLoad);
    });
}


function renderCourseReview() {

    wpac_init = window.wpac_init || [];
    wpac_init.push({widget: 'Review', id: 12052});
    (function() {
        if ('WIDGETPACK_LOADED' in window) return;
        WIDGETPACK_LOADED = true;
        var mc = document.createElement('script');
        mc.type = 'text/javascript';
        mc.async = true;
        mc.src = 'https://embed.widgetpack.com/widget.js';
        var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(mc, s.nextSibling);
    })();
}


function renderCourseChart(course) {
    var width = 960, height = 500;
    var x = d3.scaleLinear().range([0, width]);
    var y = d3.scaleLinear().range([0, height]);

    var svg = d3.select(".chart").append("svg")
        .attr("width", width)
        .attr("height", height);

    d3.json("http://192.168.1.6:8080/c/2018F/"+ course + ".json", function(error, data) {
        var hierarchy = d3.hierarchy(data)
            .sum(function(d) { return d.value; })
        var partitionLayout = d3.partition();
        partitionLayout(hierarchy);

        var rect = svg.selectAll("rect")
            .data(hierarchy.descendants())
            .enter().append("rect")
                .attr("x", function(d) { return x(d.x0); })
                .attr("y", function(d) { return y(d.y0); })
                .attr("width", function(d) { return x(d.x1-d.x0); })
                .attr("height", function(d) { return y(d.y1-d.y0); })
                .attr("fill", function(d) {
                    if (d.depth == 4) {
                        if (d.data.status.slice(0,1) == "O") { return "#00FF7F";}
                        else { return "#FF8000";}
                    }
                    else if (d.depth == 0) { return "#4169E1"}
                    else if (d.depth == 1) { return "#1E90FF"}
                    else if (d.depth == 2) { return "#87CEEB"}
                    else { return "#BDFCC9"}
                }
        )
        .on("click", function(d){
            x.domain([d.x0, d.x1]);
            y.domain([d.y0, 1]).range([d.y0 ? 20 : 0, height]);
            var rect = svg.selectAll("rect")
                .transition()
                .duration(750)
                .attr("x", function(d) { return x(d.x0); })
                .attr("y", function(d) { return y(d.y0); })
                .attr("width", function(d) { return x(d.x1) - x(d.x0); })
                .attr("height", function(d) { return y(d.y1) - y(d.y0); });
        })
        .on("mousemove", mouseMove);
    });
}

function mouseMove(d) {
    d3.selectAll(".lab").remove()
    var svg = d3.select("svg");
    var text = svg.append("text")
        .attr("x", d3.mouse(this)[0] - 50)
        .attr("y", d3.mouse(this)[1] - 5)
        .attr("class", "lab")
        .text( function() {
            if (d.depth == 0) { return "Year: " + d.data.year;}
            else if (d.depth == 1) { return "Month: " +d.data.month;}
            else if (d.depth == 2) { return "Week Of the Month: " +d.data.weekOftheMonth;}
            else if (d.depth == 3) { return "Day of the Week: " +d.data.dayOftheWeek;}
            else { return d.data.status;}

        }
        );
}


function coursePagehighlight() {
    // No longer use
    var $input = $("input[name='keyword']");
    $input.on("input", function() {
        var term = $(this).val();

        //Since the table is appended after loading, context can only be found when the function is called.
        var $context = $("div.container-fluid > div.coursePage > div.allContent");
        $context.show().unmark();
        if (term) {
            $context.mark(term, {

            });
        }
    });
}
