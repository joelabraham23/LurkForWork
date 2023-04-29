import { BACKEND_PORT } from './config.js';
// A helper you may want to use when uploading new images to the server.
import { changePage, apiCall, fileToDataUrl, alertUser} from './helpers.js';
import { displayProfile } from './profile.js';

// If User wants to creata job
document.getElementById('create-job-button').addEventListener('click', () => {
    jobPopUp("POST")
})

// Populate feed on the home page
let start = 0;
export const populateFeed = (index) => {
    return new Promise((resolve, reject) => {
        const feedList = document.getElementById('feed-list');
        const page = document.getElementById('main');
        if (typeof index !== 'undefined') {
            start += index;
        }
        else { 
            start = 0;
        }
        feedList.classList.add("container")
        const payload = {start}
        apiCall('job/feed', 'GET', payload, "section-logged-in")
            .then((data) => {
            data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            for (const feedItem of data) {
            const payload = {userId: feedItem.creatorId};
            apiCall('user', 'GET', payload, "section-logged-in")
                .then((user) => {
                    feedItem.userName = user.name 
                    feedList.append(addJobToFeed(feedItem))
                })
            }
            })
            // If user is at the bottom of the page then populate another 5 more jobs to create an 
            // infinity pagignation
            window.addEventListener('scroll', () => {
                if (window.innerHeight + window.scrollY >= document.body.scrollHeight) {
                    populateFeed(5);
                }
            });
            resolve();
        })
}

