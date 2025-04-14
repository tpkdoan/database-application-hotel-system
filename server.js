const express = require("express");
const { MongoClient } = require("mongodb");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();

const uri =
    "mongodb+srv://s3978798:khanhdoan@dba-cluster.nlr6h.mongodb.net/?retryWrites=true&w=majority&appName=DBA-Cluster";
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

let db; // Declare db variable

// Connect to MongoDB
async function connectToDatabase() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
        db = client.db("sample_airbnb");
    } catch (error) {
        console.error("Failed to connect to MongoDB", error);
    }
}
connectToDatabase();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));

// API endpoint to fetch data from "listingsAndReviews" collection with pagination
app.get("/api/data", async (req, res, next) => {
    try {
        const {
            location,
            propertyType,
            bedrooms,
            page = 1,
            limit = 10,
        } = req.query;

        const query = {};
        if (location) {
            query["address.market"] = { $regex: new RegExp(location, "i") };
        }
        if (propertyType) {
            query["property_type"] = propertyType;
        }
        if (bedrooms) {
            query["bedrooms"] = parseInt(bedrooms);
        }

        // Count total items that match the query without pagination limits
        const totalItems = await db
            .collection("listingsAndReviews")
            .countDocuments(query);

        // Get paginated data
        const options = {
            skip: (page - 1) * limit,
            limit: parseInt(limit),
        };
        const data = await db
            .collection("listingsAndReviews")
            .find(query, options)
            .toArray();

        res.json({ data, totalItems }); // Send data along with total count
    } catch (error) {
        console.error("Failed to fetch data from MongoDB", error);
        next(error);
    }
});

// API endpoint to get distinct property types
app.get("/api/property-types", async (req, res, next) => {
    try {
        const propertyTypes = await db.collection("listingsAndReviews").distinct("property_type");
        res.json(propertyTypes);
    } catch (error) {
        console.error("Failed to fetch property types from MongoDB", error);
        next(error);
    }
});

// API endpoint to get distinct number of bedrooms
app.get("/api/bedrooms", async (req, res, next) => {
    try {
        const bedrooms = await db.collection("listingsAndReviews").distinct("bedrooms");
        res.json(bedrooms);
    } catch (error) {
        console.error("Failed to fetch bedrooms from MongoDB", error);
        next(error);
    }
});

// Route for serving the bookings.html page
app.get("/bookings/:listing_id", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "bookings.html"));
});

app.post("/api/bookings", async (req, res) => {
    try {
        const { listing_id, arrival_date, departure_date, client } = req.body;

        if (!listing_id) {
            return res
                .status(400)
                .json({ success: false, message: "Listing ID is required" });
        }

        // Generate a unique booking ID
        const booking_id = Math.floor(Math.random() * 100000);

        // Structure the booking data
        const bookingData = {
            booking_id,
            listing_id,
            arrival_date: new Date(arrival_date), // Fix the typo from arrival_date to arrival_date
            departure_date: new Date(departure_date),
            client: {
                name: client.name,
                email_address: client.email_address,
                mobile_phone: client.mobile_phone,
                postal_address: client.postal_address,
                home_address: client.home_address,
            },
        };

        // Insert the booking data into the database
        const result = await db.collection("bookings").insertOne(bookingData);

        // Fetch property name using the listing_id
        const property = await db
            .collection("listingsAndReviews")
            .findOne({ _id: listing_id });

        if (!property) {
            return res
                .status(404)
                .json({ success: false, message: "Property not found" });
        }

        res.status(201).json({
            success: true,
            message: "Booking created successfully",
            booking_id: booking_id,
            property_name: property.name, // Pass the property name to the response
        });
    } catch (error) {
        console.error("Error creating booking", error);
        res.status(500).json({
            success: false,
            message: "Failed to create booking",
        });
    }
});

// Route for serving the add.html page
app.get("/all-bookings", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "allBookings.html"));
});

// Error handler for 404
app.use((req, res, next) => {
    res.status(404).send("Not found");
});

// Start the Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

