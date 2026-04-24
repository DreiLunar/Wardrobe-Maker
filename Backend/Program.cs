using System;

namespace WardrobeMaker
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("=== Wardrobe Maker ===\n");

            WardrobeManager manager = new WardrobeManager();
            Console.WriteLine($"[System] Closet loaded with {manager.Inventory.Count} items.\n");

            Console.WriteLine("--- Available 'casual' Items ---");
            foreach (var item in manager.GetAvailableItems("casual"))
            {
                Console.WriteLine(item.GetDetails());
            }

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

                manager.Lookbook.Add(generated);
                Console.WriteLine($"\n[Lookbook] {manager.Lookbook.Count} outfit(s) saved.");
            }

            Console.WriteLine("\n--- Laundry Status Test ---");
            manager.Inventory[0].ToggleLaundryStatus();
            Console.WriteLine(manager.Inventory[0].GetDetails());

            manager.SaveData();
        }
    }
}