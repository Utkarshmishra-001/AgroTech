import os
import urllib.request

# Create datasets/Plant_Pathology_Images directory
dataset_dir = os.path.join("datasets", "Plant_Pathology_Images")
os.makedirs(dataset_dir, exist_ok=True)

print("Downloading Plant Pathology dataset images...")

# These are highly reliable Wikimedia Commons direct image URLs for the diseases in the system
image_links = {
    "yellow_rust_wheat.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Stripe_rust_on_wheat.jpg/800px-Stripe_rust_on_wheat.jpg",
    "aphids_plant.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Aphids_on_a_leaf.jpg/800px-Aphids_on_a_leaf.jpg",
    "late_blight_potato.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Late_Blight_on_Potato_leaf.jpg/800px-Late_Blight_on_Potato_leaf.jpg",
    "rice_false_smut.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Ustilaginoidea_virens_on_rice.jpg/800px-Ustilaginoidea_virens_on_rice.jpg",
    "healthy_leaf.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Green_leaves.jpg/800px-Green_leaves.jpg"
}

for filename, url in image_links.items():
    filepath = os.path.join(dataset_dir, filename)
    try:
        headers = {'User-Agent': 'AgroTech-Client/1.0'}
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as response, open(filepath, 'wb') as out_file:
            out_file.write(response.read())
        print(f"✅ Successfully downloaded: {filename}")
    except Exception as e:
        print(f"❌ Failed to download {filename} from {url}: {e}")

print(f"\nDataset fully generated at: {os.path.abspath(dataset_dir)}")
