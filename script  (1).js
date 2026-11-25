(function () {
  "use strict";

  var CHOICES = ["rock", "paper", "scissors"];
  var ICONS = { rock: "✊", paper: "✋", scissors: "✌️" };
  var BEATS = { rock: "scissors", paper: "rock", scissors: "paper" };
  var MAX_HISTORY = 5;

  /* Pure game logic: returns "win", "lose" or "draw" from the player's view */
  function decide(player, computer) {
    if (player === computer) return "draw";
    return BEATS[player] === computer ? "win" : "lose";
  }

  function randomChoice() {
    return CHOICES[Math.floor(Math.random() * CHOICES.length)];
  }

  /* Allow the logic to be tested in Node without a browser */
  if (typeof document === "undefined") {
    module.exports = { decide: decide, CHOICES: CHOICES, BEATS: BEATS };
    return;
  }

  var score = { win: 0, draw: 0, lose: 0 };
  var history = [];

  var el = {
    player: document.getElementById("score-player"),
    draw: document.getElementById("score-draw"),
    computer: document.getElementById("score-computer"),
    playerHand: document.getElementById("player-hand"),
    computerHand: document.getElementById("computer-hand"),
    result: document.getElementById("result"),
    history: document.getElementById("history"),
    reset: document.getElementById("reset")
  };

  var MESSAGES = {
    win: "You win this round!",
    lose: "Computer wins this round.",
    draw: "It's a draw."
  };

  function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  function bump(node) {
    node.classList.remove("bump");
    void node.offsetWidth;            // restart the animation
    node.classList.add("bump");
  }

  function play(playerChoice) {
    var computerChoice = randomChoice();
    var outcome = decide(playerChoice, computerChoice);

    score[outcome]++;
    history.unshift({ p: playerChoice, c: computerChoice, o: outcome });
    if (history.length > MAX_HISTORY) history.pop();

    render(playerChoice, computerChoice, outcome);
  }

  function render(p, c, outcome) {
    el.playerHand.textContent = ICONS[p];
    el.computerHand.textContent = ICONS[c];

    ["win", "lose", "draw", "shake"].forEach(function (cls) {
      el.playerHand.classList.remove(cls);
      el.computerHand.classList.remove(cls);
      el.result.classList.remove(cls);
    });
    void el.playerHand.offsetWidth;
    el.playerHand.classList.add("shake", outcome === "win" ? "win" : outcome === "lose" ? "lose" : "draw");
    el.computerHand.classList.add("shake", outcome === "lose" ? "win" : outcome === "win" ? "lose" : "draw");

    el.result.textContent = capitalize(p) + " vs " + capitalize(c) + ": " + MESSAGES[outcome];
    el.result.classList.add(outcome);

    el.player.textContent = score.win;
    el.draw.textContent = score.draw;
    el.computer.textContent = score.lose;
    bump(outcome === "win" ? el.player : outcome === "lose" ? el.computer : el.draw);

    renderHistory();
  }

  function renderHistory() {
    el.history.innerHTML = "";
    if (!history.length) {
      var li = document.createElement("li");
      li.className = "empty";
      li.textContent = "No rounds played yet.";
      el.history.appendChild(li);
      return;
    }
    history.forEach(function (r) {
      var li = document.createElement("li");
      var left = document.createElement("span");
      var right = document.createElement("span");
      left.textContent = ICONS[r.p] + " " + capitalize(r.p) + " vs " + ICONS[r.c] + " " + capitalize(r.c);
      right.className = "tag " + r.o;
      right.textContent = r.o === "win" ? "You won" : r.o === "lose" ? "You lost" : "Draw";
      li.appendChild(left);
      li.appendChild(right);
      el.history.appendChild(li);
    });
  }

  function resetGame() {
    score = { win: 0, draw: 0, lose: 0 };
    history = [];
    el.player.textContent = el.draw.textContent = el.computer.textContent = "0";
    el.playerHand.textContent = el.computerHand.textContent = "?";
    ["win", "lose", "draw", "shake"].forEach(function (cls) {
      el.playerHand.classList.remove(cls);
      el.computerHand.classList.remove(cls);
      el.result.classList.remove(cls);
    });
    el.result.textContent = "Score reset. Choose rock, paper or scissors.";
    renderHistory();
  }

  document.querySelectorAll(".choice").forEach(function (btn) {
    btn.addEventListener("click", function () { play(btn.dataset.choice); });
  });

  el.reset.addEventListener("click", resetGame);

  document.addEventListener("keydown", function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    var map = { r: "rock", p: "paper", s: "scissors" };
    var choice = map[e.key.toLowerCase()];
    if (choice) play(choice);
  });
})();
