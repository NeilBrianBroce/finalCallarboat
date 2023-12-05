(function () {
	"use strict";

	/**
	 * Easy selector helper function
	 */
	const select = (el, all = false) => {
		el = el.trim()
		if (all) {
			return [...document.querySelectorAll(el)];
		} else {
			return document.querySelector(el);
		}
	}

	/**
	 * Easy event listener function
	 */
	const on = (type, el, listener, all = false) => {
		let selectEl = select(el, all)
		if (selectEl) {
			if (all) {
				selectEl.forEach(e => e.addEventListener(type, listener))
			} else {
				selectEl.addEventListener(type, listener)
			}
		}
	}

	/**
	 * Easy on scroll event listener 
	 */
	const onscroll = (el, listener) => {
		el.addEventListener('scroll', listener)
	}

	// /**
	//  * Navbar links active state on scroll
	//  */
	// let navbarlinks = select('#navbar .scrollto', true)
	// const navbarlinksActive = () => {
	// 	let position = window.scrollY + 200
	// 	navbarlinks.forEach(navbarlink => {
	// 		if (!navbarlink.hash) return
	// 		let section = select(navbarlink.hash)
	// 		if (!section) return
	// 		if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
	// 			navbarlink.classList.add('active')
	// 		} else {
	// 			navbarlink.classList.remove('active')
	// 		}
	// 	})
	// }
	// window.addEventListener('load', navbarlinksActive)
	// onscroll(document, navbarlinksActive)

	let navbarlinks = document.querySelectorAll('#navbar .scrollto');

	const navbarlinksActive = () => {
		let position = window.scrollY + 200;


		navbarlinks.forEach(navbarlink => {
			let section = document.querySelector(navbarlink.hash);

			if (section) {
				if (position >= section.offsetTop && position <= section.offsetTop + section.offsetHeight) {
					navbarlinks.forEach(link => link.classList.remove('active'));
					navbarlink.classList.add('active');
				}
			}
		});
	};

	window.addEventListener('load', navbarlinksActive);
	window.addEventListener('scroll', navbarlinksActive);


	/**
	 * Scrolls to an element with header offset
	 */
	const scrollto = (el) => {
		let header = select('#header')
		let offset = header.offsetHeight
		let elementPos = select(el).offsetTop
		window.scrollTo({
			top: elementPos - offset,
			behavior: 'smooth'
		})
	}

	/**
	 * Toggle .header-scrolled class to #header when page is scrolled
	 */
	let selectHeader = select('#header')
	if (selectHeader) {
		const headerScrolled = () => {
			if (window.scrollY > 100) {
				selectHeader.classList.add('header-scrolled')
			} else {
				selectHeader.classList.remove('header-scrolled')
			}
		}
		window.addEventListener('load', headerScrolled)
		onscroll(document, headerScrolled)
	}

	/**
	 * Back to top button
	 */
	let backtotop = select('.back-to-top')
	if (backtotop) {
		const toggleBacktotop = () => {
			if (window.scrollY > 100) {
				backtotop.classList.add('active')
			} else {
				backtotop.classList.remove('active')
			}
		}
		window.addEventListener('load', toggleBacktotop)
		onscroll(document, toggleBacktotop)
	}

	/**
	 * Mobile nav toggle
	 */
	// on('click', '.mobile-nav-toggle', function (e) {
	// 	select('#navbar').classList.toggle('navbar-mobile')
	// 	this.classList.toggle('bi-list')
	// 	this.classList.toggle('bi-x')
	// })

	/**
	 * Mobile nav dropdowns activate
	 */
	// on('click', '.navbar .dropdown > a', function (e) {
	// 	if (select('#navbar').classList.contains('navbar-mobile')) {
	// 		e.preventDefault()
	// 		this.nextElementSibling.classList.toggle('dropdown-active')
	// 	}
	// }, true)

	/**
	 * Scrool with ofset on links with a class name .scrollto
	 */
	on('click', '.scrollto', function (e) {
		if (select(this.hash)) {
			e.preventDefault()

			let navbar = select('#navbar')
			if (navbar.classList.contains('navbar-mobile')) {
				navbar.classList.remove('navbar-mobile')
				let navbarToggle = select('.mobile-nav-toggle')
				navbarToggle.classList.toggle('bi-list')
				navbarToggle.classList.toggle('bi-x')
			}
			scrollto(this.hash)
		}
	}, true)

	/**
	 * Scroll with ofset on page load with hash links in the url
	 */
	window.addEventListener('load', () => {
		if (window.location.hash) {
			if (select(window.location.hash)) {
				scrollto(window.location.hash)
			}
		}
	});

	/**
	 * Animation on scroll
	 */
	window.addEventListener('load', () => {
		AOS.init({
			duration: 1000,
			easing: "ease-in-out",
			once: true,
			mirror: false
		});
	});

})()

