// DOM Elements
const display = document.getElementById('display');
const startStopBtn = document.getElementById('startStopBtn');
const lapBtn = document.getElementById('lapBtn');
const resetBtn = document.getElementById('resetBtn');
const lapsList = document.getElementById('lapsList');

// Timer state variables
let isRunning = false;
let startTime = 0;          // The timestamp when we clicked start
let accumulatedTime = 0;    // Accumulated time in milliseconds from previous runs
let timerId = null;
let lapCounter = 0;
let laps = [];              // Array of lap time strings to save in local storage

// Helper function to format single digits with a leading zero
function formatNumber(number) {
    if (number < 10) {
        return '0' + number;
    } else {
        return number;
    }
}

// Convert raw milliseconds into a readable 00:00:00 string
function formatTime(totalMs) {
    let totalSeconds = Math.floor(totalMs / 1000);
    let seconds = totalSeconds % 60;
    let minutes = Math.floor(totalSeconds / 60) % 60;
    let hours = Math.floor(totalSeconds / 3600);
    
    return formatNumber(hours) + ':' + formatNumber(minutes) + ':' + formatNumber(seconds);
}

// Function called every second by setInterval
function tick() {
    let now = Date.now();
    let currentElapsed = accumulatedTime + (now - startTime);
    display.innerText = formatTime(currentElapsed);
}

// Save stopwatch state to localStorage
function saveState() {
    localStorage.setItem('stopwatch_isRunning', isRunning);
    localStorage.setItem('stopwatch_startTime', startTime);
    localStorage.setItem('stopwatch_accumulatedTime', accumulatedTime);
    localStorage.setItem('stopwatch_laps', JSON.stringify(laps));
}

// Load stopwatch state from localStorage on page load
function loadState() {
    let savedIsRunning = localStorage.getItem('stopwatch_isRunning');
    let savedStartTime = localStorage.getItem('stopwatch_startTime');
    let savedAccumulatedTime = localStorage.getItem('stopwatch_accumulatedTime');
    let savedLaps = localStorage.getItem('stopwatch_laps');
    
    // Restore laps if they exist
    if (savedLaps) {
        laps = JSON.parse(savedLaps);
        lapCounter = laps.length;
        
        lapsList.innerHTML = '';
        for (let i = 0; i < laps.length; i++) {
            let li = document.createElement('li');
            li.innerHTML = '<span>Lap ' + (i + 1) + '</span><span>' + laps[i] + '</span>';
            lapsList.insertBefore(li, lapsList.firstChild);
        }
    }
    
    // Restore timer execution state
    if (savedIsRunning === 'true') {
        isRunning = true;
        startTime = parseInt(savedStartTime);
        accumulatedTime = parseInt(savedAccumulatedTime);
        
        // Show correct current elapsed time immediately
        let now = Date.now();
        let currentElapsed = accumulatedTime + (now - startTime);
        display.innerText = formatTime(currentElapsed);
        
        // Start the tick interval
        timerId = setInterval(tick, 1000);
        
        // Set stop button appearance
        startStopBtn.innerText = 'Stop';
        startStopBtn.classList.remove('start');
        startStopBtn.classList.add('stop');
    } else if (savedAccumulatedTime !== null) {
        // Paused state
        isRunning = false;
        accumulatedTime = parseInt(savedAccumulatedTime);
        display.innerText = formatTime(accumulatedTime);
    }
}

// Click listener for Start / Stop button
startStopBtn.addEventListener('click', function() {
    if (isRunning === false) {
        // Start the stopwatch
        isRunning = true;
        startTime = Date.now();
        timerId = setInterval(tick, 1000);
        
        startStopBtn.innerText = 'Stop';
        startStopBtn.classList.remove('start');
        startStopBtn.classList.add('stop');
    } else {
        // Stop the stopwatch
        isRunning = false;
        clearInterval(timerId);
        accumulatedTime += Date.now() - startTime;
        
        startStopBtn.innerText = 'Start';
        startStopBtn.classList.remove('stop');
        startStopBtn.classList.add('start');
    }
    
    saveState();
});

// Click listener for Lap button
lapBtn.addEventListener('click', function() {
    let currentElapsed = accumulatedTime;
    if (isRunning === true) {
        currentElapsed += Date.now() - startTime;
    }
    
    // Only record a lap if the timer has started
    if (currentElapsed > 0) {
        lapCounter++;
        let timeString = formatTime(currentElapsed);
        
        // Save to laps array
        laps.push(timeString);
        
        // Create list item element
        let li = document.createElement('li');
        li.innerHTML = '<span>Lap ' + lapCounter + '</span><span>' + timeString + '</span>';
        
        // Add new lap to the top of the list
        lapsList.insertBefore(li, lapsList.firstChild);
        
        saveState();
    }
});

// Click listener for Reset button
resetBtn.addEventListener('click', function() {
    // Stop the interval
    clearInterval(timerId);
    
    // Reset all variables
    isRunning = false;
    startTime = 0;
    accumulatedTime = 0;
    lapCounter = 0;
    laps = [];
    
    // Reset display and buttons
    display.innerText = '00:00:00';
    startStopBtn.innerText = 'Start';
    startStopBtn.classList.remove('stop');
    startStopBtn.classList.add('start');
    lapsList.innerHTML = '';
    
    // Wipe local storage
    localStorage.removeItem('stopwatch_isRunning');
    localStorage.removeItem('stopwatch_startTime');
    localStorage.removeItem('stopwatch_accumulatedTime');
    localStorage.removeItem('stopwatch_laps');
});

// Automatically restore state on page startup
loadState();
