//npx babel lango.jsx --presets react-app/prod > lango.js
//scp ylt@server162.site:/home/ylt/flashcard/public/lango.js C:\Users\Lei\Documents\langoo
//scp ylt@server162.site:/home/ylt/flashcard/public/lango.jsx \Users\Lei\Documents\GitHub\ECS162_hw6\flashcard\public
//scp ylt@server162.site:/home/ylt/flashcard/public/lango.js \Users\Lei\Documents\GitHub\ECS162_hw6\flashcard\public
//scp -r \Users\Lei\Documents\GitHub\ECS162_hw6\flashcard\public ylt@server162.site:/home/ylt/flashcard
'use strict';

//main page

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function Lango(props) {
  return React.createElement(
    "div",
    { className: "header" },
    React.createElement(
      "div",
      { id: "logo" },
      "Lango!"
    ),
    React.createElement(
      "div",
      { id: "review" },
      props.children
    )
  );
}

function Card() {
  return React.createElement("div", { className: "card" });
}

function FirstInputCard(props) {
  return React.createElement(
    "div",
    { className: "textCard" },
    props.children
  );
}

function FirstCard(props) {
  if (props.phrase == undefined) {
    return React.createElement(
      "p",
      { id: "translation" },
      "Text missing"
    );
  } else return React.createElement(
    "p",
    { id: "translation" },
    props.phrase
  );
}

function Save(props) {
  return React.createElement(
    "div",
    { className: "save" },
    props.children
  );
}

function Footer(props) {
  if (props.phrase == undefined) {
    return React.createElement(
      "footer",
      { id: "userName" },
      "UserName"
    );
  } else {
    return React.createElement(
      "footer",
      { id: "userName" },
      props.phrase
    );
  }
}

function ReviewTop(props) {
  return React.createElement(
    "div",
    { className: "reviewBox" },
    props.children
  );
}
function ReviewBot(props) {
  return React.createElement(
    "div",
    { className: "answerBox" },
    props.children
  );
}

// React component for the front side of the card
function CardFront(props) {
  return React.createElement(
    "div",
    { className: "card-side side-front" },
    React.createElement(
      "div",
      { className: "card-side-container" },
      React.createElement("img", { className: "refresh", src: "refresh.jpg" }),
      React.createElement(
        "h2",
        { id: "trans" },
        props.text
      )
    )
  );
}

// React component for the back side of the card
function CardBack_Correct(props) {
  return React.createElement(
    "div",
    { className: "card-side side-back" },
    React.createElement(
      "div",
      { className: "card-side-container" },
      React.createElement("img", { className: "refresh", src: "refresh.jpg" }),
      React.createElement(
        "h2",
        { id: "congrats" },
        props.text
      )
    )
  );
}

// React component for the back side of the card
function CardBack_Solution(props) {
  return React.createElement(
    "div",
    { className: "card-side side-back" },
    React.createElement(
      "div",
      { className: "card-side-container" },
      React.createElement("img", { className: "refresh", src: "refresh.jpg" }),
      React.createElement(
        "h2",
        { id: "trans" },
        props.text
      )
    )
  );
}

