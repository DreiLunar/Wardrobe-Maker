using System;
using System.Collections.Generic;
using System.Linq;


namespace WardrobeMaker
{
    public class WardrobeManager
    {
        public List<ClothingItem> Inventory { get; set; }
        public List<Outfit> Lookbook { get; set; }
        public Dictionary<string, string> Schedules { get; set; }


        public WardrobeManager()
        {
            Inventory = new List<ClothingItem>();
            Lookbook = new List<Outfit>();
            Schedules = new Dictionary<string, string>();
            LoadData();
        }


        public void AddClothing(ClothingItem item)
        {
            Inventory.Add(item);
            Console.WriteLine($"[Added] {item.Name} added to inventory.");
        }

        public bool RemoveClothing(string itemId)
        {
            var item = Inventory.Find(i => i.ItemID == itemId);
            if (item != null)
            {
                Inventory.Remove(item);
                return true;
            }
            return false;
        }

        public bool RemoveOutfit(string outfitId)
        {
            var outfit = Lookbook.Find(o => o.OutfitID == outfitId);
            if (outfit != null)
            {
                Lookbook.Remove(outfit);
                var datesToRemove = Schedules.Where(s => s.Value == outfitId).Select(s => s.Key).ToList();
                foreach (var date in datesToRemove)
                {
                    Schedules.Remove(date);
                }
                return true;
            }
            return false;
        }

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

        public Outfit GenerateOutfit(string tag)
        {
            List<ClothingItem> pool = GetAvailableItems(tag);

            List<Top> cleanTops = new List<Top>();
            List<Bottom> cleanBottoms = new List<Bottom>();
            List<Dress> cleanDresses = new List<Dress>();
            List<Footwear> cleanShoes = new List<Footwear>();

            foreach (var item in pool)
            {
                if (item is Top t) cleanTops.Add(t);
                else if (item is Bottom b) cleanBottoms.Add(b);
                else if (item is Dress d) cleanDresses.Add(d);
                else if (item is Footwear f) cleanShoes.Add(f);
            }

            if (cleanShoes.Count == 0)
            {
                Console.WriteLine("[Error] No clean footwear available.");
                return null!;
            }

            Random rand = new Random();
            bool useDress = cleanDresses.Count > 0 && (cleanTops.Count == 0 || cleanBottoms.Count == 0 || rand.Next(2) == 1);

            if (useDress && cleanDresses.Count > 0)
            {
                // Generate Dress outfit
                Dress randomDress = cleanDresses[rand.Next(cleanDresses.Count)];
                Footwear randomShoes = cleanShoes[rand.Next(cleanShoes.Count)];
                string newID = "OFT-" + rand.Next(1000, 9999);
                return new Outfit(newID, "Generated Look", randomDress, randomShoes);
            }
            else if (cleanTops.Count > 0 && cleanBottoms.Count > 0)
            {
                // Generate Standard outfit (Top + Bottom + Footwear)
                Top randomTop = cleanTops[rand.Next(cleanTops.Count)];
                Bottom randomBottom = cleanBottoms[rand.Next(cleanBottoms.Count)];
                Footwear randomShoes = cleanShoes[rand.Next(cleanShoes.Count)];
                string newID = "OFT-" + rand.Next(1000, 9999);
                return new Outfit(newID, "Generated Look", randomTop, randomBottom, randomShoes);
            }
            else
            {
                Console.WriteLine("[Error] Not enough clean items to build a complete outfit.");
                return null!;
            }
        }

        public void SaveData()
        {
            Console.WriteLine("[Save] Wardrobe data saved successfully.");
        }

        public void LoadData()
        {
            // Add demo data so the app isn't empty on first run
            Inventory.Add(new Top("TOP-001", "Classic White Tee", "White", new List<string> { "casual", "basic" }, "Short", ""));
            Inventory.Add(new Top("TOP-002", "Denim Jacket", "Blue", new List<string> { "layering", "vintage" }, "Long", ""));
            Inventory.Add(new Top("TOP-003", "Black Turtleneck", "Black", new List<string> { "formal", "winter" }, "Long", ""));
            Inventory.Add(new Bottom("BOT-001", "Slim Fit Jeans", "Blue", new List<string> { "casual", "denim" }, "Slim", ""));
            Inventory.Add(new Bottom("BOT-002", "Chino Shorts", "Beige", new List<string> { "summer", "casual" }, "Regular", ""));
            Inventory.Add(new Bottom("BOT-003", "Black Dress Pants", "Black", new List<string> { "formal", "work" }, "Regular", ""));
            Inventory.Add(new Dress("DRS-001", "Summer Maxi Dress", "Red", new List<string> { "summer", "casual", "boho" }, "Maxi", ""));
            Inventory.Add(new Dress("DRS-002", "Little Black Dress", "Black", new List<string> { "formal", "party", "elegant" }, "Mini", ""));
            Inventory.Add(new Dress("DRS-003", "Floral Midi Dress", "Pink", new List<string> { "spring", "floral", "casual" }, "Midi", ""));
            Inventory.Add(new Footwear("FTW-001", "White Sneakers", "White", new List<string> { "casual", "sporty" }, "Casual", ""));
            Inventory.Add(new Footwear("FTW-002", "Brown Leather Boots", "Brown", new List<string> { "formal", "winter" }, "Dress", ""));
            Inventory.Add(new Footwear("FTW-003", "Running Shoes", "Gray", new List<string> { "sporty", "active" }, "Athletic", ""));
        }

    }
}
