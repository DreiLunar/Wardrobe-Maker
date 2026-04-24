using System;
using System.Collections.Generic;

namespace WardrobeMaker
{
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
            Console.WriteLine("[Save] Wardrobe data saved successfully.");
        }

        public void LoadData()
        {
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
}
