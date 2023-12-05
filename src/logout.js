export function logout() {
    // Admin Logout
    const logout = document.getElementById('logoutID');
    if (logout) {
        logout.addEventListener('click', function (event) {
            event.preventDefault();
            console.log('Logout');
            if (confirm('Are you sure you want to logout?')) {
                console.log('Logout');
                // Remove 'adminSessionData' and 'adminUserID' from localStorage
                // if (localStorage.getItem('adminSessionData') !== null && localStorage.getItem('adminUserID') !== null) {
                localStorage.removeItem('adminSessionData');
                localStorage.removeItem('adminUserID');
                // }

                // Check if both 'adminSessionData' and 'adminUserID' are empty
                // if (localStorage.getItem('adminSessionData') === null && localStorage.getItem('adminUserID') === null) {
                // Both items are empty, redirect to the index page
                window.location.replace("index.html");
                // }
            }
        })
    }
}