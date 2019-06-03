# 325poke
## To run
1. Clone the repository
2. From the root directory, go to ./my-app by `cd my-app`
3. Run `npm install` and `npm start`
4. This should launch the application in a browser. If not, go to http://localhost:3000

## To edit the severity calculation algorithm:
1. Go to ./my-app/src/components/SubmitReminderTable/SubmitReminderTable.js

2. Go to the function `calculateSeverity()`, which is called for each student in the function `getData()`

## Files

### MainPage (./my-app/src/pages/MainPage/MainPage.js)
- This is the homepage of the application with all the visualizations.
- Uses SubmitReminderTable component (at ./my-app/src/components/SubmitReminderTable/SubmitReminderTable.js)
- Has buttons linked to Details page (at ./my-app/src/pages/Details/Details.js) 
### ManagePage (./my-app/src/pages/ManagePage/ManagePage.js)
- This is the admin page of the application with control over time of the quarter, email format, and students. 

### Firebase Functions (./my-app/functions/index.js)
- Has all the functions to fetch data from the server and update Firebase's Realtime Database accordingly. 
- Schedules the database update and the email request through the function, `updateDatabaseAndSendEmailFinal`
