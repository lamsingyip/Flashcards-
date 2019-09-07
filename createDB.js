// Globals
const sqlite3 = require("sqlite3").verbose();  // use sqlite
const fs = require("fs"); // file system

const dbFileName = "Flashcards.db";
// makes the object that represents the database in our code
const db = new sqlite3.Database(dbFileName);  // object, not database.

// Initialize table.
// If the table already exists, causes an error.
// Fix the error by removing or renaming Flashcards.db
const cmdStr = 'CREATE TABLE Flashcards (user INT, english TEXT, chinese TEXT, seen INT, correct INT )';
db.run(cmdStr,tableCreationCallback);
const userInfo = 'CREATE TABLE userInfo (first TEXT, last TEXT, googleID TEXT )';
db.run(userInfo,tableCreationCallback1);


// Always use the callback for database operations and print out any
// error messages you get.
// This database stuff is hard to debug, give yourself a fighting chance.
function tableCreationCallback(err) {
    if (err) {
	console.log("Table creation error",err);
	//dumpDB();
    } else {
	console.log("Database created");
	//dumpDB();
	//db.close();
    }
}
function tableCreationCallback1(err) {
    if (err) {
	console.log("Table creation error",err);
	dumpDB();
    } else {
	console.log("Database created");
	dumpDB();
	db.close();
    }
}

// prints out the whole database
function dumpDB() {
    db.all ( 'SELECT * FROM flashcards', dataCallback);
    db.all ( 'SELECT * FROM userInfo', dataCallback);
    function dataCallback( err, data ) {console.log(data)}
    
}


