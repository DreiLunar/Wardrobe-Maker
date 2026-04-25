using System;
using System.Collections.Generic;

namespace WardrobeMaker
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("=== Wardrobe Maker Test: Saving & Loading ===\n");

            // 1. Boot up the system (Loads dummies the first time, JSON the second time)
            WardrobeManager appManager = new WardrobeManager();

            // 2. Add a brand new item to the inventory so we can prove it saves
            appManager.Inventory.Add(new Top("TOP-999", "Brand New Red Hoodie", "Red", new List<string> { "cozy", "winter" }, "Long"));
            Console.WriteLine($"\n[Action] Added 'Brand New Red Hoodie' to the closet.");
            Console.WriteLine($"Total items in closet: {appManager.Inventory.Count}");

            // 3. Save everything to the hard drive
            Console.WriteLine("\n--> Action: Saving all data to JSON...");
            appManager.SaveData();
            
            Console.WriteLine("\nTest complete! Check the left panel in Rider for your new JSON files.");
        }
    }
}