/* Dashboard */

let arrow = document.querySelectorAll(".arrow");
for (var i = 0; i < arrow.length; i++) {
	arrow[i].addEventListener("click", (e) => {
		let arrowParent =

			e.target.parentElement.parentElement; //selecting main parent of 

		arrow
		arrowParent.classList.toggle("showMenu");
	});
}

// Sidebar and navbar collapsing
let sidebar = document.querySelector(".sidebar");
let sidebarBtn = document.querySelector(".bx-menu");
let mainNavbar = document.querySelector(".navbar"); // Select the main navbar
console.log(sidebarBtn);

sidebarBtn.addEventListener("click", () => {
	sidebar.classList.toggle("close");

	// Check if the sidebar is closed and adjust the margin-left of the main navbar
	if (sidebar.classList.contains("close")) {
		mainNavbar.style.marginLeft = '78px'; // You can adjust this margin as needed
	} else {
		mainNavbar.style.marginLeft = '260px'; // You can adjust this margin as needed
	}
});

// // Get all the navigation links
const navLinks = document.querySelectorAll(".nav-links li");

// Add a click event listener to each link
navLinks.forEach(link => {
	link.addEventListener("click", () => {
		// Remove the "active" class from all links
		navLinks.forEach(navLink => navLink.classList.remove("active"));

		// Add the "active" class to the clicked link
		link.classList.add("active");
	});
});


// // Section Show And Hide
// document.addEventListener("DOMContentLoaded", function () {
// 	// Get references to the navigation links and sections
// 	const dashboardLink = document.getElementById("dashboard-link");
// 	const accountsLink = document.getElementById("accounts-link");
// 	const subscriptionLink = document.getElementById("subscription-link");
// 	const notificationLink = document.getElementById("notification-link");


// 	const dashboardSection = document.getElementById("dashboard");
// 	const accountsSection = document.getElementById("accounts");
// 	const subscriptionSection = document.getElementById("subscription");
// 	const notificationSection = document.getElementById("notification");

// 	// Add click event listeners to the navigation links
// 	dashboardLink.addEventListener("click", function (e) {
// 		e.preventDefault(); // Prevent the default link behavior
// 		dashboardSection.style.display = "block";
// 		accountsSection.style.display = "none";
// 		subscriptionSection.style.display = "none";
// 		notificationSection.style.display = "none";
// 	});

// 	accountsLink.addEventListener("click", function (e) {
// 		e.preventDefault(); // Prevent the default link behavior
// 		dashboardSection.style.display = "none";
// 		accountsSection.style.display = "block";
// 		subscriptionSection.style.display = "none";
// 		notificationSection.style.display = "none";
// 	});

// 	subscriptionLink.addEventListener("click", function (e) {
// 		e.preventDefault(); // Prevent the default link behavior
// 		dashboardSection.style.display = "none";
// 		accountsSection.style.display = "none";
// 		subscriptionSection.style.display = "block";
// 		notificationSection.style.display = "none";
// 	});

// 	notificationLink.addEventListener("click", function (e) {
// 		e.preventDefault(); // Prevent the default link behavior
// 		dashboardSection.style.display = "none";
// 		accountsSection.style.display = "none";
// 		subscriptionSection.style.display = "none";
// 		notificationSection.style.display = "block";
// 	});
// });

// ------------------------------------------------

// // Get all the navigation links
// const navLinks = document.querySelectorAll(".nav-links li");

// // Function to set the active section ID in localStorage
// const setActiveSection = (sectionId) => {
// 	localStorage.setItem('activeSection', sectionId);
// };

// // Function to get the active section ID from localStorage
// const getActiveSection = () => {
// 	return localStorage.getItem('activeSection');
// };

// let targetSectionId;
// // Add a click event listener to each link
// navLinks.forEach(link => {
// 	link.addEventListener("click", () => {
// 		// Remove the "active" class from all links
// 		navLinks.forEach(link => link.classList.remove("active"));

