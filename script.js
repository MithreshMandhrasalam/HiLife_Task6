const display      = document.getElementById('display');
const startStopBtn = document.getElementById('startStopBtn');
const lapBtn       = document.getElementById('lapBtn');
const resetBtn     = document.getElementById('resetBtn');
const lapsList     = document.getElementById('lapsList');

let isRunning       = false;
let startTime       = 0;
let accumulatedTime = 0;
let timerId         = null;
let lapCounter      = 0;
let laps            = [];

function formatNumber(number) {
    if (number < 10) {
        return '0' + number;
    } else {
        return String(number);
    }
}

function formatTime(totalMs) {
    let totalSeconds = Math.floor(totalMs / 1000);
    let seconds = totalSeconds % 60;
    let minutes = Math.floor(totalSeconds / 60) % 60;
    let hours   = Math.floor(totalSeconds / 3600);

    return formatNumber(hours) + ':' + formatNumber(minutes) + ':' + formatNumber(seconds);
}

function tick() {
    let now            = Date.now();
    let currentElapsed = accumulatedTime + (now - startTime);
    display.innerText  = formatTime(currentElapsed);
}

function saveState() {
    localStorage.setItem('stopwatch_isRunning',       isRunning);
    localStorage.setItem('stopwatch_startTime',       startTime);
    localStorage.setItem('stopwatch_accumulatedTime', accumulatedTime);
    localStorage.setItem('stopwatch_laps',            JSON.stringify(laps));
}

function loadState() {
    let savedIsRunning       = localStorage.getItem('stopwatch_isRunning');
    let savedStartTime       = localStorage.getItem('stopwatch_startTime');
    let savedAccumulatedTime = localStorage.getItem('stopwatch_accumulatedTime');
    let savedLaps            = localStorage.getItem('stopwatch_laps');

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

    if (savedIsRunning === 'true') {
        isRunning       = true;
        startTime       = parseInt(savedStartTime);
        accumulatedTime = parseInt(savedAccumulatedTime);

        let now            = Date.now();
        let currentElapsed = accumulatedTime + (now - startTime);
        display.innerText  = formatTime(currentElapsed);

        timerId = setInterval(tick, 1000);

        startStopBtn.innerText = 'Stop';
        startStopBtn.classList.remove('start');
        startStopBtn.classList.add('stop');

    } else if (savedAccumulatedTime !== null) {
        isRunning         = false;
        accumulatedTime   = parseInt(savedAccumulatedTime);
        display.innerText = formatTime(accumulatedTime);
    }
}

startStopBtn.addEventListener('click', function() {

    if (isRunning === false) {
        isRunning = true;
        startTime = Date.now();
        timerId   = setInterval(tick, 1000);

        startStopBtn.innerText = 'Stop';
        startStopBtn.classList.remove('start');
        startStopBtn.classList.add('stop');

    } else {
        isRunning = false;
        clearInterval(timerId);
        accumulatedTime += Date.now() - startTime;

        startStopBtn.innerText = 'Start';
        startStopBtn.classList.remove('stop');
        startStopBtn.classList.add('start');
    }

    saveState();
});

lapBtn.addEventListener('click', function() {

    let currentElapsed = accumulatedTime;
    if (isRunning === true) {
        currentElapsed += Date.now() - startTime;
    }

    if (currentElapsed > 0) {
        lapCounter++;
        let timeString = formatTime(currentElapsed);

        laps.push(timeString);

        let li = document.createElement('li');
        li.innerHTML = '<span>Lap ' + lapCounter + '</span><span>' + timeString + '</span>';
        lapsList.insertBefore(li, lapsList.firstChild);

        saveState();
    }
});

resetBtn.addEventListener('click', function() {

    clearInterval(timerId);

    isRunning       = false;
    startTime       = 0;
    accumulatedTime = 0;
    lapCounter      = 0;
    laps            = [];

    display.innerText      = '00:00:00';
    startStopBtn.innerText = 'Start';
    startStopBtn.classList.remove('stop');
    startStopBtn.classList.add('start');
    lapsList.innerHTML = '';

    localStorage.removeItem('stopwatch_isRunning');
    localStorage.removeItem('stopwatch_startTime');
    localStorage.removeItem('stopwatch_accumulatedTime');
    localStorage.removeItem('stopwatch_laps');
});

loadState();
