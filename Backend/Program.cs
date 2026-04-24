using System;
using System.Collections.Generic;

namespace WardrobeMaker
{
    public abstract class ClothingItem
    {
        public string ItemID { get; set; }
        public string Name { get; set; }
        public string ImageFilePath { get; set; }
        public string PrimaryColor { get; set; }
        public List<string> Tags { get; set; }
        public bool IsClean { get; private set; }

        public ClothingItem(string itemID, string name, string primaryColor, List<string> tags)
        {
            ItemID = itemID;
            Name = name;
            PrimaryColor = primaryColor;
            Tags = tags;
            ImageFilePath = "";
            IsClean = true;
        }

        public void ToggleLaundryStatus()
        {
            IsClean = !IsClean;
        }

        public abstract string GetDetails();
    }

    public class Top : ClothingItem
    {
        public string SleeveType { get; set; }

        public Top(string itemID, string name, string primaryColor, List<string> tags, string sleeveType)
            : base(itemID, name, primaryColor, tags)
        {
            SleeveType = sleeveType;
        }

        public override string GetDetails()
        {
            string status = IsClean ? "Clean" : "In the Laundry Basket";
            return $"Top: {Name} | Sleeves: {SleeveType} | Color: {PrimaryColor} | Status: {status}";
        }
    }

    public class Bottom : ClothingItem
    {
        public string FitType { get; set; }

        public Bottom(string itemID, string name, string primaryColor, List<string> tags, string fitType)
            : base(itemID, name, primaryColor, tags)
        {
            FitType = fitType;
        }

        public override string GetDetails()
        {
            string status = IsClean ? "Clean" : "In the Laundry Basket";
            return $"Bottom: {Name} | Fit: {FitType} | Color: {PrimaryColor} | Status: {status}";
        }
    }

    public class Footwear : ClothingItem
    {
        public string StyleCategory { get; set; }

        public Footwear(string itemID, string name, string primaryColor, List<string> tags, string styleCategory)
            : base(itemID, name, primaryColor, tags)
        {
            StyleCategory = styleCategory;
        }

        public override string GetDetails()
        {
            string status = IsClean ? "Clean" : "In the Laundry Basket";
            return $"Footwear: {Name} | Style: {StyleCategory} | Color: {PrimaryColor} | Status: {status}";
        }
    }

    public class Outfit
    {
        public string OutfitID { get; set; }
        public string OutfitName { get; set; }
        public Top SelectedTop { get; set; }
        public Bottom SelectedBottom { get; set; }
        public Footwear SelectedShoes { get; set; }
        public DateTime? ScheduledDate { get; set; }

        public Outfit(string outfitID, string outfitName, Top top, Bottom bottom, Footwear shoes)
        {
            OutfitID = outfitID;
            OutfitName = outfitName;
            SelectedTop = top;
            SelectedBottom = bottom;
            SelectedShoes = shoes;
            ScheduledDate = null;
        }

        public bool VerifyAvailability()
        {
            return SelectedTop.IsClean && SelectedBottom.IsClean && SelectedShoes.IsClean;
        }
    }

    public class WardrobeManager
    {
        public List<ClothingItem> Inventory { get; set; }
        public List<Outfit> Lookbook { get; set; }

        public WardrobeManager()
        {
            Inventory = new List<ClothingItem>();
            Lookbook = new List<Outfit>();
            LoadData();
        }

        public void AddClothing(ClothingItem item)
        {
            Inventory.Add(item);
            Console.WriteLine($"[Added] {item.Name} added to inventory.");
        }

        // Returns all clean items, optionally filtered by a tag
        public List<ClothingItem> GetAvailableItems(string tag = "")
        {
            List<ClothingItem> available = new List<ClothingItem>();

            foreach (var item in Inventory)
            {
                if (!item.IsClean) continue;

                if (tag == "" || item.Tags.Contains(tag) || item.PrimaryColor.ToLower() == tag.ToLower())
                {
                    available.Add(item);
                }
            }

            return available;
        }

