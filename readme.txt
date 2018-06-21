# Eagle Course (Eagle Vision / Course Viewer)
# Version 0.1
# Author: Haochen Pan & Estevan Feliz
# Copyright (c) 2018 Haochen Pan & Estevan Feliz
# Thank Asura Shen for helping us to find many inspirations in making this front end project


Description:
    This project is the front-end program for the Eagle Course (Eagle Vision /
    Course Viewer) website, which allows users to view and search (nearly all)
    Boston College's courses, and add them to a online scheduler.


Advantages:
    1) Almost complete information from agora and EXCLUSIVE historical
        statistics of when courses were open and closed.
    2) Can select subjects to view easily, and on the search page, we can even
        select MULTIPLE subjects to view.
    3) Index page has quick search from INSTRUCTORS, course numbers. Search page
        can receive many conditions including meet days and meet time in minute.
    4) Highlight and hide features in the subject page and search result page
    5) Scalable chart for a course's open and closed status and COMMENT area.


Implementation:
    The Python program (op2.py) generates Json files and copy resources, while
    JavaScripts (eagle.js & eagleHelper.js) and external JS libraries render
    basic web pages (see below)


File Descriptions (Program Functions):

    2018FJune.db:
        The current database for generating Json file

    Copy.db:
        The indexed database for generating course charts, will merge to one
        database in the future

    fe.py: (342 lines)
        The python program for generating Json files, and copy web resources.
        Connects the backend with the front end

    resources:
        index.html: Index page
        search.html: Customized search page
        scheduler.html: Scheduler page
        stemp.html: Subject page template
        ctemp.html: Course Page template
        misc:
            js:
                eagle.js: (954 lines)
                    Original library for every web page's JS function, mainly jQuery
                eagleHelper.js: (262 lines)
                    Original helper library for eagle.js
                fullcalendar.js:
                    External library for the Scheduler's calendar
                moment.min.js:
                    External library for the Scheduler's calendar
            css:
                styles.css:
                    Original library for every web page's CSS style
                fullcalendar.css:
                    External library for the Scheduler's calendar
            eagle-wing.png: Icon and brand


Future Improvements:
    FRONT-END PROJECT COMPLETENESS: 50%
    1) Beautify the web pages, and re-do layout if necessary
    2) Add more features to scheduler module
