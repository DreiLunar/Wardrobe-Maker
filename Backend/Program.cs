using System;

namespace WardrobeMaker
{
    public abstract class ClothingItem
    {
        public string Name { get; set;}
        public bool IsClean {get; private set;}

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
        public string SleeveLength {get; set;}

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

	class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("=== Wardrobe Maker Test: Assembling an Outfit ===\n");

            // 1. Create individual clothing items
            Top myShirt = new Top("Vintage Denim Jacket", "Long");
            Bottom myJeans = new Bottom("Black Denim", "Slim");
            Footwear myBoots = new Footwear("Leather Chelsea Boots", "Boots");

            // 2. Combine them into an Outfit
            Outfit fridayNightLook = new Outfit("Friday Night Casual", myShirt, myJeans, myBoots);

            // 3. Display the Outfit
            Console.WriteLine($"[Outfit Loaded: {fridayNightLook.OutfitName}]");
            Console.WriteLine($"- {fridayNightLook.SelectedTop.GetDetails()}");
            Console.WriteLine($"- {fridayNightLook.SelectedBottom.GetDetails()}");
            Console.WriteLine($"- {fridayNightLook.SelectedShoes.GetDetails()}");

            // 4. Test the Verification Logic
            Console.WriteLine($"\nIs this outfit ready to wear? {fridayNightLook.VerifyAvailability()}");

            // 5. Throw the shirt in the laundry and check again!
            Console.WriteLine("\n--> Action: Sending the jacket to the laundry...");
            myShirt.ToggleLaundryStatus();

            Console.WriteLine($"\nIs this outfit ready to wear now? {fridayNightLook.VerifyAvailability()}");
        }
    }
}