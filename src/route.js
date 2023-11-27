import {initializeApp} from '../node_modules/firebase/app'
import { getFirestore, collection, getDocs, addDoc, getDoc, query, where, orderBy, doc, deleteDoc, setDoc } from '../node_modules/firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, getStorage, uploadBytes, deleteObject } from "../node_modules/firebase/storage";

export function routeFunctions() {
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
    const app = initializeApp(firebaseConfig)
    console.log("APP",app);
    //init services
    const db = getFirestore()
    const routeColRef = collection(db, 'Vessel_Route');
    const vesselsColRef = collection(db, 'Vessel');
    const storage = getStorage(app);
    console.log("storage", storage)

    let route = [];

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

    async function uploadImage(file, routeUniqueID) {
      const storageRef = ref(storage, '/Places/' + routeUniqueID + file.name);
      const uploadTask = uploadBytes(storageRef, file);

      try {
        // Wait for the upload task to complete
        const snapshot = await uploadTask;

        // You can monitor the upload progress here if needed
        console.log('Image uploaded successfully!');

        // Get the download URL
        const downloadURL = await getDownloadURL(storageRef);
        console.log('Download URL:', downloadURL);

        // Return the download URL
        return downloadURL;
      } catch (error) {
        console.error('Error uploading image:', error);
        // Handle the error or rethrow it if needed
        throw error;
      }

   }
   

    // Function to add a new route to Firestore
    async function addRoute(vesselID, routeName, routeLocation, routeDestination, file, farePrice) {
      try {
        // Add a new document to the "Routes" collection with the entered data
        const routeUniqueID = uuidv4();
     
        // Fetch the vessel_name using the vessel_id
        const vesselName = await getVesselName(vesselID);
     
        // Add checker if route_name already exists
        const queryWithSearch = query(routeColRef, where("route_name", '==', routeName), where("vessel_id", '==', vesselID));
        // const routeNameInput = document.getElementById('routeName');
        // const routeName = routeNameInput.value;
     
        getDocs(queryWithSearch)
        .then(async (querySnapshot) => {
          if (!querySnapshot.empty) {
            throw new Error('Data already exists');
          } else {
            const imageURL = await uploadImage(file, routeUniqueID);
            console.log("IMAGEURL", imageURL)
            addDoc(routeColRef, {
              route_id: routeUniqueID,
              vessel_id: vesselID,
              vessel_name: vesselName,
              route_name: routeName,
              route_location: routeLocation,
              route_destination: routeDestination,
              fare_price : parseFloat(farePrice),
              image: imageURL
            });
            console.log('Route added successfully!');
            $("#addRouteModal").modal("hide");
          }
        })
      } catch (error) {
        console.error('Error adding route:', error);
      }
     }
     
     async function fetchRoutes() {
      try {
          const orderedQuery = query(routeColRef, orderBy('route_name', 'asc'));
          const route = [];
     
          const querySnapshot = await getDocs(orderedQuery);
          for (const doc of querySnapshot.docs) {
              var data = doc.data();
              route.push(data); // Add the data to the array
          }
     
          // Now, the "route" array contains the ordered documents
          console.log(route);
          displayRoutesInTable(route);
      } catch (error) {
          console.error('Error fetching route:', error);
      }
     }
     

    async function getVesselName(vesselID){
      const getVessel = query(vesselsColRef, where('vessel_id', '==', vesselID));
      const querySnapshot = await getDocs(getVessel);
      if (!querySnapshot.empty) {
          // If a document matching the search criteria is found, update it
          const doc = querySnapshot.docs[0]; // Get the first document (assuming it's unique)
          const data = doc.data().vessel_name;
          return data;
      }
  }

    async function searchRoutes(searchFor, searchVal) {
      try {
        const queryWithSearch = query(routeColRef, where(searchFor, '==', searchVal));
        const searvhRoutes = [];

        getDocs(queryWithSearch)
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            searvhRoutes.push(data); // Add the data to the array
          });

          // Now, the "route" array contains the ordered documents
          // console.log("searvhRoutes", searvhRoutes);
        })
        .catch((error) => {
          console.error('Error getting documents: ', error);
        });
      } catch (error) {
        console.error('Error fetching route:', error);
      }
    }

    // Function to display the route in an HTML table
    function displayRoutesInTable(route) {
      // Get the tbody element
      const tbody = document.getElementById('routeTbody');

      // Clear the tbody
      tbody.innerHTML = '';

      // Iterate over the route array and create table rows
      route.forEach(async (route, index) => {
        const row = document.createElement('tr');

        // Create table cells for each data field
        const routeImageCell = document.createElement('td');
        const routeImageButton = document.createElement('button');
        routeImageButton.textContent = 'View Route Image';
        routeImageButton.classList.add('btn', 'btn-primary');
        routeImageButton.addEventListener('click', function (event) {
          $("#viewRouteImageModal").modal("show");
          var modalBody = document.getElementById('viewRouteImageModalBody');
          var img = document.createElement('img');
          img.style.width = '100%';
          img.style.height = '100%';
          img.src=route.image;
          modalBody.appendChild(img);
        })

        routeImageCell.appendChild(routeImageButton);
        row.appendChild(routeImageCell);


        const vesselNameCell = document.createElement('td');
        vesselNameCell.textContent = route.vessel_name;
        row.appendChild(vesselNameCell);

        const routeNameCell = document.createElement('td');
        routeNameCell.textContent = route.route_name;
        row.appendChild(routeNameCell);

        const routeLocationCell = document.createElement('td');
        routeLocationCell.textContent = route.route_location;
        row.appendChild(routeLocationCell);

        const routeDestinationCell = document.createElement('td');
        routeDestinationCell.textContent = route.route_destination;
        row.appendChild(routeDestinationCell);

        const farePriceCell = document.createElement('td');
        farePriceCell.textContent = route.fare_price;
        row.appendChild(farePriceCell);

        // Create Action cell
        const actionCell = document.createElement('td');

        // Create Edit button
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.classList.add('btn', 'btn-success');
        editButton.classList.add('editRoute');
        editButton.setAttribute('id', "edit_" + route.route_id);
        actionCell.appendChild(editButton);

        editButton.addEventListener('click', function (event) {
          $("#editRouteModal").modal("show");
          $("#editRouteLocation").val(route.route_location);
          $("#editRouteName").val(route.route_name);
          $("#editRouteDestination").val(route.route_destination);
          $("#editRouteID").val(route.route_id);
          $("#editVesselID").val(route.vessel_id);

          const select  = document.getElementById('editVesselID');

          const orderedQuery  = query(vesselsColRef, orderBy('vessel_name', 'asc'));

          getDocs(orderedQuery)
          .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              const data = doc.data();
              const option = document.createElement('option');
              option.value = data.vessel_id; // Set the value attribute of the option
              option.text = data.vessel_name;  // Set the text content of the option
              if(data.vessel_id == route.vessel_id){
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
        deleteButton.classList.add('deleteRoute');
        deleteButton.setAttribute('id', "delete_" + route.route_id);
        actionCell.appendChild(deleteButton);

        deleteButton.addEventListener('click', function (event) {
          deleteRoute(route.route_id)
        });

        // Append the Action cell to the row
        row.appendChild(actionCell);

        // Append the row to the tbody
        tbody.appendChild(row);
      });
    }

    // Function to delete a route from Firestore
    async function deleteRoute(routeID) {
      try {
          // Show a confirmation prompt to the user
          const confirmDelete = confirm('Do you want to delete this entry?');

          // If the user confirms the deletion
          if (confirmDelete) {
              // Delete the document with the corresponding ID from the "Routes" collection
              const getRoute = query(routeColRef, where('route_id', '==', routeID));

              getDocs(getRoute)
                .then((querySnapshot) => {
                  if (!querySnapshot.empty) {
                    // If a document matching the search criteria is found, delete it
                    const doc = querySnapshot.docs[0]; // Get the first document (assuming it's unique)
                    const routeData = doc.data();
                    const routeDocRef = doc.ref;

                    const imageRef = ref(storage,routeData.image);
                    console.log("imageRef", imageRef);
                    // Delete the image
                    deleteObject(imageRef)
                      .then(() => {
                        // Use deleteDoc to delete the document
                        return deleteDoc(routeDocRef);
                      })
                      .catch((error) => {
                        console.error('Error deleting image:', error.message);
                      });
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
              console.log('Route deleted successfully!');

              // Fetch the updated list of route
              await fetchRoutes();
          }
      } catch (error) {
          console.error('Error deleting route:', error);
      }
    }

    async function editRoute(routeID, vesselID, routeName, routeLocation, routeDestination) {
        console.log(routeID)
        console.log(vesselID)
        console.log(routeName)
        console.log(routeLocation)
        console.log(routeDestination)
      try {
        // Check if any of the fields are empty
        if (!vesselID || !routeName || !routeLocation || !routeDestination) {
          alert('All fields must be filled out');
          return;
        }

        const dataToUpdate = {
            vessel_id: vesselID,
            route_name: routeName,
            route_location: routeLocation,
            route_destination: routeDestination
        };

        const getRoute = query(routeColRef, where('route_id', '==', routeID));

        getDocs(getRoute)
          .then((querySnapshot) => {
            if (!querySnapshot.empty) {
              // If a document matching the search criteria is found, update it
              const doc = querySnapshot.docs[0]; // Get the first document (assuming it's unique)
              const routeDocRef = doc.ref;
              return setDoc(routeDocRef, dataToUpdate, { merge: true });
              // // Use getDoc to retrieve the current document data
              // return getDoc(routeDocRef);
            } else {
              console.log('Document not found');
            }
          })
          .then(() => {
            console.log('Document updated successfully');
            $("#editRouteModal").modal("hide");

          })
          .catch((error) => {
            console.error('Error:', error);
          });
      } catch (error) {
        console.error('Error updating route:', error);
      }
    }

    // Get the form element
    const addRouteForm = document.querySelector('#addRouteModal form');

    if(addRouteForm){
      console.log(addRouteForm);

      // Add an event listener for the submit event
      addRouteForm.addEventListener('submit', async (event) => {
        // Prevent the form from being submitted normally
        event.preventDefault();
  
        // Get the values from the form
        const routeName = document.getElementById('routeName').value;
        const vesselID = document.getElementById('vesselID').value;
        const routeDestination = document.getElementById('routeDestination').value;
        const routeLocation = document.getElementById('routeLocation').value;
        const farePrice = document.getElementById('farePrice').value;
        const file = document.getElementById('routeImage').files[0];
        console.log("FILE UPLOADED: ", file)
  
        // Check if any of the fields are empty
        if (!routeName || !vesselID || !routeDestination || !routeLocation || !file || !farePrice) {
          alert('All fields must be filled out');
          return;
        }
  
        // Call the addRoute function with the entered data
        await addRoute(vesselID, routeName, routeLocation, routeDestination, file, farePrice);
  
        // Clear the form
        // addRouteForm.reset();
  
        // Fetch the updated list of route
        // await fetchRoutes();
      });
  }

    const editRouteForm = document.querySelector('#editRouteModal form');

    if(editRouteForm){
        // Add an event listener for the submit event
        editRouteForm.addEventListener('submit', async (event) => {
          // Prevent the form from being submitted normally
          event.preventDefault();
    
          // Get the values from the form
          const routeID = document.getElementById('editRouteID').value;
          const routeName = document.getElementById('editRouteName').value;
          const vesselID = document.getElementById('editVesselID').value;
          const routeDestination = document.getElementById('editRouteDestination').value;
          const routeLocation = document.getElementById('editRouteLocation').value;
    
          // Check if any of the fields are empty
          if (!routeName || !vesselID || !routeDestination || !routeLocation) {
            alert('All fields must be filled out');
            return;
          }
    
          // Call the addRoute function with the entered data
          await editRoute(routeID, vesselID, routeName, routeLocation, routeDestination);
    
          // Clear the form
          editRouteForm.reset();
    
          // Fetch the updated list of route
          await fetchRoutes();
        });
    
    
    }
    
    // Fetch the list of route when the page loads
    fetchRoutes();

    // test search
    var searchFor = "routeName";
    var searchVal = "Zhuming";
    searchRoutes(searchFor, searchVal);

    // Collection reference for routes
    const routesColRef = collection(db, 'Vessel_Route');


}

  