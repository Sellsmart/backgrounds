const wantsdatabase = getLocalStorageItem("chosendatabase");
console.log("trying to get: " + wantsdatabase);


const serveradress = "http://localhost:5102/";

// Client-side code
async function getFirebaseValueFromServer(path) {
    try {
        console.log("Trying to get data...");
        const key = getLocalStorageItem("onetimepw");
        path = wantsdatabase + "/" + path;
        const response = await fetch(`http://localhost:5102/getData?path=${path}&pw=${key}`);
        const data = await response.json();

        return data;
    } catch (error) {
        console.error("Error:", error);
        return null;
    }
}


async function setFirebaseValueFromServer(path, value) {
    try {
        console.log("Trying to get data...");
        const key = getLocalStorageItem("onetimepw");
        const response = await fetch(serveradress + "setdata", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                database: wantsdatabase,
                path: path,
                value: value,
                key: key
            })
        });
        const data = await response.json();
        console.log(data);
        return data;
    } catch (error) {
        console.error("Error:", error);
        return null;
    }
}
async function removeFirebaseValueFromServer(path) {
    try {
        console.log("Trying to remove data...");
        const key = getLocalStorageItem("onetimepw");
        const response = await fetch(serveradress + "removedata", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                database: wantsdatabase,
                path: path,
                key: key
            })
        });
        const data = await response.json();
        console.log(data);
        return data;
    } catch (error) {
        console.error("Error:", error);
        return null;
    }
}
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


async function getAllData() {
    let alldata = await getFirebaseValueFromServer("/trainingsdata");
    console.log("All data for this one: ");
    console.log(alldata);
    return alldata;
}

document.addEventListener('DOMContentLoaded', async () => {
    await populateData(); // Load your data
    addEventListeners(); // Add your event listeners after the data is loaded
    document.getElementById("topheadline").innerHTML = capitalizeFirstLetter(wantsdatabase);


    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
});

function addEventListeners() {
    const addButton = document.getElementById('showAddFormButton');
    if (addButton) {
        addButton.addEventListener('click', function () {
            document.getElementById('addPairOverlay').style.display = 'block';
        });
    } else {
        console.error('Add button not found');
    }
}


async function populateData() {
    const alldata = await getFirebaseValueFromServer('trainingsdata/informations'); // Changed to use 'informations' path
    const tableDiv = document.getElementById('variablesTable');
    tableDiv.innerHTML = ''; // Clear existing table
    const table = document.createElement('table');
    table.setAttribute('id', 'data-table');

    Object.keys(alldata || {}).forEach(key => { // Ensure alldata is not null
        const row = table.insertRow();
        const cellKey = row.insertCell(0);
        const cellValue = row.insertCell(1);
        const cellActions = row.insertCell(2); // Cell for actions like remove

        const keyInput = document.createElement('input');
        keyInput.value = key;
        keyInput.type = "text";
        keyInput.setAttribute('data-original-key', key); // Save original key
        cellKey.appendChild(keyInput);

        const valueInput = document.createElement('input');
        valueInput.type = "text";
        valueInput.value = alldata[key];
        valueInput.className = "valueinput";
        cellValue.appendChild(valueInput);

        const removeBtn = document.createElement('button');
        removeBtn.innerText = 'Remove ❎';
        removeBtn.addEventListener('click', function () { removeEntry(key); });
        cellActions.appendChild(removeBtn);
    });

    tableDiv.appendChild(table);
}

async function updateAll() {
    const table = document.getElementById('data-table');
    const rows = table.rows;

    for (let i = 0; i < rows.length; i++) {
        const originalKey = rows[i].cells[0].getElementsByTagName('input')[0].getAttribute('data-original-key');
        const currentKey = rows[i].cells[0].getElementsByTagName('input')[0].value;
        const currentValue = rows[i].cells[1].getElementsByTagName('input')[0].value;

        if (originalKey !== currentKey) { // Key changed, remove old and add new
            await removeFirebaseValueFromServer(`informations/${originalKey}`);
            await setFirebaseValueFromServer(`informations/${currentKey}`, currentValue);
        } else { // Only update the value if the key hasn't changed
            await setFirebaseValueFromServer(`informations/${currentKey}`, currentValue);
        }
    }

    alert('All changes updated!');
    await populateData(); // Reload the updated data
}

