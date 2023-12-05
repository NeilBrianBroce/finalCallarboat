export function session() {
    function displaySessionData() {
        // Retrieve the JSON string from localStorage
        const adminSessionData = localStorage.getItem('adminSessionData');
        if (adminSessionData !== null) {
            // Parse the JSON string back to an array of objects
            const data = JSON.parse(adminSessionData);

            // You can now access properties of the objects in the array
            for (const adminData of data) {
                // document.getElementById('profileImage').src = adminData.profileImage;
                document.getElementById('avatarID').src = adminData.profileImage;
                // document.getElementById('profileImage').src = adminData.profileImage;
                document.getElementById('inputName').value = adminData.adminName;
                document.getElementById('inputEmail').value = adminData.adminEmail;
                document.getElementById('inputPassword').value = adminData.adminPassword;
                localStorage.setItem('adminUserID', adminData.userId);
            }
        } else {
            // Handle the case where no data is stored
            console.log('No data found in localStorage');
        }
    }
    displaySessionData();
}