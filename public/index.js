let fetchedData = [];
let currentPage = 1;
const itemsPerPage = 10;

// Function to display a batch of items
function displayItems(data) {
    const container = document.getElementById("data");
    container.innerHTML = ""; // Clear previous items

    data.forEach((item) => {
        const itemDiv = document.createElement("div");
        itemDiv.classList.add("listing","item-row", "my-4", "border", "border-black", "p-3", "rounded", "rounded-4");

        const nameElement = document.createElement("a");
        // nameElement.href = `${item.listing_url}?listing_id=${item.listing_id}`;
        nameElement.href = `/bookings/${item._id}`;
        nameElement.textContent = item.name;
        nameElement.classList.add("property-link");

        const summaryElement = document.createElement("p");
        summaryElement.textContent = item.summary;

        const priceElement = document.createElement("p");
        priceElement.textContent = `Daily Rate: $${
            item.price?.$numberDecimal ?? "N/A"
        }`;

        const reviewScoreElement = document.createElement("p");
        reviewScoreElement.textContent = `Customer Rating: ${
            item.review_scores?.review_scores_rating ?? "N/A"
        }`;

        // Create "Book Now" button
        const bookButton = document.createElement("a");
        bookButton.href = `/bookings/${item._id}`;
        bookButton.textContent = "Book Now";
        bookButton.classList.add("btn", "btn-dark");

        itemDiv.appendChild(nameElement);
        itemDiv.appendChild(summaryElement);
        itemDiv.appendChild(priceElement);
        itemDiv.appendChild(reviewScoreElement);
        itemDiv.appendChild(bookButton);

        container.appendChild(itemDiv);
    });
}

// Function to fetch data based on current page
async function fetchPage(page) {
    const location = document.getElementById("location").value;
    const propertyType = document.getElementById("propertyType").value;
    const bedrooms = document.getElementById("bedrooms").value;

    let query = `/api/data?page=${page}&limit=${itemsPerPage}`;
    if (location) query += `&location=${encodeURIComponent(location)}`;
    if (propertyType)
        query += `&propertyType=${encodeURIComponent(propertyType)}`;
    if (bedrooms) query += `&bedrooms=${encodeURIComponent(bedrooms)}`;

    try {
        const response = await fetch(query);
        const { data, totalItems } = await response.json();
        fetchedData = data; // Store the fetched data
        displayItems(fetchedData); // Display the fetched data
        updatePagination(totalItems); // Update pagination
    } catch (error) {
        console.error("Failed to fetch data", error);
    }
}

// Function to create and update pagination
function updatePagination(totalItems) {
    const paginationContainer = document.getElementById("pagination");
    paginationContainer.innerHTML = ""; // Clear previous pagination

    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const maxVisiblePages = 5;

    // Calculate the range of pages to display around the current page
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Adjust startPage if endPage is too close to totalPages
    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // "Previous" button
    if (currentPage > 1) {
        const prevItem = document.createElement("li");
        prevItem.classList.add("page-item");
        const prevLink = document.createElement("a");
        prevLink.classList.add("page-link");
        prevLink.textContent = "Previous";
        prevLink.href = "#";
        prevLink.addEventListener("click", (e) => {
            e.preventDefault();
            currentPage--;
            fetchPage(currentPage);
        });
        prevItem.appendChild(prevLink);
        paginationContainer.appendChild(prevItem);
    }

    // Page numbers within the calculated range
    for (let i = startPage; i <= endPage; i++) {
        const pageItem = document.createElement("li");
        pageItem.classList.add("page-item");

        const pageLink = document.createElement("a");
        pageLink.classList.add("page-link");
        pageLink.textContent = i;
        pageLink.href = "#";
        pageLink.addEventListener("click", (e) => {
            e.preventDefault();
            currentPage = i;
            fetchPage(currentPage);
        });

        if (i === currentPage) {
            pageItem.classList.add("active");
        }

        pageItem.appendChild(pageLink);
        paginationContainer.appendChild(pageItem);
    }

    // "Next" button
    if (currentPage < totalPages) {
        const nextItem = document.createElement("li");
        nextItem.classList.add("page-item");
        const nextLink = document.createElement("a");
        nextLink.classList.add("page-link");
        nextLink.textContent = "Next";
        nextLink.href = "#";
        nextLink.addEventListener("click", (e) => {
            e.preventDefault();
            currentPage++;
            fetchPage(currentPage);
        });
        nextItem.appendChild(nextLink);
        paginationContainer.appendChild(nextItem);
    }
}

function validateAndSearch(event) {
    // Prevent the form from submitting if not valid
    event.preventDefault();

    // Check if the form is valid
    if (document.getElementById("searchForm").checkValidity()) {
        searchProperties();
    } else {
        // Trigger HTML5 validation messages if form is invalid
        document.getElementById("searchForm").reportValidity();
    }
}

async function fetchDropdownData() {
    try {
        // Fetch property types
        const propertyTypesResponse = await fetch("/api/property-types");
        const propertyTypes = await propertyTypesResponse.json();
        const propertyTypeSelect = document.getElementById("propertyType");

        propertyTypes.forEach((type) => {
            const option = document.createElement("option");
            option.value = type;
            option.textContent = type;
            propertyTypeSelect.appendChild(option);
        });

        // Fetch bedrooms
        const bedroomsResponse = await fetch("/api/bedrooms");
        const bedrooms = await bedroomsResponse.json();
        const bedroomsSelect = document.getElementById("bedrooms");

        bedrooms.forEach((bedroom) => {
            const option = document.createElement("option");
            option.value = bedroom;
            option.textContent = bedroom;
            bedroomsSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Failed to fetch dropdown data", error);
    }
}

async function searchProperties() {
    currentPage = 1;
    const location = document.getElementById("location").value;
    const propertyType = document.getElementById("propertyType").value;
    const bedrooms = document.getElementById("bedrooms").value;

    let query = `/api/data?`;
    if (location) query += `location=${encodeURIComponent(location)}&`;
    if (propertyType)
        query += `propertyType=${encodeURIComponent(propertyType)}&`;
    if (bedrooms) query += `bedrooms=${encodeURIComponent(bedrooms)}&`;

    try {
        const response = await fetch(query);
        const { data, totalItems } = await response.json(); // Get data and totalItems
        fetchedData = data;

        // Display total count of search results
        const resultCount = document.getElementById("resultCount");
        resultCount.textContent = `${totalItems} Listings that match your preferences`;

        displayItems(fetchedData);
        updatePagination(totalItems); // Update pagination based on the full total count

        // Add "Show all listings" link
        const showAllListingsDiv = document.getElementById("showAllListings");
        showAllListingsDiv.innerHTML = ""; // Clear previous link if any

        const showAllLink = document.createElement("a");
        showAllLink.href = "/"; // Link to homepage
        showAllLink.textContent = "Show all listings";
        showAllLink.classList.add( "btn-link", "p-0");
        showAllListingsDiv.appendChild(showAllLink);
    } catch (error) {
        console.error("Search failed", error);
    }
}

// Initial fetch of data when the page loads
window.onload = () => {
    fetchPage(currentPage);
    fetchDropdownData();
};
