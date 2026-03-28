// copilot generated function
function updateDateTime() {
    const now = new Date();

    // Format time as HH:MM:SS
    const time = now.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    // Format date as "28 maart 2026"
    const date = now.toLocaleDateString('nl-NL', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });

    // Update elements
    const timeElement = document.querySelector('.time');
    const dateElement = document.querySelector('.date');

    if (timeElement) timeElement.textContent = time;
    if (dateElement) dateElement.textContent = date;
}

// Update immediately
updateDateTime();

// Update every second
setInterval(updateDateTime, 1000);

function helperStats() {
    fetch(`/api/helper_stats`)
        .then(response => response.json())
        .then(data => {
            const positionElement = document.querySelector('#leaderboardPosition');
            const resolvedElement = document.querySelector('#resolvedTickets');
            positionElement.textContent = data.all_time.helper_position;
            resolvedElement.textContent = data.all_time.helpers_leaderboard[0].count;
        })
        .catch(error => {
            console.error('Error fetching helper stats:', error);
        });
}

// Call the function to fetch and display helper stats
helperStats();

setInterval(helperStats, 60000);