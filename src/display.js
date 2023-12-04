import {initializeApp} from '../node_modules/firebase/app'
import { getFirestore, collection, getDocs, addDoc, getDoc, query, where, orderBy, doc, deleteDoc, setDoc } from '../node_modules/firebase/firestore';

export function displayFunctions() {
    const { v4: uuidv4 } = require('uuid');
    const moment = require('moment');

  // Initialize Firebase
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

    const app = initializeApp(firebaseConfig);
    // Initialize Firestore
    const db = getFirestore(app); // pass the app instance to getFirestore

  // Reference to Firebase collections
  const bookedTicketCollection = firebase.firestore().collection('Medallion-BookedTicket');
  const paymentsCollection = firebase.firestore().collection('Payments');
  const vesselRouteCollection = firebase.firestore().collection('Vessel_Route');
  const vesselScheduleCollection = firebase.firestore().collection('Vessel_Schedule');
  const notificationsCollection = firebase.firestore().collection('Notifications');
// Function to fetch and display total bookings
function getTotalBookings() {
    bookedTicketCollection.get().then((snapshot) => {
      const totalBookings = snapshot.size;
      document.getElementById('totalBookings').innerText = totalBookings;
    });
  }
  
  // Function to fetch and display total earnings
  function getTotalEarnings() {
    paymentsCollection.get().then((snapshot) => {
      let totalEarnings = 0;
      snapshot.forEach((doc) => {
        totalEarnings += doc.data().Total; // Assuming there is an 'amount' field in the Payments collection
      });
      document.getElementById('totalEarnings').innerText = totalEarnings;
    });
  }
  
  // Function to fetch and display booking analysis chart
  function drawBookingAnalysisChart() {
    // Implement the logic to draw the chart using Google Charts API or any other chart library
    // Example using Google Charts API:
    google.charts.load('current', { 'packages': ['corechart'] });
    google.charts.setOnLoadCallback(drawChart);
  
    function drawChart() {
      const data = google.visualization.arrayToDataTable([
        ['Category', 'Bookings'],
        ['Category 1', 20],
        ['Category 2', 30],
        // Add data dynamically based on your analysis
      ]);
  
      const options = {
        title: 'Booking Analysis',
        pieHole: 0.4,
      };
  
      const chart = new google.visualization.PieChart(document.getElementById('chart_div'));
      chart.draw(data, options);
    }
  }
  
  // Function to fetch and display trips table
  function displayTripsTable() {
    const tripsTableBody = document.getElementById('tripsTable').getElementsByTagName('tbody')[0];
  
    // Fetch data from Vessel_Route and Vessel_Schedule collections
    Promise.all([
      vesselRouteCollection.get(),
      vesselScheduleCollection.get(),
    ]).then(([routeSnapshot, scheduleSnapshot]) => {
      routeSnapshot.forEach((routeDoc) => {
        const routeData = routeDoc.data();
        const scheduleDoc = scheduleSnapshot.docs.find((scheduleDoc) => scheduleDoc.id === routeDoc.id);
        const scheduleData = scheduleDoc ? scheduleDoc.data() : {};
  
        const row = tripsTableBody.insertRow(-1);
        row.insertCell(0).innerText = routeData.tripName || 'N/A';
        row.insertCell(1).innerText = routeData.startDate || 'N/A';
        row.insertCell(2).innerText = routeData.endDate || 'N/A';
        row.insertCell(3).innerText = scheduleData.departureTime || 'N/A';
        row.insertCell(4).innerText = scheduleData.arrivalTime || 'N/A';
  
        // Add any additional columns as needed
      });
    });
  }
  
  // Function to fetch and display notifications
  function displayNotifications() {
    notificationsCollection.get().then((snapshot) => {
      const notificationsList = document.getElementById('notificationsList');
      snapshot.forEach((doc) => {
        const li = document.createElement('li');
        li.classList.add('list-group-item');
        li.innerText = doc.data().message; // Assuming there is a 'message' field in the Notifications collection
        notificationsList.appendChild(li);
      });
    });
  }
  
  // Execute the functions when the page loads
  window.onload = function () {
    getTotalBookings();
    getTotalEarnings();
    drawBookingAnalysisChart();
    displayTripsTable();
    displayNotifications();
  };
  
  // Add click event listener to logo-details
  $('.logo-details').click(function () {
    $('#sidebar').toggleClass('close');
    $('.navbar').toggleClass('navbar-collapsed');
  });

}