import mongoose from "mongoose";

export const connectToMongoDB = async () => {
	try {
		if (mongoose.connection.readyState === 1) {
			console.log("MongoDB already connected");
		} else {
			await mongoose.connect(process.env.MONGO_URI as string);
			console.log("MongoDB connected");
		}
	} catch (error) {
		console.error("MongoDB connection error:", error);
	}
};
