// import { initializeApp } from '../node_modules/firebase/app';
import { app } from './index';
import { getFirestore, collection, getDocs, addDoc, query, where, setDoc, deleteDoc, getDoc, count } from '../node_modules/firebase/firestore';

export function subscriptionFunctions() {
    const { v4: uuidv4 } = require('uuid');
    const db = getFirestore(app);
    // if (localStorage.getItem('adminSessionData') === null) {
    //     // Both items are empty, redirect to the index page
    //     window.location.replace("index.html");
    // }

    const subscriptionPlanData = document.getElementById('subscriptionPlanData');

    let currentData = [];
    //Display Subscription Plan List in Subscription Page
    async function fetchAndDisplaySubscriptionPlans() {
        try {
            const subscriptionPlansCollectionRef = collection(db, 'Subscription-Plan');
            const querySnapshot = await getDocs(subscriptionPlansCollectionRef);

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const newRow = document.createElement('tr');
                newRow.className = 'align-middle';

                const columns = ['subscriptionName', 'id', 'subscriptionFee', 'accountNumber'];

                columns.forEach((col) => {
                    const newCell = document.createElement('td');
                    if (col !== 'id') {
                        newCell.textContent = data[col] || '';
                        newRow.appendChild(newCell);
                    }
                });
                //Edit Button
                const actionCell = document.createElement('td');
                actionCell.className = 'action-btn';
                const editBtn = document.createElement('a');
                editBtn.className = 'text-info';
                editBtn.title = 'Edit';
                editBtn.dataset.bsToggle = 'modal';
                editBtn.dataset.bsTarget = '#editSubscriptionPlan';
                editBtn.innerHTML = "<i class='bx bx-edit'></i>";
                actionCell.appendChild(editBtn);

                editBtn.addEventListener('click', () => {
                    $('#editSubscriptionPlan').modal('show');
                    // Fill the edit modal with the data for editing
                    // extract the data and fill in your modal inputs
                    const subscriptionName = data['subscriptionName'];
                    const subscriptionFee = data['subscriptionFee'];
                    const accountNumber = data['accountNumber'];
                    const subPlanId = data['id'];
                    currentData = [subscriptionFee, accountNumber, subPlanId];

                    // Set these values in the modal's input fields for editing
                    document.getElementById('subscriptionPlanEdit').value = subscriptionName;
                    document.getElementById('subscriptionFeeEdit').value = subscriptionFee;
                    document.getElementById('subscriptionAccEdit').value = accountNumber;

                    updateData(currentData);
                    console.log(data['id']);
                    //Function that will save edited data
                });

                //Delete Button
                // const deleteButton = document.createElement('button');
                // deleteButton.textContent = 'Delete';
                // deleteButton.classList.add('btn', 'btn-danger');

                // // deleteButton.classList.add('deleteRoute');
                // // deleteButton.setAttribute('id', "delete_" + route.route_id);
                // actionCell.appendChild(deleteButton);

                const deleteBtn = document.createElement('a');
                deleteBtn.className = 'text-danger';
                deleteBtn.title = 'Delete';
                deleteBtn.innerHTML = "<i class='bx bx-trash'></i>";
                actionCell.appendChild(deleteBtn);
                // console.log(data['id']);
                //Listener
                deleteBtn.addEventListener('click', function (event) {
                    console.log("clicked");
                    const subscriptionID = data['id'];
                    deleteData(subscriptionID);
                    // if (event.target.classList.contains('text-danger')) {//ext-danger
                    //     // This condition checks if the clicked element has the class 'text-danger'
                    //     console.log('Delete button clicked');
                    //     const subscriptionID = data['id'];
                    //     deleteData(subscriptionID);
                    // }
                });


                newRow.appendChild(actionCell);
                subscriptionPlanData.appendChild(newRow);
            });
        } catch (error) {
            // console.error('Error fetching documents:', error);
        }
    }


    fetchAndDisplaySubscriptionPlans();

    //Add Subscription Plan
    const addSubPlanForm = document.getElementById('addSubsPlan');
    //Declare collection
    const subscribersColnRef = collection(db, 'Subscription-Plan');

    if (addSubPlanForm) {
        addSubPlanForm.addEventListener('submit', async function (event) {
            event.preventDefault();

            const querySnapshot = await getDocs(subscribersColnRef);
            const subscriptionPlanCount = querySnapshot.size;

            if (subscriptionPlanCount < 2) {
                const subscriptionPlan = document.getElementById('subscriptPlan').value;
                const subscriptionFee = document.getElementById('subscriptFee').value;
                const accountNo = document.getElementById('accountNum').value;

                const subscription_id = uuidv4();
                await addDoc(subscribersColnRef, {
                    subscriptionName: subscriptionPlan,
                    subscriptionFee: subscriptionFee,
                    accountNumber: accountNo,
                    id: subscription_id
                });
                // Clear the form
                document.getElementById('addSubsPlan').reset();

                // Display a success message
                createAlert('Successfully Added!');
                $("#addSubscriptionPlan").modal("hide");
                // fetchAndDisplaySubscriptionPlans();
            } else {
                // Display error message in the designated error-message element
                errorMessage('error-msg', 'err_msg', 'Subscription Plan is Limitted by 2!');
            }

        })
    }

    // Create the alert message for successfully created
    function createAlert(message) {
        const alertDiv = document.querySelector('.alert-container');
        alertDiv.querySelector('.alert').textContent = message;
        alertDiv.style.display = 'block';

        setTimeout(function () {
            alertDiv.style.display = 'none';

        }, 3000);
        console.log('hey');
    }

    //Edit Subscription Plan
    async function updateData(current) {

        const editForm = document.getElementById('editSubPlan');
        editForm.addEventListener('submit', async function (event) {
            event.preventDefault();
            const subFeeEdit = document.getElementById('subscriptionFeeEdit').value;
            const subAccEdit = document.getElementById('subscriptionAccEdit').value;
            //Check if there is changes in data but check first if there is input field 
            if (current[0] == subFeeEdit && current[1] == subAccEdit) {
                errorMessage('err-msg', 'error_msg', 'Theres no changes on data');
            } else {
                const id = current[2];
                const collectionRef = collection(db, "Subscription-Plan");
                const queryRef = query(collectionRef, where('id', '==', id));

                const newData = {
                    subscriptionFee: subFeeEdit,
                    accountNumber: subAccEdit
                }

                getDocs(queryRef)
                    .then((querySnapshot) => {
                        if (!querySnapshot.empty) {
                            // If a document matching the search criteria is found, update it
                            const doc = querySnapshot.docs[0]; // Get the first document (assuming it's unique)
                            const planDocRef = doc.ref;
                            return setDoc(planDocRef, newData, { merge: true });
                            // // Use getDoc to retrieve the current document data
                            return getDoc(planDocRef);
                        } else {
                            console.log('Document not found');
                        }
                    })
                    .then(() => {
                        console.log('Document updated successfully');

                        $("#editSubscriptionPlan").modal("hide");
                        // Add a log statement to check if the modal is hidden
                        // console.log('Modal hidden');
                        // fetchAndDisplaySubscriptionPlans();
                        // Reload the page
                        createAlert('Document updated successfully');
                        location.reload(true);


                    })
                    .catch((error) => {
                        console.error('Error:', error);
                    });
            }

        })

    }

    //Delete Subscription Plan
    async function deleteData(subscriptionID) {
        try {
            const confirmDelete = confirm("Do you want to delete this plan?");

            //If the user confirm the delete
            if (confirmDelete) {
                const collectionRef = collection(db, "Subscription-Plan");
                const queryRef = query(collectionRef, where('id', '==', subscriptionID));
                console.log("Trigger");

                getDocs(queryRef)
                    .then((querySnapshot) => {
                        if (!querySnapshot.empty) {
                            // If a document matching the search criteria is found, delete it
                            const doc = querySnapshot.docs[0]; // Get the first document (assuming it's unique)
                            const subPlanRef = doc.ref;

                            // Use deleteDoc to delete the document
                            return deleteDoc(subPlanRef);
                        } else {
                            console.log('Document not found');
                        }
                    })
                    .then(() => {
                        console.log('Document deleted successfully');
                        createAlert('Document deleted successfully');
                    })
                    .catch((error) => {
                        console.error('Error:', error);
                    });
            }
        } catch (error) {
            console.error('Error deleting Subscription Plan:', error);
        }
    }

    // Create the alert message for successfully created

    //Function for error message for modal
    function errorMessage(errorDiv, errortag, errorMessage) {
        // Display error message in the designated error-message element
        const errorMessageElement = document.getElementById(errortag);
        errorMessageElement.textContent = errorMessage;

        // Show both the error-message and errormsg elements
        const errorDivElement = document.getElementById(errorDiv);
        errorDivElement.style.display = 'block'; // Show the error message div

        // Hide error message after 3 seconds
        setTimeout(function () {
            // console.log('Timeout executed');
            errorDivElement.style.display = 'none';
            // window.location.reload(true);
            // console.log('Modal hidden');
            // fetchAndDisplaySubscriptionPlans();
        }, 3000);
    }

    /******* SUBSCRIPTION START HERE *******/

    //Function that will calculate daysLeft and update it to the database before fetching
    async function fetchDateAndUpdateDaysLeft() {
        try {
            const subscribersCollectionRef = collection(db, 'Subscribers');
            const querySnapshot = await getDocs(subscribersCollectionRef);

            const currentStartDate = [];
            const currentEndDate = [];
            const subDocID = [];

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                currentStartDate.push(data['subscription_startDate']);
                currentEndDate.push(data['subscription_endDate']);
                subDocID.push(data['agency_id'])
            });

            const daysLeft = calculateDaysLeft(currentEndDate);

            for (let i = 0; i < daysLeft.length; i++) {
                const collectionRef = collection(db, "Subscribers");
                const queryRef = query(collectionRef, where('agency_id', '==', subDocID[i]));

                const newData = {
                    subscription_daysLeft: daysLeft[i]
                }

                getDocs(queryRef)
                    .then((querySnapshot) => {
                        if (!querySnapshot.empty) {
                            // If a document matching the search criteria is found, update it
                            const doc = querySnapshot.docs[0]; // Get the first document (assuming it's unique)
                            const subsDocRef = doc.ref;
                            return setDoc(subsDocRef, newData, { merge: true });
                        } else {
                            console.log('Document not found');
                        }
                    })
                    .then(() => {
                        console.log('Document updated successfully');
                    })
                    .catch((error) => {
                        console.error('Error:', error);
                    });
            }

        } catch (error) {
            // console.error('Error fetching documents:', error);
        }
    }



    fetchDateAndUpdateDaysLeft();

    // Function that will calculate the days left
    function calculateDaysLeft(endDate) {
        const daysLeftArray = [];
        for (let i = 0; i < endDate.length; i++) {
            const endDateFormatted = endDate[i];
            const currentDate = new Date();
            const _endDate = new Date(endDateFormatted);

            // Calculate days left
            const daysLeft = Math.round((_endDate - currentDate) / (1000 * 60 * 60 * 24));
            daysLeftArray.push(daysLeft);
        }

        return daysLeftArray;
    }

    async function getPlan() {
        const planArray = [];
        try {
            const CollectionRef = collection(db, 'Subscription-Plan');
            const querySnapshot = await getDocs(CollectionRef);

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                // console.log("This is the data: ", data.subscriptionFee);
                planArray.push(data.subscriptionFee);
            });
            return planArray;
        } catch (error) {
            // console.error('Error fetching documents:', error);
        }
    }
    // getPlan();

    //Fetch Data and populate in the table
    const subscriberListData = document.getElementById('SubscriptionDetails');

    //Display Subscribers Data
    const fetchAndDisplaySubscribers = async () => {
        try {
            const subscribersCollectionRef = collection(db, 'Subscribers');
            const querySnapshot = await getDocs(subscribersCollectionRef);

            const plan = await getPlan(); //Fetch data of planFee 

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const newRow = document.createElement('tr');
                newRow.className = 'align-middle';

                const userStatus = document.createElement('td');
                const statusElement = document.createElement('p');
                statusElement.className = 'status';
                // statusElement.textContent = data.userStatus === 'active' ? 'Active' : 'Inactive';
                if (data.subscription_status === 'active') {
                    statusElement.textContent = 'Active';
                    statusElement.style.backgroundColor = '#A6FFA6';
                    statusElement.style.color = '#027B07';
                } else if (data.subscription_status === 'inactive') {
                    statusElement.textContent = 'Inactive';
                    statusElement.style.backgroundColor = '#f3b699';
                    statusElement.style.color = '#ff0000';
                } else if (data.subscription_status === 'hold') {
                    statusElement.textContent = 'Hold';
                    statusElement.style.backgroundColor = '#a6ceff';
                    statusElement.style.color = '#3b49f7';
                }
                statusElement.style.padding = '5px 7px'; // Adding padding around the text
                userStatus.appendChild(statusElement);

                const columns = ['companyName', 'subscriptionPlan', 'subscription_startDate', 'subscription_endDate', 'subscription_daysLeft'];

                columns.forEach((col) => {
                    const newCell = document.createElement('td');

                    if (col === 'subscriptionPlan') {
                        // Modify the content for the 'subscriptionPlan' column
                        newCell.textContent = data[col] === 'Monthly' ? plan[0] + '/mon' : plan[1] + '/yr';
                    } else {
                        // Display the original content for other columns
                        newCell.textContent = data[col] || '';
                    }

                    newRow.appendChild(newCell);
                });

                // Action buttons
                const actionCell = document.createElement('td');
                actionCell.className = 'action-btn';

                // Edit Button
                const editBtn = document.createElement('a');
                editBtn.className = 'text-info';
                editBtn.title = 'Edit';
                editBtn.dataset.bsToggle = 'modal';
                editBtn.dataset.bsTarget = '#editSubscription';
                editBtn.innerHTML = "<i class='bx bx-edit'></i>";
                actionCell.appendChild(editBtn);

                editBtn.addEventListener('click', () => {
                    $('#editSubscription').modal('show');
                    // Fill the edit modal with the data for editing
                    // extract the data and fill in your modal inputs
                    document.getElementById('subscriberName').value = data['companyName'];
                    document.getElementById('subscriptionPlanRead').value = data['subscriptionPlan'];
                    // console.log("Detected", data['subscriptionPlan']);
                    document.getElementById('subscriptionDateEdit').value = data['subscription_startDate'];
                    document.getElementById('renewalEdit').value = data['subscription_endDate'];
                    document.getElementById('daysleftEdit').value = data['subscription_daysLeft'];
                    const userStat = data['subscription_status']
                    // Set these values in the modal's input fields for editing
                    document.getElementById('statusSeleted').value = userStat;
                    const userID = data['agency_id'];
                    currentData = [userStat, userID];
                    // console.log(currentData);
                    updateSubscription(currentData);
                    console.log(currentData);
                    //Function that will save edited data
                });

                // Delete Button
                const deleteBtn = document.createElement('a');
                deleteBtn.className = 'text-danger';
                deleteBtn.title = 'Delete';
                deleteBtn.innerHTML = "<i class='bx bx-trash'></i>";
                actionCell.appendChild(deleteBtn);
                //Listener
                deleteBtn.addEventListener('click', function (event) {
                    // console.log("clicked");
                    const subscriptionID = data['agency_id'];
                    // console.log(subscriptionID);
                    deleteSubscription(subscriptionID);
                });

                newRow.appendChild(userStatus);
                newRow.appendChild(actionCell);
                subscriberListData.appendChild(newRow);
            });
        } catch (error) {
            // console.error('Error fetching documents:', error);
        }
    };

    fetchAndDisplaySubscribers();

    //Edit Subscription Plan
    async function updateSubscription(current) {

        const editForm = document.getElementById('editSubscriptions');
        editForm.addEventListener('submit', async function (event) {
            event.preventDefault();
            const editStatus = document.getElementById('statusSeleted').value;
            //Check if there is changes in data but check first if there is input field 
            if (current[0] == editStatus) {
                errorMessage('err-msg', 'error_msg', 'Theres no changes on data');
            } else {
                const id = current[1];
                const collectionRef = collection(db, "Subscribers");
                const queryRef = query(collectionRef, where('agency_id', '==', id));

                const newData = {
                    subscription_status: editStatus,
                }

                getDocs(queryRef)
                    .then((querySnapshot) => {
                        if (!querySnapshot.empty) {
                            // If a document matching the search criteria is found, update it
                            const doc = querySnapshot.docs[0]; // Get the first document (assuming it's unique)
                            const SubsDocRef = doc.ref;
                            return setDoc(SubsDocRef, newData, { merge: true });
                            // // Use getDoc to retrieve the current document data
                            // return getDoc(SubsDocRef);
                        } else {
                            console.log('Document not found');
                        }
                    })
                    .then(() => {
                        console.log('Document updated successfully');

                        $("#editSubscription").modal("hide");
                        createAlert('Document updated successfully');
                        location.reload(true);


                    })
                    .catch((error) => {
                        console.error('Error:', error);
                    });
            }

        })

    }


    //Delete Subscription 
    async function deleteSubscription(subscriptionID) {
        try {
            const confirmDelete = confirm("Do you want to delete this plan?");

            //If the user confirm the delete
            if (confirmDelete) {
                const collectionRef = collection(db, "Subscribers");
                const queryRef = query(collectionRef, where('agency_id', '==', subscriptionID));
                deleteTravelAgencyRecord(subscriptionID);
                // console.log("Trigger");

                getDocs(queryRef)
                    .then((querySnapshot) => {
                        if (!querySnapshot.empty) {
                            // If a document matching the search criteria is found, delete it
                            const doc = querySnapshot.docs[0]; // Get the first document (assuming it's unique)
                            const subRef = doc.ref;

                            // Use deleteDoc to delete the document
                            return deleteDoc(subRef);
                        } else {
                            console.log('Document not found');
                        }
                    })
                    .then(() => {
                        console.log('Document deleted successfully');
                        createAlert('Document deleted successfully');
                        location.reload(true);
                    })
                    .catch((error) => {
                        console.error('Error:', error);
                    });
            }
        } catch (error) {
            // console.error('Error deleting Subscriber:', error);
        }
    }

    async function deleteTravelAgencyRecord(id) {
        const collectionRef = collection(db, "Travel_agencies");
        const queryRef = query(collectionRef, where('id', '==', id));
        getDocs(queryRef)
            .then((querySnapshot) => {
                if (!querySnapshot.empty) {
                    const doc = querySnapshot.docs[0];
                    const travRef = doc.ref;
                    console.log("Deleted: ", travRef);

                    // Use deleteDoc to delete the document
                    return deleteDoc(travRef);
                } else {
                    console.log('Document not found');
                }
            })
            .then(() => {
                console.log('Document travel deleted successfully');
                // createAlert('Document deleted successfully');
                // location.reload(true);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }
}