async function removeEntry(key) {
    await removeFirebaseValueFromServer(`informations/${key}`); // Use your existing function to remove the key-value pair
    await populateData(); // Refresh the data display
}



function closeOverlay() {
    document.getElementById('addPairOverlay').style.display = 'none';
}

async function addNewPair() {
    const key = document.getElementById('newKey').value;
    const value = document.getElementById('newValue').value;

    if (key && value) { // Check if key and value are not empty
        console.log("adding here: " + "informations/" + key);
        await setFirebaseValueFromServer("informations/" + key, value);
        closeOverlay();
        await populateData(); // Refresh the data display
    } else {
        alert('Both key and value are required.');
    }
}
// Update Chatbot Colors
async function updateChatbotColors() {
    const basePath = 'colors/chatbot'; // Define the base path for colors
    await setFirebaseValueFromServer(basePath + '/general', document.getElementById('generalColor').value);
    await setFirebaseValueFromServer(basePath + '/box', document.getElementById('boxColor').value);
    await setFirebaseValueFromServer(basePath + '/inputField', document.getElementById('inputFieldColor').value);
    await setFirebaseValueFromServer(basePath + '/text', document.getElementById('textColor').value);
}

// Update Logos
async function updateLogos() {
    const basePath = 'logos'; // Define the base path for logos
    await setFirebaseValueFromServer(basePath + '/logo', document.getElementById('logoLink').value);
    await setFirebaseValueFromServer(basePath + '/userImage', document.getElementById('userImageLink').value);
}

// Functions for Default Answers and Products remain mostly the same since they 
// already fit the requirement of individual entries for each value.

// Additions or modifications would primarily be around ensuring 
// that each entry in 'defaultAnswers' and 'products' is individual and not as a bulk object.



async function addDefaultAnswer() {
    const newAnswer = document.getElementById('newAnswer').value;
    if (newAnswer) {
        const newKey = `answer_${Date.now()}`; // Use current timestamp as unique key
        await setFirebaseValueFromServer(`defaultAnswers/${newKey}`, newAnswer);
        await populateAnswers(); // Refresh the list
        document.getElementById('newAnswer').value = ''; // Clear input field
    }
}

async function removeDefaultAnswer(key) {
    await removeFirebaseValueFromServer(`defaultAnswers/${key}`);
    await populateAnswers();
}
async function populateAnswers() {
    const alldata = await getAllData();  // Make sure to call this to get your updated structure
    const defaultAnswers = alldata.defaultAnswers;
    const answersList = document.getElementById('defaultAnswersList');
    answersList.innerHTML = '';  // Clear existing entries

    Object.keys(defaultAnswers || {}).forEach(key => {
        const answerDiv = document.createElement('div');
        answerDiv.innerHTML = `${defaultAnswers[key]} <button onclick="removeDefaultAnswer('${key}')" id="removebutton">Remove</button>`;
        answerDiv.className = "answerbox";
        answersList.appendChild(answerDiv);
    });
}

async function removeDefaultAnswer(key) {
    await removeFirebaseValueFromServer(`defaultAnswers/${key}`);
    await populateAnswers();  // Refresh the list
}







async function populateAllData() {
    const alldata = await getAllData(); // This function needs to exist and return the structure you provided.

    // Now, distribute this data to your UI components.
    populateChatbotColors(alldata.colors);
    populateLogos(alldata.logos);
    populateAnswers(alldata.defaultAnswers);
    populateProducts(alldata.products);
    populateinstruction(alldata);
}

