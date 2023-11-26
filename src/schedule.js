import {initializeApp} from '../node_modules/firebase/app'
import { getFirestore, collection, getDocs, addDoc, getDoc, query, where, orderBy, doc, deleteDoc, setDoc } from '../node_modules/firebase/firestore';


export function scheduleFunctions() {
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
    const scheduleColRef = collection(db, 'Vessel_Schedule');
    const vesselsColRef = collection(db, 'Vessel');
    let schedule = [];

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
      
      // Call the populateVessel function to fill the dropdown
      populateVessel();

    
    // Function to add a new schedule to Firestore
    async function addSchedule(vesselID, scheduleName, scheduleSecondTrip, scheduleFirstTrip) {
      try {

        // Add a new document to the "Schedules" collection with the entered data
        const scheduleUniqueID = uuidv4();

        // Add checker if schedule_name already exists
        const queryWithSearch = query(scheduleColRef, where("schedule_name", '==', scheduleName), where("vessel_id", '==', vesselID));

        getDocs(queryWithSearch)
        .then((querySnapshot) => {
          if (!querySnapshot.empty) {
            throw new Error('Data already exists');
          } else {
            addDoc(scheduleColRef, {
              schedule_id: scheduleUniqueID,
              vessel_id: vesselID,
              schedule_name: scheduleName,
              schedule_first_trip: scheduleSecondTrip,
              schedule_second_trip: scheduleFirstTrip
            });
            console.log('Schedule added successfully!');
            $("#addScheduleModal").modal("hide");
          }
        })
      } catch (error) {
        console.error('Error adding schedule:', error);
      }
    }

    async function fetchSchedules() {
      try {
        const orderedQuery  = query(scheduleColRef, orderBy('schedule_name', 'asc'));
        const schedule = [];

        getDocs(orderedQuery)
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            var data = doc.data();
            data.vessel_name = getVesselName(data.vessel_id);
            schedule.push(data); // Add the data to the array
          });

          // Now, the "schedule" array contains the ordered documents
          console.log(schedule);
          displaySchedulesInTable(schedule);
        })
        .catch((error) => {
          console.error('Error getting documents: ', error);
        });
      } catch (error) {
        console.error('Error fetching schedule:', error);
      }
    }


    function getVesselName(vesselID){
        const getVessel = query(vesselsColRef, where('vessel_id', '==', vesselID));
        getDocs(getVessel)
          .then((querySnapshot) => {
            if (!querySnapshot.empty) {
              // If a document matching the search criteria is found, update it
              const doc = querySnapshot.docs[0]; // Get the first document (assuming it's unique)
              const data = doc.data().vessel_name;
              return data;
            }
          })
    }

    async function searchSchedules(searchFor, searchVal) {
      try {
        const queryWithSearch = query(scheduleColRef, where(searchFor, '==', searchVal));
        const searvhSchedules = [];

        getDocs(queryWithSearch)
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            searvhSchedules.push(data); // Add the data to the array
          });

          // Now, the "schedule" array contains the ordered documents
          console.log("searvhSchedules", searvhSchedules);
        })
        .catch((error) => {
          console.error('Error getting documents: ', error);
        });
      } catch (error) {
        console.error('Error fetching schedule:', error);
      }
    }

    // Function to display the schedule in an HTML table
    function displaySchedulesInTable(schedule) {
      // Get the tbody element
      const tbody = document.getElementById('scheduleTbody');

      // Clear the tbody
      tbody.innerHTML = '';

      // Iterate over the schedule array and create table rows
      schedule.forEach((schedule, index) => {
        const row = document.createElement('tr');

        // Create table cells for each data field
        const vesselIDCell = document.createElement('td');
        vesselIDCell.textContent = schedule.vessel_id;
        row.appendChild(vesselIDCell);

        const vesselNameCell = document.createElement('td');
        vesselNameCell.textContent = schedule.vessel_name;
        row.appendChild(vesselNameCell);

        const scheduleNameCell = document.createElement('td');
        scheduleNameCell.textContent = schedule.schedule_name;
        row.appendChild(scheduleNameCell);

        const scheduleSecondTripCell = document.createElement('td');
        scheduleSecondTripCell.textContent = schedule.schedule_first_trip;
        row.appendChild(scheduleSecondTripCell);

        const scheduleFirstTripCell = document.createElement('td');
        scheduleFirstTripCell.textContent = schedule.schedule_second_trip;
        row.appendChild(scheduleFirstTripCell);

        // Create Action cell
        const actionCell = document.createElement('td');

        // Create Edit button
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.classList.add('btn', 'btn-success');
        editButton.classList.add('editSchedule');
        editButton.setAttribute('id', "edit_" + schedule.schedule_id);
        actionCell.appendChild(editButton);

        editButton.addEventListener('click', function (event) {
          $("#editScheduleModal").modal("show");
          $("#editScheduleFirstTrip").val(schedule.schedule_first_trip);
          $("#editScheduleName").val(schedule.schedule_name);
          $("#editScheduleSecondTrip").val(schedule.schedule_second_trip);
          $("#editScheduleID").val(schedule.schedule_id);
          $("#editVesselID").val(schedule.vessel_id);

        const select  = document.getElementById('editVesselID');

        const orderedQuery  = query(vesselsColRef, orderBy('vessel_name', 'asc'));

        getDocs(orderedQuery)
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            const option = document.createElement('option');
            option.value = data.vessel_id; // Set the value attribute of the option
            option.text = data.vessel_name;  // Set the text content of the option
            if(data.vessel_id == schedule.vessel_id){
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
        deleteButton.classList.add('deleteSchedule');
        deleteButton.setAttribute('id', "delete_" + schedule.schedule_id);
        actionCell.appendChild(deleteButton);

        deleteButton.addEventListener('click', function (event) {
          deleteSchedule(schedule.schedule_id)
        });

        // Append the Action cell to the row
        row.appendChild(actionCell);

        // Append the row to the tbody
        tbody.appendChild(row);
      });
    }

    // Function to delete a schedule from Firestore
    async function deleteSchedule(scheduleID) {
      try {
          // Show a confirmation prompt to the user
          const confirmDelete = confirm('Do you want to delete this entry?');

          // If the user confirms the deletion
          if (confirmDelete) {
              // Delete the document with the corresponding ID from the "Schedules" collection
              const getSchedule = query(scheduleColRef, where('schedule_id', '==', scheduleID));

              getDocs(getSchedule)
                .then((querySnapshot) => {
                  if (!querySnapshot.empty) {
                    // If a document matching the search criteria is found, delete it
                    const doc = querySnapshot.docs[0]; // Get the first document (assuming it's unique)
                    const scheduleDocRef = doc.ref;

                    // Use deleteDoc to delete the document
                    return deleteDoc(scheduleDocRef);
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
              console.log('Schedule deleted successfully!');

              // Fetch the updated list of schedule
              await fetchSchedules();
          }
      } catch (error) {
          console.error('Error deleting schedule:', error);
      }
    }

    async function editSchedule(scheduleID, vesselID, scheduleName, scheduleFirstTrip, scheduleSecondTrip) {
        console.log(scheduleID)
        console.log(vesselID)
        console.log(scheduleName)
        console.log(scheduleSecondTrip)
        console.log(scheduleFirstTrip)
      try {
        // Check if any of the fields are empty
        if (!vesselID || !scheduleName || !scheduleSecondTrip || !scheduleFirstTrip) {
          alert('All fields must be filled out');
          return;
        }

        const dataToUpdate = {
            vessel_id: vesselID,
            schedule_name: scheduleName,
            schedule_first_trip: scheduleFirstTrip,
            schedule_second_trip: scheduleSecondTrip
        };

        const getSchedule = query(scheduleColRef, where('schedule_id', '==', scheduleID));

        getDocs(getSchedule)
          .then((querySnapshot) => {
            if (!querySnapshot.empty) {
              // If a document matching the search criteria is found, update it
              const doc = querySnapshot.docs[0]; // Get the first document (assuming it's unique)
              const scheduleDocRef = doc.ref;
              return setDoc(scheduleDocRef, dataToUpdate, { merge: true });
              // // Use getDoc to retrieve the current document data
              // return getDoc(scheduleDocRef);
            } else {
              console.log('Document not found');
            }
          })
          .then(() => {
            console.log('Document updated successfully');
            $("#editScheduleModal").modal("hide");

          })
          .catch((error) => {
            console.error('Error:', error);
          });
      } catch (error) {
        console.error('Error updating schedule:', error);
      }
    }

    // Get the form element
    const addScheduleForm = document.querySelector('#addScheduleModal form');

    if(addScheduleForm){
        console.log(addScheduleForm);

        // Add an event listener for the submit event
        addScheduleForm.addEventListener('submit', async (event) => {
          // Prevent the form from being submitted normally
          event.preventDefault();
    
          // Get the values from the form
          const vesselID = document.getElementById('vesselID').value;
          const scheduleName = document.getElementById('scheduleName').value;
          const scheduleFirstTrip = document.getElementById('scheduleFirstTrip').value;
          const scheduleSecondTrip = document.getElementById('scheduleSecondTrip').value;
    
          // Check if any of the fields are empty
          if (!scheduleName || !vesselID || !scheduleFirstTrip || !scheduleSecondTrip) {
            alert('All fields must be filled out');
            return;
          }
    
          // Call the addSchedule function with the entered data
          await addSchedule(vesselID, scheduleName, scheduleSecondTrip, scheduleFirstTrip);
    
          // Clear the form
          addScheduleForm.reset();
    
          // Fetch the updated list of schedule
          await fetchSchedules();
        });
    }
    

    const editScheduleForm = document.querySelector('#editScheduleModal form');

    if(editScheduleForm){
        // Add an event listener for the submit event
        editScheduleForm.addEventListener('submit', async (event) => {
          // Prevent the form from being submitted normally
          event.preventDefault();
    
          // Get the values from the form
          const scheduleID = document.getElementById('editScheduleID').value;
          const scheduleName = document.getElementById('editScheduleName').value;
          const vesselID = document.getElementById('editVesselID').value;
          const scheduleFirstTrip = document.getElementById('editScheduleFirstTrip').value;
          const scheduleSecondTrip = document.getElementById('editScheduleSecondTrip').value;
    
          // Check if any of the fields are empty
          if (!scheduleName || !vesselID || !scheduleFirstTrip || !scheduleSecondTrip) {
            alert('All fields must be filled out');
            return;
          }
    
          // Call the addSchedule function with the entered data
          await editSchedule(scheduleID, vesselID, scheduleName, scheduleFirstTrip, scheduleSecondTrip);
    
          // Clear the form
          editScheduleForm.reset();
    
          // Fetch the updated list of schedule
          await fetchSchedules();
        });
    
    
    }
    
    // Fetch the list of schedule when the page loads
    fetchSchedules();

    // test search
    var searchFor = "scheduleName";
    var searchVal = "Zhuming";
    searchSchedules(searchFor, searchVal);

    // Collection reference for schedules
    const schedulesColRef = collection(db, 'Schedule');


}

  