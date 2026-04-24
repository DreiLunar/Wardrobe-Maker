# Wardrobe Maker 👗
*A C# system for managing clothing inventory and outfits*

<img width="2000" height="561" alt="banner" src="https://github.com/user-attachments/assets/eba08217-8bde-4f02-afd5-bd8e20e58182" />


## Group Information
**Course:** AOOP  
**Group Members:**

| Name | Role | GitHub |
|------|------|--------|
| Von Andrei Lunar | Project Lead | [DreiLunar](https://github.com/DreiLunar) |
| Christine Nicole Miranda | Frontend Developer | [tinintinti](https://github.com/tinintinti) |
| R Jay Arazula | Backend Developer | [Rjay29](https://github.com/Rjay29) |

## 🎯 About the Project
Wardrobe Maker is a full system with a **frontend UI and a C# backend**. Users can add clothing items, build outfits from their inventory, track laundry status, and save outfit combinations to a lookbook — all through an interactive graphical interface powered by object-oriented principles.

## ✨ Key Features
- **6 Core Classes** built with inheritance and abstraction
- **Graphical User Interface** for an intuitive user experience
- **Laundry Tracker** to toggle clean/dirty status per item
- **Outfit Builder** combining tops, bottoms, and footwear
- **Lookbook System** to save and schedule outfits
- **Tag Filtering** to search items by color and style

## 🗂️ Project Structure

```
WardrobeMaker/
├── Frontend/          # UI layer (forms, views, controls)
├── Backend/           # Core logic and class definitions
│   ├── ClothingItem.cs
│   ├── Top.cs
│   ├── Bottom.cs
│   ├── Footwear.cs
│   ├── Outfit.cs
│   └── WardrobeManager.cs
└── README.md
```

## 👔 Clothing Types
1. **Top** - Clothing worn on the upper body (e.g., shirts, jackets); has `SleeveLength`
2. **Bottom** - Clothing worn on the lower body (e.g., pants, skirts); has `FitType`
3. **Footwear** - Shoes and other footwear items; has `StyleCategory`

## 🚀 How to Run
1. Clone/download the repository
2. Open the solution file in **Visual Studio**
3. Build and run the project:
   ```bash
   dotnet run
   ```
4. The application window will launch — use the interface to:
   - Add clothing items to your inventory
   - Build and save outfits to your lookbook
   - Toggle laundry status on any item

## 📊 Class Diagram

![UML Class Diagram](https://github.com/user-attachments/assets/d9bf4423-e3e0-45d5-bb76-6c941e61e1fc)

## 🔀 Flowchart

![Flowchart](<img width="753" height="1037" alt="flowchart" src="https://github.com/user-attachments/assets/2216168a-70a5-41c6-8e5c-4fe67f238174" />
)

## 📋 Sample Code Structure

```csharp
using System;
namespace WardrobeMaker
{
    // Abstract base class — defines shared properties and enforces GetDetails()
    public abstract class ClothingItem
    {
        public string Name { get; set; }
        public bool IsClean { get; private set; }

        public ClothingItem(string name)
        {
            Name = name;
            IsClean = true;
        }

        public void ToggleLaundryStatus()
        {
            IsClean = !IsClean;
        }

        public abstract string GetDetails();
    }

    // Top inherits ClothingItem and adds SleeveLength
    public class Top : ClothingItem
    {
        public string SleeveLength { get; set; }

        public Top(string name, string sleeveLength) : base(name)
        {
            SleeveLength = sleeveLength;
        }

        public override string GetDetails()
        {
            string status = IsClean ? "Clean" : "In the Laundry Basket";
            return $"Top: {Name} ({SleeveLength} sleeves) | Status: {status}";
        }
    }

    // Bottom inherits ClothingItem and adds FitType
    public class Bottom : ClothingItem
    {
        public string FitType { get; set; }

        public Bottom(string name, string fitType) : base(name)
        {
            FitType = fitType;
        }

        public override string GetDetails()
        {
            string status = IsClean ? "Clean" : "In the Laundry Basket";
            return $"Bottom: {Name} ({FitType} fit) | Status: {status}";
        }
    }

    // Footwear inherits ClothingItem and adds StyleCategory
    public class Footwear : ClothingItem
    {
        public string StyleCategory { get; set; }

        public Footwear(string name, string styleCategory) : base(name)
        {
            StyleCategory = styleCategory;
        }

        public override string GetDetails()
        {
            string status = IsClean ? "Clean" : "In the Laundry Basket";
            return $"Footwear: {Name} ({StyleCategory}) | Status: {status}";
        }
    }

    // Outfit composes one Top, one Bottom, and one Footwear
    public class Outfit
    {
        public string OutfitName { get; set; }
        public Top SelectedTop { get; set; }
        public Bottom SelectedBottom { get; set; }
        public Footwear SelectedShoes { get; set; }

        public Outfit(string outfitName, Top top, Bottom bottom, Footwear shoes)
        {
            OutfitName = outfitName;
            SelectedTop = top;
            SelectedBottom = bottom;
            SelectedShoes = shoes;
        }

        // Returns true only if all items are clean
        public bool VerifyAvailability()
        {
            return SelectedTop.IsClean && SelectedBottom.IsClean && SelectedShoes.IsClean;
        }
    }
}
```

## 🧩 OOP Principles Applied

| Principle | Implementation |
|-----------|----------------|
| **Abstraction** | `ClothingItem` is abstract; enforces `GetDetails()` on all subclasses |
| **Inheritance** | `Top`, `Bottom`, and `Footwear` extend `ClothingItem` and inherit `Name`, `IsClean`, and `ToggleLaundryStatus()` |
| **Polymorphism** | Each subclass overrides `GetDetails()` to return type-specific output |
| **Encapsulation** | `IsClean` is `private set` — state can only change through `ToggleLaundryStatus()` |

## 🙏 Acknowledgements
- Inspired by real-world wardrobe organization apps
- Built as part of the Advanced Object-Oriented Programming course
- Thanks to our AOOP instructor for guidance and support
