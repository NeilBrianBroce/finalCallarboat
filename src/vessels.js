import {initializeApp} from '../node_modules/firebase/app'
import { getFirestore, collection, getDocs, addDoc, getDoc, doc, deleteDoc, setDoc } from '../node_modules/firebase/firestore';

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
initializeApp(firebaseConfig)

//init services
const db = getFirestore();
const vesselsColRef = collection(db, 'Vessel');
// Initialize vessels array
let vessels = [];

// Function to add a new vessel to Firestore
async function addVessel(vesselName, vesselType, affiliation) {
    try {
      // Add a new document to the "Vessels" collection with the entered data
      await addDoc(vesselsColRef, {
        vesselName: vesselName,
        vesselType: vesselType,
        affiliation: affiliation
      });
      console.log('Vessel added successfully!');
    } catch (error) {
      console.error('Error adding vessel:', error);
    }
}

// Function to fetch all vessels from Firestore
async function fetchVessels() {
    try {
      const querySnapshot = await getDocs(vesselsColRef);
      const vessels = [];

      querySnapshot.forEach((doc) => {
        const vesselData = doc.data();
        const vessel = {
          id: doc.id, // Add the id property to the vessel object
          ...vesselData
        };
        vessels.push(vessel);
      });

      displayVesselsInTable(vessels);
    } catch (error) {
      console.error('Error fetching vessels:', error);
    }
}


// Function to display the vessels in an HTML table
function displayVesselsInTable(vessels) {
    // Get the tbody element
    const tbody = document.getElementById('vesselsTbody');

    // Clear the tbody
    tbody.innerHTML = '';

    // Iterate over the vessels array and create table rows
    vessels.forEach((vessel, index) => {
      const row = document.createElement('tr');

      // Create table cells for each data field
      const vesselNameCell = document.createElement('td');
      vesselNameCell.textContent = vessel.vesselName;
      row.appendChild(vesselNameCell);

      const vesselTypeCell = document.createElement('td');
      vesselTypeCell.textContent = vessel.vesselType;
      row.appendChild(vesselTypeCell);

      const affiliationCell = document.createElement('td');
      affiliationCell.textContent = vessel.affiliation;
      row.appendChild(affiliationCell);

      // Create Action cell
      const actionCell = document.createElement('td');

      // Create Edit button
      const editButton = document.createElement('button');
      editButton.textContent = 'Edit';
      editButton.style.backgroundColor = 'blue';
      editButton.style.color = 'white';
      // Attach click event to Edit button
      editButton.addEventListener('click', () => editVessel(index, vessel));
      actionCell.appendChild(editButton);

      // Create Delete button
      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete';
      deleteButton.style.backgroundColor = 'red';
      deleteButton.style.color = 'white';
      // Attach click event to Delete button
      deleteButton.addEventListener('click', () => deleteVessel(index, vessel));
      actionCell.appendChild(deleteButton);

      // Append the Action cell to the row
      row.appendChild(actionCell);

      // Append the row to the tbody
      tbody.appendChild(row);
    });
}
// Function to delete a vessel from Firestore
async function deleteVessel(vessel) {
    try {
        // Show a confirmation prompt to the user
        const confirmDelete = confirm('Do you want to delete this entry?');

        // If the user confirms the deletion
        if (confirmDelete) {
            // Delete the document with the corresponding ID from the "Vessels" collection
            await deleteDoc(doc(db, 'Vessel', vessel.id));
            console.log('Vessel deleted successfully!');

            // Fetch the updated list of vessels
            await fetchVessels();
        }
    } catch (error) {
        console.error('Error deleting vessel:', error);
    }
}
  
  // Function to edit a vessel in Firestore
async function editVessel(index, vessel) {
    try {
      // Prompt the user to enter the updated data for the vessel
      const updatedVesselName = prompt('Enter the updated vessel name:', vessel.vesselName);
      const updatedVesselType = prompt('Enter the updated vessel type:', vessel.vesselType);
      const updatedAffiliation = prompt('Enter the updated affiliation:', vessel.affiliation);
      
      // Check if any of the fields are empty
      if (!updatedVesselName || !updatedVesselType || !updatedAffiliation) {
        alert('All fields must be filled out');
        return;
      }
      
      // Update the document with the corresponding ID in the "Vessels" collection
      await setDoc(doc(db, 'Vessel', vessel.id), {
        vesselName: updatedVesselName,
        vesselType: updatedVesselType,
        affiliation: updatedAffiliation
      });
      console.log('Vessel updated successfully!');
      
      // Update the vessel object in the array
      vessels[index] = {
        id: vessel.id,
        vesselName: updatedVesselName,
        vesselType: updatedVesselType,
        affiliation: updatedAffiliation
      };
      
      // Call a function to display the updated vessels in an HTML table
      displayVesselsInTable(vessels);
    } catch (error) {
      console.error('Error updating vessel:', error);
    }
  }
  
 // Get the form element
const form = document.querySelector('#addVesselModal form');
console.log(form);

document.addEventListener('DOMContentLoaded', () => {
  // Your code here
});
// Add an event listener for the submit event
form.addEventListener('submit', async (event) => {
  // Prevent the form from being submitted normally
  event.preventDefault();

  // Get the values from the form
  const vesselName = document.getElementById('vesselName').value;
  const vesselType = document.getElementById('vesselType').value;
  const affiliation = document.getElementById('vesselAffiliation').value;

  // Check if any of the fields are empty
  if (!vesselName || !vesselType || !affiliation) {
    alert('All fields must be filled out');
    return;
  }

  // Call the addVessel function with the entered data
  await addVessel(vesselName, vesselType, affiliation);

  // Clear the form
  form.reset();

  // Fetch the updated list of vessels
  await fetchVessels();
});

// Fetch the list of vessels when the page loads
fetchVessels();