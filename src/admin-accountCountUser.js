import { app } from './index';
import { getFirestore, collection, getDocs, addDoc, query, where, updateDoc, setDoc, deleteDoc, getDoc, count } from '../node_modules/firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateEmail, updatePassword, sendEmailVerification, EmailAuthProvider, reauthenticateWithCredential, password } from '../node_modules/firebase/auth';

export function accountsUserCountFunctions() {
    const { v4: uuidv4 } = require('uuid');
    const db = getFirestore(app);
    const auth = getAuth(app);
    // if (localStorage.getItem('adminSessionData') === null) {
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
        const adminCount = await getCount(adminCollectionRef);

        mobUserCountElement.textContent = mobCount;
        webUserCountElement.textContent = webCount;
        adminCountElement.textContent = adminCount;
        changeFontSize();
    })();

    //Function to Change the FontSize
    async function changeFontSize() {
        // Get the paragraph element with id="webUserCount".
        const webCount = document.querySelector('#webUser-Count');

        // If the text in the paragraph element is 'loading', set the font size to 50px.
        if (webCount.textContent === 'Loading...') {
            webCount.style.fontSize = '50px';
        } else {
            // Otherwise, set the font size to 80px.
            webCount.style.fontSize = '80px';
        }

        // Get the paragraph element with id="mobileUserCount".
        const mobCount = document.querySelector('#mobileUser-Count');

        // If the text in the paragraph element is 'loading', set the font size to 50px.
        if (mobCount.textContent === 'Loading...') {
            mobCount.style.fontSize = '50px';
        } else {
            // Otherwise, set the font size to 80px.
            mobCount.style.fontSize = '80px';
        }

        // Get the paragraph element with id="mobileUserCount".
        const admin = document.querySelector('#adminUser-Count');

        // If the text in the paragraph element is 'loading', set the font size to 50px.
        if (admin.textContent === 'Loading...') {
            admin.style.fontSize = '50px';
        } else {
            // Otherwise, set the font size to 80px.
            admin.style.fontSize = '80px';
        }
    }
    changeFontSize();
}