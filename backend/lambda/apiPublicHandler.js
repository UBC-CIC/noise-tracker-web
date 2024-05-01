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
                const objectKeys = response.Contents.map(obj => obj.Key).filter(key => key.endsWith('.json') || key.endsWith('.png'));
                
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
        
        // If there are object keys in the temporary array, sort them in descending order and add to objectsCollected array
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


// The month needs to be adjusted by -1 because JavaScript uses a zero-based indexing for months (January is 0, December is 11).
const getDateFromKey = key => {
    const match = key.match(/(\d{4})-(\d{2})-(\d{2})-(\d{2})-(\d{2})-(\d{2})/);
    return match ? new Date(match[1], match[2] - 1, match[3], match[4], match[5], match[6]) : null;
};

exports.handler = async (event) => {
	if(!dbConnection){
		await initializeConnection();
	}
	
	const response = {
		statusCode: 200,
		headers: {
			"Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key",
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "*"
		},
		body: "", 
	};

    let data;
    try{
        const request = event.httpMethod + " " + event.resource;

        switch(request){
            case "GET /public/hydrophones":
                data = await dbConnection`
	            	SELECT h.hydrophone_id, h.site, h.latitude, h.longitude, h.model, h.mounting_type, h.height_from_seafloor, 
			           h.sampling_frequency, h.depth, h.first_deployment_date, h.last_deployment_date, 
			           h.range, h.angle_of_view,
			           h.calibration_available, ho.hydrophone_operator_name, ho.website
				    FROM hydrophones h
				    INNER JOIN hydrophone_operators ho ON h.hydrophone_operator_id = ho.hydrophone_operator_id
					WHERE h.hydrophone_is_public = true;
				`;
                response.body = JSON.stringify(data);
                
                break;
                
            case "GET /public/spectrograms":
			    const hydrophones = await dbConnection`
			        SELECT hydrophone_id 
					FROM hydrophones
					WHERE hydrophone_is_public = true;
			    `;
			
			    const promises = hydrophones.map(async hydrophone => {
			        const { hydrophone_id } = hydrophone;

			        try {
			            const objects = await getRecentObjects(BUCKET_NAME, `${hydrophone_id}/spectrogram`, 7, 30)
			            
			            if (objects.length > 0) {
			                const presignedUrls = await Promise.all(objects.map(async obj => {
				                const presignedUrl = await s3.getSignedUrlPromise('getObject', {
				                    Bucket: BUCKET_NAME,
				                    Key: obj,
				                    Expires: 3600 // 1 hour
				                });
				                
				                // Extract date from key
						        const date = getDateFromKey(obj);

						        return {
						          date,
						          presignedUrl
						        };
				            }));
			                return {
			                    hydrophone_id: hydrophone_id,
			                    presignedUrls
			                };
			            } else {
			                return null;
			            }
			        } catch (error) {
			            console.error("Error fetching S3 objects:", error);
			            return null;
			        }
			    });
			
			    const presignedUrls = await Promise.all(promises);
			    response.body = JSON.stringify(presignedUrls.filter(url => url !== null));
			    break;
		
			case "GET /public/spl":
			    const hydrophonesSpl = await dbConnection`
			        SELECT hydrophone_id 
					FROM hydrophones
					WHERE hydrophone_is_public = true;
			    `;
			
			    const splPromises = hydrophonesSpl.map(async hydrophone => {
			        const { hydrophone_id } = hydrophone;

			        try {
			            const objects = await getRecentObjects(BUCKET_NAME, `${hydrophone_id}/biospl`, 24, 30)
			            
			            if (objects.length > 0) {
			                const data = await Promise.all(objects.map(async obj => {
			                    const getObject = await s3.getObject({ Bucket: BUCKET_NAME, Key: obj }).promise();
			                    const content = getObject.Body.toString('utf-8');
			                    const values = JSON.parse(content);
			                    const date = getDateFromKey(obj); // Extracting date from the object key
			                    
			                    return {
			                        date,
			                        values
			                    };
			                }));
			                
			                return {
			                    hydrophone_id: hydrophone_id,
			                    data
			                };
			            } else {
			                return null;
			            }
			        } catch (error) {
			            console.error("Error fetching S3 objects:", error);
			            return null;
			        }
			    });
			
			    const splDataUrls = await Promise.all(splPromises);
			    response.body = JSON.stringify(splDataUrls.filter(url => url !== null));
			    break;
			    
			case "GET /public/gauge":
			    const hydrophonesGauge = await dbConnection`
			        SELECT hydrophone_id, average_spl 
					FROM hydrophones
					WHERE hydrophone_is_public = true;
			    `;
			
			    const gaugePromises = hydrophonesGauge.map(async hydrophone => {
			        const { hydrophone_id, average_spl } = hydrophone;

			        try {
			            const objects = await getRecentObjects(BUCKET_NAME, `${hydrophone_id}/biospl`, 1, 30)
			            
			            if (objects.length > 0) {
			                const recent_spl = await Promise.all(objects.map(async obj => {
			                    const getObject = await s3.getObject({ Bucket: BUCKET_NAME, Key: obj }).promise();
			                    const content = getObject.Body.toString('utf-8');
			                    const values = JSON.parse(content);
			                    const date = getDateFromKey(obj); // Extracting date from the object key
			                    
			                    return {
			                        date,
			                        values
			                    };
			                }));
			                
			                return {
			                    hydrophone_id: hydrophone_id,
			                    average_spl: average_spl,
			                    recent_spl
			                };
			            } else {
			                return null;
			            }
			        } catch (error) {
			            console.error("Error fetching S3 objects:", error);
			            return null;
			        }
			    });
			
			    const gaugeDataUrls = await Promise.all(gaugePromises);
			    response.body = JSON.stringify(gaugeDataUrls.filter(url => url !== null));
			    break;
        }
    }
    catch(error){
    	console.log("Error: ", error.message);
        response.statusCode = 400;
		response.body = JSON.stringify(error.message);
    }

    return response
};