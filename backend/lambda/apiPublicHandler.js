const postgres = require("postgres");
const AWS = require("aws-sdk");

// Gather AWS services
const secretsManager = new AWS.SecretsManager();

let { SM_DB_CREDENTIALS } = process.env;
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
        }
    }
    catch(error){
    	console.log("Error: ", error.message);
        response.statusCode = 400;
		response.body = JSON.stringify(error.message);
    }

    return response
};