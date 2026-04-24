using System;

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
    }

    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("=== Wardrobe Maker Test: The Manager & Calendar ===\n");

            // 1. Boot up the system (This automatically loads the dummy data!)
            WardrobeManager appManager = new WardrobeManager();
            Console.WriteLine($"[System] Successfully loaded {appManager.Inventory.Count} items into the closet.\n");

            // 2. Grab some clothes from the inventory to make two different outfits
            Top jacket = (Top)appManager.Inventory[0];
            Bottom jeans = (Bottom)appManager.Inventory[2];
            Footwear boots = (Footwear)appManager.Inventory[4];

            Top tee = (Top)appManager.Inventory[1];
            Bottom chinos = (Bottom)appManager.Inventory[3];
            Footwear sneakers = (Footwear)appManager.Inventory[5];

            Outfit formalLook = new Outfit("Friday Night Casual", jacket, jeans, boots);
            Outfit lazyLook = new Outfit("Sunday Errands", tee, chinos, sneakers);

            // 3. Test the Calendar Stacking! Let's schedule BOTH for today.
            DateTime today = DateTime.Today;
            appManager.ScheduleOutfit(today, formalLook);
            appManager.ScheduleOutfit(today, lazyLook);

            // 4. Print the Calendar to prove they both stacked successfully
            Console.WriteLine($"--- Calendar for {today.ToShortDateString()} ---");
            Console.WriteLine($"Total Outfits Stacked: {appManager.ScheduledOutfits[today].Count}\n");

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