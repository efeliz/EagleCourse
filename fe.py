import os
import sqlite3
from distutils.dir_util import copy_tree

currDir  = os.getcwd()
dbName = "Copy.db" # for chart, indexed
#dbName = "CourseDB2018F409.db" # not indexed
#dbName = "2018FJune.db" # current version
def getSubjectJson(subject, conn):

    subjectRecord = conn.execute('select * from Subject where abbre = ?', (subject,)).fetchone()
    SchoolRecord = conn.execute('select * from school where id = ? limit 1',(subjectRecord[1],)).fetchone()
    subjectJson = os.pardir + "\\webroot\\s\\" + subject +".json"
    f = open(subjectJson, "w", encoding='utf_8')

    string = "{\n"
    string += "\t" + q("subjectCode") + " : " + q(subjectRecord[2]) + ",\n"
    string += "\t" + q("subjectName") + " : " + q(subjectRecord[3]) + ",\n"
    string += "\t" + q("schoolCode") + " : " + q(SchoolRecord[2]) + ",\n"
    string += "\t" + q("schoolName") + " : " + q(SchoolRecord[3]) + ",\n"
    string += "\t" + q("Content") + " : [\n"

    stats = conn.execute('select count (distinct substr(abbre, 1, 8)) from course where abbre like ?', (subject + "%",)).fetchone()
    abbres = conn.execute('select distinct substr(abbre, 1, 8) from course where abbre like ?', (subject + "%",))
    #print("\n\nfor subjectCode =" + subjectRecord[2] +" count " + str(stats[0]) +"\n\n")

    if (stats[0] == 0) : # Prevent there is no course of the subject
            string += "\t]\n"
    else:
        for abbre in abbres:
            string += "\t\t{\n"
            title = conn.execute('select title from course where abbre like ? limit 1', (abbre[0] + "%",)).fetchone()
            string += "\t\t\t" + q("title") + ":" + q(title[0]) + ",\n"
            description = conn.execute('select description from static where abbre like ? limit 1', (abbre[0] + "%",)).fetchone()
            if (description is None) :
                print ("for title code = " + title[0], "description is none")
                string += "\t\t\t" + q("description") + ":" + q("No description") + ",\n"
            else:
                string += "\t\t\t" + q("description") + ":" + q(e(description[0])) + ",\n"
            string += "\t\t\t" + q("section") + " : [\n"
            sectionContent = getSectionJson(abbre[0], conn)
            string += sectionContent
            string += "\t\t\t]\n"
            string += "\t\t},\n"
        string = string[0:-2] + "\n"
        string += "\t]\n"

    string += "}\n"
    f.write(string)
    f.close()

def getSectionJson(course, conn):

    courseRecords = conn.execute('select * from course where abbre like ?', (course + "%",))
    string = ""
    for courseRecord in courseRecords:
        string += "\t\t\t\t{\n"
        staticRecord = conn.execute('select * from static where abbre = ?', (courseRecord[2],)).fetchone()
        string +=  "\t\t\t\t\t" + q("code") + ":" + q(courseRecord[2]) + ",\n"
        string += "\t\t\t\t\t" + q("status") + ":" + q(courseRecord[4]) + ",\n"
        string += "\t\t\t\t\t" + q("instructor") + ":" + getProfessor(conn, courseRecord[0]) + ",\n"
        if (staticRecord is None) :
            print ("for course code = " + courseRecord[2], "static record is none")
            string += "\t\t\t\t\t" + q("meetDays") + ":" + q("None") + ",\n"
            string += "\t\t\t\t\t" + q("meetTime") + ":" + q("None") + ",\n"
            string += "\t\t\t\t\t" + q("location") + ":" + q("None") + "\n"
        else:
            string += "\t\t\t\t\t" + q("meetDays") + ":" + q(staticRecord[2]) + ",\n"
            string += "\t\t\t\t\t" + q("meetTime") + ":" + q(staticRecord[5]) + ",\n"
            string += "\t\t\t\t\t" + q("location") + ":" + q(staticRecord[8]) + ",\n"
            string += "\t\t\t\t\t" + q("department") + ":" + q(staticRecord[12]) + ",\n"
            string += "\t\t\t\t\t" + q("size") + ":" + q(staticRecord[14]) + ",\n"
            string += "\t\t\t\t\t" + q("credit") + ":" + q(staticRecord[15]) + ",\n"
            string += "\t\t\t\t\t" + q("level") + ":" + q(staticRecord[16]) + ",\n"
            string += "\t\t\t\t\t" + q("preReq") + ":" + q(staticRecord[18]) + ",\n"
            string += "\t\t\t\t\t" + q("coReq") + ":" + q(staticRecord[19]) + ",\n"

            string += "\t\t\t\t\t" + q("crossListing") + ":" + q(staticRecord[20]) + ",\n"
            string += "\t\t\t\t\t" + q("courseIndex") + ":" + q(staticRecord[21]) + ",\n"
            string += "\t\t\t\t\t" + q("frequency") + ":" + q(staticRecord[22]) + ",\n"
            string += "\t\t\t\t\t" + q("repeatable") + ":" + q(staticRecord[23]) + "\n"



        string += "\t\t\t\t},\n"
    string = string[0:-2] + "\n"
    return string

