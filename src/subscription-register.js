// import { initializeApp } from '../node_modules/firebase/app';
import { app } from './index';
import { getFirestore, collection, getDocs, addDoc } from '../node_modules/firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from '../node_modules/firebase/auth';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "../node_modules/firebase/storage";

export function subscriptionRegisterFunction() {
    const { v4: uuidv4 } = require('uuid');
    const bcrypt = require('bcryptjs');

    // Initialize Firestore
    const db = getFirestore(app);
    const auth = getAuth(app);
    const storage = getStorage(app);
    const subscriptionPlanRef = collection(db, 'Subscription-Plan');
    const travelAgency = collection(db, 'Travel_agencies');
    const subscribers = collection(db, 'Subscribers');
    // let subPlanDetails = [];

    // Function that fetches data from the Subscription-Plan Collection and displays it in the HTML
    async function displaySubscriptionPlan() {
        try {
            const querySnapshot = await getDocs(subscriptionPlanRef);

            querySnapshot.forEach((doc) => {
                const subscriptionData = doc.data();
                console.log(subscriptionData);

                // Access the HTML elements and update their content for Monthly plan
                if (subscriptionData.subscriptionName === 'Monthly') {
                    const monthlyTitle = document.getElementById('monthly-plan');
                    const monthlyFee = document.getElementById('monthly-fee');

                    monthlyTitle.textContent = subscriptionData.subscriptionName;
                    monthlyFee.textContent = `₱${subscriptionData.subscriptionFee}/mon`;
                }

                // Access the HTML elements and update their content for Yearly plan
                if (subscriptionData.subscriptionName === 'Annual') {
                    const yearlyTitle = document.getElementById('yearly-plan');
                    const yearlyFee = document.getElementById('yearly-fee');

                    yearlyTitle.textContent = subscriptionData.subscriptionName;
                    yearlyFee.textContent = `₱${subscriptionData.subscriptionFee}/yr`;
                }

            });
        } catch (error) {
            console.error('Error getting subscription plan:', error);
        }
    }

    // Function to handle the click event on the "Get Started" button
    const btn = document.getElementById('getStarted');
    if (btn) {
        btn.addEventListener('click', function (event) {
            displaySubscriptionPlan();
        });
    }

    const monthlyElement = document.getElementById('monthly');
    if (monthlyElement) {
        monthlyElement.addEventListener('click', function (event) {
            event.preventDefault(); // Prevent the default link behavior

            const subplanInput = document.getElementById('subplan');
            const subdateInput = document.getElementById('subdate');
            const subdaterenewInput = document.getElementById('subdaterenew');

            // Set subscription plan
            subplanInput.value = document.getElementById('monthly-plan').innerText;

            const currentDate = new Date();

            // Calculate the date for the next month
            const nextMonth = new Date(currentDate);
            nextMonth.setMonth(nextMonth.getMonth() + 1);

            // Format current and next month's date
            const formattedCurrentDate = formatDate(currentDate);
            const formattedNextMonthDate = formatDate(nextMonth);

            // Display current date and set the renewal date to next month
            subdateInput.value = formattedCurrentDate;
            subdaterenewInput.value = formattedNextMonthDate;
        });
    }

    const yearlyElement = document.getElementById('yearly');
    if (yearlyElement) {
        yearlyElement.addEventListener('click', function (event) {
            event.preventDefault(); // Prevent the default link behavior

            const subplanInput = document.getElementById('subplan');
            const subdateInput = document.getElementById('subdate');
            const subdaterenewInput = document.getElementById('subdaterenew');

            // Set subscription plan
            subplanInput.value = document.getElementById('yearly-plan').innerText;

            const currentDate = new Date();

            // Calculate the date for next year
            const nextYear = new Date(currentDate);
            nextYear.setFullYear(nextYear.getFullYear() + 1);

            // Format current date and date for next year
            const formattedCurrentDate = formatDate(currentDate);
            const formattedNextYearDate = formatDate(nextYear);

            // Display current date and set the renewal date to next year
            subdateInput.value = formattedCurrentDate;
            subdaterenewInput.value = formattedNextYearDate;
        });
    }

    // Function to format date to 'YYYY-MM-DDTHH:MM' for input value
    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    // Function to check password validity
    function checkPasswordValidity(password) {
        const MIN_PASSWORD_LENGTH = 8;
        return password.length >= MIN_PASSWORD_LENGTH;
    }

    // Create the alert message for successfully created
    function createAlert(message) {
        const alertDiv = document.querySelector('.alert-container');
        alertDiv.querySelector('.alert').textContent = message;
        alertDiv.style.display = 'block';

        // Close the modal
        // const registerModal = document.getElementById('registerModal');
        // const modal = bootstrap.Modal.getInstance(registerModal);
        // if (modal) {
        //     modal.hide();
        // }
        setTimeout(function () {
            alertDiv.style.display = 'none';
        }, 3000);
    }

    //Function that will calculate the days left
    function calculateDaysLeft(endDate) {
        // Extract date parts only without the time
        // const endWithoutTime = endDate.substring(0, 10);
        const endWithoutTime = formatDates(endDate);
        const _endDate = new Date(endWithoutTime);
        const currentDate = new Date();

        const daysLeft = Math.round((_endDate - currentDate) / (1000 * 60 * 60 * 24));

        return daysLeft;
    }

    //Format the dates
    function formatDates(date) {
        const _date = new Date(date); // Assuming it's your Date object

        const year = _date.getFullYear();
        const month = String(_date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
        const day = String(_date.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;

        return formattedDate;
    }

    var downloadURL;
    // Function to handle file upload
    const profileElement = document.getElementById('profile');
    if (profileElement) {
        profileElement.addEventListener('change', async function (event) {
            event.preventDefault(); // Prevent the default link behavior

            const file = event.target.files[0];

            // Create a reference to the file in Firebase Storage
            // const storageRef = ref(storage, `images/${file.name}`);
            if (file) {
                const storageRef = ref(storage, `images/${file.name}`);
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
                        downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                        errorMessage('error-msg', 'err_msg', 'Image verified!', 'bg-success');
                        console.log('File uploaded and download URL:', downloadURL);
                        // Further operations using downloadURL if needed
                    }
                );
            }
        });
    }

    // Get the form element
    const registerForm = document.getElementById('registerSubscription');
    let dataCollection = [];
    let paymentDetails = [];
    // Add an event listener for form submission
    if (registerForm) {
        registerForm.addEventListener('submit', async function (event) {
            event.preventDefault(); // Prevent default form submission

            // Retrieve input field values
            const subscriptionPlan = document.getElementById('subplan').value;
            const startDate = document.getElementById('subdate').value;
            const endDate = document.getElementById('subdaterenew').value;
            const companyName = document.getElementById('companyname').value;
            const email = document.getElementById('emailUser').value;
            const password = document.getElementById('passwordUser').value;
            const daysLeft = calculateDaysLeft(endDate);

            //Set User as active upon signing up
            const userStatus = 'active';

            // Check for password validity
            if (!checkPasswordValidity(password)) {
                errorMessage('error-msg', 'err_msg', "Password must be at least 8 characters long.", 'bg-danger');
            }
            dataCollection = [companyName, subscriptionPlan, startDate, endDate, email, password, daysLeft, userStatus, downloadURL];
            // console.log("Heeyy: ", dataCollection);
            // paymentDetails = [companyName, subscriptionPlan];
            // console.log("Payment: ", subscriptionPlan);

            $("#registerModal").modal("hide");
            $("#otpVerification").modal("show");
            sendVerificationCode(email);
        });
    }

    //Function that will save data from add admin form
    async function saveData(dataCollection) {
        try {
            // const agencyId = uuidv4(); 
            const hashedUserPassword = await hashPassword(dataCollection[5]);
            if (hashedUserPassword) {
                const agencyId = uuidv4();
                // Store User data of the companies to 'Travel_agencies' collection const Travel_agencies = 
                await addDoc(travelAgency, {
                    subscriptionPlan: dataCollection[1],
                    subscription_startDate: dataCollection[2],
                    subscription_endDate: dataCollection[3],
                    companyName: dataCollection[0],
                    agency_email: dataCollection[4],
                    agency_password: hashedUserPassword,
                    agencyProfile: dataCollection[8],
                    agency_id: agencyId
                });

                // const subscriberId = uuidv4();
                // Store user subscription data in Firestore 'Subscribers' collection const Subscribers = 
                await addDoc(subscribers, {
                    companyName: dataCollection[0],
                    subscriptionPlan: dataCollection[1],
                    subscription_startDate: dataCollection[2],
                    subscription_endDate: dataCollection[3],
                    subscription_daysLeft: dataCollection[6],
                    subscription_status: dataCollection[7],
                    agencyProfile: dataCollection[8],
                    agency_id: agencyId
                });
            }
            // Clear the form
            document.getElementById('registerSubscription').reset();

            // Display a success message
            createAlert('Successfully Added!');
            console.log("Alert displayed");
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

    // const paymentForm = document.getElementById('paymentForm');
    // if (paymentForm) {
    //     paymentForm.addEventListener('submit', function (event) {
    //         event.preventDefault();

    //         var companyName = document.getElementById('company_name').value;
    //         var subscriptionPlan = document.getElementById('subsciptPlan').value;
    //         var subscriptionFee = document.getElementById('amountFee').value;
    //         var paymentMethod = document.getElementById('paymentMethodSelect').value;

    //         // var formData = {
    //         //     companyName: companyName,
    //         //     subscriptionPlan: subscriptionPlan,
    //         //     subscriptionFee: subscriptionFee,
    //         //     paymentMethod: paymentMethod
    //         // };

    //         redirection(companyName, subscriptionPlan, subscriptionFee, paymentMethod);
    //         // // Make an AJAX request to the server
    //         // fetch('http://localhost:80/callarboat/index.php', {
    //         //     method: 'POST',
    //         //     headers: {
    //         //         'Content-Type': 'application/json',
    //         //     },
    //         //     body: JSON.stringify(formData),
    //         // })
    //         //     .then(response => response.text())
    //         //     .then(data => {
    //         //         console.log(data);
    //         //     })
    //         //     .catch(error => {
    //         //         console.error('Error submitting form:', error);
    //         //     });

    //     });
    // }

    // function sendDataToPHP(formData) {
    //     var xhr = new XMLHttpRequest();
    //     xhr.onreadystatechange = function () {
    //         if (this.readyState == 4) {
    //             if (this.status == 200) {
    //                 var responseFromPHP = this.responseText;
    //                 // console.log(responseFromPHP);
    //                 // Handle the response as needed
    //             } else {
    //                 console.error("Error: Unable to send data to PHP.");
    //             }

    //             // Redirect to index.php after processing the response
    //             window.location.href = "http://localhost:80/callarboat/index.php";
    //         }
    //     };

    //     xhr.open("POST", "http://localhost:80/callarboat/index.php", true);
    //     xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    //     xhr.send(JSON.stringify(formData));
    // }

    // // Call the function to send data to PHP
    // sendDataToPHP(formData);

    // function redirection(companyName, subscriptionPlan, subscriptionFee, paymentMethod) {
    //     //Target URL
    //     let url = "http://localhost/callarboat/index.php";

    //     //SEND DATA TO PHP
    //     url += "?companyName=" + encodeURIComponent(companyName);
    //     url += "&subscriptionPlan=" + encodeURIComponent(subscriptionPlan);
    //     url += "&subscriptionFee=" + encodeURIComponent(subscriptionFee);
    //     url += "&paymentMethod=" + encodeURIComponent(paymentMethod);

    //     //Redirect to php
    //     window.location.replace(url);
    //     return false;

    // }



    // Validate Email
    var otpCode = "";
    function generateVerificationCode() {
        return Math.floor(100000 + Math.random() * 900000);
    }

    // Function to send an email
    function sendVerificationCode(email) {
        const companyName = "CallArboat";
        const recipientName = email;
        const yourContactInfo = "091297343221";
        otpCode = generateVerificationCode();

        let messageBody = `
            <h2>${companyName} - One-Time Passcode for Verification</h2>
                <p>Dear ${recipientName},</p>

                <p>We hope this message finds you well. Thank you for choosing ${companyName}.</p>

                <p>As part of our commitment to ensuring the security of your account, we have generated a one-time passcode (OTP) for verification purposes. Please use the following code to complete the verification process:</p>

                <p><strong>OTP Code:</strong> ${otpCode}</p>

                <p>This code is valid for a single use and will expire after a short period for your security. If you did not request this code or if you have any concerns about the security of your account, please contact our support team immediately.</p>

                <p>Thank you for your trust in ${companyName}. We appreciate your cooperation in maintaining the security of your account.</p>

                <p>Best regards,<br>
                ${companyName}<br>
                ${yourContactInfo}</p>
            </div>
            `;

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
                    handleOTPVerification();
                } else {
                    console.error("Failed to send OTP. Check SMTP configuration and email content.");
                }
            }
        );
    }


    // Function to handle OTP verification
    function handleOTPVerification() {
        const otpForm = document.getElementById('enterOTPForm');
        const otpInput = document.getElementById('otpCode');

        if (otpForm) {
            otpForm.addEventListener('submit', (event) => {
                event.preventDefault(); // Prevent the form from submitting in the default way

                // Now check whether the entered OTP is valid
                const enteredOTP = otpInput.value;

                if (enteredOTP == otpCode) {
                    console.log("OTP enter is correct");
                    errorMessage('error-msg', 'err_msg', "Email address verified", 'bg-success');
                    saveData(dataCollection);
                    // $("#otpVerification").modal("hide");
                    // displayPaymentDetailes();
                    // $("#paymentModal").modal("show");
                } else {
                    errorMessage('error-msg', 'err_msg', 'Invalid OTP...', 'bg-danger');
                }
            });
        }

    }

    // function displayPaymentDetailes() {
    //     document.getElementById('company_name').value = paymentDetails[0];
    //     document.getElementById('subsciptPlan').value = paymentDetails[1];
    //     const amountFee = document.getElementById('amountFee');
    //     // console.log(subPlanDetails[0][1].subscriptionFee);
    //     if (paymentDetails[1] === subPlanDetails[0]) {
    //         amountFee.value = subPlanDetails[1];
    //     } else if (paymentDetails[1] === subPlanDetails[2]) {
    //         amountFee.value = subPlanDetails[3];
    //     }
    // }


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


    // function paymentMethod() {

    // }
}; 