import {initializeApp} from '../node_modules/firebase/app'
import { getFirestore, collection, getDocs, addDoc, getDoc, query, where, orderBy, doc, deleteDoc, setDoc } from '../node_modules/firebase/firestore';
import { getStorage, ref, getDownloadURL } from '../node_modules/firebase/storage';

export function bookingFunctions() {
    const { v4: uuidv4 } = require('uuid');

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
        const date = new Date(data.dateIssued);
        const formattedDate = date.toLocaleDateString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
        cell4.textContent = formattedDate;
        row.appendChild(cell4);

        const cell5 = document.createElement('td');
        cell5.textContent = data.AccomType;
        row.appendChild(cell5);

        const cell6 = document.createElement('td');
        cell6.textContent = data.TicketType;
        row.appendChild(cell6);

        const cell7 = document.createElement('td');
        const imageIcon = document.createElement('img');
        imageIcon.src = data.ImageUrl;
        imageIcon.style.width = '50px';
        imageIcon.style.height = '50px';

        imageIcon.addEventListener('click', async () => {
          // Show bigger version of the image in a modal
          const downloadURL = await getDownloadURL(ref(storage, data.ImageUrl));

          // Create a modal backdrop to handle multiple modals
          const modalBackdrop = document.createElement('div');
          modalBackdrop.classList.add('modal-backdrop', 'fade');
          document.body.appendChild(modalBackdrop);

          const imageModal = document.createElement('div');
          imageModal.classList.add('modal', 'fade', 'show');
          const modalId = `imageModal-${uuidv4()}`;
          imageModal.id = modalId;

          const modalDialog = document.createElement('div');
          modalDialog.classList.add('modal-dialog', 'modal-dialog-centered', 'modal-lg');
          imageModal.appendChild(modalDialog);

          const modalContent = document.createElement('div');
          modalContent.classList.add('modal-content');
          modalDialog.appendChild(modalContent);

          const modalBody = document.createElement('div');
          modalBody.classList.add('modal-body', 'text-center');
          modalContent.appendChild(modalBody);

          const biggerImage = document.createElement('img');
          biggerImage.src = downloadURL;
          biggerImage.classList.add('img-fluid');
          modalBody.appendChild(biggerImage);

          document.body.appendChild(imageModal);

          // Close the modal and remove the backdrop when closed
          const closeModal = () => {
            imageModal.classList.remove('show');
            modalBackdrop.remove();
          };

          // Handle modal close when the backdrop is clicked
          modalBackdrop.addEventListener('click', closeModal);

          // Close the modal when the modal itself is clicked
          imageModal.addEventListener('click', closeModal);
        });

        cell7.appendChild(imageIcon);
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