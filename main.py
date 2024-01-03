import sys
import os
import boto3
from PySide6.QtWidgets import (
    QApplication,
    QWidget,
    QVBoxLayout,
    QPushButton,
    QLabel,
    QFileDialog,
)
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from analyzer.analyzer import Analyzer

boto3.setup_default_session(profile_name="video-test")


class S3Uploader(FileSystemEventHandler):
    def __init__(self, bucket_name, folder_path):
        super().__init__()
        self.bucket_name = bucket_name
        self.folder_path = folder_path
        self.s3_client = boto3.client("s3", region_name="us-west-2")

    def on_created(self, event):
        if event.is_directory:
            return

        file_path = event.src_path
        key = os.path.relpath(file_path, self.folder_path)
        print(f"Detected new file: {file_path}")
        Analyzer.analyze(file_path)
        # self.upload_to_s3(file_path, key)

    def upload_to_s3(self, file_path, key):
        try:
            self.s3_client.upload_file(file_path, self.bucket_name, key)
            print(f"Uploaded {file_path} to S3 bucket")
        except Exception as e:
            print(f"Error uploading {file_path} to S3: {str(e)}")


class S3UploaderApp(QWidget):
    def __init__(self):
        super().__init__()
        self.init_ui()
        self.folder_path = ""
        self.bucket_name = "noise-tracker-test"
        self.s3_uploader = None

    def init_ui(self):
        self.setWindowTitle("S3 Uploader")
        self.setGeometry(300, 300, 400, 200)

        self.label = QLabel("Select a folder to monitor:")
        self.folder_path_label = QLabel("Folder Path: ")

        self.select_folder_button = QPushButton("Select Folder", self)
        self.select_folder_button.clicked.connect(self.select_folder)

        layout = QVBoxLayout()
        layout.addWidget(self.label)
        layout.addWidget(self.select_folder_button)
        layout.addWidget(self.folder_path_label)

        self.setLayout(layout)

    def select_folder(self):
        folder_path = QFileDialog.getExistingDirectory(self, "Select Folder")
        if folder_path:
            self.folder_path = folder_path
            self.folder_path_label.setText(f"Folder Path: {self.folder_path}")

            if not self.s3_uploader:
                self.s3_uploader = S3Uploader(self.bucket_name, self.folder_path)
                observer = Observer()
                observer.schedule(self.s3_uploader, self.folder_path, recursive=True)
                observer.start()

                print(f"Monitoring folder: {self.folder_path}")


def main():
    app = QApplication(sys.argv)
    s3_uploader_app = S3UploaderApp()
    s3_uploader_app.show()
    sys.exit(app.exec())


if __name__ == "__main__":
    main()
