document.getElementById("date").textContent = time();
const nameBtn = document.getElementById("nameBtn");
const nm = document.getElementById("nm");
const playBtn = document.getElementById("playBtn");
const guessBtn = document.getElementById("guessBtn");
const giveUpBtn = document.getElementById("giveUpBtn");
const guess = document.getElementById("guess");
const msg = document.getElementById("msg");
const wins = document.getElementById("wins");
const avgScore = document.getElementById("avgScore");
const scoreJudge = document.getElementById("scoreJudge");

let seconds = 0;
let timer = null;

function updateDisplay() {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  let formatted1 = "";
  if (mins < 10) {
    formatted1 += "0" + mins;
  } 
  else {
    formatted1 += mins;
  }
  formatted1 += ":";
  if (secs < 10) {
    formatted1 += "0" + secs;
  } 
  else {
    formatted1 += secs;
  }
  const el = document.getElementById("display");
  if (el) {
    el.textContent = formatted1;
  }
}

function startTimer() {
  if (timer === null) {
    timer = setInterval(() => {
      seconds++;
      updateDisplay();
    }, 1000);
  }
}

function stopTimer() {
  if (timer !== null) {
    clearInterval(timer);
    timer = null;
  }
}

let score, answer, level;
const levelArr = document.getElementsByName("level");
const scoreArr = [];
const userNm   = document.getElementById("nameEntered");
let startTime = null; 
let fastestTime = null; 
const timeArr = [];

function formatTime(ms) {
  const totalSec = Math.floor(ms / 1000);
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  let formatted2 = "";

  if (mins < 10) {
    formatted2 += "0" + mins;
  } 
  else {
    formatted2 += mins;
  }
  formatted2 += ":";
  if (secs < 10) {
    formatted2 += "0" + secs;
  } 
  else {
    formatted2 += secs;
  }
  return formatted2;
}

function ensureFastestEl() {
  let el = document.getElementById('fastest');
  if (!el) {
    el = document.createElement('p');
    el.id = 'fastest';
    el.textContent = 'Fastest Time: N/A';
    if (avgScore && avgScore.parentNode) {
      avgScore.parentNode.insertBefore(el, avgScore.nextSibling);
    } else {
      document.body.appendChild(el);
    }
  }
  return el;
}

function updateFastestIfNeeded(elapsedMs) {
  if (elapsedMs == null) {
    return;
  }
  if (fastestTime === null || elapsedMs < fastestTime) {
    fastestTime = elapsedMs;
  }
  const el = ensureFastestEl();
  el.textContent = 'Fastest Time: ' + formatTime(fastestTime);
}

function ensureAvgTimeEl() {
  let el = document.getElementById('avgTime');
  if (!el) {
    el = document.createElement('p');
    el.id = 'avgTime';
    el.textContent = 'Average Time: N/A';
    const fastestEl = document.getElementById('fastest');
    if (fastestEl && fastestEl.parentNode) {
      fastestEl.parentNode.insertBefore(el, fastestEl.nextSibling);
    }
    else if (avgScore && avgScore.parentNode) {
      avgScore.parentNode.insertBefore(el, avgScore.nextSibling);
    } 
    else {
      document.body.appendChild(el);
    }
  }
  return el;
}

function updateAvgTimeDisplay() {
  if (timeArr.length === 0) return;
  const sum = timeArr.reduce((a, b) => a + b, 0);
  const avg = Math.floor(sum / timeArr.length);
  const el = ensureAvgTimeEl();
  el.textContent = 'Average Time: ' + formatTime(avg);
}

function inputName() {
  let nameValue = "";
  if (userNm && userNm.value) {
    nameValue = userNm.value.trim();
  }
  if (!nameValue) {
    nm.textContent = "INVALID NAME!";
    return;
  }
  const userName = nameValue.charAt(0).toUpperCase() + nameValue.slice(1).toLowerCase();
  userNm.value = userName;
  nm.textContent = "Hello, " + userName + "!";
  nameBtn.disabled = true;
  playBtn.disabled = false;
}

playBtn.addEventListener("click", play);
guessBtn.addEventListener("click", makeGuess);
nameBtn.addEventListener("click", inputName);
giveUpBtn.addEventListener("click", giveUp);

function time() {
  const d = new Date();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const day = d.getDate();
  const rem100 = day % 100;
  let suffix = 'th';
  if (rem100 < 11 || rem100 > 13) {
    const rem10 = day % 10;
    if (rem10 === 1) {
      suffix = 'st';
    }
    else if (rem10 === 2) {
      suffix = 'nd';
    }
    else if (rem10 === 3) {
      suffix = 'rd';
    }
  }
  return monthNames[d.getMonth()] + " " + day + suffix + ", " + d.getFullYear();
}

