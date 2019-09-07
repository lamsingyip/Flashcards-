//npx babel lango.jsx --presets react-app/prod > lango.js
//scp ylt@server162.site:/home/ylt/flashcard/public/lango.js C:\Users\Lei\Documents\langoo
//scp ylt@server162.site:/home/ylt/flashcard/public/lango.jsx \Users\Lei\Documents\GitHub\ECS162_hw6\flashcard\public
//scp ylt@server162.site:/home/ylt/flashcard/public/lango.js \Users\Lei\Documents\GitHub\ECS162_hw6\flashcard\public
//scp -r \Users\Lei\Documents\GitHub\ECS162_hw6\flashcard\public ylt@server162.site:/home/ylt/flashcard
'use strict'


//main page
function Lango(props){
  return <div className="header">
    <div id="logo">Lango!</div>
    <div id="review">
      {props.children}
    </div>
  </div>
}

function Card(){
  return <div className="card"></div>;
}

function FirstInputCard(props) {
    return <div className="textCard">
         {props.children}
  </div>;
  }

function FirstCard(props) {
   if (props.phrase == undefined) {
      return <p id="translation">Text missing</p>;
      }
   else return <p id="translation">{props.phrase}</p>;
   }
   
function Save(props){
  return <div className="save">
    {props.children}
  </div>
}

function Footer(props){
  if (props.phrase == undefined) {
    return <footer id="userName">UserName</footer>
  }
  else {
    return <footer id="userName">{props.phrase}</footer>;
  }
}

function ReviewTop(props) {
    return <div className="reviewBox">
         {props.children}
  </div>;
  }
function ReviewBot(props) {
    return <div className="answerBox">
         {props.children}
  </div>;
  }


// React component for the front side of the card
function CardFront(props) {
    return <div className='card-side side-front'>
         <div className='card-side-container'>
              <img className="refresh" src="refresh.jpg"/>
              <h2 id='trans'>{props.text}</h2>
        </div>
      </div>;
    
  }

// React component for the back side of the card
function CardBack_Correct(props) {
    return <div className='card-side side-back'>
         <div className='card-side-container'>
              <img className="refresh" src="refresh.jpg"/>
              <h2 id='congrats'>{props.text}</h2>
        </div>
      </div>;

  }

// React component for the back side of the card
function CardBack_Solution(props) {
    return <div className='card-side side-back'>
         <div className='card-side-container'>
              <img className="refresh" src="refresh.jpg"/>
              <h2 id='trans'>{props.text}</h2>
        </div>
      </div>;

  }




class CreateCardMain extends React.Component {

  constructor(props) {
      super(props);
      this.state = { opinion: "Translation", view: "createCard", username: "UserName", 
        class: false, curReviewCard: "", curReviewCard_solution: "", 
        is_user_answer_correct: false};

      this.checkReturn = this.checkReturn.bind(this);
      this.newSave = this.newSave.bind(this);
      this.newNext = this.newNext.bind(this);
      this.startReview = this.startReview.bind(this);
      this.add = this.add.bind(this);
      this.checkAnswerByClick= this.checkAnswerByClick.bind(this);
      this.checkAnswerByReturn = this.checkAnswerByReturn.bind(this);
      this.getNextCard = this.getNextCard.bind(this);
      this.checkCurCard = this.checkCurCard.bind(this);
  }

  componentDidMount(){
    let url = "check?key=someprivatekey";  
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);  
    if (!xhr) {
      alert('Commuincating with server is not supported!');
      return;
    }
      
    xhr.onload = () => {
      let responseStr = xhr.responseText;  // get the JSON string 
      let object = JSON.parse(responseStr);  // turn into an object      
      console.log(JSON.stringify(object, undefined, 2));  
      this.setState({view: object.view, username: object.username, curReviewCard: object.chinese} );
    };

    xhr.onerror = () => {
      alert('Woops, there was an error making the request.');
    };

