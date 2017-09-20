
$(document).ready(function() {
  $("*").dblclick(function(e) {
    e.preventDefault();
  });
  //var $debug = $("#debug");
  var $twoPlayer = $("#twoPlayer");
  var CPUstart = false;
  var circled = [];
  var crossed = [];
  var circle = false;
  var playable = true;
  var collection = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  var priority = [1, 3, 5, 7, 9];
  var safeguard = [2, 4, 6, 8];
  var $box = $(".box");
  var $score = $("#score");
  var $board = $("#board");
  var $menu = $("#menu");
  var $chooseTurn = $("#chooseTurn");
  var $message = $("#message");
  var boxes = [
    null,
    $("#top-left"),
    $("#top-middle"),
    $("#top-right"),
    $("#middle-left"),
    $("#middle-middle"),
    $("#middle-right"),
    $("#bottom-left"),
    $("#bottom-middle"),
    $("#bottom-right")
  ];
  var score = {
    circleScore: 0,
    crossScore: 0,
    draw: 0,
    addCross: function() {
      this.crossScore += 1;
    },
    addCircle: function() {
      this.circleScore += 1;
    },
    addDraw: function() {
      this.draw += 1;
    }
  };

  $board.css({
    display: "none"
  });
  $score.css({
    display: "none"
  });
  $chooseTurn.css({
    display: "none"
  });

  //////////////////////PLAYER CLASSES //////////////////////

  var humanity = {
    name: "You",
    score: 0,
    addScore: function() {
      this.score++;
    },
    symbol: "<div class=x></div>",
    setSymbol: function(symbol) {
      this.symbol = symbol;
    },
    chosen: [],
    clearChosen: function() {
      this.chosen = [];
    }
  };

  var P3P0 = {
    winMessage: "Oh dear... It seems I've won.",
    loseMessage: "Wait a minute... You lied, sir! This isn't pazaak!",
    drawMessage: "Shall we just call it a tie, then?",

    name: "P3P0",
    move: function() {
      var willClick = collection[Math.floor(Math.random() * collection.length)];
      collection.splice(collection.indexOf(willClick), 1);
      this.chosen.push(willClick);
      boxes[willClick].off();
      return boxes[willClick];
    },
    score: 0,
    addScore: function() {
      this.score++;
    },

    symbol: "<div class=circle></div>",
    setSymbol: function(symbol) {
      this.symbol = symbol;
    },

    chosen: [],
    clearChosen: function() {
      this.chosen = [];
    }
  };

  var Fender = {
    winMessage: "Game’s over, losers!",
    loseMessage: "Bite my shiny metal <code>[Javascript Class]</code>!",
    drawMessage: "I didn't win?! No fair!",
    name: "Fender",
    move: function() {
      var willClick = 0;
      if (this.chosen.length >= 2 || humanity.chosen.length >= 2) {
        for (var b in collection) {
          if (testWinCon(this.chosen, collection[b])) {
            willClick = collection[b];
          }
        }

        if (willClick === 0) {
          for (var a in collection) {
            if (testWinCon(humanity.chosen, collection[a])) {
              willClick = collection[a];
            }
          }
        }
      }
      if (willClick === 0) {
        willClick = collection[Math.floor(Math.random() * collection.length)];
      }
      collection.splice(collection.indexOf(willClick), 1);
      this.chosen.push(willClick);
      boxes[willClick].off();
      return boxes[willClick];
    },
    score: 0,
    addScore: function() {
      this.score++;
    },

    symbol: "<div class=circle></div>",
    setSymbol: function(symbol) {
      this.symbol = symbol;
    },

    chosen: [],
    clearChosen: function() {
      this.chosen = [];
    }
  };

  var DieNet = {
    winMessage: "You are DieNet-ated!",
    loseMessage: "BEE--eeepp booooop....",
    drawMessage: "You have only delayed my apocalypse...",
    name: "DieNet",
    move: function() {
      var willClick = 0;
      if (CPUstart && this.chosen.length === 0) {
        willClick = priority[Math.floor(Math.random() * priority.length)];
      }
      if (CPUstart && this.chosen.length == 1) {
        if (collection.includes(5)) {
          willClick = 5;
        }
      }
      if (!CPUstart && this.chosen.length <= 1) {
        if (collection.includes(5)) {
          willClick = 5;
        }
        if (checkTrap() && this.chosen.length < 2) {
          while (!collection.includes(willClick)) {
            willClick = safeguard[Math.floor(Math.random() * safeguard.length)];
          }
        } else {
          var corners = [1, 3, 7, 9];
          while (!collection.includes(willClick)) {
            willClick = corners[Math.floor(Math.random() * corners.length)];
          }
        }
      }
      if (this.chosen.length >= 2 || humanity.chosen.length >= 2) {
        var won = false;
        for (var b in collection) {
          if (testWinCon(this.chosen, collection[b])) {
            won = true;
            willClick = collection[b];
          }
        }

        if (!won) {
          for (var a in collection) {
            if (testWinCon(humanity.chosen, collection[a])) {
              willClick = collection[a];
            }
          }
        }
      }

      if (willClick === 0) {
        if (checkTrap() && this.chosen.length < 2) {
          while (!collection.includes(willClick)) {
            willClick = safeguard[Math.floor(Math.random() * safeguard.length)];
          }
        } else {
          willClick = collection[Math.floor(Math.random() * collection.length)];
        }
      }
      collection.splice(collection.indexOf(willClick), 1);
      this.chosen.push(willClick);
      boxes[willClick].off();
      return boxes[willClick];
    },
    score: 0,
    addScore: function() {
      this.score++;
    },

    symbol: "<div class=circle></div>",
    setSymbol: function(symbol) {
      this.symbol = symbol;
    },

    chosen: [],
    clearChosen: function() {
      this.chosen = [];
    }
  };
  //////////////////////////////////////////////////////////////

  function reset() {
    $score.css({
      display: "none"
    });
    $menu.css({
      display: ""
    });
    $message.html("");
    $box.off().empty().css("background", "black");
    collection = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    playable = true;
    humanity.clearChosen();
    P3P0.clearChosen();
    Fender.clearChosen();
    DieNet.clearChosen();
    circled = [];
    crossed = [];
    return false;
  }

  function clearAllScore() {
    score.draw = 0;
    score.circleScore = 0;
    score.crossScore = 0;
    humanity.score = 0;
    Fender.score = 0;
    P3P0.score = 0;
    DieNet.score = 0;
    return false;
  }
  function testWinCon(arr, number) {
    var testArr = [];
    for (var z in arr) {
      testArr.push(arr[z]);
    }
    testArr.push(number);
    if (testArr.length < 3) {
      return false;
    }
    if (
      (testArr.includes(1) && testArr.includes(2) && testArr.includes(3)) ||
      (testArr.includes(4) && testArr.includes(5) && testArr.includes(6)) ||
      (testArr.includes(7) && testArr.includes(8) && testArr.includes(9)) ||
      (testArr.includes(1) && testArr.includes(5) && testArr.includes(9)) ||
      (testArr.includes(3) && testArr.includes(5) && testArr.includes(7)) ||
      (testArr.includes(1) && testArr.includes(4) && testArr.includes(7)) ||
      (testArr.includes(2) && testArr.includes(5) && testArr.includes(8)) ||
      (testArr.includes(3) && testArr.includes(6) && testArr.includes(9))
    ) {
      return true;
    } else {
      return false;
    }
  }

  function checkWinCon(arr) {
    if (arr.length < 3) {
      return false;
    }
    if (arr.includes(1) && arr.includes(2) && arr.includes(3)) {
      boxes[1].css(
        "background",
        "linear-gradient(0deg, darkgreen 0%, darkseagreen 50%, darkgreen 100%)"
      );
      boxes[2].css(
        "background",
        "linear-gradient(0deg, darkgreen 0%, darkseagreen 50%, darkgreen 100%)"
      );
      boxes[3].css(
        "background",
        "linear-gradient(0deg, darkgreen 0%, darkseagreen 50%, darkgreen 100%)"
      );
      return true;
    }
    if (arr.includes(4) && arr.includes(5) && arr.includes(6)) {
      boxes[4].css(
        "background",
        "linear-gradient(0deg, darkgreen 0%, darkseagreen 50%, darkgreen 100%)"
      );
      boxes[5].css(
        "background",
        "linear-gradient(0deg, darkgreen 0%, darkseagreen 50%, darkgreen 100%)"
      );
      boxes[6].css(
        "background",
        "linear-gradient(0deg, darkgreen 0%, darkseagreen 50%, darkgreen 100%)"
      );
      return true;
    }
    if (arr.includes(7) && arr.includes(8) && arr.includes(9)) {
      boxes[7].css(
        "background",
        "linear-gradient(0deg, darkgreen 0%, darkseagreen 50%, darkgreen 100%)"
      );
      boxes[8].css(
        "background",
        "linear-gradient(0deg, darkgreen 0%, darkseagreen 50%, darkgreen 100%)"
      );
      boxes[9].css(
        "background",
        "linear-gradient(0deg, darkgreen 0%, darkseagreen 50%, darkgreen 100%)"
      );
      return true;
    }
    if (arr.includes(1) && arr.includes(5) && arr.includes(9)) {
      boxes[1].css(
        "background",
        "linear-gradient(60deg, darkgreen 0%, darkseagreen 50%, darkgreen 100%)"
      );
      boxes[5].css(
        "background",
        "linear-gradient(60deg, darkgreen 0%, darkseagreen 50%, darkgreen 100%)"
      );
      boxes[9].css(
        "background",
        "linear-gradient(60deg, darkgreen 0%, darkseagreen 50%, darkgreen 100%)"
      );
      return true;
    }
    if (arr.includes(3) && arr.includes(5) && arr.includes(7)) {
      boxes[3].css(
        "background",
        "linear-gradient(120deg, darkgreen 0%, darkseagreen 50%, darkgreen 100%)"
      );
      boxes[5].css(
        "background",
        "linear-gradient(120deg, darkgreen 0%, darkseagreen 50%, darkgreen 100%)"
      );
      boxes[7].css(
        "background",
        "linear-gradient(120deg, darkgreen 0%, darkseagreen 50%, darkgreen 100%)"
      );
      return true;
    }
    if (arr.includes(1) && arr.includes(4) && arr.includes(7)) {
      boxes[1].css(
        "background",
        "linear-gradient(90deg, darkgreen 0%, darkseagreen 50%, darkgreen 100%)"
      );
      boxes[4].css(
        "background",
        "linear-gradient(90deg, darkgreen 0%, darkseagreen 50%, darkgreen 100%)"
      );
      boxes[7].css(
        "background",
        "linear-gradient(90deg, darkgreen 0%, darkseagreen 50%, darkgreen 100%)"
      );
      return true;
    }
    if (arr.includes(2) && arr.includes(5) && arr.includes(8)) {
      boxes[2].css(
        "background",
        "linear-gradient(90deg, darkgreen 0%, darkseagreen 50%, darkgreen 100%)"
      );
      boxes[5].css(
        "background",
        "linear-gradient(90deg, darkgreen 0%, darkseagreen 50%, darkgreen 100%)"
      );
      boxes[8].css(
        "background",
        "linear-gradient(90deg, darkgreen 0%, darkseagreen 50%, darkgreen 100%)"
      );
      return true;
    }
    if (arr.includes(3) && arr.includes(6) && arr.includes(9)) {
      boxes[3].css(
        "background",
        "linear-gradient(90deg, darkgreen 0%, darkseagreen 50%, darkgreen 100%)"
      );
      boxes[6].css(
        "background",
        "linear-gradient(90deg, darkgreen 0%, darkseagreen 50%, darkgreen 100%)"
      );
      boxes[9].css(
        "background",
        "linear-gradient(90deg, darkgreen 0%, darkseagreen 50%, darkgreen 100%)"
      );
      return true;
    } else {
      return false;
    }
  }

  function checkTrap() {
    if (
      (humanity.chosen.includes(1) && humanity.chosen.includes(9)) ||
      (humanity.chosen.includes(3) && humanity.chosen.includes(7))
    ) {
      return true;
    }
    return false;
  }

  $twoPlayer.off().on("click", twoPlayer);

  function twoPlayer() {
    reset();
    $score.html(
      "Cross: " +
        score.crossScore +
        "   " +
        "Circle: " +
        score.circleScore +
        "   " +
        "Draw: " +
        score.draw
    );
    $menu.css({
      display: "none"
    });
    $board.css({
      display: ""
    });
    $score.css({
      display: ""
    });
    $message.off().on("click", "#playAgain", function() {
      twoPlayer();
    });

    $(document).off().on("click", "#reset", function() {
      reset();
      clearAllScore();
      $board.css("display", "none");
      $score.css("display", "none");
      $menu.css("display", "");
    });

    $box.off().one("click", function() {
      var $this = $(this);
      var clicked = getNum(this.id);
      if (playable && collection.includes(clicked)) {
        collection.splice(collection.indexOf(clicked), 1);
        if (circle) {
          circle = false;
          $this.html("<div class=circle></div>");
          circled.push(clicked);
          if (checkWinCon(circled)) {
            $message.html(
              "<p id=winCircle>Circle wins! Play again? <br>   <a id=playAgain>Yes</a>     <a id=reset>Reset</a></p>"
            );
            if (circled.length <= crossed.length) {
              circle = true;
            }
            score.addCircle();
            $score.html(
              "Cross: " +
                score.crossScore +
                "   " +
                "Circle: " +
                score.circleScore +
                "   " +
                "Draw: " +
                score.draw
            );

            playable = false;
          }
        } else {
          circle = true;
          $this.html("<div class=x></div>");
          crossed.push(clicked);
          if (checkWinCon(crossed)) {
            if (crossed.length <= circled.length) {
              circle = false;
            }
            $message.html(
              "<p id=winCross>Cross wins! Play again?    <br><a id=playAgain>Yes</a>     <a id=reset>Reset</a></p>"
            );

            playable = false;
            score.addCross();
            $score.html(
              "Cross: " +
                score.crossScore +
                "   " +
                "Circle: " +
                score.circleScore +
                "   " +
                "Draw: " +
                score.draw
            );
          }
        }
        if (playable && collection.length === 0) {
          $message.html(
            "<p id=draw>Draw! Play again?   <br> <a id=playAgain>Yes</a>     <a id=reset>Reset</a></p>"
          );
          score.addDraw();
          $score.html(
            "Cross: " +
              score.crossScore +
              "   " +
              "Circle: " +
              score.circleScore +
              "   " +
              "Draw: " +
              score.draw
          );
          playable = false;
        }
      }
    });

    return false;
  }

  $("#chooseCircle").on("click", function() {
    CPUstart = true;
    humanity.setSymbol("<div class=circle></div>");
    P3P0.setSymbol("<div class=x></div>");
    Fender.setSymbol("<div class=x></div>");
    DieNet.setSymbol("<div class=x></div>");
  });

  function playAI(robot) {
    var end = false;
    reset();
    $score.html(
      "You: " +
        humanity.score +
        "   " +
        robot.name +
        ": " +
        robot.score +
        "   " +
        "Draw: " +
        score.draw
    );
    $menu.css({
      display: "none"
    });
    $board.css({
      display: ""
    });
    $score.css({
      display: ""
    });
    $("#chooseTurn").css({
      display: "none"
    });

    $message.off().on("click", "#playAgain", function() {
      playAI(robot);
    });

    if (CPUstart) {
      robot.move().html(robot.symbol);
    }

    $(document).off().on("click", "#reset", function() {
      reset();
      clearAllScore();

      $board.css("display", "none");
      $score.css("display", "none");
      $menu.css("display", "");
      CPUstart = false;
      playable = true;
      circle = false;
    });

    $box.one("click", function() {
      var $this = $(this);
      var clicked = getNum(this.id);
      if (playable && collection.includes(clicked)) {
        collection.splice(collection.indexOf(clicked), 1);
        $this.html(humanity.symbol);
        humanity.chosen.push(clicked);
        if (checkWinCon(humanity.chosen)) {
          $message.html(
            "<p id=winCircle>" +
              robot.name +
              " says: " +
              robot.loseMessage +
              "<br>Play again? <br>   <a id=playAgain>Yes</a>     <a id=reset>Reset</a></p>"
          );
          CPUstart = !CPUstart;
          humanity.addScore();
          $score.html(
            "You: " +
              humanity.score +
              "   " +
              robot.name +
              ": " +
              robot.score +
              "   " +
              "Draw: " +
              score.draw
          );
          end = true;
          playable = false;
        }
        playable = false;
        if (!end && collection.length >= 1) {
          robot.move().html(robot.symbol);
          if (checkWinCon(robot.chosen)) {
            $message.html(
              "<p id=winCross>" +
                robot.name +
                " says: " +
                robot.winMessage +
                "<br>Play again? <br>   <a id=playAgain>Yes</a>     <a id=reset>Reset</a></p>"
            );
            CPUstart = !CPUstart;
            robot.addScore();
            $score.html(
              "You: " +
                humanity.score +
                "   " +
                robot.name +
                ": " +
                robot.score +
                "   " +
                "Draw: " +
                score.draw
            );
            end = true;
            playable = false;
          }
        }
        if (!end && collection.length == 0) {
          $message.html(
            "<p id=draw>" +
              robot.name +
              " says: " +
              robot.drawMessage +
              "<br>Play again? <br>   <a id=playAgain>Yes</a>     <a id=reset>Reset</a></p>"
          );
          score.addDraw();
          $score.html(
            "You: " +
              humanity.score +
              "   " +
              robot.name +
              ": " +
              robot.score +
              "   " +
              "Draw: " +
              score.draw
          );
          CPUstart = !CPUstart;
          playable = false;
        } /////if playable^
        if (!end) {
          playable = true;
        }
      }
    });

    return false;
  }

  $("#P3P0").on("click", function() {
    $menu.css({
      display: "none"
    });
    $chooseTurn.css({
      display: ""
    });
    $chooseTurn.one("click", function() {
      playAI(P3P0);
    });
  });
  $("#Fender").on("click", function() {
    $menu.css({
      display: "none"
    });
    $chooseTurn.css({
      display: ""
    });
    $chooseTurn.one("click", function() {
      playAI(Fender);
    });
  });

  $("#DieNet").on("click", function() {
    $menu.css({
      display: "none"
    });
    $chooseTurn.css({
      display: ""
    });
    $chooseTurn.one("click", function() {
      playAI(DieNet);
    });
  });

  function getNum(id) {
    switch (id) {
      case "top-left":
        return 1;
      case "top-middle":
        return 2;
      case "top-right":
        return 3;
      case "middle-left":
        return 4;
      case "middle-middle":
        return 5;
      case "middle-right":
        return 6;
      case "bottom-left":
        return 7;
      case "bottom-middle":
        return 8;
      case "bottom-right":
        return 9;
    }
  }
});

