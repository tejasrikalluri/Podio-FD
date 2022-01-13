## PODIO App

## Overview
This app enables you to manage Podio tasks in Freshdesk.

## Description
* Create a task in Podio Organization and Workspace from a Freshdesk ticket.
* When creating a task in Podio, it automatically appends Freshdesk ticket URL to the task description.
* Link the Podio task to a Freshdesk ticket and view task details.
* Unlink a Podio task from a Freshdesk ticket.

### Folder structure explained


├── server
│   └── server.js		All the API calls (for Pipedrive and Freshdesk) written in this file.
├── README.md			This file
├── manifest.json		Contains app meta data and configuration information
├── config
│   ├── assets
│   │   ├── iparams.css		The required css for the settings page is written here.
│   │   └── iparams.js		The complete logic and the code present in the iparams.js file.
│   ├── oauth_config.json	The code behind the UI for PODIO oauth configuration page is present in the file.
│   └── iparams.html		The getConfigs and postConfigs methods, the html part for the settings page UI is present in this file.
├── app
│   ├── podio.svg		This is the PODIO icon file.
│   ├── icon.svg		This is Freshdesk icon file.
│   ├── style.css		The css for the Freshdesk logo is present in this file.
│   ├── custom.css		All the custom css present here.
│   ├── template.html		As soon as the APP is activated in Freshdesk ticket details page, we will see the UI and the html for this UI is 					present in this file.
│   ├── taskModel.html		This file contains the html part for the UI required to create a task in PODIO using the APP in Freshdesk ticket 					details page.
│   ├── handleError.js		The common error methods, closing the model, resize the APP in Freshdesk ticket details page methods or function are 					written in this file.
│   ├── linkModel.html		This file contains the html part for the UI required to link a task in PODIO to the particular Freshdesk ticket.
│   ├── task.js			The complete logic behind task creation, displaying the task information is written in this file.
│   ├── link.js			The code/logic to link a task to current Freshdesk ticket with the task choosen is written in this file.
│   └── app.js			All the logic behind displaying the task details and create, link and unlink the task from PODIO to current Freshdesk 					ticket is written here.

### Changes done in this version

	As customer reported we fix API errors in this version
