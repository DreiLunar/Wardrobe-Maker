# Wardrobe Maker 👗

*A full-stack clothing inventory and outfit management system built with ASP.NET Core (C#) backend and a modern HTML/CSS/JavaScript frontend.*

---

## 📋 Table of Contents
- [Project Overview](#project-overview)
- [Group Information](#group-information)
- [Key Features](#key-features)
- [Project Structure](#project-structure)
- [System Requirements](#system-requirements)
- [Getting Started](#getting-started)
- [Running the Application](#running-the-application)
- [Architecture](#architecture)

---

## 🎯 Project Overview

Wardrobe Maker is a comprehensive wardrobe management system designed to help users organize their clothing items, create outfits, track laundry status, and curate a personal lookbook. Built on object-oriented principles with an intuitive user interface, it streamlines the process of outfit planning and clothing inventory management.

---

## 👥 Group Information

**Course:** AOOP (Advanced Object-Oriented Programming)

**Team Members:**

| Name | Role | GitHub |
|------|------|--------|
| Von Andrei Lunar | Project Lead | [DreiLunar](https://github.com/DreiLunar) |
| Christine Nicole Miranda | Frontend Developer | [tinintinti](https://github.com/tinintinti) |
| R Jay Arazula | Backend Developer | [Rjay29](https://github.com/Rjay29) |

---

## ✨ Key Features

- 🏗️ **OOP Architecture** - 6 core classes leveraging inheritance and abstraction
- 🎨 **Interactive UI** - HTML5 and CSS3 with vanilla JavaScript
- 👕 **Smart Categorization** - Tops, Bottoms, and Footwear with specific attributes
- 🧺 **Laundry Tracking** - Toggle clean/dirty status for each item
- 🎭 **Outfit Builder** - Combine items to create complete outfits
- 📖 **Lookbook System** - Save and schedule favorite outfit combinations
- 🔍 **Tag Filtering** - Search and filter items by color, style, and attributes
- 📱 **Responsive Design** - Works seamlessly across different screen sizes

---

## 🗂️ Project Structure

```
Wardrobe Maker/
├── Backend/                          # ASP.NET Core API
│   ├── Properties/
│   │   ├── launchSettings.json      # Development settings
│   │   ├── appsettings.json         # Configuration
│   │   └── appsettings.Development.json
│   ├── ClothingItem.cs              # Base class for clothing
│   ├── Top.cs                       # Top garment (inherits ClothingItem)
│   ├── Bottom.cs                    # Bottom garment (inherits ClothingItem)
│   ├── Footwear.cs                  # Footwear items (inherits ClothingItem)
│   ├── Outfit.cs                    # Outfit composition model
│   ├── Program.cs                   # ASP.NET Core setup & DI configuration
│   ├── WardrobeController.cs        # REST API endpoints
│   ├── WardrobeManager.cs           # Core business logic
│   ├── WardrobeMaker.csproj         # Project file (.NET 10)
│   └── WardrobeMaker.http           # HTTP request examples
├── Frontend/                         # HTML5 UI
│   ├── html/
│   │   ├── index.html               # Home/Dashboard
│   │   ├── wardrobe.html            # Clothing inventory view
│   │   ├── create.html              # Add new clothing item
│   │   ├── lookbook.html            # Save & view outfits
│   │   └── calendar.html            # Calendar scheduling view
│   ├── css/
│   │   ├── main.css                 # Global styles
│   │   ├── index.css                # Home page styles
│   │   ├── wardrobe.css             # Inventory view styles
│   │   ├── create.css               # Form styles
│   │   ├── lookbook.css             # Lookbook styles
│   │   └── calendar.css             # Calendar styles
│   ├── js/
│   │   ├── main.js                  # Common utilities & API calls
│   │   ├── index.js                 # Home page logic
│   │   ├── wardrobe.js              # Inventory management
│   │   ├── create.js                # Form handling
│   │   ├── lookbook.js              # Lookbook operations
│   │   └── calendar.js              # Calendar interactions
│   └── uploads/                     # Clothing item images (user uploads)
├── Wardrobe Maker.sln               # Visual Studio solution
├── .gitignore                       # Git ignore rules
└── README.md                        # This file
```

---

## 👔 Clothing Item Classes

The system uses an inheritance hierarchy for clothing items:

1. **ClothingItem** (Base Class)
   - `Id`: Unique identifier
   - `Name`: Item name
   - `Color`: Color of the item
   - `Size`: Size information
   - `IsClean`: Laundry status

2. **Top** (inherits ClothingItem)
   - `SleeveLength`: Short, Long, Sleeveless, etc.

3. **Bottom** (inherits ClothingItem)
   - `FitType`: Slim, Regular, Relaxed, etc.

4. **Footwear** (inherits ClothingItem)
   - `StyleCategory`: Casual, Formal, Athletic, etc.

5. **Outfit** (Composition Model)
   - Combines one Top, Bottom, and Footwear
   - Stores outfit date/occasion
   - Can be saved to lookbook

6. **WardrobeManager** (Business Logic)
   - Manages all clothing items and outfits
   - Handles CRUD operations
   - Orchestrates outfit creation

---

## 🖥️ System Requirements

### Backend
- **.NET SDK 10** or higher ([Download](https://dotnet.microsoft.com/download))
- **Visual Studio 2022** or **Visual Studio Code** with C# extension

### Frontend
- **Modern Web Browser** (Chrome, Firefox, Safari, Edge)
- **Live Server extension** (VS Code) - optional, for development
- **Internet connection** - for API communication

### Development Tools
- **Git** - Version control
- **PowerShell** or **Command Prompt** - Terminal access

---

## 🚀 Getting Started

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd Wardrobe\ Maker
```

### Step 2: Switch to the Release Branch

```bash
git checkout wardrobe-maker-release
```

### Step 3: Install Dependencies

Navigate to the Backend directory and restore .NET dependencies:

```bash
cd WardrobeMaker/Backend
dotnet restore
```

---

## ▶️ Running the Application

### Start the Backend (ASP.NET Core API)

1. **Using Command Line:**
   ```bash
   cd WardrobeMaker/Backend
   dotnet run
   ```
   The API will start on `http://localhost:5000` or `http://localhost:5001`

2. **Using Visual Studio:**
   - Open `Wardrobe Maker.sln`
   - Right-click `WardrobeMaker` project → Set as Startup Project
   - Press `F5` or click "Start Debugging"

### Open the Frontend (UI)

1. **Using VS Code Live Server:**
   - Open VS Code in the project directory
   - Navigate to `WardrobeMaker/Frontend/html/index.html`
   - Right-click and select "Open with Live Server"
   - Your default browser opens at `http://127.0.0.1:5500/WardrobeMaker/Frontend/html/index.html`

2. **Using a Direct Browser:**
   - Open your browser and navigate to:
     ```
     file:///path/to/Wardrobe%20Maker/WardrobeMaker/Frontend/html/index.html
     ```

3. **Development Server Approach:**
   - Use any local HTTP server to serve the Frontend folder
   - Ensure the Backend API is running before making requests

### Typical Development Workflow

```
Terminal 1 (Backend):
$ cd WardrobeMaker/Backend
$ dotnet run
# API listening on http://localhost:5000

Terminal 2 (Frontend):
$ cd WardrobeMaker/Frontend/html
$ # Open index.html via Live Server or file:// protocol
```

---

## 🏗️ Architecture

### Backend Architecture

- **ASP.NET Core Web API** - RESTful API for CRUD operations
- **Dependency Injection** - WardrobeManager registered as singleton service
- **CORS Policy** - Configured to allow requests from frontend
- **Static File Serving** - Frontend folder configured as WebRoot

### API Endpoints

Core endpoints available via `/api/wardrobe`:
- `GET /api/wardrobe/items` - Retrieve all clothing items
- `POST /api/wardrobe/items` - Add new clothing item
- `GET /api/wardrobe/items/{id}` - Get specific item
- `PUT /api/wardrobe/items/{id}` - Update item
- `DELETE /api/wardrobe/items/{id}` - Delete item
- `POST /api/wardrobe/outfits` - Create outfit
- `GET /api/wardrobe/outfits` - List all outfits

### Frontend Architecture

- **HTML5 Semantic Markup** - Accessible and structured content
- **CSS3 Styling** - Modern responsive design with Flexbox/Grid
- **Vanilla JavaScript** - DOM manipulation and API integration
- **Modular JS Files** - Separate concerns for each page/feature

---

## 🔧 Troubleshooting

### Port Already in Use
If port 5000/5001 is already in use:
```bash
dotnet run --urls "http://localhost:5555"
```

### CORS Errors
Ensure the Backend is running before accessing the Frontend. Check that both are on compatible origins.

### Missing Dependencies
If you encounter missing package errors:
```bash
cd WardrobeMaker/Backend
dotnet clean
dotnet restore
dotnet build
```

### Backend Not Responding
- Verify Backend is running: `http://localhost:5000/api/wardrobe/items` should return JSON
- Check firewall settings
- Review `appsettings.Development.json` for configuration

---

## 📝 Additional Notes

- **Image Uploads**: Place clothing item images in `Frontend/uploads/`
- **Configuration**: Edit `Backend/appsettings.json` for API settings
- **HTTP Requests**: See `Backend/WardrobeMaker.http` for API request examples
- **Development**: Use `appsettings.Development.json` for local development settings

---

## 📞 Support

For questions or issues, please contact the development team:
- **Project Lead**: Von Andrei Lunar (@DreiLunar)
- **Frontend**: Christine Nicole Miranda (@tinintinti)
- **Backend**: R Jay Arazula (@Rjay29)

---

**Happy Organizing! 🎉**
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

![flowchart](https://github.com/user-attachments/assets/9a5ae6e5-4ab7-49b1-b2d4-a3e344f4221b" />)


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
