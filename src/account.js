import {initializeApp} from '../node_modules/firebase/app'
import { getFirestore, collection, getDocs, addDoc, getDoc, query, where, orderBy, doc, deleteDoc, setDoc } from '../node_modules/firebase/firestore';

export function scannerFunctions() {
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
   initializeApp(firebaseConfig)

   //init services
   const db = getFirestore()
   const scannersColRef = collection(db, 'Scanners');

   // Add new scanner
   function addScanner(name, email, password) {
      const scannerData = {
          name: name,
          email: email,
          password: password
      };
      addDoc(scannersColRef, scannerData)
          .then((docRef) => {
              console.log("Document written with ID: ", docRef.id);
          })
          .catch((error) => {
              console.error("Error adding document: ", error);
          });
   }

   // Edit scanner
   function editScanner(id, name, email, password) {
      const scannerRef = doc(db, 'Scanners', id);
      const scannerData = {
          name: name,
          email: email,
          password: password
      };
      setDoc(scannerRef, scannerData, { merge: true })
          .then(() => {
              console.log("Document successfully updated!");
          })
          .catch((error) => {
              console.error("Error updating document: ", error);
          });
   }

   // Delete scanner
   function deleteScanner(id) {
      const scannerRef = doc(db, 'Scanners', id);
      deleteDoc(scannerRef)
          .then(() => {
              console.log("Document successfully deleted!");
          })
          .catch((error) => {
              console.error("Error removing document: ", error);
          });
   }

   // Display scanners
   function displayScanners() {
      const scannersQuery = query(scannersColRef);
      getDocs(scannersQuery)
          .then((querySnapshot) => {
              querySnapshot.forEach((doc) => {
                 console.log(`${doc.id} => ${doc.data()}`);
                 // Here you can add code to add a new row to the HTML table
              });
          })
          .catch((error) => {
              console.error("Error getting documents: ", error);
          });
   }
}
