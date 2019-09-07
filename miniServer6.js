"use strict"

// Globals
const sqlite3 = require("sqlite3").verbose();  // use sqlite
const fs = require("fs"); // file system

const dbFileName = "Flashcards.db";
// makes the object that represents the database in our code
const db = new sqlite3.Database(dbFileName);  // object, not database.

process.on('exit', function(){db.close();} ); // Close database on exiting the terminal


// prints out the whole database
function dumpDB() {
	db.all ( 'SELECT * FROM flashcards', dataCallback);
	function dataCallback( err, data ) {console.log(data)}
	db.all ( 'SELECT * FROM userInfo', dataCallback);
	function dataCallback( err, data ) {console.log(data)}
}

//http://server162.site:56899/login.html

const express = require('express');
const passport = require('passport');
const cookieSession = require('cookie-session');

const GoogleStrategy = require('passport-google-oauth20');
const sqlite = require('sqlite3');


// Google login credentials, used when the user contacts
// Google, to tell them where he is trying to login to, and show
// that this domain is registered for this service. 
// Google will respond with a key we can use to retrieve profile
// information, packed into a redirect response that redirects to
// server162.site:[port]/auth/redirect
const googleLoginData = {
	clientID: '117576245363-917akob3qsm98e5boenpo5b13quiag6t.apps.googleusercontent.com',
	clientSecret: 'TU78w0bXjk0Um5L0_oyc_ec2',
	callbackURL: '/auth/redirect'
};

// Strategy configuration. 
// Tell passport we will be using login with Google, and
// give it our data for registering us with Google.
// The gotProfile callback is for the server's HTTPS request
// to Google for the user's profile information.
// It will get used much later in the pipeline. 
passport.use( new GoogleStrategy(googleLoginData, gotProfile) );



/*********************************************************/
/*****                    API                   **********/
/*********************************************************/

const APIrequest = require('request');
const http = require('http');

const APIkey = "AIzaSyCzl-4MVeCJUCjz_bi5nGPFaVJUoV6s4VI";  // ADD API KEY HERE
const google_url = "https://translation.googleapis.com/language/translate/v2?key="+APIkey;

const port = 56899;



// An HTTP response waiting for that data to bring it back to the browser.  
// "res" is the HTTP response to the browser, 
// and "APIresponse" is the response that already came back from the API.

// Need to use a closure to get "res" into the API callback function 
// that has the APIresponse.
function transmit_res_to_APIcallback(res, word){
	let requestObject = 
	{
		"source": "en",
		"target": "zh-CN",
		"q": [
		"example word"
		]
	};

	requestObject.q[0] = word;
	console.log("English phrase: ", requestObject.q[0]);

  // The call that makes a request to the API
  // Uses the Node request module, which packs up and sends off
  // an HTTP message containing the request to the API server
  APIrequest(
  { // HTTP header stuff
  	url: google_url,
  	method: "POST",
  	headers: {"content-type": "application/json"},
    // will turn the given object into JSON
    json: requestObject },
    // callback function for API request
    APIcallback
    );
  
  
  // callback function, called when data is received from API
  function APIcallback(err, APIresHead, APIresBody) {
    // gets three objects as input
    if ((err) || (APIresHead.statusCode != 200)) {
      // API is not working
      console.log("Got API error");
      console.log(APIresBody);
    } else {
    	if (APIresHead.error) {
        // API worked but is not giving you data
        console.log(APIresHead.error);
      } else {
      	console.log("In Chinese: ", 
      		APIresBody.data.translations[0].translatedText);
      	console.log("\n\n API Returned JSON was:");
      	console.log(JSON.stringify(APIresBody, undefined, 2));
        // print it out as a string, nicely formatted
        
        // *** Return Http response using data from API response 
        res.json( { "English": requestObject.q[0], "Chinese": APIresBody.data.translations[0].translatedText } );
      }
    }
  } // end callback function    
}

// http://server162.site:port/store?english=cat&chinese=猫
function translateHandler(req, res, next) {
	let url = req.url;
	let qObj = req.query;
	console.log("Received from browser: ", qObj);

	if (qObj.english != undefined) {        
		transmit_res_to_APIcallback(res, qObj.english);    
	}
	else {
		next();
	}
}

// Respond to AJAX queries of the form 
// by storing a flash card into the database. 
// Return a HTTP response with an empty body, 
// to let the browswer know everything went well.
function store_flashcard(req, res, english_word, chinese_word) {

	const cmdStr = 'INSERT into Flashcards (user, english, chinese, seen, correct) VALUES (@0, @1, @2, 0, 0)';
	db.run(cmdStr, req.user.userID, english_word, chinese_word, insertCallback);

  // insert callback fxn
  function insertCallback(err) {
  	if (err) { 
  		console.log(err); 
  	}
  	else {
      // In this case, callback should also return response to 
      // browser to indicate flashcard has been stored.
      // Instead of making it empty, put some kind of message 
      // in the JSON of the body.  Might be easier to debug.
      console.log("Insert Succeed! Current Database is: ");
      dumpDB();
      
      res.json( {"Message": "Flashcard saved!", "English": english_word, "Chinese": chinese_word} );
      
      //res.send('Flashcard saved! English: ' + english_word + ';  Chinese: ' + chinese_word + '. ');
    }
  } // end callback
}


