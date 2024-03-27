const wantsdatabase = getLocalStorageItem("chosendatabase");
console.log("trying to get: " + wantsdatabase);
document.getElementById("topheadline").innerHTML = capitalizeFirstLetter(wantsdatabase);


function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
// Client-side code
async function getFirebaseValueFromServer(path) {
    try {
        console.log("Trying to get data...");
        const key = getLocalStorageItem("onetimepw");
        const response = await fetch(`http://localhost:5102/getData?path=${path}&pw=${key}`);
        const data = await response.json();

        return data;
    } catch (error) {
        console.error("Error:", error);
        return null;
    }
}
function clearstring(data) {
    return data
      .replace("-hashtag-", "#")
      .replace(/-dot-/g, ".")
      .replace(/-slash-/g, "/")
      .replace("%3F", "?") // Replace encoded question mark
      .replace("%3D", "="); // Replace encoded equals sign
  }
// Function to calculate the number of different IPs and total accesses
function calculateAccesses(data) {
    const ipAddresses = Object.keys(data); // Get all IP addresses
    const totalIPs = ipAddresses.length; // Count them

    let totalAccesses = 0;
    ipAddresses.forEach(ip => {
        totalAccesses += Object.keys(data[ip]).length; // Count accesses for each IP
    });

    return { totalIPs, totalAccesses };
}
function getFirstChatsBySession(data) {
    // Helper function to convert time from given format to Date object
    function convertTime(timeString) {
        const [date, time] = timeString.split(' ');
        const [day, month, year] = date.split('-dot-').map(num => parseInt(num, 10));
        const [hours, minutes, seconds] = time.split('-dot-').map(num => parseInt(num, 10));
        return new Date(year, month - 1, day, hours, minutes, seconds);
    }

    const firstChats = [];

    // Iterate through IPs
    Object.keys(data).forEach(ip => {
        // Iterate through session IDs
        Object.keys(data[ip]).forEach(sessionId => {
            let firstChat = null;
            // Iterate through chat IDs
            Object.keys(data[ip][sessionId]).forEach(chatId => {
                const chat = data[ip][sessionId][chatId];
                const chatTime = convertTime(chat['Time:']);
                // Check if it's the first chat in the session or earlier than the current first chat
                if (!firstChat || chatTime < firstChat.time) {
                    firstChat = {
                        question: chat['Question:'],
                        answer: chat['Answer:'],
                        time: chat['Time:'], // Store the original string time for display
                        actualTime: chatTime, // Store the converted time for sorting
                        location: chat['Location:'],
                        sessionId: sessionId
                    };
                }
            });
            // Add the first chat of the session to the result array
            if (firstChat) {
                firstChats.push(firstChat);
            }
        });
    });

    // Sort the first chats by actualTime (converted Date object)
    firstChats.sort((b, a) => a.actualTime - b.actualTime);

    // Return the sorted chats without the actualTime field to clean up the final output
    return firstChats.map(({ actualTime, ...keepAttrs }) => keepAttrs);
}

// Then call the function with your data


function extractRecentQuestions(allquestions) {
    const recentQuestionsArray = [];
    const currentDate = new Date();

    for (const ip in allquestions) {
        for (const id in allquestions[ip]) {
            const question = allquestions[ip][id];
            if (question["Question:"] && question["Time:"]) {
                const timeParts = question["Time:"].split(" ");
                const dateString = timeParts[0].replaceAll("-dot-", ".");
                const timeString = timeParts[1].replaceAll("-dot-", ":");
                const questionTime = `${timeString}, ${dateString}`;
                const questionData = {
                    question: question["Question:"],
                    answer: question["Answer:"],
                    location: question["Location:"],
                    time: questionTime,
                    ip: ip
                };
                recentQuestionsArray.push(questionData);
            }
        }
    }

    // Sort recent questions by time
    // Sort recent questions by time
    // Sort recent questions by time
    recentQuestionsArray.sort((a, b) => {
        const timeA = new Date(
            parseInt(a.time.substring(6, 10)),  // Year
            parseInt(a.time.substring(3, 5)) - 1,  // Month (0-indexed)
            parseInt(a.time.substring(0, 2)),  // Day
            parseInt(a.time.substring(12, 14)),  // Hour
            parseInt(a.time.substring(15, 17)),  // Minute
            parseInt(a.time.substring(18, 20))  // Second
        );
        const timeB = new Date(
            parseInt(b.time.substring(6, 10)),  // Year
            parseInt(b.time.substring(3, 5)) - 1,  // Month (0-indexed)
            parseInt(b.time.substring(0, 2)),  // Day
            parseInt(b.time.substring(12, 14)),  // Hour
            parseInt(b.time.substring(15, 17)),  // Minute
            parseInt(b.time.substring(18, 20))  // Second
        );
        return timeB - timeA;
    });



    return recentQuestionsArray;
}

