import { BACKEND_PORT } from './config.js';
// A helper you may want to use when uploading new images to the server.
import { fileToDataUrl } from './helpers.js';
import { changePage, apiCall } from './helpers.js';
import { populateFeed } from './job.js';

// If there is a token in the storage then log user in
if (localStorage.getItem('token')) {
    changePage('section-logged-in');
    populateFeed();
}
else {
    changePage('section-logged-out');
}