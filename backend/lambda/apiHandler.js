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
            case "GET /hydrophones":
                data = await dbConnection`SELECT * FROM hydrophones;`;
                response.body = JSON.stringify(data);
                
                break;
                
            case "POST /hydrophones":
	        	if (event.body != null){
	        		const body = JSON.parse(event.body);
	        		
	        		data = await dbConnection`
		            	INSERT INTO hydrophones
			            	(hydrophone_operator_id, 
			            	 hydrophone_name, 
			            	 hydrophone_site,
			            	 hydrophone_coordinates, 
			            	 sampling_frequency,
			            	 depth,
			            	 deployment_date,
			            	 range,
			            	 angle_of_view)
			            VALUES 
			            	(${body.hydrophone_operator_id}, 
			            	 ${body.hydrophone_name},
			            	 ${body. hydrophone_site},
			            	 ${body.hydrophone_coordinates},
			            	 ${body.sampling_frequency},
			            	 ${body.depth},
			            	 ${body.deployment_date},
			            	 ${body.range},
			            	 ${body.angle_of_view});
						`;
	        	}
				
	        	break;
	        	
	        case "DELETE /hydrophones":
            	if (event.queryStringParameters['hydrophone_id'] != null){
            		const hydrophone_id = event.queryStringParameters['hydrophone_id'];

            		data = await dbConnection`
		            	DELETE FROM hydrophones WHERE hydrophone_id = ${hydrophone_id};`;
            	}
				
            	break;
            
            case "GET /operators":
            	data = await dbConnection`
	            	SELECT
					    hydrophone_operators.*,
						ARRAY_AGG(CONCAT(hydrophones.hydrophone_site)) AS hydrophone_info
					FROM
					    hydrophone_operators
					LEFT JOIN
					    hydrophones ON hydrophone_operators.hydrophone_operator_id = hydrophones.hydrophone_operator_id
					GROUP BY
					    hydrophone_operators.hydrophone_operator_id, hydrophone_operators.hydrophone_operator_name, hydrophone_operators.contact_info;
				`;
            	response.body= JSON.stringify(data);
            	
            	break;
            	
            case "POST /operators":
            	if (event.body != null){
            		const body = JSON.parse(event.body);
            		
            		data = await dbConnection`
		            	INSERT INTO hydrophone_operators
			            	(hydrophone_operator_name, contact_info)
			            VALUES 
			            	(${body.hydrophone_operator_name}, ${body.contact_info});
						`;
            	}
				
            	break;
            	
            case "PUT /operators":
            	if (event.body != null){
            		const body = JSON.parse(event.body);
            		
            		data = await dbConnection`
		            	UPDATE hydrophone_operators
			            SET hydrophone_operator_name = ${body.hydrophone_operator_name}, contact_info = ${body.contact_info}
			            WHERE hydrophone_operator_id = ${body.hydrophone_operator_id};
						`;
            	}
				
            	break;
            	
            case "DELETE /operators":
            	if (event.queryStringParameters['operator_id'] != null){
            		const operator_id = event.queryStringParameters['operator_id'];

            		data = await dbConnection`
		            	DELETE FROM hydrophone_operators WHERE hydrophone_operator_id = ${operator_id};`;
            	}
				
            	break;
        }
    }
    catch(error){
        response.statusCode = 400;
		response.body = JSON.stringify(error.message);
    }

    return response
};