def getProfessor(conn, courseid):

    string = "["
    index = 0
    for InstructToRecord in conn.execute('select insID from InstructTo where courseID = ?',(courseid,)):
        InstructorRecord = conn.execute('select name from instructor where id = ? limit 1',(InstructToRecord[0],)).fetchone()
        string += q(InstructorRecord[0].strip()) + ","
    string = string[0:-1] + "]"
    return string

def q(d):
    #q the content with a pair of double q
    if d is None:
        return "\"\""
    d = d.replace("\n", "").replace("\t", "")
    return "\"" + d + "\""

def e(d):
    #Replace double qs to their escape sequences
    if d is None:
        return
    return d.replace("\"", "\\\"")

def getIndexJson(conn):
    indexJson = os.pardir + "\\webroot\\index.json"
    f = open(indexJson, "w", encoding='utf_8')
    string = "{\n"
    string += "\t" + q("content") + " : [\n"


    schoolRecords = conn.execute('select * from school')
    for SchoolRecord in schoolRecords:
        schoolId = SchoolRecord[0];
        string += "\t\t{\n"
        string += "\t\t\t" + q("schoolName") + " : " + q(SchoolRecord[3]) + ",\n"
        string += "\t\t\t" + q("schoolCode") + " : " + q(SchoolRecord[2]) + ",\n"
        string += "\t\t\t" + q("schoolSubjects") + " : [\n"
        subjectRecords = conn.execute('select abbre, name from subject where schoolid = ?', (schoolId,))
        for subjectRecord in subjectRecords:
            string += "\t\t\t\t{\n"
            string += "\t\t\t\t\t" + q("subjectName") + " : " + q(subjectRecord[1]) + ",\n"
            string += "\t\t\t\t\t" + q("subjectCode") + " : " + q(subjectRecord[0]) + ",\n"
            string += "\t\t\t\t\t" + q("subjectUrl") + " : " + q("http://192.168.1.6:8080/s/" + subjectRecord[0]) + "\n"
            string += "\t\t\t\t},\n"

        string = string[0:-2] + "\n"
        string += "\t\t\t]\n"
        string += "\t\t},\n"

    string = string[0:-2] + "\n"
    string += "\t]\n"
    string += "}\n"



    f.write(string)
    f.close()

def getSubjectPage(subject):
    subjectDir = os.pardir + "\\webroot\\s\\" + subject +".html"
    f = open(subjectDir, "w")
    stempDir = currDir + "\\resources\\stemp.html"
    content = open(stempDir, 'r').read().replace('subjectPlaceholder', subject)
    f.write(content)
    f.close()

def getCoursePage(course):
    subjectDir = os.pardir + "\\webroot\\c\\2018F\\" + course +".html"
    f = open(subjectDir, "w")
    ctempDir = currDir + "\\resources\\ctemp.html"
    content = open(ctempDir, 'r').read().replace('subjectPlaceholder', course[0:4]).replace('coursePlaceholder', course)
    f.write(content)
    f.close()

