import os
import boto3
import zipfile
import io
import tempfile

def handler(event, context):
    # Bucket name where the files are stored
    BUCKET_NAME = os.environ["BUCKET_NAME"]
    
    # Initialize the S3 client
    s3 = boto3.client('s3')
    
    # List of files you want to include in the ZIP archive
    files = ['testDownload/2023-10-18-07-23-38.png', 'testDownload/2023-12-15-00-00-29.png', 'testDownload/2023-12-15-00-01-30.png']
    
    # Expiry time for the pre-signed URL (in seconds)
    expiry = 43200  # URL expires in 12 hours
    
    # Create a temporary file to store the ZIP archive
    with tempfile.NamedTemporaryFile() as temp_zip_file:
        with zipfile.ZipFile(temp_zip_file.name, 'a', zipfile.ZIP_DEFLATED, False) as zip_file:
            for file_key in files:
                obj = s3.get_object(Bucket=BUCKET_NAME, Key=file_key)
                zip_file.writestr(file_key, obj['Body'].read())
    
        # Upload the ZIP archive to S3
        with open(temp_zip_file.name, 'rb') as f:
            s3.put_object(Bucket=BUCKET_NAME, Key='files.zip', Body=f)
        
        # Generate pre-signed URL for the ZIP archive
        url = s3.generate_presigned_url(
            ClientMethod='get_object',
            Params={'Bucket': BUCKET_NAME, 'Key': 'files.zip'},
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