function storeHandler(req, res, next) {
	let url = req.url;
	let qObj = req.query;
	console.log("Received from browser: ", qObj);
	console.log("Received from passport: ", req.user);

	if (qObj.english != undefined && qObj.chinese != undefined) {
		store_flashcard(req, res, qObj.english, qObj.chinese);    
	}
	else {
		next();
	}
}

// Respond to AJAX queries of the form
// http://server162.site:56899/user/check?key=someprivatekey
// Return 2 things: should go to which view and username
// ## If reviewCard view, also return a new card
// * Note: let qObj = req.query = { key: 'someprivatekey' }
// * qObj is useless here. Just to keep the query structure.
function checkHandler(req, res, next) {
	let url = req.url;
	let qObj = req.query;
	let qUser = req.user;

	console.log("Received from browser: ", qObj);
	console.log("Received from passport: ", qUser);

	if (qUser.name == undefined) {    
		qUser.name = "UserName";
	}

	if (qObj.key != undefined) {    
		if (qUser.none_saved_card == true) { 
			res.json( { "view": "createCard", "username": qUser.name});
		}
		else {

        let sql = `SELECT * FROM Flashcards WHERE user  = ?`;

        //find all flashcards of user
        db.all(sql, [qUser.userID], (err, rows) => {

          if (err) {
            return console.error(err.message);
          }

          if (rows) { // user has cards

            console.log(rows.length); 
            //let rowNumber = (Math.random()*101|0)%rows.length;
            //console.log(rowNumber);
            
            let i = 0;
            for(i; i < rows.length; i++){

              let score = ( Math.max(1,5-rows[i].correct) + Math.max(1,5-rows[i].seen) + 5*( (rows[i].seen-rows[i].correct)/ (rows[i].seen + 0.001)  ) );
              console.log("score is: ", score);
              let min=0; 
              let max=15;
              let random =Math.floor(Math.random() * (+max - +min)) + +min; 
              console.log("random is: ", random);
              if(random <= score){

                console.log("in if statement............ ");
                res.json( { "view": "reviewCard", "username": qUser.name, "chinese": rows[i].chinese, "english": rows[i].english, "id": qUser.userID, "have_cards": true});
                let updateFlashcard = `UPDATE Flashcards SET seen = seen+1 WHERE english = "${rows[i].english}" `
                db.run(updateFlashcard, updateSeenCallback);

                // insert callback fxn
                function updateSeenCallback(err) {
                  if (err) { 
                    console.log(err); 
                  }
                  else {
                    console.log("Update Seen Succeed! Current Database is: ");
                    dumpDB();

                  }
                } // end callback*/
              break;   //break from for loop
              } //end if random

              
            }


          } //end if
          else { //user does not have any cards
            //return empty json
            res.json( { "view": "reviewCard", "username": qUser.name, "chinese": "", "english": "", "id": qUser.userID, "have_cards": false});
          }

        }); //end db.all



			//res.json( { "view": "reviewCard", "username": qUser.name});
		}
	}
	else {
		next();
	}
}

// Respond to AJAX queries of the form
// http://server162.site:56899/user/getcard?key=someprivatekey
// Return 4 things: chinese, english, userid, does_have_card
function getcardHandler(req, res, next) {
	let url = req.url;
	let qObj = req.query;
	let qUser = req.user;

	console.log("Received from browser: ", qObj);
	console.log("Received from passport: ", qUser);

	if (qObj.key != undefined) {
		if (qUser.none_saved_card == true) { 
			res.json( { "chinese": "", "english": "", "id": qUser.userID, "have_cards": false});
			return;
		}



				let sql = `SELECT * FROM Flashcards WHERE user  = ?`;

			  //find all flashcards of user
			  db.all(sql, [qUser.userID], (err, rows) => {

			  	if (err) {
			  		return console.error(err.message);
			  	}

			    if (rows) { // user has cards

			    	console.log(rows.length);	
			    	//let rowNumber = (Math.random()*101|0)%rows.length;
			    	//console.log(rowNumber);
			    	
			    	let i = 0;
			    	for(i; i < rows.length; i++){

			    		let score = ( Math.max(1,5-rows[i].correct) + Math.max(1,5-rows[i].seen) + 5*( (rows[i].seen-rows[i].correct)/(rows[i].seen + 0.001) ) );
			    		console.log("score is: ", score);
			    		let min=0; 
    					let max=15;
    					let random =Math.floor(Math.random() * (+max - +min)) + +min; 
    					console.log("random is: ", random);
    					if(random <= score){

    						console.log("@@@@@@in if statement............ ");
	    					res.json( { "chinese": rows[i].chinese, "english": rows[i].english, "id": qUser.userID, "have_cards": true});
	    					let updateFlashcard = `UPDATE Flashcards SET seen = seen+1 WHERE english = "${rows[i].english}" `
				    		db.run(updateFlashcard, updateSeenCallback);

					      // insert callback fxn
					      function updateSeenCallback(err) {
					      	if (err) { 
					      		console.log(err); 
					      	}
					      	else {
					      		console.log("Update Seen Succeed! Current Database is: ");
					      		dumpDB();

					      	}
								} // end callback*/
							break;   //break from for loop
    					} //end if random

    					
			    	}


					} //end if
					else { //user does not have any cards
		    		//return empty json
		    		res.json( { "chinese": "", "english": "", "id": qUser.userID, "have_cards": false});
		    	}

				}); //end db.all

	}  //end if
	else {
		next();
	}
}

