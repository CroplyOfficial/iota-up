import mongoose from 'mongoose';

/*
 * Connect to the database using the connection string
 * passed to the function
 *
 * @param   connString: mongoDB connection string
 * @returns none
 * @output  if all goes good then DB connection would succeed
 */

const connectToDB = async (connString: string): Promise<void> => {
  try {
    // await the connection from the URI
    const conn = await mongoose.connect(connString, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useCreateIndex: true,
    });

    console.log(`--> Connected to MongoDB on ${conn.connection.host}`);
  } catch (err) {
    console.log(`Can't connect to Mongo DB\nError: ${err}`);
    process.exit(1);
  }
};

export { connectToDB };
