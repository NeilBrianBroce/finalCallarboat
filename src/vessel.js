import {initializeApp} from '../node_modules/firebase/app'
import { getFirestore, collection, getDocs, addDoc, getDoc, query, where, orderBy, doc, deleteDoc, setDoc } from '../node_modules/firebase/firestore';


export function vesselFunctions() {
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
  const vesselsColRef = collection(db, 'Vessel');
  let vessels = [];


  //collection ref
  const colRef = collection(db, 'Medallion-BookedTicket' )

    // get collection data bookings
    getDocs(colRef)
      .then((snapshot) => {
        let bookings = []
        snapshot.docs.forEach((doc) => {
            bookings.push({...doc.data(), id: doc.id })
        })

        const tbody = document.getElementById('tbody1');
        snapshot.docs.forEach((doc) => {
        const booking = doc.data();
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${booking.AccomType}</td>
            <td>${booking.Age}</td>
            <td>${booking.Date}</td>
            <td>${booking.Destination}</td>
            <td>${booking.Gender}</td>
            <td>${booking.ImageUrl}</td>
            <td>${booking.Location}</td>
            <td>${booking.Name}</td>
            <td>${booking.TicketType}</td>
            <td>${booking.User}</td>
        `;
        tbody.appendChild(row);
        });
      })
      .catch(err => {
        console.log(err.message)
      })

      // Function to add a new vessel to Firestore
    async function addVessel(vesselName, vesselEconomy, vesselBusiness) {
      try {
        // Add a new document to the "Vessels" collection with the entered data
        const vesselUniqueID = uuidv4();

        // Add checker if vessel_name already exists
        const queryWithSearch = query(vesselsColRef, where("vessel_name", '==', vesselName));

        getDocs(queryWithSearch)
        .then((querySnapshot) => {
          if (!querySnapshot.empty) {
            throw new Error('Data already exists');
          } else {
            addDoc(vesselsColRef, {
              vessel_id: vesselUniqueID,
              vessel_name: vesselName,
              vessel_business: vesselBusiness,
              vessel_economy: vesselEconomy
            });
            console.log('Vessel added successfully!');
            $("#addVesselModal").modal("hide");
          }
        })
      } catch (error) {
        console.error('Error adding vessel:', error);
      }
    }

    async function fetchVessels() {
      try {
        const orderedQuery  = query(vesselsColRef, orderBy('vessel_name', 'asc'));
        const vessels = [];

        getDocs(orderedQuery)
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            vessels.push(data); // Add the data to the array
          });

          // Now, the "vessels" array contains the ordered documents
          console.log(vessels);
          displayVesselsInTable(vessels);
        })
        .catch((error) => {
          console.error('Error getting documents: ', error);
        });
      } catch (error) {
        console.error('Error fetching vessels:', error);
      }
    }

    async function searchVessels(searchFor, searchVal) {
      try {
        const queryWithSearch = query(vesselsColRef, where(searchFor, '==', searchVal));
        const searvhVessels = [];

        getDocs(queryWithSearch)
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            searvhVessels.push(data); // Add the data to the array
          });

          // Now, the "vessels" array contains the ordered documents
          console.log("searvhVessels", searvhVessels);
        })
        .catch((error) => {
          console.error('Error getting documents: ', error);
        });
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
        vesselNameCell.textContent = vessel.vessel_name;
        row.appendChild(vesselNameCell);

        const vesselEconomyCell = document.createElement('td');
        vesselEconomyCell.textContent = vessel.vessel_economy;
        row.appendChild(vesselEconomyCell);

        const vesselBusinessCell = document.createElement('td');
        vesselBusinessCell.textContent = vessel.vessel_business;
        row.appendChild(vesselBusinessCell);

        // Create Action cell
        const actionCell = document.createElement('td');

        // Create Edit button
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.classList.add('btn', 'btn-success');
        editButton.classList.add('editVessel');
        editButton.setAttribute('id', "edit_" + vessel.vessl_id);
        actionCell.appendChild(editButton);

        editButton.addEventListener('click', function (event) {
          $("#editVesselModal").modal("show");
          $("#editVesselEconomy").val(vessel.vessel_economy);
          $("#editVesselName").val(vessel.vessel_name);
          $("#editVesselBusiness").val(vessel.vessel_business);
          $("#editVesselID").val(vessel.vessel_id);
        });

        // Create Delete button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add('btn', 'btn-danger');
        deleteButton.classList.add('deleteVessel');
        deleteButton.setAttribute('id', "delete_" + vessel.vessl_id);
        actionCell.appendChild(deleteButton);

        deleteButton.addEventListener('click', function (event) {
          deleteVessel(vessel.vessel_id)
        });

        // Append the Action cell to the row
        row.appendChild(actionCell);

        // Append the row to the tbody
        tbody.appendChild(row);
      });
    }

    // Function to delete a vessel from Firestore
    async function deleteVessel(vesselID) {
      try {
          // Show a confirmation prompt to the user
          const confirmDelete = confirm('Do you want to delete this entry?');

          // If the user confirms the deletion
          if (confirmDelete) {
              // Delete the document with the corresponding ID from the "Vessels" collection
              const getVessel = query(vesselsColRef, where('vessel_id', '==', vesselID));

              getDocs(getVessel)
                .then((querySnapshot) => {
                  if (!querySnapshot.empty) {
                    // If a document matching the search criteria is found, delete it
                    const doc = querySnapshot.docs[0]; // Get the first document (assuming it's unique)
                    const vesselDocRef = doc.ref;

                    // Use deleteDoc to delete the document
                    return deleteDoc(vesselDocRef);
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
              console.log('Vessel deleted successfully!');

              // Fetch the updated list of vessels
              await fetchVessels();
          }
      } catch (error) {
          console.error('Error deleting vessel:', error);
      }
    }

    async function editVessel(vesselID, vesselName, vesselEconomy, vesselBusiness) {
      try {
        // Check if any of the fields are empty
        if (!vesselName || !vesselEconomy || !vesselBusiness) {
          alert('All fields must be filled out');
          return;
        }

        const dataToUpdate = {
          vessel_name: vesselName,
          vessel_economy: vesselEconomy,
          vessel_business: vesselBusiness
        };

        const getVessel = query(vesselsColRef, where('vessel_id', '==', vesselID));

        getDocs(getVessel)
          .then((querySnapshot) => {
            if (!querySnapshot.empty) {
              // If a document matching the search criteria is found, update it
              const doc = querySnapshot.docs[0]; // Get the first document (assuming it's unique)
              const vesselDocRef = doc.ref;
              return setDoc(vesselDocRef, dataToUpdate, { merge: true });
              // // Use getDoc to retrieve the current document data
              // return getDoc(vesselDocRef);
            } else {
              console.log('Document not found');
            }
          })
          .then(() => {
            console.log('Document updated successfully');
            $("#editVesselModal").modal("hide");

          })
          .catch((error) => {
            console.error('Error:', error);
          });
      } catch (error) {
        console.error('Error updating vessel:', error);
      }
    }

    // Get the form element
    const addVesselForm = document.querySelector('#addVesselModal form');
    console.log(addVesselForm);

    // Add an event listener for the submit event
    addVesselForm.addEventListener('submit', async (event) => {
      // Prevent the form from being submitted normally
      event.preventDefault();

      // Get the values from the form
      const vesselName = document.getElementById('vesselName').value;
      const vesselEconomy = document.getElementById('vesselEconomy').value;
      const vesselBusiness = document.getElementById('vesselBusiness').value;

      // Check if any of the fields are empty
      if (!vesselName || !vesselEconomy || !vesselBusiness) {
        alert('All fields must be filled out');
        return;
      }

      // Call the addVessel function with the entered data
      await addVessel(vesselName, vesselEconomy, vesselBusiness);

      // Clear the form
      addVesselForm.reset();

      // Fetch the updated list of vessels
      await fetchVessels();
    });

    const editVesselForm = document.querySelector('#editVesselModal form');
    console.log(editVesselForm);

    // Add an event listener for the submit event
    editVesselForm.addEventListener('submit', async (event) => {
      // Prevent the form from being submitted normally
      event.preventDefault();

      // Get the values from the form
      const vesselID = document.getElementById('editVesselID').value;
      const vesselName = document.getElementById('editVesselName').value;
      const vesselEconomy = document.getElementById('editVesselEconomy').value;
      const vesselBusiness = document.getElementById('editVesselBusiness').value;
     

      // Check if any of the fields are empty
      if (!vesselName || !vesselEconomy || !vesselBusiness) {
        alert('All fields must be filled out');
        return;
      }

      // Call the addVessel function with the entered data
      await editVessel(vesselID, vesselName, vesselEconomy, vesselBusiness);

      // Clear the form
      editVesselForm.reset();

      // Fetch the updated list of vessels
      await fetchVessels();
    });


    // Fetch the list of vessels when the page loads
    fetchVessels();

    // test search
    var searchFor = "vesselName";
    var searchVal = "Zhuming";
    searchVessels(searchFor, searchVal);

    // Collection reference for routes
    const routesColRef = collection(db, 'Route');


}

  