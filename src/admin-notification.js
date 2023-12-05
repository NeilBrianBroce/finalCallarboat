import { app } from './index';
import { getFirestore, collection, getDocs, addDoc, query, where, orderBy, updateDoc, setDoc, deleteDoc, getDoc, count } from '../node_modules/firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "../node_modules/firebase/storage";

export function adminNotificationFunctions() {
    const { v4: uuidv4 } = require('uuid');
    // const bcrypt = require('bcryptjs');
    const db = getFirestore(app);
    // const auth = getAuth(app);
    const storage = getStorage(app);
    // if (localStorage.getItem('adminSessionData') === null) {
    //     // items are empty, redirect to the index page
    //     window.location.href = "index.html";
    // }
    let report_ID;

    async function fetchNotifications() {
        const notificationCol = collection(db, 'Reports');
        const querySnapshot = await getDocs(query(notificationCol, orderBy('reportDate', 'desc')));
        const dataContainer = document.getElementById('data-container');

        const reportsWithUserNames = [];

        for (const doc of querySnapshot.docs) {
            const report = doc.data();
            const userName = await fetchUserName(report.userID);

            reportsWithUserNames.push({ report, userName });
        }

        const sortedReports = reportsWithUserNames.sort((a, b) => {
            // Compare based on the original timestamps for sorting
            const timestampComparison = b.report.reportDate.seconds - a.report.reportDate.seconds;

            if (timestampComparison !== 0) {
                return timestampComparison;
            }

            // If timestamps are equal, compare based on user names
            return a.userName.localeCompare(b.userName);
        });

        // Display the sorted reports
        sortedReports.forEach(({ report, userName }) => {
            const anchorElement = document.createElement('a');
            anchorElement.id = 'cardIssued';
            anchorElement.classList.add('card', 'bg-primary', 'mb-2');

            const cardElement = document.createElement('div');
            cardElement.classList.add('card-element');

            const subjectText = document.createElement('div');
            subjectText.classList.add('subject-text');

            const userElement = document.createElement('span');
            userElement.style.fontWeight = '500';
            // userElement.innerHTML = `<p><strong><span id="userName">${userName}</span></strong></p>`;

            const subReport = document.createElement('span');
            const subject = report.subject_rep;

            subjectText.innerHTML = `<p>${subject}</p>`;

            const dateIssued = document.createElement('div');
            dateIssued.classList.add('date-issued');
            const dateTime = formatTimestamp(report.reportDate);
            dateIssued.innerHTML = `<p>${dateTime}</p>`;
            subjectText.innerHTML = `<p><strong><span id="userName">${userName}</span></strong> <span id="subjectRep">${subject}</span></p>`;

            // Append elements to build the structure
            subjectText.appendChild(userElement);
            subjectText.appendChild(subReport);
            cardElement.appendChild(subjectText);
            cardElement.appendChild(dateIssued);
            anchorElement.appendChild(cardElement);

            // Append the anchor element to the container
            dataContainer.appendChild(anchorElement);

            anchorElement.addEventListener('click', async () => {
                $('#viewReport').modal('show');
                report_ID = report.reportID;
                document.getElementById('reportDateTime').textContent = dateTime;
                document.getElementById('reportBy').textContent = userName;
                document.getElementById('reportDescription').textContent = report.rep_message;
            });
        });
    }
    fetchNotifications();

    function parseTimestampString(timestampString) {

        // Convert timestampString to string
        timestampString = String(timestampString);
        // Extract numeric values from the string
        const regexResult = timestampString.match(/(\d+)/g);

        if (!regexResult || regexResult.length !== 2) {
            console.error('Invalid timestamp string:', timestampString);
            return null;
        }

        const seconds = parseInt(regexResult[0], 10);
        const nanoseconds = parseInt(regexResult[1], 10);

        return { seconds, nanoseconds };
    }

    function formatTimestamp(timestampString) {
        const firebaseTimestamp = parseTimestampString(timestampString);

        if (!firebaseTimestamp) {
            return 'Invalid Date';
        }

        const milliseconds = firebaseTimestamp.seconds * 1000 + firebaseTimestamp.nanoseconds / 1e6;
        const date = new Date(milliseconds);

        if (!isNaN(date.getTime())) {
            // If the date is valid, format it
            const options = {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                hour12: true,
                timeZone: 'Asia/Manila'
            };

            const formatter = new Intl.DateTimeFormat('en-US', options);

            return formatter.format(date);
        } else {
            // If the date is invalid, provide a custom handling here
            console.error('Invalid timestamp:', timestampString);
            return 'Invalid Date';
        }
    }

    async function fetchUserName(userID) {
        // console.log(userID);
        try {
            const passengersQuery = query(collection(db, 'Passengers'), where('userID', '==', userID));
            const passQuerySnapshot = await getDocs(passengersQuery);

            if (!passQuerySnapshot.empty) {
                const userData = passQuerySnapshot.docs.map((doc) => doc.data().name);
                return userData[0]; // Return the first name if multiple found
            }

            const agencyQuery = query(collection(db, 'Travel_agencies'), where('agency_id', '==', userID));
            const agencyQuerySnapshot = await getDocs(agencyQuery);

            if (!agencyQuerySnapshot.empty) {
                const userData = agencyQuerySnapshot.docs.map((doc) => doc.data().companyName);
                return userData[0]; // Return the first company name if multiple found
            }

            // If no matching records found
            // return null;
        } catch (error) {
            console.error('Error fetching user data:', error);
            // return null;
        }
    }

    // DELETE REPORT
    const deleteReport = document.getElementById('deleteReport');
    if (deleteReport) {
        deleteReport.addEventListener('submit', async function (event) {
            event.preventDefault();
            try {
                const confirmDelete = confirm("Do you want to delete this report?");

                // If the user confirms the delete
                if (confirmDelete) {
                    const collectionRef = collection(db, "Reports");
                    const queryRef = query(collectionRef, where('reportID', '==', report_ID));

                    const querySnapshot = await getDocs(queryRef);

                    // Check if any documents match the search criteria
                    if (!querySnapshot.empty) {
                        // Loop through the documents and delete each one
                        querySnapshot.forEach((doc) => {
                            const reportRef = doc.ref;
                            console.log(reportRef);

                            // Use deleteDoc to delete the document
                            deleteDoc(reportRef)
                                .then(() => {
                                    console.log('Document deleted successfully');
                                    createAlert('Document deleted successfully');
                                    location.reload(true);
                                })
                                .catch((error) => {
                                    console.error('Error deleting document:', error);
                                });
                        });
                    } else {
                        console.log('Document not found');
                    }
                }
            } catch (error) {
                console.error('Error deleting report:', error);
            }
        });
    }

    // Create the alert message for successfully created
    function createAlert(message) {
        const alertDiv = document.querySelector('.alert-container');
        alertDiv.querySelector('.alert').textContent = message;
        alertDiv.style.display = 'block';

        setTimeout(function () {
            alertDiv.style.display = 'none';
        }, 3000);
    }

    // SEND MESSAGE TO EMAIL
    const sendMail = document.getElementById('composeEmail');
    if (sendMail) {
        sendMail.addEventListener('submit', function (event) {
            event.preventDefault();
            //GET DATA FROM INPUT
            const recipientEmail = document.getElementById('recipientEmail').value;
            const subjectMail = document.getElementById('subjectMail').value;
            const messageBox = document.getElementById('messageBox').value;
            sendEmail(recipientEmail, subjectMail, messageBox);
        });
    }

    // Function to send an email
    function sendEmail(recipientEmail, subjectMail, messageBox) {
        const companyName = "CallArboat";
        const yourContactInfo = "091297343221";

        let messageBody = `
            <div>
                <h2>Greetings from ${companyName}</h2>
                <h4>Dear valued customer,</h4>
                <p>${messageBox}.</p>
                <p>Best regards,<br>
                ${companyName}<br>
                ${yourContactInfo}</p>
            </div>
            `;

        Email.send({
            SecureToken: "d073d44f-dba7-40ec-90a0-45b2284aa842",
            To: recipientEmail,
            From: "callarboat@gmail.com",
            Subject: subjectMail,
            Body: messageBody
        }).then(
            message => {
                if (message === "OK") {
                    alert("Email will be sent to " + recipientEmail);
                    console.log('Email successfully sent');
                    $('#composeMsg').modal('hide');
                    createAlert('Email successfully sent');
                } else {
                    console.error("Failed to send. check configuration and email content.");
                }
            }
        );
    }
}