// Function that returns a newJob with all the data given
export const addJobToFeed = (feedItem, isOwnUser) => {
    const newJob = document.createElement('div');
    newJob.setAttribute("id", "container-job");
    
    //Add title of job
    const title = document.createElement("h4");
    title.innerText = feedItem.title;
    title.style.display = "inline-block";
    title.style.marginRight = "8px";
    title.style.width = "90%"
    title.style.overflowWrap = "break-word"; 
    newJob.append(title);

    //Add date created of job
    const date_created = document.createElement('p');
    const date = new Date(feedItem.createdAt);
    const currentDate = new Date();
    const diffInMs = currentDate - date;
    const date_Split = (feedItem.createdAt).split('T')[0].split('-');
    const format_Date = `${date_Split[2]}/${date_Split[1]}/${date_Split[0]}`;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInMinutes < 60) {
        date_created.innerText = `Posted ${diffInMinutes} minutes ago`;
        } else if (diffInHours < 24) {
        date_created.innerText = `Posted ${diffInHours} hours and ${diffInMinutes % 60} minutes ago`;
        }
    else {
        date_created.innerText = `Posted on ${format_Date}`;
    }
    date_created.style.display = "inline-block";
    newJob.append(date_created);

    //Add Line Seperator
    const separator = document.createElement('hr');
    newJob.append(separator);
    
    //Add poster of job
    const creator = document.createElement('p');
    const creator_profile = document.createElement('span');
    creator_profile.setAttribute("class", "job-profile")
    creator_profile.dataset.userId = feedItem.creatorId;
    creator_profile.innerText = feedItem.userName;
    creator.innerText = 'Created by ';
    creator.appendChild(creator_profile);
    newJob.append(creator);

    //Add image of job
    const image = document.createElement('img');
    image.setAttribute("src", feedItem.image);
    image.setAttribute("alt", "Job Image");
    image.style.width = "100%";
    image.style.height = "100%";
    image.style.marginLeft = "-4px";
    newJob.appendChild(image);
    
    //Add start date of job
    const start_date = document.createElement('p');
    const dateSplit = (feedItem.start).split('T')[0].split('-');
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const day = parseInt(dateSplit[2]);
    // Determine the correct suffix for the day of the month
    let daySuffix;
    if (day === 1 || day === 21 || day === 31) {
    daySuffix = 'st';
    } else if (day === 2 || day === 22) {
    daySuffix = 'nd';
    } else if (day === 3 || day === 23) {
    daySuffix = 'rd';
    } else {
    daySuffix = 'th';
    }
    start_date.innerText = `Start- ${day}${daySuffix} of ${months[parseInt(dateSplit[1])-1]}, ${dateSplit[0]}`;
    newJob.appendChild(start_date);

    //Add description of job
    const description = document.createElement('p');
    description.innerText = feedItem.description;
    newJob.append(description);

    //Add Line Seperator
    const separator1 = document.createElement('hr');
    newJob.append(separator1);

    //Add likes of job
    const likes = document.createElement('p');
    const likes_hover = document.createElement('span');
    likes_hover.setAttribute("id", "like-popup");
    likes_hover.dataset.userId = feedItem.likes;
    likes_hover.innerText = Object.keys(feedItem.likes).length;
    likes.innerText = `👍 `;
    likes.style.display = "inline-block";
    const likes_section = document.createElement('div');
    likes_hover.addEventListener('click', () => {
        if (likes_section.childNodes.length > 0) {
            likes_section.innerText = "";
        }
        else {
            for (let j = 0; j < feedItem.likes.length; j++) {
                const key = feedItem.likes[j];
                const name = document.createElement('p');
                name.setAttribute("class", "job-profile")
                name.dataset.userId = key.userId;
                name.innerText = `👍 ${key.userName}`;
                likes_section.append(name);
                newJob.append(likes_section);
            }
        }
    })
    likes.appendChild(likes_hover);
    newJob.append(likes);

    //Add comments of job
    const comments = document.createElement('p');
    comments.setAttribute("id", "comment-popup");
    comments.dataset.commentsData = JSON.stringify(feedItem.comments)
    comments.innerText = `${Object.keys(feedItem.comments).length} comments`;
    comments.style.float = "right";
    comments.style.paddingRight = "5px";
    const user_comments = document.createElement('div');
    //Onclick to show/unshow comments
    comments.addEventListener('click', () => {
        if (user_comments.childNodes.length > 0) {
            user_comments.innerText = "";
        }
        else {
            for (let j = 0; j < feedItem.comments.length; j++) {
                const key = feedItem.comments[j];
                const name = document.createElement('p');
                name.setAttribute("class", "job-profile")
                name.dataset.userId = key.userId;
                name.innerText = `${key.userName}`;
                const comment = document.createElement('p');
                comment.innerText = key.comment;

                user_comments.append(name);
                user_comments.append(comment);
                newJob.append(user_comments);
            }
        }
    })
    newJob.append(comments);
    
    // If the person viewing the job is the owner of the post
    // Create a drop down menu where they can choose to edit or delete the post
    if (isOwnUser) {
        const dropDownButton = document.createElement("div");
        dropDownButton.className = "dropdown"
        dropDownButton.style.position = 'absolute';
        dropDownButton.style.top = '5px';
        dropDownButton.style.right = '0'; 
        const dropDownIcon = document.createElement('img');
        dropDownIcon.src = "imgs/three-dots-vertical.svg"
        dropDownButton.append(dropDownIcon)
        const dropDownContent = document.createElement("div");
        dropDownContent.className = "dropdown-content";
        const editJob = document.createElement("a");
        editJob.innerText = "Edit Job";
        const deleteJob = document.createElement("a");
        deleteJob.innerText = "Delete Job";
        dropDownContent.appendChild(editJob);
        dropDownContent.appendChild(deleteJob);
        dropDownButton.appendChild(dropDownIcon);
        dropDownButton.appendChild(dropDownContent);
        newJob.append(dropDownButton)
        
        // If they chose to edit the job
        editJob.addEventListener("click", () => {
            jobPopUp("PUT", feedItem.id)
        })
        // If they chose to delete the job
        deleteJob.addEventListener("click", () => {
                deleteJobPopUp(feedItem.id, feedItem.creatorId)
        })
    }            
    // Create a parent div to hold the like and comment sections side by side
    const likeComment = document.createElement("div");
    likeComment.style.display = "flex";
    likeComment.style.justifyContent = "space-between";

    const likeSection = document.createElement("div");
    likeSection.setAttribute("class", "like-comment");
    var likedAlready = false;
    for (const like of feedItem.likes) {
        if (like["userId"] = [parseInt(localStorage.getItem('userId'))]) {
            likedAlready = true;
        }
    }
    if (likedAlready) {
        likeSection.textContent =  "👎 Unlike" 
    }
    else {
        likeSection.textContent =  "👍 Like" 
    }
    likeSection.addEventListener('click', () => {
        if (likeSection.textContent === "👍 Like" ) {
            likeSection.textContent =  "👎 Unlike" 
        }
        else {
            likeSection.textContent =  "👍 Like" 
        }
        apiCall('job/like', "PUT", {
            "id": feedItem.id,
            "turnon":likeSection.textContent !== "👍 Like"
        })
    })
    
    // Create a comment section
    const commentSection = document.createElement("div");
    commentSection.innerText = "💬 Comment";
    commentSection.setAttribute("class", "like-comment");
    commentSection.setAttribute("id", "write-comment");
    commentSection.addEventListener('click', () => {
        var element =  document.getElementById('writeComment');
        if (element != null) {
            newJob.removeChild(writeComment);
        }
        else { 
            const writeComment = document.createElement("input");
            writeComment.setAttribute("id", "writeComment")
            writeComment.style.width = "100%";
            writeComment.setAttribute("placeholder", "Write a comment");
            writeComment.style.borderRadius = "20px";
            writeComment.style.padding = "5px";
            newJob.appendChild(writeComment);

            writeComment.addEventListener('keydown', (event) => {
                addComment(feedItem, event, writeComment);
            })
        }
    })
    // Append the like and comment sections to the parent div
    likeComment.appendChild(likeSection);
    likeComment.appendChild(commentSection);
    newJob.append(likeComment);

    return newJob
}

