import { connect, disconnect } from "mongoose";
async function connectToDatabase() {
    try {
        await connect(process.env.MONGODB_URL);
    }
    catch (error) {
        console.log(error);
        throw new error("Cannot connect to MongoDB");
    }
}
async function disconnectfromDb() {
    try {
        await disconnect();
    }
    catch (error) {
        console.log(error);
        throw new error("Cannot connect to MongoDB");
    }
}
export { connectToDatabase, disconnectfromDb };
//# sourceMappingURL=connection.js.map