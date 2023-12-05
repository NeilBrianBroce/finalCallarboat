import { initializeApp } from '../node_modules/firebase/app'
import { getFirestore, collection, getDocs, addDoc, getDoc, query, where, orderBy, doc, deleteDoc, setDoc } from '../node_modules/firebase/firestore';


export function dashboardFunctions() {
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
    const app = initializeApp(firebaseConfig);
    // Initialize Firestore
    const db = getFirestore(app);


    //Display Subscription List
    console.log("Hello you call me");
}