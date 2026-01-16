import cv2
import os

image_folder = 'video/frames'
output_video = 'video/test.mp4'

images = sorted(os.listdir(image_folder))
frame = cv2.imread(os.path.join(image_folder, images[0]))
height, width, _ = frame.shape

out = cv2.VideoWriter(
    output_video,
    cv2.VideoWriter_fourcc(*'mp4v'),
    5,
    (width, height)
)

for image in images:
    img_path = os.path.join(image_folder, image)
    img = cv2.imread(img_path)
    out.write(img)

out.release()
print("Video created successfully")
