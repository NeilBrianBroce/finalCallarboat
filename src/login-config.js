// Firebase authentication for Login
import { getAuth, signInWithEmailAndPassword } from '../node_modules/firebase/auth';
import { initializeApp } from '../node_modules/firebase/app';
import { getFirestore, collection, getDocs, addDoc, getDoc, query, where, orderBy, doc, deleteDoc, setDoc, QuerySnapshot } from '../node_modules/firebase/firestore';

export function loginVerification() {
    const { v4: uuidv4 } = require('uuid');
    const bcrypt = require('bcryptjs');

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
    const app = initializeApp(firebaseConfig);

    // Initialize Firestore
    const db = getFirestore(app);
    const auth = getAuth(app);

    // const loginUserForm = document.getElementById('loginUser');

    // Create the alert message for login successfully
    function createAlert(message) {
        const alertDiv = document.querySelector('.alert-container');
        alertDiv.querySelector('.alert').textContent = message;
        alertDiv.style.display = 'block';

        // Close the modal
        const loginModal = document.getElementById('loginModal');
        const modal = bootstrap.Modal.getInstance(loginModal);
        if (modal) {
            modal.hide();
        }
        setTimeout(function () {
            alertDiv.style.display = 'none';
        }, 5000);
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

    // let userIdStored;
    // loginUserForm.addEventListener('submit', async function (event) {
    //     event.preventDefault(); // Prevent default form submission

    //     const email = document.getElementById('emailLogin').value;
    //     const password = document.getElementById('passwordLogin').value;
    //     console.log(email);
    //     console.log(password);
    //     try {

    //         const adminQuery = query(collection(db, 'Admin'), where('admin_email', '==', email));
    //         const adminQuerySnapshot = await getDocs(adminQuery);
    //         // console.log(adminQuerySnapshot);
    //         const agencyQuery = query(collection(db, 'Travel_agencies'), where('agency_email', '==', email));
    //         const agencyQuerySnapshot = await getDocs(agencyQuery);
    //         const adminDataArray = [];
    //         const agencyDataArray = [];
    //         if (!adminQuerySnapshot.empty) {
    //             let hashedUserPassword = "";
    //             adminQuerySnapshot.forEach((doc) => {
    //                 hashedUserPassword = doc.data().admin_password;
    //                 const adminEmail = doc.data().admin_email;
    //                 const adminName = doc.data().adminName;
    //                 const userIdStored = doc.data().admin_id;
    //                 const imgProfile = doc.data().admin_profile;

    //                 // Create an object with the extracted data
    //                 const adminData = {
    //                     adminPassword: hashedUserPassword,
    //                     userId: userIdStored,
    //                     profileImage: imgProfile,
    //                     adminEmail: adminEmail,
    //                     adminName: adminName
    //                 };

    //                 adminDataArray.push(adminData);
    //             });

    //             // Now you can compare the input password with the stored hashed password
    //             const isPasswordMatch = await bcrypt.compare(password, hashedUserPassword);

    //             if (isPasswordMatch) {
    //                 // Passwords match, proceed with login
    //                 localStorage.setItem('adminSessionData', JSON.stringify(adminDataArray));
    //                 // displaySessionData('adminSessionData');
    //                 createAlert('Login Successfully');
    //                 document.getElementById('loginUser').reset();
    //                 window.location.replace('../dist/admin-dashboard.html'); // Redirect to travel agencies dashboard
    //             } else {
    //                 // Password is incorrect
    //                 console.error('Password is incorrect.');
    //                 errorMessage('error-message', 'errormsg', 'Password is incorrect.', 'bg-danger');
    //             }
    //         } else if (!agencyQuerySnapshot.empty) {
    //             let hashedUserPassword = "";
    //             let getEmail = '';
    //             agencyQuerySnapshot.forEach((doc) => {
    //                 hashedUserPassword = doc.data().agency_password;
    //                 const getId = doc.data().agency_id;
    //                 getEmail = doc.data().agency_email;
    //                 const getcompanyName = doc.data().companyName;
    //                 const getProfile = doc.data().agency_profile;
    //                 // Create an object with the extracted data
    //                 const agencyData = {
    //                     agencyPassword: hashedUserPassword,
    //                     userId: getId,
    //                     profileImage: getProfile,
    //                     agency_email: getEmail,
    //                     companyName: getcompanyName
    //                 };

    //                 agencyDataArray.push(agencyData);
    //             });

    //             // Now you can compare the input password with the stored hashed password
    //             const isPasswordMatch = await bcrypt.compare(password, hashedUserPassword);

    //             if (isPasswordMatch) {
    //                 // Passwords match, proceed with login
    //                 if (checkSubscriptionStatus(getEmail)) {
    //                     localStorage.setItem('agencySessionData', JSON.stringify(agencyDataArray));
    //                     createAlert('Login Successfully');
    //                     window.location.replace('../dist/dashboard.html'); // Redirect to travel agencies dashboard
    //                 }
    //             } else {
    //                 // Password is incorrect
    //                 console.error('Password is incorrect.');
    //                 errorMessage('error-message', 'errormsg', 'Password is incorrect.', 'bg-danger');
    //             }
    //         } else {
    //             // No document found for the given email
    //             console.error('User not found.');
    //         }
    //     } catch (error) {
    //         // console.error('Login error:', error);/
    //         // Display an error message to the user
    //         errorMessage('error-msg', 'err_msg', 'Password is incorrect.', 'bg-danger');
    //     }
    // });
    const loginUserForm = document.getElementById('loginUser');
    loginUserForm.addEventListener('submit', async function (event) {
        event.preventDefault(); // Prevent default form submission

        const email = document.getElementById('emailLogin').value;
        const password = document.getElementById('passwordLogin').value;
        console.log(email);
        console.log(password);
        try {
            // Admin
            const adminQuery = query(collection(db, 'Admin'), where('admin_email', '==', email));
            const adminQuerySnapshot = await getDocs(adminQuery);
            // console.log(adminQuerySnapshot);
            const agencyQuery = query(collection(db, 'Travel_agencies'), where('agency_email', '==', email));
            const agencyQuerySnapshot = await getDocs(agencyQuery);
            const adminDataArray = [];
            const agencyDataArray = [];
            if (!adminQuerySnapshot.empty) {
                let hashedUserPassword = "";
                adminQuerySnapshot.forEach((doc) => {
                    hashedUserPassword = doc.data().admin_password;
                    const adminEmail = doc.data().admin_email;
                    const adminName = doc.data().adminName;
                    const userIdStored = doc.data().admin_id;
                    const imgProfile = doc.data().admin_profile;
                    // Create an object with the extracted data
                    const adminData = {
                        adminPassword: hashedUserPassword,
                        userId: userIdStored,
                        profileImage: imgProfile,
                        adminEmail: adminEmail,
                        adminName: adminName
                    };
                    adminDataArray.push(adminData);
                });

                // Now you can compare the input password with the stored hashed password
                const isPasswordMatch = await bcrypt.compare(password, hashedUserPassword);
                console.log(isPasswordMatch, ' ', password, ' ', hashedUserPassword);

                if (isPasswordMatch) {
                    // Passwords match, proceed with login
                    localStorage.setItem('adminSessionData', JSON.stringify(adminDataArray));
                    // displaySessionData('adminSessionData');
                    createAlert('Login Successfully');
                    document.getElementById('loginUser').reset();
                    window.location.replace('../dist/admin-dashboard.html'); // Redirect to travel agencies dashboard
                } else {
                    // Password is incorrect
                    console.error('Password is incorrect.');
                    console.log(email);
                    console.log(password);
                }

            } else if (!agencyQuerySnapshot.empty) {
                let hashedUserPassword = "";
                // let isPasswordMatch = false;
                let getcompanyName = '';
                agencyQuerySnapshot.forEach(async (doc) => {
                    hashedUserPassword = doc.data().agency_password;
                    const getId = doc.data().agency_id;
                    const getEmail = doc.data().agency_email;
                    getcompanyName = doc.data().companyName;
                    console.log(hashedUserPassword);
                    const getProfile = doc.data().agency_profile;

                    // isPasswordMatch = await bcrypt.compare(password, hashedUserPassword);

                    // if (isPasswordMatch) {
                    //     getcompanyName = doc.data().companyName;
                    //     // break; // exit the loop once a match is found
                    // }
                    // Create an object with the extracted data
                    const agencyData = {
                        agencyPassword: hashedUserPassword,
                        userId: getId,
                        profileImage: getProfile,
                        agency_email: getEmail,
                        companyName: getcompanyName
                    };
                    agencyDataArray.push(agencyData);
                });

                // Now you can compare the input password with the stored hashed password
                const isPasswordMatch = await bcrypt.compare(password, hashedUserPassword);

                if (isPasswordMatch) {
                    // Passwords match, proceed with login
                    const status = await checkSubscriptionStatus(getcompanyName);
                    console.log(status);
                    if (status) {
                        localStorage.setItem('agencySessionData', JSON.stringify(agencyDataArray));
                        createAlert('Login Successfully');
                        window.location.replace('../dist/dashboard.html'); // Redirect to travel agencies dashboard
                    }
                } else {
                    // Password is incorrect
                    console.error('Password is incorrect.');
                    errorMessage('error-message', 'errormsg', 'Password is incorrect.', 'bg-danger');
                }
            } else {
                // No document found for the given email
                console.error('User not found.');
            }
        } catch (error) {
            // console.error('Login error:', error);/
            // Display an error message to the user
            // errorMessage('error-msg', 'err_msg', 'Password is incorrect.', 'bg - danger');
        }
    });

    // Function to compare hashed password with entered password
    async function comparePasswords(enteredPassword, hashedPassword) {
        try {
            const isMatch = await bcrypt.compare(enteredPassword, hashedPassword);
            return isMatch;
        } catch (error) {
            console.error('Error comparing passwords:', error);
            throw error; // You might want to handle or log the error appropriately
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


    // Function to check subscription status
    async function checkSubscriptionStatus(companyName) {
        try {
            const agencyQuery = query(collection(db, 'Subscribers'), where('companyName', '==', companyName));
            const agencyQuerySnapshot = await getDocs(agencyQuery);
            if (!agencyQuerySnapshot.empty) {
                let userStatus = "";
                agencyQuerySnapshot.forEach((doc) => {
                    userStatus = doc.data().subscription_status;
                });
                if (userStatus === 'active') {
                    return true;
                }
                else if (userStatus === 'hold') {
                    //Open Modal
                    showToast('Please contact Callarboat @ +1(234) 567-89 or via email at callarboat@gmail.com.', 'Account Hold');
                    return false;
                } else if (userStatus === 'inactive') {
                    //Open Modal
                    showToast('Please contact Callarboat @ +1(234) 567-89 or via email at callarboat@gmail.com.', 'Account Inactive');
                    return false;
                } else {
                    console.error('Document not found for userStatus: ', userStatus);
                    return false;
                }
            }
        } catch (error) {
            console.error('Error checking subscription userStatus: ', error);
            return false;
        }
    }

    function showToast(message, title) {
        const toastMessageElement = document.getElementById('toastMessage');
        const toastTitleElement = document.getElementById('toastTitle');
        // const toastTimeElement = document.getElementById('toastTime');
        // Update toast message content
        toastMessageElement.textContent = message;
        // Update toast title
        toastTitleElement.textContent = title;

        // Show the toast
        const liveToast = new bootstrap.Toast(document.getElementById('liveToast'));
        liveToast.show();

        // Set a timeout to hide the toast after 3 seconds
        setTimeout(function () {
            liveToast.hide();
        }, 5000);
    }

}