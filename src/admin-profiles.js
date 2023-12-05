import { app } from './index';
import { getFirestore, collection, getDocs, addDoc, query, where, orderBy, updateDoc, setDoc, deleteDoc, getDoc, count, documentId } from '../node_modules/firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "../node_modules/firebase/storage";

export function adminProfleFunctions() {
    const { v4: uuidv4 } = require('uuid');
    const bcrypt = require('bcryptjs');
    const db = getFirestore(app);
    const storage = getStorage(app);
    // if (localStorage.getItem('adminSessionData') === null) {
    //     // Both items are empty, redirect to the index page
    //     window.location.replace("index.html");
    // }

    // function updateErrorMessage(message, color) {
    //     const errorMessage = document.getElementById('errMessage');
    //     errorMessage.classList.remove('text-success', 'text-primary');
    //     errorMessage.textContent = message;
    //     // Add the specified color class
    //     errorMessage.classList.add(color);
    //     errorMessage.style.display = 'block';

    //     // Hide error message after 3 seconds if it's a success message
    //     setTimeout(function () {
    //         errorMessage.style.display = 'none';
    //     }, 3000);
    // }

    // //Get Upload Image
    // var adminProfile;
    // // Function to handle file upload
    // const profileElement = document.getElementById('profileImageInput');
    // if (profileElement) {
    //     profileElement.addEventListener('change', async function (event) {
    //         event.preventDefault(); // Prevent the default link behavior

    //         const file = event.target.files[0];

    //         // Create a reference to the file in Firebase Storage
    //         // const storageRef = ref(storage, `images/${file.name}`);
    //         if (file) {
    //             const storageRef = ref(storage, `AdminProfiles/${file.name}`);
    //             // Upload the file using put method
    //             const uploadTask = uploadBytesResumable(storageRef, file);

    //             // Get the download URL after the upload is complete
    //             uploadTask.on('state_changed', (snapshot) => {
    //             },
    //                 (error) => {
    //                     console.error('Error uploading file:', error);
    //                 },
    //                 async () => {
    //                     updateErrorMessage('Verifying image...', 'text-success');
    //                     adminProfile = await getDownloadURL(uploadTask.snapshot.ref);
    //                     updateErrorMessage('Image verified!', 'text-primary');
    //                     console.log('File uploaded and download URL:', adminProfile);
    //                     // Further operations using downloadURL if needed
    //                 }
    //             );
    //         }
    //     });
    // }

    // let dataCollection = [];
    // let currentData = [];
    // const adminProfileForm = document.getElementById('editProfile');
    // if (adminProfileForm) {
    //     adminProfileForm.addEventListener('submit', function (event) {
    //         event.preventDefault();
    //         const updatedAdminName = document.getElementById('inputName').value;
    //         const updatedEmail = document.getElementById('inputEmail').value;
    //         const updatedPassword = document.getElementById('inputPassword').value;
    //         // Get the img element by its ID
    //         const imgElement = document.getElementById('profileImage');
    //         // Get the value of the src attribute
    //         const srcValue = imgElement.getAttribute('src');
    //         //Get the current data in session
    //         getSessionData();

    //         if (currentData[1] == updatedAdminName && currentData[2] == updatedEmail && currentData[3] == updatedPassword && currentData[4] == srcValue) {
    //             errorMessage('error-msg', 'err_msg', "There's no changes on data", 'bg-danger');
    //         } else {
    //             // Check for password validity
    //             if (!checkPasswordValidity(updatedPassword)) {
    //                 errorMessage('error-msg', 'err_msg', "Password must be at least 8 characters long.", 'bg-danger');
    //             }

    //             // Check is email is change
    //             if (updatedEmail !== currentData[2]) {
    //                 $("#otpVerification").modal("show");
    //                 sendVerificationCode(updatedEmail);
    //                 dataCollection = [currentData[0], updatedAdminName, updatedEmail, updatedPassword, adminProfile];
    //             } else {
    //                 saveAdmin([currentData[0], updatedAdminName, updatedEmail, updatedPassword, adminProfile]);
    //             }

    //         }
    //     });
    // }

    // // Function to check password validity
    // function checkPasswordValidity(password) {
    //     const MIN_PASSWORD_LENGTH = 8;
    //     return password.length >= MIN_PASSWORD_LENGTH;
    // }

    // // Create the alert message for successfully created
    // function createAlert(message) {
    //     const alertDiv = document.querySelector('.alert-container');
    //     alertDiv.querySelector('.alert').textContent = message;
    //     alertDiv.style.display = 'block';

    //     setTimeout(function () {
    //         alertDiv.style.display = 'none';
    //     }, 3000);
    // }

    // //Function for error message for modal
    // function errorMessage(errorDiv, errortag, errorMessage, color) {
    //     // Display error message in the designated error-message element
    //     const errorMessageElement = document.getElementById(errortag);
    //     errorMessageElement.textContent = errorMessage;
    //     // Remove any existing background color classes
    //     errorMessageElement.classList.remove('bg-danger', 'bg-success', 'bg-info', 'bg-warning', 'bg-primary');

    //     // Add Bootstrap's primary background color class
    //     errorMessageElement.classList.add(color);

    //     // Show both the error-message and errormsg elements
    //     const errorDivElement = document.getElementById(errorDiv);
    //     errorDivElement.style.display = 'block'; // Show the error message div

    //     // Hide error message after 3 seconds
    //     setTimeout(function () {
    //         errorDivElement.style.display = 'none';
    //     }, 3000);
    // }

    // function generateVerificationCode() {
    //     return Math.floor(100000 + Math.random() * 900000);
    // }

    // // Your hashPassword function
    // async function hashPassword(password) {
    //     try {
    //         const hashedPassword = await bcrypt.hash(password, 10);
    //         return hashedPassword;
    //     } catch (error) {
    //         console.error('Error hashing password:', error);
    //         throw error; // You might want to handle or log the error appropriately
    //     }
    // }

    // let data = [];
    // var adminOtpCode = "";
    // // Function to send an email
    // function sendVerificationCode(email) {
    //     // let ok = false;
    //     const companyName = "CallArboat";
    //     const yourContactInfo = "091297343221";
    //     adminOtpCode = generateVerificationCode();

    //     let messageBody = `
    //         <div>
    //             <h2>${companyName} - Admin One-Time Passcode for Verification</h2>
    //             <p>Dear Admin User,</p>
    //             <p>We hope this message finds you well. Thank you for being part of ${companyName}.</p>
    //             <p>As part of our security measures, we have generated a one-time passcode (OTP) for verification purposes. Please use the following code to complete the verification process:</p>
    //             <p><strong>Admin OTP Code:</strong> ${adminOtpCode}</p>
    //             <p>This code is valid for a single use and will expire after a short period for security reasons. If you did not request this code or if you have any concerns, please contact our support team immediately.</p>
    //             <p>Thank you for your commitment to the security of ${companyName}. We appreciate your diligence in maintaining the integrity of the admin account.</p>
    //             <p>Best regards,<br>
    //             ${companyName}<br>
    //             ${yourContactInfo}</p>
    //         </div>
    //         `;

    //     // console.log("Sending OTP to email:", email);
    //     // console.log("Sending OTP :", adminOtpCode);
    //     // console.log("Email content:", messageBody);

    //     Email.send({
    //         SecureToken: "d073d44f-dba7-40ec-90a0-45b2284aa842",
    //         To: email,
    //         From: "callarboat@gmail.com",
    //         Subject: "OTP Verification Code",
    //         Body: messageBody
    //     }).then(
    //         message => {
    //             if (message === "OK") {
    //                 alert("OTP sent to your email " + email);
    //                 const otpForm = document.getElementById('enterOTPForm');
    //                 const otpInput = document.getElementById('otpCode');
    //                 if (otpForm) {
    //                     otpForm.addEventListener('submit', (event) => {
    //                         event.preventDefault(); // Prevent the form from submitting in the default way

    //                         // Now check whether the entered OTP is valid
    //                         const enteredOTP = otpInput.value;

    //                         if (enteredOTP == adminOtpCode) {
    //                             console.log("OTP enter is correct");
    //                             errorMessage('error-msg', 'err_msg', "OTP entered is correct", 'bg-success');
    //                             errorMessage('error-msg', 'err_msg', "Email address verified", 'bg-success');
    //                             saveAdmin(dataCollection);
    //                         } else {
    //                             errorMessage('error-msg', 'err_msg', 'Invalid OTP...', 'bg-danger');
    //                         }
    //                     });
    //                 }
    //             } else {
    //                 console.error("Failed to send OTP. Check SMTP configuration and email content.");
    //             }
    //         }
    //     );
    // }

    // // SAVE ADMIN UPDATED DATA
    // async function saveAdmin(updatedData) {
    //     const id = updatedData[0];
    //     console.log(id);
    //     const collectionRef = collection(db, "Admin");
    //     const queryRef = query(collectionRef, where('admin_id', '==', id));
    //     const hashedUserPassword = await hashPassword(updatedData[3]);
    //     const newData = {
    //         adminName: updatedData[1],
    //         admin_email: updatedData[2],
    //         admin_password: hashedUserPassword,
    //         admin_profile: updatedData[4],
    //     }
    //     console.log(newData);
    //     const querySnapshot = await getDocs(queryRef);

    //     if (!querySnapshot.empty) {
    //         const doc = querySnapshot.docs[0];
    //         const adminDocRef = doc.ref;

    //         // Update Firestore document
    //         await setDoc(adminDocRef, newData, { merge: true });
    //     }
    //     $("#otpVerification").modal("hide");
    //     displayUpdatedSessionData(updatedData);
    //     createAlert('Document updated successfully');
    //     location.reload(true);
    // }

    // function handleFileChange() {
    //     const fileInput = document.getElementById('profileImageInput');

    //     if (fileInput.files.length > 0) {
    //         // Files have been selected
    //         return true;
    //     } else {
    //         return false;
    //     }
    // }

    // function getSessionData() {
    //     // Retrieve the JSON string from localStorage
    //     const adminSessionData = localStorage.getItem('adminSessionData');
    //     if (adminSessionData !== null) {
    //         // Parse the JSON string back to an array of objects
    //         const data = JSON.parse(adminSessionData);

    //         // You can now access properties of the objects in the array
    //         for (const adminData of data) {
    //             currentData.push(adminData.userId);
    //             currentData.push(adminData.adminName);
    //             currentData.push(adminData.adminEmail);
    //             currentData.push(adminData.adminPassword);
    //             currentData.push(adminData.profileImage);
    //         }
    //     }
    // }

    // function displayUpdatedSessionData(updatedData) {
    //     // Retrieve the JSON string from localStorage
    //     const adminSessionData = localStorage.getItem('adminSessionData');

    //     if (adminSessionData !== null) {
    //         // Parse the JSON string back to an array of objects
    //         const data = JSON.parse(adminSessionData);

    //         // Loop through the array and update specific properties
    //         for (const adminData of data) {
    //             // Modify the properties as needed
    //             adminData.profileImage = updatedData[4]; // Update the profile image path
    //             adminData.adminName = updatedData[1]; // Update the admin name
    //             adminData.adminEmail = updatedData[2]; // Update the admin email
    //             adminData.adminPassword = updatedData[3]; // Update the admin password
    //             adminData.userId = updatedData[0]; // Update the user ID
    //         }

    //         // Store the modified data back in localStorage
    //         localStorage.setItem('adminSessionData', JSON.stringify(data));

    //         document.getElementById('avatarID').src = updatedData[4];
    //         document.getElementById('profileImage').src = updatedData[4];
    //         document.getElementById('inputName').value = updatedData[1];
    //         document.getElementById('inputEmail').value = updatedData[2];
    //         document.getElementById('inputPassword').value = updatedData[3];

    //         // Now the 'adminSessionData' in localStorage has been updated
    //     }
    // }
}