using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;

namespace WardrobeMaker
{
    public class WardrobeManager
    {
        public List<ClothingItem> Inventory { get; set; }
        public Dictionary<DateTime, List<Outfit>> ScheduledOutfits { get; set; }

        //File names for save data
        private const string InventoryFile = "inventory.json";
        private const string CalendarFile = "calendar.json";

        public WardrobeManager()
        {
            Inventory = new List<ClothingItem>();
            ScheduledOutfits = new Dictionary<DateTime, List<Outfit>>();

            LoadData();//Automatically tries to load save files first
        }
        
        public void SaveData()
        {
            var options = new JsonSerializerOptions { WriteIndented = true };
            
            //Save Inventory
            string inventoryJson = JsonSerializer.Serialize(Inventory, options);
            File.WriteAllText(InventoryFile, inventoryJson);

            //Save Calendar
            string calendarJson = JsonSerializer.Serialize(ScheduledOutfits, options);
            File.WriteAllText(CalendarFile, calendarJson);
            
            Console.WriteLine("[System] Data successfully saved to JSON files.");
        }

        private void LoadData()
        {
            if (File.Exists(InventoryFile) && File.Exists(CalendarFile))
            {
                string inventoryJson = File.ReadAllText(InventoryFile);
                Inventory = JsonSerializer.Deserialize<List<ClothingItem>>(inventoryJson);

                string calendarJson = File.ReadAllText(CalendarFile);
                ScheduledOutfits = JsonSerializer.Deserialize<Dictionary<DateTime, List<Outfit>>>(calendarJson);
                
                Console.WriteLine("[System] Loaded existing save data from hard drive.");
            }
            else
            {
                Console.WriteLine("[System] No save files found. Loading dummy data...");
                LoadDummyData();
            }
        }

        private void LoadDummyData()
        {
            Inventory.Add(new Top("TOP-001", "Vintage Denim Jacket", "Blue", new List<string> { "casual" }, "Long"));
            Inventory.Add(new Top("TOP-002", "Graphic Band Tee", "Black", new List<string> { "casual", "edgy" }, "Short"));
            
            Inventory.Add(new Bottom("BOT-001", "Black Denim", "Black", new List<string> { "casual", "versatile" }, "Slim"));
            Inventory.Add(new Bottom("BOT-002", "Khaki Chinos", "Tan", new List<string> { "smart-casual" }, "Straight"));
            
            Inventory.Add(new Footwear("FW-001", "Leather Chelsea Boots", "Brown", new List<string> { "smart-casual" }, "Boots"));
            Inventory.Add(new Footwear("FW-002", "White Canvas Sneakers", "White", new List<string> { "casual" }, "Sneakers"));
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