function extractValues(obj) {
    const valuesArray = Object.values(obj); // Extract all values from the object
    return valuesArray;
}
function countAndSortURLs(values) {
    // Initialize an object to count occurrences
    const urlCounts = {};

    // Count each entire URL string
    values.forEach(value => {
        if (urlCounts[value]) {
            urlCounts[value]++;
        } else {
            urlCounts[value] = 1;
        }
    });

    // Convert counts object to an array of [url, count] pairs
    const sortableArray = Object.entries(urlCounts);

    // Sort the array based on count
    sortableArray.sort((a, b) => b[1] - a[1]);

    // Convert sorted array back to object
    const sortedUrlCounts = {};
    sortableArray.forEach(([url, count]) => {
        sortedUrlCounts[url] = count;
    });

    return sortedUrlCounts;
}
function processAndSortUrls(data) {
    // Decode URLs and convert counts to numbers
    const decodedData = Object.entries(data).map(([key, value]) => {
        const decodedUrl = key.replace(/-slash-/g, '/').replace(/-dot-/g, '.');
        const count = parseInt(value, 10);
        return { url: decodedUrl, count };
    });

    // Calculate total count for percentage calculation
    const totalCount = decodedData.reduce((sum, { count }) => sum + count, 0);

    // Sort by count descending
    const sortedData = decodedData.sort((a, b) => b.count - a.count);

    // Map to final form: url, count, percentage
    const result = sortedData.map(({ url, count }) => ({
        url,
        count,
        percentage: ((count / totalCount) * 100).toFixed(2) + '%' // Convert to percentage string
    }));

    return result;
}
function extractLocationsAndCalculate(data) {
    const locations = [];
    const locationCounts = {};

    // Loop through each IP
    for (const ip in data) {
        // Get the first entry for each IP
        const firstEntryId = Object.keys(data[ip])[0];
        const firstEntry = data[ip][firstEntryId];

        // Extract the location and add it to the array
        locations.push(firstEntry.Location);
    }

    // Count occurrences of each location
    locations.forEach(location => {
        if (locationCounts[location]) {
            locationCounts[location]++;
        } else {
            locationCounts[location] = 1;
        }
    });

    // Calculate total number of entries for percentage calculation
    const totalEntries = locations.length;

    // Convert counts to location, count, percentage
    const results = Object.entries(locationCounts).map(([location, count]) => {
        return {
            location: location,
            count: count,
            percentage: ((count / totalEntries) * 100).toFixed(2) + '%'
        };
    });

    // Sort results by count in descending order
    results.sort((a, b) => b.count - a.count);

    return results;
}
function populateQAData(qaData) {
    const container = document.getElementById('qaaContainer');
    container.innerHTML = ''; // Clear existing content

    // Create and append headers
    const headersDiv = document.createElement('div');
    headersDiv.className = 'qaa-headers';
    headersDiv.innerHTML = `
        <div class="questions" style="flex: 3; box-sizing: border-box;"><h3 class="questionsheader">Questions:</h3></div>
        <div class="answers" style="flex: 3; box-sizing: border-box;"><h3 class="answersheader">Answers:</h3></div>
        <div class="time" style="flex: 1; box-sizing: border-box;"><h3 class="timeheader">Time:</h3></div>
        <div class="location" style="flex: 1; box-sizing: border-box;"><h3>Location:</h3></div>
        <div class="chatid" style="flex: 1; box-sizing: border-box;"><h3 class="chatidheader"></h3></div>
    `;
    container.appendChild(headersDiv);

    // Display only the first 5 QA data items
    qaData.slice(0, 5).forEach(item => {
        const qaDiv = createQADiv(item);
        container.appendChild(qaDiv);
    });

    // Add a button to show all conversations if there are more than 5
    if (qaData.length > 5) {
        const showAllButton = document.createElement('button');
        showAllButton.textContent = 'Show all conversations';
        showAllButton.className = 'showconvosbutton';
        showAllButton.onclick = () => showAllConversations(qaData);
        container.appendChild(showAllButton);
    }
}

function createQADiv(item) {
    const qaDiv = document.createElement('div');
    qaDiv.className = 'qaa';
    qaDiv.style.width = '100%'; // Set the width of each conversation entry to 90% of the viewport width
    qaDiv.style.margin = '0 auto'; // Add this to center the divs if needed
    qaDiv.style.boxSizing = 'border-box'; // Ensures padding and border are included in the width calculation
    qaDiv.style.padding = '10px'; // Add padding for better readability (optional)
    qaDiv.style.border = '0px solid black'; // Adds a line between entries (optional)
    qaDiv.style.backgroundColor = '#f9f9f9'; // Light background for each entry (optional)
    qaDiv.style.gap = "10px"; // Adds space between entries (optional)

    // Function to trim text to the first 10 words
    function trimToTenWords(text) {
        const words = text.split(' ');
        if (words.length > 10) {
            return words.slice(0, 10).join(' ') + '...';
        }
        return text;
    }

    const questionText = trimToTenWords(item.question);
    const answerText = trimToTenWords(item.answer);

    const questionDiv = document.createElement('div');
    questionDiv.className = 'questions';
    questionDiv.innerHTML = `<p class="questiontext">❓ ${clearstring(questionText)}</p>`;

    const answerDiv = document.createElement('div');
    answerDiv.className = 'answers';
    answerDiv.innerHTML = `<p class="answertext">🎯 ${clearstring(answerText)}</p>`;

    let splittedTime = item.time.split(" ");
    let datetime = splittedTime[0].replace(/-dot-/g, '.');
    let hourtime = splittedTime[1].replace(/-dot-/g, ':');
    let formattedTime = hourtime + ", " + datetime;

    const timeDiv = document.createElement('div');
    timeDiv.className = 'time';
    timeDiv.innerHTML = `<p class="timetext"> ${formattedTime}</p>`;

    const locationDiv = document.createElement('div');
    locationDiv.className = 'location';
    locationDiv.innerHTML = `<p class="locationtext">📍 ${item.location || 'Unknown'}</p>`;

    const chatIdDiv = document.createElement('div');
    chatIdDiv.className = 'chatid';
    const showChatButton = document.createElement('button');
    showChatButton.className = "showchatbutton";
    showChatButton.textContent = 'Show';
    showChatButton.onclick = () => showPopupwithcompletechat(item.sessionId, wantsdatabase + '/questions');
    chatIdDiv.appendChild(showChatButton);

    qaDiv.appendChild(questionDiv);
    qaDiv.appendChild(answerDiv);
    qaDiv.appendChild(timeDiv);
    qaDiv.appendChild(locationDiv);
    qaDiv.appendChild(chatIdDiv);

    return qaDiv;
}


