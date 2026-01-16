import cv2
import os

image_folder = "video/frames"
output_video = "video/test.mp4"

# ✅ Only allow image files
valid_ext = (".jpg", ".jpeg", ".png")
images = sorted(
    [img for img in os.listdir(image_folder) if img.lower().endswith(valid_ext)]
)

if len(images) < 2:
    raise RuntimeError("Need at least 2 images to create a video")

# Read first image
first_frame = cv2.imread(os.path.join(image_folder, images[0]))
height, width, _ = first_frame.shape

out = cv2.VideoWriter(
    output_video,
    cv2.VideoWriter_fourcc(*"mp4v"),
    5,  # FPS
    (width, height)
)

written_frames = 0

for image in images:
    img_path = os.path.join(image_folder, image)
    frame = cv2.imread(img_path)

    # Skip invalid or mismatched frames
    if frame is None or frame.shape[:2] != (height, width):
        continue

    out.write(frame)
    written_frames += 1

out.release()
print(f"✅ Video created successfully with {written_frames} frames")