function play() {
  playBtn.disabled = true;
  guessBtn.disabled = false;
  guess.disabled = false;
  giveUpBtn.disabled = false;

  for (let i = 0; i < levelArr.length; i++) {
    levelArr[i].disabled = true;
    if (levelArr[i].checked) {
      level = parseInt(levelArr[i].value, 10);
    }
  }
  answer = Math.floor(Math.random() * level) + 1;
  msg.textContent = "Guess a number 1-" + level + ", " + (userNm.value) + "!";
  score = 0;
  seconds = 0;
  updateDisplay();
  startTime = Date.now();
  startTimer();
}

function giveUp() {
  score = level;
  let elapsed;
  if (startTime) {
    elapsed = Date.now() - startTime;
  } 
  else {
    elapsed = null;
  }
  updateFastestIfNeeded(elapsed);
  if (elapsed != null) {
    timeArr.push(elapsed);
    updateAvgTimeDisplay();
  }
  msg.textContent = "Gave up! The answer was " + answer + ". Your score: " + score + ".";
  reset();
  upDateScore();
}

function makeGuess() {
  const userGuess = parseInt(guess.value, 10);
  if (isNaN(userGuess) || userGuess < 1 || userGuess > level) {
    msg.textContent = "INVALID, guess a number!";
    return;
  }

  score++;

  const diff = Math.abs(userGuess - answer);

  if (diff === 0) {
  let elapsed = null;
  if (startTime) {
    elapsed = Date.now() - startTime;
  }

  updateFastestIfNeeded(elapsed);

  if (elapsed !== null) {
    timeArr.push(elapsed);
    updateAvgTimeDisplay();
  }

    msg.textContent = "Correct! It took " + score + " tries.";
    // show celebration animation
    if (typeof celebrate === 'function') celebrate();
    reset();
    upDateScore();
  return;
}

  let direction;
  if (userGuess > answer) {
    direction = "Too high";
  } 
  else {
    direction = "Too low";
  }

  const hotThreshold = Math.max(1, Math.ceil(level * 0.05));
  const warmThreshold = Math.max(hotThreshold + 1, Math.ceil(level * 0.2));
  let tempLabel;
  if (diff <= hotThreshold) tempLabel = "Hot🔥";
  else if (diff <= warmThreshold) tempLabel = "Warm☀️";
  else tempLabel = "Cold❄️";

  msg.textContent = direction + ". " + tempLabel + " Guess again.";
}
 

function reset() {
  stopTimer();
  guessBtn.disabled = true;
  guess.value = "";
  guess.placeholder = "";
  guess.disabled = true;
  giveUpBtn.disabled = true;
  playBtn.disabled = false;
  startTime = null;

  for (let i = 0; i < levelArr.length; i++) {
    levelArr[i].disabled = false;
  }
}

function upDateScore() {
  scoreArr.push(score);
  wins.textContent = "Total wins: " + scoreArr.length;

  scoreArr.sort((a, b) => a - b);
  const lb = document.getElementsByName("leaderboard");

  let sum = 0;
  for (let i = 0; i < scoreArr.length; i++) {
    sum += scoreArr[i];
    if (i < lb.length) {
      lb[i].textContent = scoreArr[i];
    }
  }

  const avg = sum / scoreArr.length;
  avgScore.textContent = "Average Score: " + avg.toFixed(2);

  const nameForShow = userNm.value;
  if (avg <= 5) {
    scoreJudge.textContent = "Great score, " + nameForShow + "!";
  } 
  else if (avg <= 10) {
    scoreJudge.textContent = "Not a bad score, " + nameForShow + "!";
  } 
  else {
    scoreJudge.textContent = "Keep working, " + nameForShow + ".";
  }
}

function celebrate() {
  const N = 18;
  for (let i = 0; i < N; i++) {
    const s = document.createElement('span');
    s.textContent = ['🎉','✨','🎊','🌟'][i % 4];
    s.style.position = 'fixed';
    s.style.left = (Math.random()*100) + 'vw';
    s.style.top = '-10vh';
    s.style.fontSize = (16 + Math.random()*20) + 'px';
    s.style.transition = 'transform 1.2s ease, opacity 1.2s ease';
    s.style.pointerEvents = 'none';
    s.style.zIndex = 9999;
    document.body.appendChild(s);
    // 触发坠落
    requestAnimationFrame(() => {
      s.style.transform = 'translateY(120vh) rotate(' + (Math.random()*360) + 'deg)';
      s.style.opacity = '0';
    });
    // 收尾清理
    setTimeout(() => s.remove(), 1400);
  }
}