function showAllConversations(qaData) {

    const backgroundBlur = document.createElement('div');
    backgroundBlur.className = "blur";


    const overlay = document.createElement('div');
    overlay.className = "overlay";
    const header = document.createElement('h2');
    header.className = "allchatsheader";
    header.textContent = "Alle Chats von Goatfilters";
    overlay.appendChild(header);

    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.className = "closebutton"
    closeButton.onclick = () => backgroundBlur.remove();
    overlay.appendChild(closeButton);


    qaData.forEach(item => {
        const qaDiv = createQADiv(item);
        overlay.appendChild(qaDiv);
    });
    backgroundBlur.appendChild(overlay);
    document.body.appendChild(backgroundBlur);
}

async function checksocials() {



    //Activate all logins
    document.getElementById("tt").classList.add("hide");
    document.getElementById("yt").classList.add("hide");
    document.getElementById("insta").classList.add("hide");


    if (getLocalStorageItem("ytacc")) {
        if (getLocalStorageItem("ytacc") != "") {
            document.getElementById("yt").classList.add("hide");
            document.getElementById("ytsec").classList.remove("hide");
            /* getYoutubeSubscriberCount(getLocalStorageItem("ytacc")).then(subscriberCount => {
                 console.log(subscriberCount); // This should log the subscriber count
                 document.getElementById("ytcounter").innerHTML = subscriberCount.toString();
             }).catch(error => {
                 console.error('Failed to get subscriber count', error);
             });*/
        }
    }

    else {
        document.getElementById("yt").classList.remove("hide");
        document.getElementById("ytsec").classList.add("hide");
    }
    if (getLocalStorageItem("ttacc")) {
        if (getLocalStorageItem("ttacc") != "") {
            document.getElementById("tt").classList.add("hide");
            document.getElementById("ttsec").classList.remove("hide");
        }
    }
    else {
        document.getElementById("tt").classList.remove("hide");
        document.getElementById("ttsec").classList.add("hide");
    }
    if (getLocalStorageItem("instaacc")) {
        if (getLocalStorageItem("instaacc") != "") {
            document.getElementById("insta").classList.add("hide");
            document.getElementById("instasec").classList.remove("hide");
        }
    }
    else {
        document.getElementById("insta").classList.remove("hide");
        document.getElementById("instasec").classList.add("hide");
    }
    fillSocialValues();
}

function fillSocialValues() {

}
function getbackyt() {

}
function getbacktt() {

}
function getbackinsta() {

}
function setSocialYt() {
    const valuegiven = document.getElementById("ytinput").value;
    checksocials();
}
function setSocialTT() {
    const valuegiven = document.getElementById("ttinput").value;
    checksocials();
}
function setSocialInsta() {
    const valuegiven = document.getElementById("instainput").value;
    checksocials();
}




async function fetchAndLogSubscriberCount() {
    try {
        const subscriberCount = await getYoutubeSubscriberCount("AIzaSyCwyNijmACgr0W34zKAvWCbCtvnOhIHJB4", "UCX6OQ3DkcsbYNE6H8uQQuVA");
        console.log(subscriberCount);
    } catch (error) {
        console.error('Error:', error);
    }
}

fetchAndLogSubscriberCount();