// 		// Add the "active" class to the clicked link
// 		link.classList.add("active");

// 		// Hide all sections
// 		// document.querySelectorAll('.section').forEach(section => {
// 		// 	section.style.display = 'none';
// 		// });

// 		// Show the corresponding section
// 		targetSectionId = link.querySelector('a').getAttribute('href').substring(1);
// 		document.getElementById(targetSectionId).style.display = 'block';

// 		// Set the active section in localStorage
// 		setActiveSection(targetSectionId);
// 	});
// });

// // // Function to initialize the active section on page load
// // const initActiveSection = () => {
// // 	const activeSectionId = getActiveSection();
// // 	if (activeSectionId) {
// // 		const activeLink = document.querySelector(`.nav-links a[href="#${activeSectionId}"]`);
// // 		if (activeLink) {
// // 			activeLink.parentElement.classList.add('active');
// // 			document.getElementById(activeSectionId).style.display = 'block';
// // 		}
// // 	}
// // };
// // Function to initialize the active section on page load
// const initActiveSection = () => {
// 	console.log('Initializing active section');

// 	// Hide all sections
// 	document.querySelectorAll('.section').forEach(section => {
// 		section.style.display = 'none';
// 	});

// 	// Get the active section ID from localStorage
// 	const activeSectionId = getActiveSection();

// 	if (activeSectionId) {
// 		const activeLink = document.querySelector(`.nav-links a[href="#${activeSectionId}"]`);
// 		if (activeLink) {
// 			activeLink.parentElement.classList.add('active');
// 			document.getElementById(activeSectionId).style.display = 'block';
// 		}
// 	}
// };



// // Add event listener to initialize active section on page load
// window.addEventListener('load', initActiveSection);






























// showAndHide(targetSectionId);
// function showAndHide(targetSectionId) {
// 	if (targetSectionId == 'dashboard') {
// 		document.getElementById(targetSectionId).style.display = 'block';
// 		document.getElementById('accounts').style.display = 'none';
// 		document.getElementById('subscription').style.display = 'none';
// 		document.getElementById('notification').style.display = 'none';
// 	} else if (targetSectionId == 'accounts') {
// 		document.getElementById(targetSectionId).style.display = 'block';
// 		document.getElementById('dashboard').style.display = 'none';
// 		document.getElementById('subscription').style.display = 'none';
// 		document.getElementById('notification').style.display = 'none';
// 	} else if (targetSectionId == 'subscription') {
// 		document.getElementById(targetSectionId).style.display = 'block';
// 		document.getElementById('dashboard').style.display = 'none';
// 		document.getElementById('accounts').style.display = 'none';
// 		document.getElementById('notification').style.display = 'none';
// 	} else if (targetSectionId == 'notification') {
// 		document.getElementById(targetSectionId).style.display = 'block';
// 		document.getElementById('dashboard').style.display = 'none';
// 		document.getElementById('accounts').style.display = 'none';
// 		document.getElementById('subscription').style.display = 'none';
// 	}
// }
//-------------------------------------------------




// For the Chart
// $(document).ready(function () {
//         // Function to update chart dimensions
//         function updateChartDimensions() {
//             var chartContainer = $('#chart-container');
//             var canvas = $('#myChart');

//             // Check if the sidebar has the 'collapsed' class
//             var sidebarCollapsed = $('.sidebar').hasClass(
//                 'collapsed'); // Replace '.sidebar' with your actual sidebar
//             selector

//             if (sidebarCollapsed) {
//                 // Set specific dimensions when the sidebar is collapsed
//                 chartContainer.css('width', '100%');
//                 canvas.attr('width', '100%');
//                 canvas.attr('height', '300'); // Set a fixed height or adjust it as needed
//             } else {
//                 // Set dimensions when the sidebar is not collapsed
//                 chartContainer.css('width', '100%');
//                 canvas.attr('width', '100%');
//                 canvas.attr('height', '400'); // Set a different fixed height or adjust it as needed
//             }
//         }

//         // Initial update of chart dimensions
//         updateChartDimensions();

//         // Handle window resize events to update chart dimensions
//         $(window).resize(function () {
//             updateChartDimensions();
//         });

//         // Create your Chart.js chart here (same code as before)
//         var ctx = document.getElementById('myChart').getContext('2d');
//         var data = {
//             /* Your chart data here */
//         };
//         var myChart = new Chart(ctx, {
//             /* Your chart configuration here */
//         });
//     });