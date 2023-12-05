import { app } from './index';
import { getFirestore, collection, getDocs, addDoc, query, where, updateDoc, setDoc, deleteDoc, getDoc, count } from '../node_modules/firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "../node_modules/firebase/storage";
import { getAuth } from '../node_modules/firebase/auth';

export function accountsFunctions() {
    const { v4: uuidv4 } = require('uuid');
    const bcrypt = require('bcryptjs');
    const db = getFirestore(app);
    const auth = getAuth(app);
    const storage = getStorage(app);
    // if (localStorage.getItem('adminSessionData') === nulll) {
    //     // Both items are empty, redirect to the index page
    //     window.location.replace("index.html");
    // }

    /***** This part will display the count of users *****/
    //Mobile and web Count
    const mobUserCountElement = document.getElementById('mobileUser-Count');
    const webUserCountElement = document.getElementById('webUser-Count');
    const adminCountElement = document.getElementById('adminUser-Count');
    // Reference to your collection
    const mobCollectionRef = collection(db, 'Passengers');
    const webCollectionRef = collection(db, 'Subscribers');
    const adminCollectionRef = collection(db, 'Admin');

    /***** This part will get selected value from menu and display table according to selected *****/
    const adminDataList = document.getElementById('adminTableBody');
    const mobileDataList = document.getElementById('mobileTableBody');
    const webDataList = document.getElementById('webTableBody');

    const tableSelector = document.getElementById('userTableSelector');

    let select = "";
    // const defaultSelectedTable = tableSelector.value;
    if (tableSelector) {
        if (tableSelector) {
            tableSelector.addEventListener('change', function (event) {
                const selectedTable = this.value;
                // console.log("This is the value: ", selectedTable);
                showSelectedTable(selectedTable);
            });

            // Initial display based on default selection
            showSelectedTable(tableSelector.value);
        }
    }

    function showSelectedTable(selectedTable) {
        // Hide all tables
        document.querySelectorAll('table').forEach(table => {
            table.style.display = 'none';
        });

        const selectedTableElement = document.getElementById(selectedTable);

        if (selectedTable === 'mobile') {
            mobileTableData('Passengers', mobileDataList)
        } else if (selectedTable === 'web') {
            TableData('Travel_agencies', selectedTable, webDataList);
        } else {
            TableData('Admin', selectedTable, adminDataList);
        }

        // Display the selected table
        if (selectedTableElement) {
            selectedTableElement.style.display = 'table';
        } else {
            console.error('Selected table not found.');
        }
    }

    let tableUse = "";
    let currentData = [];
    //Display admin table body
    async function TableData(collectionName, selectedTable, tBody) { //NEED PA E FINALIZE 
        try {
            // Call function to reset tbody data before populating again to avoid duplication
            resetTable(document.getElementById(tBody.id));
            const adminCollectionRef = collection(db, collectionName);
            const querySnapshot = await getDocs(adminCollectionRef);

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const newRow = document.createElement('tr');
                newRow.className = 'align-middle';

                const columns = [];
                if (selectedTable == 'web') {
                    columns.push(['companyName', 'agency_email', 'agency_password']);
                } else {
                    columns.push(['adminName', 'admin_email', 'admin_password']);
                }

                columns.forEach((col) => {
                    col.forEach((fieldName) => {
                        const newCell = document.createElement('td');
                        newCell.textContent = data[fieldName] || '';
                        newRow.appendChild(newCell);
                    });
                });
                //Edit Button
                const actionCell = document.createElement('td');
                actionCell.className = 'action-btn';
                const editBtn = document.createElement('a');
                editBtn.className = 'text-info';
                editBtn.title = 'Edit';
                // editBtn.dataset.bsToggle = 'modal';
                // editBtn.dataset.bsTarget = '#editAdminAccounts';
                editBtn.innerHTML = "<i class='bx bx-edit'></i>";
                actionCell.appendChild(editBtn);

                editBtn.addEventListener('click', () => {
                    //Open Specific Modal
                    if (selectedTable === 'web') {
                        $('#editAgencyAccounts').modal('show');
                        document.getElementById('editWeb').value = data['companyName'];
                        document.getElementById('editWebEmail').value = data['agency_email'];
                        document.getElementById('editWebPass').value = data['agency_password'];
                        currentData = [data['agency_id'], data['companyName'], data['agency_email'], data['agency_password']];
                        select = "edit";
                        tableUse = "web";
                        editWebAccount(currentData);
                    } else {
                        // editBtn.dataset.bsTarget = '#editAdminAccounts';
                        $('#editAdminAccounts').modal('show');
                        document.getElementById('editAdmin').value = data['adminName'];
                        document.getElementById('editAdminEmail').value = data['admin_email'];
                        document.getElementById('editAdminPass').value = data['admin_password'];
                        currentData = [data['admin_id'], data['adminName'], data['admin_email'], data['admin_password']];
                        select = "edit";
                        tableUse = "admin";
                        editAdminAccount(currentData);
                    }

                    // updateData(currentData);
                    console.log("TRIGGER BY YOU");
                    //Function that will save edited data
                });
                const deleteBtn = document.createElement('a');
                deleteBtn.className = 'text-danger';
                deleteBtn.title = 'Delete';
                deleteBtn.innerHTML = "<i class='bx bx-trash'></i>";
                actionCell.appendChild(deleteBtn);
                // console.log(data['id']);
                //Listener
                deleteBtn.addEventListener('click', function (event) {
                    // console.log("clicked");
                    if (selectedTable == 'web') {
                        const userID = data['agency_id'];
                        console.log('Proccessing..');
                        deleteWeb(userID);
                    } else {
                        const userID = data['admin_id'];
                        console.log('Proccessing..');
                        deleteAdmin(userID);
                    }

                });


                newRow.appendChild(actionCell);
                tBody.appendChild(newRow);
            });

        } catch (error) {
            // console.error('Error fetching documents:', error);
        }
    }

    //Display mobile table body
    async function mobileTableData(collectionName, tBody) {
        try {
            // Call function to reset tbody data before populating again to avoid duplication
            resetTable(document.getElementById(tBody.id));
            const adminCollectionRef = collection(db, collectionName);
            const querySnapshot = await getDocs(adminCollectionRef);

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const newRow = document.createElement('tr');
                newRow.className = 'align-middle';

                const columns = ['name', 'email', 'phoneNumber'];

                columns.forEach((fieldName) => {
                    const newCell = document.createElement('td');
                    newCell.textContent = data[fieldName] || '';
                    newRow.appendChild(newCell);
                });

                const actionCell = document.createElement('td');
                actionCell.className = 'action-btn';

                const deleteBtn = document.createElement('a');
                deleteBtn.className = 'text-danger';
                deleteBtn.title = 'Delete';
                deleteBtn.innerHTML = "<i class='bx bx-trash'></i>";
                actionCell.appendChild(deleteBtn);

                // Listener
                deleteBtn.addEventListener('click', function (event) {
                    const userID = data['userID'];
                    deleteMobile(userID);
                });

                newRow.appendChild(actionCell);
                tBody.appendChild(newRow);
            });
        } catch (error) {
            // Handle errors
            console.error('Error fetching documents:', error);
        }
    }


    // Function to reset table data
    function resetTable(tBody) {
        tBody.innerHTML = '';  // Clear the inner HTML of the tbody
    }

    // Function to check password validity
    function checkPasswordValidity(password) {
        const MIN_PASSWORD_LENGTH = 8;
        return password.length >= MIN_PASSWORD_LENGTH;
    }


    //Get Upload Image
    var adminProfile;
    // Function to handle file upload
    const profileElement = document.getElementById('profile');
    if (profileElement) {
        profileElement.addEventListener('change', async function (event) {
            event.preventDefault(); // Prevent the default link behavior

            const file = event.target.files[0];

            // Create a reference to the file in Firebase Storage
            // const storageRef = ref(storage, `images/${file.name}`);
            if (file) {
                const storageRef = ref(storage, `AdminProfiles/${file.name}`);
                // Upload the file using put method
                const uploadTask = uploadBytesResumable(storageRef, file);

                // Get the download URL after the upload is complete
                uploadTask.on('state_changed', (snapshot) => {
                },
                    (error) => {
                        console.error('Error uploading file:', error);
                    },
                    async () => {
                        errorMessage('error-msg', 'err_msg', 'Verifying image...', 'bg-primary');
                        adminProfile = await getDownloadURL(uploadTask.snapshot.ref);
                        errorMessage('error-msg', 'err_msg', 'Image verified!', 'bg-success');
                        console.log('File uploaded and download URL:', adminProfile);
                        // Further operations using downloadURL if needed
                    }
                );
            }
        });
    }


    //Add Subscription Plan
    const addAdminForm = document.getElementById('addAdminForm');
    //Declare collection
    const AdminCollectionnRef = collection(db, 'Admin');
    let dataCollection = [];

    if (addAdminForm) {
        addAdminForm.addEventListener('submit', async function (event) {
            event.preventDefault();

            const adminName = document.getElementById('adminName').value;
            const adminEmail = document.getElementById('adminEmail').value;
            const adminPass = document.getElementById('adminPass').value;

            // Check for password validity
            if (!checkPasswordValidity(adminPass)) {
                errorMessage('error-msg', 'err_msg', "Password must be at least 8 characters long.", 'bg-danger');
            }
            dataCollection = [adminName, adminEmail, adminPass, adminProfile];
            console.log("Heeyy: ", dataCollection);

            select = "add";
            $("#account-addUser").modal("hide");
            $("#otpVerification").modal("show");
            sendVerificationCode(adminEmail)
            // errorMessage('error-msg', 'err_msg', "Email address verified", 'bg-success');
            // saveData(adminName, adminEmail, adminPass, adminProfile);
        });
    }

    //Function that will save data from add admin form
    async function saveData(adminName, adminEmail, adminPass, adminProfile) {
        try {
            const id = uuidv4();
            const hashedUserPassword = await hashPassword(adminPass);
            if (hashedUserPassword) {
                await addDoc(AdminCollectionnRef, {
                    adminName: adminName,
                    admin_email: adminEmail,
                    admin_password: hashedUserPassword,
                    admin_profile: adminProfile,
                    admin_id: id,
                });
            }
            // Clear the form
            document.getElementById('addAdminForm').reset();

            // Display a success message
            createAlert('Successfully Added!');
            $("#otpVerification").modal("hide");
            location.reload(true);
        } catch (error) {
            // const errorMessage = error.message || 'Failed to add';
            errorMessage('error-msg', 'err_msg', "errorMessage", 'bg-danger');
        }
    }

    // Your hashPassword function
    async function hashPassword(password) {
        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            return hashedPassword;
        } catch (error) {
            console.error('Error hashing password:', error);
            throw error; // You might want to handle or log the error appropriately
        }
    }

    // Retrieve the stored verification code 
    var adminOtpCode = "";
    function generateVerificationCode() {
        return Math.floor(100000 + Math.random() * 900000);
    }

    let data = [];
    // Function to send an email
    function sendVerificationCode(email) {
        // let ok = false;
        const companyName = "CallArboat";
        const yourContactInfo = "091297343221";
        adminOtpCode = generateVerificationCode();

        let messageBody = `
            <div>
                <h2>${companyName} - Admin One-Time Passcode for Verification</h2>
                <p>Dear Admin User,</p>
                <p>We hope this message finds you well. Thank you for being part of ${companyName}.</p>
                <p>As part of our security measures, we have generated a one-time passcode (OTP) for verification purposes. Please use the following code to complete the verification process:</p>
                <p><strong>Admin OTP Code:</strong> ${adminOtpCode}</p>
                <p>This code is valid for a single use and will expire after a short period for security reasons. If you did not request this code or if you have any concerns, please contact our support team immediately.</p>
                <p>Thank you for your commitment to the security of ${companyName}. We appreciate your diligence in maintaining the integrity of the admin account.</p>
                <p>Best regards,<br>
                ${companyName}<br>
                ${yourContactInfo}</p>
            </div>
            `;

        // console.log("Sending OTP to email:", email);
        // console.log("Sending OTP :", adminOtpCode);
        // console.log("Email content:", messageBody);

        Email.send({
            SecureToken: "d073d44f-dba7-40ec-90a0-45b2284aa842",
            To: email,
            From: "callarboat@gmail.com",
            Subject: "OTP Verification Code",
            Body: messageBody
        }).then(
            message => {
                if (message === "OK") {
                    alert("OTP sent to your email " + email);
                    const otpForm = document.getElementById('enterOTPForm');
                    const otpInput = document.getElementById('otpCode');
                    if (otpForm) {
                        otpForm.addEventListener('submit', (event) => {
                            event.preventDefault(); // Prevent the form from submitting in the default way

                            // Now check whether the entered OTP is valid
                            const enteredOTP = otpInput.value;

                            if (enteredOTP == adminOtpCode) {
                                console.log("OTP enter is correct");
                                if (select == 'add') {
                                    errorMessage('error-msg', 'err_msg', "OTP entered is correct", 'bg-success');
                                    errorMessage('error-msg', 'err_msg', "Email address verified", 'bg-success');
                                    saveData(dataCollection[0], dataCollection[1], dataCollection[2], dataCollection[3]);
                                } else {
                                    errorMessage('error-msg', 'err_msg', "OTP entered is correct", 'bg-success');
                                    errorMessage('error-msg', 'err_msg', "Email address verified", 'bg-success');
                                    if (tableUse == 'admin') {
                                        saveAdmin(data);
                                    } else {
                                        saveWeb(data);
                                    }

                                }
                            } else {
                                errorMessage('error-msg', 'err_msg', 'Invalid OTP...', 'bg-danger');
                            }
                        });
                    }
                } else {
                    console.error("Failed to send OTP. Check SMTP configuration and email content.");
                }
            }
        );
    }


    // Create the alert message for successfully created
    function createAlert(message) {
        const alertDiv = document.querySelector('.alert-container');
        alertDiv.querySelector('.alert').textContent = message;
        alertDiv.style.display = 'block';

        setTimeout(function () {
            alertDiv.style.display = 'none';
        }, 3000);
    }

    //Function for error message for modal
    function errorMessage(errorDiv, errortag, errorMessage, color) {
        // Display error message in the designated error-message element
        const errorMessageElement = document.getElementById(errortag);
        errorMessageElement.textContent = errorMessage;
        // Remove any existing background color classes
        errorMessageElement.classList.remove('bg-danger', 'bg-success', 'bg-info', 'bg-warning', 'bg-primary');

        // Add Bootstrap's primary background color class
        errorMessageElement.classList.add(color);

        // Show both the error-message and errormsg elements
        const errorDivElement = document.getElementById(errorDiv);
        errorDivElement.style.display = 'block'; // Show the error message div

        // Hide error message after 3 seconds
        setTimeout(function () {
            errorDivElement.style.display = 'none';
        }, 3000);
    }



    async function editAdminAccount(currentData) {
        const adminEditForm = document.getElementById('editAdminAcc');
        let okay;
        if (adminEditForm) {
            adminEditForm.addEventListener('submit', async function (event) {
                event.preventDefault();
                const updatedAdminName = document.getElementById('editAdmin').value;
                const updatedEmail = document.getElementById('editAdminEmail').value;
                const updatedPassword = document.getElementById('editAdminPass').value;
                console.log(updatedAdminName, " ", updatedEmail, " ", updatedPassword);

                if (currentData[1] == updatedAdminName && currentData[2] == updatedEmail && currentData[3] == updatedPassword) {
                    errorMessage('error-msg', 'err_msg', "There's no changes on data", 'bg-danger');
                } else {
                    // Check for password validity
                    if (!checkPasswordValidity(adminPass)) {
                        errorMessage('error-msg', 'err_msg', "Password must be at least 8 characters long.", 'bg-danger');
                    }

                    // Check is email is change
                    if (updatedEmail !== currentData[2]) {
                        $("#editAdminAccounts").modal("hide");
                        $("#otpVerification").modal("show");
                        sendVerificationCode(updatedEmail);
                        data = [updatedAdminName, updatedEmail, updatedPassword];
                    } else {
                        saveAdmin([updatedAdminName, updatedEmail, updatedPassword]);
                    }

                }

            });
        }
    }

    async function saveAdmin(updatedData) {
        const id = currentData[0];
        console.log(id);
        const collectionRef = collection(db, "Admin");
        const queryRef = query(collectionRef, where('admin_id', '==', id));
        const hashedUserPassword = await hashPassword(updatedData[2]);
        const newData = {
            adminName: updatedData[0],
            admin_email: updatedData[1],
            admin_password: hashedUserPassword,
        }
        console.log(newData);
        const querySnapshot = await getDocs(queryRef);

        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            const adminDocRef = doc.ref;

            // Update Firestore document
            await setDoc(adminDocRef, newData, { merge: true });
        }
        $("#otpVerification").modal("hide");
        createAlert('Document updated successfully');
        location.reload(true);
    }

    // DELETE ADMIN ACCOUNT
    async function deleteAdmin(adminID) {
        try {
            const confirmDelete = confirm("Do you want to delete this account?");

            // If the user confirms the delete
            if (confirmDelete) {
                const collectionRef = collection(db, "Admin");
                const queryRef = query(collectionRef, where('admin_id', '==', adminID));

                const querySnapshot = await getDocs(queryRef);

                // Check if any documents match the search criteria
                if (!querySnapshot.empty) {
                    // Loop through the documents and delete each one
                    querySnapshot.forEach((doc) => {
                        const adminRef = doc.ref;

                        // Use deleteDoc to delete the document
                        deleteDoc(adminRef)
                            .then(() => {
                                console.log('Document deleted successfully');
                                createAlert('Document deleted successfully');
                                location.reload(true);
                            })
                            .catch((error) => {
                                console.error('Error deleting document:', error);
                            });
                    });
                } else {
                    console.log('Document not found');
                }
            }
        } catch (error) {
            console.error('Error deleting Admin:', error);
        }
    }


    //****** Admin Part End ******

    // ***** MOBILE PART ******
    async function deleteMobile(userID) {
        try {
            const confirmDelete = confirm("Do you want to delete this account?");

            // If the user confirms the delete
            if (confirmDelete) {
                const collectionRef = collection(db, "Passengers");
                const queryRef = query(collectionRef, where('userID', '==', userID));

                const querySnapshot = await getDocs(queryRef);

                // Check if any documents match the search criteria
                if (!querySnapshot.empty) {
                    // Loop through the documents and delete each one
                    querySnapshot.forEach((doc) => {
                        const adminRef = doc.ref;

                        // Use deleteDoc to delete the document
                        deleteDoc(adminRef)
                            .then(() => {
                                console.log('Document deleted successfully');
                                createAlert('Document deleted successfully');
                                location.reload(true);
                            })
                            .catch((error) => {
                                console.error('Error deleting document:', error);
                            });
                    });
                } else {
                    console.log('Document not found');
                }
            }
        } catch (error) {
            console.error('Error deleting Admin:', error);
        }
    }

    // ******* END HERE*******

    // *********** WEB PART************
    // EDIT AGENCY DATA
    async function editWebAccount(currentData) {
        const webEditForm = document.getElementById('editWebAcc');
        if (webEditForm) {
            webEditForm.addEventListener('submit', async function (event) {
                event.preventDefault();
                const updatedAgencyName = document.getElementById('editWeb').value;
                const updatedEmail = document.getElementById('editWebEmail').value;
                const updatedPassword = document.getElementById('editWebPass').value;
                console.log(updatedAgencyName, " ", updatedEmail, " ", updatedPassword);

                if (currentData[1] == updatedAgencyName && currentData[2] == updatedEmail && currentData[3] == updatedPassword) {
                    errorMessage('error-msg', 'err_msg', "There's no changes on data", 'bg-danger');
                } else {
                    // Check for password validity
                    if (!checkPasswordValidity(adminPass)) {
                        errorMessage('error-msg', 'err_msg', "Password must be at least 8 characters long.", 'bg-danger');
                    }

                    // Check is email is change
                    if (updatedEmail !== currentData[2]) {
                        $("#editAgencyAccounts").modal("hide");
                        $("#otpVerification").modal("show");
                        sendVerificationCode(updatedEmail);
                        data = [updatedAgencyName, updatedEmail, updatedPassword];
                    } else {
                        saveWeb([updatedAgencyName, updatedEmail, updatedPassword]);
                    }

                }

            });
        }
    }

    //SAVE TRAVEL AGENCY
    async function saveWeb(updatedData) {
        const id = currentData[0];
        console.log(id);
        const collectionRef = collection(db, "Travel_agencies");
        const queryRef = query(collectionRef, where('agency_id', '==', id));
        const hashedUserPassword = await hashPassword(updatedData[2]);
        if (hashedUserPassword) {
            const newData = {
                adminName: updatedData[0],
                agency_email: updatedData[1],
                agency_password: hashedUserPassword,
            }
            console.log(newData);
            const querySnapshot = await getDocs(queryRef);

            if (!querySnapshot.empty) {
                const doc = querySnapshot.docs[0];
                const agencyDocRef = doc.ref;

                // Update Firestore document
                await setDoc(agencyDocRef, newData, { merge: true });
            }
        }
        // Clear the form
        document.getElementById('editWebAcc').reset();
        $("#otpVerification").modal("hide");
        createAlert('Document updated successfully');
        location.reload(true);
    }

    // DELETE WEB ACCOUNT
    async function deleteWeb(agencyID) {
        try {
            const confirmDelete = confirm("Do you want to delete this account?");

            // If the user confirms the delete
            if (confirmDelete) {
                const collectionRef = collection(db, "Travel_agencies");
                const queryRef = query(collectionRef, where('agency_id', '==', agencyID));
                deleteSubscribersRecord(agencyID);

                const querySnapshot = await getDocs(queryRef);

                // Check if any documents match the search criteria
                if (!querySnapshot.empty) {
                    // Loop through the documents and delete each one
                    querySnapshot.forEach((doc) => {
                        const adminRef = doc.ref;

                        // Use deleteDoc to delete the document
                        deleteDoc(adminRef)
                            .then(() => {
                                console.log('Document deleted successfully');
                                createAlert('Document deleted successfully');
                                location.reload(true);
                            })
                            .catch((error) => {
                                console.error('Error deleting document:', error);
                            });
                    });
                } else {
                    console.log('Document not found');
                }
            }
        } catch (error) {
            console.error('Error deleting Admin:', error);
        }
    }

    async function deleteSubscribersRecord(agencyID) {
        const collectionRef = collection(db, "Subscribers");
        const queryRef = query(collectionRef, where('agency_id', '==', agencyID));
        getDocs(queryRef)
            .then((querySnapshot) => {
                if (!querySnapshot.empty) {
                    const doc = querySnapshot.docs[0];
                    const subsRef = doc.ref;
                    console.log("Deleted: ", travRef);

                    // Use deleteDoc to delete the document
                    return deleteDoc(subsRef);
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