"""
Quick test to verify Firebase connection
"""
from firebase_client import FirebaseClient

try:
    print("🔥 Testing Firebase connection...")
    client = FirebaseClient()
    print("✅ SUCCESS! Firebase is properly configured!")
    print("\nYou can now use Firebase real-time mode.")
    print("Restart your API server to enable it.")
except Exception as e:
    print(f"❌ Error: {e}")
    print("\nPlease check:")
    print("1. serviceAccountKey.json exists in credentials/")
    print("2. .env file has correct FIREBASE_DATABASE_URL")
