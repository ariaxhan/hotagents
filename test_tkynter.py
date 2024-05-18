import tkinter as tk
from tkinter import messagebox

def show_message():
    root = tk.Tk()
    root.withdraw()
    messagebox.showinfo("Test", "Tkinter is working!")
    root.destroy()

if __name__ == "__main__":
    show_message()