var CreateCardMain = function (_React$Component) {
  _inherits(CreateCardMain, _React$Component);

  function CreateCardMain(props) {
    _classCallCheck(this, CreateCardMain);

    var _this = _possibleConstructorReturn(this, (CreateCardMain.__proto__ || Object.getPrototypeOf(CreateCardMain)).call(this, props));

    _this.state = { opinion: "Translation", view: "createCard", username: "UserName",
      class: false, curReviewCard: "", curReviewCard_solution: "",
      is_user_answer_correct: false };

    _this.checkReturn = _this.checkReturn.bind(_this);
    _this.newSave = _this.newSave.bind(_this);
    _this.newNext = _this.newNext.bind(_this);
    _this.startReview = _this.startReview.bind(_this);
    _this.add = _this.add.bind(_this);
    _this.checkAnswerByClick = _this.checkAnswerByClick.bind(_this);
    _this.checkAnswerByReturn = _this.checkAnswerByReturn.bind(_this);
    _this.getNextCard = _this.getNextCard.bind(_this);
    _this.checkCurCard = _this.checkCurCard.bind(_this);
    return _this;
  }

  _createClass(CreateCardMain, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var _this2 = this;

      var url = "check?key=someprivatekey";
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      if (!xhr) {
        alert('Commuincating with server is not supported!');
        return;
      }

      xhr.onload = function () {
        var responseStr = xhr.responseText; // get the JSON string 
        var object = JSON.parse(responseStr); // turn into an object      
        console.log(JSON.stringify(object, undefined, 2));
        _this2.setState({ view: object.view, username: object.username, curReviewCard: object.chinese });
      };

      xhr.onerror = function () {
        alert('Woops, there was an error making the request.');
      };

      xhr.send();
    }
  }, {
    key: "render",
    value: function render() {
      var whichView = this.state.view;
      //const whichClass = this.state.class;

      var is_correct = this.state.is_user_answer_correct;
      var CardBack_content = "";
      if (is_correct) {
        CardBack_content = "Correct!";
      } else {
        CardBack_content = this.state.curReviewCard_solution;
      }

      var purpleButton = void 0;
      if (whichView == "createCard") {
        purpleButton = React.createElement(
          "button",
          { id: "reviewButton", onClick: this.startReview },
          "Start Review"
        );
      } else {
        purpleButton = React.createElement(
          "button",
          { id: "reviewButton", onClick: this.add },
          "Add"
        );
      }

      var greenButton = void 0;
      if (whichView == "createCard") {
        greenButton = React.createElement(
          "button",
          { id: "saveButton", onClick: this.newSave },
          "Save"
        );
      } else {
        greenButton = React.createElement(
          "button",
          { id: "saveButton", onClick: this.newNext },
          "Next"
        );
      }

      var twoBox = void 0;
      if (whichView == "createCard") {
        twoBox = React.createElement(
          "div",
          { className: "card" },
          React.createElement(
            FirstInputCard,
            null,
            React.createElement("textarea", { id: "inputEng", onKeyPress: this.checkReturn })
          ),
          React.createElement(
            FirstInputCard,
            null,
            React.createElement(FirstCard, { phrase: this.state.opinion })
          )
        );
      } else {
        if (is_correct) {
          twoBox = React.createElement(
            "div",
            { className: "review_card" },
            React.createElement(
              ReviewTop,
              null,
              React.createElement(
                "div",
                { className: "card-container " + (this.state.class ? 'card-Container' : null), onClick: this.checkAnswerByClick },
                React.createElement("input", { type: "checkbox" }),
                React.createElement(
                  "div",
                  { className: "card-body" },
                  React.createElement(CardBack_Correct, { text: CardBack_content }),
                  React.createElement(CardFront, { text: this.state.curReviewCard })
                )
              )
            ),
            React.createElement(
              ReviewBot,
              null,
              React.createElement("textarea", { id: "inputEng", onKeyPress: this.checkAnswerByReturn })
            )
          );
        } else {
          twoBox = React.createElement(
            "div",
            { className: "review_card" },
            React.createElement(
              ReviewTop,
              null,
              React.createElement(
                "div",
                { className: "card-container " + (this.state.class ? 'card-Container' : null), onClick: this.checkAnswerByClick },
                React.createElement("input", { type: "checkbox" }),
                React.createElement(
                  "div",
                  { className: "card-body" },
                  React.createElement(CardBack_Solution, { text: CardBack_content }),
                  React.createElement(CardFront, { text: this.state.curReviewCard })
                )
              )
            ),
            React.createElement(
              ReviewBot,
              null,
              React.createElement("textarea", { id: "inputEng", onKeyPress: this.checkAnswerByReturn })
            )
          );
        }
      }

      return (
        //main page
        React.createElement(
          "div",
          { className: "bodyContainer" },
          React.createElement(
            "main",
            null,
            React.createElement(
              Lango,
              null,
              purpleButton
            ),
            React.createElement(
              React.Fragment,
              null,
              twoBox
            ),
            React.createElement(
              Save,
              null,
              greenButton
            )
          ),
          React.createElement(Footer, { phrase: this.state.username })
        )
      );
    } // end of render function 


    // check by click card

  }, {
    key: "checkAnswerByClick",
    value: function checkAnswerByClick() {
      //const currentState = this.state.class;
      //this.setState({ class: !currentState });
      this.checkCurCard();
    }

    // check by hit return

  }, {
    key: "checkAnswerByReturn",
    value: function checkAnswerByReturn(event) {
      if (event.charCode == 13) {
        this.checkCurCard();
        //const currentState = this.state.class;
        //this.setState({ class: !currentState });
      }
    }

    // For each time check current card answer and render cardBack

  }, {
    key: "checkCurCard",
    value: function checkCurCard() {
      var _this3 = this;

      var english_input = document.getElementById("inputEng").value;
      var chinese_problem = this.state.curReviewCard;

      var url = "checkcard?english=" + english_input + "&chinese=" + chinese_problem;

      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);

      if (!xhr) {
        alert('Commuincating with server is not supported!');
        return;
      }

      xhr.onload = function () {
        var responseStr = xhr.responseText; // get the JSON string 
        var object = JSON.parse(responseStr); // turn into an object      
        console.log(JSON.stringify(object, undefined, 2));
        //return object.chinese;

        if (object.is_correct) {
          // user answer correctly
          var currentState = _this3.state.class;
          _this3.setState({ curReviewCard_solution: object.english, class: !currentState, is_user_answer_correct: true });
        } else {
          // user answer wrong
          var _currentState = _this3.state.class;
          _this3.setState({ curReviewCard_solution: object.english, class: !_currentState, is_user_answer_correct: false });
        }
      };

      xhr.onerror = function () {
        alert('Woops, there was an error making the request.');
      };

      xhr.send();
    }

    // onKeyPress function for the textarea element
    // When the charCode is 13, the user has hit the return key
    // * Submit and Make the actual translation request

  }, {
    key: "checkReturn",
    value: function checkReturn(event) {
      var _this4 = this;

      if (event.charCode == 13) {
        var input_word = document.getElementById("inputEng").value;
        var url = "translate?english=" + input_word;

        // Create the XHR object.
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true); // call its open method

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
        xhr.onload = function () {
          var responseStr = xhr.responseText; // get the JSON string 
          var object = JSON.parse(responseStr); // turn it into an object      
          console.log(JSON.stringify(object, undefined, 2));
          _this4.setState({ opinion: object.Chinese });
        };

        xhr.onerror = function () {
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

  }, {
    key: "newSave",
    value: function newSave(event) {
      var english_word = document.getElementById("inputEng").value;
      var chinese_word = this.state.opinion;

      if (english_word == "" || chinese_word == "") {
        alert('Please press return key to translate before saving flashcard!');
      } else {
        var url = "store?english=" + english_word + "&chinese=" + chinese_word;

        // Create the XHR object.
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true); // call its open method

        // checking if commuincating with your own server
        if (!xhr) {
          alert('Commuincating with server is not supported!');
          return;
        }

        // Load some functions into response handlers.
        xhr.onload = function () {
          var responseStr = xhr.responseText; // get the JSON string 
          var object = JSON.parse(responseStr); // turn it into an object      
          console.log(JSON.stringify(object, undefined, 2));
          alert(object.Message);
          //var output_word = document.getElementById("saveMessage");
          //output_word.textContent = object.Message;
        };

        xhr.onerror = function () {
          alert('Woops, there was an error making the save request.');
        };

        // Actually send request to server
        xhr.send();
      }
    }

    // Get next review card
    // if this.state.class is false (front), don't flip card
    // if this.state.class is true (back), flip card

  }, {
    key: "newNext",
    value: function newNext(event) {
      var is_already_review_view = true;
      var is_cardback = this.state.class;

      this.getNextCard(is_already_review_view, is_cardback);
    }

    // For button "next" and each time render reviewCard view 

  }, {
    key: "getNextCard",
    value: function getNextCard(is_already_review_view, is_cardback) {
      var _this5 = this;

      var url = "getcard?key=someprivatekey";
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);

      if (!xhr) {
        alert('Commuincating with server is not supported!');
        return;
      }

      xhr.onload = function () {
        var responseStr = xhr.responseText; // get the JSON string 
        var object = JSON.parse(responseStr); // turn into an object      
        console.log(JSON.stringify(object, undefined, 2));
        //return object.chinese;

        if (is_already_review_view) {
          // don't need to set view state
          if (is_cardback) {
            // need to flip card to show the problem
            var currentState = _this5.state.class;
            _this5.setState({ curReviewCard: object.chinese, class: !currentState });
          } else {
            // don't need to flip card to show the problem
            _this5.setState({ curReviewCard: object.chinese });
          }

          if (object.have_cards == false) {
            alert('Woops, you have not saved any cards. Please click "Add" to go back to card creation view and save some cards before starting review.');
          }
        } else {
          // need to set view state to review card
          if (is_cardback) {
            // need to flip card to show the problem
            var _currentState2 = _this5.state.class;
            _this5.setState({ view: "reviewCard", curReviewCard: object.chinese, class: !_currentState2 });
          } else {
            // don't need to flip card to show the problem
            _this5.setState({ view: "reviewCard", curReviewCard: object.chinese });
          }

          if (object.have_cards == false) {
            alert('Woops, you have not saved any cards. Please click "Add" to go back to card creation view and save some cards before starting review.');
          }
        }
      };

      xhr.onerror = function () {
        alert('Woops, there was an error making the request.');
      };

      xhr.send();
    }

    // conditonal rendering: jump to review page and get a new card

  }, {
    key: "startReview",
    value: function startReview(event) {
      var is_already_review_view = false;
      var is_cardback = this.state.class;
      this.getNextCard(is_already_review_view, is_cardback);
    }

    // conditonal rendering: jump to create page

  }, {
    key: "add",
    value: function add(event) {
      this.setState({ opinion: "Translation", view: "createCard" });
    }
  }]);

  return CreateCardMain;
}(React.Component); // end of class


ReactDOM.render(React.createElement(CreateCardMain, null), document.getElementById('root'));