    xhr.send();
  }

  render() {
    const whichView = this.state.view;
    //const whichClass = this.state.class;

    let is_correct = this.state.is_user_answer_correct;
    let CardBack_content = "";
    if (is_correct) {
      CardBack_content = "Correct!";
    }
    else{
      CardBack_content = this.state.curReviewCard_solution;
    }



    let purpleButton;
    if (whichView == "createCard") {
      purpleButton = <button id="reviewButton" onClick={this.startReview} >Start Review</button>;
    } else {
      purpleButton = <button id="reviewButton" onClick={this.add} >Add</button>;
    }

    let greenButton;
    if (whichView == "createCard") {
      greenButton = <button id="saveButton" onClick={this.newSave} >Save</button>
    } else {
      greenButton = <button id="saveButton" onClick={this.newNext} >Next</button>;
    }

    let twoBox;
    if (whichView == "createCard") {
      twoBox = 
      <div className="card">
      <FirstInputCard>
          <textarea id="inputEng" onKeyPress={this.checkReturn} />
      </FirstInputCard>
      <FirstInputCard>
          <FirstCard phrase={this.state.opinion} /> 
      </FirstInputCard>
      </div>
    } 
    else {
      if (is_correct) {
        twoBox =
        <div className="review_card">
        <ReviewTop>
          <div className={`card-container ${this.state.class ? 'card-Container':null}`} onClick={this.checkAnswerByClick}>
            <input type="checkbox"  />
            <div className='card-body'>
              <CardBack_Correct text= {CardBack_content} ></CardBack_Correct>

              <CardFront text={this.state.curReviewCard} ></CardFront>
            </div>
          </div>
        </ReviewTop>
        <ReviewBot>
          <textarea id="inputEng" onKeyPress={this.checkAnswerByReturn} />          
        </ReviewBot>
        </div>
      }
      else{
        twoBox =
        <div className="review_card">
        <ReviewTop>
          <div className={`card-container ${this.state.class ? 'card-Container':null}`} onClick={this.checkAnswerByClick}>
            <input type="checkbox"  />
            <div className='card-body'>
              <CardBack_Solution text= {CardBack_content} ></CardBack_Solution>

              <CardFront text={this.state.curReviewCard} ></CardFront>
            </div>
          </div>
        </ReviewTop>
        <ReviewBot>
          <textarea id="inputEng" onKeyPress={this.checkAnswerByReturn} />          
        </ReviewBot>
        </div>
      }
    }

    return (
      //main page
      <div className="bodyContainer">
      <main>
      <Lango>
        {purpleButton}
      </Lango>
      <React.Fragment>
        {twoBox}
      </React.Fragment>
      <Save>
        {greenButton}
      </Save>
      </main>
      <Footer phrase={this.state.username} /> 
      </div> 
      );
    } // end of render function 


  // check by click card
  checkAnswerByClick(){
    //const currentState = this.state.class;
    //this.setState({ class: !currentState });
    this.checkCurCard();
  }

  // check by hit return
  checkAnswerByReturn(event){
    if (event.charCode == 13) {
      this.checkCurCard();
      //const currentState = this.state.class;
      //this.setState({ class: !currentState });
    }
  }

  // For each time check current card answer and render cardBack
  checkCurCard() {
    let english_input = document.getElementById("inputEng").value;
    let chinese_problem = this.state.curReviewCard;

    let url = "checkcard?english=" + english_input + "&chinese=" + chinese_problem;

      let xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);

      if (!xhr) {
        alert('Commuincating with server is not supported!');
        return;
      }

      xhr.onload = () => {
        let responseStr = xhr.responseText;  // get the JSON string 
        let object = JSON.parse(responseStr);  // turn into an object      
        console.log(JSON.stringify(object, undefined, 2));  
        //return object.chinese;

        if (object.is_correct) { // user answer correctly
          const currentState = this.state.class;
          this.setState({curReviewCard_solution: object.english, class: !currentState, is_user_answer_correct: true});
        }
        else { // user answer wrong
          const currentState = this.state.class;
          this.setState({curReviewCard_solution: object.english, class: !currentState, is_user_answer_correct: false});
        } 
      };

      xhr.onerror = () => {
        alert('Woops, there was an error making the request.');
      };

    xhr.send();
  }



  // onKeyPress function for the textarea element
  // When the charCode is 13, the user has hit the return key
  // * Submit and Make the actual translation request
  checkReturn(event) {
    if (event.charCode == 13) {
      let input_word = document.getElementById("inputEng").value;
      let url = "translate?english=" + input_word;

      // Create the XHR object.
      let xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);  // call its open method

      // checking if commuincating with your own server
      if (!xhr) {
        alert('Commuincating with own server is not supported!');
        return;
      }

      // Load some functions into response handlers.
      // *** Note: it is called by the Browser when the data 
      // comes back, not as a method of the object it belongs to.
      // One solution is make it a named method, and put 
      // a similar bind(this) statement in the constructor. 
      // Another is to assign it as an arrow function 
      // rather than a function expression
      xhr.onload = () => {
        let responseStr = xhr.responseText;  // get the JSON string 
        let object = JSON.parse(responseStr);  // turn it into an object      
        console.log(JSON.stringify(object, undefined, 2));  
        this.setState({opinion: object.Chinese} );
      };

      xhr.onerror = () => {
        alert('Woops, there was an error making the request.');
      };

      // Actually send request to server
      xhr.send();
    }
  }

  // Browser send store request when the user hits "Save" button.
  // You should now be able to make and save cards.
  // *** NOTE: Only send store request when 
  // both english chinese are not empty.
  newSave(event) {
    let english_word = document.getElementById("inputEng").value;
    let chinese_word = this.state.opinion;

    if (english_word == "" || chinese_word == "") {
      alert('Please press return key to translate before saving flashcard!');
    }
    else {
      let url = "store?english=" + english_word + "&chinese=" + chinese_word;

      // Create the XHR object.
      let xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);  // call its open method

      // checking if commuincating with your own server
      if (!xhr) {
        alert('Commuincating with server is not supported!');
        return;
      }

      // Load some functions into response handlers.
      xhr.onload = () => {
        let responseStr = xhr.responseText;  // get the JSON string 
        let object = JSON.parse(responseStr);  // turn it into an object      
        console.log(JSON.stringify(object, undefined, 2));
        alert(object.Message);  
        //var output_word = document.getElementById("saveMessage");
        //output_word.textContent = object.Message;
      };

      xhr.onerror = () => {
        alert('Woops, there was an error making the save request.');
      };

      // Actually send request to server
      xhr.send();
    }
  }

  // Get next review card
  // if this.state.class is false (front), don't flip card
  // if this.state.class is true (back), flip card
  newNext(event) {
    let is_already_review_view = true;
    let is_cardback = this.state.class;

    this.getNextCard(is_already_review_view, is_cardback);    
  }


  // For button "next" and each time render reviewCard view 
  getNextCard(is_already_review_view, is_cardback) {
    let url = "getcard?key=someprivatekey";
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);  

    if (!xhr) {
      alert('Commuincating with server is not supported!');
      return;
    }

    xhr.onload = () => {
      let responseStr = xhr.responseText;  // get the JSON string 
      let object = JSON.parse(responseStr);  // turn into an object      
      console.log(JSON.stringify(object, undefined, 2));  
      //return object.chinese;

      if (is_already_review_view) { // don't need to set view state
        if (is_cardback) { // need to flip card to show the problem
          const currentState = this.state.class;
          this.setState({curReviewCard: object.chinese, class: !currentState});
        }
        else { // don't need to flip card to show the problem
          this.setState({curReviewCard: object.chinese});
        }

        if (object.have_cards == false) {
          alert('Woops, you have not saved any cards. Please click "Add" to go back to card creation view and save some cards before starting review.');
        }

      }

      else { // need to set view state to review card
        if (is_cardback) { // need to flip card to show the problem
          const currentState = this.state.class;
          this.setState({view: "reviewCard", curReviewCard: object.chinese, class: !currentState});
        }
        else { // don't need to flip card to show the problem
          this.setState({view: "reviewCard", curReviewCard: object.chinese});
        }

        if (object.have_cards == false) {
          alert('Woops, you have not saved any cards. Please click "Add" to go back to card creation view and save some cards before starting review.');
        }

      }
      
    };

    xhr.onerror = () => {
      alert('Woops, there was an error making the request.');
    };

    xhr.send();
  }




  // conditonal rendering: jump to review page and get a new card
  startReview(event) {
    let is_already_review_view = false;
    let is_cardback = this.state.class;
    this.getNextCard(is_already_review_view, is_cardback);
  }

  // conditonal rendering: jump to create page
  add(event) {
    this.setState({opinion: "Translation", view: "createCard"} );
  }




} // end of class


ReactDOM.render(
    <CreateCardMain />,
    document.getElementById('root')
);


   