// Each populate function now takes a part of the allData structure:
function populateChatbotColors(colors) {
    if (colors && colors.chatbot) {
        // Replace '-hashtag-' with '#' for proper color format
        document.getElementById('generalColor').value = colors.chatbot.general.replace('-hashtag-', '#') || '#FFFFFF';
        document.getElementById('boxColor').value = colors.chatbot.box.replace('-hashtag-', '#') || '#FFFFFF';
        document.getElementById('inputFieldColor').value = colors.chatbot.inputField.replace('-hashtag-', '#') || '#FFFFFF';
        document.getElementById('textColor').value = colors.chatbot.text.replace('-hashtag-', '#') || '#FFFFFF';


        // Apply the initial colors to the chatbot elements
        document.querySelectorAll('.app').forEach(element => {
            element.style.backgroundColor = colors.chatbot.general.replace('-hashtag-', '#') || '#FFFFFF';
        });
        document.querySelectorAll('.chatfield').forEach(element => {
            element.style.backgroundColor = colors.chatbot.box.replace('-hashtag-', '#') || '#FFFFFF';
        });
        document.querySelector('.inputfield').style.backgroundColor = colors.chatbot.inputField.replace('-hashtag-', '#') || '#FFFFFF';
        document.querySelectorAll('.chattext').forEach(element => {
            element.style.color = colors.chatbot.text.replace('-hashtag-', '#') || '#FFFFFF';
        });

    }
}


function populateLogos(logos) {
    if (logos) {
        const logo = logos.logo || '';
        const userImage = logos.userImage || '';

        // Replace placeholders with actual characters
        const formattedLogo = logo.replace(/-hashtag-/g, '#').replace(/-dot-/g, '.').replace(/-slash-/g, '/');
        const formattedUserImage = userImage.replace(/-hashtag-/g, '#').replace(/-dot-/g, '.').replace(/-slash-/g, '/');

        document.getElementById('logoLink').value = formattedLogo;
        document.getElementById('userImageLink').value = formattedUserImage;

        document.getElementById("logoimage1").src = formattedLogo;
        document.getElementById("logoimage2").src = formattedUserImage;

    }
}


function clearstring(data) {

    if(data){
        return data
        .replace("-hashtag-", "#")
        .replace(/-dot-/g, ".")
        .replace(/-slash-/g, "/")
        .replace("%3F", "?") // Replace encoded question mark
        .replace("%3D", "="); // Replace encoded equals sign
    }
    else{
        return "";
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await populateAllData(); // This replaces individual populate calls.
});
async function updateProduct(key) {
    // Retrieve the updated values from the input fields
    const updatedProduct = {
        title: document.getElementById(`${key}_title`).value,
        keywords: document.getElementById(`${key}_keywords`).value,
        image: document.getElementById(`${key}_image`).value,
        link: document.getElementById(`${key}_link`).value,
        actions: document.getElementById(`${key}_actions`).value,
        buttonText: document.getElementById(`${key}_buttonText`).value,
    };

    // Update each attribute individually in Firebase
    await setFirebaseValueFromServer(`products/${key}/title`, updatedProduct.title);
    await setFirebaseValueFromServer(`products/${key}/keywords`, updatedProduct.keywords);
    await setFirebaseValueFromServer(`products/${key}/image`, updatedProduct.image);
    await setFirebaseValueFromServer(`products/${key}/link`, updatedProduct.link);
    await setFirebaseValueFromServer(`products/${key}/actions`, updatedProduct.actions);
    await setFirebaseValueFromServer(`products/${key}/buttonText`, updatedProduct.buttonText);

    // Refresh the product list
    await populateProducts();
}
async function populateProducts() {
    const alldata = await getAllData();  // Make sure to call this to get your updated structure
    const products = alldata.products;
    const productsList = document.getElementById('productsList');
    productsList.innerHTML = '';  // Clear existing entries

    Object.keys(products || {}).forEach(key => {
        const product = products[key];
        const productDiv = document.createElement('div');
        productDiv.className = "productdiv";
        productDiv.innerHTML = `
            <div>
                Title: <input type="text" id="${key}_title" value="${clearstring(product.title)}"><br>
                Keywords: <input type="text" id="${key}_keywords" value="${clearstring(product.keywords)}"><br>
                Image URL: <input type="text" id="${key}_image" value="${clearstring(product.image)}"><br>
                Link: <input type="text" id="${key}_link" value="${clearstring(product.link)}"><br>
                Actions: <input type="text" id="${key}_actions" value="${clearstring(product.actions)}"><br>
                Button Text: <input type="text" id="${key}_buttonText" value="${clearstring(product.buttonText)}"><br>
                <button onclick="updateProduct('${key}')" class="productbutton">Update</button>
                <button onclick="removeProduct('${key}')" id="removebutton" class="productbutton">Remove</button>
            </div>
            <br>`;
        productsList.appendChild(productDiv);
    });
}
async function addProduct() {
    const product = {
        title: document.getElementById('newProductTitle').value,
        keywords: document.getElementById("newProductKeywords").value,
        image: document.getElementById('newProductImageUrl').value,
        link: document.getElementById('newProductLink').value,
        actions: document.getElementById("newProductActions").value,
        buttonText: document.getElementById('newProductButtonText').value
    };
    if (product.title && product.image && product.link && product.buttonText) {
        const newKey = `product_${Date.now()}`; // Use current timestamp as unique key
        // Save each property individually
        await setFirebaseValueFromServer(`products/${newKey}/title`, product.title);
        await setFirebaseValueFromServer(`products/${newKey}/keywords`, product.keywords);
        await setFirebaseValueFromServer(`products/${newKey}/image`, product.image);
        await setFirebaseValueFromServer(`products/${newKey}/link`, product.link);
        await setFirebaseValueFromServer(`products/${newKey}/actions`, product.actions);
        await setFirebaseValueFromServer(`products/${newKey}/buttonText`, product.buttonText);


        await populateProducts(); // Refresh the list
        // Clear input fields
        document.getElementById('newProductTitle').value = '';
        document.getElementById('newProductKeywords').value = '';
        document.getElementById('newProductImageUrl').value = '';
        document.getElementById('newProductLink').value = '';
        document.getElementById('newProductButtonText').value = '';
        document.getElementById("newProductActions").value = '';
    }
    else{
        alert("You have to fill in everything except actions and keywords");
    }
}

