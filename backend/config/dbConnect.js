const mongoose = require('mongoose')

const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL, {
            // useNewUrlParser: true,
            // useUnifiedTopology: true
        })
        console.log("db connected successfully");
    } catch (error) {
        console.error('failed to connect db', error);
        process.exit(1)
    }
}

module.exports=connectDb