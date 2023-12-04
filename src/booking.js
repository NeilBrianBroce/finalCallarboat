import {initializeApp} from '../node_modules/firebase/app'
import { getFirestore, collection, getDocs, addDoc, getDoc, query, where, orderBy, doc, deleteDoc, setDoc,updateDoc } from '../node_modules/firebase/firestore';
import { getStorage, ref, getDownloadURL, uploadBytes } from '../node_modules/firebase/storage';

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
  const notificationsColRef = collection (db, 'Notifications');

  // Function to retrieve data and populate the table
  async function populateBookings() {
    const tbody = document.getElementById('tbody1');

    // Clear existing table rows
    tbody.innerHTML = '';

    try {
      const orderedQuery = query(bookingColRef, orderBy('Date', 'desc'));
      const querySnapshot = await getDocs(orderedQuery);
      querySnapshot.forEach(async (doc) => {
        const data = doc.data();
        console.log(data);
        const row = document.createElement('tr');

        // Create table cells for each column
        const cell1 = document.createElement('td');
        cell1.textContent = data.Name;
        row.appendChild(cell1);

        const cell2 = document.createElement('td');
        cell2.textContent = data.companyName;
        row.appendChild(cell2);

        const cell3 = document.createElement('td');
        cell3.textContent = data.vesselName;
        row.appendChild(cell3);

        const cell4 = document.createElement('td');
        cell4.textContent = data.Destination;
        row.appendChild(cell4);

        const cell5 = document.createElement('td');
        const date = data.dateIssued.toDate();
        const formattedDate = moment(date).format('MMMM DD, YYYY HH:mm:ss');

        cell5.textContent = formattedDate;
        row.appendChild(cell5);

        const cell6 = document.createElement('td');
        cell6.textContent = data.AccomType;
        row.appendChild(cell6);

        const cell7 = document.createElement('td');
        cell7.textContent = data.TicketType;
        row.appendChild(cell7);

        const cell8 = document.createElement('td');

        const viewIDButton = document.createElement('button');
        viewIDButton.textContent = 'View ID';
        viewIDButton.classList.add('btn', 'btn-primary');
        viewIDButton.addEventListener('click', function (event) {
          $("#viewIDModal").modal("show");
          var modalBody = document.getElementById('viewIDModalBody');
          var img = document.createElement('img');
          img.style.width = '100%';
          img.style.height = '100%';
          img.src=data.ImageUrl;
          modalBody.appendChild(img);

          if(data.status == "pending"){
            const approveButton = document.createElement('button');
            approveButton.textContent = 'Approve';
            approveButton.classList.add('btn', 'btn-success');
            approveButton.addEventListener('click', function (event) {
              approveBooking(data.bookID)
            });
  
            const disapproveButton = document.createElement('button');
            disapproveButton.textContent = 'Cancel';
            disapproveButton.classList.add('btn', 'btn-danger');
            disapproveButton.addEventListener('click', function (event) {
              disapproveBooking(data.bookID)
            });
  
            modalBody.appendChild(approveButton);
            modalBody.appendChild(disapproveButton);
          }else{
            if(data.status == "Approved"){
              const approveButton = document.createElement('button');
              approveButton.textContent = 'Approved';
              approveButton.classList.add('btn', 'btn-success');
              modalBody.appendChild(approveButton);
            }else{
              const disapproveButton = document.createElement('button');
              disapproveButton.textContent = 'Cancelled';
              disapproveButton.classList.add('btn', 'btn-danger');
              modalBody.appendChild(disapproveButton);
            }
            
          }
        })

        cell8.appendChild(viewIDButton);
        row.appendChild(cell8);

        const cell9 = document.createElement('td');
        cell9.textContent = data.Gender;
        row.appendChild(cell9);

        const cell10 = document.createElement('td');
        cell10.textContent = data.Age;
        row.appendChild(cell10);

        const cell11 = document.createElement('td');
        cell11.textContent = data.Discount;
        row.appendChild(cell11);

        const cell12 = document.createElement('td');
        cell12.textContent = data.paymentId; 
        row.appendChild(cell12);

        const cell13 = document.createElement('td');
        cell13.textContent = data.status;
        row.appendChild(cell13);


        tbody.appendChild(row);
      });
    } catch (error) {
      console.error('Error retrieving bookings: ', error);
    }
  }

  const QRCode = require('qrcode');

  async function approveBooking(bookID) {
    const dataToUpdate = {
      status: 'Approved',
    };
  
    try {
      const getRoute = query(bookingColRef, where('bookID', '==', bookID));
      const querySnapshot = await getDocs(getRoute);
  
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const bookingDocRef = doc.ref;
  
        // Update booking status
        await setDoc(bookingDocRef, dataToUpdate, { merge: true });
  
        // Get passenger name, booking date, and userID
        const { Name, dateIssued, user } = doc.data();
  
        // Generate QR code data
        const qrCodeData = `Passenger: ${Name}, Date: ${dateIssued}, Status: ${dataToUpdate.status}`;
  
        // Generate QR code image
        const qrCodeImage = await QRCode.toDataURL(qrCodeData);
  
        // Convert the data URL to a Blob
        const blob = await fetch(qrCodeImage).then(response => response.blob());
  
        // Create a reference to the storage location
        const storageRef = ref(storage, `QrCode/${bookID}.png`);
  
        // Upload the QR code image to Firebase Storage
        await uploadBytes(storageRef, blob);
  
        // Get the download URL of the uploaded image
        const downloadURL = await getDownloadURL(storageRef);
  
        if (downloadURL) {
          // Update Firestore document with the QR code URL
          await updateDoc(bookingDocRef, { qrCodeURL: downloadURL });
  
          // Save message to Firestore with a unique notificationID
          const notificationID = uuidv4();
          const approvalDate = new Date();
          const notificationData = {
            notificationID,
            message: `Booking for Passenger ${Name} has been approved on ${approvalDate}.`,
            timestamp: approvalDate,
            userID: user,
            headerApprove: 'Ticket Approval Notification',
            approvalDate: approvalDate,
          };
  
          await addDoc(notificationsColRef, notificationData);
  
          console.log('Document updated successfully');
          console.log('Notification saved successfully');
          $("#viewIDModal").modal("hide");
        }
      } else {
        console.log('Document not found');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
  
  async function disapproveBooking(bookID) {
    const dataToUpdate = {
      status: 'Cancelled by Agency',
    };
  
    const getRoute = query(bookingColRef, where('bookID', '==', bookID));
  
    try {
      const querySnapshot = await getDocs(getRoute);
  
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const bookingDocRef = doc.ref;
  
        // Get passenger name and userID
        const { Name, user } = doc.data();
  
        // Update booking status
        await setDoc(bookingDocRef, dataToUpdate, { merge: true });
  
        console.log('Document updated successfully');
  
        // Save message to Firestore with a unique notificationID
        const notificationID = uuidv4();
        const cancellationDate = new Date();
        const notificationData = {
          notificationID,
          message: `Booking for Passenger ${Name} has been cancelled on ${cancellationDate}.`,
          timestamp: cancellationDate,
          userID: user,
          headerApprove: 'Ticket Cancelled Notification',
          cancellationDate: cancellationDate,
        };
  
        await addDoc(notificationsColRef, notificationData);
  
        console.log('Notification saved successfully');
        $("#viewIDModal").modal("hide");
      } else {
        console.log('Document not found');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
  
  populateBookings();
}