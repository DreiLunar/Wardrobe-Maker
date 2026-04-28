using System;
using System.Collections.Generic;

namespace WardrobeMaker
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("=== Wardrobe Maker Test: Assembling an Outfit ===\n");

            // 1. Create individual clothing items
            Top myShirt = new Top("TOP-001", "Vintage Denim Jacket", "Blue",
                new List<string> { "casual", "layering" }, "Long");
            Bottom myJeans = new Bottom("BOT-001", "Black Denim", "Black",
                new List<string> { "casual", "versatile" }, "Slim");
            Footwear myBoots = new Footwear("FW-001", "Leather Chelsea Boots", "Brown",
                new List<string> { "smart-casual", "boots" }, "Boots");

            // 2. Combine them into an Outfit
            Outfit fridayNightLook = new Outfit("OFT-001", "Friday Night Casual", myShirt, myJeans, myBoots);

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