async function getYoutubeSubscriberCount(apiKey, channelId) {
    const endpoint = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${apiKey}`;

    try {
        const response = await fetch(endpoint);
        const data = await response.json();

        if (data.items && data.items.length > 0) {
            const subscriberCount = data.items[0].statistics.subscriberCount;
            return subscriberCount;
        } else {
            return 'Channel not found or has no subscribers';
        }
    } catch (error) {
        console.error('Error fetching subscriber count:', error);
        return 'Failed to retrieve subscriber count';
    }
}

async function getYoutubeChannelId(apiKey, accountName) {
    const endpoint = `https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=25&q=${accountName}&type=channel&key=${apiKey}`;

    try {
        const response = await fetch(endpoint);
        const data = await response.json();

        if (data.items && data.items.length > 0) {
            return data;
        } else {
            return 'Channel not found';
        }
    } catch (error) {
        console.error('Error fetching channel ID:', error);
        return 'Failed to retrieve channel ID';
    }
}

// Example usage:
const apiKey = "AIzaSyCwyNijmACgr0W34zKAvWCbCtvnOhIHJB4"; // Replace with your actual YouTube Data API key
const accountName = "Airrack"; // Replace with the account name you want to search for
getYoutubeChannelId(apiKey, accountName)
    .then(channelId => {
        console.log("Channel Data");
        console.log(channelId);
    })
    .catch(error => {
        console.error('Error:', error);
    });





function getLocalStorageItem(key) {
    try {
        return localStorage.getItem(key);
    } catch (error) {
        console.error("Error getting local storage item:", error);
        return null;
    }
}

// Function to set a value in local storage
function setLocalStorageItem(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch (error) {
        console.error("Error setting local storage item:", error);
    }
}

// Example usage with your data

async function fetchQuestionDataAndProcess(path) {
    const allquestions = await getFirebaseValueFromServer(path);
    if (allquestions) {
        const recentQuestions = extractRecentQuestions(allquestions);
        populateQAData(getFirstChatsBySession(allquestions));
        console.log(getFirstChatsBySession(allquestions));

    } else {
        console.log("Failed to fetch data.");
    }
}
async function fetchWebsiteViewDataAndProcess(path) {
    const allviews = await getFirebaseValueFromServer(path);
    if (allviews) {

        console.log("Todays views", getTodaysViews(allviews));
        generateHTMLBlockViewsCounter(getTodaysViews(allviews));
        const result = calculateAccesses(allviews);
        console.log("Website view data:", allviews);
        console.log(`Different IPs accessed: ${result.totalIPs}`);
        console.log(`Total accesses: ${result.totalAccesses}`);
    } else {
        console.log("Failed to fetch data.");
    }
}
async function fetchWebsiteDataDevices(path) {
    const allviews = await getFirebaseValueFromServer(path);
    if (allviews) {
        console.log("DATA FOR DEVICES", allviews);
        generateHTMLBlockDevices(allviews);
    } else {
        console.log("Failed to fetch data.");
    }
}
function getTodaysViews(data) {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
    const yyyy = today.getFullYear();

    // Adjusted format to match your data: "dd-dot-mm-dot-yyyy"
    const todayStr = `${dd}-dot-${mm}-dot-${yyyy}`;

    const todaysViews = {};

    for (const ip in data) {
        const sessions = data[ip];
        for (const sessionId in sessions) {
            const session = sessions[sessionId];
            // Convert "dd-dot-mm-dot-yyyy hh-dot-mm-dot-ss" to "dd-dot-mm-dot-yyyy" and compare
            const sessionDate = session.Time.split(' ')[0]; // No need to replace, already in correct format
            if (sessionDate === todayStr) {
                if (!todaysViews[ip]) {
                    todaysViews[ip] = {};
                }
                todaysViews[ip][sessionId] = session;
            }
        }
    }

    let totalSessions = 0;
    for (const ip in todaysViews) {
        const sessions = todaysViews[ip];
        totalSessions += Object.keys(sessions).length;
    }
    return totalSessions;

}
function generateHTMLBlockViewsCounter(count) {
    document.getElementById("viewtext").innerText = "Views: " + count.toString();
}

async function fetchWebsitePathDataAndProcess(path) {
    const allpaths = await getFirebaseValueFromServer(path);
    if (allpaths) {

        console.log("Website path data:", countAndSortURLs(extractValues(allpaths)));
        generateHTMLBlockPaths(countAndSortURLs(extractValues(allpaths)));

    } else {
        console.log("Failed to fetch data.");
    }
}
async function fetchWebsiteViewsAndProcess(path) {
    const allviews = await getFirebaseValueFromServer(path);
    if (allviews) {

        console.log("Website views data each website:", allviews);
        generateHTMLBlockWebsiteViews(mapWebsiteViewsByDate(allviews));
        console.log("New user start dates");

        console.log("Mapped view dates: ");
        mappedviewdates = mapWebsiteViewsByDate(allviews);
        newuserstartdates = findNewUsersStartDates(allviews);
        mappedviewdates["New users"] = newuserstartdates;

        console.log("THIS IS MAPPEDVIEWDATES WITH ADDED");
        console.log(mappedviewdates);
        generateHTMLBlockWebsiteViewsBig(mappedviewdates);

    } else {
        console.log("Failed to fetch data.");
    }
}

function getWebsiteViewsInLastSixMonths(data) {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const views = {};

    // Iterate over each IP
    for (const ip in data) {
        // Iterate over each session
        for (const session in data[ip]) {
            const entry = data[ip][session];
            const date = convertTime(entry.time);

            console.log("THis is the time" + date);

            // Check if the entry is within the last six months
            if (date >= sixMonthsAgo) {
                const website = entry.websitename.replace(/-slash-/g, '/').replace('http:', 'https:');
                views[website] = (views[website] || 0) + 1;
            }
        }
    }

    // Convert the views object to an array of strings for display
    const viewsArray = [];
    for (const [website, count] of Object.entries(views)) {
        viewsArray.push(`${website}: ${count}`);
    }

    return viewsArray;
}
function mapWebsiteViewsByDate(data) {
    const websiteViews = {};


    // Iterate over each IP
    for (const ip in data) {
        // Iterate over each session
        for (const session in data[ip]) {
            const entry = data[ip][session];
            // Use the provided function to convert the time string to a Date object
            const date = convertTimeOnlyDate(entry.time);




            // Convert the website name to a standardized format (if needed)
            const website = entry.websitename.replace(/-slash-/g, '/'); // Adjust if more conversion is needed

            // Initialize the object for this website if it's the first time we're seeing this website
            if (!websiteViews[website]) {
                websiteViews[website] = {};
            }

            // Format the date as a string for consistency and ease of indexing
            const pad = num => num < 10 ? '0' + num : num.toString();

            const localDate = date.getDate();
            const localMonth = date.getMonth() + 1; // getMonth() returns 0-11
            const localYear = date.getFullYear();

            const dateString = `${localYear}-${pad(localMonth)}-${pad(localDate)}`;
            // Converts to 'YYYY-MM-DD'




            // Initialize or increment the count for this website on this date
            if (!websiteViews[website][dateString]) {
                websiteViews[website][dateString] = 1;
            } else {
                websiteViews[website][dateString]++;
            }
        }
    }

    return websiteViews;
}

async function fetchWebsiteLocationDataAndProcess(path) {
    const allviews = await getFirebaseValueFromServer(path);
    if (allviews) {

        console.log("Website location data:", extractLocationsAndCalculate(allviews));
        generateHTMLBlockLocations(extractLocationsAndCalculate(allviews))

    } else {
        console.log("Failed to fetch data.");
    }
}
async function fetchWebsiteDataToGetReoccuring(path) {
    const allviews = await getFirebaseValueFromServer(path);
    if (allviews) {

        console.log("Website view data raw:", analyzeSessions(allviews));
        generateHTMLBlockReoccurring(analyzeSessions(allviews));

    } else {
        console.log("Failed to fetch data.");
    }
}
async function fetchWebsiteDataProducts(path) {
    const allviews = await getFirebaseValueFromServer(path);
    if (allviews) {

        console.log("Website product data raw is", countEntriesProduct(allviews));
        generateHTMLBlockProductsChart(countEntriesProduct(allviews));

    } else {
        console.log("Failed to fetch data.");
    }
}
function analyzeSessions(data) {
    let oneSessionCount = 0;
    let multipleSessionsCount = 0;

    // Iterate over each IP
    for (const ip in data) {
        const sessions = data[ip];
        const sessionCount = Object.keys(sessions).length;

        // Count the number of IPs with one session or multiple sessions
        if (sessionCount === 1) {
            oneSessionCount++;
        } else if (sessionCount > 1) {
            multipleSessionsCount++;
        }
    }

    const totalIps = oneSessionCount + multipleSessionsCount;
    const oneSessionPercentage = totalIps > 0 ? (oneSessionCount / totalIps * 100).toFixed(2) : 0;
    const multipleSessionsPercentage = totalIps > 0 ? (multipleSessionsCount / totalIps * 100).toFixed(2) : 0;

    // Create the result object
    const result = {
        'oneSession': {
            'count': oneSessionCount,
            'percentage': `${oneSessionPercentage}%`
        },
        'multipleSessions': {
            'count': multipleSessionsCount,
            'percentage': `${multipleSessionsPercentage}%`
        }
    };

    return result;
}
function generateHTMLBlockReoccurring(data) {
    // Get the container for the chart
    const usersChartContainer = document.querySelector('.neworreoccusers');
    usersChartContainer.innerHTML = ''; // Clear existing content

    // Prepare data for the chart
    const labels = ['Single Time Users', 'Reoccurring Users'];
    const counts = [data.oneSession.count, data.multipleSessions.count];
    const percentages = [data.oneSession.percentage, data.multipleSessions.percentage];

    // Create a canvas element for the chart and append it to the container
    const canvas = document.createElement('canvas');
    usersChartContainer.appendChild(canvas);

    // Create the chart
    new Chart(canvas, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                label: 'User Sessions',
                data: counts,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)', // For single time users
                    'rgba(54, 162, 235, 0.2)'  // For reoccurring users
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)', // For single time users
                    'rgba(54, 162, 235, 1)'  // For reoccurring users
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: {
                            size: 12,
                            weight: 'bold'
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (tooltipItem) {
                            // Display the percentage in the tooltip
                            return `${tooltipItem.label}: ${percentages[tooltipItem.dataIndex]}`;
                        }
                    },
                    bodyFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    titleFont: {
                        size: 16,
                        weight: 'bold'
                    }
                }
            }
        }
    });
}
function generateHTMLBlockDevices(data) {
    // Get the container for the chart
    const devicesChartContainer = document.querySelector('.devices');
    devicesChartContainer.innerHTML = ''; // Clear existing content

    // Prepare data for the chart
    const labels = Object.keys(data);
    const counts = Object.values(data).map(value => parseInt(value));

    // Calculate the total number of devices to compute percentages
    const total = counts.reduce((acc, currentValue) => acc + currentValue, 0);
    const percentages = counts.map(count => ((count / total) * 100).toFixed(2));

    // Create a canvas element for the chart and append it to the container
    const canvas = document.createElement('canvas');
    devicesChartContainer.appendChild(canvas);

    // Create the chart
    new Chart(canvas, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                label: 'Device Types',
                data: counts,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)', // Desktop
                    'rgba(54, 162, 235, 0.2)',  // iOS
                    'rgba(255, 206, 86, 0.2)'   // Undefined
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)', // Desktop
                    'rgba(54, 162, 235, 1)',  // iOS
                    'rgba(255, 206, 86, 1)'   // Undefined
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: {
                            size: 12,
                            weight: 'bold'
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (tooltipItem) {
                            // Display the percentage in the tooltip
                            return `${tooltipItem.label}: ${percentages[tooltipItem.dataIndex]}% (${counts[tooltipItem.dataIndex]} users)`;
                        }
                    },
                    bodyFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    titleFont: {
                        size: 16,
                        weight: 'bold'
                    }
                }
            }
        }
    });
}

function generateHTMLBlockProductsChart(data) {
    const container = document.querySelector('.requestedproducts');
    container.innerHTML = ''; // Clear existing content

    const header = document.createElement('h3');
    header.classList.add('requestheader');
    header.textContent = 'Most requested products (by chat)';
    container.appendChild(header);

    const labels = Object.keys(data);
    const counts = Object.values(data);
    const backgroundColors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']; // Define colors for the chart

    const canvas = document.createElement('canvas');
    container.appendChild(canvas);

    new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                label: 'Product Requests',
                data: counts,
                backgroundColor: backgroundColors,
                borderColor: backgroundColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: {
                            size: 12,
                            weight: 'bold'
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (tooltipItem) {
                            const dataset = tooltipItem.dataset;
                            const value = dataset.data[tooltipItem.dataIndex];
                            const label = dataset.label || '';

                            return `${label}: ${value}`;
                        }
                    },
                    bodyFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    titleFont: {
                        size: 16,
                        weight: 'bold'
                    }
                }
            }
        }
    });
}
function fillMissingDates(data) {
    const endDate = new Date(); // Today
    const startDate = new Date(new Date().setMonth(endDate.getMonth() - 2)); // Two months ago

    const fillDate = new Date(startDate);

    while (fillDate <= endDate) {
        const formattedDate = fillDate.toISOString().split('T')[0]; // Format date as 'YYYY-MM-DD'

        Object.keys(data).forEach(website => {
            // If the date does not exist, initialize with 0
            if (!data[website][formattedDate]) {
                data[website][formattedDate] = 0;
            }
        });

        fillDate.setDate(fillDate.getDate() + 1); // Move to next date
    }

    return data; // Return the updated data object
}


function generateHTMLBlockWebsiteViews(data) {

    data = fillMissingDates(data);
    console.log("Data with all dates: ");
    console.log(data);

    const container = document.querySelector('.viewsperwebsite');
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    // Collect all dates and sort them
    let allDates = [];
    Object.values(data).forEach(site => {
        allDates = allDates.concat(Object.keys(site));
    });
    allDates = [...new Set(allDates)].sort(); // Remove duplicates and sort

    // Prepare datasets for each website
    const datasets = Object.entries(data).map(([website, dates]) => {
        // Create an array of data for each date, ensuring we fill in gaps with 0
        const dataForDates = allDates.map(date => dates[date] || 0);
        return {
            label: `Views for ${website.replace(/-slash-/g, '/').replace(/-dot-/g, '.').replace("https://", '').replace("http://", '')}`,
            data: dataForDates,
            fill: false,
            borderColor: randomColor(), // Assign a unique color for each dataset
            tension: 0.1
        };
    });

    // Create the line chart with combined data
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: allDates,
            datasets: datasets
        },
        options: {
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day'
                    },
                    title: {
                        display: true,
                        text: 'Date'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Views'
                    }
                }
            }
        }
    });



}

function generateHTMLBlockWebsiteViewsBig(data) {

    data = fillMissingDates(data);
    console.log("Data with all dates: ");
    console.log(data);

    const container = document.querySelector('.allwebsiteviewsbig');
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    // Collect all dates and sort them
    let allDates = [];
    Object.values(data).forEach(site => {
        allDates = allDates.concat(Object.keys(site));
    });
    allDates = [...new Set(allDates)].sort(); // Remove duplicates and sort

    // Prepare datasets for each website
    const datasets = Object.entries(data).map(([website, dates]) => {
        // Create an array of data for each date, ensuring we fill in gaps with 0
        const dataForDates = allDates.map(date => dates[date] || 0);
        return {
            label: `Views for ${website.replace(/-slash-/g, '/').replace(/-dot-/g, '.').replace("https://", '').replace("http://", '')}`,
            data: dataForDates,
            fill: false,
            borderColor: randomColor(), // Assign a unique color for each dataset
            tension: 0.1
        };
    });

    // Create the line chart with combined data
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: allDates,
            datasets: datasets
        },
        options: {
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day'
                    },
                    title: {
                        display: true,
                        text: 'Date'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Views'
                    }
                }
            }
        }
    });



}
function randomColor() {
    // Generate a random color for the chart lines
    return 'rgb(' + (Math.floor(Math.random() * 256)) + ', ' +
        (Math.floor(Math.random() * 256)) + ', ' +
        (Math.floor(Math.random() * 256)) + ')';
}
function generateHTMLBlockPaths(data) {
    const pathsHeader = document.querySelector('.pathsheader');
    pathsHeader.textContent = "Most used paths";

    const mostUsedPaths = document.querySelector('.mostusedpaths');

    // Clear existing content
    mostUsedPaths.innerHTML = ''; // This will remove all child nodes currently in the mostUsedPaths element

    // Preparing data for the chart
    const labels = [];
    const counts = [];
    const backgroundColors = []; // Array to hold background colors for each slice
    const pathNames = Object.keys(data);
    pathNames.forEach((path, index) => {
        // Use 'path' followed by its index in the dataset
        const formattedPath = `path${index + 1}`;
        labels.push(formattedPath); // Add the formatted path to the labels array
        counts.push(data[path]); // Add the count to the counts array
        // Generate a random color for each slice
        const color = `hsl(${360 * Math.random()}, 70%, 70%)`; // This generates a random hue with fixed saturation and lightness
        backgroundColors.push(color); // Add generated color to array
    });

    // Create a canvas element for the chart and append it to mostUsedPaths
    const canvas = document.createElement('canvas');
    mostUsedPaths.appendChild(canvas);

    // Create the chart
    const chart = new Chart(canvas, {
        type: 'doughnut', // Change the type to 'pie'
        data: {
            labels: labels,
            datasets: [{
                label: 'Count', // Label for the data
                data: counts,
                backgroundColor: backgroundColors, // Use the array of generated colors
                borderColor: '#fff', // Common practice is to have white borders for pie charts
                borderWidth: 2 // Slightly thicker border for better separation
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true, // Show the legend for pie charts
                    position: 'bottom' // Position the legend at the bottom
                },
                tooltip: {
                    callbacks: {
                        label: function (tooltipItem) {
                            let label = tooltipItem.label || '';
                            if (label) {
                                label += ': ';
                            }
                            const total = tooltipItem.dataset.data.reduce((total, current) => total + current, 0);
                            const currentValue = tooltipItem.dataset.data[tooltipItem.dataIndex];
                            const percentage = ((currentValue / total) * 100).toFixed(2); // Round to two decimal places
                            label += `${currentValue} (${percentage}%)`;
                            return label;
                        }
                    },
                    bodyFont: {
                        size: 10, // Adjust as needed
                        weight: 'bold' // Make tooltip text bold
                    },
                    titleFont: {
                        size: 12, // Adjust as needed
                        weight: 'bold' // Make tooltip title bold
                    }
                }
            }
        }

    });

    const legend = document.createElement('div');
    legend.classList.add('legend');

    // Add legend items for each property
    pathNames.forEach((path, index) => {
        const legendItem = document.createElement('div');
        legendItem.classList.add('websitenameblock');

        const labelSpan = document.createElement('p');
        labelSpan.classList.add('viewwebsitetext');
        labelSpan.textContent = `Path ${index + 1} : ${path.replace(/-slash-/g, '/').replace(/-dot-/g, '.').replace("https://", '').replace("http://", '')}`;
        legendItem.appendChild(labelSpan);

        legend.appendChild(legendItem);
    });
    mostUsedPaths.appendChild(legend);
}

function generateHTMLBlockLocations(data) {
    const locationHeader = document.querySelector('.locationheader');
    locationHeader.textContent = "Views per location";

    const locationsContainer = document.querySelector('.locations');

    // Clear existing content
    locationsContainer.innerHTML = ''; // This will remove all child nodes currently in the locationsContainer element

    // Preparing data for the chart
    const labels = [];
    const counts = [];
    data.forEach((entry, index) => {
        labels.push(entry.location); // Add the location to the labels array
        counts.push(entry.count); // Add the count to the counts array
    });

    // Create a canvas element for the chart and append it to locationsContainer
    const canvas = document.createElement('canvas');
    locationsContainer.appendChild(canvas);

    // Create the chart
    new Chart(canvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Count',
                data: counts,
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false // Hide the built-in legend
                },
                tooltip: {
                    bodyFont: {
                        size: 10, // Adjust as needed
                        weight: 'bold' // Make tooltip text bold
                    },
                    titleFont: {
                        size: 12, // Adjust as needed
                        weight: 'bold' // Make tooltip title bold
                    }
                }
            },
            layout: {
                padding: {
                    bottom: 50 // Add padding at the bottom to ensure the legend does not overlap with anything else
                }
            }
        }
    });
}

async function showPopupwithcompletechat(sessionid, path) {
    const completeChat = await getFirebaseValueFromServer(path);

    if (completeChat) {
        let chatsArray = [];

        // Iterate over the IPs
        Object.keys(completeChat).forEach(ip => {
            // Check if the session id exists under this IP
            const session = completeChat[ip][sessionid];
            if (session) {
                // If the session exists, iterate over the chats within this session
                Object.keys(session).forEach(chatId => {
                    const chat = session[chatId];
                    const chatTime = convertTime(chat['Time:']);
                    chatsArray.push({
                        question: chat['Question:'],
                        answer: chat['Answer:'],
                        time: chatTime
                    });
                });
            }
        });

        // Sort the chats by time
        chatsArray.sort((a, b) => a.time - b.time);

        // Create and show the overlay with the chat content
        showChatOverlay(chatsArray);
    } else {
        console.log('No data found for the given path.');
    }
}

function convertTime(timeString) {
    const [date, time] = timeString.split(' ');
    const [day, month, year] = date.split('-dot-').map(num => parseInt(num, 10));
    const [hours, minutes, seconds] = time.split('-dot-').map(num => parseInt(num, 10));
    return new Date(year, month - 1, day, hours, minutes, seconds);
}
function convertTimeOnlyDate(timeString) {

    const [date, time] = timeString.split(' ');
    const [day, month, year] = date.split('-dot-').map(num => parseInt(num, 10));

    return new Date(year, month - 1, day);
}

function showChatOverlay(chatsArray) {
    const overlay = document.createElement('div');
    overlay.className = "entirechatoverlay";


    const chatContainer = document.createElement('div');
    chatContainer.className = "chatcontainerentirechat";

    const entirechatheader = document.createElement("h3");
    entirechatheader.className = "entirechatheader";
    entirechatheader.innerText = "Entire chat";
    chatContainer.appendChild(entirechatheader);


    chatsArray.forEach(chat => {
        const chatDiv = document.createElement('div');
        chatDiv.innerHTML = `<p class="questionentirechat"><strong>❓</strong> ${clearstring(chat.question)}</p><p class="answerentirechat">${clearstring(chat.answer)} </p><strong class="entirechatanswerheader">: 🤖</strong>`;
        chatDiv.className = 'entirechatblock';
        chatContainer.appendChild(chatDiv);
    });

    overlay.appendChild(chatContainer);

    // Close overlay on click
    overlay.addEventListener('click', () => {
        overlay.remove();
    });

    document.body.appendChild(overlay);
}
function showEntireViewsWebsite(websitedata) {
    const overlay = document.createElement('div');
    overlay.className = "entirechatoverlay";

    data = fillMissingDates(data);
    console.log("Data with all dates: ");
    console.log(data);

    const container = overlay;
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    // Collect all dates and sort them
    let allDates = [];
    Object.values(data).forEach(site => {
        allDates = allDates.concat(Object.keys(site));
    });
    allDates = [...new Set(allDates)].sort(); // Remove duplicates and sort

    // Prepare datasets for each website
    const datasets = Object.entries(data).map(([website, dates]) => {
        // Create an array of data for each date, ensuring we fill in gaps with 0
        const dataForDates = allDates.map(date => dates[date] || 0);
        return {
            label: `Views for ${website}`,
            data: dataForDates,
            fill: false,
            borderColor: randomColor(), // Assign a unique color for each dataset
            tension: 0.1
        };
    });

    // Create the line chart with combined data
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: allDates,
            datasets: datasets
        },
        options: {
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day'
                    },
                    title: {
                        display: true,
                        text: 'Date'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Views'
                    }
                }
            }
        }
    });


    // Close overlay on click
    overlay.addEventListener('click', () => {
        overlay.remove();
    });

    document.body.appendChild(overlay);
}

function findNewUsersStartDates(data) {
    // Helper function to convert date format from "dd-dot-mm-dot-yyyy" to "dd-mm-yyyy"
    const convertDate = (dateStr) => {
        return dateStr.replace(new RegExp('dot', 'g'), '-');
    };

    let userFirstSeen = {};

    // Iterate through each IP and find the earliest date
    for (const ip in data) {
        let dates = Object.values(data[ip]).map(session => convertDate(session.time.split(' ')[0]));
        let earliestDate = dates.reduce((a, b) => a < b ? a : b); // Find the earliest date
        userFirstSeen[earliestDate] = (userFirstSeen[earliestDate] || 0) + 1;
    }
    for (let key in userFirstSeen) {
        if (userFirstSeen.hasOwnProperty(key)) {
            const modifiedKey = key.replace(/---/g, "-");
            userFirstSeen[modifiedKey] = userFirstSeen[key];
            delete userFirstSeen[key];
        }
    }
    const updatedObject = {};

    for (let key in userFirstSeen) {
        if (userFirstSeen.hasOwnProperty(key)) {
            const parts = key.split('-'); // Split the key into date parts
            const reversedKey = parts.reverse().join('-'); // Reverse the date parts and join them back together
            updatedObject[reversedKey] = userFirstSeen[key];
        }
    }
    return updatedObject;
}


function countEntriesProduct(obj) {
    const counts = {};

    for (const product in obj) {
        const entries = obj[product];
        let totalCount = 0;

        for (const ip in entries) {
            const ipEntries = entries[ip];
            totalCount += Object.keys(ipEntries).length;
        }

        counts[product] = totalCount;
    }

    return counts;
}
document.getElementById('showChartButton').addEventListener('click', () => {
    document.getElementById("bigoverlay").style.display = "block";
});

document.getElementById('closebigviews').addEventListener('click', () => {
    document.getElementById("bigoverlay").style.display = "none";
});




fetchQuestionDataAndProcess(wantsdatabase + "/questions");
fetchWebsiteViewDataAndProcess(wantsdatabase + "/views");
fetchWebsitePathDataAndProcess(wantsdatabase + "/paths");
fetchWebsiteViewsAndProcess(wantsdatabase + "/websites");
fetchWebsiteLocationDataAndProcess(wantsdatabase + "/views");
fetchWebsiteDataToGetReoccuring(wantsdatabase + "/views");
fetchWebsiteDataProducts(wantsdatabase + "/products");
fetchWebsiteDataDevices(wantsdatabase + "/devicetype");
checksocials();
















//Animations
// Function to add animation with delay
document.addEventListener('DOMContentLoaded', (event) => {
    // Function to handle "Ansehen..." button click for TikTok
    document.getElementById("ttbutton").addEventListener("click", function () {
        const valuegiven = document.getElementById("ttinput").value;
        console.log(valuegiven);
        setLocalStorageItem("ttacc", valuegiven);
        checksocials();
    });

    // Function to handle "Ansehen..." button click for YouTube
    document.getElementById("ytbutton").addEventListener("click", function () {
        const valuegiven = document.getElementById("ytinput").value;
        console.log(valuegiven);
        setLocalStorageItem("ytacc", valuegiven);
        checksocials();
    });

    // Function to handle "Ansehen..." button click for Instagram
    document.getElementById("instabutton").addEventListener("click", function () {
        const valuegiven = document.getElementById("instainput").value;
        console.log(valuegiven);
        setLocalStorageItem("instaacc", valuegiven);
        checksocials();
    });
    // Function to handle "Ansehen..." button click for TikTok
    document.getElementById("ttback").addEventListener("click", function () {

        setLocalStorageItem("ttacc", "");
        checksocials();
    });

    // Function to handle "Ansehen..." button click for YouTube
    document.getElementById("ytback").addEventListener("click", function () {
        setLocalStorageItem("ytacc", "");
        checksocials();
    });

    // Function to handle "Ansehen..." button click for Instagram
    document.getElementById("instaback").addEventListener("click", function () {

        setLocalStorageItem("instaacc", "");
        checksocials();
    });


    // Set a timeout to delay the start of the script
    setTimeout(() => {
        // Function to add animation with delay
        // Function to add animation with delay
        function addAnimation(element, delay) {
            element.style.animation = `flyInUnblurThrees 1s forwards ${delay}s`;
            element.addEventListener('animationend', () => {
                // Animation has ended, you can run your JS here
                console.log(element.className + ' animation ended');
                // If you have specific functionality to trigger, do it here
            });
        }


        // Callback for Intersection Observer
        const callback = (entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
                    // Get the class name of the observed element
                    const className = entry.target.className;

                    // Set the delay based on the class name
                    let delay = 0;
                    switch (className) {
                        case 'viewsperwebsite':
                            addAnimation(document.querySelector('.viewsperwebsite'), 0);
                            addAnimation(document.querySelector('.requestedproducts'), 0.4);
                            addAnimation(document.querySelector('.devices'), 0.8);
                            break;

                        case 'locations':
                            addAnimation(document.querySelector('.locations'), 0);
                            addAnimation(document.querySelector('.mostusedpaths'), 0.4);
                            addAnimation(document.querySelector('.neworreoccusers'), 0.8);

                            break;

                    }


                    // Add the animation with the determined delay


                    // Unobserve the element since animation has been added
                    observer.unobserve(entry.target);
                }
            });
        };

        // Set up the Intersection Observer
        const options = {
            threshold: 0.3 // Trigger when 30% of the element is visible
        };

        const observer = new IntersectionObserver(callback, options);

        // Target elements to observe
        document.querySelectorAll('.viewsperwebsite, .locations').forEach((element) => {
            observer.observe(element);
        });
    }, 2000); // Delay in milliseconds
});
