import { apiCall, changePage, fileToDataUrl } from "./helpers.js";
import { alertUser } from "./helpers.js";
import { populateFeed, addJobToFeed} from "./job.js";

// Function that will display a users profile given their id
export const displayProfile = (userId) => {
    // Retrieving all the data on user given userId
    apiCall("user", "GET", {
        "userId": userId
    }). then ((data) => {
        const isOwnUser = data.id === parseInt(localStorage.getItem('userId'));
        // If there already is a profile on page delete it
        if (document.getElementById('profile-page')) {
            document.getElementById('profile-page').remove();
        }
        const profilePage = document.createElement("div");
        const loggedIn = document.getElementById("section-logged-in")
        loggedIn.appendChild(profilePage)
        profilePage.id = "profile-page"
        const newProfileContent = document.createElement("div")
        newProfileContent.id = "profile-content"
    
        // Container for userInfo
        const userInfoContainer = document.createElement('div');
        userInfoContainer.style.margin = '10px';
        // Sourcing the image for the profile and if there is no image show blank profile image
        const imageElement = document.createElement('img');
        imageElement.setAttribute("alt", "Profile Picture");
        if (data.image) {
            imageElement.src = data.image;
        }
        else {
            imageElement.src = "imgs/blank_profile.webp"
        }
        imageElement.width = 50;
        imageElement.height = 50;
        userInfoContainer.appendChild(imageElement);
        const nameElement = document.createElement('h2');
        nameElement.textContent = data.name;
        userInfoContainer.appendChild(nameElement);
        const emailElement = document.createElement('p');
        emailElement.textContent = data.email;
        userInfoContainer.appendChild(emailElement);
    
        // If ownUser then allow user to have option to edit their profile
        if (isOwnUser) {
            const editButton = document.createElement('button');
            editButton.id = "edit-profile-button"
            editButton.classList.add('btn', 'btn-primary');
    
            const editIcon = document.createElement('img');
            editIcon.src = "imgs/pencil-square.svg";
            editButton.appendChild(editIcon);
            const editText = document.createElement("div")
            editText.textContent = "Edit Profile"
            editText.style = "color: white"
            editButton.appendChild(editText)
            userInfoContainer.appendChild(editButton)

            editButton.addEventListener("click", () => {
                editProfilePopUp()
            })
        }
        // If not ownUser then give user option to watch or unwatch the profile they are watching
        else {
            const watchUserButton = document.createElement('button');
            watchUserButton.id = "watch-user-button";
            watchUserButton.classList.add('btn', 'btn-primary');
            const watchingAlready = data.watcheeUserIds.includes(parseInt(localStorage.getItem('userId')))
            if (watchingAlready) 
            {
                watchUserButton.textContent = "Unwatch"
            }
            else {
                watchUserButton.textContent = "Watch"
            }
            userInfoContainer.appendChild(watchUserButton)
            watchUserButton.addEventListener("click", () => {
                if (watchUserButton.textContent === "Watch") {
                    watchUserButton.textContent = "Unwatch"
                }
                else {
                    watchUserButton.textContent = "Watch"
                }
                apiCall("user/watch", "PUT", {
                    "email": data.email,
                    "turnon": watchUserButton.textContent !== "Watch"
                })
                .then (() => {
                    populateFeed(0)
                    displayProfile(data.id)
                })
            })
            
        }
        
        
        // Container for people that are watching the user
        const watchedByContainer = document.createElement('div');
        watchedByContainer.classList.add("container")
        const watchedByTitle = document.createElement('h4');
        watchedByTitle.textContent = "Watched By";
        watchedByContainer.appendChild(watchedByTitle);
        // If there are no users watching the specified user
        if (data.watcheeUserIds.length === 0) {
            const watcheeUsers = document.createElement('div');
            watcheeUsers.textContent = "No Users currently watching"
            watchedByContainer.appendChild(watcheeUsers);
        }
        else {
            // Going through all the user ids given then performing an apicall to find their names given the userID
            data.watcheeUserIds.forEach((key, value) => {
                const watcheeUser = document.createElement('li'); 
                watcheeUser.dataset.userId = key    
                watcheeUser.setAttribute("class", "job-profile")       
                const payload = {
                    userId: key
                }
                apiCall('user', "GET", payload)
                .then((data) => {
                    watcheeUser.textContent = data.name
                    watchedByContainer.appendChild(watcheeUser)
                })
            });
            // Total number of watchees for the profile
            const totalNumWatchees = document.createElement("div");
            totalNumWatchees.textContent = `Total number of watchees = ${data.watcheeUserIds.length}`
            watchedByContainer.appendChild(totalNumWatchees)
        }
    
        // Container for jobs posted by user
        const jobsPostedContainer = document.createElement('div');
        jobsPostedContainer.classList.add("container")
        const jobsPostedTitle = document.createElement('h4');
        jobsPostedTitle.textContent = "Jobs posted";
        jobsPostedContainer.appendChild(jobsPostedTitle);
        // If there are no users watching the specified user
        if (data.jobs.length === 0) {
            const jobsPosted = document.createElement('div');
            jobsPosted.textContent = `No jobs posted by ${data.name} yet`
            jobsPostedContainer.appendChild(jobsPosted);
        }
        else {
            data.jobs.forEach((job) => {
                job.userName = data.name;
                jobsPostedContainer.appendChild(addJobToFeed(job, isOwnUser))
            })
        }
    
        newProfileContent.appendChild(userInfoContainer);
        newProfileContent.appendChild(watchedByContainer);
        newProfileContent.appendChild(jobsPostedContainer);
        profilePage.appendChild(newProfileContent);
        changePage('profile-page')
    })
}

