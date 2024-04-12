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
	            	SELECT h.hydrophone_id, h.site, h.coordinates, h.model, h.mounting_type, h.height_from_seafloor, 
			           h.sampling_frequency, h.depth, h.first_deployment_date, h.last_deployment_date, 
			           h.range, h.angle_of_view, h.file_length, h.file_format, h.directory, 
			           h.file_name, h.timezone, h.storage_interval, h.last_data_upload, 
			           h.calibration_available, ho.hydrophone_operator_name, ho.website
				    FROM hydrophones h
				    INNER JOIN hydrophone_operators ho ON h.hydrophone_operator_id = ho.hydrophone_operator_id;
				`;
                response.body = JSON.stringify(data);
                
                break;
                
            case "GET /public/spectrograms":
			    const hydrophones = await dbConnection`
			        SELECT hydrophone_operator_id, hydrophone_id FROM hydrophones;
			    `;
			
			    const promises = hydrophones.map(async hydrophone => {
			        const { hydrophone_operator_id, hydrophone_id } = hydrophone;
			        const params = {
			            Bucket: BUCKET_NAME,
			            Prefix: `${hydrophone_operator_id}/${hydrophone_id}/spectrogram/2`
			        };
			        try {
			            const objects = await s3.listObjectsV2(params).promise();
			            
			            // Sort objects based on datetime in the file name
			            const sortedObjects = objects.Contents.sort((a, b) => {
			                const dateA = getDateFromKey(a.Key);
			                const dateB = getDateFromKey(b.Key);

			                return dateB - dateA;
			            });
            
			            if (sortedObjects.length > 0) {
			                const recentObjects = sortedObjects.slice(0, 7);
			                const presignedUrls = await Promise.all(recentObjects.map(async obj => {
				                const presignedUrl = await s3.getSignedUrlPromise('getObject', {
				                    Bucket: BUCKET_NAME,
				                    Key: obj.Key,
				                    Expires: 3600 // 1 hour
				                });
				                
				                // Extract date from key
						        const date = getDateFromKey(obj.Key);

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
			        SELECT hydrophone_operator_id, hydrophone_id FROM hydrophones;
			    `;
			
			    const splPromises = hydrophonesSpl.map(async hydrophone => {
			        const { hydrophone_operator_id, hydrophone_id } = hydrophone;
			        const params = {
			            Bucket: BUCKET_NAME,
			            Prefix: `${hydrophone_operator_id}/${hydrophone_id}/biospl/2`
			        };
			        try {
			            const objects = await s3.listObjectsV2(params).promise();

			            // Sort objects based on datetime in the file name
			            const sortedObjects = objects.Contents.sort((a, b) => {
			                const dateA = getDateFromKey(a.Key);
			                const dateB = getDateFromKey(b.Key);
			
			                return dateB - dateA;
			            });
			            
			            if (sortedObjects.length > 0) {
			                const recentObjects = sortedObjects.slice(0, 10);
			                const data = await Promise.all(recentObjects.map(async obj => {
			                    const getObject = await s3.getObject({ Bucket: BUCKET_NAME, Key: obj.Key }).promise();
			                    const content = getObject.Body.toString('utf-8');
			                    const values = JSON.parse(content);
			                    const date = getDateFromKey(obj.Key); // Extracting date from the object key
			                    
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
        }
    }
    catch(error){
    	console.log("Error: ", error.message);
        response.statusCode = 400;
		response.body = JSON.stringify(error.message);
    }

    return response
};