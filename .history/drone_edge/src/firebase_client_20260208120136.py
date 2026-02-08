"""
firebase_client.py
==================
Firebase Realtime Database connection manager
"""

import os
import json
from pathlib import Path
from typing import Optional, Dict, Any
import firebase_admin
from firebase_admin import credentials, db
from dotenv import load_dotenv


class FirebaseClient:
    """
    Manages connection to Firebase Realtime Database.
    
    Singleton pattern ensures only one Firebase app instance exists.
    """
    
    _instance = None
    _initialized = False
    
    def __new__(cls):
        """Singleton pattern implementation."""
        if cls._instance is None:
            cls._instance = super(FirebaseClient, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        """Initialize Firebase connection (only once)."""
        if not FirebaseClient._initialized:
            self._initialize_firebase()
            FirebaseClient._initialized = True
    
    def _initialize_firebase(self) -> None:
        """
        Initialize Firebase Admin SDK.
        
        Raises:
            FileNotFoundError: If credentials file not found
            ValueError: If environment variables not set
        """
        print("\n🔧 Initializing Firebase Connection")
        print("=" * 60)
        
        # Load environment variables
        env_path = Path(__file__).parent.parent / '.env'
        load_dotenv(env_path)
        
        # Get configuration from environment
        credentials_path = os.getenv('FIREBASE_CREDENTIALS_PATH')
        database_url = os.getenv('FIREBASE_DATABASE_URL')
        
        if not credentials_path or not database_url:
            raise ValueError(
                "Missing Firebase configuration!\n"
                "Required in .env file:\n"
                "  - FIREBASE_CREDENTIALS_PATH\n"
                "  - FIREBASE_DATABASE_URL"
            )
        
        # Resolve credentials path (relative to project root)
        cred_file = Path(__file__).parent.parent / credentials_path
        
        if not cred_file.exists():
            raise FileNotFoundError(
                f"Firebase credentials not found!\n"
                f"Expected: {cred_file.absolute()}\n"
                f"Download from Firebase Console → Project Settings → Service Accounts"
            )
        
        print(f"📁 Credentials: {cred_file.name}")
        print(f"🌐 Database URL: {database_url}")
        
        try:
            # Check if Firebase app already exists
            try:
                # Try to get existing app
                firebase_admin.get_app()
                print("🔄 Using existing Firebase connection")
            except ValueError:
                # App doesn't exist, initialize it
                cred = credentials.Certificate(str(cred_file))
                firebase_admin.initialize_app(cred, {
                    'databaseURL': database_url
                })
                print("🆕 Firebase app initialized")
            
            # Test connection
            test_ref = db.reference('/')
            test_ref.get()  # Will raise error if connection fails
            
            print("✅ Firebase connected successfully")
            print("=" * 60)
            
        except Exception as e:
            print(f"❌ Firebase initialization failed: {e}")
            raise
    
    def get_reference(self, path: str = '/'):
        """
        Get a database reference at the specified path.
        
        Args:
            path: Database path (e.g., '/detections', '/sessions')
        
        Returns:
            Firebase database reference
        """
        return db.reference(path)
    
    def push_data(self, path: str, data: Dict[str, Any]) -> str:
        """
        Push data to Firebase with auto-generated key.
        
        Args:
            path: Database path (e.g., '/detections')
            data: Dictionary to push
        
        Returns:
            Generated key string
        """
        ref = db.reference(path)
        result = ref.push(data)
        return result.key
    
    def set_data(self, path: str, data: Dict[str, Any]) -> None:
        """
        Set data at a specific path (overwrites existing data).
        
        Args:
            path: Full database path (e.g., '/sessions/session_001')
            data: Dictionary to set
        """
        ref = db.reference(path)
        ref.set(data)
    
    def update_data(self, path: str, updates: Dict[str, Any]) -> None:
        """
        Update specific fields at a path (merges with existing data).
        
        Args:
            path: Database path
            updates: Dictionary of fields to update
        """
        ref = db.reference(path)
        ref.update(updates)
    
    def get_data(self, path: str) -> Optional[Dict]:
        """
        Retrieve data from a path.
        
        Args:
            path: Database path
        
        Returns:
            Data dictionary or None if path doesn't exist
        """
        ref = db.reference(path)
        return ref.get()
    
    def delete_data(self, path: str) -> None:
        """
        Delete data at a path.
        
        Args:
            path: Database path to delete
        """
        ref = db.reference(path)
        ref.delete()


# Example usage
if __name__ == "__main__":
    try:
        # Initialize client
        client = FirebaseClient()
        
        # Test write
        test_data = {
            "test": True,
            "message": "Firebase connection test",
            "timestamp": "2026-01-14T18:41:00Z"
        }
        
        key = client.push_data('/test', test_data)
        print(f"\n✅ Test write successful!")
        print(f"   Generated key: {key}")
        
        # Test read
        read_data = client.get_data(f'/test/{key}')
        print(f"\n✅ Test read successful!")
        print(f"   Data: {json.dumps(read_data, indent=2)}")
        
        # Cleanup
        client.delete_data(f'/test/{key}')
        print(f"\n✅ Test cleanup successful!")
        
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
