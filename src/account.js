import {initializeApp} from '../node_modules/firebase/app'
import { getFirestore, collection, getDocs, addDoc, getDoc, query, where, orderBy, doc, deleteDoc, setDoc } from '../node_modules/firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from '../node_modules/@firebase/auth';
import '../node_modules/@firebase/auth';

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
   const app = initializeApp(firebaseConfig);
   const db = getFirestore()
   const scannersColRef = collection(db, 'Scanners');
   const auth = getAuth();

  // Function to add a new account to Firestore
  async function addAccount(userName, scannerEmail, scannerPassword) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, scannerEmail, scannerPassword);
      const user = userCredential.user;

      // Add additional information to Firestore
      const accountUniqueID = user.uid;
      await addDoc(scannersColRef, {
        account_ID: accountUniqueID,
        user_name: userName,
        scanner_Email: scannerEmail,
        // Additional fields if needed
      });

      console.log('Account added successfully!');
      $("#addAccountModal").modal("hide");
    } catch (error) {
      console.error('Error adding account!:', error);
    }
  }


  
  async function fetchAccounts() {
    try {
      const orderedQuery  = query(scannersColRef, orderBy('user_name', 'asc'));
      const accounts = [];

      getDocs(orderedQuery)
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          accounts.push(data); // Add the data to the array
        });

        // Now, the "vessels" array contains the ordered documents
        console.log(accounts);
        displayAccountsInTable(accounts);
      })
      .catch((error) => {
        console.error('Error getting documents: ', error);
      });
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  }

   // Function to display the vessels in an HTML table
   function displayAccountsInTable(accounts) {
    // Get the tbody element
    const tbody = document.getElementById('accountsTbody');

    // Clear the tbody
    tbody.innerHTML = '';

    // Iterate over the accounts array and create table rows
    accounts.forEach((account, index) => {
      const row = document.createElement('tr');

      // Create table cells for each data field
      const userNameCell = document.createElement('td');
      userNameCell.textContent = account.user_name;
      row.appendChild(userNameCell);

      const scannerEmailCell = document.createElement('td');
      scannerEmailCell.textContent = account.scanner_Email;
      row.appendChild(scannerEmailCell);

      // Create Password cell
      const scannerPasswordCell = document.createElement('td');
      scannerPasswordCell.textContent = '********'; // Display asterisks or any placeholder
      row.appendChild(scannerPasswordCell);

      // Create hidden input for the actual password
      const hiddenPasswordInput = document.createElement('input');
      hiddenPasswordInput.type = 'hidden';
      hiddenPasswordInput.value = account.scanner_Password;
      hiddenPasswordInput.id = 'hiddenPassword_' + account.account_ID;
      row.appendChild(hiddenPasswordInput);

      
      // Create Action cell
      const actionCell = document.createElement('td');

      // Create Edit button
      const editButton = document.createElement('button');
      editButton.textContent = 'Edit';
      editButton.classList.add('btn', 'btn-success');
      editButton.classList.add('editAccount');
      editButton.setAttribute('id', "edit_" + account.account_ID);
      actionCell.appendChild(editButton);

      editButton.addEventListener('click', function (event) {
        $("#editAccountModal").modal("show");
        $("#editAccountName").val(account.user_name);
        $("#editAccountEmail").val(account.scanner_Email);
        $("#editAccountPassword").val(account.scanner_Password);
        $("#editAccountID").val(account.account_ID);
      });

      // Create Delete button
      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete';
      deleteButton.classList.add('btn', 'btn-danger');
      deleteButton.classList.add('deleteAccount');
      deleteButton.setAttribute('id', "delete_" + account.account_ID);
      actionCell.appendChild(deleteButton);

      deleteButton.addEventListener('click', function (event) {
        deleteAccount(account.account_ID)
      });

      // Append the Action cell to the row
      row.appendChild(actionCell);

      // Append the row to the tbody
      tbody.appendChild(row);
    });
  }

  // Function to delete a vessel from Firestore
  async function deleteAccount(accountID) {
    try {
        // Show a confirmation prompt to the user
        const confirmDelete = confirm('Do you want to delete this entry?');

        // If the user confirms the deletion
        if (confirmDelete) {
            // Delete the document with the corresponding ID from the "Vessels" collection
            const getAccount = query(scannersColRef, where('account_ID', '==', accountID));
9
            getDocs(getAccount)
              .then((querySnapshot) => {
                if (!querySnapshot.empty) {
                  // If a document matching the search criteria is found, delete it
                  const doc = querySnapshot.docs[0]; // Get the first document (assuming it's unique)
                  const accountDocRef = doc.ref;

                  // Use deleteDoc to delete the document
                  return deleteDoc(accountDocRef);
                } else {
                  console.log('Document not found');
                }
              })
              .then(() => {
                console.log('Document deleted successfully');
              })
              .catch((error) => {
                console.error('Error:', error);
              });
            console.log('Account deleted successfully!');

            // Fetch the updated list of accounts
            await fetchAccounts();
        }
    } catch (error) {
        console.error('Error deleting account:', error);
    }
  }

  async function editAccount(accountID, userName, scannerEmail, scannerPassword) {
    try {
      // Check if any of the fields are empty
      if (!userName || !scannerEmail || !scannerPassword) {
        alert('All fields must be filled out');
        return;
      }

      const dataToUpdate = {
        user_name: userName,
        scanner_Email: scannerEmail,
        scanner_Password: scannerPassword
      };

      const getAccount = query(scannersColRef, where('account_ID', '==', accountID));

      getDocs(getAccount)
        .then((querySnapshot) => {
          if (!querySnapshot.empty) {
            // If a document matching the search criteria is found, update it
            const doc = querySnapshot.docs[0]; // Get the first document (assuming it's unique)
            const accountDocRef = doc.ref;
            return setDoc(accountDocRef, dataToUpdate, { merge: true });
            // // Use getDoc to retrieve the current document data
            // return getDoc(vesselDocRef);
          } else {
            console.log('Document not found');
          }
        })
        .then(() => {
          console.log('Document updated successfully');
          $("#editAccountModal").modal("hide");

        })
        .catch((error) => {
          console.error('Error:', error);
        });
    } catch (error) {
      console.error('Error updating account:', error);
    }
  }

  // Get the form element
  const addAccountForm = document.querySelector('#addAccountModal form');

  if (addAccountForm) {
    console.log(addAccountForm);

    addAccountForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const userName = document.getElementById('userName').value;
      const scannerEmail = document.getElementById('scannerEmail').value;
      const scannerPassword = document.getElementById('scannerPassword').value;

      if (!userName || !scannerEmail || !scannerPassword) {
        alert('All fields must be filled out');
        return;
      }

      await addAccount(userName, scannerEmail, scannerPassword);
      addAccountForm.reset();
      await fetchAccounts();
    });
  }

  const editAccountForm = document.querySelector('#editAccountModal form');

  if(editAccountForm){
    console.log(editAccountForm);

    // Add an event listener for the submit event
    editAccountForm.addEventListener('submit', async (event) => {
      // Prevent the form from being submitted normally
      event.preventDefault();

      // Get the values from the form
      const accountID = document.getElementById('editAccountID').value;
      const userName = document.getElementById('editAccountName').value;
      const scannerEmail = document.getElementById('editScannerEmail').value;
      const scannerPassword = document.getElementById('editScannerPassword').value;
     

      // Check if any of the fields are empty
      if (!userName || !scannerEmail || !scannerPassword) {
        alert('All fields must be filled out');
        return;
      }

      // Call the addVessel function with the entered data
      await editAccount(accountID, userName, scannerEmail, scannerPassword);

      // Clear the form
      editAccountForm.reset();

      // Fetch the updated list of vessels
      await fetchAccounts();
    });
  }
  
  // Fetch the list of vessels when the page loads
  fetchAccounts();

}