def getIndexPage():
    indexDir = os.pardir + "\\webroot\\index.html"
    f = open(indexDir, "w")
    tempDir = currDir + "\\resources\\index.html"
    content = open(tempDir, 'r').read()
    f.write(content)
    f.close()

def getSearchPage():
    indexDir = os.pardir + "\\webroot\\search.html"
    f = open(indexDir, "w")
    tempDir = currDir + "\\resources\\search.html"
    content = open(tempDir, 'r').read()
    f.write(content)
    f.close()

def getMisc():
    fromDir = os.getcwd() + "\\resources\\misc"
    toDir1 = os.pardir + "\\webroot\\s"
    toDir2 = os.pardir + "\\webroot"
    #copy_tree(fromDir, toDir1)
    copy_tree(fromDir, toDir2)

def getSearchJson(conn):
    searchJson = os.pardir + "\\webroot\\search.json"
    f = open(searchJson, "w", encoding='utf_8')
    string = "{\n"
    string += "\t" + q("term") + " : " + q("2018F") + ",\n" #hardcode
    string += "\t" + q("content") + " : [\n"

    schoolRecords = conn.execute('select * from school')
    for SchoolRecord in schoolRecords:
        schoolId = SchoolRecord[0];
        string += "\t\t{\n"
        string += "\t\t\t" + q("schoolName") + " : " + q(SchoolRecord[3]) + ",\n"
        string += "\t\t\t" + q("schoolCode") + " : " + q(SchoolRecord[2]) + ",\n"
        string += "\t\t\t" + q("schoolSubjects") + " : [\n"
        subjectRecords = conn.execute('select abbre, name from subject where schoolid = ?', (schoolId,))
        for subjectRecord in subjectRecords:
            string += "\t\t\t\t{\n"
            string += "\t\t\t\t\t" + q("subjectName") + " : " + q(subjectRecord[1]) + ",\n"
            string += "\t\t\t\t\t" + q("subjectCode") + " : " + q(subjectRecord[0]) + ",\n"
            #string += "\t\t\t\t\t" + q("subjectUrl") + " : " + q("http://192.168.1.6:8080/s/" + subjectRecord[0]) + ",\n"
            string += "\t\t\t\t\t" + q("subjectContent") + " : [\n"

            cnt = conn.execute('select count(*) from course where abbre like ?', (subjectRecord[0] + "%",)).fetchone()[0]
            sections = conn.execute('select * from course where abbre like ?', (subjectRecord[0] + "%",))
            if (cnt == 0) : # Prevent there is no course of the subject
                    string += "\t\t\t\t\t]\n"
            else:
                for section in sections:

                    #string += "\t\t\t\t\t{\n"
                    string += "\t\t\t\t\t{"
                    staticRecord = conn.execute('select * from static where abbre like ? limit 1', (section[2],)).fetchone()
                    string += "\t\t" + q("name") + " : " + q(section[3]) + ",\n"
                    string += "\t\t\t\t\t\t\t" + q("code") + " : " + q(section[2]) + ",\n"
                    #string += "\t\t\t\t\t\t\t" + q("page") + " : " + q("http://192.168.1.6:8080/c/" + section[2]) + ",\n"
                    string += "\t\t\t\t\t\t\t" + q("status") + ":" + q(section[4]) + ",\n"
                    string += "\t\t\t\t\t\t\t" + q("instructor") + ":" + getProfessor(conn, section[0]) + ",\n"
                    if (staticRecord is None) :
                        print ("for course code = " + courseRecord[2], "static record is none")
                        string += "\t\t\t\t\t\t\t" + q("meetDays") + ":" + q("None") + ",\n"
                        string += "\t\t\t\t\t\t\t" + q("meetTime") + ":" + q("None") + ",\n"
                        string += "\t\t\t\t\t\t\t" + q("location") + ":" + q("None") + "\n"
                    else:
                        string += "\t\t\t\t\t\t\t" + q("meetDays") + ":" + q(staticRecord[2]) + ",\n"
                        string += "\t\t\t\t\t\t\t" + q("meetTime") + ":" + q(staticRecord[5]) + ",\n"
                        string += "\t\t\t\t\t\t\t" + q("location") + ":" + q(staticRecord[8]) + ""
                    string += "\t\t},\n"

                string = string[0:-2] + "\n"
                string += "\t\t\t\t\t]\n" # subjectContent
            string += "\t\t\t\t},\n" #subjectRecord

        string = string[0:-2] + "\n"
        string += "\t\t\t]\n"
        string += "\t\t},\n"

    string = string[0:-2] + "\n"
    string += "\t]\n"
    string += "}\n"



    f.write(string)
    f.close()

