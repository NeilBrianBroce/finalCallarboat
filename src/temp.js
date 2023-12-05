// import { initializeApp } from '../node_modules/firebase/app';
import { app } from './index';
import { getFirestore, collection, getDocs, addDoc, snapshot, query, where } from '../node_modules/firebase/firestore';
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

    // Function that fetches data from the Subscription-Plan Collection and displays it in the HTML
    async function displaySubscriptionPlan() {
        try {
            const querySnapshot = await getDocs(subscriptionPlanRef);

            querySnapshot.forEach((doc) => {
                const subscriptionData = doc.data();
                // console.log(subscriptionData);

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

    //Check Subscription Fee Amount
    // async function getPaymentFeeValue(paymentDetails) {
    //     try {
    //         const agencyQuery = query(collection(db, 'Subscription-Plan'), where('subsciptionName', '==', paymentDetails[1]));
    //         const agencyQuerySnapshot = await getDocs(agencyQuery);
    //         if (!agencyQuerySnapshot.empty) {
    //             let subsFee = "";
    //             agencyQuerySnapshot.forEach((doc) => {
    //                 subsFee = doc.data().subscriptionFee;
    //                 console.log("Subscription Fee: ", subsFee);
    //             });
    //             return subsFee;
    //         }
    //     } catch (error) {
    //         // console.error('Error checking subscription fee: ', error);
    //         // return false;
    //     }
    // }


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
                        console.log(downloadURL);
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
        registerForm.addEventListener('submit', function (event) {
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
            paymentDetails = [companyName, subscriptionPlan];
            console.log("Heeyy: ", paymentDetails);

            $("#registerModal").modal("hide");
            $("#otpVerification").modal("show");
            // sendVerificationCode(email);
            // sendVerificationCode(adminEmail);
            // try {
            //     // const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            //     // const user = userCredential.user;

            //     const agencyId = uuidv4();
            //     // Access the user ID
            //     // const userId = user.uid;
            //     // Store User data of the companies to 'Travel_agencies' collection const Travel_agencies = 
            //     await addDoc(travelAgency, {
            //         subscriptionPlan,
            //         subscription_startDate: startDate,
            //         subscription_endDate: endDate,
            //         companyName,
            //         agecy_email: email,
            //         agecy_password: hashedUserPassword,
            //         agency_profile: downloadURL,
            //         agency_id: agencyId
            //     });

            //     // const subscriberId = uuidv4();
            //     // Store user subscription data in Firestore 'Subscribers' collection const Subscribers = 
            //     await addDoc(subscribers, {
            //         companyName,
            //         subscriptionPlan,
            //         subscription_startDate: startDate,
            //         subscription_endDate: endDate,
            //         subscription_daysLeft: daysLeft,
            //         subscription_status: userStatus,
            //         agency_profile: downloadURL,
            //         agency_id: agencyId
            //     });

            //     // Clear the form
            //     document.getElementById('registerSubscription').reset();

            //     // Display a success message
            //     createAlert('Registration successful!');
            // } catch (error) {
            //     console.error('Error:', error);
            //     const errorMessage = error.message || 'Failed to log in';

            //     // Display error message in the designated error-message element
            //     const errorMessageElement = document.getElementById('err_msg');
            //     errorMessageElement.textContent = errorMessage;

            //     // Show both the error-message and errormsg elements
            //     const errorDivElement = document.getElementById('error-msg');
            //     errorDivElement.style.display = 'block'; // Show the error message div

            //     // Hide error message after 3 seconds
            //     setTimeout(function () {
            //         errorDivElement.style.display = 'none';
            //     }, 3000);
            // }
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
            $("#paymentModal").modal("hide");
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
            otpForm.addEventListener('submit', async (event) => {
                event.preventDefault(); // Prevent the form from submitting in the default way

                // Now check whether the entered OTP is valid
                const enteredOTP = otpInput.value;

                if (enteredOTP == otpCode) {
                    console.log("OTP enter is correct");
                    errorMessage('error-msg', 'err_msg', "Email address verified", 'bg-success');
                    console.log("waiting...");
                    // const subsFeeAmount = await getPaymentFeeValue(paymentDetails);
                    document.getElementById('company_name').value = paymentDetails[0];
                    document.getElementById('subsciptPlan').value = paymentDetails[1];
                    // document.getElementById('subsciptFee').value = subsFeeAmount;
                    console.log(paymentDetails[1]);
                    // if (subsFeeAmount) {
                    //     setTimeout(function () {
                    //         $("#otpVerification").modal("hide");
                    //         $("#paymentModal").modal("show");
                    //     }, 3000);
                    // }

                    // try {
                    //     const subsFeeAmount = await getPaymentFeeValue(paymentDetails);
                    //     document.getElementById('subsciptFee').value = subsFeeAmount;
                    //     // rest of the code
                    //     console.log(paymentDetails[1]);
                    //     if (subsFeeAmount) {
                    //         setTimeout(function () {
                    //             $("#otpVerification").modal("hide");
                    //             $("#paymentModal").modal("show");
                    //         }, 1000);
                    //     }
                    // } catch (error) {
                    //     console.error('Error getting payment fee:', error);
                    // }
                    // saveData(dataCollection);
                } else {
                    errorMessage('error-msg', 'err_msg', 'Invalid OTP...', 'bg-danger');
                }
            });
        }

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

    const paymentForm = document.getElementById('paymentForm');
    if (paymentForm) {
        paymentForm.addEventListener('submit', function (event) {
            event.preventDefault();

            var companyName = document.getElementById('company_name').value;
            var subscriptionPlan = document.getElementById('subsciptPlan').value;
            var subscriptionFee = document.getElementById('subsciptFee').value;
            var paymentMethod = document.getElementById('paymentMethodSelect').value;

            var requestData = {
                companyName: companyName,
                subscriptionPlan: subscriptionPlan,
                subscriptionFee: subscriptionFee,
                paymentMethod: paymentMethod
            };

            paymongo(requestData);

        });
    }

    // async function saveSubscriptionPayment(paymentDetails) {
    //     document.getElementById('company_name').value = paymentDetails[0];
    //     document.getElementById('subsciptPlan').value = paymentDetails[0];
    //     const paymentFee = await getPaymentFeeValue()
    //     document.getElementById('subsciptFee').value = paymentDetails[0];
    // }

    // async function getPaymentFeeValue(paymentDetails) {
    //     try {
    //         const agencyQuery = query(collection(db, 'Subscription-Plan'), where('subsciptionName', '==', paymentDetails[1]));
    //         const [agencyQuerySnapshot] = await getDocs(agencyQuery);

    //         if (agencyQuerySnapshot.exists()) {
    //             const subsFee = agencyQuerySnapshot.data().subscriptionFee;
    //             console.log("Subscription Fee: ", subsFee);
    //             return subsFee;
    //         }
    //     } catch (error) {
    //         console.error('Error checking subscription fee: ', error);
    //         // Consider handling the error appropriately, e.g., logging or throwing
    //     }
    // }

    async function getPaymentFeeValue(paymentDetails) {
        try {
            console.log(paymentDetails[1]);
            const agencyQuery = query(collection(db, 'Subscription-Plan'), where('subsciptionName', '==', paymentDetails[1]));
            const agencyQuerySnapshot = await getDocs(agencyQuery);
            if (!agencyQuerySnapshot.empty) {
                let subsFee = "";
                agencyQuerySnapshot.forEach((doc) => {
                    subsFee = doc.data().subscriptionFee;
                    console.log("Subscription Fee: ", subsFee);
                });
                return subsFee;
            }
        } catch (error) {
            // console.error('Error checking subscription fee: ', error);
            // return false;
        }
    }

    function paymongo(requestData) {
        // Configuration details
        var config = {
            appKey: "f82272a169e7bee273d9f825f0394d2dae0e92e4",
            secretKey: "sk_test_ZqZPBGruwupP26B6xbvAog3u",
            password: "AdminCallarboat@404" //Paymongo
        };

        // Redirect URL to index.html for both success and failure
        var redirectUrl = "index.html";

        // Billing information from form fields
        var billingInfo = {
            name: requestData.companyName,
            subscriptionPlan: requestData.subscriptionPlan,
            subscriptionFee: requestData.subscriptionFee,
            paymentMethod: requestData.paymentMethod
        };

        // Other attributes
        var attributes = {
            livemode: false,
            type: "gcash",
            amount: 50000,
            currency: "PHP",
            redirect: {
                success: redirectUrl,
                failed: 'accounts.html'
            },
            billing: billingInfo
        };

        // Source data
        var sourceData = {
            app_key: config.appKey,
            secret_key: config.secretKey,
            password: config.password,
            data: {
                attributes: attributes
            }
        };

        // Make a POST request to the server
        fetch('https://api4wrd-v1.kpa.ph/paymongo/v1/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(sourceData),
        })
            .then(response => response.json())
            .then(data => {
                // Save Data to database
                saveData(dataCollection);
                // window.location.href = data.url_redirect || redirectUrl;
            })
            .catch(error => {
                // Handle fetch error
                console.error(error);
                // Redirect to the specified URL on error
                window.location.href = redirectUrl;
            });
    }



};

// ORIGINAL CODE
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

    // Function that fetches data from the Subscription-Plan Collection and displays it in the HTML
    async function displaySubscriptionPlan() {
        try {
            const querySnapshot = await getDocs(subscriptionPlanRef);

            querySnapshot.forEach((doc) => {
                const subscriptionData = doc.data();
                // console.log(subscriptionData);

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
            console.log("Heeyy: ", dataCollection);

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
                } else {
                    errorMessage('error-msg', 'err_msg', 'Invalid OTP...', 'bg-danger');
                }
            });
        }

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

    const paymentForm = document.getElementById('paymentForm');
    if (paymentForm) {
        paymentForm.addEventListener('submit', function (event) {
            event.preventDefault();

            var companyName = document.getElementById('company_name').value;
            var subscriptionPlan = document.getElementById('subsciptPlan').value;
            var subscriptionFee = document.getElementById('subsciptFee').value;
            var paymentMethod = document.getElementById('paymentMethodSelect').value;

            var requestData = {
                companyName: companyName,
                subscriptionPlan: subscriptionPlan,
                subscriptionFee: subscriptionFee,
                paymentMethod: paymentMethod
            };

        });
    }

    // function paymentMethod() {

    // }
}; 