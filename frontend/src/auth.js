import { changePage, apiCall, alertUser} from "./helpers.js";
import { populateFeed } from "./job.js";

// Function to set token and called when a user logs in
const setToLocalStorage = (token, userId) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userId', userId);
    document.getElementById("feed-list").innerText = "";
    populateFeed();
    changePage('section-logged-in')
}

// If user clicks signup button
document.getElementById('signup-button').addEventListener('click', () => {
  const payload = {
    email: document.getElementById('signup-email').value,
    password: document.getElementById('signup-password').value,
    name: document.getElementById('signup-name').value,
  }
  apiCall('auth/register', 'POST', payload)
    .then((data) => {
      setToLocalStorage(data.token, data.userId);
    });
});

// If user clicks login button send data to server
document.getElementById('login-button').addEventListener('click', () => {
    const payload = {
        email: document.getElementById('login-email').value,
        password: document.getElementById('login-password').value
    }
    apiCall('auth/login', 'POST', payload,)
    .then((data) => {
        setToLocalStorage(data.token, data.userId);
    });
});

// If the user wants to signup instead of login
document.getElementById('nav-signup').addEventListener('click', () => {
    changePage("signup-page")
});

// If the user wants to login instead of signup
document.getElementById('nav-login').addEventListener('click', () => {
    changePage("login-page")
});

// If the user wants to logout
document.getElementById('logout').addEventListener('click', () => {
    changePage('section-logged-out')
    localStorage.removeItem('token');
});

// Checking if both passwords match
document.getElementById('signup-confirm-password').addEventListener('blur', () => {
    if (document.getElementById('signup-confirm-password').value !== document.getElementById('signup-password').value) {
        alertUser("Passwords must match!")
    }
});

// If passwords dont match user cant click signup button
document.getElementById('signup-confirm-password').addEventListener('keyup', () => {
    if (document.getElementById('signup-confirm-password').value !== document.getElementById('signup-password').value) {
        document.getElementById("signup-button").disabled = true;
        document.getElementById("signup-button").classList.add("disabled");
    }    
    else {
        document.getElementById("signup-button").disabled = false;
        document.getElementById("signup-button").classList.remove("disabled");
    }
});
