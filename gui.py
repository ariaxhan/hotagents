
from customtkinter import *
import customtkinter
from PIL import Image
import os

## Initializations
app = CTk()
app.geometry("800x400")
set_appearance_mode("dark")


def click_handler():
    print("Explaining this...")
## Prompt Buttons
x_pos = 0.2

expln_btn = CTkButton(master=app, text="Explain this", command=click_handler)
expln_btn.place(relx=x_pos, rely=0.1, anchor="center")

file_btn = CTkButton(master=app, text="File this", command=click_handler)
file_btn.place(relx=x_pos+0.2, rely=0.1, anchor="center")

response_btn = CTkButton(master=app, text="respond to this", command=click_handler)
response_btn.place(relx=x_pos+0.40, rely=0.1, anchor="center")

generate_btn = CTkButton(master=app, text="generate code", command=click_handler)
generate_btn.place(relx=x_pos+0.60, rely=0.1, anchor="center")

# Laying down image with relative coordinates
""" image_path = os.path.join(os.path.dirname(__file__), 'docs.png')
pil_image = Image.open(image_path)
ctk_image = CTkImage(pil_image)
image_label = CTkLabel(app, image=ctk_image, text="")
image_label.place(relx=0.4, rely=0.5, anchor="center") """


# Modality Buttons
x_pos = 0.3
sc_btn = CTkButton(
                    master=app, 
                    width = 60,
                    height = 100,
                    text="Using Screenshot", 
                    command=click_handler,
                    fg_color = "#E6E6E6",
                    text_color = "#39393A"
                      )
sc_btn.place(
                relx=x_pos, 
                rely=0.75, 
                anchor="center"
                )




app.mainloop()


