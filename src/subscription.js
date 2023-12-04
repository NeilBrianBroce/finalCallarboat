import {initializeApp} from '../node_modules/firebase/app'
import { getFirestore, collection, getDocs, addDoc, getDoc, query, where, orderBy, doc, deleteDoc, setDoc } from '../node_modules/firebase/firestore';

export function subscriptionFunctions() {
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

   
  // Init firebase app
  initializeApp(firebaseConfig);

  // Init Firestore
  const db = getFirestore();

  // Reference to the "Subscribers" collection
  const subscribersCollection = collection(db, 'Subscribers');

  // Get all documents from the "Subscribers" collection
  getDocs(subscribersCollection)
    .then((querySnapshot) => {
      const table = document.getElementById('subscriptionTbody');

      // Iterate through the fetched data
      querySnapshot.forEach((doc) => {
        const subscriber = doc.data();

        // Create a new row for each subscriber
        const row = table.insertRow();

        // Add data to the row
        row.insertCell(0).textContent = subscriber.agency_id;

        // Create a button to open the modal with Bootstrap styles
        const btnCell = row.insertCell(1);
        const btn = document.createElement('button');
        
        // Apply Bootstrap styles to the button
        btn.className = 'btn btn-primary'; // Set the class for a blue button
        btn.textContent = 'View Image';
        btn.addEventListener('click', () => openModal(subscriber.agency_profile));

        // Append the button to the cell
        btnCell.appendChild(btn);

        // Continue adding other cells as needed
        row.insertCell(2).textContent = subscriber.companyName;
        row.insertCell(3).textContent = subscriber.subscriptionPlan;
        row.insertCell(4).textContent = subscriber.subscription_daysLeft;
        row.insertCell(5).textContent = subscriber.subscription_startDate;
        row.insertCell(6).textContent = subscriber.subscription_endDate;
        row.insertCell(7).textContent = subscriber.subscription_status;
      });
    })
    .catch((error) => console.error('Error fetching data:', error));

  // Function to open a modal with a larger image
  function openModal(imageUrl) {
    // Retrieve the modal and image elements
    const modal = new bootstrap.Modal(document.getElementById('imageModal'));
    const modalImage = document.getElementById('modalImage');

    // Set the image source
    modalImage.src = imageUrl;

    // Open the modal
    modal.show();
}
}