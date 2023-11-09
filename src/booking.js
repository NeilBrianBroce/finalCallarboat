import {initializeApp} from '../node_modules/firebase/app'
import { getFirestore, collection, getDocs, addDoc, getDoc, query, where, orderBy, doc, deleteDoc, setDoc } from '../node_modules/firebase/firestore';
import { getStorage, ref, getDownloadURL } from '../node_modules/firebase/storage';

export function bookingFunctions() {
    const { v4: uuidv4 } = require('uuid');
    const moment = require('moment');

    const firebaseConfig = {
      apiKey: "AIzaSyAUWz7jfrt46iBvAnZ-AESn8kNmqtbTlmw",
      authDomain: "callarboat-19b3b.firebaseapp.com",
      databaseURL: "https://callarboat-19b3b-default-rtdb.asia-southeast1.firebasedatabase.app",
      projectId: "callarboat-19b3b",
      storageBucket: "callarboat-19b3b.appspot.com",
      messagingSenderId: "68894973461",
      appId: "1:68894973461:web:008be388c45659cb7d781c", 
      measurementId: "G-F86YXR2HNM"
    }

    //init firebase app
    initializeApp(firebaseConfig);

    // Initialize Firestore
  const db = getFirestore();
  const storage = getStorage();

  const bookingColRef = collection(db, 'Medallion-BookedTicket');

  // Function to retrieve data and populate the table
  async function populateBookings() {
    const tbody = document.getElementById('tbody1');

    // Clear existing table rows
    tbody.innerHTML = '';

    try {
      const orderedQuery = query(bookingColRef, orderBy('Date', 'desc'));
      const querySnapshot = await getDocs(orderedQuery);
      querySnapshot.forEach((doc) => {
        const data = doc.data();

        const row = document.createElement('tr');

        // Create table cells for each column
        const cell1 = document.createElement('td');
        cell1.textContent = data.Name;
        row.appendChild(cell1);

        const cell2 = document.createElement('td');
        cell2.textContent = data.companyName;
        row.appendChild(cell2);

        const cell3 = document.createElement('td');
        cell3.textContent = data.Destination;
        row.appendChild(cell3);

        const cell4 = document.createElement('td');
        // const date = new Date(data.dateIssued);
        // const formattedDate = date.toLocaleDateString('en-US', {
        //   month: '2-digit',
        //   day: '2-digit',
        //   year: '2-digit',
        //   hour: '2-digit',
        //   minute: '2-digit',
        //   second: '2-digit',
        // });

        const date = data.dateIssued.toDate();
        const formattedDate = moment(date).format('MMMM DD, YYYY HH:mm:ss');

        cell4.textContent = formattedDate;
        row.appendChild(cell4);

        const cell5 = document.createElement('td');
        cell5.textContent = data.AccomType;
        row.appendChild(cell5);

        const cell6 = document.createElement('td');
        cell6.textContent = data.TicketType;
        row.appendChild(cell6);

        const cell7 = document.createElement('td');

        const viewIDButton = document.createElement('button');
        viewIDButton.textContent = 'View ID';
        viewIDButton.classList.add('btn', 'btn-primary');
        viewIDButton.addEventListener('click', function (event) {
          $("#viewIDModal").modal("show");
          var modalBody = document.getElementById('viewIDModalBody');
          var img = document.createElement('img');
          img.style.width = '100%';
          img.src=data.ImageUrl;
          modalBody.appendChild(img);

          const approveButton = document.createElement('button');
          approveButton.textContent = 'Approve';
          approveButton.classList.add('btn', 'btn-success');
          approveButton.addEventListener('click', function (event) {
            // approveButton()
          });

          const disapproveButton = document.createElement('button');
          disapproveButton.textContent = 'Disapprove';
          disapproveButton.classList.add('btn', 'btn-danger');
          disapproveButton.addEventListener('click', function (event) {
            // disapproveButton()
          });

          modalBody.appendChild(approveButton);
          modalBody.appendChild(disapproveButton);
        })

        cell7.appendChild(viewIDButton);
        row.appendChild(cell7);

        const cell8 = document.createElement('td');
        cell8.textContent = data.Gender;
        row.appendChild(cell8);

        const cell9 = document.createElement('td');
        cell9.textContent = data.Age;
        row.appendChild(cell9);

        const cell10 = document.createElement('td');
        cell10.textContent = data.DepartureTime;
        row.appendChild(cell10);

        const cell11 = document.createElement('td');
        cell11.textContent = data.FarePrice;
        row.appendChild(cell11);

        const cell12 = document.createElement('td');
        cell12.textContent = data.Discount;
        row.appendChild(cell12);

        const cell13 = document.createElement('td');
        const statusDropdown = document.createElement('select');

        // Create options for the dropdown
        const approvedOption = document.createElement('option');
        approvedOption.value = 'approved';
        approvedOption.textContent = 'Approved';

        const cancelledOption = document.createElement('option');
        cancelledOption.value = 'cancelled';
        cancelledOption.textContent = 'Cancelled';

        // Set the initial selected option based on data.status
        if (data.status === 'approved') {
          approvedOption.selected = true;
        } else if (data.status === 'cancelled') {
          cancelledOption.selected = true;
        }

        // Add event listener to update the status in the Firestore database
        statusDropdown.addEventListener('change', () => {
          const newStatus = statusDropdown.value;
          // Update the status in the Firestore database here
        });

        // Add options to the dropdown
        statusDropdown.appendChild(approvedOption);
        statusDropdown.appendChild(cancelledOption);

        cell13.appendChild(statusDropdown);
        row.appendChild(cell13);


        tbody.appendChild(row);
      });
    } catch (error) {
      console.error('Error retrieving bookings: ', error);
    }
  }

  populateBookings();
}