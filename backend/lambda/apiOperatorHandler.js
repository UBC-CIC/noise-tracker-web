const postgres = require("postgres");
const { jwtDecode } = require("jwt-decode");
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
            case "GET /operator/operators":
                data = await dbConnection`
	            	SELECT
					    hydrophone_operators.hydrophone_operator_name,
					    hydrophone_operators.contact_email,
					    ARRAY_AGG(CONCAT(hydrophones.site)) AS hydrophone_info
					FROM
					    hydrophone_operators
					LEFT JOIN
					    hydrophones ON hydrophone_operators.hydrophone_operator_id = hydrophones.hydrophone_operator_id
					WHERE
    					hydrophone_operators.in_directory = 'true'
					GROUP BY
					    hydrophone_operators.hydrophone_operator_name, hydrophone_operators.contact_email;
				`;
                response.body = JSON.stringify(data);
                
                break;
                
            case "GET /operator/hydrophones":
            	const token = event.headers.Authorization; // Assuming the token is in the Authorization header
            	const decodedToken = jwtDecode(token);
            	const username = decodedToken.username;
            	
                data = await dbConnection`
	            	SELECT hydrophones.*, hydrophone_operators.hydrophone_operator_name
					FROM hydrophones
					JOIN hydrophone_operators ON hydrophones.hydrophone_operator_id = hydrophone_operators.hydrophone_operator_id
					WHERE hydrophone_operators.contact_email = ${username};
				`;
				
				// Generating presigned URLs for each row
			    for (let i = 0; i < data.length; i++) {
			        const { hydrophone_operator_id, hydrophone_id } = data[i];
			        const Key = `${hydrophone_operator_id}/${hydrophone_id}/calibration.csv`;
			        const params = {
			            Bucket: BUCKET_NAME,
			            Key: Key,
			            Expires: 3600 // URL expiration time in seconds
			        };
			        const presignedUrl = s3.getSignedUrl('getObject', params);
			        data[i].presignedUrl = presignedUrl;
			    }
                response.body = JSON.stringify(data);
                
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