        // Picks a random clean outfit, filtered by tag if provided
        public Outfit GenerateOutfit(string tag)
        {
            List<ClothingItem> pool = GetAvailableItems(tag);

            List<Top> cleanTops = new List<Top>();
            List<Bottom> cleanBottoms = new List<Bottom>();
            List<Footwear> cleanShoes = new List<Footwear>();

            foreach (var item in pool)
            {
                if (item is Top t) cleanTops.Add(t);
                else if (item is Bottom b) cleanBottoms.Add(b);
                else if (item is Footwear f) cleanShoes.Add(f);
            }

            if (cleanTops.Count == 0 || cleanBottoms.Count == 0 || cleanShoes.Count == 0)
            {
                Console.WriteLine("[Error] Not enough clean items to build a complete outfit.");
                return null;
            }

            Random rand = new Random();
            Top randomTop = cleanTops[rand.Next(cleanTops.Count)];
            Bottom randomBottom = cleanBottoms[rand.Next(cleanBottoms.Count)];
            Footwear randomShoes = cleanShoes[rand.Next(cleanShoes.Count)];

            string newID = "OFT-" + rand.Next(1000, 9999);
            return new Outfit(newID, "Generated Look", randomTop, randomBottom, randomShoes);
        }

        public void SaveData()
        {
            // Placeholder: would write inventory and lookbook to a file
            Console.WriteLine("[Save] Wardrobe data saved successfully.");
        }

        public void LoadData()
        {
            // Loads default dummy data to pre-fill the closet on startup
            Inventory.Add(new Top("TOP-001", "Vintage Denim Jacket", "Blue",
                new List<string> { "casual", "layering" }, "Long"));

            Inventory.Add(new Top("TOP-002", "Graphic Band Tee", "Black",
                new List<string> { "casual", "graphic" }, "Short"));

            Inventory.Add(new Bottom("BOT-001", "Black Denim", "Black",
                new List<string> { "casual", "versatile" }, "Slim"));

            Inventory.Add(new Bottom("BOT-002", "Khaki Chinos", "Beige",
                new List<string> { "smart-casual", "versatile" }, "Straight"));

            Inventory.Add(new Footwear("FW-001", "Leather Chelsea Boots", "Brown",
                new List<string> { "smart-casual", "boots" }, "Boots"));

            Inventory.Add(new Footwear("FW-002", "White Canvas Sneakers", "White",
                new List<string> { "casual", "sneakers" }, "Sneakers"));

            Console.WriteLine("[Load] Wardrobe data loaded successfully.");
        }
    }

    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("=== Wardrobe Maker ===\n");

            WardrobeManager manager = new WardrobeManager();
            Console.WriteLine($"[System] Closet loaded with {manager.Inventory.Count} items.\n");

            // Test tag filtering
            Console.WriteLine("--- Available 'casual' Items ---");
            foreach (var item in manager.GetAvailableItems("casual"))
            {
                Console.WriteLine(item.GetDetails());
            }

            // Generate a random outfit with no tag filter
            Console.WriteLine("\n--- Generating Random Outfit ---");
            Outfit generated = manager.GenerateOutfit("");
            if (generated != null)
            {
                generated.OutfitName = "My First Look";
                generated.ScheduledDate = DateTime.Today;

                Console.WriteLine($"Outfit: {generated.OutfitName} (ID: {generated.OutfitID})");
                Console.WriteLine($"  {generated.SelectedTop.GetDetails()}");
                Console.WriteLine($"  {generated.SelectedBottom.GetDetails()}");
                Console.WriteLine($"  {generated.SelectedShoes.GetDetails()}");
                Console.WriteLine($"  Scheduled: {generated.ScheduledDate?.ToShortDateString()}");
                Console.WriteLine($"  Ready to wear: {generated.VerifyAvailability()}");

                // Save outfit to lookbook
                manager.Lookbook.Add(generated);
                Console.WriteLine($"\n[Lookbook] {manager.Lookbook.Count} outfit(s) saved.");
            }

            // Test laundry toggle
            Console.WriteLine("\n--- Laundry Status Test ---");
            manager.Inventory[0].ToggleLaundryStatus();
            Console.WriteLine(manager.Inventory[0].GetDetails());

            manager.SaveData();
        }
    }
}