def chartData(courseName, conn):
        courseRecord = conn.execute('select * from course where abbre = ?', (courseName,)).fetchone()
        jsonFile(conn.cursor(), courseRecord[0])

def jsonFile(c, courseID):
    parent_dir = os.pardir
    c.execute('SELECT distinct year FROM status WHERE courseID = ?', (courseID,))
    for each in c.fetchall():
        courseNum = c.execute('select abbre from course where id = ? limit 1', (courseID,)).fetchone()
        chartdata_dir =os.pardir + "\\webroot\\c\\2018F\\" + courseNum[0] +".json"
        f = open(chartdata_dir , "w")
        string = "{" + yearToJson(c, courseID, each[0]) + "}"
        f.write(string)
        f.close()

def yearToJson(c, courseID, year):
    c.execute('SELECT distinct month FROM status WHERE courseID = ? AND year = ?', (courseID, year))
    string = q("year") + ":" + q(year) + "," + q("children") + ":[{"
    for each in c.fetchall():
        string += monthToJson(c, courseID, year,each[0]) + "},{"
    string = string[0:-2] + "]"
    return string

def monthToJson(c, courseID, year, month):
    sql = "SELECT distinct weekOftheMonth FROM status WHERE courseID = " + str(courseID) + " AND year = " + year + " AND month = " + q(month)
    #print(sql)
    c.execute(sql)
    string = q("month") + ":" + q(month) + "," + q("children") + ":[{"
    for each in c.fetchall():
        string += weekToJson(c, courseID, year,month,each[0]) + "},{"
    string = string[0:-2] + "]"
    return string

def weekToJson(c, courseID, year, month, week):
    sql = "SELECT distinct dayOftheWeek FROM status WHERE courseID = " + str(courseID) + " AND year = " + year + " AND month = " + q(month) + " AND weekOftheMonth = " + week
    c.execute(sql)
    string = q("weekOftheMonth") + ":" + q(week) + "," + q("children") + ":[{"
    for each in c.fetchall():
        string += dayToJson(c, courseID, year,month,week,each[0]) + "},{"
    string = string[0:-2] + "]"
    return string

def dayToJson(c, courseID, year, month, week, day):
    sql = "SELECT tLast, status FROM status WHERE courseID = " + str(courseID) + " AND year = " + year + " AND month = " + q(month) + " AND weekOftheMonth = " + week + " AND dayOftheWeek = " + day
    #print(sql)
    c.execute(sql)
    string = q("dayOftheWeek") + ":" + q(day) + "," + q("children") + ":[{"
    for each in c.fetchall():
        string += q("status") + ":" + q(each[1]) + "," + q("value") + ":" + str(each[0]) + "},{"
    string = string[0:-2] + "]"
    return string

def getCoursePageAndChart(conn):
    for sectionAbbre in conn.execute("select abbre from course"):
        chartData(sectionAbbre[0], conn)
        #getCoursePage(sectionAbbre[0])

def getAllJsonsAndPages(conn):
    '''

    subjectDir = os.pardir + "\\webroot\\s"
    if not os.path.exists(subjectDir):
        os.makedirs(subjectDir)


    courseDir = os.pardir + "\\webroot\\c\\2018F"
    if not os.path.exists(courseDir):
        os.makedirs(courseDir)


    getIndexJson(conn)
    getIndexPage()
    getSearchJson(conn)
    getSearchPage()
    getMisc()

    for subject in conn.execute('select abbre from subject'):
        getSubjectPage(subject[0])
        getSubjectJson(subject[0], conn)

    '''
    getCoursePageAndChart(conn)

if __name__ == '__main__':
    print("ops2.py is running")
    conn = sqlite3.connect(dbName)
    x = input("Make sure you copy and back up all files")
    getAllJsonsAndPages(conn)


    print("ops2.py task complete")