// Home button which will show the job feed
document.getElementById("lurk-for-work-logo").addEventListener('click', () => {
    const feedList = document.getElementById('feed-list');
    while (feedList.firstChild) {
        feedList.removeChild(feedList.firstChild);
    }
    populateFeed(0)
    .then(() => {
        changePage('feed');
      })
    
})


// Function that will add a comment to a given post
const addComment = (job, event, comment) => { 
    if (event.key === "Enter" && writeComment.value !== "") {
        const payload = {
            "id": job.id,
            "comment": comment.value
        }
        apiCall('job/comment', "POST", payload)
        .then( () => {
            writeComment.remove()
        })
    }
}



// Function that creates a popup to either edit or create a job
// If jobId is given then the function is to edit while if no jobId is given then it will create a job given the data
const jobPopUp = (method, jobId) => {
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
    const titleInput = document.createElement("input");
    titleInput.setAttribute("type", "text");
    titleInput.setAttribute("placeholder", "Job Title");
    titleInput.classList.add("form-control")
  
    const descriptionInput = document.createElement("input");
    descriptionInput.setAttribute("type", "text");
    descriptionInput.setAttribute("placeholder", "Job Description");
    descriptionInput.classList.add("form-control")
  
    const startDateInput = document.createElement("input");
    startDateInput.setAttribute("type", "text");
    startDateInput.setAttribute("placeholder", "Start Date (YYYY-MM-DD)");
    startDateInput.classList.add("form-control")
  
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
    form.appendChild(titleInput);
    form.appendChild(descriptionInput);
    form.appendChild(startDateInput);
    form.appendChild(imageInput);
    form.appendChild(submitButton);

    // All fields are required if the user is creating a job
    if (!jobId) {
        titleInput.setAttribute('required', true);
        descriptionInput.setAttribute('required', true);
        startDateInput.setAttribute('required', true);
        imageInput.setAttribute('required', true);
    }
  
    // Add an event listener to the form
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        try {
            // Check given date is in the correct format
            const yearRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (! yearRegex.test(startDateInput.value) && startDateInput.value) {
                alertUser("Start date must be in format YYYY-MM-DD")
            }
            // Check if its a valid date
            else if (!validDate(parseInt(startDateInput.value.split('-')[0]), parseInt(startDateInput.value.split('-')[1]), parseInt(startDateInput.value.split('-')[2]))) {
                alertUser("You must enter a valid date")
            }
            else {
                let payload = {
                    title: titleInput.value,
                    description: descriptionInput.value
                };
                if (startDateInput.value) {
                    payload['start'] = startDateInput.value + "T"
                }
                if (jobId) {
                    payload["id"] = jobId
                }
                if (imageInput.files.length == 1) {
                    fileToDataUrl(imageInput.files[0])
                    .then((dataURL) => {
                        payload.image = dataURL
                        apiCall("job", method, payload)
                        .then(() => {
                            displayProfile(localStorage.getItem('userId'))
                        })
                    })
                } 
                else {
                    apiCall("job", method, payload)
                    .then(() => {
                        displayProfile(localStorage.getItem('userId'))
                    })
                }
                // Removing the edit or create job pop up once the user has edited or created the job
                popupContainer.remove()
                darkenedEffect.remove()
                popupContainer.style.display = "none";
            }
        }
        catch (Error) {
            alertUser(Error)
        }
    });
  
    // Add the form to the popup div
    popupContainer.appendChild(form);
  
    // Add the popup container to the page
    document.body.appendChild(popupContainer);
  };


