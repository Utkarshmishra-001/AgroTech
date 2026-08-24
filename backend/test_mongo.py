import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import certifi

async def test_mongo():
    ca = certifi.where()
    uri = "mongodb+srv://utkarsh10042001_db_user:XapMigz1EDgwxYwU@cluster0.owksceq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    client = AsyncIOMotorClient(uri, tlsAllowInvalidCertificates=True)
    try:
        # The ismaster command is cheap and does not require auth.
        await client.admin.command('ismaster')
        print("✅ MongoDB Connection Successful!")
        
        db = client.agrotech
        count = await db.users.count_documents({})
        print(f"📊 Current User Count: {count}")
    except Exception as e:
        print(f"❌ MongoDB Connection Failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_mongo())
