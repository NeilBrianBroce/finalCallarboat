import {initializeApp} from '../node_modules/firebase/app'
import { getFirestore, collection, getDocs, addDoc, getDoc, query, where, orderBy, doc, deleteDoc, setDoc } from '../node_modules/firebase/firestore';


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
  
    // Function to retrieve data and populate the table
    async function populateBookings() {
      const querySnapshot = await getDocs(collection(db, 'Medallion-BookedTickets'));
      const tbody = document.getElementById('tbody1');
  
      // Clear existing table rows
      tbody.innerHTML = '';
  
      // Loop through the documents and create table rows
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const bookingUniqueID = uuidv4(); 
        const row = document.createElement('tr');

      // Create table cells for each column
      const cell1 = document.createElement('td');
      cell1.textContent = data.AccomType;
      row.appendChild(cell1);

      const cell2 = document.createElement('td');
      cell2.textContent = data.Age;
      row.appendChild(cell2);

      const cell3 = document.createElement('td');
      cell3.textContent = data.Date;
      row.appendChild(cell3);

      const cell4 = document.createElement('td');
      cell4.textContent = data.Destination;
      row.appendChild(cell4);

      const cell5 = document.createElement('td');
      cell5.textContent = data.Gender;
      row.appendChild(cell5);

      const cell6 = document.createElement('td');
      cell6.textContent = data.ImageUrl;
      row.appendChild(cell6);

      const cell7 = document.createElement('td');
      cell7.textContent = data.Location;
      row.appendChild(cell7);

      const cell8 = document.createElement('td');
      cell8.textContent = data.Name;
      row.appendChild(cell8);

      const cell9 = document.createElement('td');
      cell9.textContent = data.TicketType;
      row.appendChild(cell9);

      const cell10 = document.createElement('td');
      cell10.textContent = data.User;
      row.appendChild(cell10);

      // Append the row to the tbody
      tbody.appendChild(row);
    });
  }

  // Call the function to retrieve data and populate the table
  populateBookings();
}