from PIL import Image, ImageDraw

def draw_dot_on_image(image_path, x, y, output_path, dot_radius=20, dot_color=(255, 0, 0)):
    """
    Draws a dot on the given PNG image at the specified coordinates.

    Args:
        image_path (str): Path to the input PNG image.
        x (float): X-coordinate for the dot.
        y (float): Y-coordinate for the dot.
        output_path (str): Path to save the output image.
        dot_radius (int): Radius of the dot (default is 20).
        dot_color (tuple): Color of the dot in RGB format (default is red).
    """
    try:
        # Open the image
        image = Image.open(image_path).convert("RGBA")
        draw = ImageDraw.Draw(image)

        # Draw the dot
        left_up_point = (x - dot_radius, y - dot_radius)
        right_down_point = (x + dot_radius, y + dot_radius)
        draw.ellipse([left_up_point, right_down_point], fill=dot_color, outline=dot_color)

        # Save the result
        image.save(output_path)
        print(f"Dot drawn successfully! Saved to: {output_path}")
    except Exception as e:
        print(f"An error occurred: {e}")

# Path to your input and output images
image_path = "screenshots/screenshot_20241123-211529.png"
output_path = "screenshots/screenshot_20241123-211529_with_dotr.png"

# Coordinates for the dot
x = 325
y = 58

# Draw the dot
draw_dot_on_image(image_path, x, y, output_path, dot_radius=20, dot_color=(255, 0, 0))