// Gives user option to edit their own profile 
const editProfilePopUp = () => {
    // Create a div to hold the popup content
    const popupContainer = document.createElement("div");
    popupContainer.id = "popup-container";
    // Add darkened effect outside the container
    const darkenedEffect = document.createElement("div");
    darkenedEffect.className = "darkened-effect";
    document.body.appendChild(darkenedEffect);

    const closeButton = document.createElement("button");
    closeButton.className = "btn-close"
    closeButton.setAttribute("aria-label","Close")
    closeButton.type = "button";
    closeButton.style.position = "absolute";
    closeButton.style.top = "-20px";
    closeButton.style.right = "0px";
    closeButton.addEventListener("click", () => {
        popupContainer.remove();
        darkenedEffect.remove()
    });
    popupContainer.appendChild(closeButton);

    // Create a form element
    const form = document.createElement("form");
  
    // Create input fields for email, password, name, and image
    const emailInput = document.createElement("input");
    emailInput.setAttribute("type", "email");
    emailInput.setAttribute("placeholder", "Email");
    emailInput.classList.add("form-control")
  
    const passwordInput = document.createElement("input");
    passwordInput.setAttribute("type", "password");
    passwordInput.setAttribute("placeholder", "Password");
    passwordInput.classList.add("form-control")
  
    const nameInput = document.createElement("input");
    nameInput.setAttribute("type", "text");
    nameInput.setAttribute("placeholder", "Name");
    nameInput.classList.add("form-control")
  
    const imageInput = document.createElement("input");
    imageInput.setAttribute("type", "file");
    imageInput.setAttribute("placeholder", "Image");
    imageInput.classList.add("form-control")

    const submitButton = document.createElement("button");
    submitButton.textContent = "Submit";
    submitButton.type = "submit";
    submitButton.className = "btn btn-primary"
    submitButton.style.marginTop = "10px"
    
  
    // Add the input fields and submit button to the form
    form.appendChild(emailInput);
    form.appendChild(passwordInput);
    form.appendChild(nameInput);
    form.appendChild(imageInput);
    form.appendChild(submitButton);
  
    // Add an event listener to the form
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      // Get the values from the input fields
      try {
        let payload = {
            email: emailInput.value,
            password: passwordInput.value,
            name: nameInput.value
        };
          
        if (imageInput.files.length == 1) {
            fileToDataUrl(imageInput.files[0])
            .then((dataURL) => {
                payload.image = dataURL
                apiCall("user", "PUT", payload)
                .then(() => {
                    displayProfile(localStorage.getItem('userId'))
                })
            })
        } 
        else {
            apiCall("user", "PUT", payload)
            .then(() => {
                displayProfile(localStorage.getItem('userId'))
            })
        }
        popupContainer.remove()
        darkenedEffect.remove()
        popupContainer.style.display = "none";
      }
      catch (Error) {
        alertUser(Error)
      }
      // Remove the popup from the container

    });
  
    // Add the form to the popup div
    popupContainer.appendChild(form);
  
    // Add the popup container to the page
    document.body.appendChild(popupContainer);
  };


// If user clicks on profile button to view his own profile
document.getElementById("own-profile-button").addEventListener('click', () => {
    displayProfile(localStorage.getItem('userId'))
});



document.addEventListener('click', (event) => {
    // Check if the clicked element is one of the profile links
    if (event.target.matches('.job-profile')) {
        displayProfile(event.target.dataset.userId)
    }

});

// User can follow a user given their email
// the input can be seen in the job feed page
const jobFeedHeader = document.getElementById('job-feed-header');

const watchUserEmail = document.createElement('div');
watchUserEmail.classList.add('input-group', 'mb-3');
watchUserEmail.id = "watch-user-email-input"
jobFeedHeader.appendChild(watchUserEmail);

const watchUserEmailPrepend = document.createElement('div');
watchUserEmailPrepend.classList.add('input-group-prepend');
watchUserEmail.appendChild(watchUserEmailPrepend);

const watchUserEmailButton = document.createElement('button');
watchUserEmailButton.classList.add('btn', 'btn-primary');
watchUserEmailButton.setAttribute('type', 'button');
watchUserEmailButton.textContent = 'Watch User';
watchUserEmailButton.id = "watch-user-email-Button"
watchUserEmailPrepend.appendChild(watchUserEmailButton);

const WatcheeEmailInput = document.createElement('input');
WatcheeEmailInput.setAttribute('type', 'email');
WatcheeEmailInput.classList.add('form-control');
WatcheeEmailInput.id = "watchee-email-input"
WatcheeEmailInput.setAttribute('placeholder', 'email Adress');
WatcheeEmailInput.setAttribute('aria-label', '');
WatcheeEmailInput.setAttribute('aria-describedby', 'basic-addon1');
watchUserEmail.appendChild(WatcheeEmailInput);

document.getElementById("watch-user-email-Button").addEventListener('click', ()=> {
    let payload = {
        "email": WatcheeEmailInput.value,
        "turnon": true
    }
    apiCall("user/watch", "PUT", payload)
    .then(
        populateFeed(0)
    )
    .catch(error => {
        alertUser(error)
    })
})