// Respond to AJAX queries of the form
// http://server162.site:56899/user/checkcard?english=answer&chinese=problem
// Return 3 things: english_answer, chinese_Problem, is_correct  
function checkcardHandler(req, res, next) {
	let url = req.url;
	let qObj = req.query;
	let qUser = req.user;

	console.log("Received from browser: ", qObj);
	console.log("Received from passport: ", qUser);

	if (qObj.english != undefined) {

	if (qUser.none_saved_card == true) { 
			res.json( { "english": "", "chinese": "", "is_correct": false});
			return;
	}


    if (qUser.none_saved_card == false) { // user has card

      // check if answer correct
      let sql = `SELECT * FROM Flashcards WHERE chinese  = ?`;
 			db.get(sql, [qObj.chinese], (err, row) => {

		  	if (err) {
		  		return console.error(err.message);
		  	}

		    if (row) { // card with chinese problem exists

		    	//english answer matches with database
		    	if(qObj.english == row.english){
		    		let updateFlashcard = `UPDATE Flashcards SET correct = correct+1 WHERE english = "${row.english}" `
		    		db.run(updateFlashcard, updateCorrectCallback);

			      // insert callback fxn
			      function updateCorrectCallback(err) {
			      	if (err) { 
			      		console.log(err); 
			      	}
			      	else {
			      		console.log("Update Correct Succeed! Current Database is: ");
			      		dumpDB();

			      	}
						} // end callback*/
		    		res.json( {"english": row.english,"chinese": row.chinese,"is_correct": true});
		    	
		    	}
		    	else{
		    		res.json( { "english": row.english,"chinese": row.chinese,"is_correct": false});
		    	}
		    }
	  	});   //end db.get

    }   
  }
  else {
  	next();
  }
}


// ***************************************
// *** Let's build a server pipeline! ***
// ***************************************

// put together the server pipeline
const app = express()


// pipeline stage that just echos url, for debugging
app.use('/', printURL);

// Check validity of cookies at the beginning of pipeline
// Will get cookies out of request, decrypt and check if 
// session is still going on. 
app.use(cookieSession({
  maxAge: 6 * 60 * 60 * 1000, // Six hours in milliseconds
  // meaningless random string used by encryption
  keys: ['hanger waldo mercy dance']  
}));

// Initializes request object for further handling by passport
app.use(passport.initialize()); 

// If there is a valid cookie, will call deserializeUser()
app.use(passport.session()); 
app.use(express.static('public'));  // can I find a static file? 


// next, handler for url that starts login with Google.
// The app (in public/login.html) redirects to here (not an AJAX request!)
// Kicks off login process by telling Browser to redirect to
// Google. The object { scope: ['profile'] } says to ask Google
// for their user profile information.
app.get('/auth/google',
	passport.authenticate('google',{ scope: ['profile'] }) );
// passport.authenticate sends off the 302 response
// with fancy redirect URL containing request for profile, and
// client ID string to identify this app. 

// Google redirects here after user successfully logs in
// This route has three handler functions, one run after the other. 
app.get('/auth/redirect',
        // for educational purposes
        function (req, res, next) {
        	console.log("at auth/redirect");
        	next();
        },
        // This will issue Server's own HTTPS request to Google
        // to access the user's profile information with the 
        // temporary key we got in the request. 
        passport.authenticate('google'),
        // then it will run the "gotProfile" callback function,
        // set up the cookie, call serialize, whose "done" 
        // will come back here to send back the response
        // ...with a cookie in it for the Browser! 
        function (req, res) {
        	console.log('Logged in and using cookies!')
        	res.redirect('/user/lango.html');
        });

