const postgres = require("postgres");
const AWS = require("aws-sdk");

// Gather AWS services
const secretsManager = new AWS.SecretsManager();
const s3 = new AWS.S3();
const CognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();

let { SM_DB_CREDENTIALS, SM_COGNITO_CREDENTIALS, BUCKET_NAME } = process.env;
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

async function retrieveCognitoSecrets() {
	// Retrieve the secret from AWS Secrets Manager
	const secret = await secretsManager
	.getSecretValue({ SecretId: SM_COGNITO_CREDENTIALS })
	.promise();

	return JSON.parse(secret.SecretString)
}

async function createCognitoUser(email, userPoolId) {
  const params = {
    UserPoolId: userPoolId,
    Username: email,
    UserAttributes: [
      {
        Name: 'email',
        Value: email,
      },
    ],
  };

  try {
    const createUserResponse = await CognitoIdentityServiceProvider.adminCreateUser(params).promise();
    console.log('Cognito user created:', createUserResponse);
  } catch (error) {
    console.error('Error creating Cognito user:', error);
    throw error;
  }
}

async function addCognitoUserToGroup(email, userPoolId, groupName){
	const params = {
    UserPoolId: userPoolId,
    Username: email,
    GroupName: groupName
  };

  try {
    const addUserToGroupResponse = await CognitoIdentityServiceProvider.adminAddUserToGroup(params).promise();
    console.log('User added to group:', addUserToGroupResponse);
  } catch (error) {
    console.error('Error adding Cognito user to group:', error);
    throw error;
  }
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
            case "GET /admin/hydrophones":
                data = await dbConnection`
                	SELECT hydrophones.*, hydrophone_operators.hydrophone_operator_name
					FROM hydrophones
					JOIN hydrophone_operators ON hydrophones.hydrophone_operator_id = hydrophone_operators.hydrophone_operator_id;
				`;
                response.body = JSON.stringify(data);
                
                break;
                
            case "POST /admin/hydrophones":
	        	if (event.body != null){
	        		const body = JSON.parse(event.body);
	        		
	        		const operator_id = await dbConnection`
					    SELECT hydrophone_operator_id
					    FROM hydrophone_operators
					    WHERE hydrophone_operator_name = ${body.hydrophone_operator_name};
					`;
					
	        		data = await dbConnection`
		            	INSERT INTO hydrophones
			            	(hydrophone_operator_id, 
			            	 site,
			            	 coordinates,
			        		 model,
			        		 mounting_type,
			        		 height_from_seafloor,
			            	 sampling_frequency,
			            	 depth,
			            	 first_deployment_date,
			            	 last_deployment_date,
			            	 range,
			            	 angle_of_view,
			            	 file_length,
			            	 file_format,
			            	 directory,
			            	 file_name,
			            	 timezone,
			            	 storage_interval,
			            	 last_data_upload,
			            	 calibration_available)
			            VALUES 
			            	(${operator_id[0].hydrophone_operator_id}, 
			            	 ${body.site},
			            	 ${body.coordinates},
			            	 ${body.model},
			            	 ${body.mounting_type},
			            	 ${body.height_from_seafloor},
			            	 ${body.sampling_frequency},
			            	 ${body.depth},
			            	 ${body.first_deployment_date},
			            	 ${body.last_deployment_date},
			            	 ${body.range},
			            	 ${body.angle_of_view},
			            	 ${body.file_length},
			            	 ${body.file_format},
			            	 ${body.directory},
			            	 ${body.file_name},
			            	 ${body.timezone},
			            	 ${body.storage_interval},
			            	 ${body.last_data_upload},
			            	 ${body.calibration_available})
			        	RETURNING hydrophone_id;
						`;
					
					// The result will be an array, get the first element as the UUID
			        const hydrophone_id = data[0].hydrophone_id;
						
					// Define an object
					const params = {
					  Bucket: BUCKET_NAME,
					  Key: `${operator_id[0].hydrophone_operator_id}/${hydrophone_id}/`,
					};
					
					// Upload the object
					await s3.putObject(params).promise();
	        	}
				
	        	break;
	        	
	        case "PUT /admin/hydrophones":
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
						    site = ${body.site},
						    coordinates = ${body.coordinates},
						    model = ${body.model},
						    mounting_type = ${body.mounting_type},
			            	height_from_seafloor = ${body.height_from_seafloor},
						    sampling_frequency = ${body.sampling_frequency},
						    depth = ${body.depth},
						    first_deployment_date = ${body.first_deployment_date},
						    last_deployment_date = ${body.last_deployment_date},
						    range = ${body.range},
						    angle_of_view = ${body.angle_of_view},
						    file_length = ${body.file_length},
						    file_format = ${body.file_format},
						    directory = ${body.directory},
						    file_name = ${body.file_name},
						    timezone = ${body.timezone},
						    storage_interval = ${body.storage_interval},
						    last_data_upload = ${body.last_data_upload},
						    calibration_available = ${body.calibration_available}
			            WHERE hydrophone_id = ${body.hydrophone_id};
						`;
            	}
				
            	break;
	        	
	        case "DELETE /admin/hydrophones":
            	if (event.queryStringParameters['hydrophone_id'] != null){
            		const hydrophone_id_to_delete = event.queryStringParameters['hydrophone_id'];

            		data = await dbConnection`
		            DELETE FROM hydrophones 
		            WHERE hydrophone_id = ${hydrophone_id_to_delete} 
		            RETURNING hydrophone_id, hydrophone_operator_id;`;
		            	
		        	if (data.length > 0) {
			            const hydrophone_id = data[0].hydrophone_id;
			            const hydrophone_operator_id = data[0].hydrophone_operator_id;
			
			            // List objects with the common prefix
			            const listParams = {
			                Bucket: BUCKET_NAME,
			                Prefix: `${hydrophone_operator_id}/${hydrophone_id}/`,
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
            
            case "GET /admin/operators":
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
							ARRAY_AGG(CONCAT(hydrophones.site)) AS hydrophone_info
						FROM
						    hydrophone_operators
						LEFT JOIN
						    hydrophones ON hydrophone_operators.hydrophone_operator_id = hydrophones.hydrophone_operator_id
						GROUP BY
						    hydrophone_operators.hydrophone_operator_id;
						`;
	            	response.body= JSON.stringify(data);
            	}
            	
            	break;
            	
            case "POST /admin/operators":
            	if (event.body != null){
            		const body = JSON.parse(event.body);
            		
            		data = await dbConnection`
		            	INSERT INTO hydrophone_operators
						    (
						        hydrophone_operator_name,
						        contact_name,
						        contact_email,
						        website,
						        in_directory
						    )
						VALUES 
						    (
						        ${body.hydrophone_operator_name},
						        ${body.contact_name},
						        ${body.contact_email},
						        ${body.website},
						        ${body.in_directory}
						    )
						RETURNING hydrophone_operator_id;
						`;

			        // The result will be an array, get the first element as the UUID
			        const hydrophone_operator_id = data[0].hydrophone_operator_id;
			        
		            // Define an object 
					const params = {
					  Bucket: BUCKET_NAME,
					  Key: `${hydrophone_operator_id}/`,
					};
					
					// Upload the object
					await s3.putObject(params).promise();
					
					// Fetch Cognito credentials
    				const credentials = await retrieveCognitoSecrets();
					
					// Create Cognito user and send invitation
    				await createCognitoUser(body.contact_email, credentials.REACT_APP_USERPOOL_ID);
    				
    				// Add Cognito user to group
    				await addCognitoUserToGroup(body.contact_email, credentials.REACT_APP_USERPOOL_ID, "OPERATOR_USER");
            	}
				
            	break;
            	
            case "PUT /admin/operators":
            	if (event.body != null){
            		const body = JSON.parse(event.body);
            		
            		data = await dbConnection`
		            	UPDATE hydrophone_operators
						SET 
						    hydrophone_operator_name = ${body.hydrophone_operator_name},
						    contact_name = ${body.contact_name},
						    contact_email = ${body.contact_email},
						    website = ${body.website},
						    in_directory = ${body.in_directory}
						WHERE 
						    hydrophone_operator_id = ${body.hydrophone_operator_id};
						`;
            	}
				
            	break;
            	
            case "DELETE /admin/operators":
            	if (event.queryStringParameters['operator_id'] != null){
            		const operator_id = event.queryStringParameters['operator_id'];

            		// Delete the hydrophone operator from the database and return the hydrophone_operator_id and contact_email
			        data = await dbConnection`
			            DELETE FROM hydrophone_operators
			            WHERE hydrophone_operator_id = ${operator_id}
			            RETURNING hydrophone_operator_id, contact_email;`;
			
			        if (data.length > 0) {
			            const hydrophone_operator_id = data[0].hydrophone_operator_id;
			            const username = data[0].contact_email;
			            
			            // Fetch Cognito credentials
    					const credentials = await retrieveCognitoSecrets();
			            
			            // Delete the Cognito user
		                const deleteUserParams = {
		                    UserPoolId: credentials.REACT_APP_USERPOOL_ID, 
		                    Username: username,
		                };
		
		                try {
		                    await CognitoIdentityServiceProvider.adminDeleteUser(deleteUserParams).promise();
		                } catch (error) {
		                    console.error('Error deleting Cognito user:', error);
		                }
			
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
