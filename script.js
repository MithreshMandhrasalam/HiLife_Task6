// ---- Get references to HTML elements ----
const display      = document.getElementById('display');
const startStopBtn = document.getElementById('startStopBtn');
const lapBtn       = document.getElementById('lapBtn');
const resetBtn     = document.getElementById('resetBtn');
const lapsList     = document.getElementById('lapsList');

// ---- Variables to track timer state ----
let isRunning       = false;   // Is the timer currently ticking?
let startTime       = 0;       // When did we last press Start? (timestamp in ms)
let accumulatedTime = 0;       // Total time counted before the last pause (in ms)
let timerId         = null;    // Holds the ID returned by setInterval
let lapCounter      = 0;       // How many laps have been recorded
let laps            = [];      // Array that stores each lap time as a string


// ---- Helper: add a leading zero if number is less than 10 ----
// Example: 9 becomes "09", 12 stays "12"
function formatNumber(number) {
    if (number < 10) {
        return '0' + number;
    } else {
        return String(number);
    }
}

// ---- Helper: turn milliseconds into HH:MM:SS string ----
function formatTime(totalMs) {
    let totalSeconds = Math.floor(totalMs / 1000);
    let seconds = totalSeconds % 60;
    let minutes = Math.floor(totalSeconds / 60) % 60;
    let hours   = Math.floor(totalSeconds / 3600);

    return formatNumber(hours) + ':' + formatNumber(minutes) + ':' + formatNumber(seconds);
}

// ---- Called every second by setInterval to update the display ----
function tick() {
    let now            = Date.now();
    let currentElapsed = accumulatedTime + (now - startTime);
    display.innerText  = formatTime(currentElapsed);
}


// ---- Save current state to localStorage so it survives a page refresh ----
function saveState() {
    localStorage.setItem('stopwatch_isRunning',       isRunning);
    localStorage.setItem('stopwatch_startTime',       startTime);
    localStorage.setItem('stopwatch_accumulatedTime', accumulatedTime);
    localStorage.setItem('stopwatch_laps',            JSON.stringify(laps));
}

// ---- Load saved state from localStorage when the page first opens ----
function loadState() {
    let savedIsRunning       = localStorage.getItem('stopwatch_isRunning');
    let savedStartTime       = localStorage.getItem('stopwatch_startTime');
    let savedAccumulatedTime = localStorage.getItem('stopwatch_accumulatedTime');
    let savedLaps            = localStorage.getItem('stopwatch_laps');

    // Restore the lap list if there are saved laps
    if (savedLaps) {
        laps       = JSON.parse(savedLaps);
        lapCounter = laps.length;

        lapsList.innerHTML = '';
        for (let i = 0; i < laps.length; i++) {
            let li = document.createElement('li');
            li.innerHTML = '<span>Lap ' + (i + 1) + '</span><span>' + laps[i] + '</span>';
            lapsList.insertBefore(li, lapsList.firstChild);
        }
    }

    // If the timer was running when the page was closed, resume it
    if (savedIsRunning === 'true') {
        isRunning       = true;
        startTime       = parseInt(savedStartTime);
        accumulatedTime = parseInt(savedAccumulatedTime);

        // FIX: was "let now  Date.now();=" — the = was on the wrong side
        let now            = Date.now();
        let currentElapsed = accumulatedTime + (now - startTime);
        display.innerText  = formatTime(currentElapsed);

        timerId = setInterval(tick, 1000);

        startStopBtn.innerText = 'Stop';
        startStopBtn.classList.remove('start');
        startStopBtn.classList.add('stop');

    } else if (savedAccumulatedTime !== null) {
        // Timer was paused — just show the saved time
        isRunning       = false;
        accumulatedTime = parseInt(savedAccumulatedTime);
        display.innerText = formatTime(accumulatedTime);
    }
}


// ---- Start / Stop button ----
startStopBtn.addEventListener('click', function() {

    if (isRunning === false) {
        // Start the timer
        isRunning = true;
        startTime = Date.now();
        timerId   = setInterval(tick, 1000);

        startStopBtn.innerText = 'Stop';
        startStopBtn.classList.remove('start');
        startStopBtn.classList.add('stop');

    } else {
        // Stop (pause) the timer
        isRunning = false;
        clearInterval(timerId);
        accumulatedTime += Date.now() - startTime;  // Save how much time has passed

        startStopBtn.innerText = 'Start';
        startStopBtn.classList.remove('stop');
        startStopBtn.classList.add('start');
    }

    saveState();
});


// ---- Lap button ----
lapBtn.addEventListener('click', function() {

    // Calculate how much time has elapsed right now
    let currentElapsed = accumulatedTime;
    if (isRunning === true) {
        currentElapsed += Date.now() - startTime;
    }

    // Only record a lap if the timer has actually started
    if (currentElapsed > 0) {
        lapCounter++;
        let timeString = formatTime(currentElapsed);

        laps.push(timeString);

        // Add a new list item at the TOP of the lap list
        let li = document.createElement('li');
        li.innerHTML = '<span>Lap ' + lapCounter + '</span><span>' + timeString + '</span>';
        lapsList.insertBefore(li, lapsList.firstChild);

        saveState();
    }
});


// ---- Reset button ----
resetBtn.addEventListener('click', function() {

    // Stop any running interval
    clearInterval(timerId);

    // Reset all variables back to zero
    isRunning       = false;
    startTime       = 0;
    accumulatedTime = 0;
    lapCounter      = 0;
    laps            = [];

    // Reset the display
    display.innerText      = '00:00:00';
    startStopBtn.innerText = 'Start';
    startStopBtn.classList.remove('stop');
    startStopBtn.classList.add('start');
    lapsList.innerHTML = '';

    // Clear saved data from localStorage
    localStorage.removeItem('stopwatch_isRunning');
    localStorage.removeItem('stopwatch_startTime');
    localStorage.removeItem('stopwatch_accumulatedTime');
    localStorage.removeItem('stopwatch_laps');
});


// ---- Run loadState when the page first loads ----
loadState();
