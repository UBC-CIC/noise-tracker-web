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
                data = await dbConnection`
                	SELECT hydrophones.*, hydrophone_operators.hydrophone_operator_name
					FROM hydrophones
					JOIN hydrophone_operators ON hydrophones.hydrophone_operator_id = hydrophone_operators.hydrophone_operator_id;
				`;
                response.body = JSON.stringify(data);
                
                break;
                
            case "POST /hydrophones":
	        	if (event.body != null){
	        		const body = JSON.parse(event.body);
	        		
	        		const operator_id = await dbConnection`
					    SELECT hydrophone_operator_id
					    FROM hydrophone_operators
					    WHERE hydrophone_operator_name = ${body.hydrophone_operator_id};
					`;
					
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
			            	(${operator_id[0].hydrophone_operator_id}, 
			            	 ${body.hydrophone_name},
			            	 ${body.hydrophone_site},
			            	 ${body.hydrophone_coordinates},
			            	 ${body.sampling_frequency},
			            	 ${body.depth},
			            	 ${body.deployment_date},
			            	 ${body.range},
			            	 ${body.angle_of_view});
						`;
	        	}
				
	        	break;
	        	
	        case "PUT /hydrophones":
            	if (event.body != null){
            		const body = JSON.parse(event.body);
            		
            		const operator_id = await dbConnection`
					    SELECT hydrophone_operator_id
					    FROM hydrophone_operators
					    WHERE hydrophone_operator_name = ${body.hydrophone_operator_name};
					`;
            		
            		data = await dbConnection`
		            	UPDATE hydrophones
			            SET 
			            	hydrophone_operator_id = ${operator_id[0].hydrophone_operator_id},
						    hydrophone_name = ${body.hydrophone_name},
						    hydrophone_site = ${body.hydrophone_site},
						    hydrophone_coordinates = ${body.hydrophone_coordinates},
						    sampling_frequency = ${body.sampling_frequency},
						    depth = ${body.depth},
						    deployment_date = ${body.deployment_date},
						    range = ${body.range},
						    angle_of_view = ${body.angle_of_view}
			            WHERE hydrophone_id = ${body.hydrophone_id};
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
            	if (event.queryStringParameters != null){
	            	if (event.queryStringParameters['query'] === 'getOperatorData'){
	            		data = await dbConnection`SELECT hydrophone_operator_name FROM hydrophone_operators`;
		            		
		            	response.body= JSON.stringify(data);
	            	}
            	}
            	
            	else {
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
            	}
            	
            	break;
            	
            case "POST /operators":
            	if (event.body != null){
            		const body = JSON.parse(event.body);
            		
            		data = await dbConnection`
		            	INSERT INTO hydrophone_operators
			            	(hydrophone_operator_name, contact_info)
			            VALUES 
			            	(${body.hydrophone_operator_name}, ${body.contact_info})
			            RETURNING hydrophone_operator_id;
						`;

			        // The result will be an array, get the first element as the UUID
			        const hydrophone_operator_id = data[0].hydrophone_operator_id;
			        
		            // Create a placeholder object to simulate the folder
					const params = {
					  Bucket: BUCKET_NAME,
					  Key: `${hydrophone_operator_id}/`,
					};
					
					// Upload the placeholder object to simulate the folder creation
					await s3.putObject(params).promise();;
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

            		// Delete the hydrophone operator from the database and return the hydrophone_operator_id
			        data = await dbConnection`
			            DELETE FROM hydrophone_operators
			            WHERE hydrophone_operator_id = ${operator_id}
			            RETURNING hydrophone_operator_id;`;
			
			        if (data.length > 0) {
			            const hydrophone_operator_id = data[0].hydrophone_operator_id;
			
			            // List objects with the common prefix
			            const listParams = {
			                Bucket: BUCKET_NAME,
			                Prefix: `${hydrophone_operator_id}/`,
			            };
			
			            const objectsToDelete = await s3.listObjectsV2(listParams).promise();
			
			            // Delete the objects in batches (if there are many)
			            if (objectsToDelete.Contents.length > 0) {
			                const deleteParams = {
			                    Bucket: BUCKET_NAME,
			                    Delete: {
			                        Objects: objectsToDelete.Contents.map(obj => ({ Key: obj.Key })),
			                    },
			                };
			
			                await s3.deleteObjects(deleteParams).promise();
			            }
			        }
            	}
				
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