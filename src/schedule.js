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
      
      // Call the populateVessel function to fill the dropdown
      populateVessel();

    
    // Function to add a new schedule to Firestore
    async function addSchedule(vesselID, routeID, time, availableDays) {
      try {

        // Add a new document to the "Schedules" collection with the entered data
        const scheduleUniqueID = uuidv4();

        // Add checker if schedule_name already exists
        const queryWithSearch = query(scheduleColRef, where("vessel_id", '==', vesselID), where("route_id", '==', routeID), where("time", '==', time));
        var dataInsert = {
          schedule_id: scheduleUniqueID,
          vessel_id: vesselID,
          route_id: routeID,
          time: time,
          days: availableDays
        }
        console.log(dataInsert);
        getDocs(queryWithSearch)
        .then((querySnapshot) => {
          if (!querySnapshot.empty) {
            throw new Error('Data already exists');
          } else {
            addDoc(scheduleColRef, dataInsert);
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
        const orderedQuery = query(scheduleColRef, orderBy('time', 'asc'));
        const schedule = [];
    
        const querySnapshot = await getDocs(orderedQuery);
    
        for (const doc of querySnapshot.docs) {
          const data = doc.data();
          data.vessel_name = await getVesselName(data.vessel_id);
          data.route_name = await getRouteName(data.route_id);
          schedule.push(data);
        }
    
        console.log(schedule);
        displaySchedulesInTable(schedule);
      } catch (error) {
        console.error('Error fetching schedule:', error);
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
        const vesselNameCell = document.createElement('td');
        vesselNameCell.textContent = schedule.vessel_name;
        row.appendChild(vesselNameCell);

        const routeNameCell = document.createElement('td');
        routeNameCell.textContent = schedule.route_name;
        row.appendChild(routeNameCell);

        const timeCell = document.createElement('td');
        timeCell.textContent = schedule.time;
        row.appendChild(timeCell);

        const daysAvailableCell = document.createElement('td');
        daysAvailableCell.textContent = schedule.days;
        row.appendChild(daysAvailableCell);


     

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
          $("#editScheduleID").val(schedule.schedule_id);
          $("#editVesselID").val(schedule.vessel_id);
          $("#editRouteID").val(schedule.route_id);
          $("#editTime").val(schedule.time);
          var checkboxes = document.querySelectorAll('input[name="editday"]');
          var selectedDays = schedule.days;
          checkboxes.forEach(function(checkbox) {
            checkbox.checked = selectedDays.includes(checkbox.value);
          });

          const select  = document.getElementById('editVesselID');
          select.innerHTML = '';
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

          const selectRoute  = document.getElementById('editRouteID');
          selectRoute.innerHTML = '';
          const orderedRouteQuery  = query(routeColRef, where('vessel_id', '==', schedule.vessel_id));

          getDocs(orderedRouteQuery)
          .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              const data = doc.data();
              const option = document.createElement('option');
              option.value = data.route_id; // Set the value attribute of the option
              option.text = data.route_name;  // Set the text content of the option
              if(data.route_id == schedule.route_id){
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

    async function editSchedule(scheduleID, vesselID, routeID, time, days) {

      try {

        const dataToUpdate = {
            vessel_id: vesselID,
            route_id: routeID,
            time: time,
            days: days
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
        // Add an event listener for the submit event
        addScheduleForm.addEventListener('submit', async (event) => {
          // Prevent the form from being submitted normally
          event.preventDefault();

          var checkboxes = document.querySelectorAll('input[type="checkbox"]');
          var checkedValues = [];
    
          checkboxes.forEach(function(checkbox) {
            if (checkbox.checked) {
              checkedValues.push(checkbox.value);
            }
          });
    
          // Get the values from the form
          const vesselID = document.getElementById('vesselID').value;
          const routeID = document.getElementById('routeID').value;
          const time = document.getElementById('time').value;
    
          // Check if any of the fields are empty
          if (!routeID || !vesselID || !time || !checkedValues) {
            alert('All fields must be filled out');
            return;
          }
    
          // Call the addSchedule function with the entered data
          await addSchedule(vesselID, routeID, time, checkedValues);
    
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
    
          var checkboxes = document.querySelectorAll('input[name="editday"]');
          var checkedValues = [];
    
          checkboxes.forEach(function(checkbox) {
            if (checkbox.checked) {
              checkedValues.push(checkbox.value);
            }
          });

          console.log(checkedValues);
    
          // Get the values from the form
          const vesselID = document.getElementById('editVesselID').value;
          const scheduleID = document.getElementById('editScheduleID').value;
          const routeID = document.getElementById('editRouteID').value;
          const time = document.getElementById('editTime').value;
    
          // Check if any of the fields are empty
          if (!routeID || !vesselID || !time || !checkedValues) {
            alert('All fields must be filled out');
            return;
          }
    
          // Call the addSchedule function with the entered data
          await editSchedule(scheduleID, vesselID, routeID, time, checkedValues);
    
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

  