// Function that asks for confirmation if a user wants to delete a job
const deleteJobPopUp = (jobId, userId) => {
    // Create a div to hold the popup content
    const popupContainer = document.createElement("div");
    popupContainer.id = "popup-container";
    // Add darkened effect outside the container
    const darkenedEffect = document.createElement("div");
    darkenedEffect.className = "darkened-effect";
    document.body.appendChild(darkenedEffect);

    const confirmDeleteText = document.createElement("div")
    confirmDeleteText.textContent = "Are you sure you want to delete?"

    const buttonOptions = document.createElement("div")
    buttonOptions.style.display = "flex"
    buttonOptions.style.flexDirection = "row";
    buttonOptions.style.justifyContent = "space-around";

    const cancelButton = document.createElement("button")
    cancelButton.className = "btn btn-primary"
    cancelButton.textContent = "Cancel"

    const deleteButton = document.createElement("button")
    deleteButton.className = "btn btn-danger"
    deleteButton.textContent = "Delete"

    buttonOptions.appendChild(cancelButton)
    buttonOptions.appendChild(deleteButton)

    popupContainer.style.display = "flex";
    popupContainer.style.flexDirection = "column";
    popupContainer.style.justifyContent = "center";
    popupContainer.style.alignItems = "center";

    popupContainer.appendChild(confirmDeleteText)
    popupContainer.appendChild(buttonOptions)
    document.body.appendChild(popupContainer);

    // If user decides they dont want to delete the job
    cancelButton.addEventListener("click", () => {
        popupContainer.remove();
        darkenedEffect.remove();
    })

    // If they decide to delete the job
    deleteButton.addEventListener("click", () => {
        const payload = {
            "id": jobId
        }
        apiCall("job", "DELETE", payload)
        .then (() => {
            popupContainer.remove();
            darkenedEffect.remove();
            displayProfile(userId)
        })
    })

}

// Is the year, month and date given actually a valid date
function validDate(year, month, date) {
      // check if month is between 1 and 12
      if (month >= 1 && month <= 12) {
        // check if date is valid for given month
        const daysInMonth = new Date(year, month, 0).getDate();
        if (date >= 1 && date <= daysInMonth) {
          return true;
        }
      }
    return false;
}