/* function checkWinCon(arr) { Different version of checkWinCor that will highlight multiple winning lines if applicable
    var win = false;
    if(arr.length < 3){
      return false;
    }
    if (arr.indexOf(1) != -1 && arr.indexOf(2) != -1 && arr.indexOf(3) != -1){
      
      $("#top-left").css("background", "linear-gradient(0deg, darkgreen 0%, darkseagreen 50%, darkgreen 100%)");
      $("#top-middle").css("background", "linear-gradient(0deg, darkgreen 0%, darkseagreen 50%, darkgreen 100%)");
      $("#top-right").css("background", "linear-gradient(0deg, darkgreen 0%, darkseagreen 50%, darkgreen 100%)");
      win = true;
    } 
     if (arr.indexOf(4) != -1 && arr.indexOf(5) != -1 && arr.indexOf(6) != -1){
      
      $("#middle-left").css("background", "linear-gradient(0deg, darkgreen 0%, darkseagreen 50%, darkgreen 100%)");
      $("#middle-middle").css("background", "linear-gradient(0deg, darkgreen 0%, darkseagreen 50%, darkgreen 100%)");
      $("#middle-right").css("background", "linear-gradient(0deg, darkgreen 0%, darkseagreen 50%, darkgreen 100%)");
       win = true;;
    } 
      if (arr.indexOf(7) != -1 && arr.indexOf(8) != -1 && arr.indexOf(9) != -1){
      
      $("#bottom-left").css("background", "linear-gradient(0deg, darkgreen 0%, darkseagreen 50%, darkgreen 100%)");
      $("#bottom-middle").css("background", "linear-gradient(0deg, darkgreen 0%, darkseagreen 50%, darkgreen 100%)");
      $("#bottom-right").css("background", "linear-gradient(0deg, darkgreen 0%, darkseagreen 50%, darkgreen 100%)");
        win = true;
    } 
         if (arr.indexOf(1) != -1 && arr.indexOf(5) != -1 && arr.indexOf(9) != -1){
     
      $("#top-left").css("background", "linear-gradient(60deg, darkgreen 0%, darkseagreen 50%, darkgreen 100%)");
      $("#middle-middle").css("background", "linear-gradient(60deg, darkgreen 0%, darkseagreen 50%, darkgreen 100%)");
      $("#bottom-right").css("background", "linear-gradient(60deg, darkgreen 0%, darkseagreen 50%, darkgreen 100%)");
           win =  true;
    } 
         if (arr.indexOf(3) != -1 && arr.indexOf(5) != -1 && arr.indexOf(7) != -1){
      
      $("#top-right").css("background", "linear-gradient(120deg, darkgreen 0%, darkseagreen 50%, darkgreen 100%)");
      $("#middle-middle").css("background", "linear-gradient(120deg, darkgreen 0%, darkseagreen 50%, darkgreen 100%)");
      $("#bottom-left").css("background", "linear-gradient(120deg, darkgreen 0%, darkseagreen 50%, darkgreen 100%)");
           win =  true;
    } 
           if (arr.indexOf(1) != -1 && arr.indexOf(4) != -1 && arr.indexOf(7) != -1){
      
      $("#top-left").css("background", "linear-gradient(90deg, darkgreen 0%, darkseagreen 50%, darkgreen 100%)");
      $("#middle-left").css("background", "linear-gradient(90deg, darkgreen 0%, darkseagreen 50%, darkgreen 100%)");
      $("#bottom-left").css("background", "linear-gradient(90deg, darkgreen 0%, darkseagreen 50%, darkgreen 100%)");
             win = true;
    } 
           if (arr.indexOf(2) != -1 && arr.indexOf(5) != -1 && arr.indexOf(8) != -1){
      
      $("#top-middle").css("background", "linear-gradient(90deg, darkgreen 0%, darkseagreen 50%, darkgreen 100%)");
      $("#middle-middle").css("background", "linear-gradient(90deg, darkgreen 0%, darkseagreen 50%, darkgreen 100%)");
      $("#bottom-middle").css("background", "linear-gradient(90deg, darkgreen 0%, darkseagreen 50%, darkgreen 100%)");
             win = true;
    } 
         if (arr.indexOf(3) != -1 && arr.indexOf(6) != -1 && arr.indexOf(9) != -1){
      $("#top-right").css("background", "linear-gradient(90deg, darkgreen 0%, darkseagreen 50%, darkgreen 100%)");
      $("#middle-right").css("background", "linear-gradient(90deg, darkgreen 0%, darkseagreen 50%, darkgreen 100%)");
      $("#bottom-right").css("background", "linear-gradient(90deg, darkgreen 0%, darkseagreen 50%, darkgreen 100%)");
           win = true;
    } 
    return win;
  }
  */