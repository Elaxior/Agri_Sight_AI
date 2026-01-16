import cv2
import os

image_folder = "video/frames"
output_video = "video/test.mp4"

valid_ext = (".jpg", ".jpeg", ".png")
images = sorted(
    [img for img in os.listdir(image_folder) if img.lower().endswith(valid_ext)]
)

if len(images) < 2:
    raise RuntimeError("Need at least 2 images to create a video")

# Read first image to get target size
first_path = os.path.join(image_folder, images[0])
first_frame = cv2.imread(first_path)

if first_frame is None:
    raise RuntimeError(f"Failed to read first image: {images[0]}")

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

    if frame is None:
        continue

    # ✅ RESIZE frame to match video size
    frame = cv2.resize(frame, (width, height))

    out.write(frame)
    written_frames += 1

out.release()
print(f"✅ Video created successfully with {written_frames} frames")
