using System;
using System.Collections.Generic;

namespace WardrobeMaker
{
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

    //This combines the clothes
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

        //Checks if the items are clean
        public bool VerifyAvailability()
        {
            return SelectedTop.IsClean && SelectedBottom.IsClean && SelectedShoes.IsClean;
        }
    }

    public class WardrobeManager
    {
        //This is the Storage Lists
        public List<ClothingItem> Inventory { get; set; }
        public Dictionary<DateTime, List<Outfit>> ScheduledOutfits { get; set; }

        public WardrobeManager()
        {
            Inventory = new List<ClothingItem>();
            ScheduledOutfits = new Dictionary<DateTime, List<Outfit>>();

            LoadDummyData(); //Automatically fills the closet when the program starts
        }

        //Pre-Uploaded Dummy Data
        private void LoadDummyData()
        {
            Inventory.Add(new Top("Vintage Denim Jacket", "Long"));
            Inventory.Add(new Top("Graphic Band Tee", "Short"));

            Inventory.Add(new Bottom("Black Denim", "Slim"));
            Inventory.Add(new Bottom("Khaki Chinos", "Straight"));

            Inventory.Add(new Footwear("Leather Chelsea Boots", "Boots"));
            Inventory.Add(new Footwear("White Canvas Sneakers", "Sneakers"));
        }

        //Calendar Stacking Logic
        public void ScheduleOutfit(DateTime date, Outfit newOutfit)
        {
            //If the date isn't in the calendar yet, it will create a blank stack for it
            if (!ScheduledOutfits.ContainsKey(date))
            {
                ScheduledOutfits[date] = new List<Outfit>();
            }

            //Add the outfit to that day's stack
            ScheduledOutfits[date].Add(newOutfit);
        }
    

    public Outfit GenerateRandomOutfit(string newOutfitName)
    {
        //Create temporary lists to hold only CLEAN clothes
        List<Top> cleanTops = new List<Top>();
        List<Bottom> cleanBottoms = new List<Bottom>();
        List<Footwear> cleanShoes = new List<Footwear>();

        //Sort the inventory
        foreach (var item in Inventory)
        {
            if (item.IsClean)
            {
                //The 'is' keyword safely checks what type of child class the item is
                if (item is Top t) cleanTops.Add(t);
                else if (item is Bottom b) cleanBottoms.Add(b);
                else if (item is Footwear f) cleanShoes.Add(f);
            }
        }

        //Safety Check: Do we have enough clean clothes to make a full outfit?
        if (cleanTops.Count == 0 || cleanBottoms.Count == 0 || cleanShoes.Count == 0)
        {
            Console.WriteLine("[Error] Not enough clean clothes to generate a complete outfit!");
            return null;
        }

        //Roll the dice to pick a random index from each list
        Random rand = new Random();
        Top randomTop = cleanTops[rand.Next(cleanTops.Count)];
        Bottom randomBottom = cleanBottoms[rand.Next(cleanBottoms.Count)];
        Footwear randomShoes = cleanShoes[rand.Next(cleanShoes.Count)];

        //Assemble and return the final randomized outfit
        return new Outfit(newOutfitName, randomTop, randomBottom, randomShoes);
    }
}

    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("=== Wardrobe Maker Test: The Randomizer ===\n");

            WardrobeManager appManager = new WardrobeManager();
            Console.WriteLine($"[System] Closet loaded with {appManager.Inventory.Count} items.\n");

            // 1. Generate two random outfits using our new method!
            Outfit randomLook1 = appManager.GenerateRandomOutfit("Mystery Outfit A");
            Outfit randomLook2 = appManager.GenerateRandomOutfit("Mystery Outfit B");

            // 2. Schedule them on the calendar
            DateTime today = DateTime.Today;
            appManager.ScheduleOutfit(today, randomLook1);
            appManager.ScheduleOutfit(today, randomLook2);

            // 3. Print the results
            Console.WriteLine($"--- Calendar for {today.ToShortDateString()} ---");

            foreach (var outfit in appManager.ScheduledOutfits[today])
            {
                Console.WriteLine($"-> {outfit.OutfitName}");
                Console.WriteLine($"   Top: {outfit.SelectedTop.Name}");
                Console.WriteLine($"   Bottom: {outfit.SelectedBottom.Name}");
                Console.WriteLine($"   Shoes: {outfit.SelectedShoes.Name}\n");
            }
        }
    }
}
