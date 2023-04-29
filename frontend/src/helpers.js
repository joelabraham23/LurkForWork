/**
 * Given a js file object representing a jpg or png image, such as one taken
 * from a html file input element, return a promise which resolves to the file
 * data as a data url.
 * More info:
 *   https://developer.mozilla.org/en-US/docs/Web/API/File
 *   https://developer.mozilla.org/en-US/docs/Web/API/FileReader
 *   https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs
 * 
 * Example Usage:
 *   const file = document.querySelector('input[type="file"]').files[0];
 *   console.log(fileToDataUrl(file));
 * @param {File} file The file to be read.
 * @return {Promise<string>} Promise which resolves to the file as a data url.
 */
export function fileToDataUrl(file) {
    const validFileTypes = [ 'image/jpeg', 'image/png', 'image/jpg' ]
    const valid = validFileTypes.find(type => type === file.type);
    // Bad data, let's walk away.
    if (!valid) {
        throw Error('provided file is not a png, jpg or jpeg image.');
    }
    
    const reader = new FileReader();
    const dataUrlPromise = new Promise((resolve,reject) => {
        reader.onerror = reject;
        reader.onload = () => resolve(reader.result);
    });
    reader.readAsDataURL(file);
    return dataUrlPromise;
}


// Hides all pages and makes the chose page shown
export const changePage = (newPage) => {
    // console.log(newPage)
    document.getElementById(newPage).classList.remove('hide');
    const newPageElement = document.getElementById(newPage)
    // Get the parent element of the given element
    const parent = newPageElement.parentNode;
    
    // Get all child elements of the parent that are <div> elements
    const siblings = Array.from(parent.children)
    
    // Hide all sibling <div> elements except for the given element
    siblings.forEach(sibling => {
        if (sibling !== newPageElement) {
        sibling.classList.add('hide');
        }
    });
}


// Displays an alert to user with a close button in the top right
export const alertUser = (message) => {
    // create container element
    const container = document.createElement('div');
    container.classList.add('popup-container');
    
    // create popup element
    const popup = document.createElement('div');
    popup.classList.add('popup');

    const popupText = document.createElement('div')
    popupText.textContent = message;
    popupText.style.width = "80%"
    
    // create close button element
    const closeButton = document.createElement('button');
    closeButton.classList.add('btn', 'btn-danger');
    closeButton.textContent = 'Close';
    closeButton.addEventListener('click', () => {
        container.remove();
    });
    
    popup.appendChild(closeButton);
    popup.appendChild(popupText);
    container.appendChild(popup);
    document.body.appendChild(container);
}


// Function that makes an apicall to the backend server
export const apiCall = (path, method, body) => {
    return new Promise((resolve, reject) => {
        let url = 'http://localhost:5020/'+ path;
        const options = {
            method: method,
            headers: {
                'Content-type': 'application/json',
            },
        };
        if (method === 'GET') {
            const queryString = Object.entries(body)
                .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
                .join("&");

            // Construct the full URL with the encoded query string
            url = `${url}?${queryString}`;
        } else {
            options.body = JSON.stringify(body);
        }
        if (localStorage.getItem('token')) {
            options.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
        }

        fetch(url, options)
        .then((response) => response.json())
        .then((data) => {
            if (data.error) {
                alertUser(data.error)
            } 
            else {
                resolve(data)
            }
        });
  });

};

