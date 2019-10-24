# Project 2 : FLACK!

## Web Programming with Python and JavaScript

# This project has been created by ***OM SANTOSHKUMAR MASNE*** .

### Created on 10/02/2019.
### All dates mentioned in this project are in the format: DD/MM/YYYY.

### This website is a project website created for EDX course, Web Programming with Python and JavaScript.

### This is a browser based online chat application - FLACK!

---

### USAGE:

#### Requirements:
* Install the necessary requirements: `pip install -r requirements.txt`.

#### SETUP:

* Create an environment variable `SECRET_KEY` and set its value to a random string or something else.
* This `SECRET_KEY` is needed for the flask app.

#### Type the following commands in the terminal:

For windows:
`> set FLASK_APP=application.py`

For Linux:
`$ export FLASK_APP=application.py`

Then: `flask run`

---

### The website functions as follows:

* This project is a single page application.

* The '/' route lands the user at the homepage. The website's homepage is the main (and only) interface of the chat application.

    * The user has to use a display name to use the application (if not already logged in).

    * The user's display name is stored in the local storage.

    * If the user has not logged out during last session, then the old display name is used as the current(new) display name.

    * The user can logout the application using the LOGOUT button. Once logged out, the display name is freed for other users to use.

* Once registered, the user can create a channel to chat with others using the CREATE NEW CHANNEL button. If the chosen channel name is already registered, then an alert message is displayed with an appropriate message.

* If other channels are already available, then, the user may choose them to chat with others.

* Once a channel is selected, all the old messages of that channel can be seen by the user. The name of the channel's creator is also displayed in the bottom section.

* The user can write his message in the text input field and send that to the selected channel.

* The name of sender of message and the time at which the message was sent is also displayed.

* The current limit for maximum messages in a channel is 100. After the limit is crossed, the oldest message is deleted whenever a new message is posted.

* All the registered users can be seen in the ACTIVE USERS section.

* The user also has an option to delete his message. The user needs to select the message(s) which the user wants to delete and press the DELETE MESSAGE button


A footer is also shown on index (homepage) page, displaying the name of the creator of this project and short information about the project.

Many other HTML and CSS properties are used in this project website to enhance its appearance.
This project website is also compatible with devices with small screens (screen resolution).

---

### This project uses [FLASK](https://palletsprojects.com/p/flask/).

### This project uses [BOOTSTRAP](https://getbootstrap.com).

### The background image on website's homepage is licensed under the PEXELS License. [LICENSE LINK](https://www.pexels.com/photo-license/). 
### [IMAGE LINK](https://www.pexels.com/photo/aerial-view-of-seashore-near-large-grey-rocks-853199/).
### Photograph by [Artem Beliaikin](https://www.pexels.com/@belart84).

---

## License:
### Licensed under the GNU Affero General Public License v3.0 only (AGPL-3.0-only) license.
### Copyright (c) 2019 OM SANTOSHKUMAR MASNE. All Rights Reserved.
