"""
Quick script to manually clear Firebase data
"""
from firebase_client import FirebaseClient

print("🔥 Clearing Firebase data...")
client = FirebaseClient()

# Delete all data
client.delete_data('/detections')
client.delete_data('/frames')
client.delete_data('/sessions')

print("✅ Firebase data cleared successfully!")
print("   - /detections deleted")
print("   - /frames deleted")
print("   - /sessions deleted")
