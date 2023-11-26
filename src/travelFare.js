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
    const travelFareColRef = collection(db, 'Travel_Fare');
    const vesselsColRef = collection(db, 'Vessel');
    const routeColRef = collection(db, 'Vessel_Route');
    let travelFare = [];

    document.querySelector('#vesselID').addEventListener('change', async function() {
      var routeSelect = document.getElementById("routeID");
      routeSelect.innerHTML = '';

      var vesselID = this.value;
      try {
        getRoutes(vesselID);
      } catch (error) {
        console.error('Error in getRoutes:', error);
      }
    })


    document.querySelector('#editVesselID').addEventListener('change', async function() {
      var routeSelect = document.getElementById("editRouteID");
      routeSelect.innerHTML = '';

      var vesselID = this.value;
      try {
        getRoutesEdit(vesselID);
      } catch (error) {
        console.error('Error in getRoutes:', error);
      }
    })

    async function getRoutesEdit(vessel_id) {
      const select  = document.getElementById('editRouteID');

      const orderedQuery  = query(routeColRef, where("vessel_id", '==', vessel_id));
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



    async function getRoutes(vessel_id) {
        const select  = document.getElementById('routeID');

        const orderedQuery  = query(routeColRef, where("vessel_id", '==', vessel_id));
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
      

    async function populateVessel() {
      const select  = document.getElementById('vesselID');

      const orderedQuery  = query(vesselsColRef, orderBy('vessel_name', 'asc'));
      const vessels = [];

      getDocs(orderedQuery)
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const option = document.createElement('option');
          option.value = data.vessel_id; // Set the value attribute of the option
          option.text = data.vessel_name;  // Set the text content of the option
          select.appendChild(option);
        });
      })
      .catch((error) => {
        console.error('Error getting documents: ', error);
      });
    }
    
    populateVessel();

    
    // Function to add a new travelFare to Firestore
    async function addTravelFare(vesselID, routeID, economy, business) {
      try {

        // Add a new document to the "TravelFares" collection with the entered data
        const travelFareUniqueID = uuidv4();

        // Add checker if record already exists
        const queryWithSearch = query(travelFareColRef, where("vessel_id", '==', vesselID), where("route_id", '==', routeID));

        getDocs(queryWithSearch)
        .then((querySnapshot) => {
          if (!querySnapshot.empty) {
            throw new Error('Data already exists');
          } else {
            addDoc(travelFareColRef, {
              travelFare_id: travelFareUniqueID,
              vessel_id: vesselID,
              route_id: routeID,
              economy: parseFloat(economy),
              business: parseFloat(business)
            });
            console.log('TravelFare added successfully!');
            $("#addFareModal").modal("hide");
          }
        })
      } catch (error) {
        console.error('Error adding travelFare:', error);
      }
    }

    async function fetchTravelFares() {
      try {
        const orderedQuery = query(travelFareColRef);
        const travelFare = [];
    
        const querySnapshot = await getDocs(orderedQuery);
        if(!querySnapshot.empty){
          for (const doc of querySnapshot.docs) {
            const data = doc.data();
            data.vessel_name = await getVesselName(data.vessel_id);
            data.route_name = await getRouteName(data.route_id);
            travelFare.push(data);
          }
          displayTravelFaresInTable(travelFare);
        }
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

    async function getRouteName(routeID) {
      try {
        const getVessel = query(routeColRef, where('route_id', '==', routeID));
        const querySnapshot = await getDocs(getVessel);
    
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          return doc.data().route_name;
        }
    
        return null;
      } catch (error) {
        console.error('Error getting route name:', error);
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
        const vesselNameCell = document.createElement('td');
        vesselNameCell.textContent = travelFare.vessel_name;
        row.appendChild(vesselNameCell);

        const routeNameCell = document.createElement('td');
        routeNameCell.textContent = travelFare.route_name;
        row.appendChild(routeNameCell);

        const economyCell = document.createElement('td');
        economyCell.textContent = travelFare.economy;
        row.appendChild(economyCell);

        const businessCell = document.createElement('td');
        businessCell.textContent = travelFare.business;
        row.appendChild(businessCell);

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
          $("#editFareModal").modal("show");
          $("#editVesselID").val(travelFare.vessel_id);
          $("#editFareID").val(travelFare.travelFare_id);
          $("#editRouteID").val(travelFare.route_id);
          $("#editEconomy").val(travelFare.economy);
          $("#editBusiness").val(travelFare.business);

                
       
          const select  = document.getElementById('editVesselID');
          select.innerHTML = "";
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

          const selectRoute  = document.getElementById('editRouteID');
          selectRoute.innerHTML = "";
          const orderedRouteQuery  = query(routeColRef, where('vessel_id', '==', travelFare.vessel_id));

          getDocs(orderedRouteQuery)
          .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              const data = doc.data();
              const option = document.createElement('option');
              option.value = data.route_id; // Set the value attribute of the option
              option.text = data.route_name;  // Set the text content of the option
              if(data.route_id == travelFare.route_id){
                  option.selected = true;
              }
              selectRoute.appendChild(option);
              
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

    async function editTravelFare(travelFareID, vesselID, routeID, business, economy) {
      try {
        // Check if any of the fields are empty
        const dataToUpdate = {
            vessel_id: vesselID,
            route_id: routeID,
            business: parseFloat(business),
            economy: parseFloat(economy)
        };

        console.log("travelFareID", travelFareID)
        console.log("dataToUpdate", dataToUpdate)

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
            $("#editFareModal").modal("hide");

          })
          .catch((error) => {
            console.error('Error:', error);
          });
      } catch (error) {
        console.error('Error updating travelFare:', error);
      }
    }

    // Get the form element
    const addTravelFareForm = document.querySelector('#addFareModal form');

    if(addTravelFareForm){
        // Add an event listener for the submit event
        addTravelFareForm.addEventListener('submit', async (event) => {
          // Prevent the form from being submitted normally
          event.preventDefault();
    
          // Get the values from the form
          const vesselID = document.getElementById('vesselID').value;
          const routeID = document.getElementById('routeID').value;
          const economy = document.getElementById('economy').value;
          const business = document.getElementById('business').value;
    
          // Check if any of the fields are empty
          if (!routeID || !vesselID || !economy || !business) {
            alert('All fields must be filled out');
            return;
          }
    
          // Call the addTravelFare function with the entered data
          await addTravelFare(vesselID, routeID, economy, business);
    
          // Clear the form
          addTravelFareForm.reset();
    
          // Fetch the updated list of travelFare
          await fetchTravelFares();
        });
    }
    

    const editTravelFareForm = document.querySelector('#editFareModal form');

    if(editTravelFareForm){
        // Add an event listener for the submit event
        editTravelFareForm.addEventListener('submit', async (event) => {
          // Prevent the form from being submitted normally
          event.preventDefault();
    
          // Get the values from the form
          const travelFareID = document.getElementById('editFareID').value;
          const vesselID = document.getElementById('editVesselID').value;
          const routeID = document.getElementById('editRouteID').value;
          const business = document.getElementById('editBusiness').value;
          const economy = document.getElementById('editEconomy').value;
    
          // Check if any of the fields are empty
          if (!vesselID || !routeID || !business || !economy) {
            alert('All fields must be filled out');
            return;
          }
    
          // Call the addTravelFare function with the entered data
          await editTravelFare(travelFareID, vesselID, routeID, business, economy);
    
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
    const travelFaresColRef = collection(db, 'Travel_Fare');


}

  