// static files in /user are only available after login
app.get('/user/*',
        isAuthenticated, // only pass on to following function if
        // user is logged in 
        // serving files that start with /user from here gets them from ./
        express.static('.') 
        ); 


// next, all queries (like translate or store or get...
app.get('/user/check', checkHandler );   // is it a first time check and username query?
app.get('/user/translate', translateHandler );   // if not, is it a valid translate query?
app.get('/user/store', storeHandler );   // if not, is it a valid store query?
app.get('/user/getcard', getcardHandler );   // if not, is it a valid new card query?
app.get('/user/checkcard', checkcardHandler );   // if not, is it a valid check card answer query?
app.use( fileNotFound );            // otherwise not found

app.listen(port, function (){console.log('Listening...');} )


// middleware functions

// print the url of incoming HTTP request
function printURL (req, res, next) {
	console.log(req.url);
	next();
}

// function to check whether user is logged when trying to access
// personal data
function isAuthenticated(req, res, next) {
	if (req.user) {
		console.log("Req.session:",req.session);
		console.log("Req.user:",req.user);
		next();
	} else {
    res.redirect('/login.html');  // send response telling
    // Browser to go to login page
  }
}


// function for end of server pipeline
function fileNotFound(req, res) {
	let url = req.url;
	res.type('text/plain');
	res.status(404);
	res.send('Cannot find '+url);
}

// Some functions Passport calls, that we can use to specialize.
// This is where we get to write our own code, not just boilerplate. 
// The callback "done" at the end of each one resumes Passport's
// internal process. 

// function called during login, the second time passport.authenticate
// is called (in /auth/redirect/),
// once we actually have the profile data from Google. 
function gotProfile(accessToken, refreshToken, profile, done) {
	console.log("Google profile",profile);
  // here is a good place to check if user is in DB,
  // and to store him in DB if not already there. 
  // Second arg to "done" will be passed into serializeUser,
  // should be key to get user out of database.
  
  let sql = `SELECT googleID FROM userInfo WHERE googleID  = ?`;
  db.get(sql, [profile.id], (err, row) => {

  	if (err) {
  		return console.error(err.message);
  	}

    if (row) { // your user exists
    	let dbRowID = profile.id;
    	dumpDB();
    	done(null, dbRowID);
    }
    else{ // insert the user since you can't find it in the db
    	console.log('data is null');
    	console.log('profile id isss: ',profile.id);
    	let userInfo = `INSERT into userInfo VALUES ("${profile.name.givenName}","${profile.name.familyName}","${profile.id}")`;
    	db.run(userInfo, insertCallback);


      // insert callback fxn
      function insertCallback(err) {
      	if (err) { 
      		console.log(err); 
      	}
      	else {
      		console.log("Insert User Succeed! Current Database is: ");
      		dumpDB();
          let dbRowID = profile.id;  // temporary! Should be the real unique key for db Row for this user in DB table.          
          done(null, dbRowID); 
        }  //end else
      } // end insertcallback
    } //end else
  });   //end db.get
}

// Part of Server's sesssion set-up.  
// The second operand of "done" becomes the input to deserializeUser
// on every subsequent HTTP request with this session's cookie. 
passport.serializeUser((dbRowID, done) => {
	console.log("SerializeUser. Input is",dbRowID);
	done(null, dbRowID);
});




// Called by passport.session pipeline stage on every HTTP request with
// a current session cookie. 
// Where we should lookup user database info. 
// Whatever we pass in the "done" callback becomes req.user
// and can be used by subsequent middleware.
passport.deserializeUser((dbRowID, done) => {
	console.log("deserializeUser. Input is:", dbRowID);
  // here is a good place to look up user data in database using
  // dbRowID. Put whatever you want into an object. It ends up
  // as the property "user" of the "req" object. 
  let sql2 = `SELECT first FROM userInfo WHERE googleID =?`;
  let sql = `SELECT user FROM Flashcards WHERE user =?`;
  let firstname;

  // start serach userInfo to get username
  db.get(sql2, [dbRowID],(err, row) => { 
  // *** sql2 callback begin
  let userData;
  if (err) {
  	return console.error(err.message);
  }

  console.log("row isssssssssss: ",row);
  firstname = row.first;

    // start serach Flashcards to get none_saved_card
    db.get(sql, [dbRowID],(err, row) => {
      // *** sql callback begin 
      if (err) {
      	return console.error(err.message);
      }

      if (row) { // the user has saved some flashcard in db
      	userData = {userID: dbRowID, none_saved_card: false, name: firstname}; 
      	done(null, userData);
      }   
      else { // the user has NOT saved any flashcard
      	userData = {userID: dbRowID, none_saved_card: true, name: firstname}; 
      	done(null, userData);
      }
    });// *** sql callback end

  });// *** sql2 callback end

});


