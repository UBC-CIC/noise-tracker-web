const postgres = require("postgres");
const AWS = require("aws-sdk");

// Gather AWS services
const secretsManager = new AWS.SecretsManager();
const s3 = new AWS.S3();

let { SM_DB_CREDENTIALS, BUCKET_NAME } = process.env;
let dbConnection;  // Global variable to hold the database connection

async function initializeConnection(){
    // Retrieve the secret from AWS Secrets Manager
	const secret = await secretsManager
	.getSecretValue({ SecretId: SM_DB_CREDENTIALS })
	.promise();

	const credentials = JSON.parse(secret.SecretString);

	const connectionConfig = {
		host: credentials.host,
		port: credentials.port,
		username: credentials.username,
		password: credentials.password,
		database: credentials.dbname,
		ssl: true,
	};

    dbConnection = postgres(connectionConfig);
}

async function calculateAverageSpl() {
    const hydrophonesSpl = await dbConnection`
        SELECT hydrophone_id FROM hydrophones;
    `;

    await Promise.all(hydrophonesSpl.map(async hydrophone => {
        const splAverages = [];
        
        const { hydrophone_id } = hydrophone;

        try {
            const objects = await getRecentObjects(BUCKET_NAME, `${hydrophone_id}/biospl`, 720, 30)

            if (objects.length > 0) {
                const allValues = []; // Array to accumulate all values from S3 objects
            
                // Fetch values from each S3 object
                await Promise.all(objects.map(async obj => {
                    const getObject = await s3.getObject({ Bucket: BUCKET_NAME, Key: obj }).promise();
                    const content = getObject.Body.toString('utf-8');
                    const values = JSON.parse(content);
                    allValues.push(...values); // Accumulate values from current S3 object
                }));
            
                // Calculate average for each f_min
                const sums = {};
                const counts = {};
                allValues.forEach(entry => {
                    const f_min = entry.f_min;
                    const f_max = entry.f_max;
                    const val = entry.val;
                    sums[f_min+'-'+f_max] = (sums[f_min+'-'+f_max] || 0) + val;
                    counts[f_min+'-'+f_max] = (counts[f_min+'-'+f_max] || 0) + 1;
                });
            
                const averages = {};
                for (const f_range in sums) {
                    averages[f_range] = sums[f_range] / counts[f_range];
                }
                
                for (const f_range in averages) {
                    const rangeValues = f_range.split('-')
                    splAverages.push({
                        "val": averages[f_range],
                        "f_max": rangeValues[1],
                        "f_min": rangeValues[0],
                    });
                }
                
                // Store JSON object in database
                const hydrophonesSpl = await dbConnection`
                    UPDATE hydrophones 
                    SET average_spl = ${splAverages}::jsonb
                    WHERE hydrophone_id = ${hydrophone_id};
                `;
            }
        } catch (error) {
            console.error("Error fetching S3 objects:", error);
        }
    }));
}

async function getRecentObjects(bucketName, prefix, numObjects, maxDatesToCheck) {
    // Get current date
    const currentDate = new Date();

    let continuationToken = null;
    let objectsCollected = [];
    let datesChecked = 0;
    
    while (objectsCollected.length < numObjects && datesChecked <= maxDatesToCheck) {
        // Iterate through dates from most recent to older
        const dateToCheck = new Date(currentDate);
        const datePrefix = `${prefix}/${dateToCheck.getFullYear()}/${(dateToCheck.getMonth() + 1).toString().padStart(2, '0')}/${dateToCheck.getDate().toString().padStart(2, '0')}`;

		// Temporary array to store object keys when there's a continuation token
        let tempObjectKeys = [];
        
        do {
            // List objects in the specified date prefix
            const response = await s3.listObjectsV2({ Bucket: bucketName, Prefix: datePrefix, ContinuationToken: continuationToken }).promise();
    
            if (response.Contents && response.Contents.length > 0) {
                // Extract object keys and add to objectsCollected
                const objectKeys = response.Contents.map(obj => obj.Key).filter(key => key.endsWith('.json'));
                
                // If there's a continuation token, add objectKeys to the temporary array
                if (response.NextContinuationToken) {
                    tempObjectKeys = tempObjectKeys.concat(objectKeys);
                } else {
                    // If there's no continuation token, sort objectKeys in descending order and add them to objectsCollected array
                    const sortedObjectKeys = objectKeys.sort((a, b) => b.localeCompare(a));
                    objectsCollected = objectsCollected.concat(sortedObjectKeys);
                }
            }
            
            // Update continuation token for pagination
            continuationToken = response.NextContinuationToken;

        } while (continuationToken);
        
        /// If there are object keys in the temporary array, sort them in descending order and add to objectsCollected array
        if (tempObjectKeys.length > 0) {
            const sortedTempObjectKeys = tempObjectKeys.sort((a, b) => b.localeCompare(a));
            objectsCollected = objectsCollected.concat(sortedTempObjectKeys);
        }

        // If we have already collected enough objects, break the loop
        if (objectsCollected.length >= numObjects) {
            break;
        }
        
        // Move to the previous day if necessary
        currentDate.setDate(currentDate.getDate() - 1);
        
        // Increment the number of dates checked
        datesChecked++;
    }

    return objectsCollected.slice(0, numObjects);
}


exports.handler = async (event) => {
	if(!dbConnection){
		await initializeConnection();
	}

    try{
		await calculateAverageSpl();
    }
    catch(error){
    	console.log("Error: ", error.message);
    }
};