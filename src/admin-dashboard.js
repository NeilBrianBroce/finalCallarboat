// import { initializeApp } from '../node_modules/firebase/app';
import { app } from './index';
import { getFirestore, collection, getDocs } from '../node_modules/firebase/firestore';

export async function dashboardFunctions() {
    const { v4: uuidv4 } = require('uuid');

    // const firebaseConfig = {
    //     apiKey: "AIzaSyAUWz7jfrt46iBvAnZ-AESn8kNmqtbTlmw",
    //     authDomain: "callarboat-19b3b.firebaseapp.com",
    //     databaseURL: "https://callarboat-19b3b-default-rtdb.asia-southeast1.firebasedatabase.app",
    //     projectId: "callarboat-19b3b",
    //     storageBucket: "callarboat-19b3b.appspot.com",
    //     messagingSenderId: "68894973461",
    //     appId: "1:68894973461:web:008be388c45659cb7d781c",
    //     measurementId: "G-F86YXR2HNM"
    // }

    // // init firebase app
    // const app = initializeApp(firebaseConfig);
    // Initialize Firestore
    const db = getFirestore(app);
    if (localStorage.getItem('adminSessionData') === null) {
        // Both items are empty, redirect to the index page
        window.location.replace("index.html");
    }


    //Mobile and web Count
    const mobUserCountElement = document.getElementById('mobileUserCount');
    const webUserCountElement = document.getElementById('webUserCount');
    // Reference to your collection
    const mobCollectionRef = collection(db, 'Passengers');
    const webCollectionRef = collection(db, 'Subscribers');

    async function getCount(collectionRef) {
        try {
            const querySnapshot = await getDocs(collectionRef);
            const count = querySnapshot.size;
            // console.log('Number of documents:', count);
            return count;
        } catch (error) {
            console.error('Error getting documents:', error);
            return 0;
        }
    }

    (async () => {
        const mobCount = await getCount(mobCollectionRef);
        const webCount = await getCount(webCollectionRef);

        mobUserCountElement.textContent = mobCount;
        webUserCountElement.textContent = webCount;
        changeFontSize();
    })();

    // //Mobile and web Count
    // const mobUserCountElement = document.getElementById('mobileUserCount');
    // const webUserCountElement = document.getElementById('webUserCount');
    // // Reference to your collection
    // const mobCollectionRef = collection(db, 'Passengers');
    // const webCollectionRef = collection(db, 'Subscribers');

    // if (mobCollectionRef && webCollectionRef) {
    //     async function getCount(collectionRef) {
    //         try {
    //             const querySnapshot = await getDocs(collectionRef);
    //             const count = querySnapshot.size;
    //             console.log('Number of documents:', count);
    //             return count;
    //         } catch (error) {
    //             console.error('Error getting documents:', error);
    //             return 0;
    //         }
    //     }

    //     (async () => {
    //         const mobCount = await getCount(mobCollectionRef);
    //         const webCount = await getCount(webCollectionRef);

    //         mobUserCountElement.textContent = mobCount;
    //         webUserCountElement.textContent = webCount;
    //         changeFontSize();
    //     })();
    // }

    //Function to Change the FontSize
    async function changeFontSize() {
        // Get the paragraph element with id="webUserCount".
        const webCount = document.querySelector('#webUserCount');

        // If the text in the paragraph element is 'loading', set the font size to 50px.
        if (webCount.textContent === 'Loading...') {
            webCount.style.fontSize = '50px';
        } else {
            // Otherwise, set the font size to 80px.
            webCount.style.fontSize = '80px';
        }

        // Get the paragraph element with id="mobileUserCount".
        const mobCount = document.querySelector('#mobileUserCount');

        // If the text in the paragraph element is 'loading', set the font size to 50px.
        if (mobCount.textContent === 'Loading...') {
            mobCount.style.fontSize = '50px';
        } else {
            // Otherwise, set the font size to 80px.
            mobCount.style.fontSize = '80px';
        }
    }
    changeFontSize();

    //Fetch Data and populate in the table
    const subscriberListData = document.getElementById('subscriberListData');

    const fetchAndDisplaySubscribers = async () => {
        try {
            const subscribersCollectionRef = collection(db, 'Subscribers');
            const querySnapshot = await getDocs(subscribersCollectionRef);

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const newRow = document.createElement('tr');
                newRow.className = 'align-middle';

                const subscriptionValue = data.subscriptionPlan === 'Monthly Plan' ? '200/mon' : '1500/yr';
                data.Subplan = subscriptionValue;

                const userStatus = document.createElement('td');
                const statusElement = document.createElement('p');
                statusElement.className = 'status';
                // statusElement.textContent = data.userStatus === 'active' ? 'Active' : 'Inactive';
                // statusElement.className = 'status';
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
                    newCell.textContent = data[col] || '';
                    newRow.appendChild(newCell);
                });

                newRow.appendChild(userStatus);
                subscriberListData.appendChild(newRow);
            });
        } catch (error) {
            // console.error('Error fetching documents:', error);
        }
    };

    fetchAndDisplaySubscribers();

};