async function removeProduct(key) {
    await removeFirebaseValueFromServer(`products/${key}`);
    await populateProducts();  // Refresh the list
}
document.addEventListener('DOMContentLoaded', () => {
    // Listen for color changes and apply them to the chatbot
    document.getElementById('generalColor').addEventListener('change', function () {
        const color = this.value;
        document.querySelectorAll('.app').forEach(element => {
            element.style.backgroundColor = color;
        });
    });

    document.getElementById('boxColor').addEventListener('change', function () {
        const color = this.value;
        document.querySelectorAll('.chatfield').forEach(element => {
            element.style.backgroundColor = color; // Assume you have border CSS or add it
        });
    });

    document.getElementById('inputFieldColor').addEventListener('change', function () {
        const color = this.value;
        document.querySelector('.inputfield').style.backgroundColor = color;
    });

    document.getElementById('textColor').addEventListener('change', function () {
        const color = this.value;
        document.querySelectorAll('.chattext').forEach(element => {
            element.style.color = color;
        });
    });

    document.getElementById('logoLink').addEventListener('change', function () {
        const logolink = this.value;
        document.getElementById("logoimage1").src = logolink;
    });
    document.getElementById('userImageLink').addEventListener('change', function () {
        const logolink = this.value;
        document.getElementById("logoimage2").src = logolink;
    });
    // Define the options for the Intersection Observer
    const options = {
        root: null, // It means we're observing intersections with the viewport
        rootMargin: '0px',
        threshold: 0.4 // Callback is executed when 30% of the target is visible
    };

    // Define the callback function for the Intersection Observer
    const callback = (entries, observer) => {
        entries.forEach(entry => {
            // Check if the element is intersecting
            if (entry.isIntersecting) {
                // Add the animation class to the element
                entry.target.style.animation = 'flyInUnblurInput 1s forwards';
            }
        });
    };

    // Create the Intersection Observer with the callback and options
    const observer = new IntersectionObserver(callback, options);

    // Select the elements you want to observe
    const elements = document.querySelectorAll('.informationsheet, #chatbotColors, #logosSection, #defaultAnswers, #productsSection');

    // Start observing the selected elements
    elements.forEach(element => {
        observer.observe(element);
    });

});
function saveinstructions() {
    const newinstructions = document.getElementById("instructions").value;
    setFirebaseValueFromServer("general", newinstructions);
}
function populateinstruction(data) {
    document.getElementById("instructions").value = clearstring(data.general);

}


async function restartserver() {
    const response = await fetch(serveradress + "restartserver", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            key: getLocalStorageItem("onetimepw")
        })
    });

    console.log("This is the response we get: ");
    responsedata = await response.json();

    alert(responsedata.server);
}