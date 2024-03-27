
const serveradress = "https://main-w02c.onrender.com/";
async function signin() {
  try {
    let username = document.getElementById("un").value;
    let password = document.getElementById("pw").value;
    console.log("Username: " + username);
    console.log("Password: " + password);

    console.log("Trying to get data...");
    const response = await fetch(serveradress + `checklogin?username=${username}&password=${password}`);
    const data = await response.json();
    console.log("Data we got: ");
    console.log(data);
    setLocalStorageItem("onetimepw", data.server);
    setLocalStorageItem("accessess", data.accessess);
    setLocalStorageItem("lastuser", username);
    displayDataBasesToChoose(data.accessess);
    return data;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}




function displayDataBasesToChoose(allitems) {

  console.log("All items: ");

  // Split the items by ","
  const itemsArray = allitems.split(',');
  console.log(itemsArray);



  // Create a div to contain the buttons
  const containerDiv = document.createElement('div');
  containerDiv.className = "choosediv";

  const backgroundlogo = document.createElement("img");
  backgroundlogo.src = "nonabackgrounds.webp";

  backgroundlogo.className = "loginlogo";

  containerDiv.appendChild(backgroundlogo);

  const headline = document.createElement('h2');
  headline.className = "accessheadline";
  headline.innerText = "Databases you have access to";
  containerDiv.appendChild(headline);

  if (itemsArray.length == 1) {
    localStorage.setItem('chosendatabase', itemsArray[0]);
    document.getElementById
    activateChoosePanel();
    containerDiv.style.display = "none";
  }

  // Create buttons for each item
  itemsArray.forEach(item => {

    const button = document.createElement('button');
    if (item != "admin") {

      button.textContent = item;
      button.className = "choosebutton";
      button.addEventListener('click', () => {
        // Set chosendatabase in localStorage to the clicked item
        localStorage.setItem('chosendatabase', item);
        // Redirect to index.html after 10 seconds
        setTimeout(() => {
          activateChoosePanel();
        }, 100); // 10000 milliseconds = 10 seconds
      });
    }
    else {
      button.textContent = "Create new chatbot";
      button.className = "choosebutton";
      button.style.background = "#ff5353";
      button.style.color = "white";
      button.addEventListener('click', () => {
        setupnewchatbot();
      });
    }


    containerDiv.appendChild(button);
  });

  // Append the container div to the body or any other parent element you want
  document.body.appendChild(containerDiv);
}

async function setupnewchatbot() {


  const containerDiv = document.createElement('div');
  containerDiv.className = "choosediv";

  const nameinput = document.createElement("input");
  nameinput.type = "text";
  nameinput.placeholder = "Company name...";
  nameinput.id = "companynameinput"
  nameinput.style.marginTop = "45px";
  nameinput.style.height = "50px";
  nameinput.style.fontSize = "20px";


  const button = document.createElement('button');

  button.textContent = "Create new chatbot";
  button.className = "choosebutton";
  button.style.background = "#ff5353";

  button.addEventListener('click', async () => {
    console.log("Setted up new chatbot");
    const companyname = document.getElementById("companynameinput").value;
    const key = getLocalStorageItem("onetimepw");
    const username = getLocalStorageItem("lastuser");
    const response = await fetch(serveradress + `newchatbot?key=${key}&chatbotname=${companyname}&username=${username}`);
    const data = await response.json();
    if(response){
      window.location.href = "backgroundslogin.html";
    }

  });

  containerDiv.appendChild(nameinput);
  containerDiv.appendChild(button);

  document.body.appendChild(containerDiv);



}
function activateChoosePanel() {
  // Split the items by ","


  // Create a div to contain the buttons
  const containerDiv = document.createElement('div');
  containerDiv.className = "choosediv2";

  const backgroundlogo = document.createElement("img");
  backgroundlogo.src = "nonabackgrounds.webp";

  backgroundlogo.className = "loginlogo";

  containerDiv.appendChild(backgroundlogo);

  const headline = document.createElement('h2');
  headline.className = "accessheadline";
  headline.innerText = "Choose what to load";
  containerDiv.appendChild(headline);

  // Create buttons for each item

  const button = document.createElement('button');
  button.textContent = "Statistics 📈";
  button.className = "choosebutton";
  button.addEventListener('click', () => {
    // Set chosendatabase in localStorage to the clicked item

    // Redirect to index.html after 10 seconds
    setTimeout(() => {
      window.location.href = "index.html";
    }, 100); // 10000 milliseconds = 10 seconds
  });

  containerDiv.appendChild(button);

  const button2 = document.createElement('button');
  button2.textContent = "Database 📊";
  button2.className = "choosebutton";
  button2.addEventListener('click', () => {
    // Set chosendatabase in localStorage to the clicked item

    // Redirect to index.html after 10 seconds
    setTimeout(() => {
      window.location.href = "nonainput.html";
    }, 100); // 10000 milliseconds = 10 seconds
  });

  containerDiv.appendChild(button2);

  // Append the container div to the body or any other parent element you want
  document.body.appendChild(containerDiv);
}

document.getElementById('loginbutton').addEventListener('click', () => {
  signin();
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
