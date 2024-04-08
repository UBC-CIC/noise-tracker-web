import os
import boto3
import zipfile
import io
import tempfile
import json
import jwt
import psycopg2
from datetime import datetime
import string
import random

def getDbSecret():
    DB_SECRET_NAME = os.environ["SM_DB_CREDENTIALS"]
    # secretsmanager client to get db credentials
    sm_client = boto3.client("secretsmanager")
    response = sm_client.get_secret_value(SecretId=DB_SECRET_NAME)["SecretString"]
    secret = json.loads(response)
    return secret


def filter_s3_objects(hydrophones, start_date, end_date, jwt_token):
    s3 = boto3.client('s3')
    BUCKET_NAME = os.environ["BUCKET_NAME"]
    
    decoded_data = jwt.decode(jwt=jwt_token, options={"verify_signature": False})

    username = decoded_data['username']
    
    dbSecret = getDbSecret()
    
    # Connect to the PostgreSQL database
    connection = psycopg2.connect(
        user=dbSecret["username"],
        password=dbSecret["password"],
        host=dbSecret["host"],
        dbname=dbSecret["dbname"],
    )
    
    cursor = connection.cursor()
    
    get_hydrophone_ids = """
        SELECT h.hydrophone_operator_id, h.hydrophone_id
        FROM hydrophones h
        JOIN hydrophone_operators ho ON h.hydrophone_operator_id = ho.hydrophone_operator_id
        WHERE ho.contact_email = %s
        AND h.site = ANY(%s);
    """
    
    cursor.execute(get_hydrophone_ids, (username, hydrophones))
    
    hydrophone_ids = cursor.fetchall()

    start_datetime = datetime.strptime(start_date[0], '%Y-%m-%dT%H:%M:%S.%fZ')
    end_datetime = datetime.strptime(end_date[0], '%Y-%m-%dT%H:%M:%S.%fZ')

    filtered_objects = []

    for hydrophone_id in hydrophone_ids:
        prefix = hydrophone_id[0] + "/" + hydrophone_id[1] + "/"

        # Initialize continuation token for pagination
        continuation_token = None

        while True:
            # List objects with pagination
            if continuation_token:
                response = s3.list_objects_v2(Bucket=BUCKET_NAME, Prefix=prefix, ContinuationToken=continuation_token)
            else:
                response = s3.list_objects_v2(Bucket=BUCKET_NAME, Prefix=prefix)

            # Process objects
            if 'Contents' in response:
                for obj in response['Contents']:
                    key_parts = obj['Key'].split('/')
                    if key_parts[-1].endswith('.json'):  
                        datetime_string = key_parts[-1]  # Extract datetime string from key
                        try:
                            object_datetime = datetime.strptime(datetime_string[:-5], '%Y-%m-%d-%H-%M-%S')
                            if start_datetime <= object_datetime <= end_datetime:
                                filtered_objects.append(obj['Key'])
                        except ValueError:
                            pass 

            # Check if there are more objects to retrieve
            if 'NextContinuationToken' in response:
                continuation_token = response['NextContinuationToken']
            else:
                break

    return filtered_objects

# Function to generate a random string of fixed length
def generate_random_string(length):
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(length))
    
def handler(event, context):
    # Bucket name where the files are stored
    BUCKET_NAME = os.environ["BUCKET_NAME"]
    
    # Initialize the S3 client
    s3 = boto3.client('s3')
    
    hydrophones = event['multiValueQueryStringParameters']['hydrophones']
    start_date = event['multiValueQueryStringParameters']['startTime']
    end_date = event['multiValueQueryStringParameters']['endTime']
    jwt_token = event['headers']['Authorization']

    # List of files you want to include in the ZIP archive
    filtered_objects = filter_s3_objects(hydrophones, start_date, end_date, jwt_token)
    
    # Expiry time for the pre-signed URL (in seconds)
    expiry = 43200  # URL expires in 12 hours
    
    # Create a temporary file to store the ZIP archive
    with tempfile.NamedTemporaryFile() as temp_zip_file:
        with zipfile.ZipFile(temp_zip_file.name, 'a', zipfile.ZIP_DEFLATED, False) as zip_file:
            for file_key in filtered_objects:
                obj = s3.get_object(Bucket=BUCKET_NAME, Key=file_key)
                zip_file.writestr(file_key, obj['Body'].read())
    
        # Upload the ZIP archive to S3
        with open(temp_zip_file.name, 'rb') as f:
            random_key = 'download/' + 'NoiseTrackerDownload_' + generate_random_string(10) + '.zip'
            s3.put_object(Bucket=BUCKET_NAME, Key=random_key, Body=f)
        
        # Generate pre-signed URL for the ZIP archive
        url = s3.generate_presigned_url(
            ClientMethod='get_object',
            Params={'Bucket': BUCKET_NAME, 'Key': random_key},
            ExpiresIn=expiry
        )
    
    return {
        'statusCode': 200,
        'headers': {
            "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*"
        },
        'body': url
    }
