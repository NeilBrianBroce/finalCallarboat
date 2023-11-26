import {initializeApp} from '../node_modules/firebase/app'
import { getFirestore, collection, getDocs, addDoc, getDoc, query, where, orderBy, doc, deleteDoc, setDoc } from '../node_modules/firebase/firestore';


export function travelFareFunctions() {
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
    initializeApp(firebaseConfig)

    //init services
    const db = getFirestore()
    const travelFareColRef = collection(db, 'Vessel_TravelFare');
    const vesselsColRef = collection(db, 'Vessel');
    const routeColRef = collection(db, 'Vessel_Route');
    let travelFare = [];

    async function populateRoute() {
        const select  = document.getElementById('routeID');

        const orderedQuery  = query(routeColRef, orderBy('route_name', 'asc'));
        const vessels = [];

        getDocs(orderedQuery)
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            const option = document.createElement('option');
            option.value = data.route_id; // Set the value attribute of the option
            option.text = data.route_name;  // Set the text content of the option
            select.appendChild(option);
          });
        })
        .catch((error) => {
          console.error('Error getting documents: ', error);
        });
      }
      
      // Call the populateVessel function to fill the dropdown
      populateRoute();

    
    // Function to add a new travelFare to Firestore
    async function addTravelFare(vesselID, travelFareName, travelFareSecondTrip, travelFareFirstTrip) {
      try {

        // Add a new document to the "TravelFares" collection with the entered data
        const travelFareUniqueID = uuidv4();

        // Add checker if travelFare_name already exists
        const queryWithSearch = query(travelFareColRef, where("travelFare_name", '==', travelFareName), where("vessel_id", '==', vesselID));

        getDocs(queryWithSearch)
        .then((querySnapshot) => {
          if (!querySnapshot.empty) {
            throw new Error('Data already exists');
          } else {
            addDoc(travelFareColRef, {
              travelFare_id: travelFareUniqueID,
              vessel_id: vesselID,
              travelFare_name: travelFareName,
              travelFare_first_trip: travelFareSecondTrip,
              travelFare_second_trip: travelFareFirstTrip
            });
            console.log('TravelFare added successfully!');
            $("#addTravelFareModal").modal("hide");
          }
        })
      } catch (error) {
        console.error('Error adding travelFare:', error);
      }
    }

    async function fetchTravelFares() {
      try {
        const orderedQuery = query(travelFareColRef, orderBy('travelFare_name', 'asc'));
        const travelFare = [];
    
        const querySnapshot = await getDocs(orderedQuery);
    
        for (const doc of querySnapshot.docs) {
          const data = doc.data();
          data.vessel_name = await getVesselName(data.vessel_id); 
          console.log(data.vessel_name);
          travelFare.push(data);
        }
    
        console.log(travelFare);
        displayTravelFaresInTable(travelFare);
      } catch (error) {
        console.error('Error fetching travelFare:', error);
      }
    }
    
    async function getVesselName(vesselID) {
      try {
        const getVessel = query(vesselsColRef, where('vessel_id', '==', vesselID));
        const querySnapshot = await getDocs(getVessel);
    
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          return doc.data().vessel_name;
        }
    
        return null;
      } catch (error) {
        console.error('Error getting vessel name:', error);
        throw error;
      }
    }

    async function searchTravelFares(searchFor, searchVal) {
      try {
        const queryWithSearch = query(travelFareColRef, where(searchFor, '==', searchVal));
        const searvhTravelFares = [];

        getDocs(queryWithSearch)
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            searvhTravelFares.push(data); // Add the data to the array
          });

          // Now, the "travelFare" array contains the ordered documents
          console.log("searvhTravelFares", searvhTravelFares);
        })
        .catch((error) => {
          console.error('Error getting documents: ', error);
        });
      } catch (error) {
        console.error('Error fetching travelFare:', error);
      }
    }

    // Function to display the travelFare in an HTML table
    function displayTravelFaresInTable(travelFare) {
      // Get the tbody element
      const tbody = document.getElementById('travelFareTbody');

      // Clear the tbody
      tbody.innerHTML = '';

      // Iterate over the travelFare array and create table rows
      travelFare.forEach((travelFare, index) => {
        const row = document.createElement('tr');

        // Create table cells for each data field
        const vesselIDCell = document.createElement('td');
        vesselIDCell.textContent = travelFare.vessel_id;
        row.appendChild(vesselIDCell);

        const vesselNameCell = document.createElement('td');
        vesselNameCell.textContent = travelFare.vessel_name;
        row.appendChild(vesselNameCell);

        const travelFareNameCell = document.createElement('td');
        travelFareNameCell.textContent = travelFare.travelFare_name;
        row.appendChild(travelFareNameCell);

        const travelFareSecondTripCell = document.createElement('td');
        travelFareSecondTripCell.textContent = travelFare.travelFare_first_trip;
        row.appendChild(travelFareSecondTripCell);

        const travelFareFirstTripCell = document.createElement('td');
        travelFareFirstTripCell.textContent = travelFare.travelFare_second_trip;
        row.appendChild(travelFareFirstTripCell);

        // Create Action cell
        const actionCell = document.createElement('td');

        // Create Edit button
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.classList.add('btn', 'btn-success');
        editButton.classList.add('editTravelFare');
        editButton.setAttribute('id', "edit_" + travelFare.travelFare_id);
        actionCell.appendChild(editButton);

        editButton.addEventListener('click', function (event) {
          $("#editTravelFareModal").modal("show");
          $("#editTravelFareFirstTrip").val(travelFare.travelFare_first_trip);
          $("#editTravelFareName").val(travelFare.travelFare_name);
          $("#editTravelFareSecondTrip").val(travelFare.travelFare_second_trip);
          $("#editTravelFareID").val(travelFare.travelFare_id);
          $("#editVesselID").val(travelFare.vessel_id);

        const select  = document.getElementById('editVesselID');

        const orderedQuery  = query(vesselsColRef, orderBy('vessel_name', 'asc'));

        getDocs(orderedQuery)
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            const option = document.createElement('option');
            option.value = data.vessel_id; // Set the value attribute of the option
            option.text = data.vessel_name;  // Set the text content of the option
            if(data.vessel_id == travelFare.vessel_id){
                option.selected = true;
            }
            select.appendChild(option);
            
          });
        })
        .catch((error) => {
          console.error('Error getting documents: ', error);
        });

        });

        // Create Delete button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add('btn', 'btn-danger');
        deleteButton.classList.add('deleteTravelFare');
        deleteButton.setAttribute('id', "delete_" + travelFare.travelFare_id);
        actionCell.appendChild(deleteButton);

        deleteButton.addEventListener('click', function (event) {
          deleteTravelFare(travelFare.travelFare_id)
        });

        // Append the Action cell to the row
        row.appendChild(actionCell);

        // Append the row to the tbody
        tbody.appendChild(row);
      });
    }

    // Function to delete a travelFare from Firestore
    async function deleteTravelFare(travelFareID) {
      try {
          // Show a confirmation prompt to the user
          const confirmDelete = confirm('Do you want to delete this entry?');

          // If the user confirms the deletion
          if (confirmDelete) {
              // Delete the document with the corresponding ID from the "TravelFares" collection
              const getTravelFare = query(travelFareColRef, where('travelFare_id', '==', travelFareID));

              getDocs(getTravelFare)
                .then((querySnapshot) => {
                  if (!querySnapshot.empty) {
                    // If a document matching the search criteria is found, delete it
                    const doc = querySnapshot.docs[0]; // Get the first document (assuming it's unique)
                    const travelFareDocRef = doc.ref;

                    // Use deleteDoc to delete the document
                    return deleteDoc(travelFareDocRef);
                  } else {
                    console.log('Document not found');
                  }
                })
                .then(() => {
                  console.log('Document deleted successfully');
                })
                .catch((error) => {
                  console.error('Error:', error);
                });
              console.log('TravelFare deleted successfully!');

              // Fetch the updated list of travelFare
              await fetchTravelFares();
          }
      } catch (error) {
          console.error('Error deleting travelFare:', error);
      }
    }

    async function editTravelFare(travelFareID, vesselID, travelFareName, travelFareFirstTrip, travelFareSecondTrip) {
        console.log(travelFareID)
        console.log(vesselID)
        console.log(travelFareName)
        console.log(travelFareSecondTrip)
        console.log(travelFareFirstTrip)
      try {
        // Check if any of the fields are empty
        if (!vesselID || !travelFareName || !travelFareSecondTrip || !travelFareFirstTrip) {
          alert('All fields must be filled out');
          return;
        }

        const dataToUpdate = {
            vessel_id: vesselID,
            travelFare_name: travelFareName,
            travelFare_first_trip: travelFareFirstTrip,
            travelFare_second_trip: travelFareSecondTrip
        };

        const getTravelFare = query(travelFareColRef, where('travelFare_id', '==', travelFareID));

        getDocs(getTravelFare)
          .then((querySnapshot) => {
            if (!querySnapshot.empty) {
              // If a document matching the search criteria is found, update it
              const doc = querySnapshot.docs[0]; // Get the first document (assuming it's unique)
              const travelFareDocRef = doc.ref;
              return setDoc(travelFareDocRef, dataToUpdate, { merge: true });
              // // Use getDoc to retrieve the current document data
              // return getDoc(travelFareDocRef);
            } else {
              console.log('Document not found');
            }
          })
          .then(() => {
            console.log('Document updated successfully');
            $("#editTravelFareModal").modal("hide");

          })
          .catch((error) => {
            console.error('Error:', error);
          });
      } catch (error) {
        console.error('Error updating travelFare:', error);
      }
    }

    // Get the form element
    const addTravelFareForm = document.querySelector('#addTravelFareModal form');

    if(addTravelFareForm){
        console.log(addTravelFareForm);

        // Add an event listener for the submit event
        addTravelFareForm.addEventListener('submit', async (event) => {
          // Prevent the form from being submitted normally
          event.preventDefault();
    
          // Get the values from the form
          const vesselID = document.getElementById('vesselID').value;
          const travelFareName = document.getElementById('travelFareName').value;
          const travelFareFirstTrip = document.getElementById('travelFareFirstTrip').value;
          const travelFareSecondTrip = document.getElementById('travelFareSecondTrip').value;
    
          // Check if any of the fields are empty
          if (!travelFareName || !vesselID || !travelFareFirstTrip || !travelFareSecondTrip) {
            alert('All fields must be filled out');
            return;
          }
    
          // Call the addTravelFare function with the entered data
          await addTravelFare(vesselID, travelFareName, travelFareSecondTrip, travelFareFirstTrip);
    
          // Clear the form
          addTravelFareForm.reset();
    
          // Fetch the updated list of travelFare
          await fetchTravelFares();
        });
    }
    

    const editTravelFareForm = document.querySelector('#editTravelFareModal form');

    if(editTravelFareForm){
        // Add an event listener for the submit event
        editTravelFareForm.addEventListener('submit', async (event) => {
          // Prevent the form from being submitted normally
          event.preventDefault();
    
          // Get the values from the form
          const travelFareID = document.getElementById('editTravelFareID').value;
          const travelFareName = document.getElementById('editTravelFareName').value;
          const vesselID = document.getElementById('editVesselID').value;
          const travelFareFirstTrip = document.getElementById('editTravelFareFirstTrip').value;
          const travelFareSecondTrip = document.getElementById('editTravelFareSecondTrip').value;
    
          // Check if any of the fields are empty
          if (!travelFareName || !vesselID || !travelFareFirstTrip || !travelFareSecondTrip) {
            alert('All fields must be filled out');
            return;
          }
    
          // Call the addTravelFare function with the entered data
          await editTravelFare(travelFareID, vesselID, travelFareName, travelFareFirstTrip, travelFareSecondTrip);
    
          // Clear the form
          editTravelFareForm.reset();
    
          // Fetch the updated list of travelFare
          await fetchTravelFares();
        });
    
    
    }
    
    // Fetch the list of travelFare when the page loads
    fetchTravelFares();

    // test search
    var searchFor = "travelFareName";
    var searchVal = "Zhuming";
    searchTravelFares(searchFor, searchVal);

    // Collection reference for travelFares
    const travelFaresColRef = collection(db, 'TravelFare');


}

  