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

        public Top(string name, string SleeveLength) : base(name)
        {
            SleeveLength = SleeveLength;
        }

        public override string GetDetails()
        {
            string status = IsClean ? "Clean" : "In the Laundry Basket";
            return $"Top: {name} ({SleeveLength} sleeves) | Status: {status}";
        }
    }
    
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("--Wardrobe Maker Test--");

            Top myShirt = new Top("Vintage Denim Jacket", "Long");

            Console.WriteLine("\n[Initial State]");
            Console.WriteLine(myShirt.GetDetails());

            Console.WriteLine("\n--> Action : Sent to laundry...");
            myShirt.ToggleLaundryStatus();

            Console.WriteLine("\n[Updated State]");
            Console.WriteLine(myShirt.GetDetails());
        }
    }
}