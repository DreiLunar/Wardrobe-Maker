using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;
using System.Linq;

namespace WardrobeMaker
{
    public class WardrobeManager
    {
        public List<ClothingItem> Inventory { get; set; }
        
        // This is your "Lookbook" - where outfits go when you hit Save in create.html
        public List<Outfit> SavedOutfits { get; set; } 
        
        // This is for the Calendar page specifically
        public Dictionary<DateTime, List<Outfit>> ScheduledOutfits { get; set; }

        private const string InventoryFile = "inventory.json";
        private const string OutfitsFile = "outfits.json"; // New file for your lookbook
        private const string CalendarFile = "calendar.json";

        public WardrobeManager()
        {
            Inventory = new List<ClothingItem>();
            SavedOutfits = new List<Outfit>();
            ScheduledOutfits = new Dictionary<DateTime, List<Outfit>>();

            LoadData();
        }
        
        // This is the method Program.cs is looking for!
        public void AddOutfit(Outfit outfit)
        {
            SavedOutfits.Add(outfit);
            SaveData();
        }
        
        public void SaveData()
        {
            var options = new JsonSerializerOptions { WriteIndented = true };
            
            File.WriteAllText(InventoryFile, JsonSerializer.Serialize(Inventory, options));
            File.WriteAllText(OutfitsFile, JsonSerializer.Serialize(SavedOutfits, options));
            File.WriteAllText(CalendarFile, JsonSerializer.Serialize(ScheduledOutfits, options));
            
            Console.WriteLine("[System] Data successfully saved to JSON files.");
        }

        private void LoadData()
        {
            try 
            {
                if (File.Exists(InventoryFile))
                    Inventory = JsonSerializer.Deserialize<List<ClothingItem>>(File.ReadAllText(InventoryFile)) ?? new List<ClothingItem>();

                if (File.Exists(OutfitsFile))
                    SavedOutfits = JsonSerializer.Deserialize<List<Outfit>>(File.ReadAllText(OutfitsFile)) ?? new List<Outfit>();

                if (File.Exists(CalendarFile))
                    ScheduledOutfits = JsonSerializer.Deserialize<Dictionary<DateTime, List<Outfit>>>(File.ReadAllText(CalendarFile)) ?? new Dictionary<DateTime, List<Outfit>>();

                if (Inventory.Count == 0) LoadDummyData();
                
                Console.WriteLine("[System] Loaded existing save data.");
            }
            catch 
            {
                Console.WriteLine("[System] Error loading files. Loading defaults...");
                LoadDummyData();
            }
        }

        private void LoadDummyData()
        {
            Inventory.Add(new Top("TOP-001", "Vintage Denim Jacket", "Blue", new List<string> { "casual" }, "Long"));
            Inventory.Add(new Top("TOP-002", "Graphic Band Tee", "Black", new List<string> { "casual" }, "Short"));
            Inventory.Add(new Bottom("BOT-001", "Black Denim", "Black", new List<string> { "casual" }, "Slim"));
            Inventory.Add(new Footwear("FW-001", "White Sneakers", "White", new List<string> { "casual" }, "Sneakers"));
        }
        
        public void ScheduleOutfit(DateTime date, Outfit newOutfit)
        {
            if (!ScheduledOutfits.ContainsKey(date))
            {
                ScheduledOutfits[date] = new List<Outfit>();
            }
            
            ScheduledOutfits[date].Add(newOutfit);
        }

        public Outfit? GenerateRandomOutfit(string newOutfitName)
        {
            List<Top> cleanTops = new List<Top>();
            List<Bottom> cleanBottoms = new List<Bottom>();
            List<Footwear> cleanShoes = new List<Footwear>();

            foreach (var item in Inventory)
            {
                if (item.IsClean)
                {
                    if (item is Top t) cleanTops.Add(t);
                    else if (item is Bottom b) cleanBottoms.Add(b);
                    else if (item is Footwear f) cleanShoes.Add(f);
                }
            }

            if (cleanTops.Count == 0 || cleanBottoms.Count == 0 || cleanShoes.Count == 0)
            {
                Console.WriteLine("[Error] Not enough clean clothes to generate a complete outfit!");
                return null;
            }

            Random rand = new Random();
            Top randomTop = cleanTops[rand.Next(cleanTops.Count)];
            Bottom randomBottom = cleanBottoms[rand.Next(cleanBottoms.Count)];
            Footwear randomShoes = cleanShoes[rand.Next(cleanShoes.Count)];

            //Generate a random ID for the new outfit
            string randomOutfitID = "OFT-" + rand.Next(1000, 9999).ToString();

            return new Outfit(randomOutfitID, newOutfitName, randomTop, randomBottom, randomShoes);
        }
    }
}