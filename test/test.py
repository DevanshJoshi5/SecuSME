import tkinter as tk
from tkinter import messagebox

def calculate():
    try:
        x = float(entry1.get())
        y = float(entry2.get())
        op = operation.get()

        if op == "+":
            result = x + y
        elif op == "-":
            result = x - y
        elif op == "*":
            result = x * y
        elif op == "/":
            if y == 0:
                raise ZeroDivisionError
            result = x / y
        else:
            messagebox.showerror("Error", "Invalid operation")
            return

        result_label.config(text=f"Result: {result}")
    except ValueError:
        messagebox.showerror("Input Error", "Please enter valid numbers.")
    except ZeroDivisionError:
        messagebox.showerror("Math Error", "Cannot divide by zero.")

# Create window
root = tk.Tk()
root.title("Simple Calculator")

# Inputs
tk.Label(root, text="Enter first number:").grid(row=0, column=0, pady=5)
entry1 = tk.Entry(root)
entry1.grid(row=0, column=1)

tk.Label(root, text="Enter second number:").grid(row=1, column=0, pady=5)
entry2 = tk.Entry(root)
entry2.grid(row=1, column=1)

tk.Label(root, text="Operation (+, -, *, /):").grid(row=2, column=0, pady=5)
operation = tk.Entry(root)
operation.grid(row=2, column=1)

# Button
tk.Button(root, text="Calculate", command=calculate).grid(row=3, column=0, columnspan=2, pady=10)

# Result label
result_label = tk.Label(root, text="Result: ")
result_label.grid(row=4, column=0, columnspan=2)

# Start GUI
root.mainloop()
